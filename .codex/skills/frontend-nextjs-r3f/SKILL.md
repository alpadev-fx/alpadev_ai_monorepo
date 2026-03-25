---
name: frontend-nextjs-r3f
description: Use for changes in apps/frontend involving Next.js App Router, React components, tRPC/React Query, Tailwind/HeroUI, and R3F/GSAP/Framer Motion experiences.
---

# Frontend Next.js R3F

## Scope
- Any task touching `apps/frontend/`.
- App Router routes, layouts, components, forms, auth UI, or 3D/animation experiences.

## Operating Rules
- Prefer server components by default; add `"use client"` only when hooks, DOM APIs, or interactive rendering require it.
- Preserve existing design language unless the task explicitly changes UX.
- Keep data contracts aligned with tRPC and shared Zod schemas.
- Be conservative with heavy animation and canvas work to avoid regressions in performance.
- Avoid broad style refactors unrelated to the task.

## Implementation Flow
1. Map impact across route, component, data-fetching, and animation layers.
2. Apply minimal changes with stable props and state contracts.
3. Add or update targeted coverage or smoke steps where behavior changes.
4. Run frontend gates from `testing-gates-alpadev`.

## Required Validation
- `pnpm --filter next-app-template lint`
- `pnpm --filter next-app-template typecheck`
- If user-facing flow changed materially: `cd apps/frontend && pnpm exec playwright test`

## Handoff Output
```text
Changed files:
User-visible behavior:
Risks:
Tests run:
```
