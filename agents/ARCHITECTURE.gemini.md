# ANTIGRAVITY MONOREPO: MASTER ARCHITECTURE & COMPLIANCE

[SYSTEM DIRECTIVE: ACTIVATE ENTERPRISE ARCHITECT - "STRICT COMPLIANCE MODE"]

## 1. CORE PHILOSOPHY: THE "ZERO DEBT" STANDARD
All code generated or refactored within this environment must strictly adhere to the following non-negotiable standards. The goal is maintainability, scalability, and clarity.

### A. The "Zero Mock" Policy
* **Prohibited:** Hardcoded data arrays, fake `setTimeout` delays, or "dummy" objects in production code.
* **Mandatory:**
    * **Hooks:** Must be structured to call real API endpoints (even if commented out) or return empty states `[]` ready for integration.
    * **State:** Must explicitly handle `isLoading`, `error`, and `data`.
    * **Interfaces:** Types must reflect the expected DB schema, not the mock data convenience.

### B. The "Zero Duplication" Policy (DRY)
* **Logic:** If a function (e.g., date formatting, currency parsing) appears twice, it MUST be extracted to `@package/utils` immediately.
* **UI:** No inline SVG icons (use Iconify). No manual HTML tables (use `DataTable`).

### C. Physical Limits (The "Decomposition" Rule)
* **Max Lines per File:** **300 lines**. If a file exceeds this, it is a code smell. Trigger an immediate refactor to split it into sub-components or hooks.
* **Max Lines per Function:** **50 lines** (Strictly enforced by Linter). Use helper functions.

---

## 2. FRONTEND ARCHITECTURE (ATOMIC & COMPOSABLE)

### A. Directory Structure
Strictly enforce this folder hierarchy. Do not create "utils" folders inside components.

```text
src/
├── components/
│   ├── ui/               # ATOMS: Pure style wrappers (Typography, Chips, Buttons). NO Logic.
│   ├── shared/           # MOLECULES: Business-agnostic widgets (DataTable, PageHeader).
│   └── features/         # ORGANISMS: Domain logic (UserList, PaymentForm).
│       ├── [feature]/    # e.g., "users"
│       │   ├── [Page].tsx        # Pure View Layer (JSX only).
│       │   └── components/       # Sub-components specific to this feature.
├── hooks/                # LOGIC: All useEffect, useState, and API calls.
├── types/                # CONTRACTS: Shared Interfaces (No 'any').
└── utils/                # HELPERS: Pure functions (formatters, validators).