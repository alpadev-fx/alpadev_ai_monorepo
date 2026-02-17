# Frontend Rules — Alpadev AI (Next.js 15 + Three.js)

## Next.js 15
- Server Components por defecto
- `"use client"` solo cuando se necesitan hooks, event handlers, browser APIs o R3F
- Usar `next/image` para todas las imágenes con `sizes` y `priority` configurados
- Usar `next/link` para navegación interna
- Metadata via `generateMetadata` o `metadata` export en layouts/pages
- Loading states con `loading.tsx` y Suspense boundaries

## Routing (App Router)
- Layouts compartidos en `layout.tsx`
- Error boundaries en `error.tsx`
- Not found en `not-found.tsx`
- Route groups con `(grupo)` para organización
- Dynamic routes: `[id]`, catch-all: `[...slug]`

## Three.js / React Three Fiber
- Componentes 3D siempre dentro de `<Canvas>` de @react-three/fiber
- Usar `<Suspense fallback={<Loader />}>` alrededor de scenes
- Lazy-load scenes 3D con `dynamic(() => import('./Scene'), { ssr: false })`
- Cleanup obligatorio en useEffect: dispose geometries, materials, textures
- No usar Three.js raw en Server Components — solo client components
- Usar @react-three/drei helpers: `OrbitControls`, `Environment`, `useGLTF`, etc.
- Performance: `useFrame` con throttle para animaciones pesadas

```typescript
// Correcto: cleanup de Three.js
useEffect(() => {
  return () => {
    geometry.dispose()
    material.dispose()
    texture?.dispose()
  }
}, [])
```

## Animaciones
- **GSAP**: Para animaciones de scroll (ScrollTrigger) y timelines complejas
  - Siempre `timeline.kill()` en cleanup de useEffect
  - Usar `gsap.context()` para scope de animaciones en componentes
- **Framer Motion**: Para transiciones entre componentes y micro-interacciones
  - Definir `variants` fuera del componente (evitar re-creación)
  - Usar `AnimatePresence` para exit animations
- **Lottie**: Para micro-animaciones con archivos JSON
  - Lazy-load JSON files: `dynamic(() => import('./animation.json'))`
  - Usar `lottie-react` con `autoplay` y `loop` props

## UI (HeroUI + Tailwind)
- Usar componentes HeroUI como base
- Extender con Tailwind utilities, no CSS custom
- Responsive: mobile-first con breakpoints de Tailwind
- Dark mode: preparar para HeroUI theme system

## State Management
- tRPC queries como fuente de datos del servidor
- React Hook Form + Zod para formularios
- `useState`/`useReducer` para state local
- Context API para state compartido en subtrees pequeños

## Validations
- Import schemas de `@package/validations`
- React Hook Form con `zodResolver` para validación de formularios
- Nunca duplicar schemas de validación en frontend

## Performance
- Dynamic imports para componentes pesados (3D scenes, charts)
- `React.memo` para componentes con props estables que re-renderizan frecuentemente
- `useMemo`/`useCallback` solo cuando hay beneficio medible
- Images optimizadas con next/image (WebP, lazy loading automático)
