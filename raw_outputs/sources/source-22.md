# Memory tool — Claude Docs
URL: https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool

Retrieval note: Original URL 302-redirected to https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool. Fetched successfully via WebFetch on 2026-06-14.

---

# Memory tool

The memory tool enables Claude to store and retrieve information across conversations through a memory file directory. Claude can create, read, update, and delete files that persist between sessions, allowing it to build knowledge over time without keeping everything in the context window.

This is the key primitive for just-in-time context retrieval: rather than loading all relevant information upfront, agents store what they learn in memory and pull it back on demand. This keeps the active context focused on what's currently relevant, critical for long-running workflows where loading everything at once would overwhelm the context window.

The memory tool operates client-side: you control where and how the data is stored through your own infrastructure.

This feature is eligible for Zero Data Retention (ZDR). When your organization has a ZDR arrangement, data sent through this feature is not stored after the API response is returned.

## Use cases
- Maintain project context across multiple agent executions
- Learn from past interactions, decisions, and feedback
- Build knowledge bases over time
- Enable cross-conversation learning where Claude improves at recurring workflows

## How it works

When enabled, Claude automatically checks its memory directory before starting tasks. Claude can create, read, update, and delete files in the `/memories` directory to store what it learns while working, then reference those memories in future conversations to handle similar tasks more effectively or pick up where it left off.

Since this is a client-side tool, Claude makes tool calls to perform memory operations, and your application executes those operations locally. This gives you complete control over where and how the memory is stored. For security, you should restrict all memory operations to the `/memories` directory.

### Example interaction
When you ask Claude to help with a task, Claude automatically checks its memory directory first (e.g. a `view` command on `/memories`), reads relevant files, then uses the memory to help.

## Getting started
1. Add the memory tool to your request
2. Implement client-side handlers for memory operations

The SDKs provide memory tool helpers that handle the tool interface. You can subclass `BetaAbstractMemoryTool` (Python and C#), use `betaMemoryTool` (TypeScript), or implement `BetaMemoryToolHandler` (Java) to implement your own memory backend (file-based, database, cloud storage, encrypted files, etc.).

## Basic usage
Tool type identifier: `"type": "memory_20250818", "name": "memory"`. Example uses model `claude-opus-4-8`.

## Tool commands
Your client-side implementation needs to handle these memory tool commands:

### view
Shows directory contents or file contents with optional line ranges. For directories: lists files up to 2 levels deep, shows human-readable sizes (e.g. `5.5K`, `1.2M`), excludes hidden items (files starting with `.`) and `node_modules`, uses tab character between size and path.

For files: returns file contents with a header and line numbers.
- Width: 6 characters, right-aligned with space padding
- Separator: Tab character between line number and content
- Indexing: 1-indexed (first line is line 1)
- Line limit: Files with more than 999,999 lines should return an error: `"File {path} exceeds maximum line limit of 999,999 lines."`

Error: File/directory does not exist: `"The path {path} does not exist. Please provide a valid path."`

### create
Create a new file. Success: `"File created successfully at: {path}"`. Error if file already exists: `"Error: File {path} already exists"`.

### str_replace
Replace text in a file. Success: `"The memory file has been edited."`. Errors: file does not exist; text not found (old_str did not appear verbatim); duplicate text (multiple occurrences).

### insert
Insert text at a specific line. Success: `"The file {path} has been edited."`. Invalid line number error if outside `[0, n_lines]`.

### delete
Delete a file or directory. Success: `"Successfully deleted {path}"`. Deletes the directory and all its contents recursively.

### rename
Rename or move a file/directory. Success: `"Successfully renamed {old_path} to {new_path}"`. Destination already exists: returns an error (do not overwrite).

## Prompting guidance
This instruction is automatically included in the system prompt when the memory tool is enabled:

```text
IMPORTANT: ALWAYS VIEW YOUR MEMORY DIRECTORY BEFORE DOING ANYTHING ELSE.
MEMORY PROTOCOL:
1. Use the `view` command of your `memory` tool to check for earlier progress.
2. ... (work on the task) ...
     - As you make progress, record status / progress / thoughts etc in your memory.
ASSUME INTERRUPTION: Your context window might be reset at any moment, so you risk losing any progress that is not recorded in your memory directory.
```

If Claude creates cluttered memory files, you can include: "Note: when editing your memory folder, always try to keep its content up-to-date, coherent and organized. You can rename or delete files that are no longer relevant. Do not create new files unless necessary."

You can also guide what Claude writes: "Only write down information relevant to <topic> in your memory system."

## Security considerations
- Sensitive information: Claude will usually refuse to write down sensitive information; you may want stricter validation.
- File storage size: track memory file sizes, prevent files growing too large, add a maximum number of characters the memory read command can return, and let Claude paginate.
- Memory expiration: clear out memory files periodically that haven't been accessed in an extended time.
- Path traversal protection: Malicious path inputs could attempt to access files outside the `/memories` directory. Implementation MUST validate all paths. Safeguards: validate paths start with `/memories`; resolve to canonical form and verify within memory directory; reject sequences like `../`, `..\\`; watch for URL-encoded traversal (`%2e%2e%2f`); use built-in path security utilities (e.g. Python's `pathlib.Path.resolve()` and `relative_to()`).

## Context editing integration
The memory tool pairs with context editing to manage long-running conversations.

## Using with Compaction
The memory tool can be paired with compaction (server-side summarization of older conversation context). While context editing clears specific tool results on the client side, compaction automatically summarizes the entire conversation on the server side when it approaches the context window limit. For long-running agentic workflows, consider using both: compaction keeps active context manageable, and memory persists important information across compaction boundaries so nothing critical is lost in the summary.

## Multi-session software development pattern
For long-running software projects spanning multiple agent sessions, memory files need to be bootstrapped deliberately, not just written ad hoc.
1. Initializer session: sets up memory artifacts before substantive work — a progress log, a feature checklist, and a reference to any startup/initialization script.
2. Subsequent sessions: open by reading those memory artifacts to recover full project state in seconds.
3. End-of-session update: update the progress log with what was completed and what remains.

Key principle: Work on one feature at a time. Only mark a feature complete after end-to-end verification confirms it works, not just after the code is written. This keeps the progress log trustworthy and prevents scope creep from compounding across sessions.
