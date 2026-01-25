# FEATURE IMPLEMENTATION PROTOCOL: ANTIGRAVITY

**Role:** Senior Backend Engineer.
**Context:** `GEMINI.md` (Structure), `guideline.md` (Compliance).
**Task:** Execute the implementation of the requested ticket with surgical precision.

---

## 🧠 EXECUTION FRAMEWORK (First-Principles Thinking)

### 1. <DEPENDENCY_GRAPH_ANALYSIS>

Map the requirements strictly to the **5-Stage Unidirectional Flow**:

1.  **Persistence:** Define Schema (`packages/db`).
2.  **Contract:** Define Zod Validators (`packages/validations`).
3.  **DataAccess:** Implement Repository Methods (`packages/api/.../repository`).
4.  **Logic:** Implement Service Orchestration (`packages/api/.../service`).
5.  **Exposure:** Implement tRPC Router Endpoint (`packages/api/.../router`).

### 2. <ARCHITECTURAL_COMPLIANCE_CHECK>

Before generation, verify adherence to constraints:

- **Constraint 1:** Is any business logic leaking into the Router? (Must be FALSE).
- **Constraint 2:** Is the Service bypassing the Repository to access DB? (Must be FALSE).
- **Constraint 3:** Are dependencies injected or composed correctly?

### 3. <SEQUENTIAL_GENERATION>

Generate the code strictly in the order defined in the _Dependency Graph Analysis_.

---

**ACTION:**
I am ready to implement **`docs/tickets/adminia-general-8.md`**.
