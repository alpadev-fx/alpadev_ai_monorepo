# Performance Guardrails

## Goals
- Keep long Codex sessions stable in a large Turborepo.
- Maximize throughput without losing reasoning quality.

## Rules
- Prefer `rg` and `rg --files` for discovery.
- Read only the file sections needed for the decision at hand.
- Prefer `pnpm --filter <pkg>` over broad root commands when the change is isolated.
- Avoid rebuilding Next.js or re-running Playwright unless the touched behavior requires it.
- Ignore generated directories such as `.next/`, `node_modules/`, and `playwright-report/` unless debugging them directly.
- Use `fast-iterate` for small content/UI edits and formatting.
- Use `deep-reasoning` for auth, billing, AI orchestration, data contracts, and infrastructure work.
- Use `max-context` only for wide refactors that genuinely span multiple packages.

## Context Discipline
- Keep plans short and actionable.
- Summarize logs instead of pasting full command output.
- Prefer local project docs like `CLAUDE.md`, `chatbot_guide_codex.md`, and targeted package files over reading entire large documents.
- Trigger compaction when token pressure becomes noticeable.
