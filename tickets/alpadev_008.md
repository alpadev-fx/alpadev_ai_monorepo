# Frontend Ticket 008: Server/Client Component Strategy

## 1. Scenario
Next.js 13+ App Router introduces Server Components by default. The codebase may not be optimally using this pattern - either using too many client components or incorrectly mixing server/client boundaries. A proper strategy maximizes server-side rendering while minimizing client JS.

## 2. Platform
Frontend (`apps/frontend`)

## 3. Steps to Reproduce
1. Count files with `'use client'` directive
2. Check if `'use client'` is at page level (bad) vs deep in tree (good)
3. Identify client components that could be server components
4. Check for unnecessary hydration

## 4. Expected Behavior
- `'use client'` used only when truly needed (hooks, events, browser APIs)
- Client boundary pushed as deep as possible
- Data fetching happens on server
- Static content rendered server-side
- Interactive islands pattern for complex UIs

## 5. Actual Behavior
- May have `'use client'` at page level
- Client components contain static content
- Data fetching may happen on client unnecessarily
- Bundle includes unnecessary React hydration

## 6. Tasks
- [ ] Audit all `'use client'` directives
- [ ] Push client boundary deeper in component tree
- [ ] Convert static components to server components
- [ ] Move data fetching to server components
- [ ] Implement proper loading.tsx for suspense
- [ ] Add error.tsx boundaries
- [ ] Document server/client decision criteria
- [ ] Create wrapper components for mixed patterns

## 7. Acceptance Criteria
- [ ] <20% of components use `'use client'`
- [ ] No `'use client'` at page level (unless truly needed)
- [ ] All data fetching on server
- [ ] Reduced client-side JS bundle
- [ ] Improved LCP and TTI metrics

## 8. Priority
**MEDIUM** - Performance and architecture improvement

## 9. Estimated Time
12-18 hours

## 10. Dependencies
- alpadev_004 (atomic structure should be in place)
- alpadev_005 (hooks library for client components)
