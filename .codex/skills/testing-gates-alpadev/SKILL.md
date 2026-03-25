---
name: testing-gates-alpadev
description: Use to select and run the smallest effective lint, typecheck, E2E, worker, and infra validation gates for changed files across the Alpadev monorepo.
---

# Testing Gates Alpadev

## Gate Selection
- `apps/frontend/` changed:
Run `pnpm --filter next-app-template lint`, then `pnpm --filter next-app-template typecheck`.
Escalate to `cd apps/frontend && pnpm exec playwright test` when user-facing flows changed.

- `packages/api/` changed:
Run `pnpm --filter @package/api lint`, then `pnpm --filter @package/api typecheck`.
If worker or webhook flow changed, smoke the relevant runtime entrypoint when env is ready.

- `packages/auth/`, `packages/email/`, `packages/utils/`, or `packages/validations/` changed:
Run `pnpm --filter <package-name> lint`.
Escalate to `pnpm typecheck` when shared contracts changed.

- `packages/db/` changed:
Run `pnpm --filter @package/db db:generate`.
Use `pnpm db:push` only against a safe local MongoDB environment.

- `packages/web3/` changed:
Run `pnpm --filter web3 compile`, then `pnpm --filter web3 test`.

- `infrastructure/`, `.github/workflows/`, `Dockerfile`, or `docker-compose.yml` changed:
Run `terraform fmt -check` and then `terraform plan` when appropriate.
Add `docker build -f Dockerfile .` when container inputs changed.

## Strategy
- Start with the minimum gate that gives fast feedback.
- Escalate to broader workspace gates only when shared types, auth, billing, or cross-package contracts changed.
- Report the exact commands run, what was skipped, and why.

## Reporting Format
```text
Area:
Commands:
Result:
Failures:
Next gate:
```
