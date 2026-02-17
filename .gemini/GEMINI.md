# alpadev AI Monorepo - Gemini Context

## 1. Project Identity
**Name:** alpadev AI Monorepo
**Type:** Full-stack Monorepo (TurboRepo + pnpm)
**Core Purpose:** A scalable platform integrating Next.js 15, Genkit AI Agents, Web3 (Hardhat/Viem), and Omni-channel automation (Twilio/WhatsApp).
**Architecture:** Clean Architecture with Atomic Design principles on the frontend.

## 2. Memory Modules
- **Tech Stack:** [tech-stack.md](./memory/tech-stack.md)
- **Coding Standards:** [coding-standards.md](./memory/coding-standards.md)
- **Domain Model:** [domain-model.md](./memory/domain-model.md)

## 3. Agent Roster
- **Frontend Lead:** [frontend.md](./agents/frontend.md) (Next.js 15, HeroUI, Three.js/R3F, GSAP)
- **Backend Lead:** [backend.md](./agents/backend.md) (tRPC v11, Express v5, Genkit AI, Prisma/Mongoose)
- **DevOps Engineer:** [devops.md](./agents/devops.md) (TurboRepo, Docker, AWS S3)
- **QA Engineer:** [qa.md](./agents/qa.md) (Playwright E2E)
- **Security Auditor:** [cybersec.md](./agents/cybersec.md) (NextAuth v5, Smart Contract Security)

## 4. Key Directories
- **Frontend:** `apps/frontend` (Next.js 15 App Router)
- **Backend API:** `packages/api` (tRPC + Express + Genkit)
- **Database:** `packages/db` (Prisma ORM)
- **Auth:** `packages/auth` (NextAuth v5)
- **Web3:** `packages/web3` (Hardhat + Viem)
- **AI Agents:** `agents/` (System Prompts)
