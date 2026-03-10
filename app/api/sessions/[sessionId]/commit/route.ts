import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createAgentTools } from "@/lib/agent/tools"
import { sessionStore } from "@/lib/session/store"

/**
 * Step 0: Enforce the Edge runtime for Cloudflare Pages compatibility.
 */
export const runtime = "edge"

/**
 * Step 1: Manual "commit and push" endpoint for explicit user control.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
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
  const message = (body.message as string) || "AI-assisted changes"

  const tools = createAgentTools(record)
  const output = await tools.commit_changes(message)

  return NextResponse.json({ branch: record.branch, output })
}
