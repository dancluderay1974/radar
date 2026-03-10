"use client"

import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatPanelProps {
  sessionId: string | null
  onPreviewUpdate: (url: string | null) => void
}

/**
 * ChatPanel
 * ---------
 * This component provides a minimal chat workflow:
 * 1) User types prompt.
 * 2) Prompt is sent to `/api/sessions/:id/messages`.
 * 3) Assistant response is rendered.
 * 4) Preview URL gets refreshed after each run.
 */
export function ChatPanel({ sessionId, onPreviewUpdate }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [prompt, setPrompt] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!prompt.trim() || !sessionId) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
    }

    setMessages((current) => [...current, userMessage])
    setPrompt("")
    setIsSending(true)

    const response = await fetch(`/api/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userMessage.content }),
    })

    const data = await response.json()

    setMessages((current) => [
      ...current,
      {
        id: data.message.id,
        role: "assistant",
        content: data.message.content,
      },
    ])

    onPreviewUpdate(data.previewUrl)
    setIsSending(false)
  }

  return (
    <div className="flex h-[560px] flex-col rounded-lg border">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Try: “Add a pricing page”, “Change navbar colour to blue”, or “Add a contact form”.
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-md p-3 text-sm ${
              message.role === "user" ? "ml-8 bg-primary text-primary-foreground" : "mr-8 bg-muted"
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
        <Input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Tell the AI what to change..."
          disabled={!sessionId || isSending}
        />
        <Button type="submit" disabled={!sessionId || isSending}>
          {isSending ? "Running..." : "Send"}
        </Button>
      </form>
    </div>
  )
}
