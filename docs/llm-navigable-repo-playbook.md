# The LLM-Navigable Repository Playbook

How to structure a **knowledge/reference repository so that an LLM agent can navigate it
cheaply, answer from it confidently, and trust what it finds.** This document codifies the
patterns this repo uses on itself, abstracted so you can emulate them for any subject —
not just agent harnesses.

It is a *meta* document: it describes the **container**, not the content. Copy the
structure; swap in your own domain.

> **Who this is for.** Anyone building a repo that an AI agent will read *as context* —
> internal docs, a cited reference, a runbook library, an API knowledge base. The goal is
> a repo where an agent spends its tokens on *answering*, not on *finding and parsing*.

---

## 1. The one idea behind everything

> **An agent reads a repo under a token budget it can't see the bottom of. Every design
> choice should lower the cost of getting from "a question" to "a cited answer."**

Two costs dominate, and the whole playbook is about minimizing both:

1. **Routing cost** — tokens spent figuring out *where* the answer is.
2. **Read cost** — tokens spent loading text that isn't the answer.

A good structure drives the common path to **one routing lookup + one bounded read**, and
makes every unit it lands on *self-contained enough to stop there.* This repo hits that
target: a typical question resolves in a single manifest lookup plus a ~30-line partial
read, with the citation already inline. That is the bar to design for.

Everything below is a tactic in service of that one sentence.

---

## 2. The seven patterns (each: what / why it works for LLMs / how to apply)

### Pattern 1 — A machine-readable manifest that *pre-joins* the repo

**What.** A single structured file (here `index.json`) that an agent reads first. It is not
a file listing — it is a **join table**: for each unit of content it records, in one place,
the title, a stable anchor, a partial-read line range, the code samples that demonstrate it,
and the sources that back it.

**Why it works for LLMs.** It collapses routing to a single lookup over structured data the
model never has to *parse out of prose*. "Which sample and which sources back section N?" is
resolved without opening the guide, the samples, or the source index. Cross-cutting queries
("what touches both permissions and the loop?") become a filter over the join, not a
multi-file hunt.

**How to apply.**
- Make it the documented *first read* ("start here if navigating programmatically").
- Store **relationships**, not just paths: every content unit lists its examples and its
  evidence. Bidirectional lookups should be computable from these forward joins.
- Include a **partial-read hint** per unit (a `[startLine, endLine]` range) so the agent
  loads one section, not the whole document.
- Keep it the **single source of truth**; generate or validate other surfaces against it
  (Pattern 6).

### Pattern 2 — Stable semantic anchors, decoupled from line numbers *and* titles

**What.** Each section carries a short, durable id (`#s0`…`#sN`) via an `<a id="sN">` tag.
Samples, the manifest, and cross-references all link to the **anchor**, never to a line
number or a heading string.

**Why it works for LLMs.** Editing prose shifts line numbers and re-wording shifts titles —
both silently break references an agent relies on. An opaque id survives both. Line numbers
are still useful for partial reads, so they're kept — but treated as **derived data**:
regenerated from the anchors, never hand-maintained.

**How to apply.**
- Give every addressable unit a stable id that means nothing and therefore never needs to
  change.
- Treat line ranges as a *cache* of the anchor's location: compute them with a script, and
  CI-check that they're current (Pattern 6).
- State the contract explicitly in the repo: "the anchors are durable; line numbers are
  derived."

### Pattern 3 — Self-contained, individually-cited units that *close the loop*

**What.** The unit an agent lands on answers without forcing another read. Each guide
section is `principle → concrete practices → inline citation per claim → a direct "→ Code:"
pointer`. Each code sample opens with a header comment that restates the thesis, the key
levers, and its sources before any code.

**Why it works for LLMs.** The expensive failure mode is "land on a section, discover it
only gestures at the answer, read three more files." Self-containment means the *first* read
is usually the *last*. Inline citations mean the agent can answer **and** attribute in one
pass, instead of round-tripping to a bibliography.

**How to apply.**
- End every section with a pointer to its runnable example and its evidence.
- Put a **dense header** on every code file: what it shows, the handful of ideas, the
  sources — so the file is useful even when read as an excerpt.
- Prefer many small self-contained units over one long narrative the agent must hold whole.

### Pattern 4 — Layer by load cost (progressive disclosure)

**What.** Content is tiered by how expensive it is to load, and each tier says when to reach
for the next:
`llms.txt` (thin link map) → the guide (synthesized answer) → code samples (runnable proof)
→ raw sources (full primary text) → the claims ledger (per-claim provenance, ~100 KB, "load
only when you need it").

**Why it works for LLMs.** The agent pulls only as deep as the question demands. A quick
"what's the default?" never touches the 100 KB evidence ledger; a "prove this claim" query
can descend to the exact supporting quote. The heaviest artifact is explicitly **flagged as
heavy**, so the agent doesn't load it speculatively.

**How to apply.**
- Identify your tiers from cheapest/most-synthesized to heaviest/most-raw.
- At each tier, tell the reader **what the next tier down is for** ("come here to verify a
  claim against its primary source").
- Label heavy artifacts with their cost and trigger ("~100 KB — load when you need
  claim-level provenance, not for a quick read").

### Pattern 5 — A provenance chain with documented join keys

**What.** Every claim is traceable to a primary source through explicit, stable keys:
inline citation key in the guide → a source-index crosswalk → the fetched source file → the
original URL. The claims ledger records, per claim, a `sourceId`, `sourceUrl`, and the exact
supporting `sourceQuote`. The join keys themselves are **documented for agents** ("a claim's
`sourceId` matches a source row's File; the guide cites by Key").

**Why it works for LLMs.** It makes the repo *verifiable* rather than *assertive*. An agent
(or a skeptical reader) can confirm any statement without trusting the synthesis, and can do
it mechanically because the keys are spelled out. It also lets an agent answer "what's the
evidence for X?" as a lookup, not a search.

**How to apply.**
- Assign every source a short stable key; cite by that key everywhere.
- Maintain a crosswalk (key ↔ file ↔ URL) and a machine-readable twin of it.
- In the ledger, store the **verbatim supporting quote** alongside each claim, not just a
  URL — the quote is what makes verification cheap.
- Write down the join keys in prose, addressed to "agents," so the graph is self-describing.

### Pattern 6 — CI-enforced consistency (the structure can't silently rot)

**What.** A zero-dependency validator (`scripts/validate-index.mjs`) checks, on every push:
anchors exist, line ranges are current, every sample/source link resolves, and the manifest
agrees with the machine-readable source list. A `--fix` mode regenerates the derived line
ranges. Code samples are **type-checked** in CI. Both run as GitHub Actions.

**Why it works for LLMs.** A navigation aid an agent *trusts* but that has silently drifted
is worse than none — it sends the agent to the wrong place confidently. CI turns the
structure's invariants into **enforced contracts**, so the manifest an agent reads is never
lying. The `--fix` path means keeping it correct is one command, not manual bookkeeping.

**How to apply.**
- Write down your invariants (anchors resolve, links resolve, derived data is current,
  redundant surfaces agree) and **make a script assert each one.**
- Provide an auto-fix for anything *derived* (line ranges, generated tables).
- Run it in CI. If you keep redundant human-facing indexes (Pattern 7), have the validator
  assert they're a subset of the manifest, or generate them from it.

### Pattern 7 — Redundant entry points, single source of truth

**What.** The same section↔sample↔source map is exposed several ways for different readers:
the JSON manifest (programmatic), `llms.txt` (the [llmstxt.org](https://llmstxt.org)
convention), a human `README`, a samples index, a source index. They overlap **on purpose** —
but exactly one (the manifest) is authoritative.

**Why it works for LLMs.** Different agents enter differently: some look for `llms.txt` by
convention, some read the README, some parse the manifest. Meeting each at its expected door
lowers routing cost. Redundancy is only a liability when the copies can disagree — which is
exactly what Pattern 6 prevents.

**How to apply.**
- Provide the conventional entry points your readers expect (`llms.txt`, `README`,
  `AGENTS.md`/`CLAUDE.md`).
- Designate one as canonical; treat the rest as **projections** of it.
- Guard the projections with the validator so redundancy never becomes contradiction.

---

## 3. Two supporting practices that make the content trustworthy

These aren't navigation patterns, but they're why an agent can *rely* on what it reads here.

- **Adversarially-verified claims.** Each claim was put to a 3-vote skeptic check and kept
  only if fewer than 2 of 3 tried to refute it (150 of 154 survived). The repo stores the
  vote counts. Lesson: **don't just collect claims — stress-test them, and record the
  test.** An agent reading verified claims can weight them differently from raw assertions.
- **Executable artifacts kept honest.** Samples are **type-checked, not executed** (running
  makes billed API calls) — and the repo *says so* rather than implying they "work." Where
  the installed SDK disagrees with the published docs, a comment flags it and the code
  follows the installed reality. Versions are pinned. Lesson: **state the exact level of
  verification, and surface discrepancies instead of papering over them.** Honesty about
  what's checked is itself a navigation aid — it tells the agent how far to trust each file.

---

## 4. The copyable template

A minimal skeleton that instantiates every pattern. Rename to your domain.

```
your-reference-repo/
├── AGENTS.md                    # Canonical, tool-agnostic rules + orientation (Pattern 7)
├── CLAUDE.md                    # 1-line pointer to AGENTS.md, so tool auto-load works
├── README.md                    # Human entry point + how the content was produced
├── llms.txt                     # Thin link map, llmstxt.org convention (Patterns 4, 7)
├── index.json                   # THE MANIFEST: pre-joined, single source of truth (P1)
│                                #   sections[]: {id, anchor, lines:[s,e], samples[], sources[]}
│                                #   samples[]:  {file, theme, sections[]}
│                                #   sources[]:  {key, id, file, url, title}
├── docs/
│   └── <guide>.md               # Synthesized answer. Stable <a id="sN"> anchors (P2),
│                                #   each section: principle → practices → inline cites →
│                                #   "→ Code:" pointer (P3). Cheat-sheet + anti-patterns.
├── code_samples/
│   ├── README.md                # Sample → section map (a projection of the manifest)
│   └── <lang>/                  # Runnable, dense-header, version-pinned examples (P3)
├── raw_outputs/                 # The evidence tier — read-only (P4, P5)
│   ├── README.md                #   pipeline + join keys, addressed to agents
│   ├── search/                  #   raw gathering, per research angle
│   ├── sources/                 #   fetched primary text + INDEX.md crosswalk (key↔file↔url)
│   │   └── sources.json         #   machine-readable twin of the crosswalk
│   ├── claims/                  #   verified-claims.json: per-claim sourceId/quote/votes (P5)
│   └── synthesis/               #   the digest the guide is written from
└── scripts/
    └── validate-<manifest>.mjs  # Zero-dep CI validator + --fix for derived data (P6)
.github/workflows/              # Run the validator and the sample type-check on push (P6)
```

**Load order an agent should follow** (and that your docs should advertise):
`llms.txt` or `index.json` → the one relevant section (partial read) → its sample/source →
the claims ledger only if provenance is in question.

---

## 5. Build pipeline (how to *produce* a repo like this)

The structure above is the output of a repeatable research pipeline. The directional flow:

```
search/   →   sources/   →   claims/            →   synthesis/   →   docs/ + code_samples/
gather        fetch full     extract + verify       consolidate      synthesize the answer,
per angle     primary text   (adversarial vote)      into themes      cite every claim inline
```

Then, as a final step, **emit the manifest and run the validator** so the navigation layer
matches the content. Keep `search/ → claims/` as read-only evidence; the docs are the
product, the `raw_outputs/` are the receipts.

---

## 6. Adoption checklist

Structure:
- [ ] One **machine-readable manifest** read first; it *pre-joins* units ↔ examples ↔ sources.
- [ ] Every addressable unit has a **stable, opaque anchor**; line numbers are derived, not authored.
- [ ] Each unit is **self-contained**: principle + specifics + inline citation + pointer to its example.
- [ ] Content is **tiered by load cost**, and each tier names what the next is for.
- [ ] Heavy artifacts are **labeled heavy**, with a trigger for when to load them.

Trust:
- [ ] A **provenance chain** (claim → source → URL) with **join keys documented for agents**.
- [ ] Claims are **verified**, and the verification (votes/quotes) is stored, not just asserted.
- [ ] Executable artifacts state their **exact verification level**; discrepancies are flagged, versions pinned.

Durability:
- [ ] A **CI validator** asserts every invariant; an `--fix` regenerates derived data.
- [ ] Redundant entry points exist for different readers but are **projections of one source of truth**.
- [ ] Durable rules live in `AGENTS.md`/`CLAUDE.md` so they **survive context compaction**.

---

## 7. Anti-patterns (what this structure deliberately avoids)

- ❌ **A README wall of prose as the only index** — forces the agent to read everything to
  find anything. (Fix: the manifest, Pattern 1.)
- ❌ **Links to line numbers or heading text** — break on the next edit. (Fix: anchors, P2.)
- ❌ **Sections that only gesture** and make the agent chase three more files. (Fix: self-
  containment, P3.)
- ❌ **One giant document** the agent must load whole to use a corner of. (Fix: tiers +
  partial-read ranges, P4.)
- ❌ **Bare URLs with no recoverable claim→quote link** — unverifiable. (Fix: provenance
  chain, P5.)
- ❌ **Hand-maintained parallel indexes that drift** — an agent trusts the stale one. (Fix:
  CI validation, P6; single source of truth, P7.)
- ❌ **"It works" with no statement of what was actually checked** — invites the agent to
  over-trust. (Fix: state the verification level, §3.)
- ❌ **Durable rules buried in a chat preamble** instead of `AGENTS.md` — lost to compaction.

---

*This playbook describes the repository it lives in. The repo is the working reference
implementation: read [`AGENTS.md`](../AGENTS.md) for the rules, [`index.json`](../index.json)
for the manifest these patterns are built around, and
[`scripts/validate-index.mjs`](../scripts/validate-index.mjs) for the enforcement.*
