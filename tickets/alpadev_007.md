# Frontend Ticket 007: Bundle Size Optimization

## 1. Scenario
The frontend bundle may be larger than necessary, impacting load times and performance. Code splitting, tree shaking, dynamic imports, and dependency optimization are needed to achieve <200KB first load JS.

## 2. Platform
Frontend (`apps/frontend`)

## 3. Steps to Reproduce
1. Run `pnpm build` and check output sizes
2. Run bundle analyzer (`@next/bundle-analyzer`)
3. Identify large dependencies
4. Check for unused imports

## 4. Expected Behavior
- First Load JS: <200KB
- Total bundle: <500KB
- Heavy components dynamically imported
- No unused dependencies
- Tree shaking properly configured

## 5. Actual Behavior
- Bundle size potentially >300KB first load
- Large dependencies may be included unnecessarily
- Missing code splitting opportunities
- Potential duplicate dependencies

## 6. Tasks
- [ ] Add and run @next/bundle-analyzer
- [ ] Identify and remove unused dependencies
- [ ] Implement dynamic imports for heavy components
- [ ] Configure proper tree shaking
- [ ] Optimize image imports with next/image
- [ ] Implement route-based code splitting
- [ ] Add font subsetting with next/font
- [ ] Configure compression (brotli/gzip)
- [ ] Lazy load below-fold content

## 7. Acceptance Criteria
- [ ] First Load JS <200KB
- [ ] Lighthouse Performance >90
- [ ] Bundle analyzer shows no unexpected large chunks
- [ ] All heavy components use dynamic imports
- [ ] FCP (First Contentful Paint) <1.5s

## 8. Priority
**HIGH** - User experience and Core Web Vitals

## 9. Estimated Time
10-15 hours

## 10. Dependencies
- alpadev_002 (deduplication reduces bundle)
- alpadev_004 (atomic structure enables splitting)
