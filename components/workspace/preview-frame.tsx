"use client"

import { useEffect, useMemo } from "react"

interface PreviewFrameProps {
  sessionId: string | null
  previewUrl: string | null
  onPreviewUpdate: (url: string | null) => void
}

/**
 * PreviewFrame
 * ------------
 * Stage 1: Render the live preview URL in an iframe.
 * Stage 2: Poll backend endpoint so URL refreshes when sandbox restarts/rebinds ports.
 */
export function PreviewFrame({ sessionId, previewUrl, onPreviewUpdate }: PreviewFrameProps) {
  useEffect(() => {
    if (!sessionId) return

    const interval = setInterval(async () => {
      const response = await fetch(`/api/sessions/${sessionId}/preview`)
      const data = await response.json()
      onPreviewUpdate(data.previewUrl)
    }, 5000)

    return () => clearInterval(interval)
  }, [sessionId, onPreviewUpdate])

  const frameKey = useMemo(() => `${sessionId ?? "none"}-${previewUrl ?? "none"}`, [sessionId, previewUrl])

  if (!previewUrl) {
    return (
      <div className="flex h-[560px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
        Launch a session to start the live preview.
      </div>
    )
  }

  return <iframe key={frameKey} src={previewUrl} className="h-[560px] w-full rounded-lg border bg-white" />
}
