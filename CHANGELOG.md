# Changelog

## [0.1.1.0] - 2026-04-18 — Performance + Type Safety Hardening

Build-time correctness and production performance get a sweep. Full monorepo typecheck
now passes with `ignoreBuildErrors` off, so type regressions fail CI instead of
shipping silently. Service interfaces structurally require `userId` for authorization
checks. CDN no longer caches tRPC mutation results.

### Added

- **Bundle analyzer.** Run `pnpm --filter next-app-template analyze` to inspect the
  production bundle and find unintended dependency bloat.
- **Architecture + commands reference in CLAUDE.md.** Codebase layout, data flow
  (tRPC → router → service → repository → db), procedure types, 17 domain routers,
  and per-domain rule pointers in `.claude/rules/` — all indexed for future sessions.

### Changed

- **`/api/*` cache header set to `no-store`.** Previous header cached all API
  responses for 60s at the CDN, which includes tRPC mutation results. Mutations now
  never cache; queries use per-handler caching.
- **`optimizePackageImports` restricted to production builds.** Dev server stays
  fast; prod ships with tree-shaken `@heroui/react`, `@iconify/react`,
  `@react-three/drei`, `lucide-react`, `date-fns`.
- **Frontend TS target `es5` → `es2020`.** SWC still handles browser down-level via
  `browserslist`; tsconfig target is type-check only, so removing old polyfills has
  zero runtime impact.
- **API TS target `es2022` + `jsx: preserve`.** Closes MapIterator errors in
  `conversation.service.ts` and `prospect.service.ts`, and lets `packages/api`
  typecheck resolve `.tsx` imports from `packages/email` correctly.
- **Bill/Invoice/Transaction service interfaces require `userId`.** Previously the
  implementations checked ownership but the interfaces did not declare the param.
  Authorization is now structural — the compiler enforces it at every call site.
- **tRPC context types strict.** `role: string` → `role: Role` (Prisma enum).
  `hasOnboarded` and `isBanned` required (no more silent undefined). Activity log
  details typed as `Prisma.InputJsonValue` instead of `Record<string, unknown>`.
- **TeamInvitationEmail template matches caller contract.** Previously accepted
  `inviterEmail`, `inviteeEmail`, `projectName`; caller was sending `username`,
  `teamName`, `inviteLink`, `userImage`, `teamImage`. Template rewritten to use the
  caller's prop shape, preserving visual design.
- **`next@15.0.4` pinned in `packages/auth`** to dedupe across workspace. Before:
  pnpm installed `next@15.5.9` alongside `15.0.4` because `@package/auth`'s peer dep
  range (`^15.3.2`) didn't intersect with the frontend's explicit `15.0.4`.

### Fixed

- **Full monorepo typecheck.** Clearing pre-existing errors that were hidden by
  `typescript.ignoreBuildErrors: true`: interface/impl signature drift on three
  services, MapIterator downlevel-iteration errors, Prisma `InputJsonValue` type
  mismatch, stale `role: string` in tRPC context, adminUser router session cast,
  `--jsx` not set on email package imports, `searchParams` possibly null on login
  page, `getServerSession` arg typing, Recharts formatter signature, R3F-bubble ref
  type drift, HeroUI Modal `isTransparent` prop that doesn't exist.
- **Shared `ProspectFilters` type** exported from `FilterPanel.tsx` so state shape
  and prop shape can't drift.
- **Duplicate `{...props}` spread removed from Navbar.**

### Removed

- **`typescript.ignoreBuildErrors: true`** from `next.config.mjs`. Type regressions
  now fail the production build.

### Known debt (not addressed)

- ~100 pre-existing ESLint errors across frontend (unused vars, arrow vs function
  component style, `no-explicit-any`). `eslint.ignoreDuringBuilds: true` stays on,
  commented in `next.config.mjs`, until a separate lint audit.
- `@package/validations` + `@package/utils` miss direct `eslint` devDep — `pnpm lint`
  fails on those two packages.
- `next-auth` installs twice because `@react-three/fiber` pulls `react@19` as peer
  while frontend uses `react@18.3.1`. Requires React upgrade to fully resolve.
- HeroUI Navbar `classNames` triggers TS union-complexity limit — suppressed with
  `@ts-expect-error`.

## [0.1.0.0] - 2026-04-03 — Alpadev Dashboard 2026

The admin dashboard ships with role-based access control, vendor activity tracking, and five new pages. Three roles (ADMIN, CHIEF, VENDOR) replace the old binary admin/user model. Vendors see only the cities they're assigned to. Chiefs can manage vendor permissions within their own scope and monitor vendor activity. Admins see everything.

### Added

- **Role-based access control.** Three new roles: ADMIN (full access), CHIEF (manages vendors within assigned scope), VENDOR (scoped to assigned cities/niches). Replaces the old USER/ADMIN/GUEST model.
- **Permission system.** `UserPermission` model with resource/action/scope-based access. Admins assign permissions, chiefs delegate city access to vendors. Scope filters (ciudad, estado, nicho) narrow query results automatically.
- **Vendor activity tracking.** `ActivityLog` model records every vendor action (resource, method, duration, IP, user agent). `loggedProcedure` middleware logs non-admin actions as fire-and-forget. Activity dashboard shows KPIs, vendor filter, paginated feed.
- **Invoices page.** Dashboard page with status filter tabs (Draft, Sent, Paid, Overdue, Cancelled), summary KPI cards, inline mark-as-sent/paid actions.
- **Calendar & Bookings page.** Scheduling form with date/time picker, Google Meet link display on success.
- **Permissions management page.** Admin/Chief UI to assign, update, and revoke permissions per user, resource, and scope.
- **Activity tracking page.** Admin/Chief dashboard showing vendor actions with KPI cards, vendor selector, resource filter, and paginated activity feed.
- **Sidebar navigation.** Added Invoices, Chat, Calendar, Permissions, Activity links. Role-filtered: vendors see basic pages, chiefs see permissions + activity, admins see everything including infrastructure.

### Changed

- **Prospect router enforces permissions.** All prospect queries and mutations check `UserPermission` scope. Vendors only see prospects in their assigned cities. Non-admin write/delete operations require explicit permission.
- **Auth config handles missing NEXTAUTH_SECRET during Docker build.** Uses a placeholder during build phase (no MONGO_URL = build time) instead of throwing, matching the DB package's existing pattern.

### Fixed

- **Docker build failure.** `NEXTAUTH_SECRET` was required at build time during `next build` inside Docker. Now uses build-phase detection to skip the check.
