/**
 * OrchestrationService
 *
 * Manages the conversation state machine for the AI customer-support agent:
 *   - Human handoff with timed fallback (30s reminder, 90s timeout)
 *   - Fallback choice: booking or WhatsApp
 *   - Contact detail collection
 *   - Booking creation via BookingService
 *   - WhatsApp redirect link generation
 *
 * Stored in ChatRoom.metadata.orchestration (JSON field — no schema migration).
 */
import { ChatRepository } from "./chat.repository";
import { handoffQueue, HANDOFF_REMINDER_DELAY_MS, HANDOFF_TIMEOUT_DELAY_MS } from "../../jobs/chat/handoff.queue";
import { CHAT_EVENTS_CHANNEL } from "../../jobs/chat/chat.queue";
import { createPublisherConnection } from "../../jobs/connection";
import { BookingService } from "../booking/service/booking.service";
import { db } from "@package/db";
import type Redis from "ioredis";
import type {
  OrchestrationMetadata,
  OrchestrationStateName,
  FallbackMode,
  CollectedFields,
} from "@package/validations";

const WHATSAPP_NUMBER = "573205890433";
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "contact@alpadev.xyz";

// Fields required for each fallback mode
const BOOKING_REQUIRED_FIELDS: Array<keyof CollectedFields> = ["name", "email", "phone"];
const WHATSAPP_REQUIRED_FIELDS: Array<keyof CollectedFields> = ["name", "phone"];

// ─── Field extraction patterns ───────────────────────────────────────────────

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
const PHONE_REGEX = /\+?[1-9]\d{6,14}/;

function extractEmail(text: string): string | null {
  const match = text.match(EMAIL_REGEX);
  return match ? match[0].toLowerCase() : null;
}

function extractPhone(text: string): string | null {
  const cleaned = text.replace(/[\s\-().]/g, "");
  const match = cleaned.match(PHONE_REGEX);
  return match ? match[0] : null;
}

function extractName(text: string): string | null {
  const trimmed = text.trim();
  // If the message looks like it's just a name (1-4 words, no special chars beyond spaces/hyphens/accents)
  if (/^[A-Za-zÀ-ÿ\s\-']{2,60}$/.test(trimmed) && trimmed.split(/\s+/).length <= 4) {
    return trimmed;
  }
  return null;
}

// ─── Fallback choice detection ───────────────────────────────────────────────

const BOOKING_PATTERNS = /\b(call|book|schedule|calendar|video|meeting|llamada|agendar|reunión|1|cita)\b/i;
const WHATSAPP_PATTERNS = /\b(whatsapp|wa|chat|message|mensaje|2)\b/i;
const CHANGE_MIND_PATTERNS = /\b(change|switch|cambiar|actually|mejor|prefiero|rather)\b/i;

function detectFallbackChoice(message: string): "booking" | "whatsapp" | "unclear" {
  const lower = message.toLowerCase().trim();
  if (BOOKING_PATTERNS.test(lower)) return "booking";
  if (WHATSAPP_PATTERNS.test(lower)) return "whatsapp";
  return "unclear";
}

function wantsToChangeMind(message: string): boolean {
  return CHANGE_MIND_PATTERNS.test(message.toLowerCase());
}

// ─── Date/time parsing ───────────────────────────────────────────────────────

interface ParsedDateTime {
  startDate: string; // ISO
  endDate: string;   // ISO
  label: string;     // human-readable
}

function parseNaturalDateTime(text: string, timezone: string): ParsedDateTime | null {
  const lower = text.toLowerCase().trim();
  const now = new Date();

  // Detect day
  let targetDate: Date | null = null;

  if (/\b(today|hoy)\b/.test(lower)) {
    targetDate = now;
  } else if (/\b(tomorrow|mañana)\b/.test(lower)) {
    targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (/\b(monday|lunes)\b/.test(lower)) {
    targetDate = getNextWeekday(now, 1);
  } else if (/\b(tuesday|martes)\b/.test(lower)) {
    targetDate = getNextWeekday(now, 2);
  } else if (/\b(wednesday|mi[eé]rcoles)\b/.test(lower)) {
    targetDate = getNextWeekday(now, 3);
  } else if (/\b(thursday|jueves)\b/.test(lower)) {
    targetDate = getNextWeekday(now, 4);
  } else if (/\b(friday|viernes)\b/.test(lower)) {
    targetDate = getNextWeekday(now, 5);
  } else if (/\b(saturday|s[aá]bado)\b/.test(lower)) {
    targetDate = getNextWeekday(now, 6);
  } else if (/\b(sunday|domingo)\b/.test(lower)) {
    targetDate = getNextWeekday(now, 0);
  }

  // Try explicit date formats (March 5, 5 de marzo, 2026-03-05, 03/05)
  if (!targetDate) {
    const explicitMatch = lower.match(
      /(\d{4})-(\d{1,2})-(\d{1,2})|(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/
    );
    if (explicitMatch) {
      if (explicitMatch[1]) {
        // YYYY-MM-DD
        targetDate = new Date(
          parseInt(explicitMatch[1]),
          parseInt(explicitMatch[2]) - 1,
          parseInt(explicitMatch[3])
        );
      } else if (explicitMatch[4]) {
        // MM/DD or DD/MM
        const a = parseInt(explicitMatch[4]);
        const b = parseInt(explicitMatch[5]);
        const year = explicitMatch[6] ? parseInt(explicitMatch[6]) : now.getFullYear();
        targetDate = new Date(year < 100 ? year + 2000 : year, a - 1, b);
      }
    }
  }

  // Next week fallback
  if (!targetDate && /\b(next week|pr[oó]xima semana)\b/.test(lower)) {
    targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + 7);
  }

  if (!targetDate) return null;

  // Detect time
  let hour = 10; // default 10 AM
  const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/);
  if (timeMatch) {
    hour = parseInt(timeMatch[1]);
    if (timeMatch[3] && /pm|p\.m\./.test(timeMatch[3]) && hour < 12) hour += 12;
    if (timeMatch[3] && /am|a\.m\./.test(timeMatch[3]) && hour === 12) hour = 0;
  } else if (/\b(morning|mañana|temprano)\b/.test(lower)) {
    hour = 10;
  } else if (/\b(afternoon|tarde)\b/.test(lower)) {
    hour = 15;
  } else if (/\b(evening|noche)\b/.test(lower)) {
    hour = 18;
  }

  targetDate.setHours(hour, 0, 0, 0);

  const endDate = new Date(targetDate);
  endDate.setMinutes(endDate.getMinutes() + 30);

  const dateStr = targetDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = targetDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return {
    startDate: targetDate.toISOString(),
    endDate: endDate.toISOString(),
    label: `${dateStr} at ${timeStr}`,
  };
}

function getNextWeekday(from: Date, targetDay: number): Date {
  const result = new Date(from);
  const currentDay = result.getDay();
  let daysUntil = targetDay - currentDay;
  if (daysUntil <= 0) daysUntil += 7;
  result.setDate(result.getDate() + daysUntil);
  return result;
}

// ─── Service ────────────────────────────────────────────────────────────────

export class OrchestrationService {
  private chatRepo: ChatRepository;
  private publisher: Redis | null = null;

  constructor() {
    this.chatRepo = new ChatRepository();
    try {
      this.publisher = createPublisherConnection();
    } catch (err) {
      console.error("[OrchestrationService] Redis publisher init failed:", err);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // State Access
  // ────────────────────────────────────────────────────────────────────────────

  async getOrchestration(roomId: string): Promise<OrchestrationMetadata | null> {
    const room = await this.chatRepo.findRoomById(roomId);
    if (!room) return null;
    const metadata = room.metadata as Record<string, unknown> | null;
    return (metadata?.orchestration as OrchestrationMetadata) ?? null;
  }

  async setOrchestration(roomId: string, orchestration: OrchestrationMetadata): Promise<void> {
    const room = await this.chatRepo.findRoomById(roomId);
    const existing = (room?.metadata as Record<string, unknown>) ?? {};
    await this.chatRepo.updateRoomMetadata(roomId, JSON.parse(JSON.stringify({
      ...existing,
      orchestration,
    })));
  }

  createDefaultOrchestration(): OrchestrationMetadata {
    return {
      state: "CONVERSING",
      fallbackMode: null,
      collectedFields: {
        name: null,
        email: null,
        phone: null,
        timezone: null,
        reason: null,
        language: null,
      },
      bookingDetails: null,
      timers: {
        reminderJobId: null,
        timeoutJobId: null,
        escalatedAt: null,
      },
      nextFieldToCollect: null,
      repromptCount: 0,
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Handoff Timer Management
  // ────────────────────────────────────────────────────────────────────────────

  async startHandoffTimers(roomId: string): Promise<void> {
    let orchestration = await this.getOrchestration(roomId);
    if (!orchestration) {
      orchestration = this.createDefaultOrchestration();
    }

    // Queue reminder (30s)
    const reminderJob = await handoffQueue.add(
      "handoff-reminder",
      { roomId, type: "reminder" },
      { delay: HANDOFF_REMINDER_DELAY_MS }
    );

    // Queue timeout (90s)
    const timeoutJob = await handoffQueue.add(
      "handoff-timeout",
      { roomId, type: "timeout" },
      { delay: HANDOFF_TIMEOUT_DELAY_MS }
    );

    orchestration.state = "WAITING_HUMAN";
    orchestration.timers.reminderJobId = reminderJob.id ?? null;
    orchestration.timers.timeoutJobId = timeoutJob.id ?? null;
    orchestration.timers.escalatedAt = new Date().toISOString();

    await this.setOrchestration(roomId, orchestration);

    console.log(`[Orchestration] Handoff timers started for room ${roomId} (reminder: ${reminderJob.id}, timeout: ${timeoutJob.id})`);
  }

  async cancelHandoffTimers(roomId: string): Promise<void> {
    const orchestration = await this.getOrchestration(roomId);
    if (!orchestration) return;

    // Remove pending BullMQ jobs
    if (orchestration.timers.reminderJobId) {
      try {
        const job = await handoffQueue.getJob(orchestration.timers.reminderJobId);
        if (job && (await job.getState()) === "delayed") {
          await job.remove();
        }
      } catch (err) {
        console.warn("[Orchestration] Could not remove reminder job:", (err as Error).message);
      }
    }

    if (orchestration.timers.timeoutJobId) {
      try {
        const job = await handoffQueue.getJob(orchestration.timers.timeoutJobId);
        if (job && (await job.getState()) === "delayed") {
          await job.remove();
        }
      } catch (err) {
        console.warn("[Orchestration] Could not remove timeout job:", (err as Error).message);
      }
    }

    orchestration.timers.reminderJobId = null;
    orchestration.timers.timeoutJobId = null;
    await this.setOrchestration(roomId, orchestration);

    console.log(`[Orchestration] Handoff timers cancelled for room ${roomId}`);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Agent Join (cancels timers, transitions to HUMAN_CONNECTED)
  // ────────────────────────────────────────────────────────────────────────────

  async onAgentJoined(roomId: string): Promise<void> {
    await this.cancelHandoffTimers(roomId);

    const orchestration = await this.getOrchestration(roomId);
    if (!orchestration) return;

    const wasInFallbackFlow = [
      "FALLBACK_CHOICE",
      "COLLECTING_CONTACT",
      "COLLECTING_BOOKING_DETAILS",
    ].includes(orchestration.state);

    orchestration.state = "HUMAN_CONNECTED";
    await this.setOrchestration(roomId, orchestration);

    // If agent joined during fallback flow, send a notification
    if (wasInFallbackFlow) {
      await this.sendBotMessage(
        roomId,
        "Great news — a team member has joined! They'll take it from here."
      );
    }

    this.publishEvent({
      type: "handoff.cancelled",
      roomId,
      data: { reason: "agent_joined", orchestrationState: "HUMAN_CONNECTED" },
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Process Visitor Message (during orchestration states)
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Returns true if the orchestration handled this message (caller should NOT
   * pass to AI). Returns false if the message should be handled by the
   * normal AI flow.
   */
  async handleVisitorMessage(roomId: string, visitorMessage: string): Promise<boolean> {
    const orchestration = await this.getOrchestration(roomId);
    if (!orchestration) return false;

    switch (orchestration.state) {
      case "FALLBACK_CHOICE":
        return this.handleFallbackChoice(roomId, visitorMessage, orchestration);

      case "COLLECTING_CONTACT":
        return this.handleContactCollection(roomId, visitorMessage, orchestration);

      case "COLLECTING_BOOKING_DETAILS":
        return this.handleBookingDetails(roomId, visitorMessage, orchestration);

      case "WAITING_HUMAN":
      case "WAITING_HUMAN_REMINDED":
        // Visitor can still chat while waiting, but don't trigger AI responses
        // The bot already said "feel free to add details"
        return false;

      default:
        return false;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // FALLBACK_CHOICE state handler
  // ────────────────────────────────────────────────────────────────────────────

  private async handleFallbackChoice(
    roomId: string,
    message: string,
    orchestration: OrchestrationMetadata
  ): Promise<boolean> {
    const choice = detectFallbackChoice(message);

    if (choice !== "unclear") {
      orchestration.fallbackMode = choice;
      orchestration.state = "COLLECTING_CONTACT";
      orchestration.repromptCount = 0;

      // Pre-fill fields from room visitor info
      const room = await this.chatRepo.findRoomById(roomId);
      if (room?.visitorName && !orchestration.collectedFields.name) {
        orchestration.collectedFields.name = room.visitorName;
      }
      if (room?.visitorEmail && !orchestration.collectedFields.email) {
        orchestration.collectedFields.email = room.visitorEmail;
      }

      // Try to infer timezone from browser (passed on room create if available)
      const metadata = room?.metadata as Record<string, unknown> | null;
      if (metadata?.timezone && !orchestration.collectedFields.timezone) {
        orchestration.collectedFields.timezone = metadata.timezone as string;
      }

      // Determine next field to collect
      this.computeNextField(orchestration);
      await this.setOrchestration(roomId, orchestration);

      // Start collecting
      await this.promptNextField(roomId, orchestration);
      return true;
    }

    // Unclear choice
    if (orchestration.repromptCount < 1) {
      orchestration.repromptCount++;
      await this.setOrchestration(roomId, orchestration);
      await this.sendBotMessage(
        roomId,
        "No worries — just say \"call\" to schedule a video call, or \"whatsapp\" to continue on WhatsApp."
      );
      return true;
    }

    // Default to WhatsApp after 2nd unclear attempt
    orchestration.fallbackMode = "whatsapp";
    orchestration.state = "COLLECTING_CONTACT";
    orchestration.repromptCount = 0;
    this.computeNextField(orchestration);
    await this.setOrchestration(roomId, orchestration);

    await this.sendBotMessage(
      roomId,
      "I'll set you up on WhatsApp so you can reach us at your convenience."
    );
    await this.promptNextField(roomId, orchestration);
    return true;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // COLLECTING_CONTACT state handler
  // ────────────────────────────────────────────────────────────────────────────

  private async handleContactCollection(
    roomId: string,
    message: string,
    orchestration: OrchestrationMetadata
  ): Promise<boolean> {
    // Check if user wants to change mind
    if (wantsToChangeMind(message)) {
      const newChoice = detectFallbackChoice(message);
      if (newChoice !== "unclear" && newChoice !== orchestration.fallbackMode) {
        orchestration.fallbackMode = newChoice;
        orchestration.repromptCount = 0;
        this.computeNextField(orchestration);
        await this.setOrchestration(roomId, orchestration);

        const label = newChoice === "booking" ? "schedule a call" : "continue on WhatsApp";
        const nameNote = orchestration.collectedFields.name
          ? ` I already have your name as ${orchestration.collectedFields.name}.`
          : "";
        await this.sendBotMessage(roomId, `Sure, let's ${label} instead.${nameNote}`);
        await this.promptNextField(roomId, orchestration);
        return true;
      }
    }

    const field = orchestration.nextFieldToCollect;
    if (!field) {
      // All fields collected — transition
      return this.transitionAfterCollection(roomId, orchestration);
    }

    // Try to extract the field from the message
    let extracted = false;

    switch (field) {
      case "name": {
        // Try multi-field extraction first
        const email = extractEmail(message);
        const phone = extractPhone(message);
        if (email) orchestration.collectedFields.email = email;
        if (phone) orchestration.collectedFields.phone = phone;

        const name = extractName(message.replace(EMAIL_REGEX, "").replace(PHONE_REGEX, "").trim());
        if (name) {
          orchestration.collectedFields.name = name;
          // Also update room visitor info
          await this.chatRepo.updateRoomVisitorInfo(roomId, { visitorName: name });
          extracted = true;
        } else if (message.trim().length >= 2 && message.trim().length <= 60) {
          // Accept as name if it looks reasonable
          orchestration.collectedFields.name = message.trim();
          await this.chatRepo.updateRoomVisitorInfo(roomId, { visitorName: message.trim() });
          extracted = true;
        }
        break;
      }
      case "email": {
        const email = extractEmail(message);
        if (email) {
          orchestration.collectedFields.email = email;
          await this.chatRepo.updateRoomVisitorInfo(roomId, { visitorEmail: email });
          extracted = true;
        }
        break;
      }
      case "phone": {
        const phone = extractPhone(message);
        if (phone) {
          orchestration.collectedFields.phone = phone;
          extracted = true;
        }
        break;
      }
      case "reason": {
        orchestration.collectedFields.reason = message.trim();
        extracted = true;
        break;
      }
      case "timezone": {
        // Accept any timezone-like string
        orchestration.collectedFields.timezone = message.trim();
        extracted = true;
        break;
      }
    }

    if (!extracted) {
      // Re-prompt for the same field
      orchestration.repromptCount++;
      if (orchestration.repromptCount > 2) {
        // Skip optional fields after too many retries
        if (field === "reason" || field === "timezone") {
          orchestration.collectedFields[field] = null;
          this.computeNextField(orchestration);
          await this.setOrchestration(roomId, orchestration);
          await this.promptNextField(roomId, orchestration);
          return true;
        }
      }
      await this.setOrchestration(roomId, orchestration);
      await this.repromptField(roomId, field);
      return true;
    }

    // Field collected — move to next
    orchestration.repromptCount = 0;
    this.computeNextField(orchestration);
    await this.setOrchestration(roomId, orchestration);

    if (!orchestration.nextFieldToCollect) {
      return this.transitionAfterCollection(roomId, orchestration);
    }

    await this.promptNextField(roomId, orchestration);
    return true;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // COLLECTING_BOOKING_DETAILS state handler
  // ────────────────────────────────────────────────────────────────────────────

  private async handleBookingDetails(
    roomId: string,
    message: string,
    orchestration: OrchestrationMetadata
  ): Promise<boolean> {
    // Check if user wants to change to WhatsApp
    if (wantsToChangeMind(message) && /whatsapp|wa/i.test(message)) {
      orchestration.fallbackMode = "whatsapp";
      orchestration.state = "COLLECTING_CONTACT";
      this.computeNextField(orchestration);
      await this.setOrchestration(roomId, orchestration);
      await this.sendBotMessage(roomId, "Sure, let's switch to WhatsApp instead.");
      await this.promptNextField(roomId, orchestration);
      return true;
    }

    const tz = orchestration.collectedFields.timezone || "UTC";

    // Check for confirmation ("yes", "confirm", "si", "sí")
    if (orchestration.bookingDetails?.startDate) {
      const lower = message.toLowerCase().trim();
      if (/^(yes|yeah|yep|si|sí|confirm|dale|ok|sure|listo)\b/.test(lower)) {
        return this.createBooking(roomId, orchestration);
      }
      if (/^(no|nope|cancel|cancelar|change|cambiar)\b/.test(lower)) {
        orchestration.bookingDetails = null;
        await this.setOrchestration(roomId, orchestration);
        await this.sendBotMessage(
          roomId,
          "No problem! When works best for you? You can say something like \"tomorrow at 3pm\" or \"next Monday morning\"."
        );
        return true;
      }
    }

    // Try to parse date/time
    const parsed = parseNaturalDateTime(message, tz);
    if (!parsed) {
      await this.sendBotMessage(
        roomId,
        "I didn't quite catch that. Could you try something like \"Wednesday at 2pm\" or \"tomorrow at 10am\"?"
      );
      return true;
    }

    // Check if date is in the past
    if (new Date(parsed.startDate) < new Date()) {
      await this.sendBotMessage(
        roomId,
        "That date/time has already passed. Could you pick a future date?"
      );
      return true;
    }

    // Store and confirm
    orchestration.bookingDetails = {
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      notes: orchestration.collectedFields.reason,
    };
    await this.setOrchestration(roomId, orchestration);

    const tzLabel = orchestration.collectedFields.timezone || "UTC";
    await this.sendBotMessage(
      roomId,
      `I'll book you for ${parsed.label} (${tzLabel}).\nThe call will be 30 minutes. Shall I confirm?`
    );
    return true;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Booking Creation
  // ────────────────────────────────────────────────────────────────────────────

  private async createBooking(
    roomId: string,
    orchestration: OrchestrationMetadata
  ): Promise<boolean> {
    const fields = orchestration.collectedFields;
    const details = orchestration.bookingDetails;

    if (!fields.name || !fields.email || !details?.startDate || !details?.endDate) {
      await this.sendBotMessage(roomId, "I'm missing some details. Let me start over.");
      orchestration.state = "COLLECTING_CONTACT";
      orchestration.bookingDetails = null;
      this.computeNextField(orchestration);
      await this.setOrchestration(roomId, orchestration);
      await this.promptNextField(roomId, orchestration);
      return true;
    }

    await this.sendBotMessage(roomId, "Creating your booking...");

    try {
      const bookingService = new BookingService(db);
      const result = await bookingService.scheduleMeeting({
        name: fields.name,
        email: fields.email,
        notes: fields.reason || "Scheduled via chat",
        startDate: details.startDate,
        endDate: details.endDate,
        timeZone: fields.timezone || "UTC",
      });

      orchestration.state = "BOOKING_CREATED";
      await this.setOrchestration(roomId, orchestration);

      const meetLine = result.meetLink
        ? `\n📌 Meet link: ${result.meetLink}`
        : "";

      await this.sendBotMessage(
        roomId,
        [
          "Your call is confirmed! ✅",
          "",
          `📧 A confirmation email with the Google Meet link has been sent to ${fields.email}.`,
          meetLine,
          "",
          "Is there anything else I can help with?",
        ].join("\n")
      );

      this.publishEvent({
        type: "booking.created",
        roomId,
        data: {
          bookingId: result.bookingId,
          meetLink: result.meetLink,
          startDate: details.startDate,
          endDate: details.endDate,
          orchestrationState: "BOOKING_CREATED",
        },
      });

      return true;
    } catch (err) {
      console.error("[Orchestration] Booking creation failed:", err);

      await this.sendBotMessage(
        roomId,
        [
          "I wasn't able to create the calendar event right now. I've saved your details and our team will reach out to confirm at " + fields.email + ".",
          "",
          "Would you like to continue on WhatsApp instead?",
        ].join("\n")
      );

      // Offer WhatsApp as fallback
      orchestration.state = "FALLBACK_CHOICE";
      orchestration.repromptCount = 0;
      await this.setOrchestration(roomId, orchestration);
      return true;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // WhatsApp Redirect
  // ────────────────────────────────────────────────────────────────────────────

  private async redirectToWhatsApp(
    roomId: string,
    orchestration: OrchestrationMetadata
  ): Promise<boolean> {
    const fields = orchestration.collectedFields;
    const name = fields.name || "there";

    const prefilledText = encodeURIComponent(
      `Hi, I'm ${name}. I was chatting on your website and would like to continue the conversation.`
    );
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${prefilledText}`;

    orchestration.state = "WHATSAPP_REDIRECTED";
    await this.setOrchestration(roomId, orchestration);

    await this.sendBotMessage(
      roomId,
      [
        "You're all set! 💬",
        "",
        "Click here to continue on WhatsApp:",
        `👉 ${waLink}`,
        "",
        `Or save our number: +${WHATSAPP_NUMBER}`,
        "",
        "Our team typically responds within a few hours during business hours.",
        "Is there anything else before you go?",
      ].join("\n")
    );

    this.publishEvent({
      type: "whatsapp.link_sent",
      roomId,
      data: {
        waLink,
        phone: WHATSAPP_NUMBER,
        orchestrationState: "WHATSAPP_REDIRECTED",
      },
    });

    return true;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────────────────

  private computeNextField(orchestration: OrchestrationMetadata): void {
    const requiredFields = orchestration.fallbackMode === "booking"
      ? BOOKING_REQUIRED_FIELDS
      : WHATSAPP_REQUIRED_FIELDS;

    for (const field of requiredFields) {
      if (!orchestration.collectedFields[field]) {
        orchestration.nextFieldToCollect = field;
        return;
      }
    }

    // For booking, also check optional fields
    if (orchestration.fallbackMode === "booking") {
      if (!orchestration.collectedFields.reason) {
        orchestration.nextFieldToCollect = "reason";
        return;
      }
      if (!orchestration.collectedFields.timezone) {
        orchestration.nextFieldToCollect = "timezone";
        return;
      }
    }

    orchestration.nextFieldToCollect = null;
  }

  private async transitionAfterCollection(
    roomId: string,
    orchestration: OrchestrationMetadata
  ): Promise<boolean> {
    if (orchestration.fallbackMode === "booking") {
      orchestration.state = "COLLECTING_BOOKING_DETAILS";
      await this.setOrchestration(roomId, orchestration);

      const name = orchestration.collectedFields.name;
      const tz = orchestration.collectedFields.timezone || "your timezone";
      await this.sendBotMessage(
        roomId,
        `Thanks ${name}! When works best for you? You can say something like "tomorrow at 3pm" or "next Monday morning". (Timezone: ${tz})`
      );
      return true;
    }

    if (orchestration.fallbackMode === "whatsapp") {
      return this.redirectToWhatsApp(roomId, orchestration);
    }

    return false;
  }

  private async promptNextField(
    roomId: string,
    orchestration: OrchestrationMetadata
  ): Promise<void> {
    const field = orchestration.nextFieldToCollect;
    if (!field) return;

    const modeLabel = orchestration.fallbackMode === "booking"
      ? "schedule your call"
      : "set you up on WhatsApp";

    const prompts: Record<string, string> = {
      name: `I'll need a few details to ${modeLabel}. What's your full name?`,
      email: "What's your email address?",
      phone: "What's your phone number with country code? (e.g., +57 320 589 0433)",
      reason: "Briefly, what would you like to discuss on the call?",
      timezone: `I'll assume your timezone is UTC. If that's not right, please share your timezone (e.g., "America/New_York" or "EST").`,
    };

    // If name is already known, skip the intro
    if (field === "name" && orchestration.collectedFields.name) {
      this.computeNextField(orchestration);
      await this.setOrchestration(roomId, orchestration);
      if (orchestration.nextFieldToCollect) {
        await this.promptNextField(roomId, orchestration);
      } else {
        await this.transitionAfterCollection(roomId, orchestration);
      }
      return;
    }

    await this.sendBotMessage(roomId, prompts[field] || `Could you provide your ${field}?`);
  }

  private async repromptField(roomId: string, field: string): Promise<void> {
    const hints: Record<string, string> = {
      name: "Could you share your full name? (e.g., John Doe)",
      email: "That doesn't look like a valid email. Could you double-check? (e.g., john@example.com)",
      phone: "That doesn't look like a valid phone number. Please include your country code (e.g., +1 for US, +57 for Colombia).",
      reason: "Just a brief sentence about what you'd like to discuss is fine.",
      timezone: "Could you share your timezone? (e.g., America/Bogota, EST, UTC-5)",
    };
    await this.sendBotMessage(roomId, hints[field] || `Could you provide your ${field}?`);
  }

  private async sendBotMessage(roomId: string, content: string): Promise<void> {
    const message = await this.chatRepo.createMessage({
      roomId,
      senderType: "bot",
      senderName: "Alpadev AI",
      content,
    });

    this.publishEvent({
      type: "message.new",
      roomId,
      data: { message },
    });
  }

  private publishEvent(event: { type: string; roomId: string; data: Record<string, unknown> }): void {
    if (this.publisher) {
      this.publisher.publish(CHAT_EVENTS_CHANNEL, JSON.stringify(event)).catch((err) => {
        console.error("[Orchestration] Failed to publish event:", err);
      });
    }
  }
}

// Singleton
let orchestrationInstance: OrchestrationService | null = null;

export function getOrchestrationService(): OrchestrationService {
  if (!orchestrationInstance) {
    orchestrationInstance = new OrchestrationService();
  }
  return orchestrationInstance;
}
