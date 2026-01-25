# Frontend Ticket 001: FPS Stability Infrastructure

## 1. Scenario
The application currently experiences severe FPS instability across all components. FPS fluctuates wildly (120 → 10-20 → 80 FPS) during normal usage, especially during component transitions. This creates a poor user experience with visible stuttering and jank. The root cause appears to be resource leaks, multiple RAF loops, event listener accumulation, or WebGL context issues.

## 2. Platform
Frontend (`apps/frontend`)

## 3. Steps to Reproduce
1. Navigate to the homepage with the NebulaCanvas component
2. Open Chrome DevTools Performance tab and start recording
3. Scroll through the page and navigate between components
4. Observe FPS drops from 120 to 10-20 FPS
5. Check Memory tab - observe memory growth over time

## 4. Expected Behavior
- All pages maintain **stable 100-120 FPS** at all times
- No FPS drops below 90 FPS during any operation
- Memory stays constant (<5MB growth over 5 minutes)
- Component transitions are smooth
- Chrome Performance tab shows clean profile

## 5. Actual Behavior
- FPS fluctuates wildly: 120 → 10-20 → 80 FPS
- Previously stable components now have severe drops
- FPS instability is worse during component transitions
- Memory may be leaking

## 6. Tasks
- [ ] Add global FPSMonitor component to track real-time FPS
- [ ] Implement memory leak detection diagnostics
- [ ] Audit all `requestAnimationFrame` calls - ensure single RAF loop
- [ ] Audit all `addEventListener` calls - ensure matching `removeEventListener`
- [ ] Verify all WebGL contexts are properly destroyed on unmount
- [ ] Add React.StrictMode compatibility checks
- [ ] Create `useResourceManager` hook for centralized cleanup
- [ ] Implement scroll event throttling/debouncing

## 7. Acceptance Criteria
- [ ] FPS never drops below 90 on M4 MacBook
- [ ] Memory growth <5MB over 5 minutes of usage
- [ ] Zero RAF conflicts (single loop per component)
- [ ] All event listeners properly cleaned up
- [ ] Performance profile shows no red flags

## 8. Priority
**CRITICAL** - Blocking user experience

## 9. Estimated Time
8-12 hours

## 10. Dependencies
None - Foundation work
