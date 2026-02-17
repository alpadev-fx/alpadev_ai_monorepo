import { db } from "@package/db";
import type {
  AIResponse,
  ConversationContext,
  MessageAnalysis,
  ServiceResponse,
  SessionMeta,
  UserContext,
} from "./service.types";
import { AIChatService } from "./ai.service";
import { ConversationManagerService } from "./conversation.service";
import { MessageAnalysisService } from "./analysis.service";

export class ChatbotOrchestrator {
  private aiService: AIChatService;
  private conversationManager: ConversationManagerService;
  private analysisService: MessageAnalysisService;

  constructor() {
    this.aiService = new AIChatService();
    this.conversationManager = new ConversationManagerService();
    this.analysisService = new MessageAnalysisService();
    console.log(`[ChatbotOrchestrator] Orchestrator initialized`);
  }

  /**
   * Main entry point for web chat messages
   */
  public async sendUserMessage(
    userId: string,
    message: string
  ): Promise<ServiceResponse<string>> {
    try {
      console.log(`[ChatbotOrchestrator] === WEB MESSAGE ===`);
      console.log(
        `[ChatbotOrchestrator] UserId: ${userId}, Message: ${message}`
      );

      const userMessage = message?.trim() || "";

      if (!userMessage) {
        return {
          success: true,
          data: "¡Hola! No recibí ningún mensaje. ¿Podrías intentar de nuevo?",
        };
      }

      // Step 1: Get user from DB
      console.log(`[ChatbotOrchestrator] Step 1: Getting user...`);
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        console.log(`[ChatbotOrchestrator] User not found`);
        return {
          success: false,
          error: "Usuario no encontrado.",
        };
      }

      // Step 2: Build user context
      console.log(`[ChatbotOrchestrator] Step 2: Building user context...`);
      const recentRequests = await db.request.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      const userContext: UserContext = {
        user,
        recentRequests,
      };

      // Step 3: Get or create conversation context
      console.log(
        `[ChatbotOrchestrator] Step 3: Getting conversation context...`
      );
      const conversationResult =
        await this.conversationManager.getOrCreateContext(userId);

      if (!conversationResult.success || !conversationResult.data) {
        console.log(
          `[ChatbotOrchestrator] Failed to get conversation context`
        );
        return {
          success: true,
          data: "¡Hola! Tengo problemas con mi memoria. Pero puedo ayudarte igual. ¿Qué necesitas?",
        };
      }

      const conversationContext = conversationResult.data;

      // Step 4: Compute session metadata
      const sessionMeta = this.buildSessionMeta(conversationContext);
      console.log(`[ChatbotOrchestrator] SessionMeta:`, sessionMeta);

      // Step 5: Analyze message intent
      const messageAnalysis = this.analysisService.analyze(userMessage);
      console.log(`[ChatbotOrchestrator] MessageAnalysis:`, messageAnalysis);

      // Step 6: Add user message to conversation history
      await this.conversationManager.addMessage(
        conversationContext.sessionId,
        "user",
        userMessage
      );

      // Step 7: Generate AI response
      console.log(
        `[ChatbotOrchestrator] Step 7: Generating AI response...`
      );

      const aiResponseResult = await this.aiService.generateResponse(
        userMessage,
        userContext,
        conversationContext,
        {
          sessionMeta,
          messageAnalysis,
        }
      );

      if (!aiResponseResult.success || !aiResponseResult.data) {
        console.log(
          `[ChatbotOrchestrator] AI response generation failed`
        );
        const fallbackResponse = this.generateFallbackResponse(
          userContext,
          messageAnalysis,
          sessionMeta
        );

        await this.conversationManager.addMessage(
          conversationContext.sessionId,
          "assistant",
          fallbackResponse
        );

        return {
          success: true,
          data: fallbackResponse,
        };
      }

      const aiResponse = aiResponseResult.data;
      console.log(
        `[ChatbotOrchestrator] AI response generated: ${aiResponse.requiresAction ? "with action" : "no action"}`
      );

      // Step 8: Apply greeting if needed
      let finalResponse = aiResponse.response;
      finalResponse = this.applyGreeting(
        finalResponse,
        sessionMeta,
        userContext
      );

      // Step 9: Handle pending actions
      if (aiResponse.needsMoreInfo) {
        await this.conversationManager.updatePendingAction(
          conversationContext.sessionId,
          aiResponse.actionType,
          aiResponse.actionData
        );
      }

      // Step 10: Store assistant response
      await this.conversationManager.addMessage(
        conversationContext.sessionId,
        "assistant",
        finalResponse
      );

      // Step 11: Periodic cleanup (1% chance)
      if (Math.random() < 0.01) {
        console.log(
          `[ChatbotOrchestrator] Running periodic cleanup...`
        );
        await this.conversationManager.cleanupOldSessions();
      }

      console.log(`[ChatbotOrchestrator] Message processed successfully`);
      return {
        success: true,
        data: finalResponse,
      };
    } catch (error) {
      console.error(`[ChatbotOrchestrator] Unexpected error:`, error);
      return {
        success: true,
        data: "Lo siento, ocurrió un error inesperado. Por favor intenta de nuevo.",
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
      return await this.conversationManager.getConversationHistory(
        userId,
        limit
      );
    } catch (error) {
      console.error(
        `[ChatbotOrchestrator] Error getting conversation history:`,
        error
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Builds session metadata for greeting control
   */
  private buildSessionMeta(
    conversationContext: ConversationContext
  ): SessionMeta {
    const lastInteraction = conversationContext.lastInteraction
      ? new Date(conversationContext.lastInteraction)
      : null;
    const now = new Date();
    const hoursSinceLastInteraction = lastInteraction
      ? (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60)
      : 24;

    const shouldGreet = hoursSinceLastInteraction > 4;
    const hour = now.getHours();
    let greetingPhrase: "Buenos días" | "Buenas tardes" | "Buenas noches" =
      "Buenos días";

    if (hour < 12) greetingPhrase = "Buenos días";
    else if (hour < 18) greetingPhrase = "Buenas tardes";
    else greetingPhrase = "Buenas noches";

    const timePeriod =
      hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

    return {
      shouldGreet,
      greetingPhrase,
      timePeriod,
      conversationHasHistory: !!lastInteraction,
      hoursSinceLastGreeting: hoursSinceLastInteraction,
    };
  }

  /**
   * Applies greeting to response if needed
   */
  private applyGreeting(
    response: string,
    sessionMeta: SessionMeta,
    userContext: UserContext
  ): string {
    if (!sessionMeta.shouldGreet) return response;

    const name = userContext.user.name.split(" ")[0]; // First name only
    return `${sessionMeta.greetingPhrase} ${name}. ${response}`;
  }

  /**
   * Generates a fallback response when AI fails
   */
  private generateFallbackResponse(
    userContext: UserContext | null,
    messageAnalysis: MessageAnalysis,
    sessionMeta: SessionMeta
  ): string {
    let response: string;

    switch (messageAnalysis.intent) {
      case "booking_request":
        response =
          "Puedes agendar una reunión directamente desde nuestra web o escribiéndonos por WhatsApp. ¿Te comparto el link?";
        break;
      case "pricing_inquiry":
        response =
          "Los precios dependen del alcance del proyecto. ¿Te gustaría que agendemos una llamada para hacer una cotización personalizada?";
        break;
      case "software_inquiry":
        response =
          "Desarrollamos soluciones a medida con las últimas tecnologías. ¿Cuéntame más sobre tu proyecto para darte orientación?";
        break;
      case "marketing_inquiry":
        response =
          "Ofrecemos servicios completos de marketing digital: SEO, SEM, redes sociales y growth hacking. ¿Qué necesitas específicamente?";
        break;
      case "finance_inquiry":
        response =
          "Tenemos experiencia en blockchain, Web3 y soluciones fintech. ¿Cuéntame más sobre lo que buscas?";
        break;
      case "support_request":
        response =
          "Entiendo que necesitas ayuda. Voy a crear un ticket de soporte. ¿Podrías describir el problema con más detalle?";
        break;
      case "greeting":
        response =
          "¡Hola! Soy el asistente de Alpadev. Puedo ayudarte con información sobre nuestros servicios, agendar reuniones o crear cotizaciones. ¿En qué te puedo ayudar?";
        break;
      default:
        response =
          "No entendí tu solicitud. ¿Podrías reformular? Puedo ayudarte con servicios de software, marketing, Web3, agendar reuniones o cotizaciones.";
    }

    if (
      userContext &&
      sessionMeta.shouldGreet
    ) {
      const name = userContext.user.name.split(" ")[0];
      response = `${sessionMeta.greetingPhrase} ${name}. ${response}`;
    }

    return response;
  }
}
