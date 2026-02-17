# CLAUDE.md - Alpadev AI Monorepo

## Project Overview

Alpadev AI es un monorepo Turborepo para una plataforma AI de portafolio/agencia con sistema de bookings, facturación, transacciones y newsletter. Construido con Next.js 15, tRPC 11, Prisma 6 + MongoDB, Genkit AI (Mistral + Google AI), Google Calendar, Cloudflare R2 y Three.js para experiencias 3D inmersivas.

## Tech Stack

- **Runtime**: Node.js >= 22, pnpm 10.11.0, Turborepo 2.5.8
- **Frontend**: Next.js 15.0.4, React 18.3.1, TypeScript
- **3D/Animations**: Three.js + @react-three/fiber + @react-three/drei, GSAP, Framer Motion, Lottie (lottie-react)
- **UI**: Tailwind CSS 3.4.17, HeroUI (@heroui/react), OGL
- **API Layer**: tRPC 11.1.2 (server + client), Express 5.1.0 (webhooks)
- **Auth**: NextAuth 5.0.0-beta.22 (frontend) + NextAuth 4.24.11 (auth package), JWT strategy
- **Database**: Prisma 6.15.0 + MongoDB (primary), Mongoose 9.1.5 (secondary/legacy)
- **AI**: Genkit 1.18.0 + genkitx-mistral 0.23.0 + @genkit-ai/googleai 1.18.0
- **Messaging**: Twilio (WhatsApp/SMS)
- **Storage**: AWS S3 SDK / Cloudflare R2
- **Calendar**: Google Calendar API (googleapis)
- **Email**: React Email + Resend
- **Forms**: React Hook Form + Zod
- **Testing**: Playwright 1.57.0 (E2E)
- **CI/CD**: GitHub Actions, Docker multi-stage builds, GHCR
- **Integrations**: Canny (feedback board)

## Monorepo Structure

```
alpadev_ai_monorepo/
├── apps/
│   └── frontend/          # Next.js 15 app (3D portfolio + dashboard)
├── packages/
│   ├── api/               # tRPC routers + Express webhooks + AI prompts
│   ├── auth/              # NextAuth configuration + Prisma adapter
│   ├── configs/           # Shared configurations (Tailwind, TypeScript)
│   ├── db/                # Prisma schema + client + seed
│   ├── email/             # React Email templates + Resend
│   ├── utils/             # Shared utilities
│   ├── validations/       # Zod schemas (single source of truth)
│   └── web3/              # Web3 utilities (if applicable)
├── docker-compose.yml     # frontend + mongo services
├── turbo.json             # Turborepo pipeline config
└── pnpm-workspace.yaml    # Workspace packages definition
```

## Domain Routers (10)

```typescript
// packages/api/src/root.ts
appRouter = {
  user, admin, request, newsletter,
  transaction, bill, invoice,
  cloudflare, booking, calendar
}
```

## Database Models (Prisma + MongoDB)

**Core**: User (GUEST/USER/ADMIN roles), Account, Session, VerificationToken
**Business**: Request, Transaction, Bill, Invoice, Booking, NewsletterSubscriber
**Enums**: Role, RequestType, RequestStatus, RequestPriority, SubscriptionStatus, BillingInterval, Language, TransactionStatus, BillStatus, InvoiceStatus, BookingStatus

## Key Conventions

### API Pattern: Repository → Service → Router
```
packages/api/src/routers/{domain}/
├── {domain}.repository.ts    # Data access (Prisma queries)
├── {domain}.service.ts       # Business logic
├── {domain}.router.ts        # tRPC procedures (public/protected/admin)
└── index.ts                  # Re-exports
```

### tRPC Procedures
- `publicProcedure` — Sin autenticación
- `protectedProcedure` — Requiere sesión JWT válida
- `adminProcedure` — Requiere role === "ADMIN"

### Validations
- Todos los schemas Zod en `@package/validations`
- Compartidos entre frontend (forms) y API (input validation)
- Nunca duplicar schemas — single source of truth

### Prisma + MongoDB
- Usar `@id @default(auto()) @map("_id") @db.ObjectId` para IDs
- Relaciones con `@db.ObjectId` en campos de referencia
- Migrations NO soportadas — usar `pnpm db:push`
- Seed con `pnpm db:seed`

### Mongoose (Secondary)
- Usado para operaciones específicas donde Prisma no alcanza
- Schemas definidos en packages/api o apps/frontend
- Mantener consistencia con los modelos Prisma

### Frontend 3D
- Three.js scenes via @react-three/fiber (R3F)
- Usar `<Canvas>` como contenedor, componentes R3F dentro
- GSAP para animaciones de scroll y timeline
- Framer Motion para transiciones de componentes
- Lottie para micro-animaciones con archivos JSON

### Environment Variables (turbo.json)
```
NEXTAUTH_SECRET, NEXTAUTH_URL
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
MONGODB_URI, DIRECT_URL
RESEND_API_KEY
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
NEXT_PUBLIC_CANNY_BOARD_TOKEN
PASSWORD_PROTECTED
```

## Commands

```bash
pnpm dev          # Dev server (all packages)
pnpm build        # Production build
pnpm lint         # Lint all packages
pnpm db:push      # Push Prisma schema to MongoDB
pnpm db:seed      # Seed database
pnpm db:studio    # Open Prisma Studio
pnpm test:e2e     # Run Playwright E2E tests
```

## Important Rules

1. **Never commit secrets** — Use .env files, never hardcode tokens
2. **Zod is truth** — All validation in @package/validations
3. **Prisma first** — Use Prisma for all new data access; Mongoose only for legacy/specific needs
4. **Type safety end-to-end** — tRPC provides full type inference from router to client
5. **Server components by default** — Use "use client" only when needed (hooks, events, R3F)
6. **Atomic commits** — One feature/fix per commit, conventional commits
7. **No `any`** — Strict TypeScript, infer from Prisma/Zod when possible
