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
  const session = await auth()
  const token = session?.user?.accessToken

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const repos = await listUserRepos(token)
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
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
