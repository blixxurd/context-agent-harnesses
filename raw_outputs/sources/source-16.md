# How the agent loop works — Claude Code Docs
URL: https://code.claude.com/docs/en/agent-sdk/agent-loop

Retrieval note: Fetched via WebFetch on 2026-06-14. Page retrieved successfully with full content.

---

# How the agent loop works

> Understand the message lifecycle, tool execution, context window, and architecture that power your SDK agents.

The Agent SDK lets you embed Claude Code's autonomous agent loop in your own applications. The SDK is a standalone package that gives you programmatic control over tools, permissions, cost limits, and output. You don't need the Claude Code CLI installed to use it.

When you start an agent, the SDK runs the same execution loop that powers Claude Code: Claude evaluates your prompt, calls tools to take action, receives the results, and repeats until the task is complete.

## The loop at a glance

Every agent session follows the same cycle:

1. **Receive prompt.** Claude receives your prompt, along with the system prompt, tool definitions, and conversation history. The SDK yields a `SystemMessage` with subtype `"init"` containing session metadata.
2. **Evaluate and respond.** Claude evaluates the current state and determines how to proceed. It may respond with text, request one or more tool calls, or both. The SDK yields an `AssistantMessage` containing the text and any tool call requests.
3. **Execute tools.** The SDK runs each requested tool and collects the results. Each set of tool results feeds back to Claude for the next decision. You can use hooks to intercept, modify, or block tool calls before they run.
4. **Repeat.** Steps 2 and 3 repeat as a cycle. Each full cycle is one turn. Claude continues calling tools and processing results until it produces a response with no tool calls.
5. **Return result.** The SDK yields a final `AssistantMessage` with the text response (no tool calls), followed by a `ResultMessage` with the final text, token usage, cost, and session ID.

A quick question ("what files are here?") might take one or two turns of calling `Glob` and responding with the results. A complex task ("refactor the auth module and update the tests") can chain dozens of tool calls across many turns.

## Turns and messages

A turn is one round trip inside the loop: Claude produces output that includes tool calls, the SDK executes those tools, and the results feed back to Claude automatically. This happens without yielding control back to your code. Turns continue until Claude produces output with no tool calls.

You can cap the loop with `max_turns` / `maxTurns`, which counts tool-use turns only. You can also use `max_budget_usd` / `maxBudgetUsd` to cap turns based on a spend threshold. Without limits, the loop runs until Claude finishes on its own. Setting a budget is a good default for production agents.

## Message types

Five core types: `SystemMessage` (session lifecycle, subtype `"init"` first, `"compact_boundary"` after compaction), `AssistantMessage` (after each Claude response), `UserMessage` (after each tool execution with tool result content), `StreamEvent` (only when partial messages enabled), `ResultMessage` (marks end of loop; final text, token usage, cost, session ID). A small number of trailing system events, such as `prompt_suggestion`, can arrive after ResultMessage, so iterate the stream to completion rather than breaking on the result.

## Tool execution

### Built-in tools
- File operations: `Read`, `Edit`, `Write`
- Search: `Glob`, `Grep`
- Execution: `Bash`
- Web: `WebSearch`, `WebFetch`
- Discovery: `ToolSearch` (dynamically find and load tools on-demand instead of preloading all of them)
- Orchestration: `Agent`, `Skill`, `AskUserQuestion`, `TaskCreate`, `TaskUpdate`

### Tool permissions
- `allowed_tools` / `allowedTools` auto-approves listed tools. Tools not listed are still available but require permission.
- `disallowed_tools` / `disallowedTools` blocks listed tools, regardless of other settings.
- `permission_mode` / `permissionMode` controls what happens to tools that aren't covered by allow or deny rules.

You can also scope individual tools with rules like `"Bash(npm *)"`. When a tool is denied, Claude receives a rejection message as the tool result and typically attempts a different approach.

### Parallel tool execution
Read-only tools (like `Read`, `Glob`, `Grep`, and MCP tools marked as read-only) can run concurrently. Tools that modify state (like `Edit`, `Write`, and `Bash`) run sequentially to avoid conflicts. Custom tools default to sequential execution. To enable parallel execution for a custom tool, set `readOnlyHint` in its annotations.

## Control how the loop runs

### Turns and budget
- Max turns (`max_turns` / `maxTurns`): Maximum tool-use round trips. Default: No limit.
- Max budget (`max_budget_usd` / `maxBudgetUsd`): Maximum cost before stopping. Default: No limit.
When either limit is hit, the SDK returns a `ResultMessage` with error subtype (`error_max_turns` or `error_max_budget_usd`).

### Effort level
The `effort` option controls how much reasoning Claude applies. Levels: `"low"` (minimal reasoning, fast; file lookups), `"medium"` (balanced; routine edits), `"high"` (thorough; refactors, debugging), `"xhigh"` (extended; recommended on Fable 5 and Opus 4.7+), `"max"` (maximum depth; multi-step problems). If you don't set `effort`, both SDKs leave the parameter unset and defer to the model's default behavior.

### Permission mode
- `"default"`: Tools not covered by allow rules trigger your approval callback; no callback means deny.
- `"acceptEdits"`: Auto-approves file edits and common filesystem commands (`mkdir`, `touch`, `mv`, `cp`, etc.); other Bash commands follow default rules.
- `"plan"`: Claude explores and plans without editing source files.
- `"dontAsk"`: Never prompts. Pre-approved tools run, everything else is denied.
- `"auto"` (TypeScript only): Uses a model classifier to approve or deny each tool call.
- `"bypassPermissions"`: Runs all allowed tools without asking. Cannot be used when running as root on Unix. Use only in isolated environments.

### Model
If you don't set `model`, the SDK uses Claude Code's default. Set it explicitly (e.g., `model="claude-sonnet-4-6"`) to pin a specific model.

## The context window

The context window does not reset between turns within a session. Everything accumulates: system prompt, tool definitions, conversation history, tool inputs, tool outputs. Content that stays the same across turns (system prompt, tool definitions, CLAUDE.md) is automatically prompt cached.

### Automatic compaction
When the context window approaches its limit, the SDK automatically compacts the conversation: it summarizes older history to free space, keeping recent exchanges and key decisions intact. Emits a message with `type: "system"` and `subtype: "compact_boundary"`. Compaction replaces older messages with a summary, so specific instructions from early in the conversation may not be preserved. Persistent rules belong in CLAUDE.md (re-injected on every request) rather than in the initial prompt.

Customization: summarization instructions in CLAUDE.md, `PreCompact` hook (receives `trigger` field: `manual` or `auto`), manual compaction via `/compact` prompt string.

### Keep context efficient
- Use subagents for subtasks. Each subagent starts with a fresh conversation; only its final response returns to the parent as a tool result.
- Be selective with tools. Every tool definition takes context space.
- Watch MCP server costs. MCP tool search defers MCP tool schemas by default and loads on demand.
- Use lower effort for routine tasks.

## Sessions and continuity
Capture the session ID from `ResultMessage.session_id` to resume later. When you resume, the full context from previous turns is restored. You can also fork a session.

## Handle the result
Result subtypes: `success` (result field available), `error_max_turns`, `error_max_budget_usd`, `error_during_execution`, `error_max_structured_output_retries` (none of the error types have result field). The `result` field is only present on the `success` variant. All result subtypes carry `total_cost_usd`, `usage`, `num_turns`, and `session_id`. Also includes `stop_reason` field (`end_turn`, `max_tokens`, `refusal`).

## Hooks
- `PreToolUse`: Before a tool executes. Validate inputs, block dangerous commands.
- `PostToolUse`: After a tool returns. Audit outputs, trigger side effects.
- `UserPromptSubmit`: When a prompt is sent. Inject additional context.
- `Stop`: When the agent finishes. Validate result, save session state.
- `SubagentStart` / `SubagentStop`: When a subagent spawns/completes.
- `PreCompact`: Before context compaction. Archive full transcript.
Hooks run in your application process, not inside the agent's context window, so they don't consume context. A `PreToolUse` hook that rejects a tool call prevents it from executing.

## Put it all together
Example combines: allowed tools (auto-approved), project settings (`setting_sources=["project"]`), `max_turns=30` (prevent runaway sessions), `effort="high"` (thorough debugging), captures session ID, handles final result, prints total cost.
