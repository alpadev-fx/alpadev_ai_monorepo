/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding admin user...")

  const existing = await prisma.user.findFirst({
    where: { username: "admin_onshapers" },
  })

  if (existing) {
    console.log("Admin user already exists, skipping.")
    return
  }

  const admin = await prisma.user.create({
    data: {
      name: "Admin OnShapers",
      email: "admin@onshapers.com",
      phone: "+0000000000",
      role: "ADMIN",
      username: "admin_onshapers",
      // bcrypt hash of "0nS4p3rS@13001" with 10 rounds
      password: "$2b$10$ivDA0/d26QbWrrXXa5yt6OwJ5eIVBaOx66m/V3vA9p.mQk3abfHHy",
    },
  })

  console.log(`Admin user created: ${admin.id} (${admin.username})`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("Error seeding admin:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
