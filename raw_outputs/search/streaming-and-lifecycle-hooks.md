# Raw Search Output: streaming-and-lifecycle-hooks

**Angle:** streaming-and-lifecycle-hooks

**Question:** How should streaming and lifecycle hooks be designed in an agent harness (token/event streaming, partial tool calls, pre/post-tool hooks, interrupts, cancellation, and emitting structured events)?

**Date run:** 2026-06-14

---

## Query 1: "Claude Agent SDK hooks lifecycle PreToolUse PostToolUse design"

Results:
- Claude Code & Agent SDK Hooks (2026): PreToolUse, PostToolUse, UserPromptSubmit, Stop, SubagentStop Reference — https://www.morphllm.com/claude-code-hooks
- Claude Agent SDK: Build Production AI Agents (2026 Guide) - Beginners in AI — https://beginnersinai.org/claude-agent-sdk/
- Claude Code Hooks: 6 Production Patterns (2026) | Pixelmojo — https://www.pixelmojo.io/blogs/claude-code-hooks-production-quality-ci-cd-patterns
- Claude Code Hooks Complete Guide - Deterministic Enforcement Across the Tool Lifecycle | hidekazu-konishi.com — https://hidekazu-konishi.com/entry/claude_code_hooks_complete_guide.html
- Claude Code Hooks: The Deterministic Control Layer for AI Agents - Dotzlaw Consulting — https://www.dotzlaw.com/insights/claude-hooks/
- ClaudeAgentSDK.Hooks — claude_agent_sdk v0.16.0 — https://hexdocs.pm/claude_agent_sdk/ClaudeAgentSDK.Hooks.html
- Claude Agent SDK Python Guide 2026 | AI Workflow Lab — https://aiworkflowlab.dev/article/how-to-build-production-ai-agents-claude-agent-sdk-custom-tools-hooks-subagents
- Claude Code Hooks: Complete Guide to All 12 Lifecycle Events — https://claudefa.st/blog/tools/hooks/hooks-guide

Key notes: Hooks fire user code at fixed lifecycle points. Most queried: PreToolUse, PostToolUse, UserPromptSubmit, Stop, SubagentStop. PreToolUse fires before any tool invocation and can block; after a tool runs, exactly one of PostToolUse (success) or PostToolUseFailure fires. In Claude Code a hook is a shell command reading JSON from stdin and signaling via exit codes + stdout JSON; in the Agent SDK the same events are in-process TS/Python callbacks on options.hooks. Three handler types: Command (shell), Prompt (single-turn LLM eval), Agent (subagents with tool access). Exit code 2 in PreToolUse blocks the tool call; stderr is surfaced to the model as the block reason. Lifecycle covers session management, tool execution, subagent coordination, context management.

## Query 2: "agent harness streaming events partial tool call handling design"

Results:
- Inside the Agent Harness: How Codex and Claude Code Actually Work | Jonathan Fulton | Medium (Apr 2026) — https://medium.com/jonathans-musings/inside-the-agent-harness-how-codex-and-claude-code-actually-work-63593e26c176
- Tool streaming | Streaming | Mastra Docs — https://mastra.ai/docs/streaming/tool-streaming
- Your Agent Needs a Harness, Not a Framework - Inngest Blog — https://www.inngest.com/blog/your-agent-needs-a-harness-not-a-framework
- The Anatomy of an Agent Harness - LangChain Blog — https://www.langchain.com/blog/the-anatomy-of-an-agent-harness
- What is an Agent Harness? A Hands-On Guide With AgentCore harness - DEV Community — https://dev.to/aws/what-is-an-agent-harness-a-hands-on-guide-with-agentcore-harness-1h33
- Agentic Harness System Design: Build, Configure, Use — https://www.decodingai.com/p/agentic-harness-system-design
- Streaming & Real-Time Output — Agent Mastered — https://agentmastered.com/extending-claude/stream-protocol/

Key notes: Streaming returns structured events: OutputItemDone, ToolCallInputDelta, ReasoningContentDelta, etc. Harness parses these to update UI in real time and detect when tool execution is needed. Partial tool calls: UIs listen for tool_input_start, tool_input_delta, tool_input_end to render args as they stream (e.g., show file path/command before complete tool call). Use a partial JSON parser on accumulated argsTextDelta fragments to extract usable values before JSON is complete. Enables live diff previews for edit tools, streaming file content for write tools, instant display of search patterns/paths. Event flow: assistant event with tool_use content, then user event with tool result; cycle repeats per tool invocation before final assistant response.

## Query 3: "Anthropic streaming messages API tool_use input_json_delta content_block events"

Results:
- AnthropicApi.ContentBlock.Type (Spring AI 1.1.7 API) — https://docs.spring.io/spring-ai/docs/current/api/org/springframework/ai/anthropic/api/AnthropicApi.ContentBlock.Type.html
- anthropic/streaming · anthropic_gleam · v0.1.1 — https://hexdocs.pm/anthropic_gleam/anthropic/streaming.html
- vllm.entrypoints.anthropic.protocol — https://docs.vllm.ai/en/v0.12.0/api/vllm/entrypoints/anthropic/protocol/
- @langchain/anthropic streaming leaves input_json_delta chunks in AIMessage content, breaking checkpoint resume · Issue #9798 (langchainjs) — https://github.com/langchain-ai/langchainjs/issues/9798
- How to Stream Anthropic API Responses: Step-by-Step Production Guide | Markaicode — https://markaicode.com/howto/how-to-stream-anthropic-api-responses/
- Streaming messages - Claude API Docs — https://docs.anthropic.com/en/api/messages-streaming
- Streaming responses interrupted mid-transmission - connection closes without message_stop event · Issue #842 (anthropic-sdk-typescript) — https://github.com/anthropics/anthropic-sdk-typescript/issues/842
- Claude API Reference | RockAPI Docs — https://www.rockapi.ru/docs/en/claude-api-reference/

Key notes: Messages API streaming event types: message_start, content_block_start, content_block_delta, content_block_stop, message_delta, message_stop, ping, error. input_json_delta = tool use input partial JSON delta; tokens arrive with event.type == content_block_delta and event.delta.type == input_json_delta. Deltas for tool_use blocks update the input field; deltas are partial JSON strings, final tool_use.input is always an object. Accumulate string deltas and parse once content_block_stop received (partial JSON parsing libs / SDK helpers for incremental parsed values). Each content block: content_block_start, possibly multiple content_block_delta, content_block_stop. Edge case (Issue #842): connection can close without a message_stop event — harness must handle.

## Query 4: "agent harness interrupt cancellation abort design streaming long-running tool"

Results:
- Swarm management in agent harnesses: owning long-running agents - Arize AI — https://arize.com/blog/swarm-management-of-agent-harnesses/
- GitHub - ai-boost/awesome-harness-engineering — https://github.com/ai-boost/awesome-harness-engineering
- The Anatomy of an Agent Harness - by Avi Chawla — https://blog.dailydoseofds.com/p/the-anatomy-of-an-agent-harness
- Agent - AgentScope — https://doc.agentscope.io/tutorial/task_agent.html
- Harness capabilities - Docs by LangChain — https://docs.langchain.com/oss/python/deepagents/harness
- GitHub - anthropics/cwc-long-running-agents — https://github.com/anthropics/cwc-long-running-agents
- Building AI Coding Agents for the Terminal: Scaffolding, Harness, Context Engineering, and Lessons Learned (arXiv) — https://arxiv.org/html/2603.05344v1
- Orchestral AI: A Framework for Agent Orchestration (arXiv) — https://arxiv.org/pdf/2601.02577
- Agent loop · OpenClaw — https://docs.openclaw.ai/concepts/agent-loop

Key notes: Core harness feature is a loop over tools; Claude Agent SDK exposes it via query() returning an async iterator streaming messages. Interrupt tokens propagate cancellation from UI to agent thread, polled at six phase boundaries per iteration (before/after thinking, before action, during tool execution, at iteration boundaries). Ctrl+C in terminal or agent.interrupt() method. A real swarm manager must steer, interrupt, kill, cascade. One pattern: halt every tool call while an AGENT_STOP file exists; surface STEER.md to the agent once then clear it to redirect mid-run without restarting. Layered termination conditions: no tool calls in response, max turn limit, token budget exhausted, guardrail tripwire, user interrupt, safety refusal.
