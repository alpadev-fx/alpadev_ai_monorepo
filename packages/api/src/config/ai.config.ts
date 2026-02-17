import { genkit } from "genkit"
import { googleAI, gemini20Flash } from "@genkit-ai/googleai"
import * as deepseekPkg from "genkitx-deepseek"
import mistralPlugin, { openMistral7B, openMistralNemo } from "genkitx-mistral"

/* eslint-disable @typescript-eslint/no-explicit-any */
const deepseek =
  (deepseekPkg as any).deepseek ||
  (deepseekPkg as any).default ||
  deepseekPkg
const deepseekChat =
  (deepseekPkg as any).deepseekChat ||
  (deepseekPkg as any).default?.deepseekChat
/* eslint-enable @typescript-eslint/no-explicit-any */

// Startup validation: warn about missing API keys
const AI_KEYS = {
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
  GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
} as const;

const missingKeys = Object.entries(AI_KEYS)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missingKeys.length > 0) {
  console.warn(
    `[AI Config] Missing API keys: ${missingKeys.join(", ")}. Chatbot will use fallback responses only.`
  );
}

/**
 * 1. PRIMARY: Mistral 7B
 * Fast, cost-effective primary model.
 * Requires: MISTRAL_API_KEY
 */
export const ai = genkit({
  plugins: [mistralPlugin({ apiKey: process.env.MISTRAL_API_KEY })],
  model: openMistral7B,
})

/**
 * 2. FIRST FALLBACK: Mistral Nemo
 * Lightweight 12B model, very fast.
 * Requires: MISTRAL_API_KEY
 */
export const aiFallback = genkit({
  plugins: [mistralPlugin({ apiKey: process.env.MISTRAL_API_KEY })],
  model: openMistralNemo,
})

/**
 * 3. DeepSeek V2.5
 * High reasoning capability model.
 * Requires: DEEPSEEK_API_KEY
 */
export const aiDeepSeek = genkit({
  plugins: [deepseek({ apiKey: process.env.DEEPSEEK_API_KEY })],
  model: deepseekChat,
})

/**
 * 4. Gemini Flash 2.0
 * Google's fast multimodal model.
 * Requires: GOOGLE_AI_API_KEY
 * Currently disabled in the waterfall (quota issue) — instance kept for future re-enable.
 */
export const aiGemini = process.env.GOOGLE_AI_API_KEY
  ? genkit({
      plugins: [googleAI({ apiKey: process.env.GOOGLE_AI_API_KEY })],
      model: gemini20Flash,
    })
  : null

// Model types for better type safety
export type AIModel = "mistral-7b" | "mistral-nemo" | "deepseek-chat" | "gemini-flash"

export interface AIConfig {
  maxOutputTokens: number
  stopSequences: string[]
  temperature: number
  topP: number
  topK: number
  timeout: number
}
