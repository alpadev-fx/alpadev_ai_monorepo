import type { PrismaClient } from "@prisma/client"

export async function seedRequests(
  prisma: PrismaClient,
  users: { id: string }[]
) {
  const TITLES = [
    "Fuga en tubería del baño",
    "Ruido excesivo en la noche",
    "Propuesta de zona de reciclaje",
    "Solicitud de información de cuotas",
    "Corto circuito en el sótano",
  ]

  const TYPES = ["ticket", "quote", "other"] as const
  const STATUSES = ["pending", "accepted", "rejected", "resolved", "cancelled"] as const
  const PRIORITIES = ["low", "medium", "high", "critical"] as const

  const n = Math.min(users.length, TITLES.length)

  for (let i = 0; i < n; i++) {
    await prisma.request.create({
      data: {
        userId: users[i]!.id,
        title: TITLES[i]!,
        description:
          i % 2 === 0
            ? "Se detectó fuga de agua en el baño principal. Requiere revisión urgente."
            : "Varios vecinos reportan ruido constante después de las 11 pm.",
        type: TYPES[i % TYPES.length]!,
        status: STATUSES[i % STATUSES.length]!,
        priority: PRIORITIES[i % PRIORITIES.length]!,
      },
    })
  }
}
