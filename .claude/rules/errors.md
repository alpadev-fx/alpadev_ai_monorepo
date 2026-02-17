# Error Handling Rules — Alpadev AI

## tRPC Errors

Usar `TRPCError` con códigos HTTP semánticos:

```typescript
import { TRPCError } from '@trpc/server'

// 400 — Input inválido (después de Zod, para reglas de negocio)
throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid booking date' })

// 401 — No autenticado
throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })

// 403 — Sin permisos
throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' })

// 404 — Recurso no encontrado
throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' })

// 409 — Conflicto (duplicados, slots ocupados)
throw new TRPCError({ code: 'CONFLICT', message: 'Time slot already booked' })

// 429 — Rate limit
throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded' })

// 500 — Error interno (nunca exponer detalles)
throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' })
```

## Patterns

### Service Layer Error Handling
```typescript
// booking.service.ts
async createBooking(input: CreateBookingInput, userId: string) {
  // Validate business rules
  const user = await userRepository.findById(userId)
  if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })

  const conflicts = await bookingRepository.findByDateRange(input.date)
  if (conflicts.length > 0) {
    throw new TRPCError({ code: 'CONFLICT', message: 'Time slot unavailable' })
  }

  try {
    return await bookingRepository.create({ ...input, userId })
  } catch (error) {
    // Log internal error, throw generic
    console.error('Failed to create booking:', error)
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create booking' })
  }
}
```

### External Service Errors
```typescript
// Wrap external calls (Google Calendar, Twilio, R2)
async syncToGoogleCalendar(booking: Booking) {
  try {
    return await googleCalendar.events.insert(eventData)
  } catch (error) {
    console.error('Google Calendar sync failed:', error)
    // Don't fail the main operation — queue for retry
    await retryQueue.add('calendar-sync', { bookingId: booking.id })
    return null
  }
}
```

### Frontend Error Boundaries
```typescript
// app/error.tsx — Global error boundary
'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### tRPC Error Handling en Frontend
```typescript
const mutation = trpc.booking.create.useMutation({
  onError: (error) => {
    if (error.data?.code === 'CONFLICT') {
      toast.error('That time slot is no longer available')
    } else {
      toast.error('Failed to create booking')
    }
  },
})
```

## Reglas

1. **Nunca swallow errors** — siempre log o throw
2. **Mensajes genéricos en producción** — no exponer detalles internos
3. **Log errors con contexto** — incluir IDs relevantes para debugging
4. **External service failures no deben romper el flujo principal** — usar retry queues
5. **Prisma errors** — catch `PrismaClientKnownRequestError` para errores específicos (unique constraint, etc.)
6. **Mongoose errors** — catch errores de validación y conexión separadamente
7. **Validation errors** — Zod los maneja automáticamente vía tRPC, no catch manual
