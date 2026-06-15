# Agent Harness Best Practices

Research, code samples, and a master guide on building **agent harnesses** — the
runtime/agentic loop that wraps an LLM and turns it into an autonomous agent.
Language-agnostic principles with the **Claude Agent SDK** as the concrete reference;
code examples in TypeScript (primary) and Python.

Intended as durable context for humans **and** other AI agents working on harness code.

## Start here

📖 **[`docs/agent-harness-best-practices.md`](docs/agent-harness-best-practices.md)** —
the master guide. 12 themed sections + a decision cheat-sheet + anti-patterns, every
claim cited, each linked to a runnable sample.

💻 **[`code_samples/`](code_samples/)** — runnable, heavily-commented examples, one per
theme (TypeScript + Python). See the [code samples index](code_samples/README.md).

📦 **[`raw_outputs/`](raw_outputs/)** — the raw research this was built from.

📐 **[`docs/llm-navigable-repo-playbook.md`](docs/llm-navigable-repo-playbook.md)** — a
domain-agnostic playbook for emulating this repo's structure: the patterns that make it
cheap for an LLM agent to navigate, with a copyable template and checklist.

## Use it as a Claude Code plugin

This repo is also a [Claude Code](https://code.claude.com/docs/en/plugins) plugin: it
ships a skill that routes Claude through the bundled guide, samples, and sources on
demand (it navigates the manifest and reads only the relevant section — it does not load
the whole guide into context). Install it in any project:

```
/plugin marketplace add blixxurd/fidget-marketplace
/plugin install agent-harness@fidget
```

The skill then auto-triggers on agent-harness work (the loop, tool design, context,
permissions, subagents, evals, …). Packaging lives in
[`.claude-plugin/`](.claude-plugin/) and [`skills/`](skills/); the content stays in
`docs/`, `code_samples/`, and `raw_outputs/` — a single source of truth.

## How it was built

A deep-research workflow fanned out across **13 angles**, ran parallel web searches,
fetched and saved **25 primary sources**, extracted **154 falsifiable claims**, and put
each through **3-vote adversarial verification** (a claim survived only if fewer than 2
of 3 skeptics refuted it). **150 claims survived** and were synthesized into the digest
and this guide. Sources are overwhelmingly primary: Anthropic engineering & SDK docs,
Cognition, OpenAI, and LangChain.

```
.
├── README.md                         # you are here
├── llms.txt                          # LLM-friendly index (llmstxt.org convention)
├── index.json                        # machine-readable manifest: section ↔ sample ↔ source
├── AGENTS.md                         # orientation + ground rules for agents/humans
├── LICENSE                           # MIT
├── docs/
│   └── agent-harness-best-practices.md   # the master guide
├── code_samples/
│   ├── README.md                     # index mapping samples → doc sections
│   ├── typescript/                   # 10 samples (primary), type-checked
│   └── python/                       # 3 illustrative parallels
├── raw_outputs/                      # raw research material
│   ├── README.md                     # provenance pipeline + join keys
│   ├── search/                       # 13 per-angle search dumps
│   ├── sources/                      # 26 fetched source pages (full text)
│   │   ├── INDEX.md                  # citation key ↔ source file ↔ URL ↔ claims
│   │   └── sources.json              # machine-readable crosswalk
│   ├── claims/verified-claims.json   # 150 survivors + 4 dropped, with sourceId
│   └── synthesis/
│       ├── findings-digest.md        # granular 12-theme cited digest
│       └── themes.json               # machine-readable themes
└── .github/workflows/typecheck.yml   # CI: tsc --noEmit on the TS samples
```

> **Using this as LLM context?** Point your tool at [`llms.txt`](llms.txt) (a structured
> index of every doc, sample, and source) or feed it the master guide directly. Agents
> editing the repo should read [`AGENTS.md`](AGENTS.md) first.

## The TL;DR

> An agent is a **bounded loop** (`maxTurns` + `maxBudgetUsd`) around a model calling
> **well-designed tools** (workflow-shaped, error-proofed args, errors-as-data, bounded
> output). Treat **context as a finite, degrading budget**. Keep **authorization in
> code**, never the prompt. Default to a **single linear agent**. **Observe everything**
> and **evaluate by outcomes**, not tool-call paths. Build the thinnest harness that
> makes today's model reliable — and design it so you can delete the scaffolding as
> models improve.

See the guide for the cited, detailed version.

## License

[MIT](LICENSE) © 2026 Fidget Softworks, LLC. The guidance is distilled from publicly
available primary sources, each cited in the guide; please consult the originals for
authoritative detail.
