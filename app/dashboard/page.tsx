import { WorkspaceShell } from "@/components/workspace/workspace-shell"

/**
 * Dashboard workspace page
 * ------------------------
 * This page intentionally stays thin and delegates all interaction/state to
 * `WorkspaceShell`, keeping the route easy to understand and maintain.
 * 
 * Uses NextAuth.js for GitHub OAuth and repository management.
 */
export default function DashboardPage() {
  return <WorkspaceShell />
}
