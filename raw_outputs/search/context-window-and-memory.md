# Raw Search Dump: context-window-and-memory

**Angle:** context-window-and-memory

**Question:** What are the best practices for managing the context window and agent memory over long-running sessions, including compaction, summarization, retrieval, scratchpads, and persistent memory stores?

---

## Query 1: "Anthropic context engineering long-running agents compaction"

Results:
- Effective context engineering for AI agents \ Anthropic — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Context Engineering: Why More Tokens Makes Agents Worse — https://www.morphllm.com/context-engineering
- How Anthropic Scaling Managed Agents with Future-proof Architecture? — https://kenhuangus.substack.com/p/how-anthropic-scaling-managed-agents
- Context Engineering (LangChain blog) — https://www.langchain.com/blog/context-engineering-for-agents
- Claude Opus 4.6 Introduces Adaptive Reasoning and Context Compaction for Long-Running Agents (InfoQ) — https://www.infoq.com/news/2026/03/opus-4-6-context-compaction/
- Harness design for long-running application development \ Anthropic — https://www.anthropic.com/engineering/harness-design-long-running-apps
- Anthropic: Long-Running Agent Harness for Multi-Context Software Development (ZenML LLMOps DB) — https://www.zenml.io/llmops-database/long-running-agent-harness-for-multi-context-software-development
- Engineering at Anthropic — https://anthropic.com/engineering/effective-harnesses-for-long-running-agents

Notes seen: Compaction = summarize conversation near context limit, reinitiate new window with summary (first lever). Just-in-time context: maintain lightweight references, load at runtime. Claude Agent SDK automatic compaction handles context growth across one continuous session. Session log defers token-keep decisions; context management logic belongs in harness, not session. Opus 4.6 adds Adaptive Thinking + Compaction API for context rot.

## Query 2: "Claude Agent SDK context management compaction memory tool"

Results:
- Memory and Context Management in Claude Agent SDK (open-docs GitHub) — https://github.com/bgauryy/open-docs/blob/main/docs/claude-agent-sdk/memory-and-context.md
- Claude Agent SDK Tutorial (DataCamp) — https://www.datacamp.com/tutorial/how-to-use-claude-agent-sdk
- Giving Claude a Terminal: Inside the Claude Agent SDK (Medium / Rick Hightower) — https://medium.com/spillwave-solutions/giving-claude-a-terminal-inside-the-claude-agent-sdk-49a5f01dcce5
- Context Management and Compaction (DeepWiki / claude-cookbooks) — https://deepwiki.com/anthropics/claude-cookbooks/6.3-context-management-and-compaction
- Memory tool - Claude API Docs — https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
- Automatic context compaction (Claude Cookbook) — https://platform.claude.com/cookbook/tool-use-automatic-context-compaction
- Context engineering: memory, compaction, and tool clearing (Claude Cookbook) — https://platform.claude.com/cookbook/tool-use-context-engineering-context-engineering-tools
- How to Create AI Agents using Claude Agent SDK (helply) — https://helply.com/blog/create-ai-agent-using-claude-agent-sdk
- Inside Claude Code, The Architecture Behind Tools, Memory, Hooks, and MCP (penligent) — https://www.penligent.ai/hackinglabs/inside-claude-code-the-architecture-behind-tools-memory-hooks-and-mcp/
- Claude Code & Agent Memory: Best Practices for 2026 (orchestrator.dev) — https://orchestrator.dev/blog/2026-04-06--claude-code-agent-memory-2026/

Notes seen: compaction_control monitors token usage per turn, injects summary prompt as user turn when threshold exceeded. Compaction addresses context rot. Memory tool pairs with context editing and compaction (server-side summarization). Compaction compresses whole window; clearing drops stale re-fetchable data; memory moves info out of window to survive across sessions.

## Query 3: "LLM agent memory short-term long-term retrieval scratchpad best practices"

Results:
- Agent Memory That Actually Works: Short-Term Scratchpads, Long-Term Profiles & Retrieval Hooks (Medium / Sopan Deole) — https://medium.com/@deolesopan/agent-memory-that-actually-works-short-term-scratchpads-long-term-profiles-retrieval-hooks-1fa0a50d5f5d
- LLM Agent Memory: Short & Long-Term (apxml.com) — https://apxml.com/courses/multi-agent-llm-systems-design-implementation/chapter-2-architecting-agents-defining-roles/memory-mechanisms-llm-agents
- Deploying Foundation Model Powered Agent Services: A Survey (arXiv) — https://arxiv.org/pdf/2412.13437
- Personal LLM Agents: Insights and Survey (arXiv) — https://arxiv.org/pdf/2401.05459
- COLA: A Scalable Multi-Agent Framework For Windows UI Task Automation (arXiv) — https://arxiv.org/pdf/2503.09263
- The Future is Agentic: Multi-Agent Recommender Systems (arXiv) — https://arxiv.org/pdf/2507.02097
- Design Patterns for Long-Term Memory in LLM-Powered Architectures (Serokell) — https://serokell.io/blog/design-patterns-for-long-term-memory-in-llm-powered-architectures
- What Is Agent Memory? (MongoDB) — https://www.mongodb.com/resources/basics/artificial-intelligence/agent-memory

Notes seen: Lightweight memory layer = short-term scratchpad + concise long-term profile + KB hooks. Scratchpad = rolling token-bounded summary, rotates as conversation grows (cap ~1-2k tokens, drop oldest first). Long-term profile stores durable compact facts via vector DBs. Promote selectively; use IDs not blobs (store references, fetch on demand). Re-rank/summarize retrieved chunks.

## Query 4: "agent context window summarization persistent memory store long-running session"

Results:
- Agent Context Engineering 2026: Sliding Windows, Hierarchical Summarization, and Memory Offloading (AgentMarketCap) — https://agentmarketcap.ai/blog/2026/04/11/agent-context-engineering-sliding-windows-memory-2026
- Context Window Management: Strategies for Long-Context AI Agents and Chatbots (getmaxim.ai) — https://www.getmaxim.ai/articles/context-window-management-strategies-for-long-context-ai-agents-and-chatbots/
- The Ultimate Guide to LLM Memory (Medium / Tanishk Soni) — https://medium.com/@sonitanishk2003/the-ultimate-guide-to-llm-memory-from-context-windows-to-advanced-agent-memory-systems-3ec106d2a345
- Spring AI Agentic Patterns (Part 6): AutoMemoryTools — Persistent Agent Memory Across Sessions (spring.io) — https://spring.io/blog/2026/04/07/spring-ai-agentic-patterns-6-memory-tools/
- MemMachine: A Ground-Truth-Preserving Memory System for Personalized AI Agents (arXiv) — https://arxiv.org/pdf/2604.04853
- Amazon Bedrock AgentCore Memory: Building context-aware agents (AWS) — https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-agentcore-memory-building-context-aware-agents/
- Context Engineering - Short-Term Memory Management with Sessions from OpenAI Agents SDK (OpenAI Cookbook) — https://cookbook.openai.com/examples/agents_sdk/session_memory
- Context Engineering - Short-Term Memory Management with Sessions (OpenAI developers) — https://developers.openai.com/cookbook/examples/agents_sdk/session_memory
- Context Window Management and Session Lifecycle for Long-Running AI Agents (Zylos Research) — https://zylos.ai/research/2026-03-31-context-window-management-session-lifecycle-long-running-agents/
- Agile V: Compliance-Ready Framework for AI-Augmented Engineering (arXiv) — https://arxiv.org/pdf/2602.20684

Notes seen: Hierarchical memory — short-term verbatim, medium-term compressed summaries, long-term key facts/relationships. Three-tier: hot (last 10 turns verbatim), warm (turns 11-40 rolling detailed summary), cold (everything before, broad summary). Anchored iterative summarization (merge into persistent state) outperforms full reconstruction. Session store (cache) vs cross-session long-term memory in DB. Smart memory reduces token cost 80-90%, improves quality 26%.

## Query 5: "Anthropic memory tool context editing clearing tool results documentation"

Results:
- Memory tool - Claude Docs — https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool
- Managing context on the Claude Developer Platform (Anthropic news) — https://www.anthropic.com/news/context-management
- Anthropic Claude tool use - Amazon Bedrock — https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages-tool-use.html
- Context editing - Claude API Docs — https://platform.claude.com/docs/en/build-with-claude/context-editing
- Exploring Anthropic's Memory Tool (Leonie Monigatti) — https://www.leoniemonigatti.com/blog/claude-memory-tool.html
- Memory tool - Claude API Docs — https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
- Effective context engineering for AI agents \ Anthropic — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Context engineering: memory, compaction, and tool clearing (Claude Cookbook) — https://platform.claude.com/cookbook/tool-use-context-engineering-context-engineering-tools
- Claude API Memory Tool: Build Agents That Learn (Thomas Wiegold) — https://thomas-wiegold.com/blog/claude-api-memory-tool-guide/
- claude-cookbooks/tool_use/memory_cookbook.ipynb (anthropics GitHub) — https://github.com/anthropics/claude-cookbooks/blob/main/tool_use/memory_cookbook.ipynb

Notes seen: Memory tool + context editing auto-clears old tool results past threshold. Claude gets warning notification to preserve important info to memory files before clearing, retrieves later (memory as extension of working context). Beta header context-management-2025-06-27, clear_tool_uses_20250919. Memory tool + context editing = +39% over baseline; context editing alone = +29%.
