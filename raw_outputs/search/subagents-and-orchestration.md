# Raw Search Dump: subagents-and-orchestration

**Angle:** subagents-and-orchestration

**Question:** What are the patterns and trade-offs for sub-agents and multi-agent orchestration (orchestrator-worker, delegation, parallelism, context isolation), and when should a harness spawn sub-agents vs. stay single-agent?

---

## Query 1: "Anthropic multi-agent orchestrator worker research system engineering blog"

- Anthropic's Multi-Agent Research Architecture Explained — https://theaiengineer.substack.com/p/how-anthropic-built-multi-agent-deep
- How Anthropic Built a Multi-Agent Research System — https://blog.bytebytego.com/p/how-anthropic-built-a-multi-agent
- Building Multi-Agent Systems (Part 2) - by Shrivu Shankar — https://blog.sshh.io/p/building-multi-agent-systems-part
- Anthropic: Building a Multi-Agent Research System for Complex Information Tasks - ZenML LLMOps Database — https://www.zenml.io/llmops-database/building-a-multi-agent-research-system-for-complex-information-tasks
- The Art of Multi-Agent Collaboration: Deep Reflections on Anthropic's Research System Engineering — https://llmmultiagents.com/en/blogs/anthropic-multi-agent-system-reflection
- Anthropic's Multi-Agent Blueprint: What Production Adds — https://fountaincity.tech/resources/blog/anthropic-multi-agent-blueprint-production/
- Anthropic and OpenAI Agent Orchestration: Where the Giants Stand in 2026 | Flocker — https://flocker.md/blog/anthropic-openai-agent-orchestration/
- Anthropic just dropped the ultimate playbook for building AI agents — https://www.sartechlabs.com/blog/building-ai-agents-with-anthropic
- multi agent research system | Educative — https://www.educative.io/courses/agentic-design-patterns/multi-agent-research-system
- Educative course link — https://www.educative.io/courses/agentic-design-patterns/7X4GY0grMAy

Notes from results: Anthropic's research system uses orchestrator-worker pattern. Lead Researcher = orchestrator; subagents = workers, each with own context window and tool access, explore independent directions in parallel, return condensed findings. Outperformed single Claude Opus 4 agent by 90.2% on internal research eval; ~15x token usage vs chat; token usage explains 80% of variance in performance. Principles: "think like your agents," "scale effort to query complexity," "teach the orchestrator how to delegate." Patterns: orchestrator-worker, CitationAgent, external-memory.

## Query 2: "Claude Agent SDK subagents delegation patterns documentation"

- Claude Code Subagents and Main-Agent Coordination: A Complete Guide to AI Agent Delegation Patterns | Rick Hightower / Towards AI — https://medium.com/@richardhightower/claude-code-subagents-and-main-agent-coordination-a-complete-guide-to-ai-agent-delegation-patterns-a4f88ae8f46c
- Claude Code Sub-Agent Delegation Setup.md · GitHub Gist — https://gist.github.com/tomas-rampas/a79213bb4cf59722e45eab7aa45f155c
- Subagents in the SDK - Claude API Docs (OFFICIAL) — https://platform.claude.com/docs/en/agent-sdk/subagents
- Claude Code Subagents: The Complete Guide to AI Agent Delegation | Sathish Raju / Medium — https://medium.com/@sathishkraju/claude-code-subagents-the-complete-guide-to-ai-agent-delegation-d0a9aba419d0
- Sub-Agents Guide — claude v0.5.3 (hexdocs) — https://hexdocs.pm/claude/guide-subagents.html
- Claude Sub-Agents: The Secret Delegation Technique You Need Now — https://www.theaistack.dev/p/orchestrating-claude-sub-agents
- Subagents in the Claude Agent SDK - When and How to Use Them | Team 400 Blog — https://team400.ai/blog/2026-03-claude-agent-sdk-subagents-guide

Notes: SDK lets you define/invoke subagents to isolate context, run in parallel, apply specialized instructions. Claude decides delegation based on subagent `description` field. Subagent context starts fresh — only channel from parent is the Agent tool prompt string (must include file paths, errors, decisions). Hub-and-spoke model. Explore-Plan-Execute pattern. Permission hygiene important.

## Query 3: "multi-agent orchestration context isolation parallelism trade-offs when not to use"

- Single-Agent vs Multi-Agent AI: When to Scale Your Dev Workflow | Augment Code — https://www.augmentcode.com/guides/single-agent-vs-multi-agent-ai
- Module 4 - Multi-agent architectures | AWS Marketplace — https://aws.amazon.com/marketplace/build-learn/ai-agent-learning-series/multi-agent-architectures
- AddyOsmani.com - The Code Agent Orchestra - what makes multi-agent coding work — https://addyosmani.com/blog/code-agent-orchestra/
- Choosing the Right Multi-Agent Architecture | LangChain — https://www.langchain.com/blog/choosing-the-right-multi-agent-architecture
- Multi-Agent Orchestration: How to Build Agent Teams That Actually Work | MindStudio — https://www.mindstudio.ai/blog/multi-agent-orchestration-patterns
- Dynamic Attentional Context Scoping (arXiv) — https://arxiv.org/pdf/2604.07911
- Orchestration Patterns for Multi-Agent Systems: Performance and Trade-offs - ISE Developer Blog (Microsoft) — https://devblogs.microsoft.com/ise/coordinator-patterns-multi-agent-systems/

Notes: Trade-offs — more agents = more parallel capacity but more coordination cost; more context isolation = less state pollution but more handoff loss; more specialization = better fit but more orchestration burden. Multi-agent pays off when subtasks truly independent, context degrades under load, parallel supervision possible. Single-agent fits most coding tasks (sequential, stateful). Multi-agent inherits distributed-system problems. Subagents process ~67% fewer tokens vs skills-based due to context isolation. Limits: inference cost, coordination overhead, observability/debugging at scale.

## Query 4: 'when to use single agent vs multi-agent best practices Cognition "don\'t build multi-agents"'

- Single vs Multi-agent systems: when to build which | Max Pavlov / Medium — https://maxpavlov.medium.com/single-vs-multi-agent-systems-when-to-build-which-1f336c676bd7
- Inside the Multi-Agent Debate: Why Cognition Labs Says "Don't" and Anthropic Says "Do — Carefully" | Shivanand Roy / Medium — https://snrspeaks.medium.com/inside-the-multi-agent-debate-why-cognition-labs-says-dont-and-anthropic-says-do-carefully-7b8a253e0b1e
- Single vs Multi-Agent System? | Phil Schmid — https://www.philschmid.de/single-vs-multi-agents
- Don't Just Build Agents, Build Memory-Augmented AI Agents | MongoDB — https://www.mongodb.com/company/blog/technical/dont-just-build-agents-build-memory-augmented-ai-agents
- How and when to build multi-agent systems | LangChain — https://www.langchain.com/blog/how-and-when-to-build-multi-agent-systems
- Don't Build Multi-Agents | Cognition (OFFICIAL/PRIMARY) — https://cognition.ai/blog/dont-build-multi-agents
- Dissecting the SWE-Bench Leaderboards (arXiv) — https://arxiv.org/pdf/2506.17208
- Why Cognition does not use multi-agent systems - Jason Liu — https://jxnl.co/writing/2025/09/11/why-cognition-does-not-use-multi-agent-systems/

Notes: Cognition (June 12 2025) "Single agents only, for now" — multi-agent fragile, miscommunication between agents, context loss in transmission, dispersed decision-making. Advocates context engineering for single agent. Caveat: Cognition and Anthropic surprisingly aligned — Anthropic multi-agent good for read-heavy/parallel research (deep research), Cognition single-agent good for stateful coding/conversational tasks. Core tension: read-heavy parallelizable work favors multi-agent; write-heavy stateful work favors single-agent.
