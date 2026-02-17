# Domain Rules — Alpadev AI

## 10 Business Domains

### 1. User
- Profile CRUD, preferences, language settings
- Role management: GUEST → USER → ADMIN
- OAuth account linking (Google, GitHub)
- Models: User, Account, Session

### 2. Admin
- Dashboard de administración
- User management (CRUD, role changes)
- Statistics y analytics
- Sub-routers: adminUser, statistics

### 3. Request
- Sistema de solicitudes de servicio
- Workflow: PENDING → IN_PROGRESS → COMPLETED / CANCELLED
- Types: definidos por RequestType enum
- Priority: LOW, MEDIUM, HIGH, URGENT
- Attachments support (via R2)

### 4. Newsletter
- Subscription management
- Email validation
- Unsubscribe flow
- Integration con Resend para envío

### 5. Transaction
- Registro de transacciones financieras
- Status tracking: TransactionStatus enum
- Linked to User
- Amount, description, date

### 6. Bill
- Generación de facturas/bills
- Status workflow: BillStatus enum
- Due date tracking
- Items (line items)
- Subscription billing: SubscriptionStatus, BillingInterval

### 7. Invoice
- Generación de invoices
- Similar a Bill pero para facturación formal
- Status workflow: InvoiceStatus enum
- PDF generation (future)

### 8. Cloudflare (R2)
- File upload/download via pre-signed URLs
- S3-compatible API
- Content-Type validation
- File size limits

### 9. Booking
- Sistema de reservas/appointments
- Availability checking (date/time conflicts)
- Status workflow: BookingStatus enum
- Google Calendar sync
- User linking

### 10. Calendar
- Google Calendar API integration
- Event CRUD (create, read, update, delete)
- Sync con sistema de bookings
- OAuth token management

## Status Enums (Workflows)

```
Request: PENDING → IN_PROGRESS → COMPLETED | CANCELLED
Transaction: PENDING → COMPLETED | FAILED | CANCELLED
Bill: DRAFT → PENDING → PAID | OVERDUE | CANCELLED
Invoice: DRAFT → SENT → PAID | OVERDUE | CANCELLED
Booking: PENDING → CONFIRMED → COMPLETED | CANCELLED | NO_SHOW
```

## Cross-Domain Rules

1. **Booking ↔ Calendar**: Toda creación/actualización de booking debe sincronizar con Google Calendar
2. **Request ↔ Notification**: Cambios de status en Request deben enviar notificación (email/WhatsApp)
3. **Bill/Invoice ↔ Transaction**: Pagos generan Transaction records
4. **User ↔ Newsletter**: Unsubscribe de newsletter no afecta account
5. **Admin**: Solo role ADMIN puede acceder a admin router y sub-routers

## Data Integrity
- Soft delete preferido sobre hard delete
- CreatedAt/UpdatedAt en todos los modelos
- UserId tracking para auditoría
- Status transitions validadas en service layer (no saltar estados)
