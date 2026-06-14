# Agent-Harness Best Practices - Findings Digest

Audience: engineers building a TypeScript agent harness (the runtime/agentic loop wrapping an LLM). Principles are language-agnostic; the Anthropic Claude Agent SDK is the primary reference. Synthesis of 150 adversarially-verified claims across 25 sources.

## Executive Summary
A production agent harness is a thin control layer around a repeating loop: gather context, take action (tools), verify work, iterating until the model emits no tool calls. Anthropic frames the harness as one of four components (model, tools, environment, harness); the harness owns instructions and guardrails. Dominant cross-cutting principles: (1) the agent-computer interface (tools) matters more than the prompt; (2) context is a finite, degrading budget; (3) authorization belongs in harness code, not prompts; (4) single-threaded linear agents are the reliable default while parallel multi-agents trade tokens/consistency for speed; (5) evaluate outcomes not paths, and start small.

## Theme 1: Core Agentic Loop & Loop Control
- Workflows orchestrate through predefined code paths; agents let the LLM dynamically direct its own process/tools. Pick the simplest that works. [building-effective-agents]
- Structure as repeating gather-context, take-action, verify-work until completion. [building-agents-with-the-claude-agent-sdk]
- The loop runs turns autonomously without yielding to the caller (Claude output+tool calls -> harness executes -> results feed back) and ends when Claude emits output with no tool calls. [agent-loop]
- Always bound: maxTurns counts tool-use turns only; maxBudgetUsd caps spend and yields subtype error_max_budget_usd; a budget is the recommended production default. [agent-loop, typescript]
- Give the model room to think; keep formats close to naturally-occurring text (avoid line-counting/escaping). [building-effective-agents]
Sources: https://www.anthropic.com/research/building-effective-agents | https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk | https://code.claude.com/docs/en/agent-sdk/agent-loop | https://platform.claude.com/docs/en/agent-sdk/typescript

## Theme 2: Tool Design & The Result Contract
- Invest in tools over prompts: SWE-bench teams optimized tools more than the prompt; a tool-description-rewriting agent cut task completion time 40%. [building-effective-agents, multi-agent-research-system]
- Consolidate tools around workflows not API endpoints (one schedule_event vs list_users/list_events/create_event); minimize functional overlap. [writing-tools, effective-context-engineering]
- Error-proof arguments (poka-yoke): absolute filepaths eliminated a class of model errors. [building-effective-agents]
- Namespace related tools (asana_projects_search); name params unambiguously (user_id not user); document tools as for a junior developer; test in a workbench. [writing-tools]
- Bound output: Claude Code caps tool responses at 25,000 tokens; expose a response_format enum (concise 72 vs detailed 206 tokens). [writing-tools]
- Return errors as actionable data: an uncaught handler exception stops the loop and fails the query; returning isError:true (is_error:True) keeps the loop running. [writing-tools, custom-tools]
- readOnlyHint (default false) lets read-only tools run in parallel; custom tools default sequential and must opt in. [custom-tools, agent-loop]
Sources: https://www.anthropic.com/research/building-effective-agents | https://www.anthropic.com/engineering/writing-tools-for-agents | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | https://www.anthropic.com/engineering/multi-agent-research-system | https://platform.claude.com/docs/en/agent-sdk/custom-tools | https://code.claude.com/docs/en/agent-sdk/agent-loop

## Theme 3: Context Window & Memory Management
- Context rot is measurable (needle-in-haystack): attention scales n^2, a finite budget with diminishing returns. [effective-context-engineering]
- Prefer just-in-time retrieval (hold file paths/URLs, load at runtime); favor agentic search (grep/tail) as primary, semantic search secondary. [effective-context-engineering, building-agents-sdk]
- Compaction summarizes history (preserve decisions, drop redundant tool output); the compression-LLM technique is hard to get right. [effective-context-engineering, dont-build-multi-agents]
- Context editing auto-removes stale tool calls/results: +29% alone, +39% with memory tool, -84% tokens in a 100-turn web search test (public beta 2025-09-29). [context-management]
- Memory tool (memory_20250818, name memory) is a client-side /memories file system with six commands (view/create/str_replace/insert/delete/rename); validate path traversal (.. and %2e%2e%2f), cap sizes, view errors above 999,999 lines; auto-injects a "view memory first" directive. [memory-tool]
- Put durable rules in CLAUDE.md/AGENTS.md so they live in the system prompt and survive compaction; load many tools on demand via tool search since each tool costs context every turn. [awesome-harness-engineering, agent-loop, custom-tools]
Sources: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | https://www.anthropic.com/news/context-management | https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool | https://github.com/ai-boost/awesome-harness-engineering | https://code.claude.com/docs/en/agent-sdk/agent-loop

## Theme 4: System Prompts & Instructions
- Aim for the right altitude: avoid both brittle if-else logic and vague guidance. [effective-context-engineering]
- Structure with descriptive XML tags per content type; wrap few-shot examples in example tags; use 3-5. [use-xml-tags]
- For 20k+ token inputs, place long documents at top and the query at end (up to 30% quality gain). [use-xml-tags]
- On Opus 4.5/4.6 use normal phrasing not CRITICAL/MUST to avoid over-triggering; prefilled last-assistant-turn responses removed in 4.6+ (400 error). [use-xml-tags]
- Tell the agent context auto-compacts so it does not stop early and to save progress to memory near the limit; preserve thinking blocks when returning tool results (budget_tokens controls depth). [use-xml-tags, awesome-harness-engineering]
Sources: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags | https://github.com/ai-boost/awesome-harness-engineering

## Theme 5: Subagents & Multi-Agent Orchestration
- Single-threaded linear agents are the most reliable production design; share full context/traces (not just task summaries) to avoid decision conflicts among parallel subagents. [dont-build-multi-agents]
- Multi-agent wins for read-heavy research (Opus lead + Sonnet subagents beat single Opus by 90.2%) but costs ~15x chat tokens (single agents ~4x); parallelizing spin-up and tool calls cut research time up to 90%. [multi-agent-research-system]
- Scale effort to complexity: simple 1 agent/3-10 calls; comparison 2-4 subagents/10-15 calls; complex 10+ subagents. [multi-agent-research-system]
- Subagents isolate context: fresh conversation, only final message returns to parent; the only parent->subagent channel is the Agent tool prompt string. Restrict subagent tools via the tools field. [subagents, agent-loop]
- Auto-approving subagents needs Agent in allowedTools; messages carry parent_tool_use_id; for hundreds of agents use the Workflow tool (TS SDK v0.3.149+). [overview, subagents]
- Unify decision and code-application into one action; Claude Code restricts subtasks to sequential investigation-only work. [dont-build-multi-agents]
Sources: https://cognition.ai/blog/dont-build-multi-agents | https://www.anthropic.com/engineering/multi-agent-research-system | https://platform.claude.com/docs/en/agent-sdk/subagents | https://code.claude.com/docs/en/agent-sdk/agent-loop | https://platform.claude.com/docs/en/agent-sdk/overview

## Theme 6: Permissions, Sandboxing & Safety Guardrails
- Fixed ordered pipeline: hooks, deny, ask, permission mode, allow, canUseTool. Encode authorization in code, not prompts. [awesome-harness-engineering, permissions]
- Deny rules block in every mode including bypassPermissions; allowedTools only pre-approves and does NOT restrict bypass (use disallowedTools); pair allowedTools with dontAsk for a locked tool surface. [permissions]
- acceptEdits auto-approves edits/fs commands only inside the working dir or additionalDirectories; subagents inherit bypass/acceptEdits/auto uncontrollably (bypass = full system access). [permissions]
- Human approval rubber-stamps (~93%); OS sandboxes (Seatbelt/bubblewrap) cut prompts 84%; the auto classifier blocks ~0.4% benign but misses ~17% overeager, so it is one defense layer only. [how-we-contain-claude]
- Containment: defer parsing project-local config until after the trust prompt; resolve symlinks before path validation; use a MITM egress proxy bound to the VM session token (destination allowlists alone allowed exfiltration). [how-we-contain-claude]
- Sandbox defaults: write only to CWD+TMPDIR; reads whole machine except denyRead (creds/ssh readable unless blocked); no pre-allowed domains; proxy enforces hostname without TLS inspection (domain-fronting risk); Seatbelt(mac)/bubblewrap(Linux,WSL2), no native Windows/WSL1; falls back to unsandboxed unless failIfUnavailable. [sandboxing]
- Layer prompt-injection defense (training + monitoring + red-team); offer per-tool states allow/approve/block; OpenAI-SDK guardrails run on first/last agent only, halt on tripwire, and should run in blocking mode to avoid token use on trip (tool guardrails apply only to function_tool). [trustworthy-agents, guardrails]
Sources: https://github.com/ai-boost/awesome-harness-engineering | https://docs.claude.com/en/docs/agent-sdk/permissions | https://platform.claude.com/docs/en/agent-sdk/typescript | https://www.anthropic.com/engineering/how-we-contain-claude | https://code.claude.com/docs/en/sandboxing | https://www.anthropic.com/research/trustworthy-agents | https://openai.github.io/openai-agents-python/guardrails/

## Theme 7: Human-in-the-Loop & Lifecycle Hooks
- Hooks run in the application process (no context cost); a PreToolUse hook that rejects a tool call prevents execution and Claude gets the rejection message. [agent-loop]
- Plan Mode displays the full action plan upfront for approval before execution. [trustworthy-agents]
- Pause before risky tools via interrupt_on (e.g., edit_file:true pauses before every edit); agents roughly double their check-in rate on complex tasks. [deepagents-harness, trustworthy-agents]
- Track work with write_todos (pending/in_progress/completed in state); deepagents filesystem rules are first-match-wins, default-allow, and skip sandbox backends. [deepagents-harness]
Sources: https://code.claude.com/docs/en/agent-sdk/agent-loop | https://www.anthropic.com/research/trustworthy-agents | https://docs.langchain.com/oss/python/deepagents/harness

## Theme 8: Streaming & Result Handling
- Lifecycle: one message_start (empty content), per content block start/delta(s)/stop, then message_delta(s), then one message_stop; reassemble by index. [messages-streaming]
- Usage counts in message_delta are cumulative (use latest, do not sum); handle unknown SSE event types gracefully. [messages-streaming]
- Accumulate tool_use input_json_delta partial JSON and parse only after content_block_stop (final input always complete); thinking blocks emit signature_delta for integrity. [messages-streaming]
- Interrupted streams cannot recover tool_use/thinking blocks; resume only from the last text block. [messages-streaming]
- ResultMessage.result exists only on the success subtype; all subtypes carry total_cost_usd, usage, num_turns, session_id. [agent-loop]
Sources: https://docs.anthropic.com/en/api/messages-streaming | https://code.claude.com/docs/en/agent-sdk/agent-loop

## Theme 9: Observability, Tracing & Logging (OpenTelemetry)
- Telemetry off by default: set CLAUDE_CODE_ENABLE_TELEMETRY=1 plus an exporter. [observability]
- Traces require OTEL_TRACES_EXPORTER and CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1; metrics/logs do not need the beta flag. [observability]
- Default export intervals: 60s metrics, 5s traces/logs; lower to ~1000ms for short calls. [observability]
- Agent content not logged by default; opt in via OTEL_LOG_USER_PROMPTS, OTEL_LOG_TOOL_DETAILS, OTEL_LOG_TOOL_CONTENT (60KB cap), OTEL_LOG_RAW_API_BODIES. [observability]
Sources: https://code.claude.com/docs/en/agent-sdk/observability

## Theme 10: Evaluation & Testing
- Start with 20-50 real-failure tasks; early effect sizes are large (30% to 80%); a 0% pass@100 usually means a broken task/grader. [demystifying-evals, multi-agent-research-system]
- Isolate every trial from a clean environment to avoid correlated infra-flakiness failures. [demystifying-evals]
- Grade outcomes not tool-call paths (path-checking is brittle). [demystifying-evals]
- Separate capability evals (start low, a hill to climb) from regression evals (near 100%); use pass^k for consistency (0.75^3 is about 42%). [demystifying-evals]
- Calibrate LLM-as-judge to humans, give an Unknown option, use per-dimension rubric judges; verify via rules-based, visual screenshot, and LLM-as-judge feedback. [demystifying-evals, building-agents-sdk]
Sources: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents | https://www.anthropic.com/engineering/multi-agent-research-system | https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk

## Theme 11: Project & File Structure for Long-Running Agents
- Bootstrap with an init.sh read every session; carry state in claude-progress.txt read at start and updated at end. [long-running-harnesses]
- Encode requirements as a structured JSON feature list (200+ features) with pass/fail status, category, steps. [long-running-harnesses]
- One feature per session, commit via git for recovery, mark complete only after end-to-end verification (Puppeteer MCP for web apps); never edit/remove tests. [long-running-harnesses, memory-tool]
- Skills via progressive disclosure (SKILL.md frontmatter first); persistent AGENTS.md memory is always loaded; portable .agent/ folder standardizes a cross-tool harness layer. [deepagents-harness, awesome-harness-engineering]
- SDK availability vs permission: tools option and bare disallowedTools change availability; allowedTools and scoped disallowedTools change only permission; tools:[] leaves only custom MCP tools. [custom-tools]
Sources: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents | https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool | https://docs.langchain.com/oss/python/deepagents/harness | https://github.com/ai-boost/awesome-harness-engineering | https://platform.claude.com/docs/en/agent-sdk/custom-tools

## Theme 12: Claude Agent SDK Specifics
- Python SDK needs Python 3.10+; the TS SDK bundles a native Claude Code binary as an optional dependency. [overview]
- MCP tools follow mcp__server__tool; the Python @tool decorator forwards only content and is_error (structuredContent needs a standalone MCP server). [custom-tools]
- TS defaults: permissionMode default; allowedTools/disallowedTools empty; CLAUDE_CODE_MAX_RETRIES 10; API_TIMEOUT_MS 600000; thinking adaptive (maxThinkingTokens deprecated); persistSession true; enableFileCheckpointing false. [typescript]
- Settings load from user/project/local .claude paths; empty settingSources disables filesystem settings. [typescript, overview]
- Third parties may not offer claude.ai login/rate limits on SDK products unless pre-approved; the harness is one of four components and holds instructions and guardrails. [overview, trustworthy-agents]
Sources: https://platform.claude.com/docs/en/agent-sdk/overview | https://platform.claude.com/docs/en/agent-sdk/typescript | https://platform.claude.com/docs/en/agent-sdk/custom-tools | https://www.anthropic.com/research/trustworthy-agents

## Sources
1. https://www.anthropic.com/research/building-effective-agents
2. https://www.anthropic.com/engineering/writing-tools-for-agents
3. https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
4. https://github.com/ai-boost/awesome-harness-engineering
5. https://platform.claude.com/docs/en/agent-sdk/custom-tools
6. https://www.anthropic.com/engineering/how-we-contain-claude
7. https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
8. https://openai.github.io/openai-agents-python/guardrails/
9. https://docs.langchain.com/oss/python/deepagents/harness
10. https://platform.claude.com/docs/en/agent-sdk/typescript
11. https://docs.claude.com/en/docs/agent-sdk/permissions
12. https://docs.anthropic.com/en/api/messages-streaming
13. https://code.claude.com/docs/en/agent-sdk/observability
14. https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
15. https://platform.claude.com/docs/en/agent-sdk/overview
16. https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk
17. https://code.claude.com/docs/en/agent-sdk/agent-loop
18. https://www.anthropic.com/news/context-management
19. https://cognition.ai/blog/dont-build-multi-agents
20. https://www.anthropic.com/engineering/multi-agent-research-system
21. https://code.claude.com/docs/en/sandboxing
22. https://www.anthropic.com/research/trustworthy-agents
23. https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool
24. https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags
25. https://platform.claude.com/docs/en/agent-sdk/subagents
