/**
 * 01 — The minimal agent loop (from scratch, raw Messages API)
 * =============================================================
 *
 * Best practice demonstrated: an "agent" is a thin control layer around a
 * repeating loop — gather context, take action (tools), feed results back,
 * repeat until the model stops requesting tools. Everything else in this
 * repo (the Claude Agent SDK, permissions, subagents, memory) is scaffolding
 * built on top of THIS loop. Understand it before reaching for a framework.
 *
 * Sources:
 *  - Anthropic, "Building Effective Agents"
 *    https://www.anthropic.com/research/building-effective-agents
 *  - Claude Agent SDK, "How the agent loop works"
 *    https://code.claude.com/docs/en/agent-sdk/agent-loop
 *
 * Run: npm i @anthropic-ai/sdk && ANTHROPIC_API_KEY=... npx tsx 01-minimal-agent-loop.ts
 */

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY

// --- 1. Tool definitions: the agent-computer interface ----------------------
// The tool schema matters more than the prompt. Note `input_schema` uses plain
// JSON Schema. We error-proof arguments where we can (see 02 for the full
// treatment of the tool result contract).
const tools: Anthropic.Tool[] = [
  {
    name: "get_weather",
    description:
      "Get the current weather for a city. Returns temperature in Celsius. " +
      "Use this whenever the user asks about weather or temperature.",
    input_schema: {
      type: "object",
      properties: {
        city: { type: "string", description: "City name, e.g. 'Paris'" },
      },
      required: ["city"],
    },
  },
];

// Your real tool implementations live here. A handler is just a function.
const handlers: Record<string, (args: any) => Promise<string>> = {
  async get_weather({ city }: { city: string }) {
    // Pretend this calls a weather API.
    return JSON.stringify({ city, tempC: 21, conditions: "partly cloudy" });
  },
};

// --- 2. The loop ------------------------------------------------------------
// This is the entire agent. Notice the shape:
//   - keep a growing `messages` transcript
//   - call the model
//   - if it asked for tools, run them and append the results
//   - otherwise, we're done
//
// `maxTurns` is the single most important production guardrail here: never ship
// an unbounded loop. (The SDK gives you maxTurns + maxBudgetUsd for free.)
async function runAgent(userPrompt: string, maxTurns = 10): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userPrompt },
  ];

  for (let turn = 0; turn < maxTurns; turn++) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      // A system prompt sets the "altitude": concrete enough to be useful,
      // general enough not to be brittle. See 03 and the master doc.
      system:
        "You are a concise weather assistant. Use tools when you need live data.",
      tools,
      messages,
    });

    // Persist the assistant turn verbatim — the tool_use blocks must survive
    // round-trip or the next request is malformed.
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      // No tool calls => the agent is finished. Return its final text.
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
      return text;
    }

    // Execute every requested tool and collect results into ONE user message.
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      const handler = handlers[block.name];
      try {
        if (!handler) throw new Error(`Unknown tool: ${block.name}`);
        const result = await handler(block.input);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      } catch (err) {
        // CRITICAL: return errors as data (is_error: true), do not throw.
        // Throwing kills the loop; returning lets the model recover. (See 02.)
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: `Error: ${(err as Error).message}`,
          is_error: true,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  // Bounded loops must report when they hit the bound — never fail silently.
  throw new Error(`Agent did not finish within ${maxTurns} turns`);
}

// --- 3. Run it --------------------------------------------------------------
runAgent("What's the weather in Paris, and should I bring a jacket?")
  .then((answer) => console.log("\nFinal answer:\n" + answer))
  .catch((err) => console.error("Agent failed:", err));
