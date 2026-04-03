/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client"

import { seedRequests } from "./seeds/requests"
import { seedUsers } from "./seeds/users"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seeding...")

  await prisma.request.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  try {
    // 1) Users first (for relations)
    console.log("Seeding users...")
    const users = await seedUsers(prisma)
    console.log(`Created ${users.length} users`)

    // 2) Requests from users
    console.log("Seeding requests...")
    await seedRequests(prisma, users.map((u) => ({ id: u.id })))

    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Error during seeding:", error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
