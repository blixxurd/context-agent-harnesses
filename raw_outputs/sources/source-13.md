# Demystifying evals for AI agents — Anthropic Engineering
URL: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents

Retrieval note: Fetched via WebFetch on 2026-06-14. Page retrieved successfully and converted to markdown. Content below is the extracted article body.

## Introduction

Good evaluations help teams ship AI agents more confidently. Without them, it's easy to get stuck in reactive loops—catching issues only in production, where fixing one failure creates others. Evals make problems and behavioral changes visible before they affect users, and their value compounds over the lifecycle of an agent.

Agents operate over many turns: calling tools, modifying state, and adapting based on intermediate results. These same capabilities that make AI agents useful—autonomy, intelligence, and flexibility—also make them harder to evaluate.

## The Structure of an Evaluation

An **evaluation** ("eval") is a test for an AI system: give an AI an input, then apply grading logic to its output to measure success. This article focuses on **automated evals** that can be run during development without real users.

**Single-turn evaluations**: a prompt, a response, and grading logic. **Multi-turn evaluations** have become increasingly common.

Frontier models can find creative solutions that surpass static evals. Opus 4.5 solved a τ2-bench problem about booking a flight by discovering a loophole in the policy—it "failed" the evaluation as written, but came up with a better solution for the user.

### Key Definitions for Agent Evaluations

- A **task** (a.k.a **problem** or **test case**) is a single test with defined inputs and success criteria.
- Each attempt at a task is a **trial**. Multiple trials produce more consistent results.
- A **grader** is logic that scores some aspect of the agent's performance. A task can have multiple graders, each containing multiple assertions (**checks**).
- A **transcript** (also **trace** or **trajectory**) is the complete record of a trial. For the Anthropic API, this is the full messages array at the end of an eval run.
- The **outcome** is the final state in the environment at the end of the trial.
- An **evaluation harness** is the infrastructure that runs evals end-to-end. It provides instructions and tools, runs tasks concurrently, records all the steps, grades outputs, and aggregates results.
- An **agent harness** (or **scaffold**) is the system that enables a model to act as an agent: it processes inputs, orchestrates tool calls, and returns results. When evaluating "an agent," you're evaluating the harness and the model working together.
- An **evaluation suite** is a collection of tasks designed to measure specific capabilities or behaviors.

## Why Build Evaluations?

Teams can get surprisingly far through manual testing, dogfooding, and intuition early on. The breaking point comes when users report the agent feels worse after changes, and the team is "flying blind."

Claude Code started with fast iteration; evals were added later—first for narrow areas like concision and file edits, then for complex behaviors like over-engineering.

Descript built evals around three dimensions: don't break things, do what I asked, and do it well. They evolved from manual grading to LLM graders with periodic human calibration, and run two separate suites for quality benchmarking and regression testing. Bolt AI built an eval system in 3 months that runs their agent and grades outputs with static analysis, uses browser agents to test apps, and employs LLM judges.

## How to Evaluate AI Agents

### Types of Graders

Agent evaluations typically combine three types: code-based, model-based, and human.

**Code-based graders** — string match, binary tests (fail-to-pass, pass-to-pass), static analysis, outcome verification, tool calls verification, transcript analysis. Fast, cheap, objective, reproducible, but brittle to valid variations.

**Model-based graders** — rubric-based scoring, natural language assertions, pairwise comparison, reference-based, multi-judge consensus. Flexible, scalable, captures nuance, but non-deterministic and requires calibration with human graders.

**Human graders** — SME review, crowdsourced judgment, spot-check sampling, A/B testing, inter-annotator agreement. Gold standard but expensive and slow.

Scoring can be weighted, binary (all graders must pass), or hybrid.

### Capability vs. Regression Evals

**Capability/"quality" evals** ask "What can this agent do well?" They should start at a low pass rate. **Regression evals** ask "Does the agent still handle all the tasks it used to?" and should have a nearly 100% pass rate. Capability evals with high pass rates can "graduate" to become a regression suite.

### Evaluating Coding Agents

Deterministic graders are natural for coding agents. SWE-bench Verified gives agents GitHub issues from popular Python repositories and grades by running the test suite; a solution passes only if it fixes failing tests without breaking existing ones. LLMs progressed from 40% to >80% on this eval in one year. Terminal-Bench tests end-to-end technical tasks like building a Linux kernel from source.

### Evaluating Conversational Agents

Conversational agents maintain state, use tools, take actions mid-conversation. They often require a second LLM to simulate the user. τ-Bench and τ2-Bench simulate multi-turn interactions across retail support and airline booking domains.

### Evaluating Research Agents

Research quality can only be judged relative to the task. BrowseComp tests whether agents can find needles in haystacks across the open web. Combine grader types: groundedness checks, coverage checks, source quality checks. LLM-based rubrics should be frequently calibrated against expert human judgment.

### Computer Use Agents

Interact with software through screenshots, mouse clicks, keyboard inputs. WebArena tests browser-based tasks using URL and page state checks plus backend state verification. OSWorld extends to full OS control. Browser use agents balance token efficiency and latency: DOM-based interactions execute quickly but consume many tokens; screenshot-based are slower but more token-efficient. In Claude for Chrome, evals were developed to check the agent was selecting the right tool for each context.

### Non-Determinism

**pass@k** measures the likelihood that an agent gets at least one correct solution in k attempts. **pass^k** measures the probability that all k trials succeed; if per-trial success is 75% and you run 3 trials, probability of passing all three is (0.75)³ ≈ 42%. Use pass@k for tools where one success matters, pass^k for agents where consistency is essential.

## Roadmap to Great Evals

**Step 0. Start early** — 20-50 simple tasks drawn from real failures is a great start. Large effect size in early development means small sample sizes suffice.

**Step 1. Start with what you already test manually** — Look at bug tracker and support queue; convert user-reported failures into test cases.

**Step 2. Write unambiguous tasks with reference solutions** — A good task is one where two domain experts would independently reach the same pass/fail verdict. With frontier models, a 0% pass rate across many trials (0% pass@100) is most often a signal of a broken task, not an incapable agent. Create a reference solution: a known working output that passes all graders.

**Step 3. Build balanced problem sets** — Test both where a behavior should occur and where it shouldn't. One-sided evals create one-sided optimization. Example: web search in Claude.ai—queries where the model should search (weather) vs. answer from knowledge ("who founded Apple?").

**Step 4. Build a robust eval harness with a stable environment** — Each trial should be "isolated" by starting from a clean environment. Unnecessary shared state can cause correlated failures. Claude was observed gaining an unfair advantage by examining git history from previous trials.

**Step 5. Design graders thoughtfully** — Choose deterministic graders where possible, LLM graders where necessary, human graders judiciously. Grade what the agent produced, not the path it took. Build in partial credit. Give the LLM a way out (return "Unknown"). Grade each dimension with an isolated LLM-as-judge. Opus 4.5 initially scored 42% on CORE-Bench; after fixing grading bugs (rigid grading penalizing "96.12" vs "96.124991…", ambiguous specs, stochastic tasks) and using a less constrained scaffold, score jumped to 95%. METR discovered misconfigured tasks that penalized models for following stated instructions. Make graders resistant to bypasses/hacks.

**Step 6. Check the transcripts** — You won't know if graders work unless you read transcripts and grades from many trials. Failures should seem fair.

**Step 7. Monitor for capability eval saturation** — An eval at 100% tracks regressions but provides no signal for improvement. SWE-Bench Verified started at 30% this year, now nearing saturation at >80%. Qodo was initially unimpressed by Opus 4.5 because one-shot evals didn't capture gains on longer tasks; they built a new agentic eval framework.

**Step 8. Keep suites healthy through open contribution and maintenance** — Dedicated evals teams own core infrastructure while domain experts and product teams contribute most tasks. Practice eval-driven development. PMs, CSMs, salespeople can use Claude Code to contribute eval tasks as PRs.

## How Evals Fit with Other Methods

Methods: automated evals, production monitoring, A/B testing, user feedback, manual transcript review, systematic human studies. No single layer catches every issue—like the Swiss Cheese Model from safety engineering. Automated evals are useful pre-launch and in CI/CD; production monitoring kicks in post-launch.

## Appendix: Eval Frameworks

- **Harbor** — running agents in containerized environments at scale; Terminal-Bench 2.0 ships through the Harbor registry.
- **Braintrust** — offline evaluation plus production observability; autoevals library with pre-built scorers.
- **LangSmith** — tracing, offline/online evaluations, dataset management, LangChain integration. Langfuse is a self-hosted open-source alternative.
- **Arize** — Phoenix (open-source LLM tracing/eval) and AX (SaaS).
