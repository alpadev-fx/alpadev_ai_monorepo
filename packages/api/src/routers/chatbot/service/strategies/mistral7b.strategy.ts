import type { AIAttempt, IGenerativeAIStrategy } from "../service.types";
import { ai } from "../../../../config/ai.config";

export class Mistral7BStrategy implements IGenerativeAIStrategy {
  public modelName = "mistral-7b";
  public weight = 1.0;

  public async generate(prompt: string): Promise<AIAttempt> {
    const startTime = Date.now();
    try {
      const response = await ai.generate({
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
        `[Mistral7BStrategy] Failed (${executionTime}ms):`,
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
