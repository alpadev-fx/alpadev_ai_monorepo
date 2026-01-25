# Frontend Ticket 015: NebulaCanvas WebGL Shader Optimization

## 1. Scenario
The NebulaCanvas volumetric shader is running at 15-20 FPS while other components achieve 100-120 FPS on M4 MacBook. This creates a significant performance bottleneck. The shader uses expensive triple-nested domain warping and needs aggressive algorithmic optimization.

## 2. Platform
Frontend (`apps/frontend/app/_components/nebula/NebulaCanvas.tsx`)

## 3. Steps to Reproduce
1. Navigate to page with NebulaCanvas
2. Open FPS monitor
3. Observe 15-20 FPS instead of 100-120 FPS
4. Note the shader complexity in the GLSL code

## 4. Expected Behavior
- NebulaCanvas achieves 100-120 FPS
- Frame time <10ms
- No thermal throttling
- Visual quality maintained
- Works on low-end devices with graceful degradation

## 5. Actual Behavior
- 15-20 FPS on M4 MacBook
- ~50ms frame time
- GPU bottleneck
- Possible thermal throttling

## 6. Tasks
- [ ] Profile shader to identify specific bottleneck
- [ ] Pre-bake domain-warped noise to 3D texture
- [ ] Reduce raymarching steps with adaptive stepping
- [ ] Optimize star glow calculations
- [ ] Implement device tier detection
- [ ] Add resolution scaling for low-end devices
- [ ] Ensure proper resource cleanup
- [ ] Verify 100+ FPS on M4

## 7. Acceptance Criteria
- [ ] 100+ FPS on M4 MacBook
- [ ] 60+ FPS on iPhone 11/low-end devices
- [ ] Visual quality maintained (domain warping preserved)
- [ ] <300ms texture generation at init
- [ ] No memory leaks
- [ ] Proper WebGL cleanup

## 8. Priority
**CRITICAL** - Visual hero component performance

## 9. Estimated Time
15-25 hours

## 10. Dependencies
- alpadev_001 (FPS stability infrastructure)

## 11. Technical Notes
**Root Cause Analysis:**
- `domainWarpedFBM()` performs 7 FBM calls × 4 octaves × 8 noise ops = 224 ops/sample
- At 64 steps per pixel × 2M pixels = ~28 billion ops/frame
- Solution: Pre-bake to 3D texture for O(1) lookup

**Optimization Strategy:**
1. Generate 64-128³ 3D texture with domain warping at init
2. Use texture sampling instead of procedural noise
3. Reduce steps from 64 to 40 with adaptive stepping
4. Device tier detection (LOW/MID/HIGH)
