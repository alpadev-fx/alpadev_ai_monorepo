import type {
  ConversationContext,
  ActionType,
  SessionStats,
} from "../service/service.types";

export interface IConversationRepository {
  findActiveSession(userId: string): Promise<ConversationContext | null>;
  createSession(userId: string): Promise<ConversationContext>;
  updateSession(
    sessionId: string,
    data: Partial<ConversationContext>
  ): Promise<void>;
  addMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<void>;
  getHistory(userId: string, limit?: number): Promise<ConversationContext[]>;
  getSessionStats(userId: string): Promise<SessionStats>;
  updatePendingAction(
    sessionId: string,
    actionType: ActionType | null,
    pendingData: any
  ): Promise<void>;
  endSession(sessionId: string): Promise<void>;
  cleanupOldSessions(timeoutMinutes: number): Promise<number>;
}
