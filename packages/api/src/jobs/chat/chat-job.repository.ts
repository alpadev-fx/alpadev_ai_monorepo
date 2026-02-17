import { db } from "@package/db";
import type { Prisma } from "@package/db";

export class ChatJobRepository {
  async create(roomId: string, payload: Prisma.InputJsonValue) {
    return db.chatJob.create({
      data: {
        roomId,
        status: "pending",
        payload,
      },
    });
  }

  async updateStatus(id: string, status: "processing" | "completed" | "failed") {
    return db.chatJob.update({
      where: { id },
      data: { status },
    });
  }

  async complete(id: string, result: Prisma.InputJsonValue) {
    return db.chatJob.update({
      where: { id },
      data: {
        status: "completed",
        result,
      },
    });
  }

  async fail(id: string, error: string) {
    return db.chatJob.update({
      where: { id },
      data: {
        status: "failed",
        error,
      },
    });
  }
}
