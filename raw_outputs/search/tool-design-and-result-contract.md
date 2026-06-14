# Raw Search Dump: tool-design-and-result-contract

**Angle:** tool-design-and-result-contract

**Question:** How should tools be designed for LLM agents (naming, schemas, granularity, descriptions) and what makes a good tool-result contract (success/error shapes, structured vs. text returns, token-efficiency)?

---

## Query 1: "Anthropic writing tools for AI agents best practices engineering blog"

- **Anthropic Shares Best Practices for Building Effective Tools for LLM Agents (2025)** — https://blockchain.news/ainews/anthropic-shares-best-practices-for-building-effective-tools-for-llm-agents-ai-developer-guide-2025 — Secondary coverage of Anthropic guide; SEO-ish.
- **mcp-server-langgraph ADR-0023 Anthropic tool design best practices** — https://github.com/vishnu2kmohan/mcp-server-langgraph/blob/main/adr/adr-0023-anthropic-tool-design-best-practices.md — Architecture Decision Record applying Anthropic's tool design principles in a real MCP server repo.
- **Writing Effective Tools for AI Agents: Lessons from Anthropic (Medium, LaxmiKumar Reddy Sammeta)** — https://laxmikumars.medium.com/writing-effective-tools-for-ai-agents-lessons-from-anthropic-25b85bf74f5d — Practitioner summary of the Anthropic post.
- **Anthropic on X announcing the blog post** — https://x.com/AnthropicAI/status/1966236220868247701 — Official announcement tweet.
- **Anthropic Releases a Guide for Writing LLM Agent Tools (aibase)** — https://news.aibase.com/news/21286 — News coverage.
- **Writing effective tools for AI agents—using AI agents \ Anthropic** — https://www.anthropic.com/engineering/writing-tools-for-agents — PRIMARY SOURCE. Anthropic engineering blog. Prototype-Evaluate-Collaborate iterative process, five design principles, high-leverage tools (not thin API wrappers), clear naming, token-efficient responses, refining descriptions.
- **Writing Effective Tools for AI Agents: Production Lessons (Medium, Ali Ibrahim)** — https://techwithibrahim.medium.com/writing-effective-tools-for-ai-agents-production-lessons-from-anthropic-99ea76a7fcf0 — Practitioner summary.
- **AI Agent Tools: Anthropic Development Guide (HowAIWorks.ai)** — https://howaiworks.ai/blog/anthropic-writing-tools-for-agents — Secondary summary.

## Query 2: "Claude tool use schema design tool result contract error format docs"

- **How to implement tool use - Claude API Docs** — https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use — PRIMARY. Parsing tool_use blocks, formatting tool_result, handling errors with is_error.
- **How tool use works - Claude API Docs** — https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works — PRIMARY. The tool-use contract: structured request -> run -> result back into conversation.
- **Handle tool calls - Claude API Docs** — https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls — PRIMARY. is_error: true returns exception message (not stack trace) as tool result.
- **Troubleshooting tool use - Claude API Docs** — https://platform.claude.com/docs/en/agents-and-tools/tool-use/troubleshooting-tool-use — PRIMARY. Error handling patterns.
- **Tool use with Claude - overview** — https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview — PRIMARY overview.
- **Strict tool use - Claude API Docs** — https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use — PRIMARY. strict:true guarantees typed values and required fields.
- **Define tools - Claude API Docs** — https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools — PRIMARY. name, description, input_schema, input_examples field.
- **Structured outputs - Claude API Docs** — https://platform.claude.com/docs/en/build-with-claude/structured-outputs — PRIMARY. Structured vs text returns.
- **Designing Claude Connector Tools: Schemas, Descriptions, and Patterns (sunpeak, May 2026)** — https://sunpeak.ai/blogs/claude-connector-tool-design/ — Practitioner guide on schema/description patterns for reliable tool calls.
- **Claude API Tool Use: Function Calling Guide for Production (renezander)** — https://renezander.com/guides/claude-api-tool-use/ — Production-focused guide.

## Query 3: "agent tool result token efficiency structured output design granularity"

- **How to Reduce Token Usage in AI Agents: 10 MCP Optimization Techniques (MindStudio)** — https://www.mindstudio.ai/blog/reduce-token-usage-ai-agents-mcp-optimization — Token optimization techniques for MCP/agent tool results.
- **draft-chang-agent-token-efficient-01 (IETF)** — https://datatracker.ietf.org/doc/html/draft-chang-agent-token-efficient-01 — IETF draft on token-efficient agent protocols; weather-tool over-return example.
- **CodeAgents: A Token-Efficient Framework (arXiv)** — https://arxiv.org/html/2507.03254v1 — Research on codified multi-agent reasoning token efficiency.
- **Building Effective AI Coding Agents for the Terminal (arXiv)** — https://arxiv.org/pdf/2603.05344 — Scaffolding, harness, context engineering lessons.
- **AI Agents with Human-Like Collaborative Tools (arXiv)** — https://arxiv.org/pdf/2509.13547 — Adaptive tool strategies.
- **Jenius Agent (arXiv)** — https://arxiv.org/pdf/2601.01857 — Experience-driven accuracy optimization.
- **Designing DevTools: Efficient token usage in AI assistance (Chrome for Developers)** — https://developer.chrome.com/blog/designing-devtools-efficient-token-usage — Granular functions, structured decision step to select minimum necessary tools; raw output token cost.
- **On the Impact of AGENTS.md Files (arXiv)** — https://arxiv.org/pdf/2601.20404 — Tangential.
- **Token efficiency with structured output from language models (Medium / Microsoft Data Science)** — https://medium.com/data-science-at-microsoft/token-efficiency-with-structured-output-from-language-models-be2e51d3d9d5 — Function calling best out-of-box token efficiency for structured objects.

## Query 4: "OpenAI function calling best practices tool descriptions naming schema design guide"

- **OpenAI Function Calling JSON Schema Guide 2026 (ByteTools)** — https://bytetools.io/guides/openai-function-calling — Parameters, tools, best practices.
- **The guide to structured outputs and function calling with LLMs (Agenta)** — https://agenta.ai/blog/the-guide-to-structured-outputs-and-function-calling-with-llms — Structured outputs vs function calling.
- **A Guide to Function Calling in OpenAI (Mirascope)** — https://mirascope.com/blog/openai-function-calling — Practitioner guide.
- **o3/o4-mini Function Calling Guide (OpenAI cookbook)** — https://developers.openai.com/cookbook/examples/o-series/o3o4-mini_prompting_guide — PRIMARY OpenAI. Encoding proactiveness control near tool definition.
- **Function Calling in the OpenAI API (CometAPI)** — https://www.cometapi.com/function-calling-in-the-openai-api/ — Overview.
- **Prompting Best Practices for Tool Use (OpenAI Developer Community)** — https://community.openai.com/t/prompting-best-practices-for-tool-use-function-calling/1123036 — Community best practices.
- **OpenAI Function Calling Tutorial (Vellum)** — https://www.vellum.ai/blog/openai-function-calling-tutorial — Tutorial.
- **Function calling | OpenAI API (official docs)** — https://developers.openai.com/api/docs/guides/function-calling — PRIMARY OpenAI. name/description/parameters; detailed descriptions; principle of least surprise; enums to make invalid states unrepresentable; descriptions consume tokens.
