import type {
  ActionType,
  ConversationContext,
  ServiceResponse,
  SessionStats,
} from "./service.types";
import { ConversationRepository } from "../repository/conversation.repository";

export class ConversationManagerService {
  private readonly SESSION_TIMEOUT_MINUTES = 30;
  private readonly TEMP_SESSION_MEMORY_LIMIT = 20;
  private tempSessions = new Map<string, ConversationContext>();
  private conversationRepo: ConversationRepository;

  constructor() {
    this.conversationRepo = new ConversationRepository();
  }

  private getTempSessionId(userId: string) {
    return `temp_${userId}`;
  }

  /**
   * Gets or creates a conversation context for a user
   */
  public async getOrCreateContext(
    userId: string
  ): Promise<ServiceResponse<ConversationContext>> {
    try {
      console.log(`[ConversationManager] === GET OR CREATE CONTEXT ===`);
      console.log(`[ConversationManager] UserId: ${userId}`);

      // Check temp session first (fallback mechanism)
      const tempSessionId = this.getTempSessionId(userId);
      const existingTemp = this.tempSessions.get(tempSessionId);
      if (existingTemp) {
        existingTemp.lastInteraction = new Date().toISOString();
        console.log(`[ConversationManager] Reusing temp session`);
        return { success: true, data: existingTemp };
      }

      try {
        let context =
          await this.conversationRepo.findActiveSession(userId);

        if (context) {
          // Check timeout
          const lastInteraction = new Date(context.lastInteraction || 0);
          const timeoutDate = new Date(
            Date.now() - this.SESSION_TIMEOUT_MINUTES * 60 * 1000
          );

          if (lastInteraction < timeoutDate) {
            console.log(`[ConversationManager] Session expired, closing...`);
            await this.conversationRepo.endSession(context.sessionId);
            context = null;
          } else {
            await this.conversationRepo.updateSession(context.sessionId, {});
            console.log(`[ConversationManager] Active session found`);
            return { success: true, data: context };
          }
        }

        // Create new session
        const newContext = await this.conversationRepo.createSession(userId);
        console.log(`[ConversationManager] New session created`);
        return { success: true, data: newContext };
      } catch (dbError) {
        console.error(
          `[ConversationManager] Database error, using fallback:`,
          dbError
        );
        throw dbError;
      }
    } catch (error) {
      console.error(
        `[ConversationManager] Error (Database unavailable):`,
        error
      );

      // Return a temporary context as fallback
      const tempSessionId = this.getTempSessionId(userId);
      const tempContext: ConversationContext = {
        userId,
        sessionId: tempSessionId,
        messages: [],
        lastInteraction: new Date().toISOString(),
      };

      this.tempSessions.set(tempSessionId, tempContext);
      return { success: true, data: tempContext };
    }
  }

  /**
   * Adds a message to the conversation
   */
  public async addMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<ServiceResponse<void>> {
    try {
      // Temp session
      if (sessionId.startsWith("temp_")) {
        const tempSession = this.tempSessions.get(sessionId);
        if (tempSession) {
          const timestamp = new Date().toISOString();
          tempSession.messages = [
            ...tempSession.messages,
            { role, content, timestamp },
          ].slice(-this.TEMP_SESSION_MEMORY_LIMIT);
          tempSession.lastInteraction = timestamp;
          this.tempSessions.set(sessionId, tempSession);
        }
        return { success: true };
      }

      await this.conversationRepo.addMessage(sessionId, role, content);
      await this.conversationRepo.updateSession(sessionId, {});

      return { success: true };
    } catch (error) {
      console.error(`[ConversationManager] Error adding message:`, error);
      return { success: true }; // Fail open
    }
  }

  /**
   * Updates pending action data for a session
   */
  public async updatePendingAction(
    sessionId: string,
    actionType: ActionType,
    pendingData: Record<string, any>
  ): Promise<ServiceResponse<void>> {
    try {
      if (sessionId.startsWith("temp_")) {
        const tempSession = this.tempSessions.get(sessionId);
        if (tempSession) {
          tempSession.currentAction = actionType;
          tempSession.pendingData = pendingData;
          tempSession.lastInteraction = new Date().toISOString();
          this.tempSessions.set(sessionId, tempSession);
        }
        return { success: true };
      }

      await this.conversationRepo.updatePendingAction(
        sessionId,
        actionType,
        pendingData
      );
      return { success: true };
    } catch (error) {
      console.error(
        `[ConversationManager] Error updating pending action:`,
        error
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Clears pending action data for a session
   */
  public async clearPendingAction(
    sessionId: string
  ): Promise<ServiceResponse<void>> {
    try {
      if (sessionId.startsWith("temp_")) {
        const tempSession = this.tempSessions.get(sessionId);
        if (tempSession) {
          tempSession.currentAction = undefined;
          tempSession.pendingData = undefined;
          tempSession.lastInteraction = new Date().toISOString();
          this.tempSessions.set(sessionId, tempSession);
        }
        return { success: true };
      }

      await this.conversationRepo.updatePendingAction(sessionId, null, {});
      return { success: true };
    } catch (error) {
      console.error(
        `[ConversationManager] Error clearing pending action:`,
        error
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Gets conversation history for a user
   */
  public async getConversationHistory(
    userId: string,
    limit: number = 10
  ): Promise<ServiceResponse<ConversationContext[]>> {
    try {
      const history = await this.conversationRepo.getHistory(userId, limit);

      const tempSession = this.tempSessions.get(
        this.getTempSessionId(userId)
      );
      if (tempSession) {
        history.unshift(tempSession);
      }

      return { success: true, data: history };
    } catch (error) {
      console.error(`[ConversationManager] Error getting history:`, error);
      const tempSession = this.tempSessions.get(
        this.getTempSessionId(userId)
      );
      if (tempSession) {
        return { success: true, data: [tempSession] };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Cleans up old inactive sessions
   */
  public async cleanupOldSessions(): Promise<ServiceResponse<number>> {
    try {
      const sevenDaysMinutes = 7 * 24 * 60;
      const cleanedCount =
        await this.conversationRepo.cleanupOldSessions(sevenDaysMinutes);

      // Temp cleanup
      const sevenDaysAgo = new Date(
        Date.now() - sevenDaysMinutes * 60 * 1000
      );
      let tempCleaned = 0;
      for (const [sessionId, session] of this.tempSessions.entries()) {
        if (
          new Date(session.lastInteraction || 0).getTime() <
          sevenDaysAgo.getTime()
        ) {
          this.tempSessions.delete(sessionId);
          tempCleaned += 1;
        }
      }

      return { success: true, data: cleanedCount + tempCleaned };
    } catch (error) {
      console.error(
        `[ConversationManager] Error cleaning up sessions:`,
        error
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
