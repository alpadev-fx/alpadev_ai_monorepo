# Fix Issue — Alpadev AI

Diagnostica y corrige un bug reportado en el monorepo.

## Input
- `$ARGUMENTS` — Descripción del issue o referencia (e.g., "booking creation fails with CONFLICT error")

## Steps

1. **Entender el issue**
   - Parsear `$ARGUMENTS` para entender el problema
   - Identificar componente afectado (frontend, API, DB, external service)

2. **Reproducir**
   - Localizar código relacionado
   - Entender el flujo: Frontend → tRPC → Service → Repository → DB
   - Identificar condiciones que causan el error

3. **Analizar root cause**
   - Revisar el stack trace o error message
   - Check tipos, validaciones, queries
   - Verificar integraciones externas si aplica

4. **Implementar fix**
   - Corregir en la capa correcta (no parches en capas incorrectas)
   - Mantener type safety
   - No romper otros flujos

5. **Agregar test**
   - Test que reproduce el bug (debe fallar sin el fix)
   - Verificar que pasa con el fix aplicado
   - Test de regresión para casos similares

6. **Verificar**
   ```bash
   pnpm build          # Compila sin errores
   pnpm lint           # Sin warnings nuevos
   pnpm test           # Tests pasan
   ```

7. **Commit**
   ```bash
   git add -A
   git commit -m "fix: {descripción concisa del fix}"
   ```

## Checklist
- [ ] Root cause identificado
- [ ] Fix implementado en la capa correcta
- [ ] Type safety mantenida
- [ ] Test agregado
- [ ] Build pasa
- [ ] No side effects en otros dominios
