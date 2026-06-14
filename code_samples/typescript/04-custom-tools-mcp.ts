/**
 * 04 — Custom tools via the in-process MCP server
 * ===============================================
 *
 * The SDK lets you expose your own functions to the agent through an
 * in-process MCP server — no separate process, no transport. This is how you
 * give the agent access to your database, your APIs, your domain logic.
 *
 * Key facts (from the SDK docs):
 *   - Fully-qualified tool name is `mcp__{server_name}__{tool_name}`.
 *   - List that name in allowedTools to skip the permission prompt.
 *   - Every tool in context costs tokens EVERY turn → use ToolSearch / load on
 *     demand when you have many tools.
 *   - `tools: []` removes all built-ins, leaving only your custom tools.
 *
 * Sources:
 *   - Claude Agent SDK, "Give Claude custom tools"
 *     https://code.claude.com/docs/en/agent-sdk/custom-tools
 *   - Anthropic, "Effective context engineering" (tools cost context)
 *     https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
 */

import { query, tool, createSdkMcpServer, type Options } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

// --- 1. Define tools (see sample 02 for the full result-contract checklist) -
const getOrder = tool(
  "get_order",
  "Fetch an order by id. Read-only. Returns order status, items, and total.",
  { order_id: z.string().describe("Order id, e.g. 'ord_123'") },
  async ({ order_id }) => {
    const order = { order_id, status: "shipped", total: 42.5, items: ["widget"] };
    return {
      content: [{ type: "text", text: JSON.stringify(order) }],
      structuredContent: order,
    };
  },
); // read-only in intent. NOTE: the docs describe a 5th `annotations` arg to
//   tool() (e.g. { readOnlyHint: true } to allow parallel execution); the pinned
//   SDK v0.1.77 here exposes tool() with 4 args, so it's omitted. Verify the
//   signature for your installed version.

const refundOrder = tool(
  "refund_order",
  "Issue a refund for an order. This MUTATES state — only call after confirming with the user.",
  {
    order_id: z.string(),
    amount_usd: z.number().positive().describe("Amount to refund in USD"),
    reason: z.string().describe("Why the refund is being issued (for the audit log)"),
  },
  async ({ order_id, amount_usd, reason }) => {
    try {
      // ... real refund call ...
      return {
        content: [{ type: "text", text: `Refunded $${amount_usd} on ${order_id}` }],
        structuredContent: { order_id, refunded: amount_usd, reason, ok: true },
      };
    } catch (err) {
      return { content: [{ type: "text", text: `Refund failed: ${(err as Error).message}` }], isError: true };
    }
  },
); // mutating/destructive tool — left out of allowedTools so it hits the permission flow

// --- 2. Bundle tools into an in-process server ------------------------------
const commerceServer = createSdkMcpServer({
  name: "commerce", // becomes the {server_name} segment of the tool id
  version: "1.0.0",
  tools: [getOrder, refundOrder],
});

// --- 3. Wire it into query() ------------------------------------------------
const options: Options = {
  mcpServers: { commerce: commerceServer },
  // Pre-approve the read-only tool; leave the mutating one to the permission
  // flow so a human (or canUseTool) signs off on refunds. Note the
  // mcp__{server}__{tool} naming. A wildcard `mcp__commerce__*` would approve all.
  allowedTools: ["mcp__commerce__get_order"],
  // Remove built-in tools we don't need so they don't waste context every turn.
  // (Here the agent only needs our two commerce tools.)
  tools: [],
  maxTurns: 15,
  maxBudgetUsd: 0.5,
};

async function main() {
  for await (const message of query({
    prompt: "What's the status of order ord_123? If it shipped, do nothing.",
    options,
  })) {
    if (message.type === "assistant") {
      for (const b of message.message.content) {
        if (b.type === "text") process.stdout.write(b.text);
      }
    }
    if (message.type === "result") {
      console.log(`\n[$${message.total_cost_usd?.toFixed(4)}]`);
    }
  }
}

main().catch(console.error);
