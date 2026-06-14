# Code Samples

Runnable, didactic examples for each agent-harness best-practice theme. Each file is
heavily commented and cites the sources behind its claims. They pair with the master
guide: [`../docs/agent-harness-best-practices.md`](../docs/agent-harness-best-practices.md).

These are **teaching examples**, not a library — copy the patterns, not the package
structure. API surfaces (especially betas like context editing) evolve; comments flag
where to confirm against current docs.

> ✅ **Verified:** all 10 TypeScript samples pass `tsc --noEmit --strict` against
> `@anthropic-ai/claude-agent-sdk@0.1.77` and `@anthropic-ai/sdk@0.65`. They are
> type-checked, not executed (running makes live, billed API calls). Where the live
> SDK differs from the published docs, comments call it out — e.g. in v0.1.77 `tool()`
> takes 4 args (annotations like `readOnlyHint` are not a 5th param), and
> `AgentDefinition.model` uses alias names (`'sonnet' | 'opus' | 'haiku' | 'inherit'`),
> not full model ids.

## TypeScript (`typescript/`)

| File | Theme | Doc section |
|---|---|---|
| [`01-minimal-agent-loop.ts`](typescript/01-minimal-agent-loop.ts) | The agentic loop, from scratch (raw Messages API) | [§1](../docs/agent-harness-best-practices.md#s1) |
| [`02-tool-result-contract.ts`](typescript/02-tool-result-contract.ts) | Tool design: poka-yoke, `isError`, bounded output, `response_format` | [§2](../docs/agent-harness-best-practices.md#s2) |
| [`03-agent-sdk-quickstart.ts`](typescript/03-agent-sdk-quickstart.ts) | `query()`, options, `maxTurns`/`maxBudgetUsd`, result subtypes | [§1](../docs/agent-harness-best-practices.md#s1), [§12](../docs/agent-harness-best-practices.md#s12) |
| [`04-custom-tools-mcp.ts`](typescript/04-custom-tools-mcp.ts) | In-process MCP server, `tool()`, tool naming, `readOnlyHint` | [§2](../docs/agent-harness-best-practices.md#s2), [§12](../docs/agent-harness-best-practices.md#s12) |
| [`05-subagents-orchestration.ts`](typescript/05-subagents-orchestration.ts) | Subagents, context isolation, when (not) to go multi-agent | [§5](../docs/agent-harness-best-practices.md#s5) |
| [`06-permissions-and-hooks.ts`](typescript/06-permissions-and-hooks.ts) | Permission pipeline, `canUseTool`, hooks, deny rules | [§6](../docs/agent-harness-best-practices.md#s6), [§7](../docs/agent-harness-best-practices.md#s7) |
| [`07-context-and-memory.ts`](typescript/07-context-and-memory.ts) | Context budget, compaction, context editing, hardened memory tool | [§3](../docs/agent-harness-best-practices.md#s3) |
| [`08-streaming.ts`](typescript/08-streaming.ts) | Correct streamed-message reassembly (by index, partial JSON) | [§8](../docs/agent-harness-best-practices.md#s8) |
| [`09-observability.ts`](typescript/09-observability.ts) | OTEL env config + app-level structured tracing | [§9](../docs/agent-harness-best-practices.md#s9) |
| [`10-eval-harness.ts`](typescript/10-eval-harness.ts) | Isolated trials, outcome grading, `pass^k` | [§10](../docs/agent-harness-best-practices.md#s10) |

```bash
cd typescript
npm install @anthropic-ai/sdk @anthropic-ai/claude-agent-sdk zod
export ANTHROPIC_API_KEY=...
npx tsx 03-agent-sdk-quickstart.ts
```

## Python (`python/`)

Illustrative parallels of the most language-relevant samples (note the Python-specific
tool-schema and `structuredContent` caveats called out in the files).

| File | Theme | Doc section |
|---|---|---|
| [`01_minimal_agent_loop.py`](python/01_minimal_agent_loop.py) | The agentic loop, from scratch | [§1](../docs/agent-harness-best-practices.md#s1) |
| [`02_tool_contract.py`](python/02_tool_contract.py) | `@tool` decorator, dict vs JSON-Schema, `is_error` | [§2](../docs/agent-harness-best-practices.md#s2) |
| [`03_agent_sdk_quickstart.py`](python/03_agent_sdk_quickstart.py) | `query()` + `ClaudeAgentOptions`, result subtypes | [§1](../docs/agent-harness-best-practices.md#s1), [§12](../docs/agent-harness-best-practices.md#s12) |

```bash
cd python
python -m venv .venv && source .venv/bin/activate
pip install anthropic claude-agent-sdk   # requires Python 3.10+
export ANTHROPIC_API_KEY=...
python 03_agent_sdk_quickstart.py
```

## The one-paragraph version

An agent is a **bounded loop** (`maxTurns` + `maxBudgetUsd`) around a model that calls
**well-designed tools** (workflow-shaped, poka-yoke'd args, errors-as-data, bounded
output). Treat **context as a finite budget** (JIT retrieval, compaction, durable rules
in `CLAUDE.md`). Keep authorization **in code** (deny rules + hooks + `canUseTool`), not
the prompt. Default to a **single linear agent**; go multi-agent only for read-heavy
breadth. **Observe everything**, and **evaluate by outcomes** with isolated trials and
`pass^k`.
