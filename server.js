/**
 * Stage 1: Core Node.js module imports.
 * Why this exists: we intentionally rely on built-in modules only so the prototype
 * runs even in restricted environments without package registry access.
 */
import http from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Stage 2: Runtime constants and in-memory stores.
 * Why this exists: creates a single source of truth for sessions/users in this
 * prototype while mirroring data we would persist in production.
 */
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

const state = {
  users: [],
  sessions: [
    {
      id: "session-demo",
      name: "Landing page refresh",
      repoUrl: "https://github.com/example/acme-landing",
      branch: "main",
      creditsUsed: 138,
      chat: [
        {
          role: "assistant",
          content:
            "Welcome to e-yar.com. Connect a repository, ask for a change, and click UI elements in preview to target updates."
        }
      ],
      selectedNode: null
    }
  ]
};

/**
 * Stage 3: Utility helpers for routing and JSON responses.
 * Why this exists: keeps endpoint handlers focused on domain logic rather than
 * repeated plumbing code.
 */
function findSession(sessionId) {
  return state.sessions.find((session) => session.id === sessionId);
}

function estimateCreditCost(message) {
  const baseCost = 5;
  const lengthCost = Math.ceil((message || "").length / 80);
  return baseCost + lengthCost;
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function contentTypeFor(filePath) {
  if (filePath.endsWith(".html")) return "text/html";
  if (filePath.endsWith(".js")) return "application/javascript";
  if (filePath.endsWith(".css")) return "text/css";
  return "text/plain";
}

/**
 * Stage 4: API route dispatcher.
 * Why this exists: collects backend feature endpoints for signup, billing,
 * repository pull, chat, and session bootstrap.
 */
async function handleApiRoutes(req, res, pathname) {
  if (req.method === "POST" && pathname === "/api/signup") {
    const { email, password, plan } = await readJsonBody(req);

    if (!email || !password) {
      return sendJson(res, 400, { error: "Email and password are required." });
    }

    const existing = state.users.find((user) => user.email === email);
    if (existing) {
      return sendJson(res, 409, { error: "Account already exists." });
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      plan: plan || "starter",
      credits: plan === "pro" ? 1000 : 200,
      creditsUsed: 0
    };

    state.users.push(newUser);
    return sendJson(res, 201, { message: "Account created.", user: newUser });
  }

  if (req.method === "GET" && pathname.startsWith("/api/billing/")) {
    const email = decodeURIComponent(pathname.replace("/api/billing/", ""));
    const user = state.users.find((candidate) => candidate.email === email);

    if (!user) {
      return sendJson(res, 404, { error: "User not found." });
    }

    return sendJson(res, 200, {
      plan: user.plan,
      creditsRemaining: user.credits - user.creditsUsed,
      creditsUsed: user.creditsUsed,
      monthlyLimit: user.credits
    });
  }

  if (req.method === "POST" && pathname === "/api/repo/pull") {
    const { sessionId, repoUrl, branch } = await readJsonBody(req);
    const session = findSession(sessionId);

    if (!session) return sendJson(res, 404, { error: "Session not found." });
    if (!repoUrl || !repoUrl.startsWith("http")) {
      return sendJson(res, 400, { error: "A valid git repository URL is required." });
    }

    session.repoUrl = repoUrl;
    session.branch = branch || "main";

    return sendJson(res, 200, { message: "Repository synced and indexed.", session });
  }

  if (req.method === "POST" && pathname === "/api/chat") {
    const { sessionId, message, selectedNodeId, userEmail } = await readJsonBody(req);
    const session = findSession(sessionId);

    if (!session) return sendJson(res, 404, { error: "Session not found." });
    if (!message) return sendJson(res, 400, { error: "Message is required." });

    const user = state.users.find((candidate) => candidate.email === userEmail);
    if (!user) return sendJson(res, 404, { error: "User account not found." });

    const cost = estimateCreditCost(message);
    if (user.creditsUsed + cost > user.credits) {
      return sendJson(res, 402, { error: "Insufficient credits for this request." });
    }

    user.creditsUsed += cost;
    session.creditsUsed += cost;
    session.selectedNode = selectedNodeId || null;
    session.chat.push({ role: "user", content: message });

    const assistantMessage = `Codex plan:\n1) Inspect ${selectedNodeId || "the current page"}.\n2) Patch files in ${session.repoUrl} (${session.branch}).\n3) Rebuild preview and verify UI + accessibility.\nCredits used this prompt: ${cost}.`;

    session.chat.push({ role: "assistant", content: assistantMessage });

    return sendJson(res, 200, {
      reply: assistantMessage,
      chat: session.chat,
      creditsRemaining: user.credits - user.creditsUsed,
      session
    });
  }

  if (req.method === "GET" && pathname.startsWith("/api/sessions/")) {
    const id = pathname.replace("/api/sessions/", "");
    const session = findSession(id);
    if (!session) return sendJson(res, 404, { error: "Session not found." });
    return sendJson(res, 200, session);
  }

  return false;
}

/**
 * Stage 5: Static file server.
 * Why this exists: serves the frontend workspace and preview canvas assets.
 */
async function handleStatic(req, res, pathname) {
  const normalizedPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = path.normalize(normalizedPath).replace(/^\.{2,}/, "");
  const fullPath = path.join(publicDir, safePath);

  try {
    const contents = await fs.readFile(fullPath);
    res.writeHead(200, { "Content-Type": contentTypeFor(fullPath) });
    res.end(contents);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
}

/**
 * Stage 6: HTTP server setup.
 * Why this exists: central entrypoint that dispatches API routes first, then
 * static assets.
 */
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const handled = await handleApiRoutes(req, res, url.pathname);
    if (handled !== false) return;
    await handleStatic(req, res, url.pathname);
  } catch (error) {
    sendJson(res, 500, { error: "Internal server error", details: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`e-yar.com prototype is running at http://localhost:${PORT}`);
});
