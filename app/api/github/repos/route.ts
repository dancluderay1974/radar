import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { GithubApiError, listUserRepos } from "@/lib/github/client"

/**
 * Step 0: Enforce the Edge runtime for Cloudflare Pages compatibility.
 * Why: `@cloudflare/next-on-pages` requires non-static API routes to declare edge runtime.
 */
export const runtime = "edge"

/**
 * Stage 0.1: Enumerate the backend processing stages used by diagnostics.
 *
 * Why this list exists:
 * - A stable stage string helps determine whether failures occur before auth,
 *   during token extraction, or while calling GitHub.
 * - Stage markers are safe to expose to the UI and do not leak secrets.
 */
type RepoFetchStage =
  | "request_received"
  | "auth_session_lookup"
  | "token_validation"
  | "github_repo_fetch"
  | "response_success"

/**
 * Stage 0.2: Normalized error shape returned by the classifier.
 *
 * Why this interface exists:
 * - Route-level catch blocks need consistent status, user message, and machine-friendly code.
 * - A dedicated code allows the frontend to show better support diagnostics.
 */
interface ClassifiedRepoError {
  status: number
  clientMessage: string
  logMessage: string
  code:
    | "github_auth"
    | "github_scope"
    | "github_rate_limit"
    | "github_upstream"
    | "session_invalid"
    | "transport_failure"
    | "unknown_failure"
}

/**
 * Stage 1: Centralize repository error classification.
 *
 * Why this helper exists:
 * - The repo selector previously received mostly generic 502 responses with little context.
 * - Classifying once keeps client error mapping deterministic and easier to debug.
 */
function classifyRepoFetchError(error: unknown): ClassifiedRepoError {
  const message = error instanceof Error ? error.message : "Unable to load repositories"
  const lowerMessage = message.toLowerCase()

  /**
   * Stage 1.1: Classify explicit GitHub REST API failures first.
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
        logMessage: message,
        code: "github_scope",
      }
    }

    if (isAuthFailure && !isRateLimitFailure) {
      return {
        status: 401,
        clientMessage: "GitHub authorization is missing or expired. Please reconnect GitHub and try again.",
        logMessage: message,
        code: "github_auth",
      }
    }

    if (isRateLimitFailure || error.status === 429) {
      return {
        status: 502,
        clientMessage: "GitHub is rate-limiting requests right now. Please try again shortly.",
        logMessage: message,
        code: "github_rate_limit",
      }
    }

    if (error.status >= 500) {
      return {
        status: 502,
        clientMessage: "Repository service is temporarily unavailable. Please try again shortly.",
        logMessage: message,
        code: "github_upstream",
      }
    }
  }

  /**
   * Stage 1.2: Classify session/JWT/secret related failures to trigger re-auth guidance.
   */
  const isSessionFailure =
    lowerMessage.includes("auth") ||
    lowerMessage.includes("session") ||
    lowerMessage.includes("jwt") ||
    lowerMessage.includes("secret") ||
    lowerMessage.includes("decryption") ||
    lowerMessage.includes("cookie")

  if (isSessionFailure) {
    return {
      status: 401,
      clientMessage: "Your session has expired or is invalid. Please sign in again and retry.",
      logMessage: message,
      code: "session_invalid",
    }
  }

  /**
   * Stage 1.3: Classify low-level networking/transport failures.
   */
  const isTransportFailure =
    lowerMessage.includes("fetch") ||
    lowerMessage.includes("network") ||
    lowerMessage.includes("timed out") ||
    lowerMessage.includes("econnreset") ||
    lowerMessage.includes("dns")

  if (isTransportFailure) {
    return {
      status: 502,
      clientMessage: "Unable to reach GitHub right now. Please try again shortly.",
      logMessage: message,
      code: "transport_failure",
    }
  }

  /**
   * Stage 1.4: Fallback classification for uncategorized failures.
   */
  return {
    status: 502,
    clientMessage: "Repository service is temporarily unavailable. Please try again shortly.",
    logMessage: message,
    code: "unknown_failure",
  }
}

/**
 * Stage 2: Return authenticated user's repositories for the selector UI.
 */
export async function GET() {
  /**
   * Stage 2.0: Create deterministic trace identifiers for cross-layer diagnostics.
   *
   * Why this exists:
   * - Browser-only logs cannot reveal where backend execution stopped.
   * - A request id + stage lets support correlate client failures to server logs quickly.
   */
  const requestId = crypto.randomUUID()
  let currentStage: RepoFetchStage = "request_received"

  console.log("[API /api/github/repos][Stage 2.0] Incoming repository list request", {
    requestId,
    currentStage,
  })

  try {
    /**
     * Stage 2.1: Resolve auth session in guarded context.
     */
    currentStage = "auth_session_lookup"
    const session = await auth()

    console.log("[v0] Session debug:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userName: session?.user?.name,
      userEmail: session?.user?.email,
      hasAccessToken: !!session?.user?.accessToken,
      accessTokenLength: session?.user?.accessToken?.length,
    })

    /**
     * Stage 2.2: Validate token presence before contacting GitHub.
     */
    currentStage = "token_validation"
    const token = session?.user?.accessToken

    if (!token) {
      console.warn("[API /api/github/repos][Stage 2.2] Missing access token; returning 401", {
        requestId,
        currentStage,
      })
      return NextResponse.json(
        {
          error: "GitHub authorization is missing. Please sign in with GitHub again.",
          diagnostic: {
            code: "session_invalid",
            requestId,
            stage: currentStage,
          },
        },
        { status: 401 }
      )
    }

    /**
     * Stage 2.3: Fetch repositories from GitHub API using the OAuth token.
     */
    currentStage = "github_repo_fetch"
    const repos = await listUserRepos(token)

    currentStage = "response_success"
    console.log("[API /api/github/repos][Stage 2.4] Repository list resolved", {
      requestId,
      currentStage,
      repoCount: repos.length,
    })

    return NextResponse.json({ repos, diagnostic: { requestId, stage: currentStage } })
  } catch (error) {
    /**
     * Stage 3: Normalize failures and return machine-readable diagnostics.
     */
    console.log("[v0] Caught error:", {
      errorType: error?.constructor?.name,
      errorMessage: error instanceof Error ? error.message : String(error),
      isGithubApiError: error instanceof GithubApiError,
      fullError: error,
    })
    
    const classified = classifyRepoFetchError(error)

    console.error("[API /api/github/repos][Stage 3.0] Repository loading failed", {
      requestId,
      currentStage,
      code: classified.code,
      status: classified.status,
      message: classified.logMessage,
      githubStatus: error instanceof GithubApiError ? error.status : null,
      githubPath: error instanceof GithubApiError ? error.path : null,
    })

    return NextResponse.json(
      {
        error: classified.clientMessage,
        diagnostic: {
          code: classified.code,
          requestId,
          stage: currentStage,
        },
      },
      { status: classified.status }
    )
  }
}
