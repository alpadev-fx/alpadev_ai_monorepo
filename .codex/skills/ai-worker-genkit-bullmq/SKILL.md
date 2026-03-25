---
name: ai-worker-genkit-bullmq
description: Use for changes in packages/api involving Genkit flows, BullMQ queues, Redis-backed workers, websocket chat flow, and TypeScript runtime behavior.
---

# AI Worker Genkit BullMQ

## Scope
- Any task touching `packages/api/src/jobs/`.
- Chatbot orchestration in `packages/api/src/routers/chat/` or `packages/api/src/routers/chatbot/`.
- Websocket entrypoints such as `apps/frontend/server.ts` when chat delivery flow changes.

## Operating Rules
- Keep queue handlers idempotent where retries are possible.
- Preserve Genkit provider boundaries and prompt safety.
- Do not leak prompts, secrets, or user data in logs.
- Prefer testable service boundaries over embedding side effects in routers.
- Treat Redis, webhook, and websocket flows as event-driven paths, not polling loops.

## Implementation Flow
1. Identify whether the change affects queue production, worker consumption, orchestration, or websocket delivery.
2. Make minimal edits near the existing job, service, or router boundary.
3. Update the narrowest validation or smoke path that proves the behavior.
4. Run AI gates from `testing-gates-alpadev`.

## Required Validation
- `pnpm --filter @package/api lint`
- `pnpm --filter @package/api typecheck`
- If runtime flow changed and env is available: `pnpm --filter @package/api worker:chat`

## Handoff Output
```text
Changed files:
Flow impact:
Risks:
Tests run:
```
