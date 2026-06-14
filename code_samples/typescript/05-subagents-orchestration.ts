/**
 * 05 — Subagents & multi-agent orchestration
 * ==========================================
 *
 * The single most important orchestration decision: DON'T reach for parallel
 * multi-agent by default. Single-threaded, linear agents are the most reliable
 * production design. Multi-agent buys you speed and breadth for read-heavy
 * work — at a real cost in tokens and consistency.
 *
 * The evidence:
 *   - Multi-agent research (Opus lead + Sonnet subagents) beat single Opus by
 *     ~90% on a research eval, BUT used ~15× the tokens of a chat (single
 *     agents ~4×). Parallelizing spin-up + tool calls cut research time ~90%.
 *   - Cognition ("Don't build multi-agents"): parallel subagents that don't
 *     share full context/traces make conflicting decisions. Prefer sharing
 *     full traces over passing thin task summaries; unify decision + action.
 *
 * Rule of thumb (scale effort to complexity):
 *   - simple lookup        -> 1 agent,   3–10 tool calls
 *   - direct comparison    -> 2–4 subagents, 10–15 calls
 *   - open-ended research  -> 10+ subagents, divided clearly
 *
 * Subagents isolate context: each starts a FRESH conversation; only its final
 * message returns to the parent. The ONLY parent→subagent channel is the
 * prompt string. Restrict each subagent's tools with the `tools` field.
 *
 * Sources:
 *   - Anthropic, "How we built our multi-agent research system"
 *     https://www.anthropic.com/engineering/multi-agent-research-system
 *   - Cognition, "Don't build multi-agents"
 *     https://cognition.ai/blog/dont-build-multi-agents
 *   - Claude Agent SDK, "Subagents"
 *     https://code.claude.com/docs/en/agent-sdk/subagents
 */

import { query, type Options, type AgentDefinition } from "@anthropic-ai/claude-agent-sdk";

// Define subagents declaratively. Each has its own prompt, model, and — crucially
// — its own restricted tool surface. Give cheap, parallelizable work to a
// smaller/faster model (Sonnet/Haiku) and reserve the lead for synthesis.
const agents: Record<string, AgentDefinition> = {
  "doc-researcher": {
    description:
      "Use to research a single focused question against the docs/codebase. " +
      "Spawn several in parallel for breadth. Returns a tight findings summary.",
    // Read-only surface: a researcher should never edit. Context isolation +
    // a locked tool set is your main safety lever for fan-out.
    tools: ["Read", "Glob", "Grep"],
    // AgentDefinition.model takes alias names ('sonnet' | 'opus' | 'haiku' |
    // 'inherit'), NOT full model ids. Give cheap fan-out work to a smaller model.
    model: "sonnet",
    prompt:
      "You research ONE question thoroughly and return a concise, cited summary. " +
      "Do not attempt edits. State what you could not find rather than guessing.",
  },
  "synthesizer": {
    description: "Use once research is gathered to produce the final written answer.",
    tools: ["Read"],
    model: "opus", // reserve the most capable model for synthesis
    prompt: "You merge research findings into one coherent, well-structured answer.",
  },
};

const options: Options = {
  agents,
  // The lead agent needs the Agent tool to spawn subagents. Auto-approving
  // subagent spawning requires "Agent" in allowedTools.
  allowedTools: ["Agent", "Read", "Glob", "Grep"],
  permissionMode: "dontAsk",
  maxTurns: 40,
  maxBudgetUsd: 3.0, // multi-agent is token-hungry — budget accordingly
  systemPrompt: `You are a lead research agent. Decompose the task and delegate
focused sub-questions to 'doc-researcher' subagents (in parallel when the
sub-questions are independent). Then call 'synthesizer' to write the answer.
Give each subagent everything it needs IN THE PROMPT — it cannot see your
context. Scale the number of subagents to the task's complexity; do not
spawn subagents for a task a single agent can do in a few tool calls.`,
};

async function main() {
  for await (const message of query({
    prompt:
      "Compare how this repo handles permissions vs. context management, and " +
      "summarize the trade-offs.",
    options,
  })) {
    if (message.type === "assistant") {
      for (const b of message.message.content) {
        if (b.type === "text") process.stdout.write(b.text);
        // Subagent activity surfaces as Agent tool calls in the parent stream.
        if (b.type === "tool_use" && b.name === "Agent") {
          console.log(`\n[delegating to subagent: ${(b.input as any)?.subagent_type ?? "?"}]`);
        }
      }
    }
    if (message.type === "result") {
      console.log(`\n\n[turns: ${message.num_turns} | $${message.total_cost_usd?.toFixed(4)}]`);
    }
  }
}

/*
 * WHEN NOT TO USE SUBAGENTS
 * -------------------------
 * If the subtasks share mutable state or must agree on decisions (e.g. two
 * agents editing the same files), parallel subagents will conflict. Keep it
 * single-threaded and linear. Claude Code itself restricts its subtasks to
 * sequential, investigation-only work for exactly this reason.
 *
 * For orchestrating HUNDREDS of agents deterministically (fan-out/fan-in,
 * pipelines, loops), use the Workflow tool (TS SDK v0.3.149+) rather than
 * hand-rolling spawn logic in the model.
 */
main().catch(console.error);
