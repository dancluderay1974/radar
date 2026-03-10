import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sessionStore } from "@/lib/session/store"

/**
 * Step 0: Enforce the Edge runtime for Cloudflare Pages compatibility.
 */
export const runtime = "edge"

/**
 * Step 1: Poll preview URL to support automatic iframe refresh in the client.
 */
export async function GET(
  _request: Request,
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

  return NextResponse.json({ previewUrl: record.previewUrl })
}
