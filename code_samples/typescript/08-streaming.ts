/**
 * 08 — Streaming: reassembling a streamed message correctly
 * =========================================================
 *
 * Streaming is where harnesses quietly corrupt state. The event lifecycle is
 * strict and a few rules are non-obvious:
 *
 *   - Lifecycle: one `message_start` (empty content) → for each content block:
 *     `content_block_start`, one or more `content_block_delta`, `content_block_stop`
 *     → one or more `message_delta` → one `message_stop`. Reassemble blocks BY
 *     INDEX, not by arrival order.
 *   - tool_use input arrives as `input_json_delta` fragments — accumulate the
 *     partial JSON and parse ONLY after `content_block_stop`. The final input
 *     is always complete; mid-stream it is not valid JSON.
 *   - `usage` in `message_delta` is CUMULATIVE — use the latest value, never sum.
 *   - thinking blocks emit a `signature_delta` for integrity — keep it.
 *   - An interrupted stream cannot recover tool_use/thinking blocks; you can
 *     only safely resume from the last completed TEXT block.
 *   - Handle unknown event types gracefully (forward-compat).
 *
 * Source:
 *   - Anthropic, "Streaming Messages"
 *     https://docs.anthropic.com/en/api/messages-streaming
 */

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface AssembledBlock {
  type: string;
  text?: string;
  // For tool_use: name + the accumulated raw JSON string (parsed at stop).
  toolName?: string;
  rawInput?: string;
  input?: unknown;
}

export async function streamMessage(prompt: string) {
  const blocks: AssembledBlock[] = []; // indexed to match `index` in events
  let cumulativeUsage: Anthropic.Usage | undefined;

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  for await (const event of stream) {
    switch (event.type) {
      case "message_start":
        // content is empty here; usage has input tokens. Don't read text yet.
        cumulativeUsage = event.message.usage;
        break;

      case "content_block_start":
        blocks[event.index] = {
          type: event.content_block.type,
          text: event.content_block.type === "text" ? "" : undefined,
          toolName:
            event.content_block.type === "tool_use" ? event.content_block.name : undefined,
          rawInput: event.content_block.type === "tool_use" ? "" : undefined,
        };
        break;

      case "content_block_delta": {
        const block = blocks[event.index];
        if (event.delta.type === "text_delta") {
          block.text = (block.text ?? "") + event.delta.text;
          process.stdout.write(event.delta.text); // live render
        } else if (event.delta.type === "input_json_delta") {
          // Accumulate — do NOT JSON.parse() yet, it's a partial fragment.
          block.rawInput = (block.rawInput ?? "") + event.delta.partial_json;
        }
        // thinking_delta / signature_delta would be handled here too.
        break;
      }

      case "content_block_stop": {
        const block = blocks[event.index];
        // The tool input is now complete — safe to parse.
        if (block?.type === "tool_use") {
          block.input = block.rawInput ? JSON.parse(block.rawInput) : {};
        }
        break;
      }

      case "message_delta":
        // Cumulative usage — replace, never accumulate.
        if (event.usage) cumulativeUsage = { ...cumulativeUsage, ...event.usage } as Anthropic.Usage;
        break;

      case "message_stop":
        break;

      default:
        // Unknown/new event type: ignore gracefully for forward-compat.
        break;
    }
  }

  return { blocks, usage: cumulativeUsage };
}

streamMessage("Write one sentence about agent harnesses, then stop.")
  .then(({ blocks, usage }) => {
    console.log("\n\nblocks:", blocks.map((b) => b.type));
    console.log("usage:", usage);
  })
  .catch(console.error);
