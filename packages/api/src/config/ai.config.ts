import { genkit } from "genkit"
import mistralPlugin, { openMistral7B, openMistralNemo } from "genkitx-mistral"

// Primary AI instance with Mistral
export const ai = genkit({
  plugins: [mistralPlugin({ apiKey: process.env.MISTRAL_API_KEY })],
  model: openMistral7B,
})

// Fallback AI instance with Claude Haiku 3.5
export const aiFallback = genkit({
  plugins: [mistralPlugin({ apiKey: process.env.MISTRAL_API_KEY })],
  model: openMistralNemo,
})

// Model types for better type safety
export type AIModel = "mistral" | "mistral-nemo"

export interface AIConfig {
  maxOutputTokens: number
  stopSequences: string[]
  temperature: number
  topP: number
  topK: number
  timeout: number
}
