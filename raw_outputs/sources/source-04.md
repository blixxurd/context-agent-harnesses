# Give Claude custom tools — Claude Agent SDK Docs
URL: https://platform.claude.com/docs/en/agent-sdk/custom-tools

Retrieval note: Fetched 2026-06-14 via WebFetch. Original URL https://platform.claude.com/docs/en/agent-sdk/custom-tools issued a 307 redirect to https://code.claude.com/docs/en/agent-sdk/custom-tools, which was fetched successfully.

---

# Give Claude custom tools

Define custom tools with the Claude Agent SDK's in-process MCP server so Claude can call your functions, hit your APIs, and perform domain-specific operations.

Custom tools extend the Agent SDK by letting you define your own functions that Claude can call during a conversation. Using the SDK's in-process MCP server, you can give Claude access to databases, external APIs, domain-specific logic, or any other capability your application needs.

This guide covers how to define tools with input schemas and handlers, bundle them into an MCP server, pass them to `query`, and control which tools Claude can access. It also covers error handling, tool annotations, and returning non-text content like images.

## Quick reference

- Define a tool: Use `@tool` (Python) or `tool()` (TypeScript) with a name, description, schema, and handler.
- Register a tool with Claude: Wrap in `create_sdk_mcp_server` / `createSdkMcpServer` and pass to `mcpServers` in `query()`.
- Pre-approve a tool: Add to your allowed tools.
- Remove a built-in tool from Claude's context: Pass a `tools` array listing only the built-ins you want.
- Let Claude call tools in parallel: Set `readOnlyHint: true` on tools with no side effects.
- Handle errors without stopping the loop: Return `isError: true` instead of throwing.
- Return images or files: Use `image` or `resource` blocks in the content array.
- Return a machine-readable JSON result: Set `structuredContent` on the result.
- Scale to many tools: Use tool search to load tools on demand.

## Create a custom tool

A tool is defined by four parts, passed as arguments to the `tool()` helper in TypeScript or the `@tool` decorator in Python:

- Name: a unique identifier Claude uses to call the tool.
- Description: what the tool does. Claude reads this to decide when to call it.
- Input schema: the arguments Claude must provide. In TypeScript this is always a Zod schema, and the handler's `args` are typed from it automatically. In Python this is a dict mapping names to types, like `{"latitude": float}`, which the SDK converts to JSON Schema for you. The Python decorator also accepts a full JSON Schema dict directly when you need enums, ranges, optional fields, or nested objects.
- Handler: the async function that runs when Claude calls the tool. It receives the validated arguments and must return an object with:
  - `content` (required): an array of result blocks, each with a `type` of `"text"`, `"image"`, `"audio"`, `"resource"`, or `"resource_link"`.
  - `structuredContent` (optional): a JSON object holding the result as machine-readable data, returned alongside `content`.
  - `isError` (optional): set to `true` to signal a tool failure so Claude can react to it.

After defining a tool, wrap it in a server with `createSdkMcpServer` (TypeScript) or `create_sdk_mcp_server` (Python). The server runs in-process inside your application, not as a separate process.

Tip: To make a parameter optional: in TypeScript, add `.default()` to the Zod field. In Python, the dict schema treats every key as required, so leave the parameter out of the schema, mention it in the description string, and read it with `args.get()` in the handler.

### Call a custom tool

Pass the MCP server you created to `query` via the `mcpServers` option. The key in `mcpServers` becomes the `{server_name}` segment in each tool's fully qualified name: `mcp__{server_name}__{tool_name}`. List that name in `allowedTools` so the tool runs without a permission prompt.

### Add more tools

A server holds as many tools as you list in its `tools` array. With more than one tool on a server, you can list each one in `allowedTools` individually or use the wildcard `mcp__weather__*` to cover every tool the server exposes.

Every tool in this array consumes context window space on every turn. If you're defining dozens of tools, see tool search to load them on demand instead.

### Add tool annotations

Tool annotations are optional metadata describing how a tool behaves. Pass them as the fifth argument to `tool()` helper in TypeScript or via the `annotations` keyword argument for the `@tool` decorator in Python. All hint fields are Booleans.

| Field | Default | Meaning |
| `readOnlyHint` | `false` | Tool does not modify its environment. Controls whether the tool can be called in parallel with other read-only tools. |
| `destructiveHint` | `true` | Tool may perform destructive updates. Informational only. |
| `idempotentHint` | `false` | Repeated calls with the same arguments have no additional effect. Informational only. |
| `openWorldHint` | `true` | Tool reaches systems outside your process. Informational only. |

Annotations are metadata, not enforcement. A tool marked `readOnlyHint: true` can still write to disk if that's what the handler does. Keep the annotation accurate to the handler.

## Control tool access

### Tool name format

- Pattern: `mcp__{server_name}__{tool_name}`
- Example: A tool named `get_temperature` in server `weather` becomes `mcp__weather__get_temperature`

### Configure allowed tools

The `tools` option and the allowed/disallowed lists affect two layers: availability, which controls whether a tool appears in Claude's context, and permission, which controls whether a call is approved once Claude attempts it. `tools` and bare-name `disallowedTools` entries change availability. `allowedTools` and scoped `disallowedTools` rules change permission only.

| Option | Layer | Effect |
| `tools: ["Read", "Grep"]` | Availability | Only the listed built-ins are in Claude's context. Unlisted built-ins are removed. MCP tools are unaffected. |
| `tools: []` | Availability | All built-ins are removed. Claude can only use your MCP tools. |
| allowed tools | Permission | Listed tools run without a permission prompt. Unlisted tools remain available; calls go through the permission flow. |
| disallowed tools | Both | A bare tool name such as `"Bash"` removes the tool from Claude's context, the same as omitting it from `tools`. A scoped rule such as `"Bash(rm *)"` leaves the tool in context and denies only matching calls. |

To remove a built-in entirely, omit it from `tools` or list its bare name in `disallowedTools` (Python: `disallowed_tools`); both keep the tool out of context so Claude never attempts it. A scoped `disallowedTools` rule blocks matching calls but leaves the tool visible, so Claude may waste a turn trying it.

## Handle errors

How your handler reports errors determines whether the agent loop continues or stops:

| What happens | Result |
| Handler throws an uncaught exception | Agent loop stops. Claude never sees the error, and the `query` call fails. |
| Handler catches the error and returns `isError: true` (TS) / `"is_error": True` (Python) | Agent loop continues. Claude sees the error as data and can retry, try a different tool, or explain the failure. |

## Return images and resources

The `content` array in a tool result accepts `text`, `image`, `audio`, `resource`, and `resource_link` blocks. You can mix them in the same response. Audio blocks are saved to disk and Claude receives a text block with the saved file path. Resource link blocks are converted to a text block containing the link's name, URI, and description.

### Images

An image block carries the image bytes inline, encoded as base64. There is no URL field. To return an image that lives at a URL, fetch it in the handler, read the response bytes, and base64-encode them before returning.

- `data`: Base64-encoded bytes. Raw base64 only, no `data:image/...;base64,` prefix.
- `mimeType`: Required. For example `image/png`, `image/jpeg`, `image/webp`, `image/gif`.

### Resources

A resource block embeds a piece of content identified by a URI. The URI is a label for Claude to reference; the actual content rides in the block's `text` or `blob` field. The SDK does not read from the path in the URI.

## Return structured data

`structuredContent` is an optional JSON object on the result, separate from the `content` array. When `structuredContent` is set, Claude receives the JSON plus any image or resource blocks from `content`. Text blocks in `content` are not forwarded, since they are assumed to duplicate the structured data.

Note: The Python `@tool` decorator forwards only `content` and `is_error` from the handler's return dict. To return `structuredContent` from Python, run a standalone MCP server instead of an in-process SDK server.

## Example: unit converter

Demonstrates two patterns:
- Enum schemas: In TypeScript, use `z.enum()`. In Python, the dict schema doesn't support enums, so the full JSON Schema dict is required.
- Unsupported input handling: when a conversion pair isn't found, the handler returns `isError: true`.

## Next steps / Related

- Tool search to defer loading tools until Claude needs them.
- Connect MCP servers (filesystem, GitHub, Slack) via `mcp`.
- Configure permissions.
