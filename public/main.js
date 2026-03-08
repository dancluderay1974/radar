/**
 * Stage 1: Shared UI state.
 * Why this exists: tracks selected node, active user, and session metadata so every
 * interaction area (left rail + top rail + preview) stays synchronized.
 */
const state = {
  sessionId: "session-demo",
  selectedNodeId: null,
  activeUserEmail: "",
  chat: [],
  mcpServers: [],
  githubConnection: null,
  repoLoaded: false
};

/**
 * Stage 2: DOM references.
 * Why this exists: centralizing lookups keeps handlers concise and makes future UI
 * extension less error-prone.
 */
const elements = {
  repoUrl: document.getElementById("repoUrl"),
  repoBranch: document.getElementById("repoBranch"),
  syncRepoButton: document.getElementById("syncRepoButton"),
  repoStatus: document.getElementById("repoStatus"),
  githubUsername: document.getElementById("githubUsername"),
  githubToken: document.getElementById("githubToken"),
  githubConnectButton: document.getElementById("githubConnectButton"),
  githubStatus: document.getElementById("githubStatus"),
  mcpService: document.getElementById("mcpService"),
  mcpLabel: document.getElementById("mcpLabel"),
  mcpEndpoint: document.getElementById("mcpEndpoint"),
  mcpConnectButton: document.getElementById("mcpConnectButton"),
  mcpRefreshButton: document.getElementById("mcpRefreshButton"),
  mcpStatus: document.getElementById("mcpStatus"),
  mcpServers: document.getElementById("mcpServers"),
  signupEmail: document.getElementById("signupEmail"),
  signupPassword: document.getElementById("signupPassword"),
  signupPlan: document.getElementById("signupPlan"),
  signupButton: document.getElementById("signupButton"),
  signupStatus: document.getElementById("signupStatus"),
  quickLoginButton: document.getElementById("quickLoginButton"),
  quickLoginStatus: document.getElementById("quickLoginStatus"),
  activeUserBadge: document.getElementById("activeUserBadge"),
  chatLog: document.getElementById("chatLog"),
  chatInput: document.getElementById("chatInput"),
  sendChatButton: document.getElementById("sendChatButton"),
  chatStatus: document.getElementById("chatStatus"),
  selectedNode: document.getElementById("selectedNode"),
  billingEmail: document.getElementById("billingEmail"),
  billingButton: document.getElementById("billingButton"),
  billingOutput: document.getElementById("billingOutput"),
  previewFrame: document.getElementById("previewFrame"),
  projectTitle: document.getElementById("projectTitle"),
  previewUrl: document.getElementById("previewUrl"),
  configTabs: Array.from(document.querySelectorAll(".config-tab")),
  configPanels: Array.from(document.querySelectorAll(".config-panel"))
};

/**
 * Stage 3: Rendering and status helpers.
 * Why this exists: separates DOM drawing from network workflows and makes user
 * feedback explicit for each interaction state.
 */
function renderChat() {
  elements.chatLog.innerHTML = "";

  state.chat.forEach((entry) => {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${entry.role}`;
    bubble.innerText = `${entry.role.toUpperCase()}: ${entry.content}`;
    elements.chatLog.appendChild(bubble);
  });

  elements.chatLog.scrollTop = elements.chatLog.scrollHeight;
}

function setStatus(target, message, tone = "info") {
  target.innerText = message;
  target.dataset.tone = tone;
}

function renderActiveUser() {
  elements.activeUserBadge.textContent = state.activeUserEmail
    ? `Logged in: ${state.activeUserEmail}`
    : "Not logged in";
}

/**
 * Stage 3a: Preview rendering helper.
 * Why this exists: enforces an empty-by-default preview and only loads the project
 * canvas after a repository pull succeeds.
 */
function renderPreviewState() {
  if (!state.repoLoaded) {
    elements.previewFrame.src = "/preview-empty.html";
    elements.projectTitle.textContent = "No repository loaded";
    elements.previewUrl.textContent = "No preview loaded";
    return;
  }

  elements.previewFrame.src = "/preview.html";
  elements.projectTitle.textContent = state.sessionName || "Repository preview";
  elements.previewUrl.textContent = state.repoUrl || "/preview.html";
}

/**
 * Stage 3b: Configuration icon-tab controller.
 * Why this exists: keeps the left rail compact by showing one settings group at a
 * time while preserving direct access to all configuration workflows.
 */
function setupConfigTabs() {
  const tabs = elements.configTabs || [];
  const panels = elements.configPanels || [];

  if (!tabs.length || !panels.length) {
    return;
  }

  function setActiveConfigTab(tabId) {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.configTab === tabId;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.configPanel === tabId;
      panel.classList.toggle("active", isActive);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabId = tab.dataset.configTab;
      setActiveConfigTab(tabId);
    });
  });

  const defaultTab = tabs.find((tab) => tab.classList.contains("active"))?.dataset.configTab || tabs[0].dataset.configTab;
  setActiveConfigTab(defaultTab);
}

function renderMcpServers() {
  elements.mcpServers.innerHTML = "";

  if (!state.mcpServers.length) {
    elements.mcpServers.innerHTML = '<p class="muted">No MCP servers connected yet.</p>';
    return;
  }

  state.mcpServers.forEach((server) => {
    const item = document.createElement("article");
    item.className = "mcp-card";
    item.innerHTML = `
      <div class="mcp-card-row">
        <strong>${server.label}</strong>
        <span class="status-chip small">${server.status}</span>
      </div>
      <p class="mcp-meta">${server.service} · ${server.endpoint}</p>
      <p class="mcp-meta">Capabilities: ${server.capabilities.join(", ")}</p>
      <button data-server-id="${server.id}" data-tool="list_tables" class="mcp-invoke secondary">Test Tool</button>
    `;
    elements.mcpServers.appendChild(item);
  });

  const invokeButtons = Array.from(document.querySelectorAll(".mcp-invoke"));
  invokeButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const serverId = button.getAttribute("data-server-id");
      const toolName = button.getAttribute("data-tool") || "diagnostics";
      await invokeMcpTool(serverId, toolName);
    });
  });
}

/**
 * Stage 4: API workflows.
 * Why this exists: each product action maps to one backend endpoint and applies
 * strong guardrails to keep the demo resilient.
 */
async function loadSession() {
  const response = await fetch(`/api/sessions/${state.sessionId}`);
  const session = await response.json();

  state.chat = session.chat || [];
  state.repoUrl = session.repoUrl || "";
  state.sessionName = session.name || "";
  state.repoLoaded = Boolean(session.repoLoaded);
  state.githubConnection = session.githubConnection || null;

  elements.repoUrl.value = session.repoUrl || "";
  elements.repoBranch.value = session.branch || "main";
  if (state.githubConnection?.username) {
    elements.githubUsername.value = state.githubConnection.username;
    setStatus(elements.githubStatus, `GitHub connected as ${state.githubConnection.username}.`, "success");
  }

  renderChat();
  renderActiveUser();
  renderPreviewState();
  await refreshMcpServers();
}

/**
 * Stage 4a: GitHub account connectivity flow.
 * Why this exists: lets users explicitly connect GitHub credentials before attempting
 * repository pulls that depend on GitHub access.
 */
async function connectGithub() {
  const payload = {
    sessionId: state.sessionId,
    username: elements.githubUsername.value.trim(),
    token: elements.githubToken.value.trim()
  };

  const response = await fetch("/api/github/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    setStatus(elements.githubStatus, data.error || "GitHub connection failed", "error");
    return;
  }

  state.githubConnection = data.githubConnection;
  elements.githubToken.value = "";
  setStatus(elements.githubStatus, data.message, "success");
}

async function connectMcpServer() {
  const payload = {
    service: elements.mcpService.value,
    label: elements.mcpLabel.value.trim(),
    endpoint: elements.mcpEndpoint.value.trim()
  };

  const response = await fetch("/api/mcp/servers/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    setStatus(elements.mcpStatus, data.error || "MCP connect failed", "error");
    return;
  }

  setStatus(elements.mcpStatus, `Connected ${data.server.label}.`, "success");
  elements.mcpLabel.value = "";
  await refreshMcpServers();
}

async function refreshMcpServers() {
  const response = await fetch("/api/mcp/servers");
  const data = await response.json();

  if (!response.ok) {
    setStatus(elements.mcpStatus, data.error || "Failed to load MCP servers", "error");
    return;
  }

  state.mcpServers = data.servers || [];
  renderMcpServers();
}

async function invokeMcpTool(serverId, toolName) {
  const response = await fetch(`/api/mcp/servers/${encodeURIComponent(serverId)}/invoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toolName, payload: { requestedFrom: "dashboard-ui" } })
  });

  const data = await response.json();
  if (!response.ok) {
    setStatus(elements.mcpStatus, data.error || "MCP tool invocation failed", "error");
    return;
  }

  setStatus(elements.mcpStatus, `${toolName} executed on ${serverId}.`, "success");
}

async function signup() {
  const payload = {
    email: elements.signupEmail.value.trim(),
    password: elements.signupPassword.value,
    plan: elements.signupPlan.value
  };

  const response = await fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    setStatus(elements.signupStatus, data.error || "Signup failed", "error");
    return;
  }

  state.activeUserEmail = payload.email;
  elements.billingEmail.value = payload.email;
  renderActiveUser();
  setStatus(elements.signupStatus, `Created account on ${data.user.plan} plan.`, "success");
}

async function quickLogin() {
  const demoEmail = "demo@e-yar.com";
  const payload = { email: demoEmail, password: "demo-password", plan: "pro" };

  const response = await fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  // Stage 4b: "already exists" is an acceptable quick-login outcome in this prototype.
  if (!response.ok && response.status !== 409) {
    setStatus(elements.quickLoginStatus, data.error || "Quick login failed", "error");
    return;
  }

  state.activeUserEmail = demoEmail;
  elements.billingEmail.value = demoEmail;
  renderActiveUser();
  setStatus(elements.quickLoginStatus, "Demo session ready. You can now prompt Codex.", "success");
}

async function syncRepository() {
  const payload = {
    sessionId: state.sessionId,
    repoUrl: elements.repoUrl.value.trim(),
    branch: elements.repoBranch.value.trim() || "main"
  };

  const response = await fetch("/api/repo/pull", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    setStatus(elements.repoStatus, data.error || "Repo sync failed", "error");
    return;
  }

  state.repoLoaded = true;
  state.repoUrl = data.session.repoUrl;
  state.sessionName = data.session.name;
  renderPreviewState();
  setStatus(elements.repoStatus, `${data.message} (${data.session.branch})`, "success");
}

async function sendChat() {
  if (!state.activeUserEmail) {
    setStatus(elements.chatStatus, "Use Quick Login or create an account before chatting.", "error");
    return;
  }

  const message = elements.chatInput.value.trim();
  if (!message) {
    setStatus(elements.chatStatus, "Enter a prompt first.", "error");
    return;
  }

  const payload = {
    sessionId: state.sessionId,
    message,
    selectedNodeId: state.selectedNodeId,
    userEmail: state.activeUserEmail
  };

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    setStatus(elements.chatStatus, data.error || "Chat request failed", "error");
    return;
  }

  state.chat = data.chat;
  renderChat();
  elements.chatInput.value = "";
  setStatus(elements.chatStatus, `Prompt completed. Credits left: ${data.creditsRemaining}`, "success");
}

async function refreshBilling() {
  const email = elements.billingEmail.value.trim();
  if (!email) {
    setStatus(elements.chatStatus, "Provide an email for billing lookup.", "error");
    return;
  }

  const response = await fetch(`/api/billing/${encodeURIComponent(email)}`);
  const data = await response.json();

  if (!response.ok) {
    elements.billingOutput.textContent = data.error || "Billing lookup failed";
    return;
  }

  elements.billingOutput.textContent = JSON.stringify(data, null, 2);
}

/**
 * Stage 5: Event wiring.
 * Why this exists: binds click handlers and receives selected node IDs from the
 * iframe so prompts can be scoped to exact visual elements.
 */
window.addEventListener("message", (event) => {
  if (event.data?.type !== "preview-node-selected") {
    return;
  }

  state.selectedNodeId = event.data.nodeId;
  elements.selectedNode.textContent = state.selectedNodeId;
});

setupConfigTabs();

elements.quickLoginButton.addEventListener("click", quickLogin);
elements.signupButton.addEventListener("click", signup);
elements.githubConnectButton.addEventListener("click", connectGithub);
elements.syncRepoButton.addEventListener("click", syncRepository);
elements.mcpConnectButton.addEventListener("click", connectMcpServer);
elements.mcpRefreshButton.addEventListener("click", refreshMcpServers);
elements.sendChatButton.addEventListener("click", sendChat);
elements.billingButton.addEventListener("click", refreshBilling);

loadSession().catch(() => {
  setStatus(elements.chatStatus, "Failed to load session.", "error");
});
