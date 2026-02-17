# Email Rules — Alpadev AI (React Email + Resend)

## Stack
- **Templates**: React Email (packages/email/)
- **Transport**: Resend (RESEND_API_KEY)
- **Location**: `packages/email/`

## Estructura

```
packages/email/
├── src/
│   ├── templates/
│   │   ├── booking-confirmation.tsx   # Booking confirmation email
│   │   ├── request-status.tsx         # Request status update
│   │   ├── invoice-sent.tsx           # Invoice delivery
│   │   ├── newsletter.tsx             # Newsletter template
│   │   ├── welcome.tsx                # Welcome email
│   │   └── password-reset.tsx         # Password reset
│   ├── send.ts                        # Resend send function
│   └── index.ts                       # Re-exports
```

## React Email Patterns

```typescript
// templates/booking-confirmation.tsx
import { Html, Head, Body, Container, Text, Button } from '@react-email/components'

interface BookingConfirmationProps {
  userName: string
  date: string
  time: string
  bookingId: string
}

export const BookingConfirmation = ({ userName, date, time, bookingId }: BookingConfirmationProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container>
        <Text>Hi {userName}, your booking is confirmed!</Text>
        <Text>Date: {date} at {time}</Text>
        <Button href={`${baseUrl}/bookings/${bookingId}`}>
          View Booking
        </Button>
      </Container>
    </Body>
  </Html>
)
```

## Reglas

1. **Templates tipados** — Props interface para cada template
2. **Inline styles** — React Email usa inline styles, no Tailwind
3. **Preview** — Usar `pnpm email:dev` para preview de templates
4. **No PII en logs** — No loggear contenido de emails
5. **Resend errors** — Handle Resend API errors gracefully
6. **Sender domain** — Configurar dominio verificado en Resend
7. **Rate limits** — Respetar rate limits de Resend
8. **Templates reutilizables** — Shared layouts para header/footer
9. **I18n** — Templates preparados para múltiples idiomas (Language enum)
