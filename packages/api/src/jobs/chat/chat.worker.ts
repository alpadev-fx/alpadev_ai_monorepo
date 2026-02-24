/**
 * Chat Bot Response Worker
 *
 * Runs as a separate Node.js process to handle AI bot response generation.
 * Picks jobs from the BullMQ queue, generates AI responses using the waterfall
 * strategy, saves results to DB, and publishes events via Redis pub/sub.
 *
 * Usage: tsx src/jobs/chat/chat.worker.ts
 */
import "dotenv/config";
import { Worker } from "bullmq";
import { getBullMQConnectionOptions, createPublisherConnection } from "../connection";
import { CHAT_QUEUE_NAME, CHAT_EVENTS_CHANNEL } from "./chat.queue";
import type { ChatJobData } from "./chat.queue";
import { ChatJobRepository } from "./chat-job.repository";
import { ChatRepository } from "../../routers/chat/chat.repository";
import { AIChatService } from "../../routers/chatbot/service/ai.service";
import { MessageAnalysisService } from "../../routers/chatbot/service/analysis.service";
import { getOrchestrationService } from "../../routers/chat/orchestration.service";

const chatJobRepo = new ChatJobRepository();
const chatRepo = new ChatRepository();
const aiService = new AIChatService();
const analysisService = new MessageAnalysisService();
const publisher = createPublisherConnection();

const ESCALATION_PATTERNS = [
  /\btalk to a (real|human|actual)\b/,
  /\bhuman agent\b/,
  /\breal person\b/,
  /\bspeak (to|with) (a |an )?(human|person|agent|someone real)\b/,
  /\bconnect me (to|with) (a |an )?(human|person|agent)\b/,
  /\bi (want|need) (a |an )?(human|person|agent)\b/,
  /\btransfer (me )?(to )?(a |an )?(human|person|agent)\b/,
  /\bno(t)? a bot\b/,
  /\bstop being a bot\b/,
  /\bhablar con (una? )?(persona|humano|agente)\b/,
  /\bquiero (una? )?(persona|humano|agente)\b/,
  /\bnecesito (una? )?(persona|humano|agente)\b/,
  /\bconectame con (una? )?(persona|humano|agente)\b/,
  /\bpasame con (una? )?(persona|humano|agente)\b/,
  /\bagente real\b/,
  /\bpersona real\b/,
];

function hasEscalationKeywords(message: string): boolean {
  const normalized = message.toLowerCase().trim();
  return ESCALATION_PATTERNS.some((pattern) => pattern.test(normalized));
}

const FALLBACK_RESPONSES = [
  "Thanks for reaching out! We build custom software solutions — web apps, mobile apps, SaaS platforms, and more. What kind of project are you working on?",
  "Hey! I'd love to help. We specialize in custom software development, cloud architecture, and AI solutions. Could you tell me more about what you need?",
  "Great to hear from you! At Alpadev, we help businesses turn ideas into production-ready products. What are you looking to build?",
  "Thanks for your message! We offer custom development, MVP building, API integrations, and team augmentation. How can we help you today?",
];

function getFallbackResponse(visitorMessage: string): string {
  const msg = visitorMessage.toLowerCase();

  // Contextual matching for common topics
  if (/\b(price|pricing|cost|how much|budget|presupuesto|costo|precio)\b/.test(msg)) {
    return "Our pricing depends on the scope and complexity of the project. We offer fixed-price, time & materials, and dedicated team models. Would you like to share your project details so we can give you a better idea?";
  }
  if (/\b(mobile|app|ios|android|react native)\b/.test(msg)) {
    return "We build native and cross-platform mobile apps using React Native and modern frameworks. Could you tell me more about the app you have in mind — features, target platforms, and timeline?";
  }
  if (/\b(web|website|webapp|saas|platform|next\.?js|react)\b/.test(msg)) {
    return "Web development is one of our core strengths! We build with Next.js, React, and TypeScript. What kind of web application are you looking to create?";
  }
  if (/\b(ai|machine learning|ml|chatbot|gpt|llm|artificial intelligence)\b/.test(msg)) {
    return "We develop AI-powered solutions — chatbots, recommendation engines, data pipelines, and custom ML integrations. What AI challenge are you tackling?";
  }
  if (/\b(hello|hi|hey|hola|buenos|buenas)\b/.test(msg)) {
    return "Hey! Welcome to Alpadev. We build custom software solutions — from web and mobile apps to AI integrations. How can I help you today?";
  }
  if (/\b(meeting|call|schedule|demo|reunión|llamada)\b/.test(msg)) {
    return "I'd be happy to set up a call with our team! Could you share your name, email, and a brief description of your project so we can prepare?";
  }

  // Rotate through generic fallbacks
  const index = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
  return FALLBACK_RESPONSES[index];
}

async function processJob(job: { data: ChatJobData }): Promise<void> {
  const { jobId, roomId, visitorMessage } = job.data;

  console.log(`[ChatWorker] Processing job ${jobId} for room ${roomId}`);

  // 1. Update job status to processing (non-blocking — don't crash if ChatJob record missing)
  try {
    await chatJobRepo.updateStatus(jobId, "processing");
  } catch (err) {
    console.warn(`[ChatWorker] Could not update job status (non-critical):`, (err as Error).message?.slice(0, 100));
  }

  // 2. Analyze message
  const analysis = analysisService.analyze(visitorMessage);

  // 3. Generate AI response (waterfall: DeepSeek -> Gemini -> Mistral 7B -> Mistral Nemo)
  const aiResponse = await aiService.generateResponse(
    visitorMessage,
    null,
    undefined,
    { messageAnalysis: analysis }
  );

  let botResponseText: string;
  let shouldEscalate = false;
  let escalationReason = "ai_driven";

  if (aiResponse.success && aiResponse.data) {
    botResponseText = aiResponse.data.response;

    // Check if AI decided to escalate
    if (aiResponse.data.actionType === "escalate_to_human" && aiResponse.data.requiresAction) {
      shouldEscalate = true;
      escalationReason = (aiResponse.data.actionData?.reason as string) || "ai_driven";
    }

    // Also check for explicit keyword escalation in the visitor message
    if (!shouldEscalate && hasEscalationKeywords(visitorMessage)) {
      shouldEscalate = true;
      escalationReason = "visitor_request";
    }

    // 4. Extract visitor info if available
    if (aiResponse.data.actionData) {
      const actionData = aiResponse.data.actionData;
      if (actionData.name || actionData.email) {
        await chatRepo.updateRoomVisitorInfo(roomId, {
          visitorName: actionData.name as string | undefined,
          visitorEmail: actionData.email as string | undefined,
        });
      }
    }
  } else {
    // AI unavailable — use contextual fallback based on visitor message
    botResponseText = getFallbackResponse(visitorMessage);

    // Still check keywords for escalation even when AI is down
    if (hasEscalationKeywords(visitorMessage)) {
      shouldEscalate = true;
      escalationReason = "visitor_request";
    }
  }

  // 5. Save bot message to DB
  const botMessage = await chatRepo.createMessage({
    roomId,
    senderType: "bot",
    senderName: "Alpadev AI",
    content: botResponseText,
  });

  // 6. Complete the job (non-blocking)
  try {
    await chatJobRepo.complete(jobId, {
      botMessageId: botMessage.id,
      response: botResponseText,
    });
  } catch (err) {
    console.warn(`[ChatWorker] Could not complete job tracking (non-critical):`, (err as Error).message?.slice(0, 100));
  }

  // 7. Publish bot message event
  const messageEvent = {
    type: "message.new",
    roomId,
    data: { message: botMessage },
  };
  await publisher.publish(CHAT_EVENTS_CHANNEL, JSON.stringify(messageEvent));

  // 8. If AI decided to escalate, update room status and notify
  if (shouldEscalate) {
    // Guard: only escalate if room is still bot_active
    const room = await chatRepo.findRoomById(roomId);
    if (room && room.status === "bot_active") {
      await chatRepo.updateRoomStatus(roomId, "waiting_for_agent");

      const escalationMessage = await chatRepo.createMessage({
        roomId,
        senderType: "bot",
        senderName: "Alpadev AI",
        content:
          "I'm connecting you with a team member who can help you further. They'll be with you shortly — feel free to add any details in the meantime!",
      });

      await publisher.publish(
        CHAT_EVENTS_CHANNEL,
        JSON.stringify({
          type: "room.statusChange",
          roomId,
          data: { status: "waiting_for_agent", reason: escalationReason },
        })
      );

      await publisher.publish(
        CHAT_EVENTS_CHANNEL,
        JSON.stringify({
          type: "message.new",
          roomId,
          data: { message: escalationMessage },
        })
      );

      // Start handoff timers (30s reminder, 90s timeout)
      try {
        const orchestrationService = getOrchestrationService();
        await orchestrationService.startHandoffTimers(roomId);
      } catch (err) {
        console.warn("[ChatWorker] Failed to start handoff timers:", (err as Error).message);
      }

      console.log(`[ChatWorker] Room ${roomId} escalated to human (reason: ${escalationReason})`);
    }
  }

  console.log(`[ChatWorker] Job ${jobId} completed successfully`);
}

async function handleFailure(
  jobData: ChatJobData,
  error: Error
): Promise<void> {
  const { jobId, roomId } = jobData;

  console.error(`[ChatWorker] Job ${jobId} failed:`, error.message);

  try {
    // Update job status
    await chatJobRepo.fail(jobId, error.message);

    // Save fallback error message to DB
    const errorMessage = await chatRepo.createMessage({
      roomId,
      senderType: "bot",
      senderName: "Alpadev AI",
      content:
        "I'm having a moment! Could you rephrase that? Or I can connect you with our team directly.",
    });

    // Publish the error message so visitor still gets a response
    const event = {
      type: "message.new",
      roomId,
      data: { message: errorMessage },
    };

    await publisher.publish(CHAT_EVENTS_CHANNEL, JSON.stringify(event));
  } catch (fallbackError) {
    console.error("[ChatWorker] Fallback error handling failed:", fallbackError);
  }
}

// Create worker
const worker = new Worker<ChatJobData>(
  CHAT_QUEUE_NAME,
  async (job) => {
    await processJob(job);
  },
  {
    connection: getBullMQConnectionOptions(),
    concurrency: 3,
  }
);

worker.on("completed", (job) => {
  console.log(`[ChatWorker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  if (job) {
    console.error(`[ChatWorker] Job ${job.id} failed:`, err.message);
    handleFailure(job.data, err);
  }
});

worker.on("error", (err) => {
  console.error("[ChatWorker] Worker error:", err);
});

console.log("[ChatWorker] Worker started, waiting for jobs...");

// Graceful shutdown
const shutdown = async () => {
  console.log("[ChatWorker] Shutting down...");
  await worker.close();
  await publisher.quit();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
