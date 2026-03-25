# Multi-Agent Playbook

## When To Use
- Task spans multiple workspace areas such as `apps/frontend`, `packages/api`, `packages/db`, `packages/auth`, or `infrastructure/`.
- High-risk domain changes in auth, billing, invoice/transaction logic, AI orchestration, chat workers, or deployments.
- Large refactor or deep bug investigation across shared contracts.

## Stages
1. Planner: define scope, touched packages, risks, and validation plan.
2. Executor: implement the smallest diff that preserves the repo's existing boundaries.
3. Reviewer: run `codex review --uncommitted` for regressions in app, package, and infra changes.
4. Security: run a second review focused on auth, secrets, webhook trust, and AI data handling.
5. Verifier: run the minimum effective gates from `testing-gates-alpadev`.

## Handoff Block
Use this exact handoff shape between stages:

```text
Goal:
Scope:
Changed files:
Risks:
Validation:
Open questions:
```

## Efficiency Rules
- Keep outputs compact and decision-oriented.
- Avoid repeating repo context once it is established.
- Respect package boundaries: router/service/repository in API, shared schemas in `@package/validations`, and server components by default in Next.js.
- Compact before a new stage when context is large.
