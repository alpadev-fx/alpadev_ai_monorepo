# Debug Service — Alpadev AI

Diagnostica y resuelve problemas en un servicio/router del monorepo.

## Input
- `$ARGUMENTS` — Descripción del problema o nombre del servicio a debuggear

## Steps

1. **Identificar el servicio afectado**
   - Parsear `$ARGUMENTS` para identificar dominio/package
   - Localizar archivos relevantes en `packages/api/src/routers/{dominio}/`

2. **Revisar la cadena completa**
   - Router: ¿Procedure correcto? ¿Auth level?
   - Service: ¿Lógica de negocio correcta? ¿Error handling?
   - Repository: ¿Query Prisma/Mongoose correcta?
   - Validation: ¿Schema Zod correcto en @package/validations?

3. **Verificar tipos**
   ```bash
   pnpm build --filter=@package/api 2>&1 | head -50
   ```

4. **Revisar Prisma schema**
   - Modelo existe y tiene los campos esperados
   - Relaciones correctas con @db.ObjectId
   - Indexes definidos para queries usadas

5. **Check external integrations** (si aplica)
   - Google Calendar: ¿Token válido? ¿Permisos?
   - Twilio: ¿Credentials correctos? ¿Webhook URL?
   - Cloudflare R2: ¿Bucket config? ¿CORS?
   - Genkit AI: ¿API keys? ¿Model disponible?
   - Resend: ¿API key? ¿Domain verificado?

6. **Revisar logs**
   - Buscar errores recientes en output
   - Check console.error patterns

7. **Test isolation**
   - Reproducir el error con minimal input
   - Test unitario para el caso específico

8. **Proponer fix**
   - Identificar root cause
   - Implementar solución
   - Verificar que compila y tests pasan

## Common Issues

### tRPC
- `UNAUTHORIZED`: Session no incluida en context
- `BAD_REQUEST`: Schema Zod no coincide con input
- `NOT_FOUND`: Query no encuentra registro (check ObjectId format)
- `INTERNAL_SERVER_ERROR`: Error no capturado en service

### Prisma
- Connection timeout: Check MONGODB_URI
- Unique constraint: Registro duplicado
- Field not found: Schema desactualizado (run `pnpm db:push`)

### Mongoose
- Timeout: Connection string incorrecta
- Validation error: Schema Mongoose desalineado con Prisma
- Cast error: ObjectId inválido

### Three.js/R3F
- Memory leak: Falta dispose() en cleanup
- SSR error: R3F importado en Server Component
- Performance: Too many draw calls en scene
