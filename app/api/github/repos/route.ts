import { NextResponse } from "next/server"

export const runtime = "edge"

/**
 * Minimal repos route for debugging Cloudflare 502 issues.
 * This version avoids all external imports to isolate the problem.
 */
export async function GET(request: Request) {
  const requestId = crypto.randomUUID()
  
  try {
    // Step 1: Check if we can even reach this code
    console.log("[repos] Step 1: Route handler reached", { requestId })
    
    // Step 2: Try to read cookies from the request
    const cookieHeader = request.headers.get("cookie") || ""
    const hasSessionCookie = cookieHeader.includes("authjs.session-token")
    console.log("[repos] Step 2: Cookie check", { requestId, hasSessionCookie })
    
    // Step 3: Try dynamic import of auth
    let session = null
    let importError = null
    try {
      const { auth } = await import("@/lib/auth")
      console.log("[repos] Step 3a: Auth imported successfully", { requestId })
      session = await auth()
      console.log("[repos] Step 3b: Auth called", { 
        requestId, 
        hasSession: !!session,
        hasUser: !!session?.user,
        hasToken: !!session?.user?.accessToken 
      })
    } catch (e) {
      importError = e instanceof Error ? e.message : String(e)
      console.error("[repos] Step 3 FAILED: Auth import/call error", { requestId, error: importError })
    }
    
    // If auth failed, return diagnostic info
    if (importError) {
      return NextResponse.json({
        error: "Auth module failed to load",
        diagnostic: { requestId, stage: "auth_import", importError }
      }, { status: 500 })
    }
    
    // Step 4: Check for access token
    const token = session?.user?.accessToken
    if (!token) {
      return NextResponse.json({
        error: "No access token in session",
        diagnostic: { 
          requestId, 
          stage: "token_check",
          hasSession: !!session,
          hasUser: !!session?.user,
          userName: session?.user?.name || null
        }
      }, { status: 401 })
    }
    
    // Step 5: Try to fetch repos from GitHub directly (no client wrapper)
    console.log("[repos] Step 5: Fetching from GitHub", { requestId, tokenLength: token.length })
    
    const githubResponse = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "e-yar-app"
      }
    })
    
    console.log("[repos] Step 6: GitHub responded", { 
      requestId, 
      status: githubResponse.status,
      ok: githubResponse.ok 
    })
    
    if (!githubResponse.ok) {
      const errorText = await githubResponse.text()
      return NextResponse.json({
        error: "GitHub API error",
        diagnostic: { 
          requestId, 
          stage: "github_fetch",
          status: githubResponse.status,
          body: errorText.slice(0, 500)
        }
      }, { status: githubResponse.status === 401 ? 401 : 502 })
    }
    
    // Step 7: Parse and return repos
    const repos = await githubResponse.json()
    
    // Transform to expected format
    const formattedRepos = repos.map((repo: { id: number; name: string; full_name: string; clone_url: string; default_branch: string; owner: { login: string } }) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      clone_url: repo.clone_url,
      default_branch: repo.default_branch,
      owner: { login: repo.owner.login }
    }))
    
    console.log("[repos] Step 7: Success", { requestId, repoCount: formattedRepos.length })
    
    return NextResponse.json({ 
      repos: formattedRepos,
      diagnostic: { requestId, stage: "success" }
    })
    
  } catch (error) {
    console.error("[repos] Unexpected error:", error)
    return NextResponse.json({
      error: "Unexpected server error",
      diagnostic: { 
        requestId, 
        stage: "catch_block",
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    }, { status: 500 })
  }
}
