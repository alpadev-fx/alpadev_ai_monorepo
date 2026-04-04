import {
  CreateChatRoomSchema,
  SendChatMessageSchema,
  JoinChatRoomSchema,
  CloseChatRoomSchema,
  GetChatMessagesSchema,
  GetActiveRoomsSchema,
  TypingIndicatorSchema,
} from "@package/validations";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
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
    .mutation(async ({ input, ctx }) => {
      if (input.senderType === "bot") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot send as bot" });
      }
      if (input.senderType === "agent") {
        if (!ctx.session?.user || ctx.session.user.role !== "ADMIN") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only agents can send as agent" });
        }
      }
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
    .input(GetChatMessagesSchema.extend({
      visitorId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const isAdmin = ctx.session?.user?.role === "ADMIN";
      if (!isAdmin && !input.visitorId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Visitor ID or admin access required" });
      }
      if (!isAdmin && input.visitorId) {
        const room = await chatService.getRoomById(input.roomId);
        if (!room || room.visitorId !== input.visitorId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }
      }
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
