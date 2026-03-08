import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { validateCredentials } from "./users"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[v0] authorize called with:", credentials?.username)
        if (!credentials?.username || !credentials?.password) {
          console.log("[v0] Missing credentials")
          return null
        }

        const user = await validateCredentials(
          credentials.username,
          credentials.password
        )

        console.log("[v0] validateCredentials returned:", user ? "user found" : "null")

        if (user) {
          return {
            id: user.id,
            name: user.username,
            email: user.email,
            role: user.role,
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
}
