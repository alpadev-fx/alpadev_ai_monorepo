import { Queue } from "bullmq";
import { getBullMQConnectionOptions } from "../connection";
import type { HandoffTimerJobData } from "@package/validations";

export const HANDOFF_QUEUE_NAME = "handoff-timers";

export const HANDOFF_REMINDER_DELAY_MS = 30_000; // 30 seconds
export const HANDOFF_TIMEOUT_DELAY_MS = 90_000; // 90 seconds

export const handoffQueue = new Queue<HandoffTimerJobData>(HANDOFF_QUEUE_NAME, {
  connection: getBullMQConnectionOptions(),
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 100 },
  },
});
