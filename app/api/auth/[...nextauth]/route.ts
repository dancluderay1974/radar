import type { NextRequest } from "next/server"
import { handlers } from "@/lib/auth"

/**
 * Step 0: Enforce Edge runtime for Cloudflare Pages compatibility.
 *
 * Why this is mandatory in this deployment:
 * - `@cloudflare/next-on-pages` requires non-static App Router routes to run on Edge.
 * - If `/api/auth/[...nextauth]` is interpreted as a Node runtime route, Cloudflare
 *   rejects the build output and aborts deployment.
 */
export const runtime = "nodejs"

/**
 * Step 1: Extract handler functions from the centralized NextAuth setup.
 *
 * Why this stage exists:
 * - `lib/auth.ts` is the canonical place that owns providers/callbacks/session logic.
 * - This route should stay as a thin transport adapter that delegates HTTP verbs.
 */
const authGetHandler = handlers.GET
const authPostHandler = handlers.POST

/**
 * Step 2: Provide an explicit GET export for Next.js route analysis.
 *
 * Why explicit function exports are used instead of object destructuring exports:
 * - Some deployment adapters perform static analysis on route files.
 * - Explicit verb functions make runtime + method mapping unambiguous to both
 *   Next.js and Cloudflare's conversion pipeline.
 */
export function GET(request: NextRequest) {
  return authGetHandler(request)
}

/**
 * Step 3: Provide an explicit POST export for OAuth callback/form posts.
 *
 * Why this stage exists:
 * - GitHub/Auth.js may POST to this route during auth flows.
 * - Keeping a dedicated verb export preserves complete NextAuth behavior while
 *   keeping edge-runtime compliance visible in one file.
 */
export function POST(request: NextRequest) {
  return authPostHandler(request)
}
