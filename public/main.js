/**
 * Stage 1: Shared UI state.
 * Why this exists: tracks selected node, current user, and session metadata so all
 * controls in the workspace remain synchronized.
 */
const state = {
  sessionId: "session-demo",
  selectedNodeId: null,
  activeUserEmail: "",
  chat: []
};

/**
 * Stage 2: DOM references.
 * Why this exists: centralizing element lookups avoids duplication and keeps each
 * workflow function clear and easy to test.
 */
const elements = {
  repoUrl: document.getElementById("repoUrl"),
  repoBranch: document.getElementById("repoBranch"),
  syncRepoButton: document.getElementById("syncRepoButton"),
  repoStatus: document.getElementById("repoStatus"),
  signupEmail: document.getElementById("signupEmail"),
  signupPassword: document.getElementById("signupPassword"),
  signupPlan: document.getElementById("signupPlan"),
  signupButton: document.getElementById("signupButton"),
  signupStatus: document.getElementById("signupStatus"),
  chatLog: document.getElementById("chatLog"),
  chatInput: document.getElementById("chatInput"),
  sendChatButton: document.getElementById("sendChatButton"),
  chatStatus: document.getElementById("chatStatus"),
  selectedNode: document.getElementById("selectedNode"),
  billingEmail: document.getElementById("billingEmail"),
  billingButton: document.getElementById("billingButton"),
  billingOutput: document.getElementById("billingOutput")
};

/**
 * Stage 3: Rendering helpers.
 * Why this exists: isolates UI updates from network flows and keeps the behavior
 * deterministic when asynchronous requests resolve.
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

/**
 * Stage 4: API workflows.
 * Why this exists: each product flow maps to one backend capability and includes
 * defensive checks for user guidance.
 */
async function loadSession() {
  const response = await fetch(`/api/sessions/${state.sessionId}`);
  const session = await response.json();

  state.chat = session.chat || [];
  elements.repoUrl.value = session.repoUrl || "";
  elements.repoBranch.value = session.branch || "main";
  renderChat();
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
  setStatus(elements.signupStatus, `Created account on ${data.user.plan} plan.`, "success");
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

  setStatus(elements.repoStatus, `${data.message} (${data.session.branch})`, "success");
}

async function sendChat() {
  if (!state.activeUserEmail) {
    setStatus(elements.chatStatus, "Create an account before chatting.", "error");
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
 * Why this exists: binds user interactions and cross-window click targeting from
 * preview iframe back into chat context.
 */
window.addEventListener("message", (event) => {
  if (event.data?.type !== "preview-node-selected") {
    return;
  }

  state.selectedNodeId = event.data.nodeId;
  elements.selectedNode.textContent = state.selectedNodeId;
});

elements.signupButton.addEventListener("click", signup);
elements.syncRepoButton.addEventListener("click", syncRepository);
elements.sendChatButton.addEventListener("click", sendChat);
elements.billingButton.addEventListener("click", refreshBilling);

loadSession().catch(() => {
  setStatus(elements.chatStatus, "Failed to load session.", "error");
});
