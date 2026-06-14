# Raw Search Dump: observability-tracing-logging

**Angle:** observability-tracing-logging

**Question:** What are best practices for observability, tracing, and logging in agent harnesses (capturing the full loop, spans per tool call, token/cost metrics, debugging traces, and OpenTelemetry/standards)?

---

## Query 1: "agent observability tracing OpenTelemetry LLM spans best practices"

Results:
- AI Agent Observability Guide: Telemetry, Traces, Metrics, and Evals — https://www.groundcover.com/learn/observability/ai-agent-observability
- OpenTelemetry for AI Systems: LLM and Agent Observability (2026) | Uptrace — https://uptrace.dev/blog/opentelemetry-ai-systems
- OpenTelemetry - Tracing LLMs with any observability tool | liteLLM — https://docs.litellm.ai/docs/observability/opentelemetry_integration
- The AI Engineer's Guide to LLM Observability with OpenTelemetry | Agenta — https://agenta.ai/blog/the-ai-engineer-s-guide-to-llm-observability-with-opentelemetry
- Concepts of LLM Observability in Agenta - Docs — https://agenta.ai/docs/observability/concepts
- AI Agent Observability - Evolving Standards and Best Practices | OpenTelemetry — https://opentelemetry.io/blog/2025/ai-agent-observability/
- Automated structural testing of LLM-based agents (arXiv) — https://arxiv.org/pdf/2601.18827

Key notes: Treat every user request as a single trace with spans for planning, model calls, tool calls, downstream services. Each tool call/LLM invocation/retrieval step = child span = full reasoning chain trace. `invoke_agent` span with attrs (agent ID, input/output size, eval results). OTel wraps API calls in spans with standardized `gen_ai` attributes (model name, token counts, finish reason) per GenAI semantic conventions. Two integration approaches: built-in OTel support vs explicit instrumentation libs. Manual instrumentation for custom retrieval/eval scores/business logic. Streaming: start span before stream, accumulate token counts from chunks, record completion event after final chunk, end span.

## Query 2: "LLM agent logging token cost metrics debugging traces"

Results:
- From Bills to Budgets: How to Track LLM Token Usage and Cost Per User | Traceloop — https://www.traceloop.com/blog/from-bills-to-budgets-how-to-track-llm-token-usage-and-cost-per-user
- Best LLM tracing tools for multi-agent systems (2026 review) | Braintrust — https://www.braintrust.dev/articles/best-llm-tracing-tools-2026
- Best LLM monitoring tools in 2026 | Braintrust — https://www.braintrust.dev/articles/best-llm-monitoring-tools-2026
- AI Observability for LLMs & Agents | MLflow AI Platform — https://mlflow.org/ai-observability
- Agent Observability | Datadog — https://docs.datadoghq.com/llm_observability/
- 4 best tools for monitoring LLM & agent applications in 2026 | LangWatch — https://langwatch.ai/blog/4-best-tools-for-monitoring-llm-agentapplications-in-2026
- AI Agent Observability Guide | groundcover — https://www.groundcover.com/learn/observability/ai-agent-observability
- How to track LLM token usage (2026) | Braintrust — https://www.braintrust.dev/articles/how-to-track-llm-token-usage-2026

Key notes: Tracing captures execution path as structured spans connected in a tree. Auto trace capture logs LLM duration, time to first token, prompt tokens, cached tokens, completion tokens, reasoning tokens, estimated cost, tool calls, errors. Most actionable: prompt+completion tokens attributed to user/feature/team; track total cost per user. Debugging multi-step agents needs visibility; timeline replay shows when each operation started, duration, return value. Single line of code can auto-capture traces.

## Query 3: "Claude Agent SDK observability tracing logging hooks"

Results:
- Observability with the Claude Agent SDK | Anukriti Ranjan (Medium) — https://anukriti-ranjan.medium.com/observability-with-the-claude-agent-sdk-1dc6bfa9c50e
- claude_telemetry (OTel wrapper for Claude Code CLI) | GitHub TechNickAI — https://github.com/TechNickAI/claude_telemetry
- agent-observability (Claude Code plugin) | GitHub nexus-labs-automation — https://github.com/nexus-labs-automation/agent-observability
- Claude Code Monitoring & Observability with OpenTelemetry | SigNoz Docs — https://signoz.io/docs/claude-code-monitoring/
- Observability with OpenTelemetry - Claude Code Docs — https://code.claude.com/docs/en/agent-sdk/observability
- claude-code-hooks-multi-agent-observability | GitHub disler — https://github.com/disler/claude-code-hooks-multi-agent-observability
- Claude Code Control and Observability with OpenTelemetry | General Analysis — https://generalanalysis.com/guides/claude-code-control-observability-opentelemetry
- Observability for Claude Agent SDK with Langfuse — https://langfuse.com/integrations/frameworks/claude-agent-sdk

Key notes: Claude Code provides three signal types via OTel: metrics (aggregate activity), events (logs/events path, discrete actions), traces (connect a user prompt to model calls, tool calls, hook execution, permission waits). Programmatic hooks = callbacks passed into `ClaudeAgentOptions`, run in-process, access app state, return structured decisions (allow/deny/modify). PreToolUse/PostToolUse fire for tools; agent_id/agent_type attribution for subagents. llm_request, tool, hook spans are children of enclosing `claude_code.interaction` span. Subagent via Task tool nests under parent's `claude_code.tool` span -> full delegation chain as one trace. Hooks are async, capture telemetry without blocking.

## Query 4: "OpenTelemetry GenAI semantic conventions agent spans tool call attributes"

Results:
- Semantic conventions for generative client AI spans | OpenTelemetry — https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/
- Semantic Conventions for GenAI agent and framework spans | OpenTelemetry — https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/
- OpenTelemetry for AI Systems (2026) | Uptrace — https://uptrace.dev/blog/opentelemetry-ai-systems
- Datadog LLM Observability natively supports OTel GenAI Semantic Conventions | Datadog — https://www.datadoghq.com/blog/llm-otel-semantic-convention/
- How OpenTelemetry Traces LLM Calls, Agent Reasoning, and MCP Tools | Greptime — https://greptime.com/blogs/2026-05-09-opentelemetry-genai-semantic-conventions
- Semantic conventions for Generative AI events | OpenTelemetry — https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-events/
- GenAI Semantic Conventions | traceloop — https://www.traceloop.com/docs/openllmetry/contributing/semantic-conventions
- OpenTelemetry for AI Agents | Zylos Research — https://zylos.ai/research/2026-02-28-opentelemetry-ai-agent-observability

Key notes: OTel GenAI conventions expanded to cover agent orchestration, MCP tool calling, content capture, quality evaluation across six layers. Standard schema for prompts, model responses, token usage, tool/agent calls, provider metadata. Each tool call/LLM invocation/retrieval = child span. Tool types incl. Extension (agent-side tool calling external APIs). GenAI SemConv SIG actively defining attribute schemas for LLM calls, agent invocations, tool executions, session-level metrics. Auto-instrumentation packages for OpenAI, Anthropic, LangChain, LlamaIndex.
