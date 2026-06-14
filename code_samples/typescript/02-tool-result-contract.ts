/**
 * 02 — Tool design & the tool-result contract
 * ===========================================
 *
 * "Invest in tools over prompts." On SWE-bench, teams spent more time
 * optimizing the agent-computer interface than the prompt; one team's
 * tool-description-rewriting pass cut task completion time ~40%. This file is
 * a checklist of the tool-design rules that actually move reliability.
 *
 * Rules demonstrated:
 *   1. Consolidate around workflows, not API endpoints.
 *   2. Error-proof arguments (poka-yoke): absolute paths, enums, no ambiguity.
 *   3. Return errors as DATA (isError), never throw — throwing stops the loop.
 *   4. Bound output size; offer a response_format (concise vs detailed).
 *   5. Name things for a junior developer; namespace related tools.
 *   6. readOnlyHint lets side-effect-free tools run in parallel.
 *
 * Sources:
 *   - Anthropic, "Writing tools for agents"
 *     https://www.anthropic.com/engineering/writing-tools-for-agents
 *   - Anthropic, "Building Effective Agents" (poka-yoke, ACI)
 *     https://www.anthropic.com/research/building-effective-agents
 *   - Claude Agent SDK, "Give Claude custom tools"
 *     https://code.claude.com/docs/en/agent-sdk/custom-tools
 */

import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

// A hard cap mirrors Claude Code's own behavior: it truncates tool responses
// at 25,000 tokens. Unbounded tool output is the #1 way to blow the context
// budget. Always cap, and tell the model you capped.
const MAX_CHARS = 20_000;
function bound(text: string): string {
  if (text.length <= MAX_CHARS) return text;
  return (
    text.slice(0, MAX_CHARS) +
    `\n\n[...truncated ${text.length - MAX_CHARS} chars. ` +
    `Narrow your query or request a specific section.]`
  );
}

/**
 * GOOD: a single workflow-shaped tool. Instead of exposing list_users,
 * list_events, and create_event and making the model orchestrate them, expose
 * the thing the user actually wants: "schedule a meeting".
 *
 * - Namespaced name (`calendar_schedule_meeting`) groups related tools.
 * - Unambiguous params (`attendee_emails`, not `users`).
 * - An enum response_format trades detail for tokens — the model picks.
 * - The handler NEVER throws; failures come back as isError data.
 */
export const scheduleMeeting = tool(
  "calendar_schedule_meeting",
  // Document the tool as if for a new teammate: what it does, when to use it,
  // what it returns, and any gotchas.
  `Schedule a calendar meeting and invite attendees. Use this when the user
   wants to book, set up, or arrange a meeting. Returns the created event id
   and a confirmation. Times must be ISO-8601 with an explicit timezone offset
   (poka-yoke: ambiguous local times are rejected, so always include the offset).`,
  {
    title: z.string().describe("Human-readable meeting title"),
    // Poka-yoke: force an explicit, unambiguous time format. Constraining the
    // schema eliminates a whole class of model mistakes before they happen.
    start_iso: z
      .string()
      .regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)/)
      .describe("Start time, ISO-8601 WITH timezone offset, e.g. 2026-06-14T09:00:00-07:00"),
    duration_minutes: z.number().int().min(5).max(480).default(30),
    attendee_emails: z.array(z.string().email()).describe("Invitee email addresses"),
    // Let the model choose verbosity. 'concise' might be ~70 tokens vs ~200.
    response_format: z.enum(["concise", "detailed"]).default("concise"),
  },
  async (args) => {
    try {
      // ... real calendar API call would go here ...
      const eventId = "evt_12345";

      const payload =
        args.response_format === "detailed"
          ? {
              eventId,
              title: args.title,
              start: args.start_iso,
              durationMinutes: args.duration_minutes,
              attendees: args.attendee_emails,
              status: "confirmed",
            }
          : { eventId, status: "confirmed" };

      return {
        content: [{ type: "text", text: bound(JSON.stringify(payload)) }],
        // structuredContent gives the model machine-readable data alongside
        // (text blocks are dropped when structuredContent is present).
        structuredContent: payload,
      };
    } catch (err) {
      // Return the failure as data so the loop continues and the model can
      // retry, pick another tool, or explain. Throwing here would abort the
      // entire query() call.
      return {
        content: [
          { type: "text", text: `Could not schedule meeting: ${(err as Error).message}` },
        ],
        isError: true,
      };
    }
  },
);
// NOTE ON ANNOTATIONS (readOnlyHint, destructiveHint, ...): the docs describe
// passing tool annotations as a 5th argument to tool(). The pinned SDK version
// here (v0.1.77) exposes tool() with 4 args only, so annotations are omitted to
// keep this sample compiling. readOnlyHint is what lets side-effect-free tools
// run in PARALLEL — confirm the annotations signature for your installed
// version before relying on it. This tool MUTATES state, so it is not read-only.

/**
 * A read-only tool. Marking readOnlyHint: true lets the harness run it in
 * PARALLEL with other read-only tools — a real latency win for research-style
 * agents that fan out many lookups.
 */
export const lookupContact = tool(
  "calendar_lookup_contact",
  "Look up a contact's email by name. Read-only. Use before scheduling if you only have a name.",
  { name: z.string().describe("Full or partial contact name") },
  async ({ name }) => {
    const matches = [{ name: "Ada Lovelace", email: "ada@example.com" }].filter((c) =>
      c.name.toLowerCase().includes(name.toLowerCase()),
    );
    return { content: [{ type: "text", text: bound(JSON.stringify(matches)) }] };
  },
); // read-only in intent (see the annotations note above re: parallel execution)

/*
 * ANTI-PATTERNS to avoid (and why):
 *
 *  ❌  throw new Error("not found")        -> kills the whole agent loop
 *  ✅  return { isError: true, content }    -> model sees it and recovers
 *
 *  ❌  param named `user` / `data` / `id`   -> the model guesses wrong
 *  ✅  `attendee_emails`, `event_id`        -> unambiguous, self-documenting
 *
 *  ❌  return the entire 2 MB API response  -> blows the context budget
 *  ✅  bound() + response_format enum        -> the model controls verbosity
 *
 *  ❌  20 thin CRUD tools (1 per endpoint)  -> model orchestration overhead
 *  ✅  a few workflow tools                  -> matches how the task is framed
 */
