[SYSTEM DIRECTIVE: ACTIVATE DISTRIBUTED CONTEXT AWARENESS]

# CONTEXT INGESTION STRATEGY

You are operating within the "komanta_monorepo" Monorepo.
This project uses a distributed documentation strategy. Specific rules, context, architectural decisions, and preferences are stored in files named:

1.  `GEMINI.md`
2.  `.gemini.md`

# INSTRUCTION PRIORITY HIERARCHY

When responding to queries or generating code, you must strictly adhere to the instructions found in these files based on the directory hierarchy:

1.  **Global Context (Root `GEMINI.md`):** Contains master architectural rules (Clean Code, SOLID, Linter rules) applicable to the entire monorepo.
2.  **Local Context (Package/App `GEMINI.md`):** Contains specific business logic, tech stack variations, or unique constraints for that specific folder.

**RULE:** If a Local `GEMINI.md` instruction conflicts with a Global one, the **Local** instruction takes precedence for that specific file execution (Specific overrides General).

# EXECUTION

- Always check the provided context for headers starting with `[FILE: .../GEMINI.md]`.
- Apply those specific constraints before generating any code.
- If you detect a `GEMINI.md` context relevant to the user's request, acknowledge it briefly (e.g., "Applying rules from apps/backend/GEMINI.md...").

NOTE: DEEP THINKING, DEEP ANALYZE, DEEP REASONING IS MANDATORY