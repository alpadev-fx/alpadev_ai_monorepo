import { z } from "zod";

// ==========================================
// Action types available for the chatbot
// ==========================================
export const ActionTypeEnum = z.enum([
  "schedule_meeting",
  "submit_request",
  "get_services_info",
  "get_pricing",
  "general_info",
  "escalate_to_human",
  "none",
]);

export type ActionType = z.infer<typeof ActionTypeEnum>;

// ==========================================
// AI Response Schema (validated from LLM output)
// ==========================================
export const AIActionResponseSchema = z.object({
  messageType: z.enum(["text", "interactive"]).default("text"),
  response: z.string().min(1, "Response cannot be empty"),
  requiresAction: z.boolean().default(false),
  actionType: ActionTypeEnum.default("none"),
  actionData: z.record(z.any()).default({}),
  nextSteps: z.array(z.string()).default([]),
  needsMoreInfo: z.boolean().default(false),
  missingInfo: z.array(z.string()).default([]),
});

export type AIActionResponse = z.infer<typeof AIActionResponseSchema>;

// ==========================================
// Chat message input schema
// ==========================================
export const SendMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000, "Message too long"),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;

// ==========================================
// Conversation history input schema
// ==========================================
export const GetConversationHistorySchema = z.object({
  userId: z.string().optional(),
  limit: z.number().min(1).max(50).optional().default(10),
});

export type GetConversationHistoryInput = z.infer<typeof GetConversationHistorySchema>;

// ==========================================
// Request creation from chatbot
// ==========================================
export const ChatbotRequestSchema = z.object({
  type: z.enum(["ticket", "quote", "other"]).default("ticket"),
  title: z.string().min(5, "Title too short"),
  description: z.string().min(10, "Description too short"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});

export type ChatbotRequestInput = z.infer<typeof ChatbotRequestSchema>;
