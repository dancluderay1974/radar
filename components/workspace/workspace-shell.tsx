"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChatPanel } from "@/components/workspace/chat-panel"
import { PreviewFrame } from "@/components/workspace/preview-frame"
import { RepoSelector } from "@/components/workspace/repo-selector"

/**
 * WorkspaceShell
 * --------------
 * Parent composition component that glues repository selection, chat, and preview.
 */
export function WorkspaceShell() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [branch, setBranch] = useState<string | null>(null)

  const handleCommit = async () => {
    if (!sessionId) return
    await fetch(`/api/sessions/${sessionId}/commit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "AI workspace update" }),
    })
  }

  return (
    <div className="space-y-4 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">AI Coding Workspace</h1>
        <p className="text-sm text-muted-foreground">
          Select a repository, start a dedicated sandbox, and chat with the coding agent.
        </p>
      </div>

      <RepoSelector
        onSessionCreated={({ sessionId: createdId, previewUrl: createdPreviewUrl, branch: createdBranch }) => {
          setSessionId(createdId)
          setPreviewUrl(createdPreviewUrl)
          setBranch(createdBranch)
        }}
      />

      <div className="flex items-center justify-between rounded-md border p-3 text-sm">
        <span>
          Active branch: <strong>{branch ?? "(none)"}</strong>
        </span>
        <Button variant="outline" onClick={handleCommit} disabled={!sessionId}>
          Commit & Push
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChatPanel sessionId={sessionId} onPreviewUpdate={setPreviewUrl} />
        <PreviewFrame sessionId={sessionId} previewUrl={previewUrl} onPreviewUpdate={setPreviewUrl} />
      </div>
    </div>
  )
}
