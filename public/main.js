const { useEffect, useMemo, useState } = React;

/**
 * Stage 1: Shared constants.
 * Why this exists: centralizing immutable defaults keeps the component logic cleaner
 * and makes startup/reset behavior predictable for both humans and AI agents.
 */
const DEFAULT_SESSION_ID = "session-demo";
const CONFIG_TABS = [
  { id: "quick", icon: "⚡", title: "Quick Login" },
  { id: "github", icon: "🐙", title: "GitHub Access" },
  { id: "repo", icon: "📦", title: "Repository Sync" },
  { id: "mcp", icon: "🔌", title: "MCP Integrations" },
  { id: "account", icon: "👤", title: "Manual Signup" },
  { id: "billing", icon: "💳", title: "Credit Billing" }
];

/**
 * Stage 2: API helper.
 * Why this exists: every feature talks to the same backend and this helper enforces
 * one documented path for JSON encoding, decoding, and error normalization.
 */
async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

/**
 * Stage 3: Main React application component.
 * Why this exists: this component replaces imperative DOM wiring with declarative
 * React state transitions, making the dashboard easier to reason about and evolve.
 */
function MissionControlApp() {
  const [activeTab, setActiveTab] = useState("quick");
  const [sessionId] = useState(DEFAULT_SESSION_ID);
  const [activeUserEmail, setActiveUserEmail] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState("none");
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [repoLoaded, setRepoLoaded] = useState(false);
  const [projectTitle, setProjectTitle] = useState("No repository loaded");
  const [previewUrl, setPreviewUrl] = useState("No preview loaded");
  const [mcpServers, setMcpServers] = useState([]);

  const [form, setForm] = useState({
    githubUsername: "",
    githubToken: "",
    repoUrl: "",
    repoBranch: "main",
    mcpService: "supabase",
    mcpLabel: "",
    mcpEndpoint: "",
    signupEmail: "",
    signupPassword: "",
    signupPlan: "starter",
    billingEmail: ""
  });

  const [status, setStatus] = useState({});

  const previewFrameSrc = useMemo(() => (repoLoaded ? "/preview.html" : "/preview-empty.html"), [repoLoaded]);

  /**
   * Stage 4: Session bootstrap.
   * Why this exists: on first render we load backend session state so React starts
   * from the same data model already used by API routes.
   */
  useEffect(() => {
    apiRequest(`/api/session/${encodeURIComponent(sessionId)}`).then(({ ok, data }) => {
      if (!ok) {
        setStatus((prev) => ({ ...prev, chat: { message: data.error || "Failed to load session.", tone: "error" } }));
        return;
      }
      setChat(data.session?.chat || []);
      setRepoLoaded(Boolean(data.session?.repoLoaded));
      setProjectTitle(data.session?.name || "Repository preview");
      setPreviewUrl(data.session?.repoUrl || "No preview loaded");
      if (data.session?.githubConnection?.username) {
        setStatus((prev) => ({
          ...prev,
          github: { message: `GitHub connected as ${data.session.githubConnection.username}.`, tone: "success" }
        }));
      }
    });

    const onPreviewMessage = (event) => {
      if (event.data?.type === "preview-node-selected") {
        setSelectedNodeId(event.data.nodeId || "none");
      }
    };

    window.addEventListener("message", onPreviewMessage);
    return () => window.removeEventListener("message", onPreviewMessage);
  }, [sessionId]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setPanelStatus = (panel, message, tone = "info") => setStatus((prev) => ({ ...prev, [panel]: { message, tone } }));

  const handleQuickLogin = async () => {
    const payload = { email: "demo@e-yar.com", password: "demo-password", plan: "pro" };
    const { ok, status: code, data } = await apiRequest("/api/signup", { method: "POST", body: JSON.stringify(payload) });
    if (!ok && code !== 409) return setPanelStatus("quick", data.error || "Quick login failed", "error");
    setActiveUserEmail(payload.email);
    updateField("billingEmail", payload.email);
    setPanelStatus("quick", "Demo session ready. You can now prompt Codex.", "success");
  };

  const handleGithubConnect = async () => {
    const payload = { sessionId, username: form.githubUsername.trim(), token: form.githubToken.trim() };
    const { ok, data } = await apiRequest("/api/github/connect", { method: "POST", body: JSON.stringify(payload) });
    if (!ok) return setPanelStatus("github", data.error || "GitHub connect failed", "error");
    setPanelStatus("github", data.message, "success");
  };

  const handleRepoSync = async () => {
    const payload = { sessionId, repoUrl: form.repoUrl.trim(), branch: form.repoBranch.trim() || "main" };
    const { ok, data } = await apiRequest("/api/repo/pull", { method: "POST", body: JSON.stringify(payload) });
    if (!ok) return setPanelStatus("repo", data.error || "Repository pull failed", "error");
    setRepoLoaded(true);
    setProjectTitle(data.session?.name || "Repository preview");
    setPreviewUrl(data.session?.repoUrl || "/preview.html");
    setPanelStatus("repo", `${data.message} (${data.session?.branch || "main"})`, "success");
  };

  const refreshMcpServers = async () => {
    const { ok, data } = await apiRequest("/api/mcp/servers");
    if (!ok) return setPanelStatus("mcp", data.error || "Failed to load MCP servers", "error");
    setMcpServers(data.servers || []);
  };

  const connectMcpServer = async () => {
    const payload = { service: form.mcpService, label: form.mcpLabel.trim(), endpoint: form.mcpEndpoint.trim() };
    const { ok, data } = await apiRequest("/api/mcp/servers/connect", { method: "POST", body: JSON.stringify(payload) });
    if (!ok) return setPanelStatus("mcp", data.error || "MCP connect failed", "error");
    setPanelStatus("mcp", `Connected ${data.server?.label || "server"}.`, "success");
    await refreshMcpServers();
  };

  const handleSignup = async () => {
    const payload = { email: form.signupEmail.trim(), password: form.signupPassword, plan: form.signupPlan };
    const { ok, data } = await apiRequest("/api/signup", { method: "POST", body: JSON.stringify(payload) });
    if (!ok) return setPanelStatus("account", data.error || "Signup failed", "error");
    setActiveUserEmail(payload.email);
    updateField("billingEmail", payload.email);
    setPanelStatus("account", `Created account on ${data.user?.plan || payload.plan} plan.`, "success");
  };

  const handleSendChat = async () => {
    if (!activeUserEmail) return setPanelStatus("chat", "Use Quick Login or create an account before chatting.", "error");
    if (!chatInput.trim()) return setPanelStatus("chat", "Enter a prompt first.", "error");

    const payload = { sessionId, message: chatInput.trim(), selectedNodeId, userEmail: activeUserEmail };
    const { ok, data } = await apiRequest("/api/chat", { method: "POST", body: JSON.stringify(payload) });
    if (!ok) return setPanelStatus("chat", data.error || "Chat request failed", "error");
    setChat(data.chat || []);
    setChatInput("");
    setPanelStatus("chat", `Prompt completed. Credits left: ${data.creditsRemaining}`, "success");
  };

  const handleBillingLookup = async () => {
    if (!form.billingEmail.trim()) return setPanelStatus("billing", "Provide an email for billing lookup.", "error");
    const { ok, data } = await apiRequest(`/api/billing/${encodeURIComponent(form.billingEmail.trim())}`);
    setPanelStatus("billing", ok ? JSON.stringify(data, null, 2) : data.error || "Billing lookup failed", ok ? "success" : "error");
  };

  return (
    <div className="app-shell">
      <aside className="left-rail" aria-label="Workspace configuration tools">
        <header className="brand-block"><div className="brand-row"><h1>v0</h1><span className="status-chip">Live</span></div><p>AI shipping cockpit for Cloudflare-hosted sites.</p></header>
        <div className="config-layout">
          <nav className="config-nav" aria-label="Configuration categories">
            {CONFIG_TABS.map((tab) => (
              <button key={tab.id} className={`config-tab ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)} title={tab.title}>{tab.icon}</button>
            ))}
          </nav>
          <div className="config-content">
            {activeTab === "quick" && <section className="group config-panel active"><h2>Quick Login</h2><p className="muted">One-click starter account so teams can test flows instantly.</p><button className="secondary" onClick={handleQuickLogin}>Continue as demo user</button><p className="status" data-tone={status.quick?.tone}>{status.quick?.message}</p></section>}
            {activeTab === "github" && <section className="group config-panel active"><h2>GitHub Access</h2><input placeholder="octocat" value={form.githubUsername} onChange={(e) => updateField("githubUsername", e.target.value)} /><input type="password" placeholder="ghp_***" value={form.githubToken} onChange={(e) => updateField("githubToken", e.target.value)} /><button className="secondary" onClick={handleGithubConnect}>Connect GitHub</button><p className="status" data-tone={status.github?.tone}>{status.github?.message}</p></section>}
            {activeTab === "repo" && <section className="group config-panel active"><h2>Repository Sync</h2><input type="url" placeholder="https://github.com/org/repo" value={form.repoUrl} onChange={(e) => updateField("repoUrl", e.target.value)} /><input placeholder="main" value={form.repoBranch} onChange={(e) => updateField("repoBranch", e.target.value)} /><button onClick={handleRepoSync}>Pull Repository</button><p className="status" data-tone={status.repo?.tone}>{status.repo?.message}</p></section>}
            {activeTab === "mcp" && <section className="group config-panel active"><h2>MCP Integrations</h2><select value={form.mcpService} onChange={(e) => updateField("mcpService", e.target.value)}><option value="supabase">Supabase</option><option value="cloudflare">Cloudflare</option><option value="github">GitHub</option></select><input placeholder="Supabase Demo" value={form.mcpLabel} onChange={(e) => updateField("mcpLabel", e.target.value)} /><input placeholder="https://example-project.supabase.co" value={form.mcpEndpoint} onChange={(e) => updateField("mcpEndpoint", e.target.value)} /><div className="button-row"><button onClick={connectMcpServer}>Connect MCP Server</button><button className="secondary" onClick={refreshMcpServers}>Refresh</button></div><p className="status" data-tone={status.mcp?.tone}>{status.mcp?.message}</p><div>{mcpServers.map((server) => <article className="mcp-card" key={server.id}><strong>{server.label}</strong><p className="mcp-meta">{server.service} · {server.endpoint}</p></article>)}</div></section>}
            {activeTab === "account" && <section className="group config-panel active"><h2>Manual Signup</h2><input type="email" placeholder="you@example.com" value={form.signupEmail} onChange={(e) => updateField("signupEmail", e.target.value)} /><input type="password" placeholder="••••••••" value={form.signupPassword} onChange={(e) => updateField("signupPassword", e.target.value)} /><select value={form.signupPlan} onChange={(e) => updateField("signupPlan", e.target.value)}><option value="starter">Starter</option><option value="pro">Pro</option></select><button onClick={handleSignup}>Create Account</button><p className="status" data-tone={status.account?.tone}>{status.account?.message}</p></section>}
            {activeTab === "billing" && <section className="group config-panel active"><h2>Credit Billing</h2><input type="email" placeholder="billing@example.com" value={form.billingEmail} onChange={(e) => updateField("billingEmail", e.target.value)} /><button className="secondary" onClick={handleBillingLookup}>Load Billing</button><pre>{status.billing?.message}</pre></section>}
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="top-rail"><h2>{projectTitle}</h2><span id="activeUserBadge">{activeUserEmail ? `Logged in: ${activeUserEmail}` : "Not logged in"}</span><code>{previewUrl}</code></header>
        <section className="collab-stage">
          <section className="group chat-stage">
            <div className="chat-log">{chat.map((entry, index) => <div key={`${entry.role}-${index}`} className={`chat-bubble ${entry.role}`}>{entry.role.toUpperCase()}: {entry.content}</div>)}</div>
            <div className="chat-controls"><input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask Codex to update the selected element..." /><button onClick={handleSendChat}>Send</button></div>
            <p className="status" data-tone={status.chat?.tone}>{status.chat?.message}</p>
            <p className="muted">Selected node: <strong>{selectedNodeId}</strong></p>
          </section>
          <section className="preview-stage"><div className="browser-chrome"><div className="browser-dots"><span></span><span></span><span></span></div><p className="url-bar">{previewUrl}</p></div><iframe id="previewFrame" title="Project preview" src={previewFrameSrc}></iframe></section>
        </section>
      </main>
    </div>
  );
}

/**
 * Stage 5: React application boot.
 * Why this exists: this is the single mount operation that hands DOM control to
 * React and starts the declarative application lifecycle.
 */
ReactDOM.createRoot(document.getElementById("root")).render(<MissionControlApp />);
