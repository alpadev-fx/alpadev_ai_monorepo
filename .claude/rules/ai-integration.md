# AI Integration Rules — Alpadev AI (Genkit)

## Stack AI

- **Framework**: Genkit 1.18.0
- **Providers**: genkitx-mistral 0.23.0, @genkit-ai/googleai 1.18.0
- **Config**: `packages/api/src/config/ai.config.ts`
- **Prompts**: `packages/api/src/prompts/`

## Arquitectura

```
packages/api/src/
├── config/
│   └── ai.config.ts        # Genkit initialization, model config
├── prompts/
│   ├── {domain}.prompt.ts   # Prompt templates per domain
│   └── index.ts             # Re-exports
└── routers/
    └── {domain}/
        └── {domain}.service.ts  # AI calls in service layer
```

## Genkit Patterns

### Configuration
```typescript
// ai.config.ts
import { genkit } from 'genkit'
import { mistral } from 'genkitx-mistral'
import { googleAI } from '@genkit-ai/googleai'

export const ai = genkit({
  plugins: [mistral(), googleAI()],
  // model config...
})
```

### Prompt Definition
```typescript
// prompts/booking.prompt.ts
export const bookingAssistantPrompt = ai.definePrompt({
  name: 'bookingAssistant',
  input: { schema: z.object({ userMessage: z.string(), context: z.string() }) },
  output: { schema: z.object({ response: z.string(), suggestedAction: z.string().optional() }) },
  // prompt template...
})
```

### Flow Definition
```typescript
// Genkit flows for complex AI operations
export const analyzeRequestFlow = ai.defineFlow({
  name: 'analyzeRequest',
  inputSchema: z.object({ requestId: z.string(), description: z.string() }),
  outputSchema: z.object({ category: z.string(), priority: z.string(), summary: z.string() }),
  async (input) => {
    // AI processing logic
  },
})
```

## Reglas

1. **Prompts como templates** — definir en `packages/api/src/prompts/`, no inline en services
2. **Zod para input/output** — schemas tipados para todos los prompts y flows
3. **API keys server-only** — MISTRAL_API_KEY, GOOGLE_GENAI_API_KEY nunca en frontend
4. **Rate limiting** — implementar en tRPC middleware para endpoints AI
5. **Input sanitization** — limpiar input del usuario antes de pasar al prompt
6. **Output validation** — validar respuesta AI con Zod antes de retornar al cliente
7. **Error handling** — catch errores de API providers, retornar fallback graceful
8. **No system prompt leaks** — nunca exponer system prompts en responses
9. **Logging** — log prompts y responses para auditoría (sin PII)
10. **Model selection** — Mistral para tasks generales, Google AI para tasks específicas

## Testing AI

```typescript
// Mock Genkit en tests
vi.mock('../config/ai.config', () => ({
  ai: {
    definePrompt: vi.fn(),
    defineFlow: vi.fn(),
    generate: vi.fn().mockResolvedValue({ text: 'mocked response' }),
  },
}))
```

## Cost Management
- Usar modelos más pequeños para clasificación/categorización
- Cache responses para queries repetitivas
- Batch requests cuando sea posible
- Monitor token usage por endpoint
