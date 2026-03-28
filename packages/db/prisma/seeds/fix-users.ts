/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // 1. Delete "root" user if exists
  const rootUser = await prisma.user.findFirst({ where: { username: "root" } })
  if (rootUser) {
    await prisma.user.delete({ where: { id: rootUser.id } })
    console.log(`Deleted root user: ${rootUser.id}`)
  } else {
    console.log("No root user found, skipping delete.")
  }

  // 2. Create alpadev-fx user
  const existing = await prisma.user.findFirst({ where: { username: "alpadev-fx" } })
  if (existing) {
    console.log("User alpadev-fx already exists, skipping.")
    return
  }

  const user = await prisma.user.create({
    data: {
      name: "Alpadev FX",
      email: "alejandro.padron@inteligente.io",
      phone: "+1000000001",
      role: "ADMIN",
      username: "alpadev-fx",
      password: "$2b$10$98kxVFHj8QRfn4FFjawL8OkQQkKt6kx9QdCmceQ6kvMBPXtYeVZI2",
    },
  })

  console.log(`Created user: ${user.id} (${user.username})`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("Error:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
