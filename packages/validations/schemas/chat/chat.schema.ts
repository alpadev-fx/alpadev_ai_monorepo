import { z } from "zod";

// ==========================================
// Chat Room Status
// ==========================================
export const ChatRoomStatusEnum = z.enum(["bot_active", "waiting_for_agent", "agent_joined", "closed"]);
export type ChatRoomStatus = z.infer<typeof ChatRoomStatusEnum>;

// ==========================================
// Chat Sender Type
// ==========================================
export const ChatSenderTypeEnum = z.enum(["visitor", "bot", "agent"]);
export type ChatSenderType = z.infer<typeof ChatSenderTypeEnum>;

// ==========================================
// Create Room
// ==========================================
export const CreateChatRoomSchema = z.object({
  visitorId: z.string().uuid("Invalid visitor ID"),
});
export type CreateChatRoomInput = z.infer<typeof CreateChatRoomSchema>;

// ==========================================
// Send Message
// ==========================================
export const SendChatMessageSchema = z.object({
  roomId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid room ID"),
  content: z.string().min(1, "Message cannot be empty").max(2000, "Message too long"),
  senderType: ChatSenderTypeEnum,
  senderName: z.string().optional(),
  visitorId: z.string().uuid().optional(),
});
export type SendChatMessageInput = z.infer<typeof SendChatMessageSchema>;

// ==========================================
// Join Room (Agent)
// ==========================================
export const JoinChatRoomSchema = z.object({
  roomId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid room ID"),
});
export type JoinChatRoomInput = z.infer<typeof JoinChatRoomSchema>;

// ==========================================
// Close Room
// ==========================================
export const CloseChatRoomSchema = z.object({
  roomId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid room ID"),
});
export type CloseChatRoomInput = z.infer<typeof CloseChatRoomSchema>;

// ==========================================
// Get Room Messages
// ==========================================
export const GetChatMessagesSchema = z.object({
  roomId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid room ID"),
  limit: z.number().min(1).max(100).optional().default(50),
  cursor: z.string().optional(),
});
export type GetChatMessagesInput = z.infer<typeof GetChatMessagesSchema>;

// ==========================================
// Get Active Rooms (Agent Dashboard)
// ==========================================
export const GetActiveRoomsSchema = z.object({
  status: ChatRoomStatusEnum.optional(),
});
export type GetActiveRoomsInput = z.infer<typeof GetActiveRoomsSchema>;

// ==========================================
// Typing Indicator
// ==========================================
export const TypingIndicatorSchema = z.object({
  roomId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid room ID"),
  senderType: ChatSenderTypeEnum,
  isTyping: z.boolean(),
});
export type TypingIndicatorInput = z.infer<typeof TypingIndicatorSchema>;
