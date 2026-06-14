/**
 * 10 — Evaluation harness: grade outcomes, isolate trials, measure consistency
 * ============================================================================
 *
 * If you can't measure the agent, you can't improve it — and you definitely
 * can't tell whether a prompt/tool change helped or hurt. A few rules separate
 * useful evals from theater:
 *
 *   - START SMALL: 20–50 tasks drawn from REAL failures beat a giant synthetic
 *     suite. Early effect sizes are large (30%→80%); you don't need 10k tasks.
 *   - ISOLATE every trial in a clean environment. Shared state causes
 *     correlated, infrastructure-driven failures that look like model failures.
 *   - GRADE OUTCOMES, not tool-call paths. Path-checking ("did it call grep?")
 *     is brittle — there are many valid ways to reach a correct result.
 *   - SEPARATE capability evals (start low, a hill to climb) from regression
 *     evals (must stay near 100%).
 *   - MEASURE CONSISTENCY with pass^k (all k runs pass), not just pass@k (any
 *     run passes). 0.75 pass-rate ⇒ 0.75³ ≈ 42% pass^3. Agents must be
 *     reliable across runs, not just capable on a good day.
 *   - A 0% pass@100 almost always means a broken task or grader, not a broken
 *     agent — sanity-check the harness first.
 *   - Calibrate LLM-as-judge against humans; give it an "Unknown" option; use
 *     per-dimension rubric judges rather than one global score.
 *
 * Sources:
 *   - Anthropic, "Demystifying evals for AI agents"
 *     https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
 *   - Anthropic, "Building agents with the Claude Agent SDK" (verification loop)
 *     https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk
 */

import { query, type Options } from "@anthropic-ai/claude-agent-sdk";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

interface EvalTask {
  id: string;
  prompt: string;
  /** Outcome grader: inspect the final workspace/answer, return pass/fail. */
  grade: (ctx: { finalText: string; workdir: string }) => Promise<boolean>;
  kind: "capability" | "regression";
}

/** Run ONE trial in a freshly-created, isolated working directory. */
async function runTrial(task: EvalTask, baseOptions: Options): Promise<boolean> {
  // Isolation: a clean temp dir per trial so trials can't contaminate each other.
  const workdir = await fs.mkdtemp(path.join(os.tmpdir(), `eval-${task.id}-`));
  try {
    let finalText = "";
    for await (const message of query({
      prompt: task.prompt,
      options: { ...baseOptions, cwd: workdir },
    })) {
      if (message.type === "result" && message.subtype === "success") {
        finalText = message.result;
      }
    }
    // Grade the OUTCOME (final answer + workspace), not the path taken.
    return await task.grade({ finalText, workdir });
  } finally {
    await fs.rm(workdir, { recursive: true, force: true });
  }
}

/** pass^k: the task passes only if ALL k independent runs pass. */
async function passCaretK(task: EvalTask, k: number, baseOptions: Options) {
  const results: boolean[] = [];
  for (let i = 0; i < k; i++) results.push(await runTrial(task, baseOptions));
  const passes = results.filter(Boolean).length;
  return {
    id: task.id,
    kind: task.kind,
    passAtK: passes > 0, // any run passed
    passCaretK: passes === k, // every run passed (the bar that matters)
    passRate: passes / k,
  };
}

// --- Example suite ----------------------------------------------------------
const suite: EvalTask[] = [
  {
    id: "create-readme",
    kind: "capability",
    prompt: "Create a file README.md containing the single line: # Hello",
    grade: async ({ workdir }) => {
      const content = await fs.readFile(path.join(workdir, "README.md"), "utf8").catch(() => "");
      return content.trim() === "# Hello";
    },
  },
  {
    id: "no-regression-json",
    kind: "regression",
    prompt: "Output only the JSON object {\"ok\":true} and nothing else.",
    grade: async ({ finalText }) => {
      try {
        return JSON.parse(finalText.trim()).ok === true;
      } catch {
        return false;
      }
    },
  },
];

async function main() {
  const baseOptions: Options = {
    allowedTools: ["Read", "Write", "Edit"],
    permissionMode: "acceptEdits", // isolated temp dirs make this safe here
    maxTurns: 10,
    maxBudgetUsd: 0.25,
  };

  const K = 3; // run each task 3× to measure consistency
  const report = [];
  for (const task of suite) report.push(await passCaretK(task, K, baseOptions));

  // Report capability and regression separately — they have different bars.
  const capability = report.filter((r) => r.kind === "capability");
  const regression = report.filter((r) => r.kind === "regression");

  console.table(report);
  console.log(
    `capability pass^${K}: ${capability.filter((r) => r.passCaretK).length}/${capability.length}`,
  );
  console.log(
    `regression pass^${K}: ${regression.filter((r) => r.passCaretK).length}/${regression.length} (must be 100%)`,
  );

  // A regression failure should fail CI; a capability gap is a hill to climb.
  const regressionBroken = regression.some((r) => !r.passCaretK);
  if (regressionBroken) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
