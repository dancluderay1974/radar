import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { runAgentInstruction } from "@/lib/agent/orchestrator"
import { ensurePreviewUrl, reapIdleSandboxes } from "@/lib/sandbox/manager"
import { sessionStore } from "@/lib/session/store"

/**
 * Step 0: Enforce the Edge runtime for Cloudflare Pages compatibility.
 */
export const runtime = "edge"

/**
 * Step 1: Create runtime-safe UUID values.
 * Why: `globalThis.crypto.randomUUID()` works in both Edge runtimes and modern Node.
 */
function createRuntimeSafeId() {
  return globalThis.crypto.randomUUID()
}

/**
 * Step 2: Receive one chat prompt and run agent orchestration against the session.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  await reapIdleSandboxes()

  const authSession = await auth()
  if (!authSession?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { sessionId } = await params
  const record = sessionStore.get(sessionId)

  if (!record || record.userId !== authSession.user.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  const body = await request.json()
  const prompt = body.prompt as string

  const userMessage = { id: createRuntimeSafeId(), role: "user" as const, content: prompt, createdAt: new Date().toISOString() }
  record.messages.push(userMessage)

  const result = await runAgentInstruction(record, prompt)

  const assistantMessage = {
    id: createRuntimeSafeId(),
    role: "assistant" as const,
    content: result.summary,
    createdAt: new Date().toISOString(),
  }

  record.messages.push(assistantMessage)
  record.previewUrl = await ensurePreviewUrl(record.sandboxId, 3000)
  record.lastActiveAt = Date.now()

  sessionStore.update(record.id, record)

  return NextResponse.json({
    message: assistantMessage,
    logs: result.logs,
    previewUrl: record.previewUrl,
  })
}
