/**
 * 03 — Claude Agent SDK quickstart: query(), options, and the result contract
 * ===========================================================================
 *
 * The Agent SDK embeds Claude Code's autonomous loop in your app. You get the
 * loop from sample 01 — plus permissions, compaction, subagents, hooks, and
 * cost accounting — without rebuilding them. This file shows the canonical
 * production setup.
 *
 * Best practices demonstrated:
 *   - ALWAYS bound the loop in production: maxTurns + maxBudgetUsd.
 *   - Iterate the message stream to completion; don't break on ResultMessage
 *     (trailing system events can follow it).
 *   - Handle every ResultMessage subtype — `result` exists only on `success`.
 *   - Be explicit about settingSources so behavior is reproducible.
 *   - Capture session_id for resumption; capture total_cost_usd for accounting.
 *
 * Sources:
 *   - Claude Agent SDK, "How the agent loop works"
 *     https://code.claude.com/docs/en/agent-sdk/agent-loop
 *   - Claude Agent SDK, TypeScript reference
 *     https://code.claude.com/docs/en/agent-sdk/typescript
 *
 * Run: npm i @anthropic-ai/claude-agent-sdk && npx tsx 03-agent-sdk-quickstart.ts
 */

import { query, type Options, type SDKMessage } from "@anthropic-ai/claude-agent-sdk";

const options: Options = {
  // The system prompt owns durable instructions + guardrails. Aim for the
  // right altitude (see master doc): not brittle if/else, not vague fluff.
  systemPrompt:
    "You are a coding assistant. Make minimal, well-scoped edits and explain what you changed.",

  // Pin the model for reproducibility instead of relying on the rolling default.
  model: "claude-sonnet-4-6",

  // --- The two guardrails every production agent needs ---------------------
  maxTurns: 30, // counts tool-use round trips only; prevents runaway sessions
  maxBudgetUsd: 1.5, // hard cost ceiling; yields subtype "error_max_budget_usd"

  // --- Reproducible, locked-down tool surface ------------------------------
  // Pre-approve exactly what this agent may use without prompting...
  allowedTools: ["Read", "Glob", "Grep", "Edit"],
  // ...and pair with dontAsk so anything else is denied outright (no silent
  // reliance on a canUseTool callback being present). See sample 06.
  permissionMode: "dontAsk",

  // Be explicit about where settings come from. `[]` disables filesystem
  // settings entirely; here we opt into project-level .claude/settings.json.
  settingSources: ["project"],

  // Resilience knobs (see sample 08 for the defaults and why they matter).
  env: {
    ...process.env,
    CLAUDE_CODE_MAX_RETRIES: "10", // default; SDK retries transient API errors
    API_TIMEOUT_MS: "600000", // default 10 min; lower for short interactive calls
  },
};

async function main() {
  let sessionId: string | undefined;

  // query() returns an async generator of typed messages. Iterate to the END.
  for await (const message of query({
    prompt: "Find the TODO comments in this project and summarize them.",
    options,
  })) {
    handleMessage(message, (id) => (sessionId = id));
  }

  if (sessionId) {
    console.log(`\nResume later with: query({ prompt, options: { resume: "${sessionId}" } })`);
  }
}

function handleMessage(message: SDKMessage, captureSession: (id: string) => void) {
  switch (message.type) {
    case "system":
      if (message.subtype === "init") {
        console.log(`[init] session ${message.session_id} — model ${message.model}`);
      } else if (message.subtype === "compact_boundary") {
        // The harness auto-compacted. Anything from early in the conversation
        // that wasn't in the system prompt / CLAUDE.md may now be summarized.
        console.log("[compaction] older history summarized to free context");
      }
      break;

    case "assistant":
      for (const block of message.message.content) {
        if (block.type === "text") process.stdout.write(block.text);
        if (block.type === "tool_use") console.log(`\n[tool] ${block.name}`);
      }
      break;

    case "result":
      captureSession(message.session_id);
      // Handle EVERY subtype. `result` is only present on success.
      switch (message.subtype) {
        case "success":
          console.log(`\n\n✅ done in ${message.num_turns} turns`);
          break;
        case "error_max_turns":
          console.log(`\n\n⚠️ hit maxTurns (${message.num_turns}) before finishing`);
          break;
        case "error_max_budget_usd":
          console.log("\n\n⚠️ hit the USD budget ceiling before finishing");
          break;
        case "error_during_execution":
          console.log("\n\n❌ errored during execution");
          break;
        default:
          console.log(`\n\n⚠️ ended with subtype: ${message.subtype}`);
      }
      // Cost/usage are present on ALL result subtypes — always log them.
      console.log(`cost: $${message.total_cost_usd?.toFixed(4)} | session: ${message.session_id}`);
      break;
  }
}

main().catch((err) => {
  console.error("query failed:", err);
  process.exit(1);
});
