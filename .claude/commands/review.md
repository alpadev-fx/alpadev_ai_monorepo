# Review — Alpadev AI

Revisa código pendiente (staged changes o PR) con el checklist completo del proyecto.

## Steps

1. **Obtener cambios**
   ```bash
   git diff --cached --stat     # Staged changes
   git diff --cached            # Full diff
   # O si es PR:
   git log main..HEAD --oneline
   git diff main...HEAD
   ```

2. **Review por capa**

   ### TypeScript & Types
   - [ ] Sin `any`, sin `@ts-ignore`
   - [ ] Tipos inferidos de Prisma/Zod (no interfaces manuales)
   - [ ] Exports nombrados (no default, excepto pages/R3F)

   ### API (tRPC)
   - [ ] Patrón Repository → Service → Router respetado
   - [ ] Procedure level correcto (public/protected/admin)
   - [ ] Input validado con Zod de @package/validations
   - [ ] Errors como TRPCError con código apropiado
   - [ ] No side effects en queries

   ### Database
   - [ ] Prisma queries con select/include optimizado
   - [ ] ObjectId validation en inputs
   - [ ] Mongoose usado solo cuando Prisma no alcanza
   - [ ] Transacciones para operaciones multi-documento

   ### Frontend
   - [ ] Server Components por defecto
   - [ ] "use client" justificado
   - [ ] Three.js/R3F con cleanup (dispose, kill)
   - [ ] GSAP/Framer Motion con cleanup
   - [ ] Images con next/image
   - [ ] Forms con React Hook Form + Zod resolver

   ### Security
   - [ ] Sin secrets en código
   - [ ] Auth levels correctos
   - [ ] Input sanitized
   - [ ] External service calls con error handling

   ### Performance
   - [ ] 3D scenes lazy-loaded
   - [ ] Dynamic imports para chunks pesados
   - [ ] No memory leaks en effects
   - [ ] tRPC queries con caching config

   ### Testing
   - [ ] Tests para nueva funcionalidad
   - [ ] Tests existentes siguen pasando
   - [ ] Mocks apropiados (no over-mocking)

   ### Package Boundaries
   - [ ] Imports vía workspace aliases
   - [ ] No circular dependencies
   - [ ] Validations en @package/validations

3. **Resumen**
   - Issues encontrados (bloqueantes y no-bloqueantes)
   - Sugerencias de mejora
   - Aprobación o request changes
