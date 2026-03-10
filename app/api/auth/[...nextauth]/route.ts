import { handlers } from "@/lib/auth"

/**
 * Step 0: Enforce the Edge runtime for Cloudflare Pages compatibility.
 * Why: Cloudflare Pages Functions execute on an edge runtime model, and the build
 * adapter validates that every dynamic route explicitly opts into `runtime = "edge"`.
 */
export const runtime = "edge"

/**
 * Step 1: Expose NextAuth handlers under the App Router API convention.
 * Why: The OAuth flow is already configured in `lib/auth.ts`; this file simply wires
 * Next.js route verbs to that centralized auth configuration.
 */
export const { GET, POST } = handlers
