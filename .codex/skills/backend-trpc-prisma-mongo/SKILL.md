---
name: backend-trpc-prisma-mongo
description: Use for changes in packages/api, packages/auth, packages/db, or packages/validations involving tRPC contracts, Prisma + MongoDB access, auth/session logic, and backend type safety.
---

# Backend tRPC Prisma Mongo

## Scope
- Any task touching `packages/api/`, `packages/auth/`, `packages/db/`, or `packages/validations/`.
- Routers, services, repositories, auth/session wiring, Prisma schema, or shared Zod schemas.

## Operating Rules
- Keep routers thin; business logic belongs in services and repositories.
- Zod schemas in `@package/validations` stay the source of truth for shared inputs.
- Prefer Prisma for new data access; use Mongoose only where the codebase already depends on it.
- Preserve tRPC contract stability unless the task explicitly changes the API.
- Be careful with MongoDB `ObjectId` semantics and Prisma schema conventions.

## Implementation Flow
1. Identify the impacted boundary: router, service, repository, auth, schema, or migration-like schema push.
2. Apply the smallest diff that fits current package boundaries.
3. Update types or validations close to the changed contract.
4. Run backend gates from `testing-gates-alpadev`.

## Required Validation
- `pnpm --filter @package/api lint`
- `pnpm --filter @package/api typecheck`
- If Prisma schema changed: `pnpm --filter @package/db db:generate`

## Handoff Output
```text
Changed files:
Behavior change:
Risks:
Tests run:
```
