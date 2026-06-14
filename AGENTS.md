# AGENTS.md

Orientation for AI agents and humans working in this repository. (This repo's own
guide recommends putting durable rules in `AGENTS.md`/`CLAUDE.md` so they survive
compaction — this file practices that.)

## What this repo is

A cited, fact-checked **reference** on building agent harnesses. It is documentation +
runnable examples, **not** a deployable application or installable package. Treat it as
context to read from, and as a place to extend with more verified guidance.

## Where things live

- `index.json` — machine-readable navigation manifest. Pre-joins each guide section
  (stable ids `#s0`–`#s12`) to its code samples and primary sources. Use it to navigate
  programmatically instead of parsing the markdown index tables. Keep it in sync when you
  add/move a section, sample, or source — `node scripts/validate-index.mjs` checks it and
  `--fix` regenerates the section line ranges (see *Verifying*).
- `docs/agent-harness-best-practices.md` — the master guide. Start here.
- `code_samples/typescript/` — 10 type-checked TS samples (primary).
- `code_samples/python/` — 3 illustrative Python samples.
- `raw_outputs/` — the raw research the guide is built from (search dumps, fetched
  source text, the 150-claim ledger, the synthesis digest). Treat as read-only evidence.
  See [`raw_outputs/README.md`](raw_outputs/README.md) for the pipeline and join keys, and
  [`raw_outputs/sources/INDEX.md`](raw_outputs/sources/INDEX.md) to map a citation key to
  its source file.

## Ground rules for changes

- **Every claim must be sourced.** This repo's value is that its guidance is verified.
  When you add or change a best-practice claim in `docs/` or `code_samples/`, cite a
  primary source (link it), and prefer the primary source over secondary commentary.
- **Code samples must type-check.** Before committing TypeScript changes:
  ```bash
  cd code_samples/typescript && npm install && npm run typecheck
  ```
  Samples are pinned to and verified against `@anthropic-ai/claude-agent-sdk@0.1.77`
  and `@anthropic-ai/sdk@0.65`. If you bump versions, re-run the type-check and update
  the version notes in `code_samples/README.md` and `docs/...md` §12.
- **Don't assert undocumented API behavior.** Where the live SDK and the published docs
  disagree, the samples follow the *installed* SDK and call out the discrepancy in a
  comment. Keep that honesty.
- **Don't commit secrets or `node_modules/`.** See `.gitignore`. Samples read
  `ANTHROPIC_API_KEY` from the environment.
- **Samples are type-checked, not executed in CI** (running makes billed API calls).
  Note that distinction if you claim something "works".
- **`index.json` must stay consistent with the files it describes.** After editing the
  guide, a sample, or a source, run the index validator (below). If you edited the guide
  above a section, the recorded line ranges go stale — `--fix` regenerates them from the
  `<a id="sN">` anchors (the anchors, not the line numbers, are the durable contract).

## Verifying

```bash
# 1. Code samples type-check (TypeScript)
cd code_samples/typescript
npm install
npm run typecheck        # tsc --noEmit --strict, must exit 0

# 2. Navigation manifest is consistent (zero-dependency Node script, run from repo root)
node scripts/validate-index.mjs        # anchors, line ranges, sample/source links — exit 0
node scripts/validate-index.mjs --fix  # regenerate stale section line ranges in index.json
```

CI runs both checks on pushes and PRs: `.github/workflows/typecheck.yml` (type-check)
and `.github/workflows/validate-index.yml` (manifest consistency).
