"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface RepoItem {
  id: number
  name: string
  full_name: string
  clone_url: string
  default_branch: string
  owner: { login: string }
}

interface RepoSelectorProps {
  onSessionCreated: (payload: { sessionId: string; previewUrl: string | null; branch: string }) => void
}

/**
 * RepoSelector
 * ------------
 * Stage 1: Fetch repositories for the authenticated user.
 * Stage 2: Let the user choose one repo.
 * Stage 3: Create a new coding session bound to that repo.
 */
export function RepoSelector({ onSessionCreated }: RepoSelectorProps) {
  const [repos, setRepos] = useState<RepoItem[]>([])
  const [selectedRepo, setSelectedRepo] = useState<string>("")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadingRepos, setLoadingRepos] = useState(true)
  const [loading, setLoading] = useState(false)

  /**
   * Stage 0: Define the GitHub permissions-management entrypoint.
   *
   * Why this link exists:
   * - Users sometimes authorize GitHub once, then later need to grant broader organization
   *   or repository access.
   * - The dashboard needs a stable self-serve path for reconfiguration when repo lists appear empty.
   */
  const githubPermissionsUrl = "https://github.com/settings/connections/applications"

  useEffect(() => {
    const loadRepos = async () => {
      /**
       * Stage 1: Fetch repositories with explicit error handling.
       *
       * Why this matters:
       * - Empty lists and API failures need different user guidance.
       * - We surface a targeted message so users know whether to reconnect GitHub
       *   or simply pick from available repositories.
       */
      setLoadingRepos(true)
      setLoadError(null)
      /**
       * Stage 1.0 (Client Trace): Confirm the repository fetch cycle has started.
       *
       * Why this trace exists:
       * - The selector can feel "frozen" while loading; this message proves the request was initiated.
       * - It gives support/devs an anchor log line to follow in the browser console.
       */
      console.log("[RepoSelector][Stage 1.0] Starting repository fetch from /api/github/repos")

      try {
        const response = await fetch("/api/github/repos")
        const data = await response.json()
        /**
         * Stage 1.1 (Client Trace): Capture the raw result status.
         *
         * Why this trace exists:
         * - Confirms whether the API call succeeded, failed auth, or returned an upstream error.
         * - Includes a quick repo count to verify whether the dropdown should have options.
         */
        console.log("[RepoSelector][Stage 1.1] Repository fetch completed", {
          ok: response.ok,
          status: response.status,
          repoCount: Array.isArray(data?.repos) ? data.repos.length : 0,
          hasError: Boolean(data?.error),
        })

        if (!response.ok) {
          throw new Error(data?.error || "Unable to load repositories")
        }

        setRepos(data.repos || [])
      } catch (error) {
        /**
         * Stage 1.2 (Client Trace): Record fetch failures with a readable message.
         *
         * Why this trace exists:
         * - Distinguishes networking/auth/API failures from empty successful responses.
         * - Keeps the exact error text in the console for quick triage.
         */
        console.error("[RepoSelector][Stage 1.2] Repository fetch failed", error)
        setLoadError(error instanceof Error ? error.message : "Unable to load repositories")
        setRepos([])
      } finally {
        setLoadingRepos(false)
        /**
         * Stage 1.3 (Client Trace): Mark loading lifecycle completion.
         *
         * Why this trace exists:
         * - Verifies that the loading gate was released.
         * - Helps diagnose cases where controls remain disabled unexpectedly.
         */
        console.log("[RepoSelector][Stage 1.3] Repository loading cycle finished")
      }
    }

    loadRepos()
  }, [])

  const handleCreateSession = async () => {
    const repo = repos.find((item) => item.full_name === selectedRepo)
    if (!repo) return

    setLoading(true)

    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner: repo.owner.login,
        repo: repo.name,
        cloneUrl: repo.clone_url,
        defaultBranch: repo.default_branch,
      }),
    })

    const data = await response.json()
    setLoading(false)

    onSessionCreated({
      sessionId: data.session.id,
      previewUrl: data.session.previewUrl,
      branch: data.session.branch,
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select
          className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"
          value={selectedRepo}
          onClick={() => {
            /**
             * Stage 2.0 (Client Trace): Log selector interaction state.
             *
             * Why this trace exists:
             * - Confirms clicks are reaching the control.
             * - Shows whether disabled/loading/error state is preventing option display.
             */
            console.log("[RepoSelector][Stage 2.0] Repository selector clicked", {
              loadingRepos,
              loadError,
              repoCount: repos.length,
              selectedRepo,
            })
          }}
          onChange={(event) => setSelectedRepo(event.target.value)}
          disabled={loadingRepos || !!loadError}
        >
          <option value="">Select a repository...</option>
          {repos.map((repo) => (
            <option key={repo.id} value={repo.full_name}>
              {repo.full_name}
            </option>
          ))}
        </select>
        <Button onClick={handleCreateSession} disabled={!selectedRepo || loading || loadingRepos}>
          {loading ? "Starting..." : "Launch Session"}
        </Button>
      </div>

      {(loadError || (!loadingRepos && repos.length === 0)) && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
          <p>
            {loadError
              ? "We couldn't load your repositories."
              : "No repositories are visible yet for this GitHub connection."}
          </p>
          <p className="mt-1 text-xs opacity-90">
            Open GitHub permissions to review repository access, then reconnect if needed.
          </p>
          <div className="mt-3">
            <a
              href={githubPermissionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center rounded-md border border-amber-700/40 px-3 text-xs font-medium hover:bg-amber-500/20"
            >
              Configure GitHub Repository Access
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
