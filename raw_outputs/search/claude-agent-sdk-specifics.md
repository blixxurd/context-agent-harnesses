# Raw Search Dump: claude-agent-sdk-specifics

**Angle:** claude-agent-sdk-specifics

**Question:** What are the core building blocks, primitives, and recommended patterns of the Anthropic Claude Agent SDK specifically (its loop, tools/MCP integration, sessions, hooks, permissions) and how do they map to a custom TS harness?

---

## Query 1: "Claude Agent SDK building blocks documentation TypeScript"

- GitHub - anthropics/claude-agent-sdk-typescript — https://github.com/anthropics/claude-agent-sdk-typescript
- Agent SDK reference - TypeScript - Claude Code Docs — https://code.claude.com/docs/en/agent-sdk/typescript
- Agent SDK reference - TypeScript - Claude API Docs — https://platform.claude.com/docs/en/agent-sdk/typescript
- Agent SDK overview - Claude API Docs — https://platform.claude.com/docs/en/agent-sdk/overview
- Build a Claude-Code-Like AI Agent with Claude Agent SDK (TypeScript) – Kanaries — https://docs.kanaries.net/topics/AICoding/build-claude-code-with-claude-agent-sdk
- Claude Agent SDK | Promptfoo — https://www.promptfoo.dev/docs/providers/claude-agent-sdk/
- The Claude Developer Guide Agent SDK Reference— TypeScript SDK | GoPenAI — https://blog.gopenai.com/the-claude-developer-guide-agent-sdk-reference-typescript-sdk-db201fae7e16
- Claude Agent SDK TypeScript - Building Production AI Agents With the Full API | Team 400 Blog — https://team400.ai/blog/2026-04-claude-agent-sdk-typescript-building-production-agents
- TypeScript SDK V2 interface (preview) - Claude API Docs — https://platform.claude.com/docs/en/agent-sdk/typescript-v2-preview
- claude code sdk — https://docs.anthropic.com/s/claude-code-sdk

Notes: query() is the core function. Building blocks: optimized Claude integration w/ automatic prompt caching, rich tool ecosystem (file ops, code exec, web search, MCP extensibility), advanced permissions (allowedTools, disallowedTools, permissionMode), production essentials (error handling, session management, monitoring). Install via `npm install @anthropic-ai/claude-agent-sdk`. Tool input schema types exported for type-safe interactions.

---

## Query 2: "Anthropic Claude Agent SDK MCP tools sessions hooks permissions"

- Claude Agent SDK | Promptfoo — https://www.promptfoo.dev/docs/providers/claude-agent-sdk/
- Configure Claude Code to Power Your Agent Team | David Haberlah | Medium — https://medium.com/@haberlah/configure-claude-code-to-power-your-agent-team-90c8d3bca392
- Agent SDK overview - Claude API Docs — https://platform.claude.com/docs/en/agent-sdk/overview
- GitHub - kenneth-liao/claude-agent-sdk-intro — https://github.com/kenneth-liao/claude-agent-sdk-intro
- Inside Claude Code, The Architecture Behind Tools, Memory, Hooks, and MCP — https://www.penligent.ai/hackinglabs/inside-claude-code-the-architecture-behind-tools-memory-hooks-and-mcp/
- Configure permissions - Claude API Docs — https://platform.claude.com/docs/en/agent-sdk/permissions
- Connect to external tools with MCP - Claude API Docs — https://platform.claude.com/docs/en/agent-sdk/mcp
- Agent SDK overview - Claude Code Docs — https://code.claude.com/docs/en/agent-sdk/overview
- Claude Agent SDK Complete Guide - Building Custom Agents Beyond the CLI | hidekazu-konishi.com — https://hidekazu-konishi.com/entry/claude_agent_sdk_complete_guide.html
- RubyGems claude_agent — https://rubygems.org/gems/claude_agent

Notes: Hooks inject shell commands / LLM evals at lifecycle points (SessionStart, SessionEnd, UserPromptSubmit, PreToolUse, PostToolUse, Stop, SubagentStop, PreCompact, etc.). PreToolUse hook can return allow/deny overriding permission system. Permissions: permission modes + rules + canUseTool callback at runtime. Sessions: interrupt() on TS Query object to halt run, change permission mode mid-session. SDK provides full agent loop: built-in tools, permission gating, MCP, hooks, subagents, provider routing.

---

## Query 3: "building agents with Claude Agent SDK best practices Anthropic engineering blog agent loop"

- Claude Agents SDK: Best Practices From the Team That Built It | Robert Mill | Medium — https://bertomill.medium.com/claude-agents-sdk-best-practices-from-the-team-that-built-it-63580d1a0c3b
- Effective harnesses for long-running agents \ Anthropic — https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- Building Agents with Claude: From Skills to Scheduled Tasks and Routines | Hatchworks — https://hatchworks.com/blog/claude/building-agents-with-claude/
- Three Ways To Build AI Agents With Claude | Cobus Greyling | Medium — https://cobusgreyling.medium.com/three-ways-to-build-ai-agents-with-claude-54db80194127
- Agent SDK overview - Claude Code Docs — https://code.claude.com/docs/en/agent-sdk/overview
- Equipping agents for the real world with Agent Skills \ Anthropic — https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- Claude's Context Engineering Secrets | Bojie Li — https://01.me/en/2025/12/context-engineering-from-claude/
- Engineering at Anthropic: Building agents with the Claude Agent SDK — https://anthropic.com/engineering/building-agents-with-the-claude-agent-sdk

Notes: Agent SDK gives Claude with built-in tool execution — Claude handles the tool loop autonomously; with the Client SDK (raw Messages API) you implement the tool loop yourself. Long-running agents: initializer agent + coding agent leaving artifacts across sessions. Agent Skills = folders of instructions/scripts/resources discovered & loaded dynamically. Code-first: control system prompt, tools, model, conversation loop explicitly.

---

## Query 4: "Claude Agent SDK custom tools createSdkMcpServer in-process MCP TypeScript"

- claude-agent-sdk-typescript | LobeHub Skills — https://lobehub.com/skills/waltersumbon-claude-agent-sdk-skill-claude-agent-sdk-typescript
- Give Claude custom tools - Claude Code Docs — https://code.claude.com/docs/en/agent-sdk/custom-tools
- Give Claude custom tools - Claude API Docs — https://platform.claude.com/docs/en/agent-sdk/custom-tools
- Agent SDK reference - TypeScript - Claude API Docs — https://platform.claude.com/docs/en/agent-sdk/typescript
- createSdkMcpServer() returns object without connect() method... Issue #12 — https://github.com/anthropics/claude-agent-sdk-typescript/issues/12
- Claude Agent SDK Complete Guide | hidekazu-konishi.com — https://hidekazu-konishi.com/entry/claude_agent_sdk_complete_guide.html
- Build a Claude-Code-Like AI Agent (TypeScript) – Kanaries — https://docs.kanaries.net/topics/AICoding/build-claude-code-with-claude-agent-sdk
- Claude Agent SDK TypeScript - Building Production AI Agents | Team 400 Blog — https://team400.ai/blog/2026-04-claude-agent-sdk-typescript-building-production-agents

Notes: Custom tools via in-process MCP server. tool() creates type-safe defs using Zod schemas (handler args typed automatically). Wrap with createSdkMcpServer (runs in-process, not separate process). Tool = name + description + input schema (Zod) + handler. Pass to query() via mcpServers option. Prefer SDK MCP servers over external ones for custom tools (less overhead, easier debugging).
