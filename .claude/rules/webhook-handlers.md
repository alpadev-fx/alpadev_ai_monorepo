# Webhook Handlers Rules — Alpadev AI (Express 5)

## Stack
- **Framework**: Express 5.1.0
- **Location**: `packages/api/src/webhooks/`
- **Purpose**: Receive external service callbacks (Twilio, etc.)

## Estructura

```
packages/api/src/webhooks/
├── twilio.webhook.ts       # Twilio (WhatsApp/SMS) callbacks
├── middleware/
│   └── verify-signature.ts # Webhook signature verification
└── index.ts                # Express router setup
```

## Express Webhook Pattern

```typescript
import express from 'express'
import { verifyTwilioSignature } from './middleware/verify-signature'

const webhookRouter = express.Router()

// Twilio WhatsApp webhook
webhookRouter.post('/twilio/whatsapp',
  verifyTwilioSignature,
  async (req, res) => {
    try {
      const { From, Body, MessageSid } = req.body

      // Process message
      await messageService.handleIncoming({ from: From, body: Body, sid: MessageSid })

      // Respond to Twilio
      res.status(200).type('text/xml').send('<Response/>')
    } catch (error) {
      console.error('Webhook error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)
```

## Reglas

### Signature Verification
```typescript
// ALWAYS verify webhook signatures
import twilio from 'twilio'

export const verifyTwilioSignature = (req, res, next) => {
  const signature = req.headers['x-twilio-signature']
  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    signature,
    webhookUrl,
    req.body
  )
  if (!isValid) return res.status(403).json({ error: 'Invalid signature' })
  next()
}
```

### Idempotency
- Usar MessageSid/EventId como idempotency key
- Check si el webhook ya fue procesado antes de actuar
- Store processed webhook IDs (MongoDB/Redis)

### Error Handling
- Siempre retornar 200 a Twilio (evitar retries infinitos)
- Log errors internamente
- Queue failed operations para retry
- Timeout handling (webhook endpoints deben responder rápido)

### Security
1. Verificar firma de cada request
2. CORS restrictivo (solo orígenes de Twilio)
3. Rate limiting en webhook endpoints
4. No exponer detalles de error al caller
5. Validar payload antes de procesar

### Separation from tRPC
- Webhooks Express viven separados de tRPC routers
- No mezclar Express middleware con tRPC middleware
- Webhooks pueden llamar a services del API package
- Express y tRPC corren en el mismo server pero rutas separadas
