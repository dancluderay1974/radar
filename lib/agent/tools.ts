import { runSandboxCommand } from "@/lib/sandbox/manager"
import { SessionRecord } from "@/lib/session/store"

/**
 * Agent tool factory
 * ------------------
 * This module creates the concrete tool implementations requested in the spec:
 * - read_file(path)
 * - write_file(path, content)
 * - list_files(path)
 * - run_command(cmd)
 * - commit_changes(message)
 */

export function createAgentTools(session: SessionRecord) {
  const cwd = session.repoPath

  return {
    /**
     * Step A: Read one file from the cloned repository.
     */
    async read_file(path: string) {
      return runSandboxCommand(session.sandboxId, `cat ${path}`, cwd)
    },

    /**
     * Step B: Write file content by piping from a heredoc.
     */
    async write_file(path: string, content: string) {
      const escaped = content.replace(/`/g, "\\`")
      return runSandboxCommand(
        session.sandboxId,
        `cat <<'EOF' > ${path}\n${escaped}\nEOF`,
        cwd
      )
    },

    /**
     * Step C: List files to inspect project structure.
     */
    async list_files(path = ".") {
      return runSandboxCommand(session.sandboxId, `find ${path} -maxdepth 3 -type f`, cwd)
    },

    /**
     * Step D: Run any shell command the agent needs.
     */
    async run_command(cmd: string) {
      return runSandboxCommand(session.sandboxId, cmd, cwd)
    },

    /**
     * Step E: Commit local changes and push branch to GitHub.
     */
    async commit_changes(message: string) {
      const command = [
        "git add .",
        `git commit -m ${JSON.stringify(message)} || echo 'No changes to commit'`,
        `git push origin ${session.branch}`,
      ].join(" && ")

      return runSandboxCommand(session.sandboxId, command, cwd)
    },
  }
}
