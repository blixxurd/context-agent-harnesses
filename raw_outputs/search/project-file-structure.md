# Raw Search Output — Angle: project-file-structure

**Question:** What is the recommended project and file-structure layout for an agent harness codebase (separating loop, tools, prompts, config, memory, evals) and conventions like CLAUDE.md and configuration files?

---

## Query 1: "Claude Agent SDK project structure layout tools prompts config"

- **Claude Agent SDK | Promptfoo** — https://www.promptfoo.dev/docs/providers/claude-agent-sdk/ — Provider docs for Claude Agent SDK.
- **Modifying system prompts - Claude Code Docs** — https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts — How to configure/override system prompts in the SDK; presets vs minimal.
- **Modifying system prompts - Claude API Docs** — https://platform.claude.com/docs/en/agent-sdk/modifying-system-prompts — Same topic, platform docs.
- **claude-code-system-prompts (agent-prompt guide)** — https://github.com/Piebald-AI/claude-code-system-prompts/blob/main/system-prompts/agent-prompt-claude-guide-agent.md — Reverse-engineered system prompt content.
- **Modifying system prompts - Claude Docs** — https://docs.claude.com/en/docs/agent-sdk/modifying-system-prompts — Official Anthropic docs. setting_sources=["project"], CLAUDE.md auto-read, output styles in ~/.claude/output-styles or .claude/output-styles, claude_code preset vs minimal prompt.
- **GitHub - Piebald-AI/claude-code-system-prompts** — https://github.com/Piebald-AI/claude-code-system-prompts — All parts of Claude Code's system prompt, 27 builtin tool descriptions, sub agent prompts, utility prompts (CLAUDE.md, compact, statusline).
- **Agent SDK overview - Claude API Docs** — https://platform.claude.com/docs/en/agent-sdk/overview — SDK overview, built-in tools.
- **Give Claude custom tools - Claude API Docs** — https://platform.claude.com/docs/en/agent-sdk/custom-tools — Custom tool definition conventions.
- **Claude Agent SDK - How to Customise System Prompts | Team 400 Blog** — https://team400.ai/blog/2026-04-claude-agent-sdk-system-prompts-customisation — Practitioner walkthrough.

Key findings: Agent SDK supports filesystem-based config via setting_sources/settingSources=["project"]. CLAUDE.md auto-read as persistent memory; ~/.claude/CLAUDE.md user-level. Output styles are markdown in ~/.claude/output-styles/ or .claude/output-styles/. System prompt: minimal default vs claude_code preset. Built-in tools for read/run/edit.

---

## Query 2: "CLAUDE.md agent configuration file conventions best practices"

- **5 Core Differences Between .agents and .claude Folders - Apiyi.com** — https://help.apiyi.com/en/agents-vs-claude-folder-skills-ai-agent-development-guide-en.html — Folder layout comparison (lower authority).
- **Creating the Perfect CLAUDE.md for Claude Code - Dometrain** — https://dometrain.com/blog/creating-the-perfect-claudemd-for-claude-code/ — Content best practices.
- **CLI Agents Part 2: Claude Code Best Practices** — https://vld-bc.com/blog/cli-agents-part2-claude-code-best-practices — Best practices blog.
- **CLAUDE.md, AGENTS.md, and Every AI Config File Explained - DEV** — https://dev.to/deployhq/claudemd-agentsmd-and-every-ai-config-file-explained-4pde — Config file taxonomy.
- **Writing a good CLAUDE.md | HumanLayer Blog** — https://www.humanlayer.dev/blog/writing-a-good-claude-md — Strong practitioner guidance: WHAT/WHY/HOW structure, progressive disclosure, keep concise.
- **CLAUDE.md, AGENTS.md & Copilot Instructions guide - DeployHQ** — https://www.deployhq.com/blog/ai-coding-config-files-guide — Cross-tool config files.
- **The CLAUDE.md Configuration Hierarchy | AI Agent Factory** — https://agentfactory.panaversity.org/docs/General-Agents-Foundations/claude-code-teams-cicd/claude-md-configuration-hierarchy — Hierarchy: user vs project, override rules.
- **Claude Code Best Practices (Anthropic, slideshare)** — https://www.slideshare.net/slideshow/claude-code-best-practices-_-anthropic-pdf/283584350 — Anthropic best-practices deck.
- **Agent Instruction Files (CLAUDE.md & AGENTS.md)** — https://glama.ai/mcp/servers/@vrppaul/semantic-code-mcp/blob/.../002-agent-instruction-files.md — ADR on instruction files.

Key findings: CLAUDE.md auto-loaded into context. Keep under 300 lines (ideally <100). Document bash commands, core files, code style, testing, repo etiquette, env setup, gotchas. Structure as WHAT/WHY/HOW; progressive disclosure to separate files. Hierarchy: ~/.claude/CLAUDE.md (user, not committed) vs ./CLAUDE.md or ./.claude/CLAUDE.md (project, committed); more specific overrides broader.

---

## Query 3: "AI agent harness codebase organization loop tools evals memory directory structure"

- **Harness capabilities - Docs by LangChain** — https://docs.langchain.com/oss/python/deepagents/harness — DeepAgents harness: loop, interpreters/eval tool, sandbox backends, memory files.
- **awesome-harness-engineering (GitHub)** — https://github.com/ai-boost/awesome-harness-engineering — Curated list: tools, patterns, evals, memory, MCP, permissions, observability, orchestration.
- **Skill Issue: Harness Engineering for Coding Agents | HumanLayer** — https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents — Harness engineering deep dive.
- **Building AI Coding Agents for the Terminal (arXiv)** — https://arxiv.org/html/2603.05344v1 — Scaffolding, harness, context engineering lessons.
- **What Is a Harness? - MindStudio** — https://www.mindstudio.ai/blog/what-is-an-ai-harness-infrastructure-for-agents — Harness = model+prompt+tools+loop plus memory, guardrails, orchestration.
- **Agentic Harness Engineering: LLMs as the New OS - DecodingAI** — https://www.decodingai.com/p/agentic-harness-engineering — Conceptual framing.
- **Build an Agent Improvement Loop with Traces, Evals, and Codex - OpenAI** — https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop — Evals/traces loop (OpenAI cookbook).
- **AI Agents in 2026: Tools, Memory, Evals, and Guardrails - Andrii Furmanets** — https://andriifurmanets.com/blogs/ai-agents-2026-practical-architecture-tools-memory-evals-guardrails — Practical architecture across components.

Key findings: Basic agent = model+prompt+tools+planning loop; harness adds memory, guardrails, orchestration, context engineering. Loop: observe→think→act→observe. Tools via sandbox backends/eval tool. Memory files = persistent context across conversations. Evals cover full trajectories (tool choice, args, step count, cost), deterministic mocks in CI. Scratch directories for plans (goal/context/files/steps).

---

## Query 4: "building effective agents Anthropic architecture project structure best practices"

- **Anthropic: Building Effective Agents (ZenML LLMOps DB)** — https://www.zenml.io/llmops-database/building-effective-agents-practical-framework-and-design-principles — Summary of Anthropic framework.
- **Building Effective Agents :: Spring AI Reference** — https://docs.spring.io/spring-ai/reference/api/effective-agents.html — Implementation of patterns.
- **Anthropic's 5 Essential Architect Patterns (Medium)** — https://medium.com/@aisolutionarchitect/building-with-agentic-ai-anthropics-5-essential-architect-patterns-02f9e791b118 — Pattern summary.
- **Effective context engineering for AI agents \ Anthropic** — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents — Context curation / attention budget; primary source.
- **Effective harnesses for long-running agents \ Anthropic** — https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents — Primary source on harness design for long-running agents.
- **Building Effective AI Agents: Architecture Patterns (Anthropic PDF)** — https://resources.anthropic.com/hubfs/Building%20Effective%20AI%20Agents-%20Architecture%20Patterns%20and%20Implementation%20Frameworks.pdf — Anthropic resource PDF.
- **Building Effective AI Agents \ Anthropic** — https://www.anthropic.com/research/building-effective-agents — Canonical Anthropic article: environment + tools + system prompts; keep it simple.
- **Building Effective Agents with smolagents (HuggingFace)** — https://huggingface.co/blog/Sri-Vigneshwar-DJ/building-effective-agents-with-anthropics-best-pra — Implementation blog.
- **building effective ai agents (Anthropic resources)** — https://resources.anthropic.com/building-effective-ai-agents — Landing page.

Key findings: Core architecture = environment + tools + system prompts. Keep simple; only add complexity when needed. Tool design/docs crucial. Minimal footprint, reversible actions. Context engineering = curate smallest high-signal token set.
