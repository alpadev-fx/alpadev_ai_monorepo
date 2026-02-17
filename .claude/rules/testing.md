# Testing Rules — Alpadev AI

## Stack
- **E2E**: Playwright 1.57.0
- **Unit/Integration**: Vitest (recommended)
- **API**: tRPC caller testing

## Estructura de Tests

```
apps/frontend/
├── e2e/                    # Playwright E2E tests
│   ├── booking.spec.ts
│   ├── auth.spec.ts
│   └── admin.spec.ts
├── __tests__/              # Component unit tests
│   └── components/

packages/api/
├── __tests__/
│   ├── routers/            # tRPC router tests
│   ├── services/           # Service layer tests
│   └── repositories/       # Repository tests

packages/validations/
├── __tests__/
│   └── schemas/            # Zod schema tests
```

## Naming Convention
- Unit tests: `{module}.test.ts`
- Integration tests: `{module}.integration.test.ts`
- E2E tests: `{flow}.spec.ts`

## Reglas

### General
1. AAA pattern: Arrange → Act → Assert
2. Un assert principal por test (asserts relacionados OK)
3. Test behavior, not implementation
4. Tests deben ser independientes (no depender del orden)
5. No test sin assert explícito

### tRPC Testing
```typescript
// Usar createCallerFactory para tests de router
const createCaller = createCallerFactory(appRouter)

// Test con auth
const authCaller = createCaller({
  session: { user: { id: 'test-id', role: 'USER' } },
  prisma: mockPrisma,
})

// Test sin auth
const anonCaller = createCaller({ session: null, prisma: mockPrisma })
```

### Mocking
- Mock Prisma con `vitest-mock-extended`
- Mock external services: Twilio, Google Calendar, Genkit, R2
- Mock NextAuth session para protected procedures
- Nunca mock la lógica que estás testeando

### E2E (Playwright)
- Page Object Model para páginas complejas
- `test.describe` para agrupar tests relacionados
- `test.beforeEach` para setup común (login, navigation)
- Screenshots en failure para debugging
- No depender de datos de producción

### Database
- Test database separada (mongo en Docker)
- Seed data para cada test suite
- Cleanup después de cada test
- No testear contra production/staging

## Comandos
```bash
pnpm test              # All unit/integration tests
pnpm test:e2e          # Playwright E2E
pnpm test:coverage     # Coverage report
pnpm test -- --watch   # Watch mode
```

## Coverage Goals
- Services: > 80% coverage
- Validators: > 90% coverage
- Routers: > 70% coverage
- Frontend components: > 60% coverage
- E2E: Critical user flows covered
