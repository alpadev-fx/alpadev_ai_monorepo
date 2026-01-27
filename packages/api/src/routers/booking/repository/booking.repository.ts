import { type PrismaClient } from "@package/db";

export class BookingRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: {
    name: string;
    email: string;
    startTime: Date;
    endTime: Date;
    meetLink?: string;
    googleEventId?: string;
    notes?: string;
    userId?: string;
  }) {
    return this.db.booking.create({
      data: {
        ...data,
        status: "CONFIRMED",
      },
    });
  }

  async findById(id: string) {
    return this.db.booking.findUnique({
      where: { id },
    });
  }
}
