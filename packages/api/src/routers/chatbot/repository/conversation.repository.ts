import { db } from "@package/db";
import type { IConversationRepository } from "./repository.types";
import type {
  ActionType,
  ConversationContext,
  SessionStats,
} from "../service/service.types";

export class ConversationRepository implements IConversationRepository {
  async findActiveSession(
    userId: string
  ): Promise<ConversationContext | null> {
    const session = await db.conversationSession.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        messages: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!session) return null;

    return {
      userId: session.userId,
      sessionId: session.id,
      messages: session.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      })),
      currentAction: (session.currentAction as ActionType) || undefined,
      pendingData: session.pendingData
        ? JSON.parse(JSON.stringify(session.pendingData))
        : undefined,
      lastInteraction: session.lastInteraction.toISOString(),
    };
  }

  async createSession(userId: string): Promise<ConversationContext> {
    const session = await db.conversationSession.create({
      data: {
        userId,
        isActive: true,
        currentAction: "none",
      },
    });

    return {
      userId: session.userId,
      sessionId: session.id,
      messages: [],
      currentAction: "none",
      lastInteraction: session.lastInteraction.toISOString(),
    };
  }

  async updateSession(
    sessionId: string,
    data: Partial<ConversationContext>
  ): Promise<void> {
    await db.conversationSession.update({
      where: { id: sessionId },
      data: {
        currentAction: data.currentAction,
        pendingData: data.pendingData,
        updatedAt: new Date(),
        lastInteraction: new Date(),
      },
    });
  }

  async addMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<void> {
    await db.conversationMessage.create({
      data: {
        sessionId,
        role,
        content,
      },
    });
  }

  async getHistory(
    userId: string,
    limit: number = 50
  ): Promise<ConversationContext[]> {
    const sessions = await db.conversationSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: { messages: { orderBy: { timestamp: "asc" } } },
    });

    return sessions.map((s) => ({
      userId: s.userId,
      sessionId: s.id,
      messages: s.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      })),
      currentAction: (s.currentAction as ActionType) || undefined,
      pendingData: s.pendingData
        ? JSON.parse(JSON.stringify(s.pendingData))
        : undefined,
      lastInteraction: s.lastInteraction.toISOString(),
    }));
  }

  async getSessionStats(userId: string): Promise<SessionStats> {
    const totalSessions = await db.conversationSession.count({
      where: { userId },
    });
    const activeSessions = await db.conversationSession.count({
      where: { userId, isActive: true },
    });

    const lastSession = await db.conversationSession.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });

    const totalMessages = await db.conversationMessage.count({
      where: { session: { userId } },
    });

    return {
      totalSessions,
      activeSessions,
      totalMessages,
      lastInteraction:
        lastSession?.updatedAt.toISOString() || new Date().toISOString(),
    };
  }

  async updatePendingAction(
    sessionId: string,
    actionType: ActionType | null,
    pendingData: any
  ): Promise<void> {
    await db.conversationSession.update({
      where: { id: sessionId },
      data: {
        currentAction: actionType || "none",
        pendingData,
        lastInteraction: new Date(),
      },
    });
  }

  async endSession(sessionId: string): Promise<void> {
    await db.conversationSession.update({
      where: { id: sessionId },
      data: { isActive: false, endedAt: new Date() },
    });
  }

  async cleanupOldSessions(timeoutMinutes: number): Promise<number> {
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    const result = await db.conversationSession.updateMany({
      where: {
        isActive: true,
        lastInteraction: { lt: cutoff },
      },
      data: {
        isActive: false,
        endedAt: new Date(),
      },
    });

    return result.count;
  }
}
