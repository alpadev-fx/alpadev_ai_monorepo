import { adminRouter } from "./routers/admin/admin.router"
import { requestRouter } from "./routers/request/request.router"
import { newsletterRouter } from "./routers/newsletter/newsletter.router"
import { transactionRouter } from "./routers/transaction/transaction.router"
import { billRouter } from "./routers/bill/bill.router"
import { invoiceRouter } from "./routers/invoice/invoice.router"
import { userRouter } from "./routers/user/user.router"
import { cloudFlareR2Router } from "./routers/cloudflare/cloudFlareR2.router"
import { bookingRouter } from "./routers/booking/booking.router"
import { calendarRouter } from "./routers/google-calendar/calendar.router"
import { chatbotRouter } from "./routers/chatbot/chatbot.router"
import { chatRouter } from "./routers/chat/chat.router"
import { prospectRouter } from "./routers/prospect/prospect.router"
import { infrastructureRouter } from "./routers/infrastructure/infrastructure.router"
import { permissionRouter } from "./routers/permission/permission.router"
import { createTRPCRouter } from "./trpc"

export const appRouter = createTRPCRouter({
  user: userRouter,
  admin: adminRouter,
  request: requestRouter,
  newsletter: newsletterRouter,
  transaction: transactionRouter,
  bill: billRouter,
  invoice: invoiceRouter,
  cloudflare: cloudFlareR2Router,
  booking: bookingRouter,
  calendar: calendarRouter,
  chatbot: chatbotRouter,
  chat: chatRouter,
  prospect: prospectRouter,
  infrastructure: infrastructureRouter,
  permission: permissionRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
