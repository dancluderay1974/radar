import { handlers } from "@/lib/auth"

/**
 * Step 0: Enforce Edge runtime for Cloudflare Pages compatibility.
 *
 * Why this is mandatory in this deployment:
 * - The project is built with `@cloudflare/next-on-pages`, which requires all
 *   non-static App Router routes to run on the Edge runtime.
 * - If this route is set to `nodejs`, the Cloudflare adapter aborts the build and
 *   reports `/api/auth/[...nextauth]` as non-compliant.
 *
 * Operational note:
 * - OAuth behavior and timeout handling must be addressed via auth configuration,
 *   environment variables, and callback logic while keeping this route on Edge.
 */
export const runtime = "edge"

/**
 * Step 1: Expose NextAuth handlers under the App Router API convention.
 *
 * Why this stage exists:
 * - `lib/auth.ts` contains the canonical NextAuth provider + callback setup.
 * - This route file should remain a thin adapter that wires HTTP methods to those
 *   centralized handlers, reducing duplication and drift.
 */
export const { GET, POST } = handlers
