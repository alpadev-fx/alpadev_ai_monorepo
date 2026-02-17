import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { db } from "@package/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials?.username === "root" && credentials?.password === "root") {
          let admin = await db.user.findFirst({ where: { role: "ADMIN" } })
          if (!admin) {
            admin = await db.user.create({
              data: {
                name: "Admin",
                email: "admin@alpadev.xyz",
                role: "ADMIN",
              },
            })
          }
          return { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
        }
        return null
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: false },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role || "GUEST"
      }
      if (token.email && !user) {
        const dbUser = await db.user.findFirst({ where: { email: token.email } })
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string
        ;(session.user as { role?: string }).role = token.role as string
        ;(session.user as { hasOnboarded?: boolean }).hasOnboarded = false
        ;(session.user as { isBanned?: boolean }).isBanned = false
      }
      return session
    },
  },
  trustHost: true,
})
