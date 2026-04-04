import type { PrismaClient } from "@prisma/client"

export async function seedUsers(prisma: PrismaClient) {
  const base = [
    {
      name: "Juan Pérez",
      username: "juanperez",
      email: "juan.perez@example.com",
      phone: "+573001234567",
      role: "ADMIN" as const,
    },
    {
      name: "María García",
      username: "mariagarcia",
      email: "maria.garcia@example.com",
      phone: "+573002345678",
      role: "ADMIN" as const,
    },
    {
      name: "Carlos López",
      username: "carloslopez",
      email: "carlos.lopez@example.com",
      phone: "+573003456789",
      role: "ADMIN" as const,
    },
    {
      name: "Ana Martínez",
      username: "anamartinez",
      email: "ana.martinez@example.com",
      phone: "+573004567890",
      role: "USER" as const,
    },
    {
      name: "Luis Rodríguez",
      username: "luisrodriguez",
      email: "luis.rodriguez@example.com",
      phone: "+573005678901",
      role: "USER" as const,
    },
    {
      name: "Laura González",
      username: "lauragonzalez",
      email: "laura.gonzalez@example.com",
      phone: "+573006789012",
      role: "USER" as const,
    },
    {
      name: "Pedro Sánchez",
      username: "pedrosanchez",
      email: "pedro.sanchez@example.com",
      phone: "+573007890123",
      role: "USER" as const,
    },
    {
      name: "Carmen Díaz",
      username: "carmendiaz",
      email: "carmen.diaz@example.com",
      phone: "+573008901234",
      role: "USER" as const,
    },
    {
      name: "Jorge Hernández",
      username: "jorgehernandez",
      email: "jorge.hernandez@example.com",
      phone: "+573009012345",
      role: "USER" as const,
    },
    {
      name: "Isabel Ramírez",
      username: "isabelramirez",
      email: "isabel.ramirez@example.com",
      phone: "+573000123456",
      role: "USER" as const,
    },
  ]

  await prisma.user.createMany({
    data: base.map((u) => ({
      name: u.name,
      username: u.username,
      email: u.email,
      phone: u.phone,
      role: u.role,
    })),
  })

  const created = await prisma.user.findMany({
    where: {
      email: {
        in: base.map((u) => u.email),
      },
    },
  })

  return created
}
