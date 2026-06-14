# Observability with OpenTelemetry - Claude Code Docs
URL: https://code.claude.com/docs/en/agent-sdk/observability

Retrieval note: Fetched via WebFetch on 2026-06-14. Page retrieved successfully with full content.

---

# Observability with OpenTelemetry

> Export traces, metrics, and events from the Agent SDK to your observability backend using OpenTelemetry.

When you run agents in production, you need visibility into what they did:

* which tools they called
* how long each model request took
* how many tokens were spent
* where failures occurred

The Agent SDK can export this data as OpenTelemetry traces, metrics, and log events to any backend that accepts the OpenTelemetry Protocol (OTLP), such as Honeycomb, Datadog, Grafana, Langfuse, or a self-hosted collector.

## How telemetry flows from the SDK

The Agent SDK runs the Claude Code CLI as a child process and communicates with it over a local pipe. The CLI has OpenTelemetry instrumentation built in: it records spans around each model request and tool execution, emits metrics for token and cost counters, and emits structured log events for prompts and tool results. The SDK does not produce telemetry of its own. Instead, it passes configuration through to the CLI process, and the CLI exports directly to your collector.

Configuration is passed as environment variables. By default, the child process inherits your application's environment.

* Process environment: set the variables in your shell, container, or orchestrator before your application starts. Recommended for production.
* Per-call options: set the variables in `ClaudeAgentOptions.env` (Python) or `options.env` (TypeScript). In Python, `env` is merged on top of the inherited environment. In TypeScript, `env` replaces the inherited environment entirely, so include `...process.env`.

Three independent OpenTelemetry signals:

| Signal     | What it contains                                                            | Enable with                                                         |
| ---------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Metrics    | Counters for tokens, cost, sessions, lines of code, and tool decisions      | `OTEL_METRICS_EXPORTER`                                             |
| Log events | Structured records for each prompt, API request, API error, and tool result | `OTEL_LOGS_EXPORTER`                                                |
| Traces     | Spans for each interaction, model request, tool call, and hook (beta)       | `OTEL_TRACES_EXPORTER` plus `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1` |

## Enable telemetry export

Telemetry is off until you set `CLAUDE_CODE_ENABLE_TELEMETRY=1` and choose at least one exporter. Common config sends all three signals over OTLP HTTP.

Example env:
- CLAUDE_CODE_ENABLE_TELEMETRY=1
- CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1 (required for traces beta; metrics and log events do not need this)
- OTEL_TRACES_EXPORTER=otlp
- OTEL_METRICS_EXPORTER=otlp
- OTEL_LOGS_EXPORTER=otlp
- OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
- OTEL_EXPORTER_OTLP_ENDPOINT=http://collector.example.com:4318
- OTEL_EXPORTER_OTLP_HEADERS=Authorization=Bearer your-token

Note: The `console` exporter writes telemetry to standard output, which the SDK uses as its message channel. Do not set `console` as an exporter value when running through the SDK. To inspect telemetry locally, point `OTEL_EXPORTER_OTLP_ENDPOINT` at a local collector or an all-in-one Jaeger container.

### Flush telemetry from short-lived calls

The CLI batches telemetry and exports on an interval. On clean process exit it attempts to flush pending data, but the flush is bounded by a short timeout, so spans can be dropped if the collector is slow. If the process is killed before the CLI shuts down, anything still in the batch buffer is lost.

By default, metrics export every 60 seconds and traces and logs export every 5 seconds. Shorten via:
- OTEL_METRIC_EXPORT_INTERVAL=1000
- OTEL_LOGS_EXPORT_INTERVAL=1000
- OTEL_TRACES_EXPORT_INTERVAL=1000

## Read agent traces

With `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1` set, each step of the agent loop becomes a span:

* `claude_code.interaction`: wraps a single turn of the agent loop, from receiving a prompt to producing a response.
* `claude_code.llm_request`: wraps each call to the Claude API, with model name, latency, and token counts as attributes.
* `claude_code.tool`: wraps each tool invocation, with child spans for the permission wait (`claude_code.tool.blocked_on_user`) and the execution itself (`claude_code.tool.execution`).
* `claude_code.hook`: wraps each hook execution. Requires detailed beta tracing (`ENABLE_BETA_TRACING_DETAILED=1` and `BETA_TRACING_ENDPOINT`) in addition to the variables above.

The `llm_request`, `tool`, and `hook` spans are children of the enclosing `claude_code.interaction` span. When the agent spawns a subagent through the Task tool, the subagent's spans nest under the parent agent's `claude_code.tool` span.

Spans carry a `session.id` attribute by default. The attribute is omitted if `OTEL_METRICS_INCLUDE_SESSION_ID` is set to a falsy value.

Note: Tracing is in beta. Span names and attributes may change between releases.

## Link traces to your application

The SDK automatically propagates W3C trace context into the CLI subprocess. When you call `query()` while an OpenTelemetry span is active, the SDK injects `TRACEPARENT` and `TRACESTATE` into the child process environment, and the CLI reads them so its `claude_code.interaction` span becomes a child of your span.

When trace-context propagation is enabled, the CLI also forwards `TRACEPARENT` to every Bash and PowerShell command it runs.

Auto-injection is skipped when you set `TRACEPARENT` explicitly in `options.env`. Interactive CLI sessions ignore inbound `TRACEPARENT` entirely; only Agent SDK and `claude -p` runs honor it.

## Tag telemetry from your agent

By default, the CLI reports `service.name` as `claude-code`. Override via `OTEL_SERVICE_NAME` and add `OTEL_RESOURCE_ATTRIBUTES` (e.g. `service.version=1.4.0,deployment.environment=production`). Applied as resource attributes on every span, metric, and event.

## Attribute actions to your end users

The CLI attaches identity attributes to every event based on the credential it uses to call Anthropic. To attribute to end users, inject end-user identity as resource attributes on each `query()` call. Percent-encode values before interpolating them, since `OTEL_RESOURCE_ATTRIBUTES` reserves commas, spaces, and equals signs. Example: `enduser.id={quote(request.user_id)},tenant.id={quote(request.tenant_id)}`.

With end-user identity attached, the `tool_decision`, `tool_result`, `mcp_server_connection`, and `permission_mode_changed` events become a per-user audit trail forwardable to a SIEM.

## Control sensitive data in exports

Telemetry is structural by default. Durations, model names, and tool names are recorded on every span; token counts are recorded when the underlying API request returns usage data. The content the agent reads and writes is not recorded by default. Opt-in variables:

| Variable                  | Adds |
| ------------------------- | ---- |
| `OTEL_LOG_USER_PROMPTS=1` | Prompt text on `claude_code.user_prompt` events and on the `claude_code.interaction` span |
| `OTEL_LOG_TOOL_DETAILS=1` | Tool input arguments (file paths, shell commands, search patterns) on `claude_code.tool_result` events |
| `OTEL_LOG_TOOL_CONTENT=1` | Full tool input and output bodies as span events on `claude_code.tool`, truncated at 60 KB. Requires tracing to be enabled |
| `OTEL_LOG_RAW_API_BODIES` | Full Anthropic Messages API request and response JSON as `claude_code.api_request_body` and `claude_code.api_response_body` log events. Set to `1` for inline bodies truncated at 60 KB, or `file:<dir>` for untruncated bodies on disk with a `body_ref` path. Bodies include entire conversation history with extended-thinking content redacted. |

Leave these unset unless your observability pipeline is approved to store the data your agent handles.
