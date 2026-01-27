import { BookingRepository } from "../repository/booking.repository";
import { CalendarService } from "../../google-calendar/service/calendar.service";
import type { PrismaClient } from "@package/db";

export class BookingService {
  private repository: BookingRepository;

  constructor(db: PrismaClient) {
    this.repository = new BookingRepository(db);
  }

  async scheduleMeeting(data: {
    name: string;
    email: string;
    notes: string;
    startDate: string; // ISO
    endDate: string;   // ISO
    timeZone: string;
    userId?: string;
  }) {
    // 1. Create Google Calendar Event
    const calendarResult = await CalendarService.createEventWithMeet({
      name: data.name,
      email: data.email,
      startTime: data.startDate,
      endTime: data.endDate,
      summary: `Meeting with ${data.name}`,
      description: `Notes: ${data.notes}\nScheduled via Alpadev Booking System.`,
    });

    // 2. Save to Database using Repository
    const booking = await this.repository.create({
      name: data.name,
      email: data.email,
      startTime: new Date(data.startDate),
      endTime: new Date(data.endDate),
      meetLink: calendarResult.meetLink,
      googleEventId: calendarResult.eventId,
      notes: data.notes,
      userId: data.userId,
    });

    // 3. Send Confirmation Email
    try {
      const { resend, BookingConfirmation } = await import("@package/email");
      const { formatInTimeZone } = await import("date-fns-tz");
      const { enUS } = await import("date-fns/locale");

      // Format date and time for email using the requested timezone
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const timeZone = data.timeZone || "UTC";
      
      const meetingDate = formatInTimeZone(startDate, timeZone, "EEEE, MMMM d, yyyy", { locale: enUS });
      const meetingTime = `${formatInTimeZone(startDate, timeZone, "h:mm a", { locale: enUS })} - ${formatInTimeZone(endDate, timeZone, "h:mm a", { locale: enUS })}`;

      await resend.emails.send({
        from: `Alpadev <${process.env.RESEND_EMAIL_DOMAIN || 'onboarding@resend.dev'}>`,
        to: [data.email],
        subject: "Booking Confirmed: Video Call with Alpadev",
        react: BookingConfirmation({
          guestName: data.name,
          meetingDate,
          meetingTime,
          meetLink: calendarResult.meetLink,
          meetingDescription: data.notes,
        }),
      });
      console.log("[Booking] Confirmation email sent to:", data.email);
    } catch (emailError) {
      console.warn("[Booking] Failed to send confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    return {
      success: true,
      meetLink: calendarResult.meetLink,
      bookingId: booking.id,
    };
  }
}
