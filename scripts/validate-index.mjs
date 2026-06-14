#!/usr/bin/env node
// Validates that index.json stays consistent with the files it describes.
//
// The repo's value is a trustworthy navigation manifest (index.json) that pre-joins
// guide sections <-> code samples <-> sources. That manifest is only useful if it
// can't silently drift from reality. This script enforces the invariants:
//
//   - every section anchor (#sN) exists in the guide, and vice-versa
//   - every section's [startLine, endLine] matches the anchor-derived range
//     (so the line numbers an agent uses for partial reads can never go stale)
//   - every referenced sample / source file exists on disk
//   - section<->sample links are bidirectional and complete (no orphan samples)
//   - every citation key used by a section is defined; every defined key is used
//   - guide prose citation keys are all defined, and match the manifest's keys
//   - index.json and raw_outputs/sources/sources.json agree on key<->id<->file
//
// Hard failures exit 1. Soft drift (e.g. equivalent-but-different source URLs across
// files) is reported as a warning and does NOT fail the build.
//
// Usage:
//   node scripts/validate-index.mjs          # check, exit 1 on any error
//   node scripts/validate-index.mjs --fix    # rewrite stale line ranges in index.json, then check

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = process.argv.includes("--fix");

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const abs = (p) => join(ROOT, p);

// ---------------------------------------------------------------------------
// Load core files
// ---------------------------------------------------------------------------
const indexPath = abs("index.json");
let index;
try {
  index = JSON.parse(readFileSync(indexPath, "utf8"));
} catch (e) {
  console.error(`FATAL: cannot parse index.json: ${e.message}`);
  process.exit(1);
}

const guideRel = index.guide;
const guidePath = abs(guideRel);
if (!existsSync(guidePath)) {
  console.error(`FATAL: guide not found at ${guideRel}`);
  process.exit(1);
}
const guideLines = readFileSync(guidePath, "utf8").split("\n");
const guideText = guideLines.join("\n");

// ---------------------------------------------------------------------------
// 1. The pointer files listed under index.indexes must all exist
// ---------------------------------------------------------------------------
for (const [name, p] of Object.entries(index.indexes ?? {})) {
  if (!existsSync(abs(p))) err(`indexes.${name} -> "${p}" does not exist`);
}

// ---------------------------------------------------------------------------
// 2. Derive section anchors and their line ranges from the guide
//    Anchor line:  <a id="sN"></a>
//    Range: [anchorLine, nextAnchorLine - 1]; last section stops before the
//    next top-level "## " heading.
// ---------------------------------------------------------------------------
const anchorLineOf = new Map(); // id -> 1-based line number
guideLines.forEach((line, i) => {
  const m = line.match(/^<a id="(s\d+)"><\/a>\s*$/);
  if (m) anchorLineOf.set(m[1], i + 1);
});

const sortedAnchors = [...anchorLineOf.entries()].sort((a, b) => a[1] - b[1]);
const derivedRange = new Map(); // id -> [start, end]
sortedAnchors.forEach(([id, start], idx) => {
  let end;
  if (idx + 1 < sortedAnchors.length) {
    end = sortedAnchors[idx + 1][1] - 1;
  } else {
    // last section: stop before the next "## " heading AFTER the section's own
    // heading (the heading sits on anchorLine+1, so begin the search past it).
    let next = guideLines.length;
    for (let ln = start + 1; ln < guideLines.length; ln++) {
      if (/^## /.test(guideLines[ln])) {
        next = ln + 1;
        break;
      }
    }
    end = next - 1;
  }
  derivedRange.set(id, [start, end]);
});

// ---------------------------------------------------------------------------
// 3. Validate sections: anchors, anchor field, line ranges
// ---------------------------------------------------------------------------
const sectionIds = new Set();
const sectionsNeedingFix = [];
for (const s of index.sections ?? []) {
  sectionIds.add(s.id);

  if (!anchorLineOf.has(s.id)) {
    err(`section "${s.id}" has no matching <a id="${s.id}"></a> in the guide`);
    continue;
  }

  const expectedAnchor = `${guideRel}#${s.id}`;
  if (s.anchor !== expectedAnchor) {
    err(`section "${s.id}".anchor is "${s.anchor}", expected "${expectedAnchor}"`);
  }

  const [es, ee] = derivedRange.get(s.id);
  const [as, ae] = s.lines ?? [];
  if (as !== es || ae !== ee) {
    if (FIX) {
      sectionsNeedingFix.push({ id: s.id, lines: [es, ee] });
    } else {
      err(
        `section "${s.id}".lines is [${as}, ${ae}] but anchors imply [${es}, ${ee}] ` +
          `(run \`node scripts/validate-index.mjs --fix\` to correct)`
      );
    }
  }
}

// guide anchors with no manifest section
for (const id of anchorLineOf.keys()) {
  if (!sectionIds.has(id)) err(`guide anchor "#${id}" has no section in index.json`);
}

// ---------------------------------------------------------------------------
// 4. Apply --fix to index.json line ranges (preserves the one-line-per-entry
//    formatting by editing in place)
// ---------------------------------------------------------------------------
if (FIX && sectionsNeedingFix.length) {
  let raw = readFileSync(indexPath, "utf8");
  for (const { id, lines } of sectionsNeedingFix) {
    const re = new RegExp(`("id":\\s*"${id}"[^\\n]*?"lines":\\s*)\\[\\s*\\d+\\s*,\\s*\\d+\\s*\\]`);
    if (!re.test(raw)) {
      err(`--fix: could not locate line range for section "${id}" in index.json`);
      continue;
    }
    raw = raw.replace(re, `$1[${lines[0]}, ${lines[1]}]`);
  }
  writeFileSync(indexPath, raw);
  console.log(`--fix: updated line ranges for ${sectionsNeedingFix.length} section(s).`);
}

// ---------------------------------------------------------------------------
// 5. Samples: files exist, links are bidirectional, no orphan sample files
// ---------------------------------------------------------------------------
const manifestSamplePaths = new Set();
const sampleSectionsOf = new Map(); // sample path -> Set(section ids)
for (const sm of index.samples ?? []) {
  manifestSamplePaths.add(sm.file);
  sampleSectionsOf.set(sm.file, new Set(sm.sections ?? []));
  if (!existsSync(abs(sm.file))) err(`samples entry "${sm.file}" does not exist on disk`);
  for (const sid of sm.sections ?? []) {
    if (!sectionIds.has(sid)) err(`sample "${sm.file}" lists unknown section "${sid}"`);
  }
}

// section.samples must exist, be registered, and be reciprocated
for (const s of index.sections ?? []) {
  for (const p of s.samples ?? []) {
    if (!existsSync(abs(p))) err(`section "${s.id}" references missing sample "${p}"`);
    if (!manifestSamplePaths.has(p)) {
      err(`section "${s.id}" references sample "${p}" that is absent from the samples[] list`);
    } else if (!sampleSectionsOf.get(p).has(s.id)) {
      err(`section "${s.id}" lists sample "${p}", but that sample does not list section "${s.id}" (link not bidirectional)`);
    }
  }
}
// reciprocal direction: sample says it covers a section -> section must list it
for (const [p, secs] of sampleSectionsOf) {
  for (const sid of secs) {
    const sec = (index.sections ?? []).find((s) => s.id === sid);
    if (sec && !(sec.samples ?? []).includes(p)) {
      err(`sample "${p}" claims section "${sid}", but section "${sid}" does not list it (link not bidirectional)`);
    }
  }
}

// orphan sample files: anything on disk under code_samples/{typescript,python} not in the manifest
for (const sub of ["code_samples/typescript", "code_samples/python"]) {
  const dir = abs(sub);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    if (!/\.(ts|py)$/.test(f)) continue;
    const relPath = `${sub}/${f}`;
    if (!manifestSamplePaths.has(relPath)) {
      err(`sample file "${relPath}" exists on disk but is not listed in index.json samples[]`);
    }
  }
}

// ---------------------------------------------------------------------------
// 6. Sources: files exist, keys/ids unique, section refs resolve, no dangling keys
// ---------------------------------------------------------------------------
const sourceByKey = new Map();
const seenKeys = new Set();
const seenIds = new Set();
for (const src of index.sources ?? []) {
  if (!existsSync(abs(src.file))) err(`source "${src.id}" file "${src.file}" does not exist`);
  if (src.id) {
    if (seenIds.has(src.id)) err(`duplicate source id "${src.id}"`);
    seenIds.add(src.id);
  }
  if (src.key) {
    if (seenKeys.has(src.key)) err(`duplicate source key "${src.key}"`);
    seenKeys.add(src.key);
    sourceByKey.set(src.key, src);
  }
}

const usedKeys = new Set();
for (const s of index.sections ?? []) {
  for (const k of s.sources ?? []) {
    usedKeys.add(k);
    if (!sourceByKey.has(k)) err(`section "${s.id}" cites unknown source key "${k}"`);
  }
}
// a keyed (non-supplementary) source that no section cites
for (const src of index.sources ?? []) {
  if (!src.key) continue; // empty key = intentionally uncited supplementary
  const flaggedUncited = src.claims === 0 || /uncited/i.test(src.title ?? "");
  if (!usedKeys.has(src.key) && !flaggedUncited) {
    warn(`source key "${src.key}" (${src.id}) is defined but cited by no section`);
  }
}

// ---------------------------------------------------------------------------
// 7. Guide prose citation keys: every used key is defined, defs match the manifest
// ---------------------------------------------------------------------------
const guideDefKeys = new Map(); // key -> url, from "[key]: https://..." lines
const guideUsedKeys = new Set(); // from "][key]" references
guideLines.forEach((line) => {
  const def = line.match(/^\[([a-z0-9-]+)\]:\s+(\S+)/);
  if (def) guideDefKeys.set(def[1], def[2]);
});
for (const m of guideText.matchAll(/\]\[([a-z0-9-]+)\]/g)) guideUsedKeys.add(m[1]);

for (const k of guideUsedKeys) {
  if (!guideDefKeys.has(k)) err(`guide uses citation key [${k}] with no [${k}]: definition`);
}
for (const k of guideDefKeys.keys()) {
  if (!guideUsedKeys.has(k)) warn(`guide defines citation key [${k}] that is never used in prose`);
  if (!sourceByKey.has(k)) err(`guide defines citation key [${k}] that is absent from index.json sources[]`);
}
// every manifest key should be reflected in the guide bibliography
for (const k of sourceByKey.keys()) {
  if (!guideDefKeys.has(k)) warn(`index.json source key "${k}" has no [${k}]: definition in the guide`);
}

// ---------------------------------------------------------------------------
// 8. Cross-check index.json sources against raw_outputs/sources/sources.json
// ---------------------------------------------------------------------------
const sourcesJsonRel = index.indexes?.sourcesJson;
if (sourcesJsonRel && existsSync(abs(sourcesJsonRel))) {
  let raw;
  try {
    raw = JSON.parse(readFileSync(abs(sourcesJsonRel), "utf8"));
  } catch (e) {
    err(`cannot parse ${sourcesJsonRel}: ${e.message}`);
    raw = null;
  }
  if (Array.isArray(raw)) {
    const byId = new Map(raw.map((s) => [s.id, s]));
    for (const src of index.sources ?? []) {
      const other = byId.get(src.id);
      if (!other) {
        err(`source "${src.id}" is in index.json but missing from ${sourcesJsonRel}`);
        continue;
      }
      if ((other.key ?? "") !== (src.key ?? "")) {
        err(`source "${src.id}" key mismatch: index.json="${src.key}" vs sources.json="${other.key}"`);
      }
      if (other.url !== src.url) {
        // index.json and sources.json are the same dataset — they must agree.
        err(`source "${src.id}" URL differs: index.json="${src.url}" vs sources.json="${other.url}"`);
      }
    }
    for (const o of raw) {
      if (!(index.sources ?? []).some((s) => s.id === o.id)) {
        err(`source "${o.id}" is in ${sourcesJsonRel} but missing from index.json`);
      }
    }
  }
}

// also cross-check guide bibliography URLs against the manifest (soft)
for (const [k, url] of guideDefKeys) {
  const src = sourceByKey.get(k);
  if (src && src.url !== url) {
    warn(`citation [${k}] URL differs: guide="${url}" vs index.json="${src.url}"`);
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const rel = (p) => relative(ROOT, p);
if (warnings.length) {
  console.log(`\n⚠  ${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`   - ${w}`);
}
if (errors.length) {
  console.error(`\n✗  ${errors.length} error(s) in ${rel(indexPath)}:`);
  for (const e of errors) console.error(`   - ${e}`);
  console.error("");
  process.exit(1);
}
console.log(
  `\n✓  index.json is consistent — ${index.sections.length} sections, ` +
    `${index.samples.length} samples, ${index.sources.length} sources verified.`
);
