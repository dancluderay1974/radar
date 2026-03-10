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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadRepos = async () => {
      const response = await fetch("/api/github/repos")
      const data = await response.json()
      setRepos(data.repos || [])
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
    <div className="flex gap-2">
      <select
        className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"
        value={selectedRepo}
        onChange={(event) => setSelectedRepo(event.target.value)}
      >
        <option value="">Select a repository...</option>
        {repos.map((repo) => (
          <option key={repo.id} value={repo.full_name}>
            {repo.full_name}
          </option>
        ))}
      </select>
      <Button onClick={handleCreateSession} disabled={!selectedRepo || loading}>
        {loading ? "Starting..." : "Launch Session"}
      </Button>
    </div>
  )
}
