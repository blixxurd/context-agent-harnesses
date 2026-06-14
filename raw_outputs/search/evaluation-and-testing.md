# Search Raw Dump — Angle: evaluation-and-testing

**Question:** How should agent harnesses be evaluated and tested, including end-to-end task evals, regression suites, LLM-as-judge, trajectory/process evaluation, replay/mocking of tools, and CI integration?

---

## Query 1: "Anthropic evaluating agents evals best practices engineering blog"

- Anthropic on X — "Demystifying evals for AI agents" announcement — https://x.com/AnthropicAI/status/2009696515061911674
- Anthropic's Guide to AI Agent Evals: What Support Teams Need to Know (Inkeep) — https://inkeep.com/blog/anthropic-s-guide-to-ai-agent-evals-what-support-teams-need
- Evaluating AI Agents: From Single Answers to Systems That Act (Adnan Masood, Medium) — https://medium.com/@adnanmasood/evaluating-ai-agents-from-single-answers-to-systems-that-act-213b319949fb
- elvis (omarsar0) on X — takeaways from Anthropic evals post — https://x.com/omarsar0/status/2009727896706003043
- Agent Evaluation Readiness Checklist (LangChain) — https://www.langchain.com/blog/agent-evaluation-readiness-checklist
- Writing effective tools for AI agents—using AI agents (Anthropic) — https://www.anthropic.com/engineering/writing-tools-for-agents
- Engineering at Anthropic — Demystifying evals for AI agents — https://anthropic.com/engineering/demystifying-evals-for-ai-agents
- Engineering at Anthropic (hub) — https://anthropic.com/engineering

Notes from search summary: Anthropic "Demystifying evals for AI agents" covers: code-based vs model-based vs human graders (tradeoffs); capability evals (start low pass rate) vs regression evals (stay near 100%, tasks graduate from capability to regression); grade output not process; start early with 20-50 tasks from real failures.

## Query 2: "agent harness testing LLM as judge trajectory evaluation process"

- Chapter 8: Agent Evaluation for LLMs: How to Test Tools, Trajectories, and LLM-as-Judge (Vinod Rane, Medium) — https://medium.com/@vinodkrane/chapter-8-agent-evaluation-for-llms-how-to-test-tools-trajectories-and-llm-as-judge-788f6f3e0d52
- AgentRewardBench: Evaluating Automatic Evaluations of Web Agent Trajectories (arXiv) — https://arxiv.org/pdf/2504.08942
- Agent Harness Engineering Guide [2026]: Evaluating AI Agents in Production (QubitTool) — https://qubittool.com/blog/agent-harness-evaluation-guide
- Structured Distillation of Web Agent Capabilities Enables Generalization (arXiv) — https://arxiv.org/pdf/2604.07776
- Agent Harness for Large Language Model Agents: A Survey (Preprints.org) — https://www.preprints.org/manuscript/202604.0428/v1
- LLM Evaluation Framework: Trajectories vs. Outputs (LangChain) — https://www.langchain.com/resources/llm-evaluation-framework
- When AIs Judge AIs: The Rise of Agent-as-a-Judge Evaluation for LLMs (arXiv) — https://arxiv.org/pdf/2508.02994
- How to Build an Evaluation Harness for Your AI Agent (Micheal Lanham, Medium) — https://medium.com/@Micheal-Lanham/how-to-build-an-evaluation-harness-for-your-ai-agent-before-it-books-the-wrong-flight-84de83a47207
- Agent-Testing Agent: A Meta-Agent for Automated Testing and Evaluation of Conversational AI Agents (arXiv) — https://arxiv.org/pdf/2508.17393

Notes: trajectory evaluation = scoring step-by-step decision path not just final output; LLM-as-judge is practical default at scale; agent eval complexity ~O(n*k) where k is trajectory length.

## Query 3: "agent eval suite regression mocking tools CI replay end-to-end task success"

- What is agent evaluation? How to test agents with tasks, simulations, and success criteria (Braintrust) — https://www.braintrust.dev/articles/agent-evaluation
- Chapter 8 (Vinod Rane, Medium) — https://medium.com/@vinodkrane/chapter-8-agent-evaluation-for-llms-how-to-test-tools-trajectories-and-llm-as-judge-788f6f3e0d52
- GitHub - hidai25/eval-view: Regression testing for AI agents (snapshot, diff tool calls, catch regressions in CI; LangGraph/CrewAI/OpenAI/Anthropic) — https://github.com/hidai25/eval-view
- The Eval Problem: How to Test AI Agents When They Never Give the Same Answer Twice (adlrocha, Substack) — https://adlrocha.substack.com/p/adlrocha-the-eval-problem-how-to
- Agent Evaluation Suites That Actually Catch Failures (Praxen, Medium) — https://medium.com/@Praxen/agent-evaluation-suites-that-actually-catch-failures-02f4e9ab0243
- Testing Agent Skills Systematically with Evals (OpenAI Developers) — https://developers.openai.com/blog/eval-skills
- Demystifying evals for AI agents (Anthropic) — https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- Kinde CI/CD for Evals: Running Prompt & Agent Regression Tests in GitHub Actions — https://www.kinde.com/learn/ai-for-software-engineering/ai-devops/ci-cd-for-evals-running-prompt-and-agent-regression-tests-in-github-actions/

Notes: eval harness = infra running evals end-to-end from loading test cases to grading to gating deploys; replay = capture real interactions, rerun against new builds; goldens as stable regression set; CI gating via GitHub Action posting PR comments and blocking merge on regression; end-to-end with real model calls (no mocking model) surfaces context/tool composition bugs.

## Query 4: "OpenAI evals agents measuring performance task success benchmark"

- OpenAI Evals (product) — https://evals.openai.com/
- Evaluation best practices (OpenAI API docs) — https://developers.openai.com/api/docs/guides/evaluation-best-practices
- Testing Agent Skills Systematically with Evals (OpenAI Developers) — https://developers.openai.com/blog/eval-skills
- OpenAI Evals: Mastering LLM Evaluation (DataNorth) — https://datanorth.ai/blog/evals-openais-framework-for-evaluating-llms
- Evaluating Large Language Models: A Comprehensive Survey (arXiv) — https://arxiv.org/pdf/2310.19736
- GitHub - openai/evals: framework for evaluating LLMs and LLM systems, open-source registry of benchmarks — https://github.com/openai/evals
- Agent Identity Evals: Measuring Agentic Identity (arXiv) — https://arxiv.org/pdf/2507.17257
- UpBench: A Dynamically Evolving Real-World Labor-Market Agentic Benchmark Framework (arXiv) — https://arxiv.org/pdf/2511.12306

Notes: OpenAI evals for agent skills = lightweight end-to-end tests (run agent, record, score against rules); four goal categories — outcome, process, style, efficiency; openai/evals open-source registry; benchmarks PaperBench, SWE-Lancer, GDPval.
