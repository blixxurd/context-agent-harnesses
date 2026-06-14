# Raw Search Output: error-handling-and-resilience

**Angle:** error-handling-and-resilience

**Question:** What are best practices for error handling and resilience in an agent harness, including tool failure recovery, retries/backoff, error feedback to the model, timeouts, rate-limit handling, and graceful degradation?

---

## Query 1: "agent harness error handling retry backoff tool failure recovery best practices"

Results:
- AI Agent Error Handling: Best Practices & Patterns for 2025 | Fastio — https://fast.io/resources/ai-agent-error-handling/
- Handling Tool Errors and Agent Recovery (APXML LangChain Production course) — https://apxml.com/courses/langchain-production-llm/chapter-2-sophisticated-agents-tools/agent-error-handling
- Exception Handling and Recovery in Agentic AI | atal upadhyay — https://atalupadhyay.wordpress.com/2026/03/16/exception-handling-and-recovery-in-agentic-ai/
- Agent Error Handling and Recovery Patterns: Production-Ready Resilience | AgentWorks — https://agent-works.ai/insights/agent-error-handling-recovery-patterns
- GRACE: an Agentic AI for Particle Physics Experiment Design and Simulation (arXiv) — https://arxiv.org/pdf/2602.15039
- AI Agent Retry Patterns - Exponential Backoff Guide 2026 | Fastio — https://fast.io/resources/ai-agent-retry-patterns/

Key takeaways from snippet: layered defense strategy (catch errors at multiple levels before cascade); exponential backoff doubling delay + jitter to prevent synchronized retries; wrap tool execution with retry decorators (1-2s base delay, double, stop at 5-7 attempts); circuit breaker to disable consistently-failing tools and fall back; error-specific recovery (no retry on 404/401/quota/deprecated); idempotent vs non-idempotent tools (idempotency keys for non-idempotent); respect 429s; fallbacks/escalation (alt API, cached result, best-effort response).

## Query 2: "LLM agent resilience rate limit timeout recovery feeding tool errors back to model"

Results:
- LLM calls crash on large tool results — missing input truncation and 500 not retried · Issue #34 · EurekaClaw/EurekaClaw (GitHub) — https://github.com/EurekaClaw/EurekaClaw/issues/34
- AI Agent Error Handling: 4 Resilience Patterns in Python - DEV Community — https://dev.to/thedailyagent/ai-agent-error-handling-4-resilience-patterns-in-python-12of
- Agent session dies on 429/rate-limit with no recovery or model fallback · Issue #1861 · paperclipai/paperclip (GitHub) — https://github.com/paperclipai/paperclip/issues/1861
- AI Agent Retry Patterns - Exponential Backoff Guide 2026 | Fastio — https://fast.io/resources/ai-agent-retry-patterns/
- ACE-Bench (arXiv) — https://arxiv.org/pdf/2604.06111
- Beyond Binary Correctness: Scaling Evaluation of Long-Horizon Agents (arXiv) — https://arxiv.org/pdf/2603.22744
- Error Handling & Retries: Making LLM Calls Reliable | Tanishk Soni | Medium — https://medium.com/@sonitanishk2003/error-handling-retries-making-llm-calls-reliable-ee7722fc2ea9
- LLM Tool-Calling in Production: Rate Limits, Retries, and the "Infinite Loop" Failure Mode | Yamishift | Medium — https://medium.com/@komalbaparmar007/llm-tool-calling-in-production-rate-limits-retries-and-the-infinite-loop-failure-mode-you-must-2a1e2a1e84c8
- TRAIL: Trace Reasoning and Agentic Issue Localization (arXiv) — https://arxiv.org/pdf/2505.08638

Key takeaways from snippet: LLM API calls fail 1-5% (rate limits, timeouts, server errors); exponential backoff + jitter reduces retry storms 60-80% (AWS); error classification (retry transient, fail fast on permanent like bad key/malformed request); retryable fragments: 429/rate_limit/overloaded/529/timeout/empty content/500/502/503; error message quality determines recoverability (structured compiler output >85% recovery, ambiguous config errors 17%); tool call failures = 71% of errors (MCP timeouts, file-not-found, permission denials); 4 patterns: retry with backoff, model fallback chains, circuit breakers, graceful degradation; infinite-loop failure mode to design against; need input truncation for large tool results.

## Query 3: "Anthropic building effective agents tool use error feedback resilience engineering blog"

Results:
- Anthropic: Building Effective Agents (ZenML LLMOps DB summary) — https://www.zenml.io/llmops-database/building-effective-agents-practical-framework-and-design-principles
- Building Effective AI Agents \ Anthropic — https://www.anthropic.com/research/building-effective-agents
- Building Better Agent Tools: Lessons from Anthropic's Engineering | Chris Zhang | Medium — https://zhanghaolin66.medium.com/building-better-agent-tools-lessons-from-anthropics-engineering-39caf8c3c5e7
- Effective context engineering for AI agents \ Anthropic — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Writing effective tools for AI agents—using AI agents \ Anthropic — https://www.anthropic.com/engineering/writing-tools-for-agents
- Building Effective AI Agents: Architecture Patterns (Anthropic PDF) — https://resources.anthropic.com/hubfs/Building%20Effective%20AI%20Agents-%20Architecture%20Patterns%20and%20Implementation%20Frameworks.pdf
- (mirror) blog.naitive.cloud/building-effective-agents — https://blog.naitive.cloud/building-effective-agents/

Key takeaways from snippet: agents are LLMs using tools on environmental feedback in a loop; autonomous nature => higher costs + compounding errors; recommend sandboxed testing + guardrails; tool truncation and error responses can steer agents to token-efficient behavior and show correctly formatted tool inputs; tools should be self-contained, robust to error, clear; few high-impact tools rather than wrapping everything.

## Query 4: "OpenAI agents SDK function calling error handling guardrails retries production"

Results:
- OpenAI Agents SDK: The Modern Guide | Data Science Dojo — https://datasciencedojo.com/blog/openai-agents-sdk/
- OpenAI Agents SDK (docs home) — https://openai.github.io/openai-agents-python/
- Running Agents | OpenAI Agents SDK (JS) — https://openai.github.io/openai-agents-js/guides/running-agents/
- Error Handling and Troubleshooting | openai/openai-agents-python | DeepWiki — https://deepwiki.com/openai/openai-agents-python/14-error-handling-and-troubleshooting
- Guardrails - OpenAI Agents SDK — https://openai.github.io/openai-agents-python/guardrails/
- Agent - OpenAI Agents SDK ref — https://openai.github.io/openai-agents-python/ref/agent/
- A practical guide to building agents (OpenAI PDF) — https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf
- How To Build Your First Production Ready Agent (2026 Guide) | Rahul Kolekar — https://rahulkolekar.com/how-to-build-your-first-production-ready-agent-with-openai-s-agents-sdk-and-responses-api-2026-guide/

Key takeaways from snippet: structured classes over string passing for predictable error handling; guardrails run input validation/safety checks in parallel and fail fast; tool guardrails on every function-tool invocation (input before, output after); retry behavior via ModelRetrySettings within ModelSettings (initial delay, max delay, multipliers); loop-level failure handlers + model-level retry policies; max turns / runaway-error prevention; production needs guardrails + tracing + human-in-the-loop.
