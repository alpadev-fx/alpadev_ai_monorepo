# New Feature — Alpadev AI

Implementa una nueva feature completa en el monorepo.

## Input
- `$ARGUMENTS` — Descripción de la feature a implementar

## Steps

1. **Planificación**
   - Parsear `$ARGUMENTS` para entender la feature
   - Identificar packages afectados (api, frontend, validations, db, email)
   - Diseñar el approach (arquitecto mental)
   - Estimar cambios necesarios

2. **Database (si aplica)**
   - Actualizar `packages/db/prisma/schema.prisma`
   - Nuevos modelos o campos
   - Enums necesarios
   - Push schema: `pnpm db:push`

3. **Validations**
   - Crear Zod schemas en `packages/validations/src/{dominio}.ts`
   - Input schemas (create, update)
   - Export types con `z.infer<>`
   - Re-export desde index.ts

4. **API (Repository → Service → Router)**
   - Repository: Data access methods
   - Service: Business logic
   - Router: tRPC procedures (public/protected/admin)
   - Register en root.ts si nuevo dominio

5. **Email templates (si aplica)**
   - React Email template en `packages/email/src/templates/`
   - Props tipados
   - Send function integration

6. **Frontend**
   - Page/Route en `apps/frontend/app/`
   - Components en `apps/frontend/components/`
   - tRPC hooks para data fetching
   - Forms con React Hook Form + Zod resolver
   - UI con HeroUI + Tailwind
   - 3D elements si aplica (R3F, lazy-loaded)

7. **External Integrations (si aplica)**
   - Google Calendar sync
   - Twilio notifications
   - Cloudflare R2 storage
   - Genkit AI processing

8. **Testing**
   - Unit tests para service layer
   - Router tests con tRPC caller
   - E2E con Playwright para flujos críticos

9. **Verificar**
   ```bash
   pnpm build          # Full monorepo build
   pnpm lint           # Lint check
   pnpm test           # All tests
   pnpm test:e2e       # E2E tests
   ```

10. **Commit y PR**
    ```bash
    git checkout -b feat/{feature-name}
    git add -A
    git commit -m "feat: {descripción de la feature}"
    ```

## Output
- Feature completa con type safety end-to-end
- Tests cubriendo casos principales
- Documentación inline (JSDoc en funciones complejas)
