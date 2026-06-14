---
name: agent-harness
description: >-
  Building or reviewing agent-harness code — the agentic loop, tool design, context
  and memory management, system prompts, subagents and multi-agent orchestration,
  permissions/sandboxing and safety, lifecycle hooks, error handling and resilience,
  streaming, observability, or evaluation — and decisions like workflow-vs-agent and
  single-vs-multi-agent. Use when writing, debugging, or reviewing the runtime loop
  around an LLM (especially with the Claude Agent SDK).
---

# Agent Harness Best Practices — cited reference

A fact-checked reference on building agent **harnesses** (the runtime/agentic loop that
wraps an LLM), bundled with this plugin. It is built from 25 primary sources and 150
adversarially-verified claims. **Don't dump the whole guide into context — route to the
one relevant section and read only that.**

## How to use it

1. **Route first.** Read the navigation manifest — it pre-joins each guide section
   (stable ids `#s0`–`#s12`) to its code samples and primary sources, so you can find
   what backs a topic in one lookup:

   `${CLAUDE_PLUGIN_ROOT}/index.json`

   Pick the section whose `title` matches the task; note its `lines` range and `samples`.

2. **Read just that section** (use the `lines` range — do not load the whole file):

   `${CLAUDE_PLUGIN_ROOT}/docs/agent-harness-best-practices.md`

   Each section is self-contained: principle → concrete practices → inline citations →
   a `→ Code:` pointer to its runnable sample.

3. **Open the sample** the section points to, under `${CLAUDE_PLUGIN_ROOT}/code_samples/`
   (TypeScript is primary; Python parallels exist for the first three themes).

4. **For provenance**, resolve a citation key (e.g. `[be]`, `[wt]`, `[ce]`) to its source
   via `${CLAUDE_PLUGIN_ROOT}/raw_outputs/sources/INDEX.md`. Per-claim evidence (the exact
   supporting quote and verification votes) is in
   `${CLAUDE_PLUGIN_ROOT}/raw_outputs/claims/verified-claims.json` — a heavy file, so load
   it only when you specifically need claim-level provenance.

For fast "what should I do here?" decisions, jump straight to the **Quick decision
cheat-sheet** and **Top anti-patterns** near the end of the guide.

## Fallback if the bundled files aren't reachable

Fetch the same files from the public repo with WebFetch instead:

- Manifest: `https://raw.githubusercontent.com/blixxurd/context-agent-harnesses/main/index.json`
- Guide: `https://raw.githubusercontent.com/blixxurd/context-agent-harnesses/main/docs/agent-harness-best-practices.md`
- Source index: `https://raw.githubusercontent.com/blixxurd/context-agent-harnesses/main/raw_outputs/sources/INDEX.md`
