import { handlers } from "@/lib/auth"

/**
 * Step 0: Force the Node.js runtime for OAuth callback reliability.
 *
 * Why this change fixes the observed timeout:
 * - The GitHub OAuth callback performs server-to-server token exchange work.
 * - In this deployment, running the auth handler on Edge has intermittently caused
 *   long callback stalls after users click "Continue" on GitHub.
 * - Pinning to Node.js gives NextAuth its most battle-tested runtime path for OAuth,
 *   reducing callback timeouts and making login/signup handshakes deterministic.
 */
export const runtime = "nodejs"

/**
 * Step 1: Expose NextAuth handlers under the App Router API convention.
 * Why: The OAuth flow is already configured in `lib/auth.ts`; this file simply wires
 * Next.js route verbs to that centralized auth configuration.
 */
export const { GET, POST } = handlers
