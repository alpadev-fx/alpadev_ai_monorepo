import { TRPCError } from "@trpc/server";
import { ChatRepository } from "./chat.repository";
import { ChatJobRepository } from "../../jobs/chat/chat-job.repository";
import { chatQueue, CHAT_EVENTS_CHANNEL } from "../../jobs/chat/chat.queue";
import { createSubscriberConnection, createPublisherConnection } from "../../jobs/connection";
import { getOrchestrationService } from "./orchestration.service";
import type { ChatRoomStatus } from "@package/validations";
import type Redis from "ioredis";

export type ChatEventType =
  | "message.new"
  | "room.created"
  | "room.statusChange"
  | "room.typing"
  | "handoff.reminder"
  | "handoff.timeout"
  | "handoff.cancelled"
  | "booking.created"
  | "whatsapp.link_sent"
  | "orchestration.stateChange";

export interface ChatEvent {
  type: ChatEventType;
  roomId: string;
  data: Record<string, unknown>;
}

type EventCallback = (event: ChatEvent) => void;

export class ChatService {
  private repository: ChatRepository;
  private chatJobRepo: ChatJobRepository;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private globalListeners: Set<EventCallback> = new Set();
  private publisher: Redis | null = null;

  constructor() {
    this.repository = new ChatRepository();
    this.chatJobRepo = new ChatJobRepository();
    this.initRedisPublisher();
    this.initRedisSubscriber();
  }

  /**
   * Create a Redis publisher so ALL events (not just worker events)
   * are broadcast through Redis pub/sub. This bridges the gap between
   * Next.js bundled code (tRPC) and the server.ts WebSocket process,
   * which run different module instances of ChatService.
   */
  private initRedisPublisher() {
    try {
      this.publisher = createPublisherConnection();
    } catch (err) {
      console.error("[ChatService] Redis publisher init failed:", err);
    }
  }

  /**
   * Subscribe to Redis pub/sub channel for ALL chat events.
   * Events published by any ChatService instance (tRPC, worker, etc.)
   * are received here and dispatched to in-memory listeners (e.g. server.ts WebSocket).
   */
  private initRedisSubscriber() {
    try {
      const subscriber = createSubscriberConnection();

      subscriber.subscribe(CHAT_EVENTS_CHANNEL, (err) => {
        if (err) {
          console.error("[ChatService] Failed to subscribe to Redis channel:", err.message);
          return;
        }
        console.log(`[ChatService] Subscribed to Redis channel: ${CHAT_EVENTS_CHANNEL}`);
      });

      subscriber.on("message", (_channel: string, message: string) => {
        try {
          const event = JSON.parse(message) as ChatEvent;
          // Dispatch to in-memory listeners only (no re-publish to avoid loops)
          this.localEmit(event);
        } catch (err) {
          console.error("[ChatService] Failed to parse Redis message:", err);
        }
      });
    } catch (err) {
      console.error("[ChatService] Redis subscriber init failed:", err);
    }
  }

  // ==========================================
  // Event System
  // ==========================================

  subscribeToRoom(roomId: string, callback: EventCallback): () => void {
    if (!this.listeners.has(roomId)) {
      this.listeners.set(roomId, new Set());
    }
    this.listeners.get(roomId)!.add(callback);
    return () => {
      this.listeners.get(roomId)?.delete(callback);
    };
  }

  subscribeGlobal(callback: EventCallback): () => void {
    this.globalListeners.add(callback);
    return () => {
      this.globalListeners.delete(callback);
    };
  }

  /**
   * Publish event through Redis so ALL ChatService instances receive it.
   * This is the primary emit method — use for all events from tRPC/service layer.
   */
  private emit(event: ChatEvent) {
    if (this.publisher) {
      this.publisher.publish(CHAT_EVENTS_CHANNEL, JSON.stringify(event)).catch((err) => {
        console.error("[ChatService] Failed to publish event to Redis:", err);
        // Fallback to local emit if Redis publish fails
        this.localEmit(event);
      });
    } else {
      // No Redis publisher — fallback to local only
      this.localEmit(event);
    }
  }

  /**
   * Dispatch event to in-memory listeners only.
   * Called by the Redis subscriber to avoid re-publishing loops.
   */
  private localEmit(event: ChatEvent) {
    // Notify room-specific listeners
    this.listeners.get(event.roomId)?.forEach((cb) => cb(event));
    // Notify global listeners (agent dashboard)
    this.globalListeners.forEach((cb) => cb(event));
  }

  // ==========================================
  // Room Management
  // ==========================================

  async createRoom(visitorId: string, visitorIp?: string) {
    // Check if visitor already has an open room
    const existingRoom = await this.repository.findRoomByVisitorId(visitorId);
    if (existingRoom) {
      const messages = await this.repository.getMessages(existingRoom.id);
      return { room: existingRoom, messages, isExisting: true };
    }

    const room = await this.repository.createRoom(visitorId, visitorIp);

    // Send bot greeting
    const greetingMessage = await this.repository.createMessage({
      roomId: room.id,
      senderType: "bot",
      senderName: "Alpadev AI",
      content:
        "Hey! Welcome to Alpadev. We build custom software solutions — web apps, mobile apps, SaaS platforms, and more. How can I help you today?",
    });

    this.emit({
      type: "room.created",
      roomId: room.id,
      data: { room, message: greetingMessage },
    });

    return { room, messages: [greetingMessage], isExisting: false };
  }

  async getRoom(roomId: string) {
    const room = await this.repository.findRoomById(roomId);
    if (!room) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Chat room not found" });
    }
    return room;
  }

  async joinRoom(roomId: string, agentName: string) {
    const room = await this.repository.findRoomById(roomId);
    if (!room) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Chat room not found" });
    }
    if (room.status === "closed") {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot join a closed room" });
    }

    await this.repository.updateRoomStatus(roomId, "agent_joined");

    // Cancel handoff timers and update orchestration state
    try {
      const orchestrationService = getOrchestrationService();
      await orchestrationService.onAgentJoined(roomId);
    } catch (err) {
      console.warn("[ChatService] Orchestration onAgentJoined failed (non-critical):", (err as Error).message);
    }

    // Send transition message
    const transitionMessage = await this.repository.createMessage({
      roomId,
      senderType: "bot",
      senderName: "Alpadev AI",
      content: `${agentName} has joined the conversation. You're now chatting with a team member!`,
    });

    this.emit({
      type: "room.statusChange",
      roomId,
      data: { status: "agent_joined" as ChatRoomStatus, agentName },
    });

    this.emit({
      type: "message.new",
      roomId,
      data: { message: transitionMessage },
    });

    return { room: { ...room, status: "agent_joined" as const }, transitionMessage };
  }

  async closeRoom(roomId: string) {
    const room = await this.repository.findRoomById(roomId);
    if (!room) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Chat room not found" });
    }

    await this.repository.updateRoomStatus(roomId, "closed");

    const closingMessage = await this.repository.createMessage({
      roomId,
      senderType: "bot",
      senderName: "Alpadev AI",
      content: "This conversation has been closed. Thank you for chatting with us!",
    });

    this.emit({
      type: "room.statusChange",
      roomId,
      data: { status: "closed" as ChatRoomStatus },
    });

    this.emit({
      type: "message.new",
      roomId,
      data: { message: closingMessage },
    });

    return { status: "closed" as const };
  }

  // ==========================================
  // Message Handling
  // ==========================================

  async sendMessage(data: {
    roomId: string;
    content: string;
    senderType: "visitor" | "bot" | "agent";
    senderName?: string;
    visitorId?: string;
  }) {
    const room = await this.repository.findRoomById(data.roomId);
    if (!room) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Chat room not found" });
    }
    if (room.status === "closed") {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot send messages to a closed room" });
    }

    // Verify visitor owns this room
    if (data.senderType === "visitor" && data.visitorId && room.visitorId !== data.visitorId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }

    // Save the message
    const message = await this.repository.createMessage({
      roomId: data.roomId,
      senderType: data.senderType,
      senderName: data.senderName,
      content: data.content,
    });

    this.emit({
      type: "message.new",
      roomId: data.roomId,
      data: { message },
    });

    // If sender is visitor, check orchestration state first.
    // If orchestration handles it (fallback flow, contact collection, booking), skip AI.
    if (data.senderType === "visitor") {
      try {
        const orchestrationService = getOrchestrationService();
        const handled = await orchestrationService.handleVisitorMessage(data.roomId, data.content);
        if (handled) {
          return message;
        }
      } catch (err) {
        console.warn("[ChatService] Orchestration handleVisitorMessage failed:", (err as Error).message);
      }

      // If room is bot_active, enqueue AI response job.
      // The bot always responds first; escalation happens in the worker after the bot replies.
      if (room.status === "bot_active") {
        await this.enqueueBotResponse(data.roomId, data.content);
      }
    }

    return message;
  }

  /**
   * Escalate the conversation to a human agent.
   * Updates room status to waiting_for_agent, sends a transition message,
   * and emits events for real-time UI updates.
   */
  async escalateToHuman(roomId: string, reason: string) {
    await this.repository.updateRoomStatus(roomId, "waiting_for_agent");

    const transitionMessage = await this.repository.createMessage({
      roomId,
      senderType: "bot",
      senderName: "Alpadev AI",
      content:
        "I'm connecting you with a team member who can help you further. They'll be with you shortly — feel free to add any details in the meantime!",
    });

    this.emit({
      type: "room.statusChange",
      roomId,
      data: { status: "waiting_for_agent" as ChatRoomStatus, reason },
    });

    this.emit({
      type: "message.new",
      roomId,
      data: { message: transitionMessage },
    });

    // Start handoff timers (30s reminder, 90s timeout)
    try {
      const orchestrationService = getOrchestrationService();
      await orchestrationService.startHandoffTimers(roomId);
    } catch (err) {
      console.warn("[ChatService] Failed to start handoff timers (non-critical):", (err as Error).message);
    }

    console.log(`[ChatService] Room ${roomId} escalated to human (reason: ${reason})`);
  }

  /**
   * Check if the visitor's message contains explicit escalation keywords.
   * Returns true for phrases like "talk to a real person", "human agent", etc.
   */
  private shouldEscalateImmediately(message: string): boolean {
    const normalized = message.toLowerCase().trim();

    const escalationPatterns = [
      // English
      /\btalk to a (real|human|actual)\b/,
      /\bhuman agent\b/,
      /\breal person\b/,
      /\bspeak (to|with) (a |an )?(human|person|agent|someone real)\b/,
      /\bconnect me (to|with) (a |an )?(human|person|agent)\b/,
      /\bi (want|need) (a |an )?(human|person|agent)\b/,
      /\btransfer (me )?(to )?(a |an )?(human|person|agent)\b/,
      /\bno(t)? a bot\b/,
      /\bstop being a bot\b/,
      // Spanish
      /\bhablar con (una? )?(persona|humano|agente)\b/,
      /\bquiero (una? )?(persona|humano|agente)\b/,
      /\bnecesito (una? )?(persona|humano|agente)\b/,
      /\bconectame con (una? )?(persona|humano|agente)\b/,
      /\bpasame con (una? )?(persona|humano|agente)\b/,
      /\bagente real\b/,
      /\bpersona real\b/,
    ];

    return escalationPatterns.some((pattern) => pattern.test(normalized));
  }

  /**
   * Enqueue a bot response job to be processed by the worker.
   * This is non-blocking — the visitor gets their message saved immediately,
   * and the bot response arrives asynchronously via Redis pub/sub -> WebSocket.
   */
  private async enqueueBotResponse(roomId: string, visitorMessage: string) {
    try {
      // 1. Create ChatJob in DB
      const chatJob = await this.chatJobRepo.create(roomId, {
        roomId,
        visitorMessage,
      });

      // 2. Add job to BullMQ queue
      await chatQueue.add("bot-response", {
        jobId: chatJob.id,
        roomId,
        visitorMessage,
      });

      console.log(`[ChatService] Enqueued bot response job ${chatJob.id} for room ${roomId}`);
    } catch (error) {
      console.error("[ChatService] Failed to enqueue bot response:", error);

      // Fallback: send error message directly if queue is unavailable
      const errorMessage = await this.repository.createMessage({
        roomId,
        senderType: "bot",
        senderName: "Alpadev AI",
        content:
          "I'm having a moment! Could you rephrase that? Or I can connect you with our team directly.",
      });

      this.emit({
        type: "message.new",
        roomId,
        data: { message: errorMessage },
      });
    }
  }

  // ==========================================
  // Typing Indicators
  // ==========================================

  emitTyping(roomId: string, senderType: string, isTyping: boolean) {
    this.emit({
      type: "room.typing",
      roomId,
      data: { senderType, isTyping },
    });
  }

  // ==========================================
  // Queries
  // ==========================================

  async getMessages(roomId: string, limit?: number, cursor?: string) {
    return this.repository.getMessages(roomId, limit, cursor);
  }

  async getActiveRooms(status?: ChatRoomStatus) {
    return this.repository.getActiveRooms(status);
  }
}

// Singleton instance for shared state (WebSocket event bus)
let chatServiceInstance: ChatService | null = null;

export function getChatService(): ChatService {
  if (!chatServiceInstance) {
    chatServiceInstance = new ChatService();
  }
  return chatServiceInstance;
}
