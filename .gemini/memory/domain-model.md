# Domain Model & Business Logic

## Core Entities
- **User:** Central identity. Managed via NextAuth + MongoDB.
- **Account:** Linked OAuth accounts (Google, GitHub, etc.) via NextAuth.
- **Session:** User session data.

## Web3 Context
- **Wallet:** Association between User and Blockchain Address.
- **Smart Contract:** Custom contracts located in `packages/web3`.

## Integrations
- **WhatsApp:** Automated messaging via Twilio Webhooks.
- **Email:** Transactional emails via Resend.

## Architecture Data Flow
1. **Client** (Next.js) initiates request via **tRPC**.
2. **Router** validates input (Zod) and calls **Service**.
3. **Service** executes business logic and calls **Repository** or **Blockchain**.
4. **Repository** queries **MongoDB** (Prisma).
5. **Response** flows back, fully typed.
