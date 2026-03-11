import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { GithubApiError, listUserRepos } from "@/lib/github/client"

/**
 * Step 0: Enforce the Edge runtime for Cloudflare Pages compatibility.
 * Why: `@cloudflare/next-on-pages` requires non-static API routes to declare edge runtime.
 */
export const runtime = "edge"

/**
 * Step 0.1: Centralize error classification for repository loading failures.
 *
 * Why this helper exists:
 * - The route can fail in multiple layers (session/auth, GitHub API, edge networking).
 * - Returning a blanket 502 for every failure hides actionable re-auth paths from users.
 * - A single classifier keeps status/message mapping deterministic and easy to extend.
 */
function classifyRepoFetchError(error: unknown): { status: number; clientMessage: string; message: string } {
  const message = error instanceof Error ? error.message : "Unable to load repositories"
  const lowerMessage = message.toLowerCase()

  /**
   * Step 0.1a: Handle explicit GitHub upstream failures first.
   */
  if (error instanceof GithubApiError) {
    const upstreamBody = error.responseBody.toLowerCase()
    const isAuthFailure = error.status === 401 || error.status === 403
    const isRateLimitFailure =
      error.status === 403 &&
      (upstreamBody.includes("rate limit") || upstreamBody.includes("secondary rate limit"))

    if (error.status === 404) {
      return {
        status: 401,
        clientMessage:
          "GitHub authorization is missing required repository scope. Please reconnect GitHub and try again.",
        message,
      }
    }

    if (isAuthFailure && !isRateLimitFailure) {
      return {
        status: 401,
        clientMessage:
          "GitHub authorization is missing or expired. Please reconnect GitHub and try again.",
        message,
      }
    }

    if (isRateLimitFailure || error.status === 429 || error.status >= 500) {
      return {
        status: 502,
        clientMessage: "Repository service is temporarily unavailable. Please try again shortly.",
        message,
      }
    }
  }

  /**
   * Step 0.1b: Detect local auth/session decoding failures that should prompt re-auth.
   */
  const isSessionFailure =
    lowerMessage.includes("auth") ||
    lowerMessage.includes("session") ||
    lowerMessage.includes("jwt") ||
    lowerMessage.includes("secret") ||
    lowerMessage.includes("decryption")

  if (isSessionFailure) {
    return {
      status: 401,
      clientMessage: "Your session has expired. Please sign in again and retry.",
      message,
    }
  }

  /**
   * Step 0.1c: Treat transport failures as upstream availability issues.
   */
  const isTransportFailure =
    lowerMessage.includes("fetch") ||
    lowerMessage.includes("network") ||
    lowerMessage.includes("timed out") ||
    lowerMessage.includes("econnreset")

  if (isTransportFailure) {
    return {
      status: 502,
      clientMessage: "Unable to reach GitHub right now. Please try again shortly.",
      message,
    }
  }

  /**
   * Step 0.1d: Fallback to generic upstream failure response.
   */
  return {
    status: 502,
    clientMessage: "Repository service is temporarily unavailable. Please try again shortly.",
    message,
  }
}

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
    const { message, status, clientMessage } = classifyRepoFetchError(error)
    /**
     * Step 1e (Server Trace): Preserve upstream failure details for triage.
     */
    console.error("[API /api/github/repos][Step 1e] Repository loading failed", {
      message,
      status,
    })
    return NextResponse.json({ error: clientMessage }, { status })
  }
}
