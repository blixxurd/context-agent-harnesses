# Source Index

Crosswalk for the primary sources behind the guide. Each row joins the **citation key** used in [`../../docs/agent-harness-best-practices.md`](../../docs/agent-harness-best-practices.md) to the **fetched source file** in this directory, the original **URL**, the **claim count** in [`../claims/verified-claims.json`](../claims/verified-claims.json), and the **research angle** (`topic`) in [`../search/`](../search/) that surfaced it.

> Join keys for agents: a claim's `sourceId` (in [`../claims/verified-claims.json`](../claims/verified-claims.json)) matches a row's **File**; its `sourceUrl` matches a row's **URL**; the guide cites by **Key** (resolved to URLs at the foot of the guide). The **Topic** column is the dominant research angle for that source — individual claims also carry finer-grained `topic` tags. Machine-readable version of this table: [`sources.json`](sources.json).


## Anthropic — engineering & research

| Key | File | Claims | Topic (search angle) | Title / URL |
|---|---|---|---|---|
| `[be]` | [`source-00.md`](source-00.md) | 6 | `core-agentic-loop` | [Building Effective AI Agents — Anthropic](https://www.anthropic.com/research/building-effective-agents) |
| `[wt]` | [`source-01.md`](source-01.md) | 6 | `tool-design-and-result-contract` | [Writing effective tools for AI agents—using AI agents (Anthropic Engineering)](https://www.anthropic.com/engineering/writing-tools-for-agents) |
| `[ce]` | [`source-02.md`](source-02.md) | 6 | `context-window-and-memory` | [Effective context engineering for AI agents — Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) |
| `[ma]` | [`source-19.md`](source-19.md) | 6 | `subagents-and-orchestration` | [How we built our multi-agent research system | Anthropic](https://www.anthropic.com/engineering/multi-agent-research-system) |
| `[contain]` | [`source-05.md`](source-05.md) | 6 | `permissions-and-sandboxing` | [How we contain Claude across products - Anthropic Engineering](https://www.anthropic.com/engineering/how-we-contain-claude) |
| `[ev]` | [`source-13.md`](source-13.md) | 7 | `evaluation-and-testing` | [Demystifying evals for AI agents — Anthropic Engineering](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) |
| `[bsdk]` | [`source-15.md`](source-15.md) | 6 | `agent-loop-architecture` | [Building agents with the Claude Agent SDK - Anthropic Engineering](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk) |
| `[tw]` | [`source-21.md`](source-21.md) | 6 | `safety-guardrails` | [Trustworthy Agents in Practice — Anthropic](https://www.anthropic.com/research/trustworthy-agents) |
| `[cm]` | [`source-17.md`](source-17.md) | 6 | `context-window-and-memory` | [Managing Context on the Claude Developer Platform — Anthropic](https://www.anthropic.com/news/context-management) |

## Claude Agent SDK & API docs

| Key | File | Claims | Topic (search angle) | Title / URL |
|---|---|---|---|---|
| `[loop]` | [`source-16.md`](source-16.md) | 7 | `core-agentic-loop` | [How the agent loop works — Claude Code Docs](https://code.claude.com/docs/en/agent-sdk/agent-loop) |
| `[ct]` | [`source-04.md`](source-04.md) | 6 | `claude-agent-sdk-specifics` | [Give Claude custom tools — Claude Agent SDK Docs](https://code.claude.com/docs/en/agent-sdk/custom-tools) |
| `[perm]` | [`source-10.md`](source-10.md) | 6 | `permissions-and-sandboxing` | [Configure permissions (Handling Permissions - Claude Agent SDK Docs)](https://code.claude.com/docs/en/agent-sdk/permissions) |
| `[sa]` | [`source-24.md`](source-24.md) | 6 | `subagents-and-orchestration` | [Subagents in the SDK - Claude API Docs](https://code.claude.com/docs/en/agent-sdk/subagents) |
| `[obs]` | [`source-12.md`](source-12.md) | 4 | `observability-tracing-logging` | [Observability with OpenTelemetry - Claude Code Docs](https://code.claude.com/docs/en/agent-sdk/observability) |
| `[ts]` | [`source-09.md`](source-09.md) | 7 | `claude-agent-sdk-specifics` | [Agent SDK reference - TypeScript - Claude API Docs](https://code.claude.com/docs/en/agent-sdk/typescript) |
| `[ov]` | [`source-14.md`](source-14.md) | 6 | `claude-agent-sdk-specifics` | [Agent SDK overview - Claude API Docs](https://code.claude.com/docs/en/agent-sdk/overview) |
| `[sb]` | [`source-20.md`](source-20.md) | 6 | `permissions-and-sandboxing` | [Configure the sandboxed Bash tool - Claude Code Docs](https://code.claude.com/docs/en/sandboxing) |
| `[mt]` | [`source-22.md`](source-22.md) | 6 | `context-window-and-memory` | [Memory tool — Claude Docs](https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool) |
| `[xml]` | [`source-23.md`](source-23.md) | 6 | `system-prompt-and-instructions` | [Use XML tags to structure your prompts — Claude Docs](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags) |
| `[st]` | [`source-11.md`](source-11.md) | 7 | `streaming-and-lifecycle-hooks` | [Streaming messages - Claude API Docs](https://docs.anthropic.com/en/api/messages-streaming) |

## Other practitioners

| Key | File | Claims | Topic (search angle) | Title / URL |
|---|---|---|---|---|
| `[dm]` | [`source-18.md`](source-18.md) | 6 | `subagents-and-orchestration` | [Don't Build Multi-Agents | Cognition](https://cognition.ai/blog/dont-build-multi-agents) |
| `[guardrails]` | [`source-07.md`](source-07.md) | 6 | `safety-guardrails` | [Guardrails — OpenAI Agents SDK](https://openai.github.io/openai-agents-python/guardrails/) |
| `[da]` | [`source-08.md`](source-08.md) | 6 | `project-file-structure` | [Harness capabilities - Docs by LangChain (deepagents)](https://docs.langchain.com/oss/python/deepagents/harness) |
| `[ah]` | [`source-03.md`](source-03.md) | 4 | `system-prompt-and-instructions` | [awesome-harness-engineering — GitHub](https://github.com/ai-boost/awesome-harness-engineering) |
| `[lr]` | [`source-06.md`](source-06.md) | 6 | `project-file-structure` | [Effective harnesses for long-running agents — Anthropic Engineering](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) |

## Supplementary (referenced, not cited by a key in the guide)

| File | Claims | Title / URL |
|---|---|---|
| [`source-25.md`](source-25.md) | 0 | [Semantic Conventions for GenAI agent and framework spans | OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/) |
