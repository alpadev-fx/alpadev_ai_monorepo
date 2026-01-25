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
    });

    return {
      success: true,
      meetLink: calendarResult.meetLink,
      bookingId: booking.id,
    };
  }
}
