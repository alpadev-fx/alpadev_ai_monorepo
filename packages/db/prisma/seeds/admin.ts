/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Pre-computed bcrypt hashes (10 rounds)
const USERS = [
  {
    name: "Alpadev Admin",
    email: "alejandro.padron@inteligente.io",
    username: "alpadev-fx",
    phone: "+10000000001",
    password: "$2b$10$n.nj1xEP4eHSbZovicFeUORZILwh58oAn/3R08ynNvERaNUUI5dD6", // A1p4d3v*
    role: "ADMIN" as const,
  },
  {
    name: "Admin OnShapers",
    email: "admin@onshapers.com",
    username: "admin_onshapers",
    phone: "+10000000002",
    password: "$2b$10$/TOYr9xyma1ZEZgFP9x/lu1ANlr3jBY0mCvgkedb5snsu29CX2w8.", // 0nS4p3rS@13001
    role: "CHIEF" as const,
  },
  {
    name: "Vendor One",
    email: "vendor1@alpadev.xyz",
    username: "vendor1",
    phone: "+10000000003",
    password: "$2b$10$M0CaS4E9p6zu.NGkZpxz2eOH7Fdw4NdoCOZTV1DJqNNu/PTJ.jodq", // vendor1**
    role: "VENDOR" as const,
  },
]

async function main() {
  console.log("Seeding users (3 only: admin, chief, vendor)...")

  // Clean all related data first
  console.log("Cleaning existing data...")
  await prisma.activityLog.deleteMany({})
  await prisma.userPermission.deleteMany({})
  await prisma.conversationMessage.deleteMany({})
  await prisma.conversationSession.deleteMany({})
  await prisma.prospect.deleteMany({})
  await prisma.invoice.deleteMany({})
  await prisma.transaction.deleteMany({})
  await prisma.bill.deleteMany({})
  await prisma.booking.deleteMany({})
  await prisma.request.deleteMany({})
  await prisma.account.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.user.deleteMany({})

  for (const u of USERS) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        username: u.username,
        phone: u.phone,
        password: u.password,
        role: u.role,
      },
    })
    console.log(`  ${u.role}: ${u.username} (${user.id})`)
  }

  console.log("Done. 3 users seeded.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("Error seeding:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
