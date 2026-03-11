import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { listUserRepos } from "@/lib/github/client"

/**
 * Step 0: Enforce the Edge runtime for Cloudflare Pages compatibility.
 * Why: `@cloudflare/next-on-pages` requires non-static API routes to declare edge runtime.
 */
export const runtime = "edge"

/**
 * Step 1: Return authenticated user's repositories for the selector UI.
 */
export async function GET() {
  /**
   * Step 1a (Server Trace): Mark start of repository API handling.
   *
   * Why this trace exists:
   * - Confirms the dashboard request reached the backend route.
   * - Provides a stable first log line for debugging selector-loading issues.
   */
  console.log("[API /api/github/repos][Step 1a] Incoming repository list request")

  try {
    /**
     * Step 1b: Resolve authenticated session inside the guarded block.
     *
     * Why this placement exists:
     * - Some auth/runtime misconfigurations throw before we can inspect a token.
     * - Keeping this inside `try` guarantees the route still returns JSON on failure,
     *   preventing the client from receiving HTML error bodies that break JSON parsing.
     */
    const session = await auth()
    const token = session?.user?.accessToken

    if (!token) {
      /**
       * Step 1c (Server Trace): Explain why the request cannot proceed.
       */
      console.warn("[API /api/github/repos][Step 1c] Missing access token; returning 401")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const repos = await listUserRepos(token)
    /**
     * Step 1d (Server Trace): Capture successful repository load counts.
     */
    console.log("[API /api/github/repos][Step 1d] Repository list resolved", {
      repoCount: repos.length,
    })
    return NextResponse.json({ repos })
  } catch (error) {
    /**
     * Step 2: Normalize upstream GitHub failures into a stable API response.
     *
     * Why this exists:
     * - The dashboard needs a clear, non-500 message when GitHub rejects a token.
     * - A consistent response keeps the frontend error UI predictable.
     */
    const message = error instanceof Error ? error.message : "Unable to load repositories"
    /**
     * Step 1e (Server Trace): Preserve upstream failure details for triage.
     */
    console.error("[API /api/github/repos][Step 1e] Repository loading failed", {
      message,
    })
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
