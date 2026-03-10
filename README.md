# AI Repository Coding Workspace

Minimal production-ready Next.js system for authenticated GitHub users to launch isolated AI coding sessions.

## What this project does

1. Authenticates users with GitHub OAuth (already configured in `lib/auth.ts`).
2. Lets users choose one of their repositories.
3. Spins up a dedicated E2B sandbox per session.
4. Clones the selected repository, installs dependencies, and runs `npm run dev`.
5. Exposes a live preview URL in an iframe.
6. Accepts natural-language prompts in chat and routes them through an AI agent.
7. Gives the agent file + shell tools and supports commit/push to a new branch.

## Architecture overview

### Frontend (App Router + React + Tailwind)

- `app/dashboard/page.tsx`: route entry point.
- `components/workspace/workspace-shell.tsx`: orchestration shell.
- `components/workspace/repo-selector.tsx`: GitHub repo selector + session bootstrap.
- `components/workspace/chat-panel.tsx`: chat interface.
- `components/workspace/preview-frame.tsx`: live preview iframe + polling refresh.

### Backend (Next.js API routes)

- `app/api/github/repos/route.ts`: list authenticated user repositories.
- `app/api/sessions/route.ts`: create session + provision sandbox + clone/install/dev server.
- `app/api/sessions/[sessionId]/messages/route.ts`: run AI orchestration for one user prompt.
- `app/api/sessions/[sessionId]/preview/route.ts`: poll current preview URL.
- `app/api/sessions/[sessionId]/commit/route.ts`: commit and push changes.

### Core libraries

- `lib/sandbox/manager.ts`: E2B lifecycle manager + idle cleanup.
- `lib/session/store.ts`: in-memory multi-session store.
- `lib/github/client.ts`: GitHub REST wrappers.
- `lib/agent/tools.ts`: tool implementations (`read_file`, `write_file`, `list_files`, `run_command`, `commit_changes`).
- `lib/agent/orchestrator.ts`: agent loop using OpenAI Responses-style function calling.

## Environment variables

```bash
# Auth
GITHUB_ID=...
GITHUB_SECRET=...
AUTH_SECRET=...

# AI + sandbox
OPENAI_API_KEY=...
E2B_API_KEY=...
```

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000/dashboard` after login.

## Notes on session isolation and cleanup

- Every new workspace session creates a separate sandbox.
- Sessions are tracked independently in memory.
- Idle sandboxes are reaped by `reapIdleSandboxes()` on API activity.
- This is intentionally simple and can be upgraded to persistent storage/queues later.
