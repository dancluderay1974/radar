# e-yar.com Prototype

A documented prototype of the platform you described: v0/Figma Make-style AI builder with:
- left chat workspace,
- live preview,
- click-to-focus element targeting,
- git repo pull simulation,
- account signup,
- quick login,
- MCP integration management (Supabase/Cloudflare/GitHub),
- credit-based billing visibility,
- Codex orchestration simulation.

## Run
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Cloudflare path
This project is already compatible with a Cloudflare-first deployment strategy:
- **Cloudflare Pages** can host the `public/` experience.
- **Cloudflare Workers** can replace the Node HTTP server routes under `/api/*`.
- **Cloudflare D1 / KV / R2** can back session, account, and preview metadata.

## MCP integration prototype
- Use the **MCP Integrations** panel in the left rail to connect service endpoints.
- The backend now exposes:
  - `GET /api/mcp/servers`
  - `POST /api/mcp/servers/connect`
  - `POST /api/mcp/servers/:serverId/invoke`
- Supabase is included as a first-class preset to support development workflows.

## Notes
This is a foundation architecture and workflow prototype. It demonstrates the core interaction model and product framing so the next step can integrate real Codex APIs, git workers, and persistent billing/auth infrastructure.
