import { createTRPCRouter, publicProcedure } from "../../trpc";
import { BookingService } from "./service/booking.service";
import { ScheduleMeetingSchema } from "@package/validations";

export const bookingRouter = createTRPCRouter({
  scheduleMeeting: publicProcedure
    .input(ScheduleMeetingSchema)
    .mutation(async ({ ctx, input }) => {
      // Instantiate Service with DB from context
      const service = new BookingService(ctx.db);
      return await service.scheduleMeeting(input);
    }),
});
