import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      // Store GitHub access token for API calls
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.accessToken = token.accessToken as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allow redirects to relative paths
      if (url.startsWith("/")) return `${baseUrl}${url}`
      
      // Allow redirects to the same origin
      if (url.startsWith(baseUrl)) return url
      
      // Allow redirects to vusercontent preview domains
      if (url.includes("vusercontent.net")) return url
      
      // Allow redirects to e-yar.com
      if (url.includes("e-yar.com")) return url
      
      // Default to baseUrl for security
      return baseUrl
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
})
