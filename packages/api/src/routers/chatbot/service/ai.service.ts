import { getChatbotSystemPrompt } from "../../../prompts/chatbot.prompt";
import { AIResponseValidator } from "./validator.service";
import { DeepSeekStrategy } from "./strategies/deepseek.strategy";
import { GeminiStrategy } from "./strategies/gemini.strategy";
import { Mistral7BStrategy } from "./strategies/mistral7b.strategy";
import { MistralNemoStrategy } from "./strategies/mistralNemo.strategy";
import type {
  AIResponse,
  ChatbotConfig,
  ConversationContext,
  IGenerativeAIStrategy,
  MessageAnalysis,
  ServiceResponse,
  SessionMeta,
  UserContext,
  ActionType,
} from "./service.types";

const ALLOWED_ACTIONS: ActionType[] = [
  "schedule_meeting",
  "submit_request",
  "get_services_info",
  "get_pricing",
  "general_info",
  "escalate_to_human",
  "none",
];

const MAX_RESPONSE_CHAR_LENGTH = 600;

export class AIChatService {
  private systemPrompt: string;
  private config: ChatbotConfig;
  private strategies: IGenerativeAIStrategy[];
  private validator: AIResponseValidator;

  constructor() {
    this.systemPrompt = getChatbotSystemPrompt();
    this.validator = new AIResponseValidator();
    // Waterfall order: DeepSeek → Mistral 7B → Mistral Nemo
    // NOTE: Gemini disabled (quota issue) — re-enable by adding `new GeminiStrategy()` after DeepSeek
    this.strategies = [
      new DeepSeekStrategy(),
      new Mistral7BStrategy(),
      new MistralNemoStrategy(),
    ];
    this.config = {
      websiteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://alpadev.xyz",
      contactEmail: process.env.CONTACT_EMAIL || "noreply@alpadev.xyz",
      contactPhone: process.env.CONTACT_PHONE || "+573205890433",
      whatsappUrl: "https://wa.link/n2uk0s",
      maxMessageLength: 2000,
      sessionTimeout: 30,
    };
  }

  /**
   * Generates AI response using waterfall strategy (Mistral 7B → Mistral Nemo)
   */
  public async generateResponse(
    userMessage: string,
    userContext: UserContext | null,
    conversationContext?: ConversationContext,
    options: {
      sessionMeta?: SessionMeta;
      messageAnalysis?: MessageAnalysis;
    } = {}
  ): Promise<ServiceResponse<AIResponse>> {
    try {
      console.log(`[AIChatService] === GENERATE RESPONSE ===`);
      console.log(
        `[AIChatService] UserMessage: ${userMessage.substring(0, 100)}...`
      );

      if (userMessage.length > this.config.maxMessageLength) {
        return {
          success: true,
          data: this.createSimpleResponse(
            "Tu mensaje es muy largo. Por favor envía uno más corto."
          ),
        };
      }

      const prompt = this.buildPrompt(
        userMessage,
        userContext,
        conversationContext,
        options.sessionMeta,
        options.messageAnalysis
      );

      // --- WATERFALL EXECUTION ---
      console.log(
        `[AIChatService] Starting waterfall with ${this.strategies.length} strategies...`
      );

      for (const strategy of this.strategies) {
        try {
          console.log(
            `[AIChatService] Attempting strategy: ${strategy.modelName}...`
          );
          const attempt = await strategy.generate(prompt);

          if (attempt.success && attempt.response) {
            console.log(
              `[AIChatService] ${strategy.modelName} generated (${attempt.executionTime}ms). Validating...`
            );

            const parsed = this.parseResponse(attempt.response);
            const scored = this.validator.validateAndScore(
              parsed,
              strategy.modelName,
              { weight: strategy.weight }
            );

            if (scored.valid && scored.data) {
              console.log(
                `[AIChatService] Accepted response from ${strategy.modelName} (Score: ${scored.score.toFixed(2)})`
              );
              return { success: true, data: scored.data as AIResponse };
            } else {
              console.warn(
                `[AIChatService] Response from ${strategy.modelName} invalid. Reason: ${scored.error || "Unknown"}. Falling back...`
              );
            }
          } else {
            console.warn(
              `[AIChatService] Strategy ${strategy.modelName} failed. Error: ${attempt.error}`
            );
          }
        } catch (strategyError) {
          console.warn(
            `[AIChatService] Exception in strategy ${strategy.modelName}:`,
            strategyError
          );
        }
      }

      console.log(
        `[AIChatService] All waterfall strategies failed`
      );
      return {
        success: false,
        error: "AI_UNAVAILABLE_ALL_MODELS",
      };
    } catch (error) {
      console.error(`[AIChatService] Error in generateResponse:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "AI_CRITICAL_ERROR",
      };
    }
  }

  public createSimpleResponse(text: string): AIResponse {
    return {
      messageType: "text",
      response: text,
      requiresAction: false,
      actionType: "none",
      actionData: {},
      nextSteps: [],
      needsMoreInfo: false,
      missingInfo: [],
    };
  }

  public buildPrompt(
    userMessage: string,
    userContext: UserContext | null,
    conversationContext?: ConversationContext,
    sessionMeta?: SessionMeta,
    messageAnalysis?: MessageAnalysis
  ): string {
    let prompt = this.systemPrompt + "\n\n";

    if (userContext) {
      prompt += `## CONTEXTO DEL USUARIO:\n\`\`\`json\n${JSON.stringify(
        {
          user: {
            name: userContext.user.name,
            email: userContext.user.email,
            role: userContext.user.role,
          },
          recentRequests: userContext.recentRequests.slice(0, 3).map((r) => ({
            type: r.type,
            title: r.title,
            status: r.status,
          })),
        },
        null,
        2
      )}\n\`\`\`\n\n`;
    }

    if (conversationContext && conversationContext.messages.length > 0) {
      prompt += `## HISTORIAL:\n`;
      conversationContext.messages.slice(-5).forEach((msg) => {
        prompt += `${msg.role.toUpperCase()}: ${msg.content}\n`;
      });
      if (
        conversationContext.currentAction &&
        conversationContext.pendingData
      ) {
        prompt += `\n[ACCIÓN PENDIENTE: ${conversationContext.currentAction} - Datos: ${JSON.stringify(conversationContext.pendingData)}]\n`;
      }
      prompt += "\n";
    }

    if (sessionMeta)
      prompt += `## META SESIÓN:\n\`\`\`json\n${JSON.stringify(sessionMeta)}\n\`\`\`\n\n`;
    if (messageAnalysis)
      prompt += `## ANÁLISIS MENSAJE:\n\`\`\`json\n${JSON.stringify(messageAnalysis)}\n\`\`\`\n\n`;

    prompt += `## MENSAJE ACTUAL:\n"${userMessage}"\n\n`;
    prompt += `## CONFIG:\nWeb: ${this.config.websiteUrl}\nEmail: ${this.config.contactEmail}\nWhatsApp: ${this.config.whatsappUrl}\n\n`;
    prompt += `RECUERDA: Responde SOLO con el JSON especificado.`;

    return prompt;
  }

  private parseResponse(rawText: string): AIResponse {
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log(`[AIChatService] No JSON found, fallback parse`);
        return this.createFallbackResponse(rawText);
      }
      const parsed = JSON.parse(jsonMatch[0]);

      const response: AIResponse = {
        messageType: parsed.messageType || "text",
        response:
          parsed.response || "Lo siento, no pude procesar tu mensaje.",
        requiresAction: Boolean(parsed.requiresAction),
        actionType: parsed.actionType || "none",
        actionData: parsed.actionData || {},
        nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
        needsMoreInfo: Boolean(parsed.needsMoreInfo),
        missingInfo: Array.isArray(parsed.missingInfo)
          ? parsed.missingInfo
          : [],
      };

      return this.enforceResponseGuards(response);
    } catch (error) {
      console.error(`[AIChatService] JSON Parse Error`);
      return this.createFallbackResponse(rawText);
    }
  }

  private createFallbackResponse(rawText: string): AIResponse {
    let responseText = rawText
      .replace(/^(Aquí está|Here is|Response:)/i, "")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    if (responseText.length > 500)
      responseText = responseText.substring(0, 497) + "...";
    if (!responseText || responseText.length < 5)
      responseText = "¡Hola! ¿En qué puedo ayudarte hoy?";

    return this.enforceResponseGuards({
      messageType: "text",
      response: responseText,
      requiresAction: false,
      actionType: "none",
      actionData: {},
      nextSteps: ["general_info"],
      needsMoreInfo: false,
      missingInfo: [],
    });
  }

  private enforceResponseGuards(response: AIResponse): AIResponse {
    const guarded: AIResponse = { ...response };
    if (!ALLOWED_ACTIONS.includes(guarded.actionType)) {
      guarded.actionType = "none";
      guarded.requiresAction = false;
    }
    guarded.response = this.sanitizeResponseText(guarded.response);
    return guarded;
  }

  private sanitizeResponseText(text: string): string {
    if (!text) return "¡Hola! ¿En qué puedo ayudarte?";
    let sanitized = text.trim();
    const lines = sanitized
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);
    if (lines.length > 8) sanitized = lines.slice(0, 8).join("\n") + "\n...";
    if (sanitized.length > MAX_RESPONSE_CHAR_LENGTH)
      sanitized =
        sanitized.slice(0, MAX_RESPONSE_CHAR_LENGTH - 3) + "...";
    return sanitized;
  }

  public getConfig(): ChatbotConfig {
    return this.config;
  }

  public updateConfig(newConfig: Partial<ChatbotConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
