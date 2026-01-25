/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client"

import { linkAddressesToProperties, seedAddresses } from "./seeds/addresses"
import { seedHouses } from "./seeds/houses"
import { seedProperties } from "./seeds/properties"
import { seedPropertyZones } from "./seeds/propertyZones"
import { seedRequests } from "./seeds/requests"
import { seedResidents } from "./seeds/residents"
import { seedUsers } from "./seeds/users"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seeding...")
  await prisma.request.deleteMany()
  await prisma.resident.deleteMany()
  await prisma.property.deleteMany()
  await prisma.propertyZone.deleteMany()
  await prisma.house.deleteMany()
  await prisma.address.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.message.deleteMany()
  await prisma.user.deleteMany()

  try {
    // NO limpiar datos existentes para evitar transacciones
    console.log("Skipping cleanup to avoid transaction requirements...")

    // 1) Users first (for relations)
    console.log("Seeding users...")
    const users = await seedUsers(prisma)
    console.log(`Created ${users.length} users`)

    // 2) Base addresses (sin propertyId inicialmente)
    console.log("Seeding addresses...")
    const addresses = await seedAddresses(prisma, 10)
    console.log(`Created ${addresses.length} addresses`)

    // 3) Houses (use addressIds)
    console.log("Seeding houses...")
    const houses = await seedHouses(
      prisma,
      [
        "Residencias Mirador",
        "Torre Central",
        "Conjunto Los Robles",
        "Plaza Mayor",
        "Torres del Parque",
        "Villa Real",
        "Horizonte",
        "Las Palmas",
        "Torre Ejecutiva",
        "Los Almendros",
      ],
      addresses.map((a) => a.id)
    )
    console.log(`Created ${houses.length} houses`)

    // 4) Property zones by house
    console.log("Seeding property zones...")
    const zones = await seedPropertyZones(
      prisma,
      houses.map((h) => h.id)
    )
    console.log(`Created ${zones.length} property zones`)

    // 5) Properties connected to house + zone + address
    console.log("Seeding properties...")
    const properties = await seedProperties(
      prisma,
      houses.map((h) => h.id),
      zones.map((z) => z.id),
      addresses.map((a) => a.id)
    )
    console.log(`Created ${properties.length} properties`)

    // 6) Link addresses to properties
    console.log("Linking addresses to properties...")
    await linkAddressesToProperties(
      prisma,
      properties.map((p) => p.id),
      addresses.map((a) => a.id)
    )

    // 7) Residents for each (user, house, property)
    console.log("Seeding residents...")
    await seedResidents(
      prisma,
      users.map((u) => ({ id: u.id })),
      houses.map((h) => ({ id: h.id })),
      properties.map((p) => ({ id: p.id }))
    )

    // 8) Requests from users on properties
    console.log("Seeding requests...")
    await seedRequests(
      prisma,
      users.map((u) => ({ id: u.id })),
      properties.map((p) => ({ id: p.id }))
    )

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
