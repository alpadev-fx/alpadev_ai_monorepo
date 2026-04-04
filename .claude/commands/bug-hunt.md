# Bug Hunt — Alpadev AI Monorepo

Operación de caza de bugs coordinada multi-agente. Inspirada en el sprint structure de gstack (Think → Plan → Build → Review → Test → Ship → Reflect), esta operación despliega **todos los agentes del equipo en paralelo**, cada uno cazando fallas desde su especialidad, con un consolidado final unificado.

## Filosofía

> "Un solo revisor encuentra bugs superficiales. Un equipo coordinado con roles distintos encuentra los bugs que matan en producción."
> — Principio gstack: structured team dynamics > blank-slate review

Cada agente tiene un **ángulo de ataque diferente**. Lo que el Code Reviewer pasa por alto, el Security Reviewer lo detecta. Lo que el DB Specialist ignora, el Performance Engineer lo escala. El resultado es coverage total.

## Protocolo de Ejecución

### FASE 0: Reconnaissance (5 min)

Antes de desplegar agentes, establece el estado actual del codebase:

```bash
# Estado del proyecto
git status
git log --oneline -20
git diff --stat HEAD~5

# Detectar cambios recientes (mayor probabilidad de bugs)
git log --since="7 days ago" --name-only --pretty=format: | sort | uniq -c | sort -rn | head -30

# Detectar archivos más modificados (hotspots de bugs)
git log --since="30 days ago" --name-only --pretty=format: | sort | uniq -c | sort -rn | head -20

# Build check — ¿compila?
pnpm exec tsc --noEmit 2>&1 | tail -50

# Lint check — ¿pasa lint?
pnpm lint 2>&1 | tail -50
```

**Output de Fase 0**: Lista de archivos cambiados recientemente, hotspots, errores de compilación y lint. Esto alimenta a todos los agentes con contexto.

---

### FASE 1: Despliegue Paralelo de Agentes (el core)

Lanza **7 subagentes en paralelo**, uno por cada especialidad del equipo. Cada agente recorre el codebase completo desde su ángulo. Todos comparten el contexto de la Fase 0.

---

#### SUBAGENTE 1: Code Reviewer — Bugs de Lógica y Patterns

**Scope**: TODO el codebase
**Busca**:

```
1. LÓGICA ROTA
   - Condiciones invertidas (if que debería ser if not)
   - Off-by-one errors en loops y slices
   - Null/undefined no manejados (optional chaining faltante)
   - Comparaciones incorrectas (== vs ===, aunque TS ayuda)
   - Switch sin default o con fall-through no intencional
   - Async/await faltante (Promise no awaited = fire-and-forget)

2. VIOLACIONES DE PATTERN
   - Router con lógica de negocio (debería estar en Service)
   - Service con queries directas a Prisma (debería estar en Repository)
   - Repository con validación de negocio (debería estar en Service)
   - Frontend con llamadas directas a Prisma (bypass de tRPC)
   - Zod schemas inline en routers (deberían estar en @package/validations)
   - Default exports donde debería haber named exports

3. TYPE SAFETY
   - Cast con `as` que ocultan errores reales
   - Tipos `any` escondidos (incluyendo en dependencias)
   - Generic constraints faltantes
   - Inferencia de tRPC rota (types no fluyen end-to-end)
   - Prisma types ignorados (interfaces manuales que divergen del schema)

4. DEAD CODE
   - Funciones exportadas que nadie importa
   - Variables asignadas pero nunca leídas
   - Imports no usados
   - Rutas/endpoints que no se llaman desde ningún frontend
   - Condiciones que siempre evalúan igual
```

**Archivos clave a revisar**:
```
packages/api/src/routers/*/     → Todos los .ts
packages/validations/src/       → Todos los schemas
apps/frontend/app/              → Pages y layouts
apps/frontend/components/       → Shared components
apps/frontend/hooks/            → Custom hooks
packages/utils/src/             → Shared utilities
```

---

#### SUBAGENTE 2: Security Reviewer — Vulnerabilidades

**Scope**: Auth, API, webhooks, storage, AI
**Busca**:

```
1. AUTHENTICATION & AUTHORIZATION
   - Procedures protectedProcedure/adminProcedure que deberían tener otro nivel
   - Endpoints que manejan data sensible pero son publicProcedure
   - IDOR: ¿se verifica que el userId del resource coincide con ctx.session.user.id?
   - JWT: ¿expiration configurada? ¿secret rotable?
   - OAuth: ¿redirect URIs validados? ¿state parameter?
   - Session fixation en NextAuth config

2. INPUT INJECTION
   - Mongoose queries construidas con concatenación de strings
   - Inputs de usuario pasados directamente a Genkit prompts (prompt injection)
   - File paths construidos con user input (path traversal en R2)
   - HTML/JS en campos de texto sin sanitización (XSS stored)
   - Regex construidos con user input (ReDoS)

3. DATA EXPOSURE
   - Responses que retornan campos sensibles (passwords, tokens, API keys)
   - Error messages que exponen stack traces o internal paths
   - Logging de PII (emails, phones, tokens)
   - NEXT_PUBLIC_ variables con datos que no deberían ser públicos
   - Source maps habilitados en producción

4. EXTERNAL SERVICES
   - Twilio webhooks sin verificación de firma
   - Google Calendar tokens almacenados inseguramente
   - R2 pre-signed URLs con expiration muy larga (>1h)
   - Resend: ¿sender domain verificado?
   - Canny board token: ¿se usa correctamente?

5. INFRASTRUCTURE
   - Secrets en Dockerfile o docker-compose
   - .env incluido en Docker build context
   - CORS demasiado permisivo (Access-Control-Allow-Origin: *)
   - Rate limiting ausente en endpoints públicos y AI
   - HTTPS no enforced
```

**Archivos clave a revisar**:
```
packages/api/src/routers/*/     → Todos los routers (auth levels)
packages/api/src/webhooks/      → Express webhook handlers
packages/api/src/config/        → AI config, service configs
packages/api/src/prompts/       → AI prompts (injection surface)
packages/auth/                  → NextAuth configuration
apps/frontend/app/api/          → Next.js API routes (si existen)
Dockerfile                      → Build secrets
docker-compose.yml              → Service config
.env.example                    → Leaked secrets
```

---

#### SUBAGENTE 3: DB Specialist — Bugs de Datos

**Scope**: Prisma schema, repositories, Mongoose queries
**Busca**:

```
1. SCHEMA BUGS
   - Campos que deberían ser unique pero no tienen @unique
   - Relaciones sin cascada de delete (orphaned records)
   - Enums en Prisma que no coinciden con los valores usados en código
   - Índices faltantes para queries frecuentes (@@index)
   - Campos DateTime sin default (createdAt/updatedAt)
   - ObjectId fields sin @db.ObjectId annotation

2. QUERY BUGS
   - N+1 queries: findMany seguido de loop con findUnique
   - Queries sin paginación en colecciones que crecen (transactions, bookings)
   - findFirst sin orderBy (resultado indeterminista)
   - deleteMany sin where suficientemente restrictivo
   - updateMany sin validar que el user tiene ownership
   - Transacciones que incluyen operaciones no-transaccionales (external API calls dentro de $transaction)

3. DATA INTEGRITY
   - Status transitions no validadas (booking CANCELLED → CONFIRMED no debería ser posible)
   - Campos required en Prisma pero optional en Zod schema (o viceversa)
   - Concurrent booking creation sin lock (double booking posible)
   - Invoice/Bill amounts calculados en frontend (debería ser server-side)
   - Soft delete no implementado donde se necesita (audit trail)

4. MONGOOSE RISKS
   - Queries construidas con string interpolation (injection)
   - Aggregate pipelines sin $match temprano (full collection scan)
   - findOneAndUpdate sin { new: true } (retorna doc viejo)
   - Schemas Mongoose que divergen de schemas Prisma (dual source of truth)
   - Connections no cerradas o sin pooling config

5. MIGRATION RISKS
   - Campos añadidos como required sin default (rompe docs existentes)
   - Cambios de tipo en campos existentes sin migración de datos
   - Índices removidos que queries aún necesitan
```

**Archivos clave a revisar**:
```
packages/db/prisma/schema.prisma         → Schema completo
packages/api/src/routers/*/*.repository.ts → Todos los repositories
packages/api/src/routers/*/*.service.ts    → Validación de integridad en services
packages/validations/src/                  → Schemas Zod (vs Prisma)
```

---

#### SUBAGENTE 4: TDD Guide — Gaps de Testing

**Scope**: Tests existentes + código sin coverage
**Busca**:

```
1. TESTS FALTANTES CRÍTICOS
   - ¿Hay tests para CADA status transition? (Request, Booking, Bill, Invoice, Transaction)
   - ¿Hay tests para auth levels? (public no puede acceder a protected/admin)
   - ¿Hay tests para edge cases financieros? (amounts negativos, overflow, currency)
   - ¿Hay tests para concurrent booking? (dos usuarios misma hora)
   - ¿Hay tests para webhook idempotency? (mismo webhook procesado 2 veces)
   - ¿Hay E2E para el booking flow completo?

2. TESTS ROTOS O FLAKY
   - Tests que dependen del tiempo actual (Date.now sin mock)
   - Tests que dependen del orden de ejecución
   - Tests con timeouts hardcodeados
   - Tests que acceden a servicios reales (no mockeados)
   - Tests que pasan en local pero fallan en CI (env-dependent)

3. MOCKING INCORRECTO
   - Mocks que no reflejan el comportamiento real del servicio
   - Over-mocking: mock de la función que se está testeando
   - Mocks de Prisma que no validan el input
   - Mocks de external services sin simular error cases
   - Missing mock cleanup entre tests (state leaks)

4. COVERAGE GAPS
   - Services sin tests de error paths (solo happy path)
   - Repositories sin tests de edge cases (empty results, not found)
   - Zod schemas sin tests de rejection (inputs inválidos)
   - Frontend forms sin tests de validation
   - Webhook handlers sin tests de malformed payloads

5. TEST QUALITY
   - Tests sin assertions (test que "pasa" sin verificar nada)
   - Tests con assertions demasiado genéricas (toBeTruthy vs toBe(specificValue))
   - Tests que testean implementación en vez de behavior
   - Describe/it naming que no describe el comportamiento
```

**Archivos clave a revisar**:
```
packages/api/__tests__/         → API tests existentes
apps/frontend/e2e/              → E2E tests existentes
apps/frontend/__tests__/        → Component tests
packages/validations/__tests__/ → Schema tests
# Y COMPARAR con:
packages/api/src/routers/       → Código sin tests
apps/frontend/app/              → Pages sin E2E
```

---

#### SUBAGENTE 5: Performance Engineer — Bugs de Performance

**Scope**: Todo el stack
**Busca**:

```
1. MEMORY LEAKS
   - Three.js geometries/materials/textures sin dispose()
   - GSAP timelines sin kill() en cleanup
   - setInterval sin clearInterval
   - addEventListener sin removeEventListener
   - tRPC subscriptions sin unsubscribe
   - AbortController no usado para fetch requests

2. N+1 QUERIES
   - findMany seguido de loop con findUnique/findFirst
   - Promise.all con array de queries individuales cuando un include bastaría
   - Frontend que hace múltiples tRPC queries que podrían ser una sola

3. RENDERING BUGS
   - Componentes React sin React.memo que se re-renderizan en cada frame (especialmente con R3F)
   - Inline objects/functions en JSX (new object every render)
   - Context providers demasiado arriba causando cascade re-renders
   - useFrame sin throttle en animaciones pesadas
   - Listas >50 items sin virtualización

4. BUNDLE BLOAT
   - import * from (mata tree-shaking)
   - Librerías pesadas sin dynamic import
   - Three.js scenes sin lazy loading (ssr: false)
   - Imágenes sin next/image
   - Fonts sin next/font

5. API BOTTLENECKS
   - Queries sin select (over-fetching from MongoDB)
   - Operaciones secuenciales que pueden ser paralelas (Promise.all)
   - External API calls sin timeout
   - Missing caching en datos estáticos (staleTime no configurado)
```

**Archivos clave a revisar**:
```
packages/api/src/routers/*/*.repository.ts → N+1 queries
apps/frontend/app/_components/             → 3D scenes, heavy components
apps/frontend/components/                  → Shared components
apps/frontend/hooks/                       → Custom hooks
apps/frontend/contexts/                    → Context providers
```

---

#### SUBAGENTE 6: Algorithmic Analyst — Bugs de Complejidad

**Scope**: Toda función del codebase
**Busca**:

```
1. COMPLEJIDAD CUADRÁTICA O PEOR
   - Loops anidados sobre los mismos datos
   - .find() dentro de .map()/.forEach()/.filter()
   - .includes() dentro de loop (O(n²) → Set para O(n))
   - Sorting + búsqueda lineal cuando un Map/index bastaría
   - Aggregation pipelines que procesan toda la colección antes de filtrar

2. ALGORITMOS INCORRECTOS
   - Búsqueda de conflictos de booking con iteración completa (debería ser query)
   - Cálculo de totales con reduce pero sin early termination para errors
   - Status transitions verificadas con if-else chains en vez de state machine
   - Date range queries implementadas en JS en vez de en MongoDB

3. ESTRUCTURAS DE DATOS SUBÓPTIMAS
   - Arrays usados como lookup tables (debería ser Map)
   - Búsquedas de existencia en Arrays (debería ser Set)
   - Objetos re-creados en cada render (debería ser useMemo/const)
   - Datos derivados recalculados sin necesidad (debería ser cached)

4. ANTI-PATTERNS ALGORÍTMICOS
   - .filter().length > 0 en vez de .some()
   - .filter()[0] en vez de .find()
   - .map().flat() en vez de .flatMap()
   - Spread en loop: items = [...items, newItem] (O(n²) acumulativo)
   - String concatenation en loop en vez de array.join()
```

**Archivos clave a revisar**:
```
packages/api/src/routers/*/*.service.ts    → Business logic
packages/api/src/routers/*/*.repository.ts → Data transforms
packages/validations/src/                  → Schema transforms
apps/frontend/hooks/                       → Data processing hooks
packages/utils/src/                        → Shared utilities
```

---

#### SUBAGENTE 7: Architect — Bugs Estructurales y de Diseño

**Scope**: Arquitectura cross-cutting
**Busca**:

```
1. VIOLACIONES DE BOUNDARIES
   - Frontend importando directamente de packages/api internals
   - Package A importando de package B sin declarar dependencia en package.json
   - Circular dependencies entre packages
   - tRPC y Express middleware mezclados
   - Validaciones definidas fuera de @package/validations

2. CROSS-DOMAIN BUGS
   - Booking creado sin sync a Google Calendar (domain rule violada)
   - Request status cambiado sin notificación (domain rule violada)
   - Bill/Invoice paid sin crear Transaction record
   - User deleted sin cascade a bookings/transactions/requests
   - Newsletter unsubscribe que afecta la cuenta del usuario

3. CONFIGURATION DRIFT
   - turbo.json globalEnv no incluye env vars nuevas
   - TypeScript configs inconsistentes entre packages
   - ESLint rules que difieren entre packages
   - Docker build que no cachea layers correctamente
   - package.json scripts que no usan turbo run

4. ESTADO INCONSISTENTE
   - Frontend cache (tRPC) desincronizado con server después de mutations
   - Optimistic updates sin rollback en error
   - Google Calendar events que no reflejan cambios de booking
   - Newsletter subscriber count que no se actualiza al unsubscribe

5. ERROR PROPAGATION
   - External service failure que mata toda la operación (debería ser graceful)
   - Errors que se swallow silenciosamente (catch vacío o catch con solo console.log)
   - tRPC errors que no llegan correctamente al frontend
   - Webhook failures que no se reintentan
```

**Archivos clave a revisar**:
```
packages/api/src/root.ts                   → Router composition
packages/api/src/trpc.ts                   → Context, middleware
packages/api/src/routers/*/*.service.ts    → Cross-domain calls
apps/frontend/app/                         → Page structure, imports
turbo.json                                 → Pipeline config
package.json (root + each package)         → Dependencies
docker-compose.yml                         → Service config
Dockerfile                                 → Build process
```

---

### FASE 2: Consolidación (Critical Path)

Después de que los 7 subagentes reporten, **consolida** en un único reporte unificado.

#### Clasificación de Severidad

```
🔴 P0 — CRITICAL: Bug activo en producción o vulnerabilidad explotable
   → Data loss, security breach, financial error, crash en happy path
   → Fix: INMEDIATO (hoy)

🟠 P1 — HIGH: Bug que afecta funcionalidad core bajo condiciones reales
   → Race condition en bookings, N+1 que mata performance, auth bypass
   → Fix: Esta semana

🟡 P2 — MEDIUM: Bug que afecta edge cases o degrada experiencia
   → Memory leak gradual, testing gap, pattern violation
   → Fix: Este sprint

🔵 P3 — LOW: Mejora de calidad que previene bugs futuros
   → Dead code, naming inconsistency, missing optimization
   → Fix: Backlog
```

#### Deduplicación

Múltiples agentes pueden encontrar el mismo bug desde ángulos distintos. Deduplica:
- Si Security + Code Reviewer encuentran el mismo IDOR → un solo issue, severity del más alto
- Si DB Specialist + Performance Engineer encuentran N+1 → un solo issue, combinar contexto
- Si Architect + Code Reviewer encuentran boundary violation → un solo issue, agregar architectural impact

#### Cross-Reference Matrix

```
| Bug ID | Encontrado por | Confirmado por | Severity | Domain | Tipo |
|--------|---------------|----------------|----------|--------|------|
| BH-001 | Security | Code Reviewer | P0 | booking | IDOR |
| BH-002 | DB Specialist | Perf Engineer | P0 | transaction | N+1 |
| BH-003 | Architect | TDD Guide | P1 | booking↔calendar | Sync |
| ... |
```

---

### FASE 3: Reporte Final

#### Formato del Reporte

```markdown
# 🔍 Bug Hunt Report — Alpadev AI
**Fecha**: {fecha}
**Commit**: {hash}
**Agentes desplegados**: 7/7
**Archivos analizados**: X
**Bugs encontrados**: X (P0: X, P1: X, P2: X, P3: X)

## Executive Summary
{2-3 oraciones sobre el estado general de salud del codebase}

## 🔴 P0 — Critical (Fix Inmediato)

### [BH-001] {Título descriptivo del bug}
- **Encontrado por**: {agente(s)}
- **Ubicación**: {file:line}
- **Dominio**: {booking, user, etc.}
- **Categoría**: {Logic | Security | Data Integrity | Performance | Architecture}
- **Descripción**: {Qué está mal y POR QUÉ es crítico}
- **Reproducción**: {Pasos o condiciones para que ocurra}
- **Impacto**: {Qué pasa si no se arregla — data loss? security? UX?}
- **Fix propuesto**:
  ```typescript
  // ANTES (buggy)
  código actual

  // DESPUÉS (fixed)
  código corregido
  ```
- **Tests a agregar**:
  ```typescript
  it('should {prevenir el bug}', () => { ... })
  ```
- **Esfuerzo**: {Xh}

## 🟠 P1 — High (Fix Esta Semana)
{Mismo formato...}

## 🟡 P2 — Medium (Fix Este Sprint)
{Mismo formato...}

## 🔵 P3 — Low (Backlog)
{Mismo formato, puede ser más breve}

## Resumen por Dominio
| Dominio | P0 | P1 | P2 | P3 | Total | Health |
|---------|----|----|----|----|-------|--------|
| booking | X | X | X | X | X | 🔴/🟠/🟡/🟢 |
| transaction | ... |
| ... |

## Resumen por Categoría
| Categoría | Count | Más Afectado |
|-----------|-------|-------------|
| Logic Bugs | X | {domain} |
| Security | X | {domain} |
| Data Integrity | X | {domain} |
| Performance | X | {domain} |
| Testing Gaps | X | {domain} |
| Architecture | X | {domain} |
| Algorithmic | X | {domain} |

## Top 5 Quick Wins
Los 5 bugs con mejor ratio impacto/esfuerzo, con fix completo incluido.

## Recomendaciones Sistémicas
{Patterns repetitivos que indican problemas sistémicos, no solo bugs individuales}
```

---

## Instrucciones para Claude Code

1. **FASE 0 es obligatoria** — establece contexto para todos los agentes
2. **Lanza los 7 subagentes en PARALELO** — no secuencialmente. Cada uno recibe:
   - Su scope específico (archivos y qué buscar)
   - El output de Fase 0 (archivos recientes, errores de build/lint)
   - Instrucción de leer CADA archivo completo de su scope
3. **Cada subagente debe leer archivos reales** — no inventar bugs basándose en suposiciones
4. **Cada bug debe tener ubicación exacta** — archivo:línea, no "en algún lugar del booking service"
5. **Cada bug debe tener fix concreto** — código antes/después, no solo descripción
6. **Deduplica antes de reportar** — si dos agentes encuentran lo mismo, combínalo
7. **Prioriza por impacto en producción** — no por elegancia técnica

## Configuración de Agentes

Todos los subagentes usan la configuración de `.claude/agents/`:
- **Code Reviewer** (sonnet) → Bugs de lógica, patterns, type safety
- **Security Reviewer** (opus) → Vulnerabilidades, auth, injection
- **DB Specialist** (sonnet) → Data integrity, queries, schema
- **TDD Guide** (sonnet) → Testing gaps, test quality
- **Performance Engineer** (opus, effort: max) → Memory leaks, N+1, rendering
- **Algorithmic Analyst** (opus, effort: max) → Complejidad, estructuras de datos
- **Architect** (opus) → Boundaries, cross-domain, config drift

Guarda el reporte final en `docs/bug-hunt-{fecha}.md`.
