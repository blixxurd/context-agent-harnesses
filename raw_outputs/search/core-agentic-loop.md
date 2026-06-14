# Raw Search Results: core-agentic-loop

**Angle:** core-agentic-loop

**Question:** What is the canonical structure of an agent's core runtime loop (think/act/observe), and what are best practices for loop termination, step budgets, planning vs. ReAct-style execution, and deciding when the agent is done?

---

## Query 1: "Anthropic building effective agents agentic loop"

Results seen:
- Building Effective AI Agents \ Anthropic — https://www.anthropic.com/research/building-effective-agents
  - Primary source. Defines agents as LLMs autonomously using tools in a loop. Core architecture = environment + tools + system prompt; model called in a loop. Emphasizes simplicity over architectural sophistication. Covers workflow patterns (evaluator-optimizer, orchestrator-workers, etc.) vs autonomous agents.
- Building Effective Agents: Practical Framework and Design Principles - ZenML LLMOps Database — https://www.zenml.io/llmops-database/building-effective-agents-practical-framework-and-design-principles
  - Secondary summary of Anthropic framework.
- Learning from Anthropic about building effective agents | MAA1 | Medium — https://maa1.medium.com/learning-from-anthropic-about-building-effective-agents-2a7469941428
  - Blog summary.
- Building Effective Agents :: Spring AI Reference — https://docs.spring.io/spring-ai/reference/api/effective-agents.html
  - Implements Anthropic patterns in Spring AI; concrete loop/workflow code patterns.
- Writing effective tools for AI agents \ Anthropic — https://www.anthropic.com/engineering/writing-tools-for-agents
  - Tool design within the act step.
- Effective context engineering for AI agents \ Anthropic — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
  - Context management across loop iterations.
- Building Effective AI Agents (resources) — https://resources.anthropic.com/building-effective-ai-agents
  - Anthropic resource hub.
- Anthropic's Effective Agents Framework: A Pattern Map — AgentPatterns.ai — https://www.agentpatterns.ai/agent-design/anthropic-effective-agents-framework/
  - Pattern map summary.

Notes from snippet: Agents begin with a command/discussion, then plan and operate independently. Crucial to gain "ground truth" from environment at each step (tool results, code execution) to assess progress. Agents pause for human feedback at checkpoints or blockers.

---

## Query 2: "ReAct agent loop think act observe pattern"

Results seen:
- What Is the ReAct Loop? How AI Agents Reason, Act, and Iterate | MindStudio — https://www.mindstudio.ai/blog/what-is-react-loop-ai-agent-reasoning
  - Clear explanation of ReAct three-phase cycle (Think/Act/Observe).
- What Is the ReAct Loop? ... Iterate Toward a Goal | MindStudio — https://www.mindstudio.ai/blog/what-is-react-loop-ai-agents-reason-act-iterate
  - Companion article.
- Architecting Agentic Communities using Design Patterns (arXiv) — https://arxiv.org/pdf/2601.03624
  - Academic design-pattern catalog.
- Implementing ReAct Agentic Pattern From Scratch — https://www.dailydoseofds.com/ai-agents-crash-course-part-10-with-implementation/
  - Implementation walkthrough.
- ReAct Pattern: Combining Reasoning and Acting in AI Agents — https://hopx.ai/blog/ai-agents/react-pattern-reasoning-acting/
  - Pattern explainer.
- The Agentic Loop Explained: Think, Act, Observe Guide — https://stackviv.ai/blog/agentic-loop-think-act-observe
  - Think/Act/Observe guide.
- The Think->Act->Observe Loop: How AI Agent Reasoning Actually Works — https://clyro.dev/blog/the-think-act-observe-loop-how-ai-agent-reasoning-actually-works/
  - Practitioner explanation of loop mechanics.

Notes: Three stages = Think (examine state, plan next action), Act (execute tool/API/DB call), Observe (inspect result, feed into next Think). Loop repeats until solution/final answer. Implemented at core of LangGraph, AutoGen, CrewAI, MindStudio.

---

## Query 3: "agent loop termination stop condition max steps budget best practices"

Results seen:
- The Agent Loop Problem: When "Smart" Won't Stop | Modexa | Medium — https://medium.com/@Modexa/the-agent-loop-problem-when-smart-wont-stop-ccbf8489180f
  - Termination failure modes.
- The Simplest Stop Condition: A Hard Cap on Agent Loop Iterations - DEV Community — https://dev.to/mukundakatta/the-simplest-stop-condition-a-hard-cap-on-agent-loop-iterations-4lgn
  - Hard iteration cap.
- How the agent loop works - Claude Code Docs — https://code.claude.com/docs/en/agent-sdk/agent-loop
  - PRIMARY: Claude Agent SDK loop documentation (gather context, take action, verify work, repeat).
- How the agent loop works - Claude API Docs — https://platform.claude.com/docs/en/agent-sdk/agent-loop
  - PRIMARY: same doc on platform.claude.com.
- What Is the AI Agent Loop? ... | Oracle developers — https://blogs.oracle.com/developers/what-is-the-ai-agent-loop-the-core-architecture-behind-autonomous-ai-systems
  - Vendor overview of agent loop architecture.
- Agents: Loop Control — https://ai-sdk.dev/docs/agents/loop-control
  - Vercel AI SDK loop control (stopWhen, max steps, budgets).
- Utility-Guided Agent Orchestration for Efficient LLM Tool Use (arXiv) — https://arxiv.org/pdf/2603.19896
  - Academic, efficiency/orchestration.
- Agent Loops Explained: The Observe-Think-Act Cycle ... | CallSphere — https://callsphere.ai/blog/agent-loops-explained-observe-think-act-cycle
  - Loop explainer.
- The Anatomy of an Agent Loop | Steve Kinney — https://stevekinney.com/writing/agent-loops
  - Practitioner deep-dive on loop anatomy.

Notes: Max iterations is single most important safety control; typical production 15-25 steps; rule of thumb 3-5x expected iterations. Use max_budget_usd cap. No-progress detection (same tool, same inputs repeated 2-3x => stop/switch). Wall-clock timeout (~300s). Defense in depth = multiple overlapping termination mechanisms. Early-stopping "generate" pattern: on hitting cap, append message + call LLM once more without tools to synthesize partial answer.

---

## Query 4: "LLM agent planning vs reactive ReAct execution best practices when done"

Results seen:
- ReAct vs Plan-and-Execute vs ReWOO vs Reflexion | The AI Engineer (Substack) — https://theaiengineer.substack.com/p/the-4-single-agent-patterns
  - Comparison of 4 single-agent patterns.
- ReAct vs Plan-and-Execute: A Practical Comparison of LLM Agent Patterns - DEV Community — https://dev.to/jamesli/react-vs-plan-and-execute-a-practical-comparison-of-llm-agent-patterns-4gh9
  - Practical comparison + tradeoffs.
- Self-Generated In-Context Examples Improve LLM Agents ... (arXiv) — https://arxiv.org/pdf/2505.00234
  - Academic.
- ReAct vs Plan-and-Execute: The Architecture Behind Modern AI Agents | Louis Bouchard (Substack) — https://louisbouchard.substack.com/p/react-vs-plan-and-execute-the-architecture
  - Architecture comparison.
- Choosing the right AI Agent Strategy | Allen Chan & Sebastian Carbajales | Medium — https://achan2013.medium.com/choosing-the-right-ai-agent-strategy-b72625bf49f3
  - Strategy selection.
- Architecting Resilient LLM Agents: A Guide to Secure Plan-then-Execute Implementations (arXiv) — https://arxiv.org/pdf/2509.08646
  - Security-focused plan-then-execute.
- Pre-Act: Multi-Step Planning and Reasoning Improves Acting in LLM Agents (arXiv) — https://arxiv.org/pdf/2505.09970
  - Academic: multi-step planning improves acting.
- Implementing Plan-and-Execute Agents | APXML — https://apxml.com/courses/.../plan-and-execute-agents
  - Implementation course.

Notes: ReAct = think/act/observe, one LLM call per step; good for messy/uncertain/fast tasks. Plan-and-Execute = plan all steps upfront, execute with cheaper model, replan on failure; fewer calls, lower cost, inspectable; good for predictable, dependency-heavy multi-step tasks. Production reality: hybrids. ReAct+Reflexion most common (run ReAct, on validation failure enter Reflexion retry). Deep Research systems combine high-level planning with local adaptive reasoning loops.
