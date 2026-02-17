# Technology Stack

## Core Monorepo
- **Manager:** TurboRepo
- **Package Manager:** pnpm
- **Language:** TypeScript (Strict Mode)

## Frontend (`apps/frontend`)
- **Framework:** Next.js 15 (App Router)
- **UI Library:** HeroUI (implied), Tailwind CSS
- **State Management:** React Query, Zustand (implied), tRPC Client
- **Animation/3D:** Framer Motion, GSAP, Three.js (@react-three/fiber, @react-three/drei)
- **Testing:** Playwright (E2E)

## Backend & API (`packages/api`, `packages/db`)
- **Communication:** tRPC (Type-safe APIs)
- **Database:** MongoDB
- **ORM:** Prisma
- **Validation:** Zod
- **Authentication:** NextAuth.js (Auth.js)
- **Email:** React Email / Resend

## Web3 (`packages/web3`)
- **Framework:** Hardhat
- **Language:** Solidity
- **Interaction:** Ethers.js / Viem (implied)

## Infrastructure
- **Containerization:** Docker
- **CI/CD:** GitHub Actions (implied)