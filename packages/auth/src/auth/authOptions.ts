import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "@package/db"
import { MagicLinkSignIn, sendEmail } from "@package/email"
import bcrypt from "bcryptjs"
import CredentialsProvider from "next-auth/providers/credentials"
import EmailProvider from "next-auth/providers/email"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"

import type { UserSession } from "../types"
import type { $Enums, Account } from "@package/db"
import type {
  Account as AuthAccount,
  DefaultSession,
  NextAuthOptions,
  Session,
  TokenSet,
} from "next-auth"
import type { Adapter } from "next-auth/adapters"
import type { DefaultJWT } from "next-auth/jwt"

export type ExtendedSession = {
  id: string
  role: $Enums.Role
  hasOnboarded: boolean
  isBanned: boolean
}

type RefreshAccessTokenError = "RefreshAccessTokenError"

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT, ExtendedSession {
    error?: RefreshAccessTokenError
  }
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: UserSession
    error?: RefreshAccessTokenError
  }
}

async function updateRefreshToken(account: AuthAccount) {
  try {
    await db.account.update({
      where: {
        provider_providerAccountId: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      },
      data: {
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
      },
    })
  } catch (error) {
    console.error("Error updating refresh token", error)
  }
}

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(dbAccount: Account, session: Session) {
  try {
    // https://accounts.google.com/.well-known/openid-configuration
    // We need the `token_endpoint`.
    const response = await fetch("https://oauth2.googleapis.com/token", {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: dbAccount.refresh_token!,
      }),
      method: "POST",
    })

    const tokens: TokenSet = await response.json()

    if (!response.ok) throw tokens

    await db.account.update({
      data: {
        access_token: tokens.access_token,
        expires_at: Math.floor(
          Date.now() / 1000 + (tokens.expires_in as number)
        ),
        refresh_token: tokens.refresh_token ?? dbAccount.refresh_token,
      },
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: dbAccount.providerAccountId,
        },
      },
    })
  } catch (error) {
    console.error("Error refreshing access token", error)
    // The error property will be used client-side to handle the refresh token error
    session.error = "RefreshAccessTokenError"
  }
}

const scopes = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
]

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        const user = await db.user.findFirst({
          where: { username: credentials.username },
        })
        if (!user || !user.password) return null
        const isValid = bcrypt.compareSync(credentials.password, user.password)
        if (!isValid) return null
        return { id: user.id, name: user.name, email: user.email }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          scope: scopes.join(" "),
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    EmailProvider({
      type: "email",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        // Call the cloud Email provider API for sending emails
        try {
          const emailResponse = await sendEmail({
            email: [email],
            subject: "Access link to App",
            react: MagicLinkSignIn({
              email: email,
              url,
            }),
          })

          if ("error" in emailResponse) {
            throw new Error(JSON.stringify(emailResponse.error))
          }
        } catch (error) {
          throw new Error(JSON.stringify(error))
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // User and account is only returned on sign in
      // Token is returned for every authentication session

      const dbUser = await db.user.findFirst({
        where: {
          email: token.email,
        },
      })

      if (!dbUser) {
        token.id = user.id
        return token
      }

      if (account?.provider === "google") {
        await updateRefreshToken(account)
      }

      // These are forwarded to the session in the token object
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: undefined, // dbUser.image, // TODO: Add image field to User schema
        role: dbUser.role,
        hasOnboarded: true, // TODO: Add hasOnboarded field to User schema
        isBanned: false, // dbUser.isBanned, // TODO: Add isBanned field to User schema
      }
    },
    async session({ token, session }) {
      const dbAccount = await db.account.findFirst({
        where: {
          userId: token.id,
        },
      })

      if (
        dbAccount?.expires_at &&
        dbAccount.expires_at * 1000 < Date.now() &&
        dbAccount.provider === "google"
      ) {
        await refreshAccessToken(dbAccount, session)
      }

      // Forward the content of the token to the session so it's available client-side
      session.user.id = token.id
      session.user.name = token.name
      session.user.email = token.email
      session.user.image = token.picture
      session.user.role = token.role
      session.user.hasOnboarded = token.hasOnboarded
      session.user.isBanned = token.isBanned

      return session
    },
  },
}

export default authOptions
