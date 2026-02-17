# Infrastructure Rules — Alpadev AI

## Docker

### docker-compose.yml
- **frontend**: Next.js app (standalone output)
- **mongo**: MongoDB instance for development

### Multi-stage Build
```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
# Install dependencies with pnpm

# Stage 2: Build
FROM node:22-alpine AS builder
# Build with Turborepo

# Stage 3: Production
FROM node:22-alpine AS runner
# Copy standalone output, minimal image
```

### Reglas Docker
- No incluir `.env` en la imagen — usar env vars en runtime
- Multi-stage builds para imágenes mínimas
- `.dockerignore` actualizado (node_modules, .git, .env)
- Usar `node:22-alpine` como base (match Node >= 22 requirement)
- `COPY --from=builder` solo archivos necesarios

## CI/CD (GitHub Actions)

### Pipeline: `.github/workflows/deploy.yml`
1. **paths-filter**: Detecta qué packages cambiaron
2. **Build**: Docker build con cache de layers
3. **Push**: Imagen a `ghcr.io` (GitHub Container Registry)
4. **Deploy**: Trigger deployment

### Reglas CI/CD
- Secrets en GitHub Secrets, nunca en workflow files
- Build cache para acelerar CI
- Lint y type-check antes de build
- Tests antes de deploy
- Tag images con commit SHA y `latest`

## Turborepo Pipeline

```json
// turbo.json
{
  "globalEnv": [
    "NEXTAUTH_SECRET", "NEXTAUTH_URL",
    "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
    "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET",
    "MONGODB_URI", "DIRECT_URL",
    "RESEND_API_KEY",
    "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN",
    "NEXT_PUBLIC_CANNY_BOARD_TOKEN",
    "PASSWORD_PROTECTED"
  ]
}
```

### Reglas Turborepo
- Agregar nuevas env vars a `globalEnv` en turbo.json
- Respetar task dependencies: `build` depende de `^build`
- Cache: Turborepo cachea outputs — asegurar que `outputs` esté configurado
- `turbo run dev` para desarrollo, `turbo run build` para producción

## Cloudflare R2

- SDK: AWS S3 compatible (`@aws-sdk/client-s3`)
- Pre-signed URLs para uploads directos desde frontend
- Bucket configuration via env vars
- CORS configurado en Cloudflare dashboard

## Google Calendar

- OAuth2 tokens para acceso a calendar
- Service account para operaciones server-side
- googleapis SDK para CRUD de eventos
- Sync bidireccional con sistema de bookings

## Monitoring

- Structured logging (JSON format en producción)
- Error tracking en endpoints críticos
- Health check endpoint para Docker/K8s
- AI token usage monitoring
