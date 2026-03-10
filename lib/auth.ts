import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

/**
 * Step 1: Read provider env vars once at module load so auth configuration is deterministic.
 *
 * Why multiple names are supported:
 * - Auth.js v5 conventions commonly use `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`.
 * - Existing infrastructure in this project historically used `GITHUB_ID` and `GITHUB_SECRET`.
 * - Supporting both removes deployment fragility when one environment was provisioned
 *   with the old names and another with the new names.
 */
const githubClientId = process.env.GITHUB_ID ?? process.env.AUTH_GITHUB_ID
const githubClientSecret = process.env.GITHUB_SECRET ?? process.env.AUTH_GITHUB_SECRET

/**
 * Step 2: Build the provider list defensively.
 *
 * Why this exists:
 * - Auth.js returns a generic "server configuration" error when an OAuth provider is misconfigured.
 * - The `/api/auth/session` endpoint is called by `SessionProvider` on every page load.
 * - If GitHub credentials are missing, that endpoint can 500 and flood the browser console.
 *
 * This guard keeps auth routes healthy in environments where GitHub OAuth vars are not yet set.
 */
const providers = []

if (githubClientId && githubClientSecret) {
  providers.push(
    GitHub({
      clientId: githubClientId,
      clientSecret: githubClientSecret,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    })
  )
} else {
  console.warn(
    "[auth] GitHub OAuth credentials are missing. Set either GITHUB_ID/GITHUB_SECRET or AUTH_GITHUB_ID/AUTH_GITHUB_SECRET to enable GitHub sign-in."
  )
}

/**
 * Step 3: Resolve Auth.js secret from both v5 (`AUTH_SECRET`) and legacy (`NEXTAUTH_SECRET`) env names.
 * This improves compatibility across local/dev/prod deployments and prevents production session errors.
 */
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  secret: authSecret,
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
