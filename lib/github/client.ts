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
  return githubRequest<GithubRepo[]>(token, "/user/repos?per_page=100&sort=updated")
}
