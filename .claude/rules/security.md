# Security Rules — Alpadev AI

## Authentication (NextAuth v5-beta)

### JWT Strategy
- Tokens firmados con NEXTAUTH_SECRET
- Session data: `{ user: { id, role, email, name, image } }`
- Token refresh manejado por NextAuth automáticamente

### OAuth Providers
- Google: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- GitHub: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
- Redirect URIs configurados en provider consoles

### Authorization Levels
```typescript
publicProcedure    // Sin auth — contenido público
protectedProcedure // Session JWT válida — usuarios autenticados
adminProcedure     // Session + role === "ADMIN" — administradores
```

## Reglas de Seguridad

### Secrets
- Nunca hardcodear tokens, API keys o secrets
- Todos los secrets en `.env` (no en `.env.example` con valores reales)
- Variables con `NEXT_PUBLIC_` son expuestas al cliente — solo para valores no sensibles
- Rotar NEXTAUTH_SECRET periódicamente

### Input Validation
- Todo input validado con Zod ANTES de procesamiento
- Sanitizar HTML en inputs de texto para prevenir XSS
- Validar formato ObjectId antes de queries a MongoDB
- File uploads: validar MIME type, extensión y tamaño server-side

### API Security
- CORS configurado restrictivamente en Express webhooks
- Rate limiting en endpoints públicos y AI
- No exponer stack traces en errores de producción
- Logging de errores sin datos sensibles

### Database
- Prisma usa parameterized queries (safe por defecto)
- Mongoose: NUNCA construir queries con string concatenation
- Validar que el usuario tiene permisos sobre el recurso que accede
- No exponer IDs internos innecesariamente

### Storage (Cloudflare R2)
- Pre-signed URLs con expiration corta (< 1 hora)
- Validar Content-Type server-side, no confiar en client headers
- Limitar tamaño de archivos (server-side enforcement)
- No permitir path traversal en nombres de archivo

### AI (Genkit)
- API keys de Mistral/Google AI solo en server-side
- Sanitizar user input antes de pasar a prompts
- Rate limit en endpoints AI
- No exponer system prompts al cliente
- Validar/sanitizar output de AI antes de retornar

### Webhooks (Express)
- Verificar firma de Twilio en requests entrantes
- Autenticación en webhook endpoints
- Idempotency para prevenir procesamiento duplicado
- Timeout handling en webhook processing

### External APIs
- Google Calendar: tokens OAuth almacenados seguramente
- Twilio: Account SID y Auth Token solo server-side
- Resend: API key solo server-side
- Canny: Board token es público (NEXT_PUBLIC_), pero no exponer tokens admin

## Checklist Pre-Deploy
- [ ] Sin secrets en código fuente
- [ ] .env no incluido en Docker image
- [ ] HTTPS enforced
- [ ] CORS configurado
- [ ] Rate limiting activo
- [ ] Error responses sin stack traces
- [ ] Logging configurado sin PII
