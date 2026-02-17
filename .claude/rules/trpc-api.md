# tRPC API Rules — Alpadev AI

## Arquitectura: Repository → Service → Router

Cada dominio en `packages/api/src/routers/{domain}/` sigue esta estructura:

```
{domain}/
├── {domain}.repository.ts    # Data access layer (Prisma/Mongoose queries)
├── {domain}.service.ts       # Business logic layer
├── {domain}.router.ts        # tRPC procedure definitions
└── index.ts                  # Re-exports
```

### Repository Layer
- Solo operaciones de datos (Prisma o Mongoose)
- No lógica de negocio
- Recibe datos ya validados
- Retorna tipos Prisma directamente

```typescript
// booking.repository.ts
export const bookingRepository = {
  create: (data: Prisma.BookingCreateInput) => prisma.booking.create({ data }),
  findById: (id: string) => prisma.booking.findUnique({ where: { id } }),
  findByDateRange: (start: Date, end: Date) =>
    prisma.booking.findMany({ where: { date: { gte: start, lte: end } } }),
}
```

### Service Layer
- Lógica de negocio y validación de reglas
- Orquesta llamadas a repository
- Maneja errores de negocio (TRPCError)
- Puede llamar otros services o integrations

```typescript
// booking.service.ts
export const bookingService = {
  async createBooking(input: CreateBookingInput, userId: string) {
    const conflicts = await bookingRepository.findByDateRange(input.date, input.date)
    if (conflicts.length > 0) {
      throw new TRPCError({ code: 'CONFLICT', message: 'Time slot already booked' })
    }
    return bookingRepository.create({ ...input, userId })
  },
}
```

### Router Layer
- Solo definición de tRPC procedures
- Valida input con Zod
- Delega toda lógica al service
- Tres tipos de procedures:

```typescript
// booking.router.ts
export const bookingRouter = createTRPCRouter({
  // Public: sin auth
  getAvailableSlots: publicProcedure
    .input(z.object({ date: z.string() }))
    .query(({ input }) => bookingService.getAvailable(input.date)),

  // Protected: requiere session
  create: protectedProcedure
    .input(createBookingSchema)
    .mutation(({ input, ctx }) => bookingService.createBooking(input, ctx.session.user.id)),

  // Admin: requiere role ADMIN
  deleteAny: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => bookingService.deleteBooking(input.id)),
})
```

## 10 Domain Routers

1. **user** — Profile management, preferences
2. **admin** — Admin dashboard, user management, statistics
3. **request** — Service requests (CRUD, status workflow)
4. **newsletter** — Newsletter subscription management
5. **transaction** — Financial transactions
6. **bill** — Bill generation and tracking
7. **invoice** — Invoice generation and tracking
8. **cloudflare** — Cloudflare R2 file storage operations
9. **booking** — Booking system with availability
10. **calendar** — Google Calendar integration

## Reglas

1. **Zod schemas** importados de `@package/validations` — nunca inline en el router
2. **Error codes** apropiados: NOT_FOUND, UNAUTHORIZED, FORBIDDEN, BAD_REQUEST, CONFLICT
3. **No side effects en queries** — queries son read-only, mutations para write
4. **Context typing**: `ctx.session.user` tiene `id`, `role`, `email`
5. **Pagination**: Usar cursor-based para listas grandes
6. **Select fields**: Siempre especificar qué campos retornar
