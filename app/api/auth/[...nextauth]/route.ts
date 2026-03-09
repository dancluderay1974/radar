/**
 * NextAuth App Router configuration for Cloudflare Pages deployment.
 *
 * Why this file exists:
 * - App Router uses route handlers instead of pages/api endpoints.
 * - NextAuth expects a handler for both GET and POST methods in this runtime.
 * - GitHub OAuth credentials and secrets are provided via environment variables.
 */

// Step 1: Import NextAuth core handler factory and GitHub provider.
// These imports are required to initialize authentication in App Router.
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

/**
 * Step 2: Define auth configuration.
 *
 * Why this configuration is used:
 * - providers: registers GitHub OAuth with environment-provided credentials.
 * - secret: uses NEXTAUTH_SECRET to sign/verify tokens securely.
 * - session.strategy = "jwt": stores session state in JWTs (required by request).
 */
const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
});

/**
 * Step 3: Export App Router method handlers.
 *
 * Why both methods are exported:
 * - NextAuth requires GET for some auth flows and POST for callback/session actions.
 * - App Router route handlers map HTTP verbs to named exports.
 */
export { handler as GET, handler as POST };
