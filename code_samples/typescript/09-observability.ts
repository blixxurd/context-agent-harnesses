/**
 * 09 — Observability: trace, meter, and log the loop
 * ==================================================
 *
 * You cannot debug or improve an agent you cannot see. Agents are
 * non-deterministic and long-running, so structured telemetry (traces +
 * metrics + logs) is not optional in production.
 *
 * Two complementary layers:
 *   A) The SDK's built-in OpenTelemetry export (config via env vars).
 *   B) A thin app-level span/log wrapper around your own loop for the
 *      dimensions OTEL won't capture (business outcomes, per-tool latency).
 *
 * SDK telemetry facts (set these in the environment, not code):
 *   - Telemetry is OFF by default: set CLAUDE_CODE_ENABLE_TELEMETRY=1 plus an exporter.
 *   - Traces require OTEL_TRACES_EXPORTER and CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1;
 *     metrics/logs do not need the beta flag.
 *   - Default export intervals: 60s metrics, 5s traces/logs. Lower to ~1000ms
 *     for short-lived calls or you'll lose data when the process exits.
 *   - Agent CONTENT is not logged by default. Opt in deliberately (privacy):
 *       OTEL_LOG_USER_PROMPTS, OTEL_LOG_TOOL_DETAILS,
 *       OTEL_LOG_TOOL_CONTENT (60 KB cap), OTEL_LOG_RAW_API_BODIES.
 *
 * Source:
 *   - Claude Agent SDK, "Observability"
 *     https://code.claude.com/docs/en/agent-sdk/observability
 */

import { query, type Options, type SDKMessage } from "@anthropic-ai/claude-agent-sdk";

/*
 * (A) Enable SDK OpenTelemetry export — set in the shell / deployment env:
 *
 *   export CLAUDE_CODE_ENABLE_TELEMETRY=1
 *   export CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1
 *   export OTEL_TRACES_EXPORTER=otlp
 *   export OTEL_METRICS_EXPORTER=otlp
 *   export OTEL_LOGS_EXPORTER=otlp
 *   export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
 *   export OTEL_METRIC_EXPORT_INTERVAL=1000   # ms; lower for short calls
 *   # Opt into content logging ONLY where privacy policy allows:
 *   # export OTEL_LOG_USER_PROMPTS=1
 */

// (B) App-level structured tracing. Emit one structured event per interesting
// thing. In real code, replace these console.error calls with spans on your
// OTEL tracer (tracer.startSpan(...)) or your logging pipeline.
interface RunTrace {
  runId: string;
  toolCalls: { name: string; tStart: number; tEnd?: number }[];
  turns: number;
  costUsd?: number;
  outcome?: string;
}

function logEvent(event: string, fields: Record<string, unknown>) {
  // Structured (JSON) logs are queryable; free-text logs are not.
  console.error(JSON.stringify({ ts: new Date().toISOString(), event, ...fields }));
}

export async function observedRun(runId: string, prompt: string, options: Options) {
  const trace: RunTrace = { runId, toolCalls: [], turns: 0 };
  logEvent("run.start", { runId, prompt });

  try {
    for await (const message of query({ prompt, options })) {
      instrument(message, trace);
    }
    logEvent("run.success", { runId, ...summarize(trace) });
  } catch (err) {
    // Always record failures with enough context to reproduce.
    logEvent("run.error", { runId, error: String(err), ...summarize(trace) });
    throw err;
  }
  return trace;
}

function instrument(message: SDKMessage, trace: RunTrace) {
  if (message.type === "assistant") {
    for (const b of message.message.content) {
      if (b.type === "tool_use") {
        trace.toolCalls.push({ name: b.name, tStart: performance.now() });
        logEvent("tool.start", { tool: b.name });
      }
    }
  }
  if (message.type === "user") {
    // tool results arrive as a user message; close the most recent open span
    const open = [...trace.toolCalls].reverse().find((c) => c.tEnd === undefined);
    if (open) {
      open.tEnd = performance.now();
      logEvent("tool.end", { tool: open.name, ms: Math.round(open.tEnd - open.tStart) });
    }
  }
  if (message.type === "result") {
    trace.turns = message.num_turns;
    trace.costUsd = message.total_cost_usd;
    trace.outcome = message.subtype;
  }
}

function summarize(trace: RunTrace) {
  return {
    turns: trace.turns,
    costUsd: trace.costUsd,
    outcome: trace.outcome,
    toolCount: trace.toolCalls.length,
  };
}

// Example
observedRun("run-001", "List the files in this directory.", {
  allowedTools: ["Glob"],
  permissionMode: "dontAsk",
  maxTurns: 5,
}).catch(() => process.exit(1));
