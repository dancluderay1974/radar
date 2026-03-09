/**
 * Auth.js App Router route bindings.
 *
 * Why this file exists:
 * - Next.js 15 validates route handler exports using strict Route Handler types.
 * - `lib/auth.ts` already creates the canonical Auth.js instance (`handlers`, `auth`, etc.).
 * - Re-exporting those typed handlers avoids creating a second ad-hoc NextAuth instance
 *   whose inferred handler type can drift and fail Cloudflare/Vercel builds.
 */

// Step 1: Import the single source of truth for Auth.js handlers.
// This keeps auth configuration centralized and type-safe across server routes.
import { handlers } from "@/lib/auth";

// Step 2: Force this API route to run on the Edge Runtime for Cloudflare Pages.
// Why this declaration is explicit:
// - `@cloudflare/next-on-pages` validates that all non-static routes opt into edge runtime.
// - Keeping the segment config in this file prevents regressions during refactors.
export const runtime = 'edge';

// Step 3: Export verb-specific handlers expected by App Router.
// Auth.js provides the exact GET/POST signatures required by Next.js Route Handler typing.
export const { GET, POST } = handlers;
