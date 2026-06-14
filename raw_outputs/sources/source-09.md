# Agent SDK reference - TypeScript - Claude API Docs
URL: https://platform.claude.com/docs/en/agent-sdk/typescript

Retrieval note: Fetched 2026-06-14. Original URL 307-redirects to https://code.claude.com/docs/en/agent-sdk/typescript. Content extracted via WebFetch (page converted to markdown, summarized by fast model). The following preserves function signatures, types, options table with defaults, and usage patterns.

---

## Installation

```bash
npm install @anthropic-ai/claude-agent-sdk
```

The SDK bundles a native Claude Code binary as an optional dependency. If your package manager skips optional dependencies, set `pathToClaudeCodeExecutable` to a separately installed `claude` binary.

## Core Functions

### `query()`

Primary function for interacting with Claude Code. Creates an async generator that streams messages.

```typescript
function query({
  prompt,
  options
}: {
  prompt: string | AsyncIterable<SDKUserMessage>;
  options?: Options;
}): Query;
```

- `prompt`: Input prompt as string or async iterable for streaming mode
- `options`: Optional configuration object
- Returns: `Query` object extending `AsyncGenerator<SDKMessage, void>` with additional methods

### `startup()`

Pre-warms the CLI subprocess before a prompt is available.

```typescript
function startup(params?: {
  options?: Options;
  initializeTimeoutMs?: number;
}): Promise<WarmQuery>;
```

Moves subprocess spawn and initialization out of the critical path.

### `tool()`

Creates a type-safe MCP tool definition.

```typescript
function tool<Schema extends AnyZodRawShape>(
  name: string,
  description: string,
  inputSchema: Schema,
  handler: (args: InferShape<Schema>, extra: unknown) => Promise<CallToolResult>,
  extras?: { annotations?: ToolAnnotations }
): SdkMcpToolDefinition<Schema>;
```

### `createSdkMcpServer()`

Creates an MCP server instance in the same process.

```typescript
function createSdkMcpServer(options: {
  name: string;
  version?: string;
  tools?: Array<SdkMcpToolDefinition<any>>;
}): McpSdkServerConfigWithInstance;
```

### Session Management Functions

- `listSessions(options?: { dir?: string; limit?: number; includeWorktrees?: boolean }): Promise<SDKSessionInfo[]>` — Discovers past sessions with metadata.
- `getSessionMessages(sessionId, options?)` — Reads user and assistant messages from a past session transcript.
- `getSessionInfo(sessionId, options?)` — Reads metadata for a single session by ID without scanning the full project directory.
- `renameSession(sessionId, title, options?)` — Renames a session by appending a custom-title entry.
- `tagSession(sessionId, tag, options?)` — Tags a session. Pass `null` to clear the tag.

### `resolveSettings()`

Resolves effective Claude Code settings for a directory without spawning the CLI.

- `cwd`: default `process.cwd()`
- `settingSources`: default all
- `managedSettings`: Policy-tier settings
- `serverManagedSettings`: Server-managed settings

## Query Object Interface

```typescript
interface Query extends AsyncGenerator<SDKMessage, void> {
  interrupt(): Promise<void>;
  rewindFiles(userMessageId: string, options?: { dryRun?: boolean }): Promise<RewindFilesResult>;
  setPermissionMode(mode: PermissionMode): Promise<void>;
  setModel(model?: string): Promise<void>;
  setMaxThinkingTokens(maxThinkingTokens: number | null): Promise<void>;
  applyFlagSettings(settings): Promise<void>;
  initializationResult(): Promise<SDKControlInitializeResponse>;
  supportedCommands(): Promise<SlashCommand[]>;
  supportedModels(): Promise<ModelInfo[]>;
  supportedAgents(): Promise<AgentInfo[]>;
  mcpServerStatus(): Promise<McpServerStatus[]>;
  accountInfo(): Promise<AccountInfo>;
  reconnectMcpServer(serverName: string): Promise<void>;
  toggleMcpServer(serverName: string, enabled: boolean): Promise<void>;
  setMcpServers(servers): Promise<McpSetServersResult>;
  streamInput(stream: AsyncIterable<SDKUserMessage>): Promise<void>;
  stopTask(taskId: string): Promise<void>;
  close(): void;
}
```

## Options Configuration (selected defaults)

| Property | Type | Default |
|----------|------|---------|
| `abortController` | `AbortController` | `new AbortController()` |
| `additionalDirectories` | `string[]` | `[]` |
| `agentProgressSummaries` | `boolean` | `false` |
| `allowDangerouslySkipPermissions` | `boolean` | `false` |
| `allowedTools` | `string[]` | `[]` (auto-approve without prompting) |
| `canUseTool` | `CanUseTool` | `undefined` (custom permission function) |
| `continue` | `boolean` | `false` |
| `cwd` | `string` | `process.cwd()` |
| `disallowedTools` | `string[]` | `[]` |
| `effort` | `'low' \| 'medium' \| 'high' \| 'xhigh' \| 'max'` | Model default |
| `enableFileCheckpointing` | `boolean` | `false` (file change tracking for rewinding) |
| `env` | `Record<string, string \| undefined>` | `process.env` |
| `forkSession` | `boolean` | `false` |
| `hooks` | `Partial<Record<HookEvent, HookCallbackMatcher[]>>` | `{}` |
| `includePartialMessages` | `boolean` | `false` |
| `loadTimeoutMs` | `number` | `60000` |
| `maxBudgetUsd` | `number` | `undefined` (stop when cost estimate reaches USD value) |
| `maxThinkingTokens` | `number` | Deprecated: use `thinking` |
| `maxTurns` | `number` | `undefined` |
| `mcpServers` | `Record<string, McpServerConfig>` | `{}` |
| `permissionMode` | `PermissionMode` | `'default'` |
| `persistSession` | `boolean` | `true` |
| `sessionStoreFlush` | `'batched' \| 'eager'` | `'batched'` |
| `strictMcpConfig` | `boolean` | `false` (use only servers in `mcpServers`) |
| `thinking` | `ThinkingConfig` | `{ type: 'adaptive' }` |

### Environment Variables for API Handling

```typescript
{
  env: {
    ...process.env,
    API_TIMEOUT_MS: "120000",                        // Default: 600000
    CLAUDE_CODE_MAX_RETRIES: "2",                    // Default: 10
    CLAUDE_ASYNC_AGENT_STALL_TIMEOUT_MS: "120000",   // Default: 600000
    CLAUDE_ENABLE_STREAM_WATCHDOG: "1",
    CLAUDE_STREAM_IDLE_TIMEOUT_MS: "300000",
  }
}
```

## Permission Modes

```typescript
type PermissionMode =
  | "default"            // Standard permission behavior
  | "acceptEdits"        // Auto-accept file edits
  | "bypassPermissions"  // Bypass permission checks
  | "plan"               // Planning mode - explore without editing
  | "dontAsk"            // Don't prompt, deny if not pre-approved
  | "auto";              // Use model classifier
```

## SDKResultMessage

- `subtype`: `"success"` | `"error_max_turns"` | `"error_during_execution"` | `"error_max_budget_usd"` | `"error_max_structured_output_retries"`
- Includes: `duration_ms`, `duration_api_ms`, `is_error`, `num_turns`, `total_cost_usd`, `usage`, `modelUsage`, `structured_output`, `permission_denials`

## Agent Definition

```typescript
type AgentDefinition = {
  description: string;
  tools?: string[];
  disallowedTools?: string[];
  prompt: string;
  model?: string;
  mcpServers?: AgentMcpServerSpec[];
  skills?: string[];
  initialPrompt?: string;
  maxTurns?: number;
  background?: boolean;
  memory?: "user" | "project" | "local";
  effort?: "low" | "medium" | "high" | "xhigh" | "max" | number;
  permissionMode?: PermissionMode;
  criticalSystemReminder_EXPERIMENTAL?: string;
};
```

## Setting Sources

```typescript
type SettingSource = "user" | "project" | "local";
```

- `"user"`: Global user settings at `~/.claude/settings.json`
- `"project"`: Shared project settings at `.claude/settings.json`
- `"local"`: Local project settings at `.claude/settings.local.json`

Default behavior loads all sources. Pass empty array `[]` to disable filesystem settings.

## MCP Server Configuration

`McpServerConfig` union: `McpStdioServerConfig | McpSSEServerConfig | McpHttpServerConfig | McpSdkServerConfigWithInstance` (types `"stdio"`, `"sse"`, `"http"`, `"sdk"`).
