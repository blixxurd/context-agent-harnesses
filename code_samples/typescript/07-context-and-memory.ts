/**
 * 07 — Context engineering & memory: treat context as a finite budget
 * ===================================================================
 *
 * Context is a finite, DEGRADING resource. Attention cost scales ~n² with
 * tokens and quality drops as the window fills ("context rot", measurable via
 * needle-in-a-haystack). The harness's job is to put the smallest set of
 * high-signal tokens in front of the model at each step.
 *
 * The four levers (in rough order of impact):
 *   1. Just-in-time retrieval — hold lightweight refs (paths, ids, URLs) and
 *      load content at runtime. Prefer agentic search (grep/glob) as primary,
 *      semantic/embedding search as secondary.
 *   2. Compaction — summarize old history, preserving decisions, dropping
 *      redundant tool output. (The SDK does this automatically; see sample 03.)
 *   3. Context editing — auto-remove stale tool calls/results. In a 100-turn
 *      web-search test: +29% alone, +39% paired with the memory tool, −84%
 *      tokens consumed.
 *   4. Persistent memory — durable facts in a file store that survive
 *      compaction. Durable RULES belong in CLAUDE.md/AGENTS.md (re-injected
 *      into the system prompt every turn), not in the first user message.
 *
 * This file shows a correct, security-hardened `memory` tool handler. The
 * exact request-level wire format for context editing changes between betas —
 * confirm field names against the current docs before shipping.
 *
 * Sources:
 *   - Anthropic, "Effective context engineering for AI agents"
 *     https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
 *   - Anthropic, "Context management" (context editing + memory tool, betas)
 *     https://www.anthropic.com/news/context-management
 *   - Anthropic, "Memory tool"
 *     https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool
 */

import { promises as fs } from "node:fs";
import path from "node:path";

// The memory tool is a CLIENT-SIDE file system rooted at /memories. The model
// issues commands; YOU execute them against a sandboxed directory. Treat every
// path as hostile input — path traversal here is a real exfiltration vector.
const MEMORY_ROOT = path.resolve("./.agent-memory");
const MAX_FILE_BYTES = 256 * 1024;
const MAX_VIEW_LINES = 999_999; // the tool errors above this; mirror that cap

/** Resolve a tool-supplied path safely INSIDE the memory root, or throw. */
function safeResolve(rawPath: string): string {
  // Reject obvious traversal, including URL-encoded forms (%2e%2e%2f === "../").
  const decoded = decodeURIComponent(rawPath);
  if (decoded.includes("..") || rawPath.includes("%2e%2e")) {
    throw new Error("Path traversal rejected");
  }
  // Strip the /memories prefix the model uses, then resolve and re-check that
  // the result is still contained by the root (defense in depth).
  const rel = decoded.replace(/^\/?memories\/?/, "");
  const resolved = path.resolve(MEMORY_ROOT, rel);
  if (resolved !== MEMORY_ROOT && !resolved.startsWith(MEMORY_ROOT + path.sep)) {
    throw new Error("Path escapes memory root");
  }
  return resolved;
}

type MemoryCommand =
  | { command: "view"; path: string }
  | { command: "create"; path: string; file_text: string }
  | { command: "str_replace"; path: string; old_str: string; new_str: string }
  | { command: "insert"; path: string; insert_line: number; insert_text: string }
  | { command: "delete"; path: string }
  | { command: "rename"; old_path: string; new_path: string };

/** Execute one memory-tool command. Returns text the model will read back. */
export async function handleMemory(cmd: MemoryCommand): Promise<string> {
  switch (cmd.command) {
    case "view": {
      const target = safeResolve(cmd.path);
      const stat = await fs.stat(target).catch(() => null);
      if (stat?.isDirectory()) return (await fs.readdir(target)).join("\n");
      const text = await fs.readFile(target, "utf8");
      const lines = text.split("\n");
      if (lines.length > MAX_VIEW_LINES) throw new Error("File too large to view");
      return lines.map((l, i) => `${i + 1}: ${l}`).join("\n");
    }
    case "create": {
      if (Buffer.byteLength(cmd.file_text) > MAX_FILE_BYTES) throw new Error("File exceeds size cap");
      const target = safeResolve(cmd.path);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, cmd.file_text, "utf8");
      return `Created ${cmd.path}`;
    }
    case "str_replace": {
      const target = safeResolve(cmd.path);
      const text = await fs.readFile(target, "utf8");
      if (!text.includes(cmd.old_str)) throw new Error("old_str not found");
      await fs.writeFile(target, text.replace(cmd.old_str, cmd.new_str), "utf8");
      return `Edited ${cmd.path}`;
    }
    case "insert": {
      const target = safeResolve(cmd.path);
      const lines = (await fs.readFile(target, "utf8")).split("\n");
      lines.splice(cmd.insert_line, 0, cmd.insert_text);
      await fs.writeFile(target, lines.join("\n"), "utf8");
      return `Inserted into ${cmd.path}`;
    }
    case "delete": {
      await fs.rm(safeResolve(cmd.path), { recursive: true, force: true });
      return `Deleted ${cmd.path}`;
    }
    case "rename": {
      await fs.rename(safeResolve(cmd.old_path), safeResolve(cmd.new_path));
      return `Renamed ${cmd.old_path} -> ${cmd.new_path}`;
    }
  }
}

/*
 * Enabling context editing + memory on the raw Messages API looks roughly like
 * the request below. The memory tool TYPE is `memory_20250818`. The context-
 * editing config and the required beta header string evolve between releases —
 * ALWAYS confirm the current values in the docs linked above before shipping.
 *
 *   const response = await client.beta.messages.create({
 *     model: "claude-sonnet-4-6",
 *     max_tokens: 2048,
 *     // Verify the exact beta header(s) against current docs:
 *     betas: ["context-management-2025-06-27"],
 *     tools: [{ type: "memory_20250818", name: "memory" }],
 *     // Auto-clear stale tool results to reclaim the context budget:
 *     context_management: {
 *       edits: [{ type: "clear_tool_uses_20250919" }], // confirm field names
 *     },
 *     messages,
 *   });
 *
 * Operational rules that matter regardless of wire format:
 *   - Put durable RULES in CLAUDE.md/AGENTS.md, not the first user turn — they
 *     get re-injected every request and survive compaction.
 *   - Tell the agent (in the system prompt) that context auto-compacts, so it
 *     saves progress to memory near the limit instead of stopping early.
 *   - Preserve thinking blocks when you return tool results.
 *   - Load many tools on demand (ToolSearch) — each tool definition costs
 *     context on EVERY turn.
 */
