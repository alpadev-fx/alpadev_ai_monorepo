import type { PrismaClient } from "@prisma/client"

export async function seedUsers(prisma: PrismaClient) {
  const base = [
    {
      name: "Juan Pérez",
      username: "juanperez",
      email: "juan.perez@example.com",
      phone: "+573001234567",
      document: "1234567890",
      type: "cedula_ciudadania" as const,
      role: "ADMIN" as const,
      hasOnboarded: true,
    },
    {
      name: "María García",
      username: "mariagarcia",
      email: "maria.garcia@example.com",
      phone: "+573002345678",
      document: "2345678901",
      type: "cedula_ciudadania" as const,
      role: "ADMIN" as const,
      hasOnboarded: true,
    },
    {
      name: "Carlos López",
      username: "carloslopez",
      email: "carlos.lopez@example.com",
      phone: "+573003456789",
      document: "3456789012",
      type: "cedula_ciudadania" as const,
      role: "ADMIN" as const,
      hasOnboarded: true,
    },
    {
      name: "Ana Martínez",
      username: "anamartinez",
      email: "ana.martinez@example.com",
      phone: "+573004567890",
      document: "4567890123",
      type: "cedula_ciudadania" as const,
      role: "USER" as const,
      hasOnboarded: true,
    },
    {
      name: "Luis Rodríguez",
      username: "luisrodriguez",
      email: "luis.rodriguez@example.com",
      phone: "+573005678901",
      document: "5678901234",
      type: "cedula_ciudadania" as const,
      role: "USER" as const,
      hasOnboarded: true,
    },
    {
      name: "Laura González",
      username: "lauragonzalez",
      email: "laura.gonzalez@example.com",
      phone: "+573006789012",
      document: "6789012345",
      type: "cedula_ciudadania" as const,
      role: "USER" as const,
      hasOnboarded: true,
    },
    {
      name: "Pedro Sánchez",
      username: "pedrosanchez",
      email: "pedro.sanchez@example.com",
      phone: "+573007890123",
      document: "7890123456",
      type: "cedula_ciudadania" as const,
      role: "USER" as const,
      hasOnboarded: true,
    },
    {
      name: "Carmen Díaz",
      username: "carmendiaz",
      email: "carmen.diaz@example.com",
      phone: "+573008901234",
      document: "8901234567",
      type: "cedula_ciudadania" as const,
      role: "USER" as const,
      hasOnboarded: true,
    },
    {
      name: "Jorge Hernández",
      username: "jorgehernandez",
      email: "jorge.hernandez@example.com",
      phone: "+573009012345",
      document: "9012345678",
      type: "cedula_ciudadania" as const,
      role: "USER" as const,
      hasOnboarded: true,
    },
    {
      name: "Isabel Ramírez",
      username: "isabelramirez",
      email: "isabel.ramirez@example.com",
      phone: "+573000123456",
      document: "0123456789",
      type: "cedula_ciudadania" as const,
      role: "USER" as const,
      hasOnboarded: true,
    },
  ]

  await prisma.user.createMany({
    data: base.map((u) => ({
      name: u.name,
      username: u.username,
      email: u.email,
      phone: u.phone,
      document: u.document,
      type: u.type,
      role: u.role,
      hasOnboarded: true,
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
