/**
 * Session store module
 * --------------------
 * This module keeps lightweight in-memory state for active AI coding sessions.
 *
 * Why in-memory for this minimal production-ready implementation:
 * - It keeps the architecture simple and easy to reason about.
 * - Session state can later move to Redis/Postgres with minimal surface changes.
 * - It supports multiple concurrent sessions per running server instance.
 */

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: string
}

export interface SessionRecord {
  id: string
  userId: string
  owner: string
  repo: string
  branch: string
  repoUrl: string
  sandboxId: string
  repoPath: string
  previewUrl: string | null
  lastActiveAt: number
  messages: ChatMessage[]
}

/**
 * Stage 1: Global singleton map.
 * Why: In Next.js dev mode modules can be reloaded; anchoring on globalThis avoids
 * accidental state resets between hot reload boundaries in local development.
 */
declare global {
  // eslint-disable-next-line no-var
  var __workspaceSessions: Map<string, SessionRecord> | undefined
}

const sessions = globalThis.__workspaceSessions ?? new Map<string, SessionRecord>()
globalThis.__workspaceSessions = sessions

/**
 * Stage 2: CRUD helpers used by route handlers and orchestrators.
 */
export const sessionStore = {
  create(session: SessionRecord) {
    sessions.set(session.id, session)
    return session
  },
  get(sessionId: string) {
    return sessions.get(sessionId)
  },
  update(sessionId: string, patch: Partial<SessionRecord>) {
    const current = sessions.get(sessionId)
    if (!current) return null
    const updated = { ...current, ...patch }
    sessions.set(sessionId, updated)
    return updated
  },
  touch(sessionId: string) {
    const current = sessions.get(sessionId)
    if (!current) return null
    current.lastActiveAt = Date.now()
    sessions.set(sessionId, current)
    return current
  },
}
