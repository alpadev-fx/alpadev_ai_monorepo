import { db } from "@package/db";
import type { Prisma } from "@package/db";
import type { ChatRoomStatus, ChatSenderType } from "@package/validations";

export class ChatRepository {
  async createRoom(visitorId: string, visitorIp?: string) {
    return db.chatRoom.create({
      data: { visitorId, visitorIp },
    });
  }

  async findRoomById(roomId: string) {
    return db.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 100,
        },
      },
    });
  }

  async findRoomByVisitorId(visitorId: string) {
    return db.chatRoom.findFirst({
      where: {
        visitorId,
        status: { not: "closed" },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateRoomStatus(roomId: string, status: ChatRoomStatus) {
    return db.chatRoom.update({
      where: { id: roomId },
      data: {
        status,
        ...(status === "closed" ? { closedAt: new Date() } : {}),
      },
    });
  }

  async updateRoomVisitorInfo(
    roomId: string,
    data: { visitorName?: string; visitorEmail?: string }
  ) {
    return db.chatRoom.update({
      where: { id: roomId },
      data,
    });
  }

  async updateRoomMetadata(roomId: string, metadata: Prisma.InputJsonValue) {
    return db.chatRoom.update({
      where: { id: roomId },
      data: { metadata },
    });
  }

  async createMessage(data: {
    roomId: string;
    senderType: ChatSenderType;
    senderName?: string;
    content: string;
  }) {
    return db.chatMessage.create({
      data: {
        roomId: data.roomId,
        senderType: data.senderType,
        senderName: data.senderName,
        content: data.content,
      },
    });
  }

  async getMessages(roomId: string, limit = 50, cursor?: string) {
    return db.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
  }

  async getActiveRooms(status?: ChatRoomStatus) {
    return db.chatRoom.findMany({
      where: {
        status: status ? status : { not: "closed" },
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getRoomCount(status?: ChatRoomStatus) {
    return db.chatRoom.count({
      where: status ? { status } : { status: { not: "closed" } },
    });
  }
}
