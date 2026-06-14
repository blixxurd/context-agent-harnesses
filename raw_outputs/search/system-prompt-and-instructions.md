# Raw Search Dump: system-prompt-and-instructions

**Angle:** system-prompt-and-instructions

**Question:** How should system prompts and instruction design be structured for agent harnesses, including role framing, tool-use guidance, output formatting rules, dynamic prompt assembly, and prompt versioning?

**Date run:** 2026-06-14

---

## Query 1: "Anthropic system prompt design best practices for AI agents"

Results:
- Effective context engineering for AI agents \ Anthropic — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Building Effective AI Agents \ Anthropic — https://www.anthropic.com/research/building-effective-agents
- prompt-blueprint/guides/anthropic-best-practices... (thibaultyou/prompt-blueprint, GitHub) — https://github.com/thibaultyou/prompt-blueprint/blob/main/guides/anthropic-best-practices__chatgpt-4_5.md
- The Art of Agent Prompting: Anthropic's Playbook for Reliable AI Agents (Medium, Ali Ibrahim) — https://techwithibrahim.medium.com/the-art-of-agent-prompting-lessons-from-anthropics-ai-team-e8c9ac4db3f3
- Building Effective AI Agents (resources.anthropic.com) — https://resources.anthropic.com/building-effective-ai-agents
- Writing effective tools for AI agents—using AI agents \ Anthropic — https://www.anthropic.com/engineering/writing-tools-for-agents
- Prompting best practices - Claude API Docs (multishot) — https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/multishot-prompting
- The Art of Agent Prompting (Agentailor blog) — https://blog.agentailor.com/posts/the-art-of-agent-prompting

Notes from snippet: 3 core principles (simplicity, transparency/show planning, agent-computer interface via tool docs). System prompts: clear, simple, direct, "right altitude". Tools self-contained, robust, unambiguous; avoid bloated tool sets. Few-shot works single-turn but can backfire in agent loops; favor heuristics/principles over rigid examples. Eval agents: output reasoning + feedback blocks (CoT trigger).

## Query 2: "agent harness tool-use guidance prompt engineering output formatting"

Results:
- What Is an Agent Harness? The Architecture Behind Claude Code, Codex, and Cursor (MindStudio) — https://www.mindstudio.ai/blog/what-is-agent-harness-architecture-explained
- AI Agent Best Practices: Production-Ready Harness Engineering (2026 Guide) (Medium, Tort Mario) — https://medium.com/@tort_mario/ai-agent-best-practices-production-ready-harness-engineering-2026-guide-c1236d713fac
- Harness engineering vs prompt engineering vs context engineering (DEV Community) — https://dev.to/exemplar/harness-engineering-vs-prompt-engineering-vs-context-engineering-38a
- Effective context engineering for AI agents \ Anthropic — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Agent Harness Engineering vs Context Engineering vs Prompt Engineering (rajnandan.com) — https://rajnandan.com/posts/agent-harness-context-prompt-engineering/
- awesome-harness-engineering (GitHub, ai-boost) — https://github.com/ai-boost/awesome-harness-engineering
- AddyOsmani.com - Agent Harness Engineering — https://addyosmani.com/blog/agent-harness-engineering/
- Harness Engineering: The Complete Guide (amux.io) — https://amux.io/guides/harness-engineering/
- Building an agent harness (Medium, Heeki Park) — https://heeki.medium.com/building-an-agent-harness-31942331d605

Notes from snippet: agent = model + harness. Harness handles formatting: structuring system prompts, injecting tool defs, managing message roles, parsing structured outputs. Organize prompts into sections (<background_information>, <instructions>, ## Tool guidance, ## Output description) via XML tags / Markdown headers. Prompt engineering = role, constraints, output format, tone, refusal rules, few-shot, CoT nudges, structured outputs (JSON schema, tool-choice hints). 10 focused tools > 50 overlapping.

## Query 3: "dynamic prompt assembly system prompt versioning LLM agents best practices"

Results:
- Best Practices for Building Agents | Part 2: Prompt Management (Arthur.ai) — https://www.arthur.ai/blog/best-practices-for-building-agents-part-2-prompt-management
- What is prompt versioning? Best practices for iteration without breaking production (Braintrust) — https://www.braintrust.dev/articles/what-is-prompt-versioning
- Prompt versioning and its best practices 2025 (getmaxim.ai) — https://www.getmaxim.ai/articles/prompt-versioning-and-its-best-practices-2025/
- The Role of Prompt Versioning in Successful AI Agent Management (Medium, Kamyashah) — https://medium.com/@kamyashah2018/the-role-of-prompt-versioning-in-successful-ai-agent-management-065b52670a6a
- Building Effective AI Coding Agents for the Terminal (arxiv) — https://arxiv.org/pdf/2603.05344
- Prompt, agent, and model lifecycle management - AWS Prescriptive Guidance — https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-serverless/prompt-agent-and-model.html
- Auto-scaling LLM-based multi-agent systems (NCBI PMC) — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12465116/

Notes from snippet: Templating with variables + conditional logic for dynamic assembly based on context/tools/data. Example: SQL agent injects only relevant dialect instructions vs monolithic prompt. Versioning: immutability (new version not mutation), documentation/changelogs (what/why/who + metrics), access control. Versioning must track templates + variables to reconstruct assembled prompt. Enables traceability, reproducibility, controlled rollouts, evals, safe rollback.

## Query 4: "Claude system prompt structure role framing XML tags output formatting docs"

Results:
- Use XML tags to structure your prompts - Claude Docs — https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags
- Prompting best practices - Claude API Docs — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- Mastering Prompt Engineering for Claude (Walturn) — https://www.walturn.com/insights/mastering-prompt-engineering-for-claude
- The Claude Developer Guide — Prompt Engineering (GoPenAI/Medium) — https://blog.gopenai.com/the-claude-developer-guide-prompt-engineering-8558762ee874
- Claude XML Tags Guide (MagicTools) — https://tools.cooconsbit.com/en/articles/claude-xml-tags-guide-en
- Claude 4.5 System Prompts: XML Metaprompt Guide (PromptsEra) — https://promptsera.com/claude-4-5-xml-system-prompts/
- Claude XML Tags — 10 Tags (aipromptlibrary.app) — https://www.aipromptlibrary.app/blog/claude-xml-tags-prompt-engineering
- Use XML tags (cld-docs mirror) — https://cld-docs.onlinetool.cc/en/docs/build-with-claude/prompt-engineering/use-xml-tags.html
- Prompt engineering (docs.anthropic.com use-xml-tags) — https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags
- Prompt engineering best practices (Anthropic-aligned) (glama.ai MCP server) — https://glama.ai/mcp/servers/@deslicer/mcp-for-splunk/.../prompt-engineering.md

Notes from snippet: XML tags (<instructions>, <example>, <formatting>) separate prompt parts -> clarity, accuracy, flexibility. Role framing via system parameter improves performance. Order: <role>/<context> first, then <task>, then <instructions>/<output_format>. No canonical "best" tag names; be consistent, nest for hierarchy.
