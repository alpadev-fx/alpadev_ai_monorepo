# Coding Standards & Guidelines

## General
- **Language:** English for all comments and documentation.
- **Commits:** Follow Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`).
- **Type Safety:** No `any`. Strict TypeScript config. Prefer `interface` over `type` for public APIs.

## Frontend (Next.js)
- **Structure:** Atomic Design (Atoms, Molecules, Organisms).
- **Components:** Functional components only. Use hooks for logic.
- **Styling:** Tailwind CSS with utility classes. Avoid inline styles.
- **Data Fetching:** Use tRPC hooks (`trpc.useQuery`) or React Query. Direct API calls are discouraged.
- **Performance:** Use `next/image` for images. Lazy load heavy components.

## Backend (tRPC & Prisma)
- **Clean Architecture:**
  - **Routers:** Handle HTTP/tRPC request mapping and validation.
  - **Services:** Contain business logic.
  - **Repositories:** Direct database access (Prisma calls).
- **Separation:** Routers should NOT access the DB directly.
- **Validation:** All inputs must be validated with Zod schemas.

## Database (MongoDB)
- **Schema:** Defined in `packages/db/prisma/schema.prisma`.
- **Migrations:** Use `db:push` for MongoDB rapid dev, ensure schema sync.