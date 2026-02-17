import type { AIAttempt, IGenerativeAIStrategy } from "../service.types";
import { aiGemini } from "../../../../config/ai.config";

export class GeminiStrategy implements IGenerativeAIStrategy {
  public modelName = "gemini-flash";
  public weight = 1.0;

  public async generate(prompt: string): Promise<AIAttempt> {
    const startTime = Date.now();
    try {
      if (!aiGemini) {
        return {
          model: this.modelName,
          success: false,
          error: "Gemini disabled (no GOOGLE_AI_API_KEY)",
          executionTime: Date.now() - startTime,
        };
      }

      const response = await aiGemini.generate({
        prompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      });

      const executionTime = Date.now() - startTime;
      const responseText = response.text;

      if (!responseText) {
        return {
          model: this.modelName,
          success: false,
          error: "Empty response from AI",
          executionTime,
        };
      }

      return {
        model: this.modelName,
        success: true,
        response: responseText,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.warn(
        `[GeminiStrategy] Failed (${executionTime}ms):`,
        error instanceof Error ? error.message : "Unknown"
      );
      return {
        model: this.modelName,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        executionTime,
      };
    }
  }
}
