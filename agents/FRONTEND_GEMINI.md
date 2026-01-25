# ANTIGRAVITY FRONTEND ARCHITECTURE & GUIDELINES

[SYSTEM DIRECTIVE: ACTIVATE SENIOR FRONTEND ARCHITECT MODE]

## 1. PHILOSOPHY & CORE PRINCIPLES
All frontend code generated for this project must strictly adhere to the following paradigms:

* **Atomic Design (Modified):**
    * **UI (Atoms):** Dumb components, pure style wrappers (e.g., `Typography`, `StatusChip`). These contain NO business logic.
    * **Shared (Molecules):** Reusable business-agnostic widgets (e.g., `DataTable`, `DynamicBreadcrumb`, `PageHeader`).
    * **Features (Organisms):** Domain-specific logic blocks (e.g., `UserList`, `InvoiceTable`, `PaymentForm`).
* **Separation of Concerns (SoC):**
    * **View Layer:** `.tsx` files must ONLY contain JSX, layout logic, and mapping of data to components.
    * **Logic Layer:** All data fetching, state management, complex calculations, and side effects must be extracted to **Custom Hooks** (e.g., `useUsers`, `usePayments`).
* **SOLID Principles:**
    * **SRP (Single Responsibility):** One component, one responsibility. If a file exceeds 150 lines, it is a code smell and must be decomposed.
    * **OCP (Open/Closed):** Components like `DataTable` should be open for extension (via props/columns configuration) but closed for modification.
    * **DRY (Don't Repeat Yourself):** Never duplicate table logic, pagination states, or API calls.

## 2. DIRECTORY STRUCTURE
Strictly enforce this folder structure for any new feature or refactor:

```text
src/
├── components/
│   ├── ui/               # ATOMS: Base styles, Typography, Wrappers (Zero logic)
│   ├── shared/           # MOLECULES: Global reusable components (DataTable, Loaders)
│   └── features/         # ORGANISMS: Business domains
│       ├── [feature]/    # e.g., "users", "finance", "properties"
│       │   ├── [Page].tsx        # The main view (UserList.tsx)
│       │   └── components/       # Local sub-components specific to this feature
├── hooks/                # LOGIC: Custom hooks for Data Fetching & Business Logic
├── types/                # CONTRACTS: Shared Interfaces
└── utils/                # HELPERS: Pure functions

```

## 3. COMPONENT IMPLEMENTATION RULES

### A. The "Aging Eyes" Accessibility Contract (CRITICAL)

* **Font Size:** Default data text (tables, lists, inputs) must be **`text-base` (16px)**. Never use `text-small` for main content.
* **Contrast:** Use `text-gray-700` or darker for primary content to ensure readability.
* **Spacing:** Table rows must have a minimum height of **`h-16` (64px)** to reduce visual clutter.
* **Branding:** Use **Indigo** (`indigo-600`) for primary actions, buttons, and active states.
* **Titles:** Page titles should be `text-2xl font-bold` (Not 3xl/4xl, avoid visual aggression).

### B. The `DataTable` Pattern

Do NOT write HTML tables (`<table>`, `<thead>`) manually in feature pages. You MUST use the generic `DataTable` component.

**Pattern for Feature Pages:**

```tsx
// 1. Import Hook & Shared Components
import { useFeatureData } from "@/hooks/useFeatureData";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import { PageTitle } from "@/components/ui/Typography";

export default function FeaturePage() {
  // 2. Logic Injection (The "How")
  const { data, isLoading } = useFeatureData();

  // 3. Configuration (The "What") - Define columns here
  const columns = [
    { uid: "name", name: "Name", render: (item) => <CustomCell item={item} /> },
    { uid: "status", name: "Status", render: (item) => <StatusChip status={item.status} /> },
    { uid: "actions", name: "Actions", render: (item) => <ActionButtons id={item.id} /> }
  ];

  // 4. Render (The "Where")
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
       <Breadcrumbs... />
       <PageTitle>Feature Name</PageTitle>
       <DataTable 
          columns={columns} 
          data={data} 
          isLoading={isLoading} 
          emptyContent="No items found."
       />
    </div>
  );
}

```

### C. Clean Code Standards

1. **No Huge Switch Statements:** Do not use `switch(columnKey)` inside render methods. Use the `render` function property in the column definition object.
2. **No Inline Objects:** Define column configurations outside the component or with `useMemo` if they depend on state.
3. **Strict Typing:** Explicitly type all Props and Data. No `any`.
4. **Descriptive Naming:**
* Use `isLoading` instead of `loading`.
* Use `handleDeleteUser` instead of `onDelete`.



## 4. REFACTORING INSTRUCTIONS

When asked to refactor a legacy component:

1. **Analyze:** Identify logic vs. view.
2. **Extract Logic:** Move `useEffect`, `useState`, and `fetch` calls to a `src/hooks/use[Feature].ts`.
3. **Atomize:** If a render method is complex (e.g., rendering a user card with avatar and badges), extract it to `components/features/[feature]/components/[SubComponent].tsx`.
4. **Standardize:** Replace manual tables/lists with `DataTable` or shared lists.
5. **Verify:** Ensure `text-base` and Indigo colors are applied strictly.

## 5. TECH STACK SPECIFICS

* **Framework:** Next.js (App Router).
* **UI Library:** HeroUI (NextUI).
* **Styling:** Tailwind CSS.
* **Icons:** `@iconify/react` or `@heroui/shared-icons`.
