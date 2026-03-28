# Performance Audit — Alpadev AI Monorepo

Ejecuta una auditoría exhaustiva de performance y complejidad algorítmica en todo el monorepo, priorizando impacto real en producción.

## Contexto del Proyecto

Monorepo Turborepo full-stack: Next.js 15 + tRPC 11 + Prisma 6/MongoDB + Three.js/R3F + Genkit AI.
10 dominios de negocio: user, admin, request, newsletter, transaction, bill, invoice, cloudflare, booking, calendar.
Patrón: Repository → Service → Router en cada dominio.

## Fase 1: Inventario y Profiling Estático

### 1.1 — Análisis de Complejidad Algorítmica

Recorre **todos** los archivos en estas ubicaciones y clasifica cada función/método por su complejidad Big-O:

```
packages/api/src/routers/*/     → Repositories, Services, Routers
packages/validations/src/       → Zod schemas (transforms, refinements)
apps/frontend/app/              → Server Components, Client Components
apps/frontend/components/       → Shared components
apps/frontend/hooks/            → Custom hooks
packages/utils/src/             → Shared utilities
```

Para cada función encontrada, reporta:

| Función | Archivo | Complejidad Actual | Complejidad Óptima | Impacto | Acción |
|---------|---------|-------------------|-------------------|---------|--------|
| nombre  | path    | O(n²)             | O(n log n)        | ALTO    | Refactorizar con... |

**Prioriza detección de:**
- Loops anidados (O(n²), O(n³)) que pueden reducirse con Maps/Sets/indexación
- Búsquedas lineales repetidas que deberían usar índices o hashmaps
- Recorridos completos de arrays cuando se puede hacer early return
- `.filter().map()` encadenados que pueden resolverse en un solo pass
- Validaciones Zod con `.refine()` costosos que ejecutan N veces
- Prisma queries dentro de loops (N+1 problem)
- Aggregation pipelines de Mongoose sin índices apropiados
- Re-renders innecesarios en componentes React con Three.js/R3F

### 1.2 — Análisis de Queries y Data Access

Para cada dominio (10 routers), analiza los repositories:

```bash
# Buscar N+1 queries
grep -rn "findMany\|findFirst\|findUnique" packages/api/src/routers/*/
# Buscar queries sin select/include
grep -rn "prisma\." packages/api/src/routers/*/*.repository.ts
# Buscar Mongoose queries sin lean()
grep -rn "\.find(\|\.findOne(\|\.aggregate(" packages/api/src/
```

Clasifica cada query:
- **CRITICAL**: N+1 queries, queries sin paginación en colecciones grandes
- **HIGH**: Queries sin select/include (traen todo el documento)
- **MEDIUM**: Queries Mongoose sin `.lean()`, falta de índices compuestos
- **LOW**: Oportunidades de caching, queries que podrían ser batch

### 1.3 — Análisis de Bundle y 3D Performance

```bash
# Analizar imports pesados en frontend
grep -rn "import.*from" apps/frontend/ --include="*.tsx" --include="*.ts" | head -200
# Detectar Three.js sin lazy loading
grep -rn "import.*three\|import.*@react-three" apps/frontend/ --include="*.tsx"
# Detectar GSAP/Framer Motion sin cleanup
grep -rn "gsap\.\|useFrame\|useSpring" apps/frontend/ --include="*.tsx"
```

## Fase 2: Análisis Profundo por Capa

### 2.1 — Backend (tRPC + Prisma + Mongoose)

Para cada uno de los 10 dominios, ejecuta subagentes en paralelo:

**Subagente: Performance Analyst (por dominio)**
```
Analiza packages/api/src/routers/{domain}/ completo:

1. REPOSITORY LAYER:
   - ¿Hay queries N+1? (query en loop que debería ser batch)
   - ¿Se usa select/include para limitar campos?
   - ¿Las queries de lista tienen paginación cursor-based?
   - ¿Hay índices MongoDB para los campos de búsqueda frecuente?
   - ¿Se usa .lean() en Mongoose queries de solo lectura?
   - ¿Hay transacciones donde no se necesitan (overhead)?

2. SERVICE LAYER:
   - ¿Hay operaciones O(n²) o peores?
   - ¿Se validan reglas de negocio antes de hacer queries costosas?
   - ¿Hay Promise.all para operaciones paralelas que están en serie?
   - ¿Se manejan errores sin retry innecesarios?
   - ¿Las integraciones externas (Calendar, Twilio, R2) tienen timeout?

3. ROUTER LAYER:
   - ¿Los queries tienen staleTime/caching configurado?
   - ¿Hay middleware redundante?
   - ¿Los batch operations están disponibles donde tiene sentido?
```

### 2.2 — Frontend (Next.js 15 + Three.js/R3F)

**Subagente: Frontend Performance Analyst**
```
Analiza apps/frontend/ completo:

1. SERVER COMPONENTS vs CLIENT:
   - Componentes marcados "use client" que podrían ser Server Components
   - Data fetching que debería estar en server (evitar waterfalls)
   - Props drilling que podría evitarse con Server Components

2. THREE.JS / R3F PERFORMANCE:
   - Geometrías/materiales sin dispose() en cleanup
   - useFrame sin throttle en animaciones pesadas
   - Texturas sin compresión o sin pooling
   - Scenes sin LOD (Level of Detail)
   - Shaders compilando en runtime que podrían pre-compilarse

3. RENDERING:
   - Componentes sin React.memo que re-renderizan excesivamente
   - useMemo/useCallback faltantes en cálculos costosos
   - Context providers demasiado altos en el árbol (re-render cascading)
   - Listas sin virtualización (más de 50 items)

4. BUNDLE:
   - Imports no tree-shakeable (import * from...)
   - Librerías pesadas sin dynamic import
   - Código duplicado entre chunks
   - Imágenes sin next/image optimization
```

### 2.3 — Validaciones (Zod)

**Subagente: Validation Performance Analyst**
```
Analiza packages/validations/src/ completo:

1. SCHEMAS COSTOSOS:
   - .refine() con lógica async que bloquea
   - .transform() con operaciones O(n) sobre arrays
   - Schemas profundamente anidados (.object dentro de .object x5)
   - .superRefine() que itera colecciones completas

2. OPTIMIZACIONES:
   - ¿Se puede usar .lazy() para schemas recursivos?
   - ¿Hay schemas que se re-parsean innecesariamente?
   - ¿Los schemas de respuesta usan .pick()/.omit() sobre schemas grandes?
```

## Fase 3: Cross-Cutting Concerns

### 3.1 — Memory Leaks

```
Buscar en todo el proyecto:
- EventListeners sin removeEventListener
- setInterval sin clearInterval
- Subscriptions sin unsubscribe
- WebSocket connections sin close
- Three.js objects sin dispose
- GSAP timelines sin kill()
- tRPC subscriptions sin cleanup
```

### 3.2 — Concurrencia y Race Conditions

```
Buscar en todo el proyecto:
- Booking conflicts: ¿la verificación de disponibilidad es atómica?
- Google Calendar sync: ¿hay race condition entre crear booking y crear evento?
- File uploads (R2): ¿se manejan uploads concurrentes al mismo path?
- Newsletter: ¿se previene envío duplicado?
- Transactions: ¿hay isolation level apropiado para operaciones financieras?
```

### 3.3 — Caching Strategy

```
Evaluar oportunidades de caching:
- tRPC: staleTime y gcTime por procedure
- Google Calendar: cache de eventos recientes
- R2: cache de URLs pre-firmadas
- Prisma: query result caching
- Next.js: ISR para páginas semi-estáticas
- API: HTTP cache headers en responses públicas
```

## Fase 4: Reporte y Plan de Acción

### Output Format

Genera un reporte estructurado con:

```markdown
# 🔥 Performance Audit Report — Alpadev AI

## Executive Summary
- Total issues encontrados: X
- Critical (P0): X — Impacto inmediato en UX/costos
- High (P1): X — Degradación notable de performance
- Medium (P2): X — Mejoras significativas posibles
- Low (P3): X — Optimizaciones nice-to-have

## Critical Issues (P0)
### [ISSUE-001] N+1 Query en booking.repository.ts
- **Ubicación**: packages/api/src/routers/booking/booking.repository.ts:42
- **Complejidad actual**: O(n × m) donde n=bookings, m=users
- **Complejidad óptima**: O(n) con include/join
- **Impacto**: Cada listado de bookings hace N queries adicionales
- **Fix propuesto**:
  ```typescript
  // ANTES (O(n×m))
  const bookings = await prisma.booking.findMany()
  for (const b of bookings) {
    b.user = await prisma.user.findUnique({ where: { id: b.userId } })
  }

  // DESPUÉS (O(n))
  const bookings = await prisma.booking.findMany({
    include: { user: { select: { id: true, name: true, email: true } } }
  })
  ```
- **Esfuerzo**: 15 min
- **Ganancia estimada**: -80% tiempo de respuesta en listados

## [Continuar para cada issue...]

## Métricas Objetivo
| Métrica | Actual (estimado) | Target |
|---------|-------------------|--------|
| TTFB (Time to First Byte) | ? | < 200ms |
| FCP (First Contentful Paint) | ? | < 1.5s |
| LCP (Largest Contentful Paint) | ? | < 2.5s |
| Bundle size (JS) | ? | < 200KB initial |
| API response (p95) | ? | < 500ms |
| MongoDB query time (p95) | ? | < 100ms |
| 3D scene load time | ? | < 3s |
| Memory usage (3D scenes) | ? | < 150MB |

## Plan de Implementación (Priorizado)
1. Semana 1: Fix all P0 (Critical)
2. Semana 2: Fix P1 (High) + añadir índices MongoDB
3. Semana 3: P2 (Medium) + caching strategy
4. Semana 4: P3 (Low) + monitoring setup
```

## Instrucciones de Ejecución

1. **Lee TODOS los archivos** de cada capa antes de reportar — no hagas sampling parcial
2. **Usa subagentes en paralelo** para analizar dominios simultáneamente (hasta 10 en paralelo)
3. **Mide, no asumas** — cuando sea posible, ejecuta benchmarks reales
4. **Propón código concreto** — cada issue debe tener un fix con antes/después
5. **Prioriza por impacto en usuario** — latencia percibida > métricas internas
6. **Respeta la arquitectura** — los fixes deben mantener Repository → Service → Router
7. **No rompas type safety** — todos los fixes deben mantener TypeScript estricto

## Benchmarks Opcionales

Si el entorno lo permite, ejecuta:

```bash
# Bundle analysis
cd apps/frontend && npx @next/bundle-analyzer

# TypeScript compile time
time pnpm exec tsc --noEmit

# Prisma query logging
DATABASE_URL="..." npx prisma studio  # check slow queries
```

Guarda el reporte final en `docs/performance-audit-{fecha}.md`.
