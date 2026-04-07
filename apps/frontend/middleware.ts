import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev"

const ROUTE_ROLES: Record<string, string[]> = {
  "/dashboard/permissions": ["ADMIN", "CHIEF"],
  "/dashboard/activity": ["ADMIN", "CHIEF"],
  "/dashboard/infrastructure": ["ADMIN"],
  "/dashboard/invoices": ["ADMIN"],
  "/dashboard/chat": ["ADMIN"],
  "/dashboard/calendar": ["ADMIN"],
  "/dashboard/prospects": ["ADMIN", "CHIEF", "VENDOR"],
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const token = await getToken({ req: request, secret: SECRET })
    if (!token) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    const role = (token.role as string) ?? ""

    // Redirect non-ADMIN from /dashboard home to /dashboard/prospects
    if (request.nextUrl.pathname === "/dashboard" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/prospects", request.url))
    }

    // Role-based route protection
    const matchedRoute = Object.keys(ROUTE_ROLES)
      .filter((r) => request.nextUrl.pathname.startsWith(r))
      .sort((a, b) => b.length - a.length)[0]

    if (matchedRoute && !ROUTE_ROLES[matchedRoute].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard/prospects", request.url))
    }
  }
  return NextResponse.next()
}

export const config = { matcher: ["/dashboard/:path*"] }
