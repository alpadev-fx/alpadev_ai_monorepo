# General Rules — Alpadev AI Monorepo

## Idioma
- Código, comentarios, commits y PRs en **inglés**
- Documentación técnica en inglés
- Comunicación con el usuario en el idioma que prefiera

## Convenciones de Código
- TypeScript estricto: `strict: true`, sin `any`, sin `@ts-ignore`
- Inferir tipos de Prisma y Zod cuando sea posible
- Nombrar archivos en kebab-case: `booking-service.ts`
- Nombrar componentes React en PascalCase: `BookingForm.tsx`
- Nombrar funciones/variables en camelCase
- Nombrar constantes en UPPER_SNAKE_CASE
- Exports nombrados (no default exports, excepto pages de Next.js y componentes R3F)

## Estructura del Monorepo
- Respetar las boundaries entre packages — imports solo vía workspace aliases
- `@package/validations` es la single source of truth para schemas Zod
- `@package/db` es el único punto de acceso a PrismaClient
- `@package/auth` centraliza toda la configuración de NextAuth
- Nunca importar directamente desde `node_modules` de otro package

## Git
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Un feature/fix por commit
- Branch naming: `feat/booking-calendar`, `fix/invoice-status`
- No commits directos a `main` — siempre PR

## Turborepo
- Respetar el pipeline definido en `turbo.json`
- No modificar global env vars sin actualizar turbo.json
- Usar `turbo run` para tareas que afectan múltiples packages

## Error Handling
- Errores de negocio como `TRPCError` con código apropiado
- Never swallow errors silently — siempre log o throw
- Usar error boundaries en React para componentes críticos
- Wrap async operations en try/catch con error específico
