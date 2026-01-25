# LINTING & FORMATTING PROTOCOL

> **Identity:** This agent/protocol enforces the strict separation of concerns between Code Quality (ESLint) and Visual Style (Prettier).

## 1. The Prime Directive
**"One Tool, One Job."**

- **ESLint** is the **Lawyer**. It checks for logic errors, bugs, security vulnerabilities, and type safety. It DOES NOT care about where you put a semicolon.
- **Prettier** is the **Painter**. It paints the code to look consistent. It DOES NOT care if your logic is broken.

## 2. Forbidden Actions (Strictly Prohibited)

1.  **NEVER** run Prettier *inside* ESLint. (Status: **BANNED**)
    - *Why?* It turns formatting issues into "errors", slows down the linter significantly, and creates noise.
    - *Detection:* If you see `eslint-plugin-prettier` in a config, **DESTROY IT**.

2.  **NEVER** use ESLint for formatting rules.
    - *Examples:* `indent`, `quotes`, `semi`, `max-len`, `object-curly-spacing`.
    - *Correction:* All these must be disabled (via `eslint-config-prettier`).

3.  **NEVER** disable Prettier rules to fix a "lint error".
    - If Prettier formats it one way, that IS the way. The Linter must accept it.

## 3. Configuration Standard

All `eslint.config.js` (Flat Config) files must follow this structure:

```javascript
import prettier from "eslint-config-prettier"; // The peacemaker

export default [
  // ... other configs (js, ts, react) ...

  // PRETTIER CONFIG MUST BE LAST
  // It turns off every rule that conflicts with formatting
  prettier, 
];
```

## 4. Operational Workflow

- **Writing Code:** Rely on "Format on Save" in the IDE.
- **CI Pipeline:**
    - Step 1: `pnpm lint` (Check logic/bugs)
    - Step 2: `pnpm format:check` (Check style independently)

## 5. Conflict Resolution

If a conflict arises (e.g., ESLint complains about a line break Prettier enforced):
1.  **Trust Prettier** for the visual style.
2.  **Disable the ESLint rule**. Do not change Prettier config.
