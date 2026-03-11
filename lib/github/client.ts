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
 * Stage 1: shared request helper with consistent auth and error formatting.
 */
async function githubRequest<T>(
  token: string,
  path: string,
  init?: RequestInit
): Promise<T> {
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
    throw new Error(`GitHub API error (${response.status}): ${errorBody}`)
  }

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
   * Stage 2b: Iterate through pagination so large accounts still get a complete list.
   */
  const repos: GithubRepo[] = []
  let page = 1

  while (true) {
    const pageQuery = new URLSearchParams(query)
    pageQuery.set("page", String(page))

    const pageRepos = await githubRequest<GithubRepo[]>(token, `/user/repos?${pageQuery.toString()}`)
    repos.push(...pageRepos)

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

  return repos
}
