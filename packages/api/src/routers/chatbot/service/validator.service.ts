import { AIActionResponseSchema } from "@package/validations";
import type { AIActionResponse } from "@package/validations";

type ScoredResponse = {
  valid: boolean;
  score: number;
  data: AIActionResponse | null;
  error?: string;
  model: string;
};

export class AIResponseValidator {
  /**
   * Validates and scores an AI response against the schema
   */
  public validateAndScore(
    rawResponse: any,
    modelName: string,
    config: { weight: number }
  ): ScoredResponse {
    const parseResult = AIActionResponseSchema.safeParse(rawResponse);

    if (!parseResult.success) {
      console.warn(
        `[AIResponseValidator] ${modelName} failed schema validation:`,
        parseResult.error.message
      );
      return {
        valid: false,
        score: 0,
        data: null,
        error: "Schema validation failed",
        model: modelName,
      };
    }

    const data = parseResult.data;
    let score = config.weight;

    // Penalty: Incomplete information
    if (data.needsMoreInfo) {
      score -= 0.2;
    }

    // Boost: Actionable response
    if (data.requiresAction && data.actionType !== "none") {
      score += 0.1;
    }

    // Penalty: Very short response (potential hallucination)
    if (data.response.length < 10) {
      score -= 0.1;
    }

    // Cap score between 0 and 1.5
    score = Math.max(0, Math.min(score, 1.5));

    console.log(
      `[AIResponseValidator] ${modelName} valid. Score: ${score.toFixed(2)}`
    );

    return {
      valid: true,
      score,
      data,
      model: modelName,
    };
  }
}
