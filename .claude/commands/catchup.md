# Catchup — Alpadev AI

Analiza el estado actual del proyecto y cambios recientes para ponerse al día.

## Steps

1. **Git status y cambios recientes**
   ```bash
   git status
   git log --oneline -20
   git diff --stat HEAD~5
   ```

2. **Revisar estructura del monorepo**
   - Verificar `pnpm-workspace.yaml` para packages activos
   - Revisar `turbo.json` para pipeline y env vars
   - Check `docker-compose.yml` para servicios

3. **Estado de packages**
   - `packages/api/src/root.ts` — routers registrados
   - `packages/db/prisma/schema.prisma` — modelos actuales
   - `packages/validations/src/` — schemas disponibles

4. **Estado del frontend**
   - `apps/frontend/app/` — rutas disponibles
   - Componentes 3D activos (Three.js/R3F)
   - Integraciones (Google Calendar, Canny)

5. **Dependencies**
   ```bash
   pnpm outdated
   ```

6. **Issues/TODOs en el código**
   ```bash
   grep -rn "TODO\|FIXME\|HACK\|XXX" apps/ packages/ --include="*.ts" --include="*.tsx" | head -30
   ```

7. **Resumen**
   - Reportar estado general del proyecto
   - Listar cambios recientes relevantes
   - Identificar TODOs y deuda técnica
   - Sugerir próximos pasos
