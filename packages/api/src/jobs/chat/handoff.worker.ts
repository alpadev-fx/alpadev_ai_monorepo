/**
 * Handoff Timer Worker
 *
 * Processes delayed jobs for the human handoff timeout system.
 * Two job types:
 *   - "reminder" (30s) — Sends a "still waiting" message
 *   - "timeout" (90s) — Presents fallback choices (booking or WhatsApp)
 *
 * Usage: tsx src/jobs/chat/handoff.worker.ts
 */
import "dotenv/config";
import { Worker } from "bullmq";
import { getBullMQConnectionOptions, createPublisherConnection } from "../connection";
import { HANDOFF_QUEUE_NAME } from "./handoff.queue";
import { CHAT_EVENTS_CHANNEL } from "./chat.queue";
import { ChatRepository } from "../../routers/chat/chat.repository";
import type { HandoffTimerJobData, OrchestrationMetadata } from "@package/validations";

const chatRepo = new ChatRepository();
const publisher = createPublisherConnection();

async function getOrchestration(roomId: string): Promise<OrchestrationMetadata | null> {
  const room = await chatRepo.findRoomById(roomId);
  if (!room) return null;
  const metadata = room.metadata as Record<string, unknown> | null;
  return (metadata?.orchestration as OrchestrationMetadata) ?? null;
}

async function updateOrchestration(roomId: string, orchestration: OrchestrationMetadata): Promise<void> {
  const room = await chatRepo.findRoomById(roomId);
  const existing = (room?.metadata as Record<string, unknown>) ?? {};
  await chatRepo.updateRoomMetadata(roomId, JSON.parse(JSON.stringify({
    ...existing,
    orchestration,
  })));
}

async function processHandoffJob(job: { data: HandoffTimerJobData }): Promise<void> {
  const { roomId, type } = job.data;

  console.log(`[HandoffWorker] Processing ${type} for room ${roomId}`);

  // Guard: check room is still waiting_for_agent
  const room = await chatRepo.findRoomById(roomId);
  if (!room || room.status !== "waiting_for_agent") {
    console.log(`[HandoffWorker] Room ${roomId} no longer waiting — skipping ${type}`);
    return;
  }

  const orchestration = await getOrchestration(roomId);
  if (!orchestration) {
    console.warn(`[HandoffWorker] No orchestration metadata for room ${roomId}`);
    return;
  }

  if (type === "reminder") {
    // Guard: only send reminder if still in WAITING_HUMAN state
    if (orchestration.state !== "WAITING_HUMAN") {
      console.log(`[HandoffWorker] Room ${roomId} not in WAITING_HUMAN — skipping reminder`);
      return;
    }

    // Send the "still waiting" message
    const reminderMessage = await chatRepo.createMessage({
      roomId,
      senderType: "bot",
      senderName: "Alpadev AI",
      content: "Still connecting you with our team. Thank you for your patience — we'll be with you shortly.",
    });

    orchestration.state = "WAITING_HUMAN_REMINDED";
    await updateOrchestration(roomId, orchestration);

    await publisher.publish(
      CHAT_EVENTS_CHANNEL,
      JSON.stringify({
        type: "message.new",
        roomId,
        data: { message: reminderMessage },
      })
    );

    await publisher.publish(
      CHAT_EVENTS_CHANNEL,
      JSON.stringify({
        type: "handoff.reminder",
        roomId,
        data: { elapsedSeconds: 30 },
      })
    );

    console.log(`[HandoffWorker] Reminder sent for room ${roomId}`);
  }

  if (type === "timeout") {
    // Guard: only trigger timeout if still waiting (not already handled)
    if (orchestration.state !== "WAITING_HUMAN" && orchestration.state !== "WAITING_HUMAN_REMINDED") {
      console.log(`[HandoffWorker] Room ${roomId} state is ${orchestration.state} — skipping timeout`);
      return;
    }

    // Send fallback choice message
    const fallbackMessage = await chatRepo.createMessage({
      roomId,
      senderType: "bot",
      senderName: "Alpadev AI",
      content: [
        "Our team is currently unavailable, but I can help you right now.",
        "How would you like to proceed?",
        "",
        "📅 **Schedule a call** — I'll book a video call and send you a confirmation email with a Google Meet link",
        "💬 **Continue on WhatsApp** — I'll connect you directly with our team on WhatsApp",
        "",
        "Just reply \"call\" or \"whatsapp\".",
      ].join("\n"),
    });

    orchestration.state = "FALLBACK_CHOICE";
    orchestration.timers.reminderJobId = null;
    orchestration.timers.timeoutJobId = null;
    await updateOrchestration(roomId, orchestration);

    await publisher.publish(
      CHAT_EVENTS_CHANNEL,
      JSON.stringify({
        type: "message.new",
        roomId,
        data: { message: fallbackMessage },
      })
    );

    await publisher.publish(
      CHAT_EVENTS_CHANNEL,
      JSON.stringify({
        type: "handoff.timeout",
        roomId,
        data: {
          elapsedSeconds: 90,
          choices: ["booking", "whatsapp"],
          orchestrationState: "FALLBACK_CHOICE",
        },
      })
    );

    console.log(`[HandoffWorker] Timeout fired for room ${roomId} — fallback choices presented`);
  }
}

// Create worker
const worker = new Worker<HandoffTimerJobData>(
  HANDOFF_QUEUE_NAME,
  async (job) => {
    await processHandoffJob(job);
  },
  {
    connection: getBullMQConnectionOptions(),
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`[HandoffWorker] Job ${job.id} completed (${job.data.type})`);
});

worker.on("failed", (job, err) => {
  if (job) {
    console.error(`[HandoffWorker] Job ${job.id} failed (${job.data.type}):`, err.message);
  }
});

worker.on("error", (err) => {
  console.error("[HandoffWorker] Worker error:", err);
});

console.log("[HandoffWorker] Worker started, waiting for handoff timer jobs...");

// Graceful shutdown
const shutdown = async () => {
  console.log("[HandoffWorker] Shutting down...");
  await worker.close();
  await publisher.quit();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
