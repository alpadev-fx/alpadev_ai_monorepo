# Testing Gates

## Frontend (`apps/frontend/`)
- Minimum: `pnpm --filter next-app-template lint`
- Then: `pnpm --filter next-app-template typecheck`
- If routes, auth flows, websocket UI, or landing-page interactions changed: `cd apps/frontend && pnpm exec playwright test`

## API (`packages/api/`)
- Minimum: `pnpm --filter @package/api lint`
- Then: `pnpm --filter @package/api typecheck`
- If worker or webhook behavior changed and local env is ready: smoke the relevant entrypoint with `pnpm --filter @package/api worker:chat` or `pnpm --filter @package/api webhooks`

## Shared Packages (`packages/auth`, `packages/email`, `packages/utils`, `packages/validations`)
- Minimum: run `pnpm --filter <package-name> lint` for each touched package
- If the change crosses package contracts or shared types: run `pnpm typecheck`

## Database (`packages/db/`)
- If Prisma schema or generated client changed: `pnpm --filter @package/db db:generate`
- If schema semantics changed and a safe local MongoDB is available: `pnpm db:push`

## Web3 (`packages/web3/`)
- Minimum: `pnpm --filter web3 compile`
- Then: `pnpm --filter web3 test`

## Infra (`infrastructure/`, `.github/workflows`, `Dockerfile`, `docker-compose.yml`)
- Terraform: run `terraform fmt -check` in touched directories
- Then: run `terraform plan` in the changed environment/module when variables and state are available
- If deploy image inputs changed: run `docker build -f Dockerfile .`

## Merge Readiness
- No unresolved critical review findings.
- Lint clean for every touched package or app.
- Typecheck run when shared contracts, auth, billing, or router boundaries changed.
- E2E or targeted runtime smoke run when user-facing flows, webhooks, or workers changed.
