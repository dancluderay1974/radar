/**
 * GitHub API utility module
 * ------------------------
 * This module centralizes all GitHub REST interactions needed by the workspace:
 * - Listing repositories the user can access.
 * - Creating/pushing a branch via git inside the sandbox.
 *
 * We intentionally use `fetch` against GitHub REST endpoints so the module has no
 * external SDK dependency and is easy to run in standard Node runtimes.
 */

export interface GithubRepo {
  id: number
  name: string
  full_name: string
  private: boolean
  default_branch: string
  clone_url: string
  owner: { login: string }
}

/**
 * Stage 0: Structured GitHub API error model.
 *
 * Why this type exists:
 * - API route handlers need to distinguish auth failures (401/403) from upstream outages (5xx).
 * - A typed error lets us map user-facing HTTP statuses without brittle string parsing.
 */
export class GithubApiError extends Error {
  status: number
  path: string
  responseBody: string

  constructor({ status, path, responseBody }: { status: number; path: string; responseBody: string }) {
    super(`GitHub API error (${status}) on ${path}`)
    this.name = "GithubApiError"
    this.status = status
    this.path = path
    this.responseBody = responseBody
  }
}

/**
 * Stage 1: shared request helper with consistent auth and error formatting.
 */
async function githubRequest<T>(
  token: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  /**
   * Stage 1b (Server Trace): Report outbound GitHub request metadata.
   *
   * Why this trace exists:
   * - Confirms the exact endpoint path being queried.
   * - Helps identify whether pagination and filtering params are applied as expected.
   */
  console.log("[GitHubClient][Stage 1b] Requesting GitHub endpoint", { path })

  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      /**
       * Stage 1a: Always send a User-Agent header.
       *
       * Why this is required:
       * - GitHub REST APIs can reject requests that do not include User-Agent.
       * - Edge runtimes do not always set a predictable default User-Agent.
       * - A stable app identifier avoids environment-specific repo-loading failures.
       */
      "User-Agent": "e-yar-dashboard",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error("[GitHubClient][Stage 1c] GitHub endpoint failed", {
      path,
      status: response.status,
      errorBody,
    })
    throw new GithubApiError({
      status: response.status,
      path,
      responseBody: errorBody,
    })
  }

  console.log("[GitHubClient][Stage 1d] GitHub endpoint succeeded", {
    path,
    status: response.status,
  })

  return (await response.json()) as T
}

/**
 * Stage 2: repo picker data source.
 */
export async function listUserRepos(token: string): Promise<GithubRepo[]> {
  /**
   * Stage 2a: Build a deterministic query that includes all repository affiliations.
   *
   * Why this query exists:
   * - `affiliation` makes the request explicit about owner/collaborator/org visibility.
   * - `visibility=all` avoids accidentally filtering to only one visibility bucket.
   * - `sort=updated` keeps most relevant repos near the top for faster selection.
   */
  const query = new URLSearchParams({
    per_page: "100",
    sort: "updated",
    visibility: "all",
    affiliation: "owner,collaborator,organization_member",
  })

  /**
   * Stage 2a.1: Prepare a conservative fallback query for API-compatibility retries.
   *
   * Why this exists:
   * - Some deployments/proxies reject one or more advanced filters used in the primary query.
   * - A reduced query shape keeps repository loading functional for users even when optional
   *   filters are not accepted by the upstream API path.
   */
  const fallbackQuery = new URLSearchParams({
    per_page: "100",
    sort: "updated",
  })

  /**
   * Stage 2b: Iterate through pagination so large accounts still get a complete list.
   */
  const repos: GithubRepo[] = []
  let page = 1

  while (true) {
    /**
     * Stage 2c (Server Trace): Track each pagination pass for repo loading.
     */
    console.log("[GitHubClient][Stage 2c] Loading repository page", { page })
    const pageQuery = new URLSearchParams(query)
    pageQuery.set("page", String(page))

    let pageRepos: GithubRepo[]

    try {
      /**
       * Stage 2c.1: Execute the primary query first so we preserve intended filtering behavior.
       */
      pageRepos = await githubRequest<GithubRepo[]>(token, `/user/repos?${pageQuery.toString()}`)
    } catch (error) {
      /**
       * Stage 2c.2: Retry with compatibility query when upstream rejects primary query shape.
       *
       * Why this branch exists:
       * - GitHub-compatible upstreams can respond with 400/422 for certain filter combinations.
       * - A one-time fallback prevents hard failures that bubble up as 502 in the dashboard.
       */
      const isRetryableQueryShapeFailure =
        error instanceof GithubApiError && (error.status === 400 || error.status === 422)

      if (!isRetryableQueryShapeFailure) {
        throw error
      }

      console.warn("[GitHubClient][Stage 2c.2] Primary repo query rejected; retrying with fallback query", {
        page,
        status: error.status,
      })

      const fallbackPageQuery = new URLSearchParams(fallbackQuery)
      fallbackPageQuery.set("page", String(page))
      pageRepos = await githubRequest<GithubRepo[]>(token, `/user/repos?${fallbackPageQuery.toString()}`)
    }

    repos.push(...pageRepos)
    console.log("[GitHubClient][Stage 2d] Received repository page", {
      page,
      pageCount: pageRepos.length,
      runningTotal: repos.length,
    })

    /**
     * Stage 2c: Stop when GitHub returns a partial/empty page.
     *
     * Why this is safe:
     * - GitHub returns at most `per_page` items.
     * - Any page smaller than `per_page` indicates the final page.
     */
    if (pageRepos.length < 100) {
      break
    }

    page += 1
  }

  /**
   * Stage 2e (Server Trace): Emit final aggregate count returned to API layer.
   */
  console.log("[GitHubClient][Stage 2e] Completed repository pagination", {
    totalRepos: repos.length,
    totalPages: page,
  })

  return repos
}
