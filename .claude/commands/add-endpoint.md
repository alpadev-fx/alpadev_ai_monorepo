# Add Endpoint — Alpadev AI

Crea un nuevo endpoint tRPC completo siguiendo el patrón Repository → Service → Router.

## Input
- `$ARGUMENTS` — Nombre del dominio y operación (e.g., "booking.getByUser")

## Steps

1. **Identificar dominio y operación**
   - Parsear `$ARGUMENTS` para extraer dominio (e.g., booking) y operación (e.g., getByUser)
   - Verificar que el dominio existe en `packages/api/src/routers/`

2. **Definir Zod schema** (si necesario)
   - Crear/actualizar schema en `packages/validations/src/{dominio}.ts`
   - Exportar schema e inferir tipo con `z.infer<>`
   - Re-exportar desde `packages/validations/src/index.ts`

3. **Crear Repository method**
   - En `packages/api/src/routers/{dominio}/{dominio}.repository.ts`
   - Solo query Prisma/Mongoose, sin lógica de negocio
   - Tipos de Prisma para input/output

4. **Crear Service method**
   - En `packages/api/src/routers/{dominio}/{dominio}.service.ts`
   - Lógica de negocio, validación de reglas
   - Manejo de errores con TRPCError
   - Llamadas a repository

5. **Crear Router procedure**
   - En `packages/api/src/routers/{dominio}/{dominio}.router.ts`
   - Elegir nivel: publicProcedure / protectedProcedure / adminProcedure
   - Input validation con Zod schema
   - Delegar a service

6. **Registrar en root router** (si dominio nuevo)
   - Agregar import y registro en `packages/api/src/root.ts`

7. **Verificar**
   - TypeScript compila sin errores: `pnpm build --filter=@package/api`
   - Tipos inferidos correctamente en el cliente tRPC

## Output
- Nuevo endpoint funcional con type safety end-to-end
- Schema Zod compartido entre frontend y API
- Repository → Service → Router pattern completo
