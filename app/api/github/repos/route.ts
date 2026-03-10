import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { listUserRepos } from "@/lib/github/client"

export const runtime = "nodejs"

/**
 * Step 0: Return authenticated user's repositories for the selector UI.
 */
export async function GET() {
  const session = await auth()
  const token = session?.user?.accessToken

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const repos = await listUserRepos(token)
  return NextResponse.json({ repos })
}
