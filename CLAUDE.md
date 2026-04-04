# CLAUDE.md - Production-Grade Agent Directives

The governing loop for all work: **gather context → take action → verify
work → repeat.**

---

## 1. Pre-Work

### Step 0: Delete Before You Build
Before ANY structural refactor on a file >300 LOC, first remove dead code,
unused exports/imports, and debug logs. Commit cleanup separately.

### Phased Execution
Never attempt multi-file refactors in a single response. Break into phases.
Complete Phase 1, run verification, wait for approval before Phase 2.
Each phase: max 5 files.

### Plan and Build Are Separate Steps
When asked to "make a plan" — output only the plan. No code until the user
says go. If instructions are vague, outline what you'd build. Get approval.

### Spec-Based Development
For non-trivial features (3+ steps), interview the user about implementation,
UX, and tradeoffs before writing code. The spec becomes the contract.

---

## 2. Understanding Intent

### Follow References, Not Descriptions
When the user points to existing code, study it and match its patterns
exactly. Working code is a better spec than English.

### Work From Raw Data
When the user pastes error logs, trace the actual error. No guessing.
If a bug report has no error output, ask for it.

### One-Word Mode
When the user says "yes," "do it," or "push" — execute. No commentary.

**Safety valve:** One-Word Mode applies to code changes only. For destructive
operations (database migrations, git push, infrastructure changes), always
confirm the specific action before executing.

---

## 3. Code Quality

### Fix What You Touch
Fix what's broken in the code you're touching. Don't fix code outside your
scope. If you see a structural problem adjacent to your change that will
cause bugs, flag it as a follow-up — don't silently expand scope.

### Forced Verification
You are FORBIDDEN from reporting a task as complete until you have:
- Run the project's type-checker / compiler
- Run all configured linters
- Run the test suite (scoped to changed packages)

Never say "Done!" with errors outstanding.

### Write Human Code
No robotic comment blocks, no excessive headers, no corporate descriptions
of obvious things. Simple and correct beats elaborate and speculative.

### Demand Elegance (Balanced)
For non-trivial changes: "is there a more elegant way?" Skip for obvious
fixes. Challenge your own work before presenting it.

---

## 4. Context Management

### Sub-Agent Swarming
For tasks touching >5 independent files, you MUST launch parallel
sub-agents (5-8 files per agent). Each agent gets its own context window
(~167K tokens). One agent processing 20 files sequentially guarantees
context decay. Five agents = 835K tokens of working memory.

Use the appropriate execution model:
- **Fork**: inherits parent context, cache-optimized, for related subtasks
- **Worktree**: gets own git worktree, isolated branch, for independent
  parallel work across the same repo
- **/batch**: for massive changesets, fans out to as many worktree agents
  as needed

One task per sub-agent for focused execution. Offload research,
exploration, and parallel analysis to sub-agents to keep the main context
window clean. Use `run_in_background` for long-running tasks so the main
agent can continue other work while sub-agents execute. Do NOT poll a
background agent's output file mid-run — wait for the completion
notification.

### Context Decay Awareness
After 10+ messages, MUST re-read any file before editing it. Do not trust
memory of file contents.

### Proactive Compaction
If you notice context degradation (forgetting file structures, referencing
nonexistent variables), run `/compact` proactively. Treat it like a save
point. Summarize the session state into a `context-log.md` so future
sessions or forks can pick up cleanly.

### File Read Budget
For files over 500 LOC, use offset and limit parameters to read in chunks.
Never assume you've seen a complete file from a single read.

### Tool Result Blindness
Tool results over 50,000 characters are silently truncated to a 2,000-byte
preview. If any search returns suspiciously few results, re-run with
narrower scope. State when you suspect truncation occurred.

### Session Continuity
Always prefer `--continue` to resume the last session rather than starting
fresh. When exploring two different approaches, use `--fork-session` to
branch the conversation and preserve both contexts independently.

### Cross-Session Memory
At session start, check for `gotchas.md` and `context-log.md` in the
project root. If they exist, read them before starting work.

---

## 5. File System as State

The file system is your most powerful general-purpose tool. Stop holding
everything in context. Use it actively:

- Use bash to grep, search, tail, and selectively read what you need.
  Agentic search beats passive context loading.
- Write intermediate results to files for multi-pass problem solving.
- For large data operations, save to disk and use bash tools (`grep`,
  `jq`, `awk`) to search and process.
- Use the file system for memory across sessions: write summaries,
  decisions, and pending work to markdown files that persist.
- When debugging, save logs and outputs to files for reproducible
  verification.

---

## 6. Edit Safety

### Edit Integrity
Before EVERY file edit, re-read the file. After editing, read again to
confirm. Never batch more than 3 edits without a verification read.

### No Semantic Search
When renaming anything, search separately for: direct calls, type-level
references, string literals, dynamic imports, re-exports, test files/mocks.
Assume a single grep missed something.

### One Source of Truth
Never fix a display problem by duplicating state. One source, everything
reads from it.

### Destructive Action Safety
Never delete a file without verifying references. Never push unless told to.

---

## 7. Prompt Cache Awareness

Your system prompt, tools, and CLAUDE.md are cached as a prefix. Breaking
this prefix invalidates the cache for the entire session.

- Do not request model switches mid-session. Delegate to a sub-agent if a
  subtask needs a different model.
- Do not suggest adding or removing tools mid-conversation.
- When you need to update context (time, file states), communicate via
  messages, not system prompt modifications.
- If you run out of context, use `/compact` and write the summary to a
  `context-log.md` so we can fork cleanly without cache penalty.

---

## 8. Self-Improvement

### Mistake Logging
After ANY correction, log the pattern to `gotchas.md`. Convert mistakes
into strict rules. Review past lessons at session start.

### Bug Autopsy
After fixing a bug, explain why it happened and whether anything could
prevent that category in the future.

### Failure Recovery
If a fix doesn't work after two attempts, stop. Re-read the entire relevant
section. State where your mental model was wrong.

### Autonomous Bug Fixing
When given a bug report: just fix it. Trace logs, errors, failing tests —
resolve them. Zero context switching required from the user.

### Proactive Guardrails
Offer to checkpoint before risky changes. Flag unwieldy files. Suggest
breaking large files into smaller focused ones.

---

## 9. Housekeeping

### Parallel Batch Changes
When the same edit needs to happen across many files, suggest parallel
batches via `/batch`. Verify each change in context.

### File Hygiene
When a file gets long enough that it's hard to reason about, suggest
breaking it into smaller focused files. Keep the project navigable.
