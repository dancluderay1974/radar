/**
 * E2B sandbox manager
 * -------------------
 * This module handles sandbox lifecycle and command execution for each coding session.
 *
 * Design goals:
 * 1) Each session receives its own isolated environment.
 * 2) We provide a small API that higher layers can treat as a "filesystem + shell".
 * 3) We implement idle expiration checks to support auto-destroy after inactivity.
 */

const E2B_API_BASE = "https://api.e2b.dev"
const SESSION_IDLE_TTL_MS = 30 * 60 * 1000

export interface SandboxRecord {
  id: string
  sandboxId: string
  cwd: string
  previewUrl: string | null
  lastActiveAt: number
}

declare global {
  // eslint-disable-next-line no-var
  var __sandboxRegistry: Map<string, SandboxRecord> | undefined
}

const registry = globalThis.__sandboxRegistry ?? new Map<string, SandboxRecord>()
globalThis.__sandboxRegistry = registry

/**
 * Stage 0: Runtime-safe UUID creation.
 * Why: This module is imported by route handlers that run on Cloudflare's Edge runtime,
 * where the Node `crypto` module import is unavailable. `globalThis.crypto.randomUUID`
 * works in both modern Node and Edge/Web Worker environments.
 */
function createRuntimeSafeId() {
  return globalThis.crypto.randomUUID()
}

function getE2BKey() {
  const key = process.env.E2B_API_KEY
  if (!key) throw new Error("Missing E2B_API_KEY")
  return key
}

async function e2bRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${E2B_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getE2BKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`E2B API error (${response.status}): ${body}`)
  }

  if (response.status === 204) return {} as T
  return (await response.json()) as T
}

/**
 * Stage 1: Create a new Node.js template sandbox for a session.
 */
export async function createSandboxForSession(): Promise<SandboxRecord> {
  const payload = await e2bRequest<{ sandboxId: string }>("/sandboxes", {
    method: "POST",
    body: JSON.stringify({ template: "nodejs" }),
  })

  const record: SandboxRecord = {
    id: createRuntimeSafeId(),
    sandboxId: payload.sandboxId,
    cwd: "/home/user",
    previewUrl: null,
    lastActiveAt: Date.now(),
  }

  registry.set(record.id, record)
  return record
}

/**
 * Stage 2: Execute shell commands in the sandbox.
 */
export async function runSandboxCommand(
  sandboxId: string,
  command: string,
  cwd?: string
): Promise<string> {
  const output = await e2bRequest<{ stdout?: string; stderr?: string }>(
    `/sandboxes/${sandboxId}/commands`,
    {
      method: "POST",
      body: JSON.stringify({ command, cwd }),
    }
  )

  return [output.stdout, output.stderr].filter(Boolean).join("\n")
}

/**
 * Stage 3: Expose preview port and return URL for iframe rendering.
 */
export async function ensurePreviewUrl(sandboxId: string, port = 3000): Promise<string> {
  const payload = await e2bRequest<{ url: string }>(`/sandboxes/${sandboxId}/ports/${port}`)
  return payload.url
}

/**
 * Stage 4: Auto-clean old sandboxes whenever session activity occurs.
 */
export async function reapIdleSandboxes() {
  const now = Date.now()
  const stale = [...registry.values()].filter((item) => now - item.lastActiveAt > SESSION_IDLE_TTL_MS)

  await Promise.all(
    stale.map(async (item) => {
      await e2bRequest(`/sandboxes/${item.sandboxId}`, { method: "DELETE" })
      registry.delete(item.id)
    })
  )
}
