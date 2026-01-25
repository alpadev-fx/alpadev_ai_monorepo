import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../../trpc";
import { BookingService } from "./service/booking.service";

export const bookingRouter = createTRPCRouter({
  scheduleMeeting: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        notes: z.string().optional().default(""),
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        timeZone: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Instantiate Service with DB from context
      const service = new BookingService(ctx.db);
      return await service.scheduleMeeting(input);
    }),
});
