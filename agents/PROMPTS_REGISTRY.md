# 🧠 Antigravity Prompt Engineering Registry

This registry centralizes the **Deep Reasoning Mega-Prompts** designed for the **Antigravity** autonomous agent system.

These prompts utilize **Cognitive Trigger Phrases** to force the LLM into specific expert personas (Principal Architect, Security Researcher, Release Engineer), mitigating hallucination and enforcing strict adherence to **Clean Architecture**.

## 📋 Operational Protocols

1.  **[00_SYSTEM_CONTEXT_BOOTSTRAP](./00_SYSTEM_CONTEXT_BOOTSTRAP.md)**
    - _Usage:_ Mandatory initialization at the start of every session.
    - _Function:_ Loads the Domain Model, Tech Stack, and Architectural Constraints.

2.  **[01_FEATURE_IMPLEMENTATION_PROTOCOL](./01_FEATURE_IMPLEMENTATION_PROTOCOL.md)**
    - _Usage:_ When implementing new tickets/features.
    - _Function:_ Enforces the `Schema -> Validator -> Repo -> Service -> Router` pipeline.

3.  **[02_ARCHITECTURAL_AUDIT_FRAMEWORK](./02_ARCHITECTURAL_AUDIT_FRAMEWORK.md)**
    - _Usage:_ For code reviews and legacy code refactoring.
    - _Function:_ Identifies coupling, leaky abstractions, and SOLID violations.

4.  **[03_HEURISTIC_VULNERABILITY_SCAN](./03_HEURISTIC_VULNERABILITY_SCAN.md)**
    - _Usage:_ For debugging and security auditing.
    - _Function:_ Aggressively hunts for race conditions, IDOR, and logic flaws.

5.  **[04_STRATEGIC_EVOLUTION_BLUEPRINT](./04_STRATEGIC_EVOLUTION_BLUEPRINT.md)**
    - _Usage:_ For high-level architectural planning.
    - _Function:_ Maps the migration from Monolithic Waterfall to Distributed Consensus.

6.  **[05_BUILD_STABILITY_PROTOCOL](./05_BUILD_STABILITY_PROTOCOL.md)**
    - _Usage:_ When `pnpm dev` fails, Docker crashes, or Red Screens of Death appear.
    - _Function:_ Translates stack traces into fix commands.
