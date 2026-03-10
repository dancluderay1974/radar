import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createSandboxForSession, ensurePreviewUrl, reapIdleSandboxes, runSandboxCommand } from "@/lib/sandbox/manager"
import { sessionStore } from "@/lib/session/store"

export const runtime = "nodejs"

/**
 * Step 0: Create a new coding session tied to one selected GitHub repository.
 *
 * Lifecycle stages executed here:
 * 1) Create sandbox.
 * 2) Clone repository.
 * 3) Install dependencies.
 * 4) Create branch.
 * 5) Start dev server and expose preview URL.
 */
export async function POST(request: NextRequest) {
  await reapIdleSandboxes()

  const session = await auth()
  if (!session?.user?.id || !session.user.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { owner, repo, cloneUrl, defaultBranch } = body as {
    owner: string
    repo: string
    cloneUrl: string
    defaultBranch: string
  }

  const branch = `ai/session-${Date.now()}`
  const sandbox = await createSandboxForSession()
  const repoPath = `/home/user/${repo}`

  await runSandboxCommand(sandbox.sandboxId, `git clone https://x-access-token:${session.user.accessToken}@github.com/${owner}/${repo}.git ${repoPath}`)
  await runSandboxCommand(sandbox.sandboxId, "npm install", repoPath)
  await runSandboxCommand(sandbox.sandboxId, `git checkout -b ${branch} origin/${defaultBranch}`, repoPath)
  await runSandboxCommand(
    sandbox.sandboxId,
    "nohup npm run dev -- --port 3000 > /tmp/dev.log 2>&1 &",
    repoPath
  )

  const previewUrl = await ensurePreviewUrl(sandbox.sandboxId, 3000)

  const record = sessionStore.create({
    id: randomUUID(),
    userId: session.user.id,
    owner,
    repo,
    branch,
    repoUrl: cloneUrl,
    sandboxId: sandbox.sandboxId,
    repoPath,
    previewUrl,
    lastActiveAt: Date.now(),
    messages: [],
  })

  return NextResponse.json({ session: record })
}
