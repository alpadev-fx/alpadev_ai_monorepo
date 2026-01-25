import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient
}

const ensureDirectConnectionParam = (url: string) => {
  try {
    console.log("[db] Original URL (masked):", url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'))

    const parsed = new URL(url)

    // Parámetros esenciales para MongoDB Atlas/Railway - FORCE override existing values
    parsed.searchParams.set("authSource", "admin")
    parsed.searchParams.set("directConnection", "true")
    parsed.searchParams.set("retryWrites", "false")

    // Parámetros adicionales para mejorar la conectividad
    parsed.searchParams.set("connectTimeoutMS", "10000")
    parsed.searchParams.set("serverSelectionTimeoutMS", "10000")

    // Parámetros específicos para Railway MongoDB
    parsed.searchParams.set("ssl", "false")
    parsed.searchParams.set("authMechanism", "SCRAM-SHA-1")

    const normalizedUrl = parsed.toString()
    console.log("[db] Normalized MongoDB URL (without credentials):", normalizedUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'))
    console.log("[db] Auth source:", parsed.searchParams.get("authSource"))
    console.log("[db] Direct connection:", parsed.searchParams.get("directConnection"))

    return normalizedUrl
  } catch (error) {
    console.warn("[db] Failed to normalize MongoDB URL", error)
    return url
  }
}

const resolveDatabaseUrl = () => {
  const fallbackUrl = process.env.DATABASE ?? process.env.MONGO_URL

  if (!fallbackUrl) {
    // Durante el build time, no necesitamos una conexión real a la DB
    // Solo necesitamos una URL válida para que Prisma pueda generar el cliente
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE && !process.env.MONGO_URL) {
      console.warn("[db] No database URL found during build. Using placeholder...")
      // Usar una URL placeholder válida para el build
      const placeholderUrl = "mongodb://localhost:27017/placeholder"
      process.env.MONGO_URL = placeholderUrl
      return placeholderUrl
    }

    console.error("[db] CRITICAL ERROR: No database URL found!")
    console.error("[db] Environment check:", {
      DATABASE: !!process.env.DATABASE,
      MONGO_URL: !!process.env.MONGO_URL,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV
    })

    // En lugar de hacer throw, vamos a usar una URL por defecto y loggear el error
    if (process.env.NODE_ENV === 'production') {
      console.error("[db] Using fallback URL - THIS WILL LIKELY FAIL!")
      const fallbackMongoUrl = "mongodb://mongo:hvrnIjFrwgEDQhUxYPYulIEPtWZmgxok@centerbeam.proxy.rlwy.net:16709/alpadev?authSource=admin"
      process.env.MONGO_URL = fallbackMongoUrl
      return fallbackMongoUrl
    }

    throw new Error(
      "Database connection string missing. Set MONGO_URL (or DATABASE) in the environment."
    )
  }

  console.log("[db] Database URL found, normalizing...")

  // Verificar si la URL parece ser de Railway
  if (fallbackUrl.includes('railway.net') || fallbackUrl.includes('centerbeam.proxy.rlwy.net')) {
    console.log("[db] Railway MongoDB detected")
  }

  // Verificar formato básico de la URL
  try {
    const testUrl = new URL(fallbackUrl)
    console.log("[db] URL validation:")
    console.log("  - Protocol:", testUrl.protocol)
    console.log("  - Host:", testUrl.hostname)
    console.log("  - Port:", testUrl.port || "default")
    console.log("  - Database:", testUrl.pathname.substring(1) || "not specified")
    console.log("  - Username:", testUrl.username ? "SET" : "NOT SET")
    console.log("  - Password:", testUrl.password ? "SET" : "NOT SET")

    if (!testUrl.username || !testUrl.password) {
      console.error("[db] CRITICAL: MongoDB URL is missing username or password!")
      console.error("[db] This is likely why authentication is failing!")
    }
  } catch (urlError) {
    console.error("[db] CRITICAL: Invalid MongoDB URL format:", urlError instanceof Error ? urlError.message : String(urlError))
  }

  const normalizedUrl = ensureDirectConnectionParam(fallbackUrl)

  if (!process.env.MONGO_URL) {
    process.env.MONGO_URL = normalizedUrl
  }

  if (process.env.MONGO_URL !== normalizedUrl) {
    process.env.MONGO_URL = normalizedUrl
  }

  return process.env.MONGO_URL
}

resolveDatabaseUrl()

let prisma: PrismaClient

const createPrismaClient = () => {
  console.log("[db] Creating new Prisma client...")

  const prismaClient = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.MONGO_URL,
      },
    },
  })

  // Log errores de conexión
  prismaClient.$on('error', (e) => {
    console.error('[db] Prisma client error:', e)
  })

  return prismaClient
}

if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient()
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = createPrismaClient()
  }
  prisma = global.cachedPrisma
}

export const db = prisma
