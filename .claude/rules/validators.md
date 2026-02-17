# Validation Rules — Alpadev AI

## Single Source of Truth

`@package/validations` es el único lugar para definir schemas Zod.
Shared entre frontend (React Hook Form) y API (tRPC input validation).

## Ubicación

```
packages/validations/src/
├── booking.ts       # Booking schemas
├── user.ts          # User schemas
├── request.ts       # Request schemas
├── transaction.ts   # Transaction schemas
├── bill.ts          # Bill schemas
├── invoice.ts       # Invoice schemas
├── newsletter.ts    # Newsletter schemas
├── calendar.ts      # Calendar event schemas
├── cloudflare.ts    # File upload schemas
└── index.ts         # Re-exports all schemas
```

## Convenciones

### Naming
```typescript
// Schema para crear: create{Model}Schema
export const createBookingSchema = z.object({...})

// Schema para actualizar: update{Model}Schema
export const updateBookingSchema = z.object({...})

// Schema de respuesta (si necesario): {model}ResponseSchema
export const bookingResponseSchema = z.object({...})

// Inferir tipos del schema
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>
```

### ObjectId Validation
```typescript
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')

// Usar en schemas que referencian otros modelos
export const createBookingSchema = z.object({
  userId: objectIdSchema,
  date: z.string().datetime(),
  // ...
})
```

### Enum Validation
```typescript
// Mapear enums de Prisma a Zod
import { BookingStatus } from '@package/db'
export const bookingStatusSchema = z.nativeEnum(BookingStatus)
```

## Reglas

1. **Nunca duplicar schemas** — importar siempre de @package/validations
2. **Tipos inferidos** — usar `z.infer<>` en vez de interfaces manuales
3. **Validación estricta** — usar `.min()`, `.max()`, `.email()`, `.url()`, etc.
4. **ObjectId always validated** — usar regex pattern para MongoDB ObjectIds
5. **Optional vs nullable** — usar `.optional()` para campos omitibles, `.nullable()` para que acepten null
6. **Enums de Prisma** — usar `z.nativeEnum()` para mantener sincronización
7. **Transforms** — usar `.transform()` para normalizar datos (trim, lowercase emails)
8. **Error messages** — custom messages en español o inglés según contexto

## Uso en Frontend (React Hook Form)
```typescript
import { zodResolver } from '@hookform/resolvers/zod'
import { createBookingSchema } from '@package/validations'

const form = useForm({
  resolver: zodResolver(createBookingSchema),
})
```

## Uso en API (tRPC)
```typescript
import { createBookingSchema } from '@package/validations'

export const bookingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createBookingSchema)
    .mutation(({ input }) => { /* input is typed */ }),
})
```
