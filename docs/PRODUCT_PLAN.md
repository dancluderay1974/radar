# e-yar.com Product & Technical Plan

## 1) Product Goal
Build an AI-native web app builder that combines:
- Repository-aware code editing (pull from git, branch-aware updates).
- Codex as orchestration model for planning and patch generation.
- Chat-led workflow with a live visual preview.
- Click-to-focus targeting in preview so prompts can point at exact UI nodes.
- Account signup, subscription plans, and credit-based billing.

## 2) Core Experience
1. User signs up and chooses a plan.
2. User connects a repository and target branch.
3. Platform indexes codebase context.
4. User clicks a preview element to set focus.
5. User prompts Codex to make a change.
6. Codex returns plan + diff, system applies patch, rebuilds preview.
7. Credits are deducted and visible in billing panel.

## 3) System Architecture (production target)
- **Frontend App**: chat, project sidebar, preview iframe, billing UI.
- **API Gateway**: auth, project management, prompt/session routing.
- **Repo Worker**: secure git clone, tree indexing, commit orchestration.
- **Model Orchestrator**: context assembly + Codex prompt chain + patch validation.
- **Execution Sandboxes**: run builds/tests per project in isolated containers.
- **Billing Service**: stripe subscription + credits ledger + usage metering.
- **Realtime Layer**: websocket streams for build logs, patch events, preview refresh.

## 4) Data Model (minimum)
- users(id, email, auth_provider, plan_id, monthly_credit_limit)
- projects(id, owner_id, repo_url, default_branch)
- sessions(id, project_id, selected_node_id, last_preview_snapshot)
- chat_messages(id, session_id, role, content, prompt_tokens, completion_tokens)
- credit_ledger(id, user_id, session_id, amount, reason, created_at)
- patch_runs(id, session_id, commit_sha, status, validation_report)

## 5) Security & Governance
- OAuth/GitHub app with least-privilege repo scopes.
- Secrets vault for tokens and deploy keys.
- Per-project isolated runtime for build/test.
- Prompt + diff audit logging for compliance.
- Team-level role-based controls.

## 6) Delivery Roadmap
### Phase A (this prototype)
- Single-page workspace with repo sync form, signup, billing lookup, and chat.
- Click-to-focus preview selection sent back to chat context.
- Mock Codex responses and in-memory credit charging.

### Phase B
- Persistent database and proper auth sessions.
- Real git clone/index queue and branch syncing.
- Streaming Codex responses + patch preview.

### Phase C
- Multi-project dashboard and team collaboration.
- Stripe billing integration and invoice tooling.
- Deploy previews + rollback history.

## 7) Pricing and Credits Suggestion
- Starter: 200 credits / month.
- Pro: 1000 credits / month.
- Team: pooled credits + seat pricing.
- Credit consumption based on prompt complexity + build compute time.

## 8) Success Metrics
- Time-to-first-change under 5 minutes.
- Successful patch apply rate above 80%.
- Monthly retained active builders.
- Credit-to-value ratio (changes delivered per 100 credits).
