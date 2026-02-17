import {
  CreateChatRoomSchema,
  SendChatMessageSchema,
  JoinChatRoomSchema,
  CloseChatRoomSchema,
  GetChatMessagesSchema,
  GetActiveRoomsSchema,
  TypingIndicatorSchema,
} from "@package/validations";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "../../trpc";
import { getChatService } from "./chat.service";

const chatService = getChatService();

export const chatRouter = createTRPCRouter({
  /**
   * Create a new chat room (public — visitors don't need auth)
   */
  createRoom: publicProcedure
    .input(CreateChatRoomSchema)
    .mutation(async ({ input, ctx }) => {
      // Extract visitor IP from request headers
      const forwarded = ctx.headers.get("x-forwarded-for");
      const visitorIp = forwarded
        ? forwarded.split(",")[0].trim()
        : ctx.headers.get("x-real-ip") || undefined;

      return chatService.createRoom(input.visitorId, visitorIp);
    }),

  /**
   * Send a message in a chat room (public — visitors and agents)
   */
  sendMessage: publicProcedure
    .input(SendChatMessageSchema)
    .mutation(async ({ input }) => {
      return chatService.sendMessage({
        roomId: input.roomId,
        content: input.content,
        senderType: input.senderType,
        senderName: input.senderName,
        visitorId: input.visitorId,
      });
    }),

  /**
   * Get messages for a room (public — visitors need their room)
   */
  getMessages: publicProcedure
    .input(GetChatMessagesSchema)
    .query(async ({ input }) => {
      return chatService.getMessages(input.roomId, input.limit, input.cursor);
    }),

  /**
   * Agent joins a room (admin only)
   */
  joinRoom: adminProcedure
    .input(JoinChatRoomSchema)
    .mutation(async ({ ctx, input }) => {
      const agentName = ctx.session?.user.name || "Agent";
      return chatService.joinRoom(input.roomId, agentName);
    }),

  /**
   * Close a chat room (admin only)
   */
  closeRoom: adminProcedure
    .input(CloseChatRoomSchema)
    .mutation(async ({ input }) => {
      return chatService.closeRoom(input.roomId);
    }),

  /**
   * Get active rooms (admin only — agent dashboard)
   */
  getActiveRooms: adminProcedure
    .input(GetActiveRoomsSchema)
    .query(async ({ input }) => {
      return chatService.getActiveRooms(input.status);
    }),

  /**
   * Typing indicator (public)
   */
  typing: publicProcedure
    .input(TypingIndicatorSchema)
    .mutation(({ input }) => {
      chatService.emitTyping(input.roomId, input.senderType, input.isTyping);
      return { ok: true };
    }),
});
