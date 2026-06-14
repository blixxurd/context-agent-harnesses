/**
 * 06 — Permissions, hooks & guardrails: authorization lives in CODE
 * =================================================================
 *
 * THE cardinal safety rule for agent harnesses: encode authorization in the
 * harness, never in the prompt. A prompt is a request; a permission rule is a
 * guarantee. This file shows the full permission pipeline.
 *
 * The SDK evaluates permissions in a fixed order (memorize this):
 *   1. Hooks         — can deny outright or pass through
 *   2. Deny rules    — block in EVERY mode, including bypassPermissions
 *   3. Ask rules     — force a prompt (or deny, in dontAsk mode)
 *   4. Permission mode
 *   5. Allow rules   — pre-approve
 *   6. canUseTool    — your runtime callback for anything left
 *
 * Critical gotchas:
 *   - allowedTools does NOT constrain bypassPermissions. To block a tool under
 *     bypass, use disallowedTools (a deny rule).
 *   - Subagents inherit bypassPermissions/acceptEdits/auto and you CANNOT
 *     override it per subagent — bypass = full autonomous system access.
 *   - A bare deny like "Bash" removes the tool from context; a scoped deny like
 *     "Bash(rm *)" leaves Bash available but blocks matching calls.
 *
 * Sources:
 *   - Claude Agent SDK, "Configure permissions"
 *     https://code.claude.com/docs/en/agent-sdk/permissions
 *   - Anthropic, "Building safeguards for Claude" / trustworthy agents
 *     https://www.anthropic.com/research/trustworthy-agents
 */

import { query, type Options, type CanUseTool } from "@anthropic-ai/claude-agent-sdk";

// --- 1. canUseTool: the runtime decision point for the unresolved tail ------
// Reached only for tools not settled by hooks/deny/ask/mode/allow. This is
// where you put human-in-the-loop approval, dynamic policy, or input rewriting.
const canUseTool: CanUseTool = async (toolName, input) => {
  // Example dynamic policy: allow reads anywhere, but require that writes stay
  // inside the project directory (defense-in-depth alongside the sandbox).
  if (toolName === "Write" || toolName === "Edit") {
    const path = String((input as any)?.file_path ?? "");
    if (path.includes("..") || path.startsWith("/etc") || path.startsWith("/Users")) {
      return { behavior: "deny", message: "Writes outside the project are not allowed." };
    }
  }
  // You can also REWRITE the input before approving (e.g. clamp a limit).
  return { behavior: "allow", updatedInput: input };
};

const options: Options = {
  // --- Declarative rules: the backbone of the policy ----------------------
  // Pre-approve the safe read-only surface.
  allowedTools: ["Read", "Glob", "Grep"],
  // Deny rules win over everything, including bypass. Scope dangerous Bash.
  disallowedTools: ["Bash(rm *)", "Bash(sudo *)", "Bash(curl *)", "WebFetch"],

  // default => unmatched tools fall through to canUseTool (not silently denied,
  // not silently allowed). Pick the mode deliberately:
  //   "dontAsk"           -> headless: deny anything not pre-approved
  //   "plan"              -> explore + propose, never auto-edit
  //   "acceptEdits"       -> trusted iteration inside the working dir
  //   "bypassPermissions" -> ONLY in an isolated sandbox; deny rules still apply
  permissionMode: "default",
  canUseTool,

  // --- Hooks: run in YOUR process, cost no context, fire deterministically -
  hooks: {
    // PreToolUse runs before a tool executes; returning a deny prevents it and
    // the model receives the rejection as a tool result (and adapts).
    PreToolUse: [
      {
        // matcher limits which tools this hook sees; omit to match all.
        matcher: "Bash",
        hooks: [
          async (input) => {
            const cmd = String((input as any)?.tool_input?.command ?? "");
            // Belt-and-suspenders block for destructive commands. This is an
            // audit + policy point — log it, then allow/deny.
            if (/\b(mkfs|dd|:\(\)\s*\{)/.test(cmd)) {
              return {
                decision: "block",
                reason: "Blocked a destructive shell command by policy.",
              };
            }
            console.error(`[audit] bash: ${cmd}`);
            return {}; // pass through to the rest of the pipeline
          },
        ],
      },
    ],
    // Stop fires when the agent finishes — good place to validate/save state.
    Stop: [
      {
        hooks: [
          async () => {
            console.error("[audit] agent finished");
            return {};
          },
        ],
      },
    ],
  },
};

async function main() {
  for await (const message of query({
    prompt: "Read package.json and tell me the declared dependencies.",
    options,
  })) {
    if (message.type === "result") {
      // permission_denials is on the result — review what the agent was blocked
      // from doing; a flood of denials means your rules or prompt need tuning.
      const denials = (message as any).permission_denials ?? [];
      if (denials.length) console.log("denied:", denials);
      console.log(`done — $${message.total_cost_usd?.toFixed(4)}`);
    }
  }
}

main().catch(console.error);
