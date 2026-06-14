# Agent Harness Best Practices

> A practitioner's guide to building the **harness** — the runtime/agentic loop that
> wraps an LLM and turns it into an autonomous agent. Language-agnostic principles,
> with the **Anthropic Claude Agent SDK** as the primary concrete reference and
> runnable TypeScript + Python examples.

This document synthesizes **150 adversarially-verified claims** drawn from **25 primary
sources** (Anthropic engineering & SDK docs, Cognition, OpenAI, LangChain). Every
section links to the code samples that demonstrate it and to the sources behind it.
The raw research — search dumps, fetched source text, the claim ledger, and the
machine-readable digest — lives in [`../raw_outputs/`](../raw_outputs/) (start with its
[`README`](../raw_outputs/README.md) and the [source index](../raw_outputs/sources/INDEX.md)).

## Contents

- [0. What a harness is, and why it's the lever](#s0)
- [1. The agentic loop](#s1)
- [2. Tool design & the tool-result contract](#s2)
- [3. Context window & memory management](#s3)
- [4. System prompts & instructions](#s4)
- [5. Subagents & multi-agent orchestration](#s5)
- [6. Permissions, sandboxing & safety guardrails](#s6)
- [7. Human-in-the-loop & lifecycle hooks](#s7)
- [8. Error handling, resilience & streaming](#s8)
- [9. Observability, tracing & logging](#s9)
- [10. Evaluation & testing](#s10)
- [11. Project & file structure for long-running agents](#s11)
- [12. Claude Agent SDK specifics](#s12)
- [Quick decision cheat-sheet](#quick-decision-cheat-sheet) · [Top anti-patterns](#top-anti-patterns) · [Sources](#sources)

> Stable anchors: each numbered section has a short id (`#s0`…`#s12`) that survives
> title edits. Code samples and [`../index.json`](../index.json) link to these.

---

<a id="s0"></a>
## 0. What a harness is, and why it's the lever

An agentic system has **four components**: the **model**, the **tools**, the
**environment** it runs in, and the **harness** that ties them together. The harness
owns the loop, the instructions, and the guardrails. A useful framing from the field:

> *"The harness, not the model, is the primary lever for agent reliability. Every
> harness component assumes the model can't do something — and those assumptions
> expire as models improve."*

So the meta-principle is: **build the thinnest harness that makes today's model
reliable, and design it so you can delete scaffolding as models get better.** Don't
hard-code around weaknesses in ways you can't easily remove.

Two distinctions to get straight before anything else
([Building Effective Agents][be]):

- **Workflows** orchestrate LLMs and tools through *predefined code paths*. Predictable,
  testable, cheap. Use them whenever the control flow is known up front.
- **Agents** let the *model* dynamically direct its own process and tool use. Flexible,
  but less predictable and more expensive.

> **Pick the simplest thing that works.** Reach for an autonomous agent only when the
> task genuinely needs open-ended, model-driven control flow. Many "agent" problems are
> really workflows with one or two agentic steps.

---

<a id="s1"></a>
## 1. The agentic loop

**Principle.** An agent is a thin control layer around a repeating cycle:
**gather context → take action (tools) → verify → repeat**, until the model emits a
response with *no* tool calls. ([agent-loop][loop], [be][be])

**Key practices**

- **The loop runs turns autonomously without yielding to the caller.** One turn =
  model output (text and/or tool calls) → harness executes tools → results feed back.
  It ends when the model produces output with no tool calls. ([loop][loop])
- **Always bound the loop in production.** This is the single most important guardrail.
  - `maxTurns` caps tool-use round trips (it counts tool-use turns only).
  - `maxBudgetUsd` caps spend and yields the result subtype `error_max_budget_usd`.
  - **A USD budget is the recommended default for production agents.** ([loop][loop])
- **Handle every result subtype.** `success | error_max_turns | error_max_budget_usd |
  error_during_execution | error_max_structured_output_retries`. The final `result`
  text exists **only** on `success`; cost/usage/turns/session-id are present on *all*
  subtypes. ([loop][loop])
- **Iterate the message stream to completion** — don't `break` on the result message;
  a few trailing system events (e.g. `prompt_suggestion`) can arrive after it.
- **Give the model room to think**, and keep tool/response formats close to
  naturally-occurring text (avoid making it count lines or hand-escape). ([be][be])

→ Code: [`typescript/01-minimal-agent-loop.ts`](../code_samples/typescript/01-minimal-agent-loop.ts),
[`typescript/03-agent-sdk-quickstart.ts`](../code_samples/typescript/03-agent-sdk-quickstart.ts),
[`python/01_minimal_agent_loop.py`](../code_samples/python/01_minimal_agent_loop.py)

---

<a id="s2"></a>
## 2. Tool design & the tool-result contract

**Principle.** The **agent-computer interface (ACI)** — your tools — matters *more than
the prompt*. On SWE-bench, teams spent more effort optimizing tools than the prompt;
one tool-description-rewriting pass cut task-completion time **~40%**. ([writing-tools][wt],
[be][be], [multi-agent][ma])

**Key practices**

- **Consolidate tools around workflows, not API endpoints.** One `schedule_event` beats
  `list_users` + `list_events` + `create_event`. Minimize functional overlap between
  tools. ([wt][wt], [context-eng][ce])
- **Error-proof arguments (poka-yoke).** Constrain the schema so whole classes of
  mistakes are impossible — e.g. switching to **absolute filepaths** eliminated a class
  of model errors on SWE-bench. Use enums, formats, and ranges. ([be][be])
- **Return errors as data, never throw.** An uncaught handler exception **stops the loop**
  and fails the query. Returning `isError: true` (Python `is_error: True`) keeps the loop
  running so the model can retry, switch tools, or explain. ([wt][wt], [custom-tools][ct])
- **Bound tool output.** Claude Code caps tool responses at **25,000 tokens**. Expose a
  `response_format` enum (`concise` vs `detailed`) and let the model trade detail for
  tokens (one example: 72 vs 206 tokens). ([wt][wt])
- **Name for a junior developer.** Namespace related tools (`asana_projects_search`);
  name params unambiguously (`user_id`, not `user`); document each tool's purpose, when
  to use it, and gotchas. Test tools in a workbench. ([wt][wt])
- **`readOnlyHint` enables parallelism.** Read-only tools can run concurrently; custom
  tools default to **sequential** and must opt in via the annotation. Keep annotations
  honest — they're metadata, not enforcement. ([ct][ct], [loop][loop])
- **Every tool definition costs context on *every* turn.** With many tools, load them on
  demand via tool search rather than preloading all schemas. ([ct][ct], [ce][ce])
- **Python gotcha:** the `@tool` decorator forwards only `content` and `is_error`. To
  return `structuredContent`, run a standalone MCP server, not the in-process one. ([ct][ct])

→ Code: [`typescript/02-tool-result-contract.ts`](../code_samples/typescript/02-tool-result-contract.ts),
[`typescript/04-custom-tools-mcp.ts`](../code_samples/typescript/04-custom-tools-mcp.ts),
[`python/02_tool_contract.py`](../code_samples/python/02_tool_contract.py)

---

<a id="s3"></a>
## 3. Context window & memory management

**Principle.** Context is a **finite, degrading budget.** Attention cost scales ~n² and
quality drops as the window fills ("context rot", measurable via needle-in-a-haystack).
The harness's job is to keep the smallest high-signal token set in front of the model.
([context-eng][ce])

**Key practices**

- **Prefer just-in-time retrieval.** Hold lightweight references (file paths, URLs, ids)
  and load content at runtime. Favor **agentic search** (grep/glob/tail) as primary and
  semantic search as secondary. ([context-eng][ce], [building-sdk][bsdk])
- **Compaction** summarizes old history — preserve decisions, drop redundant tool output.
  The SDK does this automatically and emits a `compact_boundary` system message; getting
  a hand-rolled compression LLM right is hard. ([context-eng][ce], [dont-multi][dm], [loop][loop])
- **Context editing** auto-removes stale tool calls/results. Measured in a 100-turn web
  search test: **+29%** alone, **+39%** with the memory tool, **−84% tokens**. ([context-mgmt][cm])
- **The memory tool** (`memory_20250818`) is a client-side `/memories` file system with
  six commands (`view/create/str_replace/insert/delete/rename`). You implement the
  handler — **validate path traversal** (`..` and `%2e%2e%2f`), cap file sizes, and cap
  views (it errors above 999,999 lines). ([memory-tool][mt])
- **Put durable RULES in `CLAUDE.md` / `AGENTS.md`.** They're re-injected into the system
  prompt every turn and **survive compaction** — unlike instructions buried in the first
  user message. ([loop][loop], [awesome][ah])
- **Tell the agent context auto-compacts** so it saves progress to memory near the limit
  instead of stopping early. Preserve `thinking` blocks when returning tool results. ([xml][xml], [ah][ah])

→ Code: [`typescript/07-context-and-memory.ts`](../code_samples/typescript/07-context-and-memory.ts)

---

<a id="s4"></a>
## 4. System prompts & instructions

**Principle.** Aim for the **right altitude** — specific enough to be useful, general
enough not to be brittle. Avoid both hard-coded if/else logic *and* vague hand-waving.
([context-eng][ce])

**Key practices**

- **Structure with XML-style tags** per content type; wrap few-shot examples in tags and
  use **3–5** of them. ([xml][xml])
- **For 20k+ token inputs, put long documents at the top and the query at the end** — up
  to a **30%** quality gain. ([xml][xml])
- **On recent models, use normal phrasing.** Heavy-handed `CRITICAL`/`MUST` can
  over-trigger; calibrate to your model. (Also note: prefilled last-assistant-turn
  responses were removed in newer releases — a hard error.) ([xml][xml])
- **The system prompt owns durable instructions and guardrails** — but authorization
  belongs in *code*, not prose (see §6).

→ Demonstrated throughout the `query()` examples
([`03-agent-sdk-quickstart.ts`](../code_samples/typescript/03-agent-sdk-quickstart.ts)).

---

<a id="s5"></a>
## 5. Subagents & multi-agent orchestration

**Principle.** **Single-threaded, linear agents are the most reliable production
default.** Multi-agent buys speed and breadth for read-heavy work, at a real cost in
tokens and consistency. Don't reach for it reflexively. ([dont-multi][dm], [ma][ma])

**Key practices**

- **Know the trade.** A multi-agent research system (Opus lead + Sonnet subagents) beat
  single-Opus by **90.2%** on a research eval — but used **~15× the tokens** of a chat
  (single agents ~4×). Parallelizing spin-up and tool calls cut research time up to
  **90%**. ([ma][ma])
- **Scale effort to complexity.** Simple lookup → 1 agent, 3–10 calls. Comparison → 2–4
  subagents, 10–15 calls. Open-ended research → 10+ subagents, clearly divided. ([ma][ma])
- **Subagents isolate context.** Each starts a fresh conversation; only its final message
  returns to the parent. The **only** parent→subagent channel is the prompt string, so
  put everything the subagent needs *in the prompt*. Restrict each subagent's tools with
  the `tools` field. ([subagents][sa], [loop][loop])
- **Share full context/traces, not thin task summaries**, among collaborating agents —
  otherwise they make conflicting decisions. Prefer to **unify decision-making and
  action** in one agent; Claude Code restricts its subtasks to *sequential,
  investigation-only* work for this reason. ([dont-multi][dm])
- **Mechanics:** auto-approving subagent spawning needs `Agent` in `allowedTools`;
  messages carry `parent_tool_use_id`. For orchestrating *hundreds* of agents
  deterministically, use the Workflow tool (TS SDK v0.3.149+). ([overview][ov], [sa][sa])

→ Code: [`typescript/05-subagents-orchestration.ts`](../code_samples/typescript/05-subagents-orchestration.ts)

---

<a id="s6"></a>
## 6. Permissions, sandboxing & safety guardrails

**Principle.** **Encode authorization in harness *code*, not in the prompt.** A prompt is
a request; a permission rule is a guarantee. Layer defenses — no single check is enough.
([awesome][ah], [permissions][perm], [contain][contain])

**The permission pipeline (fixed, ordered).** Memorize it: ([perm][perm])

1. **Hooks** — can deny outright or pass through.
2. **Deny rules** — block in *every* mode, including `bypassPermissions`.
3. **Ask rules** — force a prompt (or deny, in `dontAsk` mode).
4. **Permission mode** — `default | acceptEdits | plan | dontAsk | auto | bypassPermissions`.
5. **Allow rules** — pre-approve.
6. **`canUseTool` callback** — your runtime decision for anything left.

**Critical gotchas**

- **`allowedTools` does NOT constrain `bypassPermissions`.** To block a tool under bypass,
  use a **deny rule** (`disallowedTools`). Pair `allowedTools` with `dontAsk` for a
  locked-down surface. ([perm][perm])
- A **bare** deny like `Bash` removes the tool from context; a **scoped** deny like
  `Bash(rm *)` leaves it available but blocks matching calls. ([perm][perm])
- `acceptEdits` auto-approves edits/fs commands **only inside** the working dir or
  `additionalDirectories`. ([perm][perm])
- **Subagents inherit `bypassPermissions`/`acceptEdits`/`auto` and you can't override it
  per subagent** — bypass = full autonomous system access. ([perm][perm])

**Sandboxing & containment** ([sandboxing][sb], [contain][contain])

- **Human approval rubber-stamps (~93% approval rate).** OS sandboxes
  (Seatbelt on macOS, bubblewrap on Linux) cut permission prompts **~84%**. An automated
  classifier blocks ~0.4% of benign calls but misses ~17% of overeager ones — so it's
  **one layer, not the layer**.
- Default sandbox posture: write only to CWD + TMPDIR; reads cover the whole machine
  unless you add `denyRead` (creds/ssh are readable unless blocked); no pre-allowed
  network domains.
- Containment hard-won lessons: **defer parsing project-local config until after the
  trust prompt**; **resolve symlinks before path validation**; use a **MITM egress proxy
  bound to the session token** (destination allowlists alone allowed exfiltration via
  domain-fronting).
- Layer **prompt-injection defenses** (training + monitoring + red-teaming); expose
  per-tool `allow/approve/block` states. ([trustworthy][tw])

→ Code: [`typescript/06-permissions-and-hooks.ts`](../code_samples/typescript/06-permissions-and-hooks.ts)

---

<a id="s7"></a>
## 7. Human-in-the-loop & lifecycle hooks

**Principle.** Hooks are deterministic code that runs at fixed points in the loop —
**in your process, costing no context** — to validate, audit, block, or inject. ([loop][loop])

**Key practices**

- **Hook events:** `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Stop`,
  `SubagentStart/Stop`, `PreCompact`. A `PreToolUse` hook that rejects a call prevents
  execution, and the model receives the rejection (and adapts). ([loop][loop])
- **Plan Mode** surfaces the full action plan for approval before execution. ([tw][tw])
- **Pause before risky tools** (e.g. an `interrupt_on` for every edit). Agents roughly
  double their check-in rate on complex tasks when given the affordance. ([deepagents][da], [tw][tw])
- **Track work explicitly** with a todo list (pending/in-progress/completed) the agent
  maintains in state. ([da][da])

→ Code: [`typescript/06-permissions-and-hooks.ts`](../code_samples/typescript/06-permissions-and-hooks.ts)
(hooks + `canUseTool`)

---

<a id="s8"></a>
## 8. Error handling, resilience & streaming

**Principle.** Agents are long-running and talk to flaky networks. Build for retries,
timeouts, and partial failures — and reassemble streamed output correctly.

**Resilience**

- The SDK retries transient API errors: `CLAUDE_CODE_MAX_RETRIES` (default **10**),
  `API_TIMEOUT_MS` (default **600000** = 10 min). Tune per workload. ([ts-ref][ts])
- Tool failures should be **data, not exceptions** (see §2). A thrown handler aborts the
  whole query. ([ct][ct])

**Streaming** ([streaming][st])

- Lifecycle: one `message_start` (empty content) → per block
  `content_block_start` / `delta(s)` / `stop` → `message_delta(s)` → one `message_stop`.
  **Reassemble blocks by index.**
- Accumulate `tool_use` `input_json_delta` fragments and **parse only after**
  `content_block_stop` — mid-stream it isn't valid JSON.
- `usage` in `message_delta` is **cumulative** — use the latest, don't sum.
- `thinking` blocks emit `signature_delta` (integrity) — keep it.
- An interrupted stream **cannot recover** tool_use/thinking blocks; resume only from the
  last completed text block. Handle unknown event types gracefully.

→ Code: [`typescript/08-streaming.ts`](../code_samples/typescript/08-streaming.ts)

---

<a id="s9"></a>
## 9. Observability, tracing & logging

**Principle.** You can't improve an agent you can't see. Non-deterministic, long-running
systems demand structured telemetry. ([observability][obs])

**Key practices**

- SDK telemetry is **off by default**: set `CLAUDE_CODE_ENABLE_TELEMETRY=1` plus an
  exporter. **Traces** also need `OTEL_TRACES_EXPORTER` and
  `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1`; metrics/logs don't need the beta flag.
- Default export intervals: **60s** metrics, **5s** traces/logs — lower to ~1000ms for
  short-lived calls or you'll lose data on exit.
- **Agent content is not logged by default** (privacy). Opt in deliberately:
  `OTEL_LOG_USER_PROMPTS`, `OTEL_LOG_TOOL_DETAILS`, `OTEL_LOG_TOOL_CONTENT` (60 KB cap),
  `OTEL_LOG_RAW_API_BODIES`.
- Add app-level structured (JSON) events around your own loop for the dimensions OTEL
  won't capture: per-tool latency, business outcomes, denial counts.

→ Code: [`typescript/09-observability.ts`](../code_samples/typescript/09-observability.ts)

---

<a id="s10"></a>
## 10. Evaluation & testing

**Principle.** **Grade outcomes, not paths.** Start small with real failures, isolate
trials, and measure *consistency*, not just peak capability. ([demystifying][ev], [bsdk][bsdk])

**Key practices**

- **Start with 20–50 tasks** from real failures. Early effect sizes are large
  (30%→80%) — you don't need thousands. A **0% pass@100** almost always means a broken
  task or grader, not a broken agent. ([ev][ev], [ma][ma])
- **Isolate every trial** in a clean environment to avoid correlated,
  infrastructure-driven failures. ([ev][ev])
- **Grade outcomes, not tool-call paths** — path-checking is brittle; there are many
  valid routes to a correct result. ([ev][ev])
- **Separate capability evals** (start low — a hill to climb) **from regression evals**
  (must stay near 100%). Use **pass^k** for consistency: a 0.75 pass-rate is only
  0.75³ ≈ **42%** pass^3. ([ev][ev])
- **Calibrate LLM-as-judge to humans**, give it an **"Unknown"** option, and use
  per-dimension rubric judges. Verify with a mix of rules-based, visual (screenshot),
  and LLM-as-judge feedback. ([ev][ev], [bsdk][bsdk])

→ Code: [`typescript/10-eval-harness.ts`](../code_samples/typescript/10-eval-harness.ts)

---

<a id="s11"></a>
## 11. Project & file structure for long-running agents

**Principle.** For long-running or resumable agents, externalize state and requirements
to the filesystem so the harness can recover, resume, and verify. ([long-running][lr])

**Key practices**

- **Bootstrap with an `init.sh`** read every session; carry progress in a
  `claude-progress.txt` read at start and updated at end. ([lr][lr])
- **Encode requirements as a structured feature list** (e.g. a JSON file with pass/fail
  status, category, steps). Do **one feature per session**, commit via git for recovery,
  and mark a feature complete **only after end-to-end verification**. Never edit or remove
  tests to make them pass. ([lr][lr], [mt][mt])
- **Skills via progressive disclosure** (`SKILL.md` frontmatter loaded first, body on
  demand). Persistent `AGENTS.md` memory is always loaded. A portable `.agent/` folder
  standardizes a cross-tool harness layer. ([da][da], [ah][ah])
- **Understand availability vs permission in the SDK:** the `tools` option and *bare*
  `disallowedTools` entries change **availability** (what's in context); `allowedTools`
  and *scoped* `disallowedTools` change **permission** only. `tools: []` leaves only your
  custom MCP tools. ([ct][ct])

A reasonable layout for a harness project:

```
my-agent/
├── AGENTS.md / CLAUDE.md      # durable rules — re-injected every turn, survive compaction
├── .agent/                    # portable, cross-tool harness config
├── src/
│   ├── loop.ts                # the agentic loop / query() wrapper
│   ├── tools/                 # one module per tool; workflow-shaped
│   ├── permissions.ts         # allow/deny rules, canUseTool, hooks (authz in CODE)
│   ├── memory.ts              # memory-tool handler (path-traversal hardened)
│   └── observability.ts       # OTEL + structured logging
├── evals/
│   ├── tasks/                 # 20–50 real-failure tasks
│   └── run.ts                 # isolated trials, outcome graders, pass^k
└── .claude/settings.json      # declarative allow/deny/ask rules
```

---

<a id="s12"></a>
## 12. Claude Agent SDK specifics

- **Install:** `@anthropic-ai/claude-agent-sdk` (TS) / `claude-agent-sdk` (Python).
  Python needs **3.10+**; the TS SDK bundles a native Claude Code binary as an optional
  dependency (set `pathToClaudeCodeExecutable` if your package manager skips it). ([ts][ts], [ov][ov])
- **Core API:** `query({ prompt, options })` returns an async generator of typed messages
  (`SystemMessage`, `AssistantMessage`, `UserMessage`, `StreamEvent`, `ResultMessage`).
  `tool()` + `createSdkMcpServer()` define in-process custom tools. ([ts][ts])
- **MCP tool naming:** `mcp__{server}__{tool}`; pre-approve with that name or a
  server-scoped wildcard `mcp__{server}__*`. ([ct][ct])
- **Notable TS defaults:** `permissionMode: "default"`, `allowedTools`/`disallowedTools`
  empty, `CLAUDE_CODE_MAX_RETRIES: 10`, `API_TIMEOUT_MS: 600000`, `thinking: adaptive`
  (`maxThinkingTokens` deprecated), `persistSession: true`,
  `enableFileCheckpointing: false`. ([ts][ts])
- **Settings load** from user/project/local `.claude` paths; pass `settingSources: []`
  to disable filesystem settings entirely. ([ts][ts], [ov][ov])

> **Version note (verified against `@anthropic-ai/claude-agent-sdk@0.1.77`).** The
> published docs describe tool annotations (e.g. `readOnlyHint`) as a *5th argument* to
> `tool()`; in v0.1.77 `tool()` takes **4 arguments** and annotations are not a
> parameter — confirm the signature for your installed version. Also, `AgentDefinition.model`
> accepts **alias names** (`'sonnet' | 'opus' | 'haiku' | 'inherit'`), not full model
> ids, even though the top-level `Options.model` accepts a full id string. The code
> samples are pinned to and type-checked against this version.

→ Code: every `*-agent-sdk-*` and `*-mcp*` sample.

---

## Quick decision cheat-sheet

| Question | Default answer |
|---|---|
| Workflow or autonomous agent? | **Workflow.** Use an agent only for open-ended, model-driven control flow. ([be][be]) |
| Single agent or multi-agent? | **Single, linear.** Multi-agent only for read-heavy breadth, and budget ~15× tokens. ([dm][dm], [ma][ma]) |
| How do I stop runaway cost? | `maxTurns` **and** `maxBudgetUsd`. A USD budget is the production default. ([loop][loop]) |
| Tool failed — throw or return? | **Return `isError: true`.** Throwing kills the loop. ([ct][ct]) |
| Where does authorization live? | **In code** (deny rules + hooks + `canUseTool`), never the prompt. ([perm][perm]) |
| Want a locked tool surface? | `allowedTools` + `permissionMode: "dontAsk"`. ([perm][perm]) |
| Need to block a tool under bypass? | **Deny rule** (`disallowedTools`) — `allowedTools` won't do it. ([perm][perm]) |
| Context filling up? | JIT retrieval + compaction + context editing; durable rules in `CLAUDE.md`. ([ce][ce], [cm][cm]) |
| How do I eval? | 20–50 real tasks, isolated trials, **grade outcomes**, measure **pass^k**. ([ev][ev]) |

## Top anti-patterns

- ❌ Unbounded loop with no turn/budget cap.
- ❌ Tool handlers that `throw` on failure (kills the loop).
- ❌ Unbounded tool output dumped into context.
- ❌ Authorization expressed as prompt instructions ("don't delete files").
- ❌ Reaching for multi-agent when one linear agent would do.
- ❌ Passing thin task summaries between collaborating agents instead of full context.
- ❌ Grading agents by the tool-call path instead of the outcome.
- ❌ Trusting a single safety layer (classifier *or* human approval *or* sandbox).
- ❌ Burying durable rules in the first user message, where compaction can drop them.

---

## Sources

**Anthropic — engineering & research**
- [Building Effective Agents][be]
- [Writing tools for agents][wt]
- [Effective context engineering for AI agents][ce]
- [How we built our multi-agent research system][ma]
- [How we contain Claude (agent containment)][contain]
- [Demystifying evals for AI agents][ev]
- [Building agents with the Claude Agent SDK][bsdk]
- [Building safeguards for trustworthy agents][tw]
- [Context management (context editing + memory tool)][cm]

**Claude Agent SDK & API docs**
- [How the agent loop works][loop]
- [Give Claude custom tools][ct]
- [Configure permissions][perm]
- [Subagents][sa]
- [Observability][obs]
- [TypeScript reference][ts]
- [Overview][ov]
- [Sandboxing][sb]
- [Memory tool][mt]
- [Use XML tags / prompt engineering][xml]
- [Streaming Messages][st]

**Other practitioners**
- [Cognition — Don't build multi-agents][dm]
- [OpenAI Agents SDK — Guardrails][guardrails]
- [LangChain — deepagents harness][da]
- [awesome-harness-engineering (curated)][ah]
- [Effective harnesses for long-running agents][lr]

[be]: https://www.anthropic.com/research/building-effective-agents
[wt]: https://www.anthropic.com/engineering/writing-tools-for-agents
[ce]: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
[ma]: https://www.anthropic.com/engineering/multi-agent-research-system
[contain]: https://www.anthropic.com/engineering/how-we-contain-claude
[ev]: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
[bsdk]: https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk
[tw]: https://www.anthropic.com/research/trustworthy-agents
[cm]: https://www.anthropic.com/news/context-management
[loop]: https://code.claude.com/docs/en/agent-sdk/agent-loop
[ct]: https://code.claude.com/docs/en/agent-sdk/custom-tools
[perm]: https://code.claude.com/docs/en/agent-sdk/permissions
[sa]: https://code.claude.com/docs/en/agent-sdk/subagents
[obs]: https://code.claude.com/docs/en/agent-sdk/observability
[ts]: https://code.claude.com/docs/en/agent-sdk/typescript
[ov]: https://code.claude.com/docs/en/agent-sdk/overview
[sb]: https://code.claude.com/docs/en/sandboxing
[mt]: https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool
[xml]: https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags
[st]: https://docs.anthropic.com/en/api/messages-streaming
[dm]: https://cognition.ai/blog/dont-build-multi-agents
[guardrails]: https://openai.github.io/openai-agents-python/guardrails/
[da]: https://docs.langchain.com/oss/python/deepagents/harness
[ah]: https://github.com/ai-boost/awesome-harness-engineering
[lr]: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

---

*Generated from adversarially-verified research. Raw material (search dumps, fetched
source text, the 150-claim ledger, machine-readable digest) is in
[`../raw_outputs/`](../raw_outputs/). See [`../raw_outputs/synthesis/findings-digest.md`](../raw_outputs/synthesis/findings-digest.md)
for the granular 12-theme digest with per-claim source attribution.*
