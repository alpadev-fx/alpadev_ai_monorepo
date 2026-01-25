import type { PrismaClient } from "@prisma/client"

export async function seedRequests(
  prisma: PrismaClient,
  users: { id: string }[],
  properties: { id: string }[]
) {
  const TITLES = [
    "Fuga en tubería del baño",
    "Ruido excesivo en la noche",
    "Propuesta de zona de reciclaje",
    "Solicitud de información de cuotas",
    "Corto circuito en el sótano",
  ]

  const n = Math.min(users.length, properties.length, TITLES.length)

  for (let i = 0; i < n; i++) {
    const data = {
      userId: users[i].id,
      propertyId: properties[i].id,
      title: TITLES[i],
      description:
        i % 2 === 0
          ? "Se detectó fuga de agua en el baño principal. Requiere revisión urgente."
          : "Varios vecinos reportan ruido constante después de las 11 pm.",
      reservedStart:
        i % 3 === 0 ? new Date(Date.now() + 2 * 3600000) : undefined,
      reservedEnd: i % 3 === 0 ? new Date(Date.now() + 4 * 3600000) : undefined,
      type: [
        "maintenance",
        "complaint",
        "suggestion",
        "information",
        "emergency",
      ][i % 5],
      status: ["pending", "in_progress", "resolved", "cancelled"][i % 4],
      priority: ["low", "medium", "high", "critical"][i % 4],
    }

    await prisma.request.create({
      data: data as unknown as Parameters<
        typeof prisma.request.create
      >[0]["data"],
    })
  }
}
