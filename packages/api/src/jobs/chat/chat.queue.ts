import { Queue } from "bullmq";
import { getBullMQConnectionOptions } from "../connection";

export const CHAT_QUEUE_NAME = "chat-bot-response";

export const CHAT_EVENTS_CHANNEL = "chat:events";

export interface ChatJobData {
  jobId: string;
  roomId: string;
  visitorMessage: string;
}

export const chatQueue = new Queue<ChatJobData>(CHAT_QUEUE_NAME, {
  connection: getBullMQConnectionOptions(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});
