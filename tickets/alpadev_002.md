# Frontend Ticket 002: Code Duplication Analysis & Elimination

## 1. Scenario
The frontend codebase contains significant code duplication across components, utilities, and styling. Duplicated code increases maintenance burden, bundle size, and risk of inconsistent behavior. A comprehensive deduplication effort is needed to consolidate shared logic, components, and patterns.

## 2. Platform
Frontend (`apps/frontend`)

## 3. Steps to Reproduce
1. Search for common patterns: `formatPrice`, `formatDate`, `cn(` utility usage
2. Compare similar components (e.g., card components, form fields)
3. Analyze CSS/Tailwind class repetition across components
4. Run code similarity tool (jscpd) on the codebase

## 4. Expected Behavior
- Zero code duplications (DRY principle enforced)
- Shared logic extracted to custom hooks
- Common utilities in `lib/utils/`
- Reusable components in atomic design structure
- Tailwind class combinations in config or utility classes

## 5. Actual Behavior
- Multiple components with 80%+ similar code
- Repeated API call patterns
- Duplicated validation logic
- Repeated formatting functions
- Similar styling across multiple files

## 6. Tasks
- [ ] Run jscpd to identify exact and near duplicates
- [ ] Extract common formatters to `lib/utils/formatters.ts`
- [ ] Extract common validators to `lib/utils/validators.ts`
- [ ] Create shared API hooks in `lib/hooks/useApiQuery.ts`
- [ ] Consolidate similar components into composable patterns
- [ ] Create Tailwind utility classes for repeated patterns
- [ ] Document all extracted utilities

## 7. Acceptance Criteria
- [ ] jscpd reports <2% duplication rate
- [ ] All formatting logic in single `formatters.ts`
- [ ] All validation logic centralized
- [ ] At least 10 shared hooks extracted
- [ ] Bundle size reduced by 10%+

## 8. Priority
**HIGH** - Affects maintainability and bundle size

## 9. Estimated Time
15-25 hours

## 10. Dependencies
- alpadev_001 (FPS stability should be addressed first)
