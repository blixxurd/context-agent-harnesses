# Agent SDK overview - Claude API Docs
URL: https://platform.claude.com/docs/en/agent-sdk/overview

Retrieval note: Original URL https://platform.claude.com/docs/en/agent-sdk/overview issued a 307 redirect to https://code.claude.com/docs/en/agent-sdk/overview, which was fetched successfully. Content below extracted via WebFetch (markdown).

---

# Agent SDK overview

> Build production AI agents with Claude Code as a library

Note: Starting June 15, 2026, Agent SDK and `claude -p` usage on subscription plans will draw from a new monthly Agent SDK credit, separate from your interactive usage limits.

Build AI agents that autonomously read files, run commands, search the web, edit code, and more. The Agent SDK gives you the same tools, agent loop, and context management that power Claude Code, programmable in Python and TypeScript.

The Agent SDK includes built-in tools for reading files, running commands, and editing code, so your agent can start working immediately without you implementing tool execution.

## Get started

### Install the SDK
- TypeScript: `npm install @anthropic-ai/claude-agent-sdk`
- Python: `pip install claude-agent-sdk`

The Python package requires Python 3.10 or later. If pip reports `No matching distribution found for claude-agent-sdk`, your interpreter is older than 3.10.

Note: The TypeScript SDK bundles a native Claude Code binary for your platform as an optional dependency, so you don't need to install Claude Code separately.

### Set your API key
Get an API key from the Console, then set it as an environment variable:
```
export ANTHROPIC_API_KEY=your-api-key
```

The SDK also supports authentication via third-party API providers:
- Amazon Bedrock: set `CLAUDE_CODE_USE_BEDROCK=1` and configure AWS credentials
- Claude Platform on AWS: set `CLAUDE_CODE_USE_ANTHROPIC_AWS=1` and `ANTHROPIC_AWS_WORKSPACE_ID`, then configure AWS credentials
- Google Vertex AI: set `CLAUDE_CODE_USE_VERTEX=1` and configure Google Cloud credentials
- Microsoft Azure: set `CLAUDE_CODE_USE_FOUNDRY=1` and configure Azure credentials

Note: Unless previously approved, Anthropic does not allow third party developers to offer claude.ai login or rate limits for their products, including agents built on the Claude Agent SDK. Please use the API key authentication methods instead.

## Capabilities

### Built-in tools
| Tool | What it does |
| --- | --- |
| Read | Read any file in the working directory |
| Write | Create new files |
| Edit | Make precise edits to existing files |
| Bash | Run terminal commands, scripts, git operations |
| Monitor | Watch a background script and react to each output line as an event |
| Glob | Find files by pattern (`**/*.ts`, `src/**/*.py`) |
| Grep | Search file contents with regex |
| WebSearch | Search the web for current information |
| WebFetch | Fetch and parse web page content |
| AskUserQuestion | Ask the user clarifying questions with multiple choice options |

### Hooks
Run custom code at key points in the agent lifecycle. SDK hooks use callback functions to validate, log, block, or transform agent behavior.
Available hooks: `PreToolUse`, `PostToolUse`, `Stop`, `SessionStart`, `SessionEnd`, `UserPromptSubmit`, and more.

### Subagents
Spawn specialized agents to handle focused subtasks. Subagents are invoked via the Agent tool, so include `Agent` in `allowedTools` to auto-approve those invocations. Define custom agents with specialized instructions (description, prompt, tools).
Messages from within a subagent's context include a `parent_tool_use_id` field, letting you track which messages belong to which subagent execution.

### MCP
Connect to external systems via the Model Context Protocol: databases, browsers, APIs, and hundreds more. Example connects the Playwright MCP server via `mcp_servers={"playwright": {"command": "npx", "args": ["@playwright/mcp@latest"]}}`.

### Permissions
Control exactly which tools your agent can use. `allowed_tools` pre-approves tools (e.g. Read, Glob, Grep for a read-only agent).

### Sessions
Maintain context across multiple exchanges. Claude remembers files read, analysis done, and conversation history. Resume sessions later, or fork them to explore different approaches. Capture session ID from `SystemMessage` with `subtype == "init"` (`message.data["session_id"]`), then resume via `resume=session_id`.

### Claude Code features
The SDK supports Claude Code's filesystem-based configuration. With default options the SDK loads these from `.claude/` in your working directory and `~/.claude/`. To restrict which sources load, set `setting_sources` (Python) or `settingSources` (TypeScript).

| Feature | Description | Location |
| --- | --- | --- |
| Skills | Specialized capabilities Claude uses automatically or you invoke with `/name` | `.claude/skills/*/SKILL.md` |
| Commands | Custom commands in the legacy format. Use skills for new custom commands | `.claude/commands/*.md` |
| Memory | Project context and instructions | `CLAUDE.md` or `.claude/CLAUDE.md` |
| Plugins | Extend with skills, agents, hooks, and MCP servers | Programmatic via `plugins` option |

## Compare the Agent SDK to other Claude tools

### Agent SDK vs Client SDK
The Anthropic Client SDK gives you direct API access: you send prompts and implement tool execution yourself. The Agent SDK gives you Claude with built-in tool execution. With the Client SDK you implement a tool loop; with the Agent SDK Claude handles it.

### Agent SDK vs Claude Code CLI
Same capabilities, different interface:
| Use case | Best choice |
| --- | --- |
| Interactive development | CLI |
| CI/CD pipelines | SDK |
| Custom applications | SDK |
| One-off tasks | CLI |
| Production automation | SDK |

### Agent SDK vs Managed Agents
Managed Agents is a hosted REST API: Anthropic runs the agent and the sandbox; your application sends events and streams back results. The Agent SDK is a library that runs the agent loop inside your own process.
- Agent SDK runs in: your process, your infrastructure. Managed Agents: Anthropic-managed infrastructure.
- Interface: Python or TypeScript library vs REST API.
- Agent works on: files on your infrastructure vs a managed sandbox per session.
- Session state: JSONL on your filesystem vs Anthropic-hosted event log.
- Custom tools: in-process Python or TypeScript functions vs Claude triggers the tool, you execute and return results.

## Branding guidelines
Allowed: "Claude Agent", "Claude" (within a menu labeled "Agents"), "{YourAgentName} Powered by Claude".
Not permitted: "Claude Code" or "Claude Code Agent"; Claude Code-branded ASCII art or visual elements that mimic Claude Code.

## License and terms
Use of the Claude Agent SDK is governed by Anthropic's Commercial Terms of Service.
