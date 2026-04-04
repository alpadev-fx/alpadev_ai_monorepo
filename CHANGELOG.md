# Changelog

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
