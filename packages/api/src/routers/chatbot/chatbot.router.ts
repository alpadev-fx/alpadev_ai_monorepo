import {
  SendMessageSchema,
  GetConversationHistorySchema,
} from "@package/validations";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";
import { ChatbotOrchestrator } from "./service/orchestrator.service";

const orchestrator = new ChatbotOrchestrator();

export const chatbotRouter = createTRPCRouter({
  /**
   * Send a message to the chatbot (requires authentication)
   * Processes message synchronously and returns AI response
   */
  sendMessage: protectedProcedure
    .input(SendMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id;

      const response = await orchestrator.sendUserMessage(
        userId,
        input.message
      );

      if (!response.success) {
        return {
          success: false,
          message:
            response.error ||
            "Error procesando tu mensaje. Intenta de nuevo.",
        };
      }

      return {
        success: true,
        message: response.data || "¿En qué puedo ayudarte?",
      };
    }),

  /**
   * Send a message as a guest (public, no auth required)
   * Limited functionality for unauthenticated users
   */
  sendGuestMessage: publicProcedure
    .input(SendMessageSchema)
    .mutation(async ({ input }) => {
      // For guest users, we use a simplified response without user context
      const orchestratorInstance = new ChatbotOrchestrator();

      // Create a temporary guest flow
      try {
        const { AIChatService } = await import(
          "./service/ai.service"
        );
        const aiService = new AIChatService();

        const { MessageAnalysisService } = await import(
          "./service/analysis.service"
        );
        const analysisService = new MessageAnalysisService();

        const analysis = analysisService.analyze(input.message);

        const aiResponse = await aiService.generateResponse(
          input.message,
          null, // No user context for guests
          undefined,
          {
            messageAnalysis: analysis,
          }
        );

        if (aiResponse.success && aiResponse.data) {
          return {
            success: true,
            message: aiResponse.data.response,
          };
        }

        // Fallback based on intent
        let fallbackMessage: string;
        switch (analysis.intent) {
          case "booking_request":
            fallbackMessage =
              "To schedule a meeting with our team, sign up or reach us on WhatsApp: https://wa.link/n2uk0s";
            break;
          case "pricing_inquiry":
            fallbackMessage =
              "Pricing depends on your project scope and requirements. Contact us for a custom quote: https://wa.link/n2uk0s";
            break;
          default:
            fallbackMessage =
              "Hey! I'm the Alpadev AI assistant. We build custom software solutions — web apps, mobile apps, SaaS platforms, and more. How can I help you today?";
        }

        return {
          success: true,
          message: fallbackMessage,
        };
      } catch (error) {
        console.error(
          `[ChatbotRouter] Guest message error:`,
          error
        );
        return {
          success: true,
          message:
            "Hey! I'm the Alpadev AI assistant. We specialize in custom software development. Reach us on WhatsApp for more info: https://wa.link/n2uk0s",
        };
      }
    }),

  /**
   * Get conversation history for the authenticated user
   */
  getConversationHistory: protectedProcedure
    .input(GetConversationHistorySchema)
    .query(async ({ ctx, input }) => {
      const targetUserId = input.userId || ctx.session?.user.id;

      if (!targetUserId) {
        throw new Error("User ID required");
      }

      return await orchestrator.getConversationHistory(
        targetUserId,
        input.limit
      );
    }),
});
