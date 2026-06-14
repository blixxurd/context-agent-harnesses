# raw_outputs/ — the research evidence

The raw material the guide was built from. Treat it as **read-only evidence**: the
synthesized, human-readable product lives in
[`../docs/agent-harness-best-practices.md`](../docs/agent-harness-best-practices.md). Come
here to verify a claim against its primary source, or to mine detail the guide compressed.

## The pipeline (how these files relate)

```
search/        →   sources/        →   claims/              →   synthesis/
13 research        26 fetched          verified-claims.json     findings-digest.md
angles, raw        source pages        154 claims, 3-vote       themes.json
web-search dumps   (full text)         adversarial verify       (the digest the
                                       → 150 survived            guide is written from)
```

1. **`search/`** — one Markdown dump per research angle (13 files, e.g.
   `core-agentic-loop.md`, `tool-design-and-result-contract.md`). Raw web-search results
   before any filtering.
2. **`sources/`** — the full extracted text of every primary source that was fetched
   (`source-00.md` … `source-25.md`), each with its title, URL, and retrieval note in the
   header. **Start with [`sources/INDEX.md`](sources/INDEX.md)** — it crosswalks every
   source file to the guide's citation key (`[be]`, `[wt]`, …), its URL, and its claim
   count. Machine-readable: [`sources/sources.json`](sources/sources.json).
3. **`claims/verified-claims.json`** — the claim ledger. `survivors` (150) + `dropped`
   (4). Each claim carries `id`, `text`, `topic`, `sourceId` (→ a `sources/source-NN.md`
   file), `sourceUrl`, `sourceTitle`, `sourceQuote`, and the adversarial `refutes`/
   `survives` votes. A claim survived only if fewer than 2 of 3 skeptics refuted it.
   This is the **heavy** artifact (~100KB) — load it when you need claim-level provenance,
   not for a quick read.
4. **`synthesis/`** — `findings-digest.md` (the granular 12-theme digest, with per-claim
   source attribution, that the guide is written from) and `themes.json` (a
   machine-readable 6-theme consolidation).

## Join keys (for agents)

- **Guide claim → primary source text:** the guide cites by key `[be]`; resolve it in
  [`sources/INDEX.md`](sources/INDEX.md) to a `source-NN.md` file.
- **Ledger claim → source file:** `claim.sourceId` is the `source-NN` id directly.
- **Ledger claim ↔ source ↔ URL:** join on `sourceUrl`, or via `sourceId` in
  [`sources/sources.json`](sources/sources.json).

## Counts

25 cited primary sources (+1 supplementary, OpenTelemetry semconv, uncited) · 13 search
angles · 154 claims (150 survived 3-vote verification, 4 dropped).
