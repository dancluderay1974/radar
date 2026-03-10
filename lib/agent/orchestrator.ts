import { createAgentTools } from "@/lib/agent/tools"
import { SessionRecord } from "@/lib/session/store"

/**
 * Agent orchestrator
 * ------------------
 * This module is the "brain" that receives user prompts and delegates work to tools.
 *
 * Important note:
 * - The implementation follows an Agents-SDK style loop (model proposes tool calls,
 *   server executes tools, then model continues), while using direct OpenAI Responses API
 *   HTTP requests to stay dependency-light in this repository.
 */

interface AgentResult {
  summary: string
  logs: string[]
}

const SYSTEM_PROMPT = `You are a senior AI coding agent operating on a real Git repository.
Always inspect files before modifying them.
Prefer minimal focused changes.
After edits, run relevant command(s) and report what changed.`

async function callOpenAI(input: unknown) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY")

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      input,
      tools: [
        { type: "function", name: "read_file", description: "Read one file", parameters: { type: "object", properties: { path: { type: "string" } }, required: ["path"] } },
        { type: "function", name: "write_file", description: "Write one file", parameters: { type: "object", properties: { path: { type: "string" }, content: { type: "string" } }, required: ["path", "content"] } },
        { type: "function", name: "list_files", description: "List files in a path", parameters: { type: "object", properties: { path: { type: "string" } } } },
        { type: "function", name: "run_command", description: "Run one shell command", parameters: { type: "object", properties: { cmd: { type: "string" } }, required: ["cmd"] } },
        { type: "function", name: "commit_changes", description: "Commit and push changes", parameters: { type: "object", properties: { message: { type: "string" } }, required: ["message"] } },
      ],
      tool_choice: "auto",
    }),
  })

  if (!response.ok) throw new Error(`OpenAI error ${response.status}: ${await response.text()}`)
  return response.json()
}

/**
 * Step 1: Run the instruction through a compact tool-calling loop.
 */
export async function runAgentInstruction(session: SessionRecord, userPrompt: string): Promise<AgentResult> {
  const tools = createAgentTools(session)
  const logs: string[] = []

  let response = await callOpenAI([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Repository: ${session.owner}/${session.repo}. User request: ${userPrompt}` },
  ])

  for (let iteration = 0; iteration < 6; iteration += 1) {
    const toolCalls = (response.output || []).filter((item: any) => item.type === "function_call")
    if (!toolCalls.length) break

    const toolOutputs = await Promise.all(
      toolCalls.map(async (toolCall: any) => {
        const args = JSON.parse(toolCall.arguments || "{}")
        const name = toolCall.name as keyof ReturnType<typeof createAgentTools>

        logs.push(`Tool call: ${name}`)

        if (name === "read_file") return { type: "function_call_output", call_id: toolCall.call_id, output: await tools.read_file(args.path) }
        if (name === "write_file") return { type: "function_call_output", call_id: toolCall.call_id, output: await tools.write_file(args.path, args.content) }
        if (name === "list_files") return { type: "function_call_output", call_id: toolCall.call_id, output: await tools.list_files(args.path) }
        if (name === "run_command") return { type: "function_call_output", call_id: toolCall.call_id, output: await tools.run_command(args.cmd) }
        if (name === "commit_changes") return { type: "function_call_output", call_id: toolCall.call_id, output: await tools.commit_changes(args.message) }

        return { type: "function_call_output", call_id: toolCall.call_id, output: "Unknown tool" }
      })
    )

    response = await callOpenAI(toolOutputs)
  }

  const finalText = (response.output_text as string) || "Finished."
  return { summary: finalText, logs }
}
