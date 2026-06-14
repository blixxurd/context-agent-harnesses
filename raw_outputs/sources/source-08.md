# Harness capabilities - Docs by LangChain (deepagents)
URL: https://docs.langchain.com/oss/python/deepagents/harness

Retrieval note: Fetched successfully via WebFetch on 2026-06-14. Content below is the meaningful extracted text/markdown from the page.

---

# Deep Agents Harness Capabilities

The Deep Agents harness provides four integrated components for building reliable, long-running agents:

## Four Core Components

1. **Execution Environment** — Tools, virtual filesystem, optional sandbox, and REPL interpreter
2. **Context Management** — Skills, memory, summarization, context offloading, and prompt caching
3. **Delegation** — Subagent spawning and task planning
4. **Steering** — Human-in-the-loop approval and interrupts

## Execution Environment

### Tools
Agents accept any Python callable, LangChain tool, or tool dictionary via the `tools=` parameter:

```python
from deepagents import create_deep_agent

agent = create_deep_agent(
    model="anthropic:claude-sonnet-4-6",
    tools=[search, fetch_page, run_query],
)
```

### Virtual Filesystem Access
The configurable virtual filesystem supports:

- `ls` — Directory listing with metadata (size, modified time)
- `read_file` — File contents with line numbers; supports multimodal content (images, video, audio, PDFs)
- `write_file` — Create new files
- `edit_file` — Exact string replacements with global replace mode
- `glob` — Pattern matching (e.g., `**/*.py`)
- `grep` — Content search with multiple output modes
- `execute` — Shell commands (sandbox backends only)

**Supported multimodal extensions:**
- Images: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.heic`, `.heif`
- Video: `.mp4`, `.mpeg`, `.mov`, `.avi`, `.flv`, `.mpg`, `.webm`, `.wmv`, `.3gpp`
- Audio: `.wav`, `.mp3`, `.aiff`, `.aac`, `.ogg`, `.flac`
- Documents: `.pdf`, `.ppt`, `.pptx`

### Hiding Default Filesystem Tools
To exclude filesystem tools, register a harness profile with `excluded_tools`:

```python
from deepagents import HarnessProfile, register_harness_profile

register_harness_profile(
    "anthropic:claude-sonnet-4-6",
    HarnessProfile(
        excluded_tools=frozenset(
            {"ls", "read_file", "write_file", "edit_file", "glob", "grep"}
        ),
    ),
)
```

### Filesystem Permissions
The harness enforces declarative permission rules controlling file access:

- Pass a list of rules to `permissions=` when creating the agent
- Each rule specifies `operations` ("read", "write"), `paths` (glob patterns), and `mode` ("allow" or "deny")
- First matching rule wins; if no match, operation is allowed
- Useful for restricting agents to specific directories or protecting sensitive files

Permissions do not apply to sandbox backends, which support arbitrary command execution.

### Code Execution
Two execution modes available:

- **Sandbox backends** — Expose an `execute` tool for isolated shell commands; supports dependency installation, CLI calls, and OS filesystem operations
- **Interpreters** — Add an `eval` tool running JavaScript in a scoped QuickJS runtime; suitable for loops, batching, and deterministic transformations without shell access

## Context Management

### Skills
Skills follow the Agent Skills standard and provide specialized workflows:

- Each skill is a directory containing a `SKILL.md` file with instructions and metadata
- Can include scripts, reference docs, and templates
- Progressive disclosure—loaded only when useful for the task
- Agent reads frontmatter at startup, reviews full content when needed
- Reduces token usage by avoiding unnecessary skill loading

### Memory
Persistent memory using `AGENTS.md` files provides context across conversations:

- Always loaded (unlike skills with progressive disclosure)
- Pass file paths to the `memory` parameter during agent creation
- Stored in the agent's backend
- Agent can update memory based on interactions and feedback
- Useful for storing user preferences, project guidelines, or domain knowledge

### Summarization and Context Offloading
The harness manages context for long-running tasks:

- Input context includes system prompt, memory, skills, and tool prompts
- Built-in compression and summarization keep context within token limits
- Subagents isolate heavy work, returning only results
- Long-term persistent storage via the virtual filesystem

### Prompt Caching
For Anthropic models, `create_deep_agent` automatically applies prompt caching to static system prompt sections (base instructions, memory, skills), reducing latency and cost. Enabled by default with no configuration required.

## Delegation

### Task Planning
The `write_todos` tool allows agents to maintain structured task lists:

- Track tasks with statuses: `'pending'`, `'in_progress'`, `'completed'`
- Persisted in agent state
- Helps organize complex multi-step work
- Supports long-running task management

### Subagents
Main agents can spawn ephemeral "subagents" for isolated tasks:

- Subagents have their own context (no clutter to main agent)
- Multiple subagents can run concurrently
- Each can have different tools and configurations
- Large subtask context compresses into a single result
- Main agent invokes via a `task` tool; subagent executes autonomously and returns a final report
- Default "general-purpose" subagent enabled by default
- Subagents are stateless (single response)

To disable the `task` tool, register a profile with `excluded_middleware` or pass no synchronous subagents via `subagents=` parameter.

## Steering

### Human-in-the-Loop
Pause execution before specified tool calls for human approval or modification:

- Configure via `interrupt_on` parameter (tool name to interrupt config mapping)
- Example: `interrupt_on={"edit_file": True}` pauses before every edit
- Useful for safety gates on destructive operations and expensive API calls

## Harness Profiles

Declarative configuration bundles allow per-provider or per-model defaults:

- Register under provider name (`"openai"`) or `provider:model` key (`"openai:gpt-5.5"`)
- `create_deep_agent` looks up and applies when resolving model
- Provider and model-level profiles merge at resolution
- Package defaults (system-prompt tweaks, tool overrides, middleware) in one reusable bundle
- Supports plugin packaging via entry points
