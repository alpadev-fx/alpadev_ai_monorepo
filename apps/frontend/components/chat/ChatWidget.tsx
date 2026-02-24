"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/trpc/react";
import { useWebSocket } from "@/hooks/useWebSocket";

const WHATSAPP_URL = "https://wa.link/n2uk0s";

interface ChatMessage {
  id: string;
  roomId: string;
  senderType: "visitor" | "bot" | "agent";
  senderName: string | null;
  content: string;
  createdAt: string | Date;
}

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("alpadev_visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("alpadev_visitor_id", id);
  }
  return id;
}

function saveRoomId(roomId: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("alpadev_chat_room_id", roomId);
  }
}

function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 20.97v-3.17a4.527 4.527 0 0 1-1.087-3.104V6.383c.114-1.865 1.483-3.476 3.405-3.725zM15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17z" clipRule="evenodd" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [roomStatus, setRoomStatus] = useState<string>("bot_active");
  const [orchestrationState, setOrchestrationState] = useState<string | null>(null);
  const [showFallbackButtons, setShowFallbackButtons] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const visitorId = useRef(getVisitorId());

  const createRoom = api.chat.createRoom.useMutation();
  const sendMessage = api.chat.sendMessage.useMutation();

  // WebSocket handler
  const handleWsMessage = useCallback(
    (msg: { type: string; roomId?: string; data?: Record<string, unknown> }) => {
      if (msg.type === "message.new" && msg.data?.message) {
        const newMsg = msg.data.message as ChatMessage;
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          if (newMsg.senderType === "visitor") return prev;
          return [...prev, newMsg];
        });
        if (newMsg.senderType === "bot" || newMsg.senderType === "agent") {
          setIsTyping(false);
        }
      }

      if (msg.type === "room.statusChange" && msg.data) {
        setRoomStatus(msg.data.status as string);
        if (msg.data.status === "agent_joined" && msg.data.agentName) {
          setAgentName(msg.data.agentName as string);
        }
      }

      if (msg.type === "room.typing" && msg.data) {
        if (msg.data.senderType !== "visitor") {
          setIsTyping(msg.data.isTyping as boolean);
        }
      }

      // Handoff timeout — show quick-action buttons
      if (msg.type === "handoff.timeout" && msg.data) {
        setShowFallbackButtons(true);
        setOrchestrationState(msg.data.orchestrationState as string || "FALLBACK_CHOICE");
      }

      // Handoff cancelled — agent joined during fallback
      if (msg.type === "handoff.cancelled") {
        setShowFallbackButtons(false);
        setOrchestrationState("HUMAN_CONNECTED");
      }

      // Booking created
      if (msg.type === "booking.created") {
        setShowFallbackButtons(false);
        setOrchestrationState("BOOKING_CREATED");
      }

      // WhatsApp link sent
      if (msg.type === "whatsapp.link_sent") {
        setShowFallbackButtons(false);
        setOrchestrationState("WHATSAPP_REDIRECTED");
      }
    },
    []
  );

  const { connect, send, status: wsStatus } = useWebSocket(handleWsMessage);

  useEffect(() => {
    if (isOpen && roomId) {
      connect();
    }
  }, [isOpen, roomId, connect]);

  useEffect(() => {
    if (wsStatus === "connected" && roomId) {
      send({ type: "subscribe", roomId, visitorId: visitorId.current });
    }
  }, [wsStatus, roomId, send]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleOpen = async () => {
    setIsOpen(true);
    try {
      const result = await createRoom.mutateAsync({
        visitorId: visitorId.current,
      });
      setRoomId(result.room.id);
      saveRoomId(result.room.id);
      setMessages(result.messages as ChatMessage[]);
      setRoomStatus(result.room.status);
    } catch (error) {
      console.error("[ChatWidget] Failed to create room:", error);
    }
  };

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || !roomId) return;

    setInputValue("");

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      roomId,
      senderType: "visitor",
      senderName: null,
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    if (roomStatus === "bot_active" || roomStatus === "waiting_for_agent") {
      setIsTyping(true);
    }

    try {
      const result = await sendMessage.mutateAsync({
        roomId,
        content,
        senderType: "visitor",
        visitorId: visitorId.current,
      });

      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? (result as ChatMessage) : m))
      );
    } catch (error) {
      console.error("[ChatWidget] Failed to send message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const statusText = roomStatus === "agent_joined"
    ? `Chatting with ${agentName || "Agent"}`
    : roomStatus === "waiting_for_agent"
      ? "Connecting to team..."
      : wsStatus === "connected"
        ? "Online"
        : wsStatus === "connecting"
          ? "Connecting..."
          : "Offline";

  const statusColor = roomStatus === "waiting_for_agent"
    ? "bg-amber-400"
    : wsStatus === "connected"
      ? "bg-green-400"
      : wsStatus === "connecting"
        ? "bg-yellow-400"
        : "bg-neutral-400";

  return (
    <>
      {/* ── Floating Chat Button ─────────────────────────────────── */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[10000] sm:right-6 right-4 sm:bottom-6 bottom-4">
          <button
            onClick={handleOpen}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-black text-white border border-white/20 shadow-lg shadow-black/25 transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
            aria-label="Open chat"
          >
            <MessageIcon className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-400" />
            </span>
          </button>
        </div>
      )}

      {/* ── Chat Window ───────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed z-[10000] flex flex-col overflow-hidden border border-white/[0.08] bg-neutral-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl sm:bottom-6 sm:right-6 sm:h-[520px] sm:w-[370px] sm:rounded-[20px] inset-0 sm:inset-auto h-full w-full rounded-none"
          style={{ animation: "chatSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="relative flex items-center justify-between px-4 py-3.5">
            {/* Subtle top border glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 ring-1 ring-white/10">
                  <img
                    src="https://assets.alpadev.xyz/assets/logo.jpg"
                    alt="Alpadev"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-neutral-950 ${statusColor}`} />
              </div>
              <div>
                <p className="text-[13px] font-semibold tracking-tight text-white">
                  {agentName || "Alpadev"}
                </p>
                <p className="text-[11px] text-neutral-500">
                  {statusText}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* WhatsApp shortcut in header */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-white/5 hover:text-[#25D366]"
                aria-label="Chat on WhatsApp"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Minimize chat"
              >
                <ChevronDownIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ── Separator ──────────────────────────────────────────── */}
          <div className="h-px bg-white/[0.06]" />

          {/* ── Messages ───────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-2.5">
            {messages.map((msg, i) => {
              const isVisitor = msg.senderType === "visitor";
              const isAgent = msg.senderType === "agent";
              const showAvatar = !isVisitor && (
                i === 0 || messages[i - 1].senderType === "visitor"
              );

              return (
                <div
                  key={msg.id}
                  className={`flex ${isVisitor ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex items-end gap-2 max-w-[80%] ${isVisitor ? "flex-row-reverse" : ""}`}>
                    {/* Avatar spacer / avatar */}
                    {!isVisitor && (
                      showAvatar ? (
                        <img
                          src="https://assets.alpadev.xyz/assets/logo.jpg"
                          alt=""
                          className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-white/5"
                        />
                      ) : (
                        <div className="w-6 shrink-0" />
                      )
                    )}

                    {/* Bubble */}
                    <div
                      className={`rounded-2xl px-3.5 py-2 text-[13.5px] leading-snug ${
                        isVisitor
                          ? "bg-blue-500 text-white rounded-br-md"
                          : isAgent
                            ? "bg-emerald-600/20 text-emerald-100 ring-1 ring-emerald-500/20 rounded-bl-md"
                            : "bg-white/[0.07] text-neutral-200 rounded-bl-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`mt-1 text-[10px] ${
                        isVisitor ? "text-blue-200/50 text-right" : isAgent ? "text-emerald-400/40" : "text-neutral-600"
                      }`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2">
                  <div className="w-6" />
                  <div className="rounded-2xl rounded-bl-md bg-white/[0.07] px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick-action fallback buttons */}
            {showFallbackButtons && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2 max-w-[85%]">
                  <div className="w-6 shrink-0" />
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => {
                        setShowFallbackButtons(false);
                        if (roomId) {
                          sendMessage.mutate({
                            roomId,
                            content: "call",
                            senderType: "visitor",
                            visitorId: visitorId.current,
                          });
                          setMessages((prev) => [
                            ...prev,
                            {
                              id: `temp-fb-${Date.now()}`,
                              roomId: roomId,
                              senderType: "visitor",
                              senderName: null,
                              content: "Schedule a call",
                              createdAt: new Date().toISOString(),
                            },
                          ]);
                        }
                      }}
                      className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3.5 py-2 text-left text-[12.5px] font-medium text-blue-300 transition-all hover:bg-blue-500/20 hover:border-blue-500/30 active:scale-[0.98]"
                    >
                      <span className="text-sm">📅</span>
                      <span>Schedule a call</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowFallbackButtons(false);
                        if (roomId) {
                          sendMessage.mutate({
                            roomId,
                            content: "whatsapp",
                            senderType: "visitor",
                            visitorId: visitorId.current,
                          });
                          setMessages((prev) => [
                            ...prev,
                            {
                              id: `temp-fb-${Date.now()}`,
                              roomId: roomId,
                              senderType: "visitor",
                              senderName: null,
                              content: "Continue on WhatsApp",
                              createdAt: new Date().toISOString(),
                            },
                          ]);
                        }
                      }}
                      className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-left text-[12.5px] font-medium text-emerald-300 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/30 active:scale-[0.98]"
                    >
                      <span className="text-sm">💬</span>
                      <span>Continue on WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Status banners ─────────────────────────────────────── */}
          {roomStatus === "waiting_for_agent" && !showFallbackButtons && (
            <div className="border-t border-amber-500/10 bg-amber-500/[0.06] px-4 py-2 text-center text-[11px] font-medium text-amber-400/80">
              A team member will be with you shortly
            </div>
          )}
          {roomStatus === "agent_joined" && agentName && (
            <div className="border-t border-emerald-500/10 bg-emerald-500/[0.06] px-4 py-2 text-center text-[11px] font-medium text-emerald-400/80">
              Connected with {agentName}
            </div>
          )}
          {orchestrationState === "BOOKING_CREATED" && (
            <div className="border-t border-blue-500/10 bg-blue-500/[0.06] px-4 py-2 text-center text-[11px] font-medium text-blue-400/80">
              Call scheduled — check your email for confirmation
            </div>
          )}

          {/* ── Input ──────────────────────────────────────────────── */}
          <div className="border-t border-white/[0.06] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={roomStatus === "closed" ? "Chat ended" : "Message..."}
                disabled={roomStatus === "closed"}
                className="flex-1 rounded-full border-0 bg-white/[0.06] px-4 py-2 text-[13px] text-white placeholder:text-neutral-600 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-white/10 disabled:opacity-40"
                maxLength={2000}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || roomStatus === "closed" || sendMessage.isPending}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white transition-all duration-200 hover:bg-blue-400 active:scale-90 disabled:bg-white/[0.06] disabled:text-neutral-600"
                aria-label="Send message"
              >
                <ArrowUpIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Powered by + WhatsApp fallback */}
            <div className="mt-1.5 flex items-center justify-between px-1">
              <span className="text-[10px] text-neutral-700">
                Powered by Alpadev AI
              </span>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-neutral-600 transition-colors hover:text-[#25D366]"
              >
                <WhatsAppIcon className="h-2.5 w-2.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Keyframes ─────────────────────────────────────────────── */}
      <style jsx global>{`
        @keyframes chatSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
