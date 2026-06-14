# Subagents in the SDK - Claude API Docs
URL: https://platform.claude.com/docs/en/agent-sdk/subagents

Retrieval note: Original URL 307-redirected to https://code.claude.com/docs/en/agent-sdk/subagents. Fetched successfully via WebFetch on 2026-06-14.

# Subagents in the SDK

Subagents are separate agent instances that your main agent can spawn to handle focused subtasks. Use subagents to isolate context for focused subtasks, run multiple analyses in parallel, and apply specialized instructions without adding to the main agent's prompt.

## Overview

You can create subagents in three ways:

* **Programmatically**: use the `agents` parameter in your `query()` options (TypeScript, Python)
* **Filesystem-based**: define agents as markdown files in `.claude/agents/` directories
* **Built-in general-purpose**: Claude can invoke the built-in `general-purpose` subagent at any time via the Agent tool without you defining anything

When you define subagents, Claude determines whether to invoke them based on each subagent's `description` field. You can also explicitly request a subagent by name in your prompt (for example, "Use the code-reviewer agent to...").

## Benefits of using subagents

### Context isolation
Each subagent runs in its own fresh conversation. Intermediate tool calls and results stay inside the subagent; only its final message returns to the parent.

### Parallelization
Multiple subagents can run concurrently, so independent subtasks finish in the time of the slowest one rather than the sum of all of them. Example: during a code review, you can run `style-checker`, `security-scanner`, and `test-coverage` subagents simultaneously instead of sequentially.

### Specialized instructions and knowledge
Each subagent can have tailored system prompts with specific expertise, best practices, and constraints.

### Tool restrictions
Subagents can be limited to specific tools, reducing the risk of unintended actions. Example: a `doc-reviewer` subagent might only have access to Read and Grep tools.

## Creating subagents

### Programmatic definition (recommended)
Define subagents directly in your code using the `agents` parameter. Claude invokes subagents through the `Agent` tool, so include `Agent` in `allowedTools` to auto-approve subagent invocations without a permission prompt.

### AgentDefinition configuration

| Field | Type | Required | Description |
| description | string | Yes | Natural language description of when to use this agent |
| prompt | string | Yes | The agent's system prompt defining its role and behavior |
| tools | string[] | No | Array of allowed tool names. If omitted, inherits all tools |
| disallowedTools | string[] | No | Array of tool names to remove from the agent's tool set |
| model | string | No | Model override. Accepts alias 'fable', 'opus', 'sonnet', 'haiku', 'inherit', or full model ID. Defaults to main model |
| skills | string[] | No | List of skill names to preload into the agent's context at startup. Unlisted skills remain invocable through the Skill tool |
| memory | 'user' | 'project' | 'local' | No | Memory source for this agent |
| mcpServers | (string|object)[] | No | MCP servers available to this agent |
| initialPrompt | string | No | Auto-submitted as first user turn when agent runs as main thread agent. Ignored when invoked as subagent |
| maxTurns | number | No | Maximum number of agentic turns before the agent stops |
| background | boolean | No | Run this agent as a non-blocking background task when invoked |
| effort | 'low'|'medium'|'high'|'xhigh'|'max'|number | No | Reasoning effort level |
| permissionMode | PermissionMode | No | Permission mode for tool execution within this agent |

Note: As of Claude Code v2.1.172, subagents can spawn their own subagents. A background subagent five levels below the main agent cannot spawn further subagents; foreground subagents can spawn at any depth. To prevent a subagent from spawning others, omit `Agent` from its `tools` array or add it to `disallowedTools`.

### Filesystem-based definition (alternative)
Programmatically defined agents take precedence over filesystem-based agents with the same name.

## What subagents inherit

A subagent's context window starts fresh (no parent conversation) but isn't empty. The only channel from parent to subagent is the Agent tool's prompt string, so include any file paths, error messages, or decisions the subagent needs directly in that prompt.

The subagent receives: its own system prompt and the Agent tool's prompt; Project CLAUDE.md (loaded via settingSources); tool definitions (inherited from parent, or the subset in `tools`).

The subagent does not receive: the parent's conversation history or tool results; preloaded skill content unless listed in `AgentDefinition.skills`; the parent's system prompt.

The parent receives the subagent's final message verbatim as the Agent tool result, but may summarize it in its own response.

## Invoking subagents

### Automatic invocation
Claude automatically decides when to invoke subagents based on the task and each subagent's `description`.

### Explicit invocation
To guarantee Claude uses a specific subagent, mention it by name in your prompt.

### Dynamic agent configuration
You can create agent definitions dynamically based on runtime conditions (e.g., factory function using a more powerful model for strict reviews).

## Detecting subagent invocation

Subagents are invoked via the Agent tool. To detect when a subagent is invoked, check for `tool_use` blocks where `name` is `"Agent"`. Messages from within a subagent's context include a `parent_tool_use_id` field.

Note: The tool name was renamed from `"Task"` to `"Agent"` in Claude Code v2.1.63. Current SDK releases emit `"Agent"` in `tool_use` blocks but still use `"Task"` in the `system:init` tools list and in `result.permission_denials[].tool_name`. Checking both values in `block.name` ensures compatibility across SDK versions.

## Resuming subagents

Subagents can be resumed to continue where they left off. Resumed subagents retain their full conversation history. When a subagent completes, the Agent tool result includes a text block containing `agentId: <id>`. The built-in Explore and Plan agents are one-shot and do not return an `agentId`. To resume: capture session_id, extract agentId from the Agent tool result text, pass `resume: sessionId` in the second query and include the agent ID in your prompt.

Subagent transcripts persist independently of the main conversation:
* Main conversation compaction: subagent transcripts are unaffected (stored in separate files).
* Session persistence: subagent transcripts persist within their session.
* Automatic cleanup: Transcripts are cleaned up based on the `cleanupPeriodDays` setting (default: 30 days).

## Tool restrictions

* Omit the field: agent inherits all available tools (default)
* Specify tools: agent can only use listed tools

### Common tool combinations
| Read-only analysis | Read, Grep, Glob | Can examine code but not modify or execute |
| Test execution | Bash, Read, Grep | Can run commands and analyze output |
| Code modification | Read, Edit, Write, Grep, Glob | Full read/write access without command execution |
| Full access | All tools | Inherits all tools from parent (omit tools field) |

## Scale up with dynamic workflows

Subagents work well for a few delegated tasks per turn. For runs that coordinate dozens to hundreds of agents, use the `Workflow` tool, which moves the orchestration into a script the runtime executes outside the conversation context. The `Workflow` tool is available in the TypeScript Agent SDK v0.3.149 and later. Include `Workflow` in `allowedTools` to auto-approve workflow runs.

## Troubleshooting

### Claude not delegating to subagents
1. Check Agent invocations are approved: include `Agent` in `allowedTools`. Without it, Agent invocations fall through to your canUseTool callback or, in dontAsk mode, are denied.
2. Use explicit prompting: mention the subagent by name.
3. Write a clear description.

### Filesystem-based agents not loading
Agents defined in `.claude/agents/` are loaded at startup only. If you create a new agent file while Claude Code is running, restart the session to load it.

### Windows: long prompt failures
On Windows, subagents with very long prompts may fail due to command line length limits (8191 chars). Keep prompts concise or use filesystem-based agents for complex instructions.
