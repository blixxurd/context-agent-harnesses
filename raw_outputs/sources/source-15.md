# Building agents with the Claude Agent SDK - Anthropic Engineering
URL: https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk

Retrieval note: The original Anthropic engineering URL returns a 308 permanent redirect to https://claude.com/blog/building-agents-with-the-claude-agent-sdk. Content below was fetched from the redirect target via WebFetch on 2026-06-14.

---

# Building Agents with the Claude Agent SDK

## Overview

Anthropic has renamed the Claude Code SDK to the Claude Agent SDK to reflect its broader applicability beyond coding tasks. The SDK enables developers to build autonomous agents by giving Claude access to computer-like capabilities—file systems, bash commands, and code execution.

## Core Design Principle

"Give Claude a computer" is the fundamental concept. By providing agents with tools programmers use daily—finding files, editing, linting, running code, and iterating—agents can perform complex tasks reliably across coding and non-coding domains.

## Types of Agents You Can Build

The SDK enables creation of:
- Finance agents evaluating investments via external APIs
- Personal assistant agents managing calendars and travel
- Customer support agents handling complex requests
- Deep research agents analyzing document collections

## The Agent Loop Framework

Effective agents operate in a continuous cycle:

1. **Gather Context** - Fetch and update relevant information
2. **Take Action** - Execute tasks using available tools
3. **Verify Work** - Evaluate and improve outputs
4. **Repeat** - Iterate until task completion

## Gathering Context Strategies

**Agentic Search & File Systems**: Use bash commands like `grep` and `tail` to intelligently retrieve large files. Organize information structurally so agents can discover what's needed.

**Semantic Search**: Faster but less transparent than agentic search; useful as a secondary approach when performance demands it.

**Subagents**: Enable parallelization and context isolation. Multiple subagents work simultaneously, returning only relevant excerpts rather than full context.

**Compaction**: Automatically summarizes conversation history as context limits approach, preventing agents from running out of context during long operations.

## Taking Action: Available Tools

**Tools**: Primary execution building blocks displayed prominently in Claude's context. Design tools to maximize efficiency by making them represent the most frequent actions your agent should take.

**Bash & Scripts**: Provides flexibility for general computer work—downloading PDFs, converting formats, searching files.

**Code Generation**: Excellent for complex, repeatable operations. Code is precise, composable, and reliable—consider expressing tasks as code when possible.

**MCPs (Model Context Protocol)**: Standardized integrations handling authentication automatically. Connect to Slack, GitHub, Google Drive, Asana without custom integration code.

## Verifying Work: Three Approaches

**Rules-Based Feedback**: Provide clearly defined output rules and explain which rules failed. Code linting is an excellent example—TypeScript linting provides multiple feedback layers.

**Visual Feedback**: For UI/visual tasks, screenshot rendered output and provide it back to the model for verification. Check layout, styling, content hierarchy, and responsiveness.

**LLM as Judge**: Have another language model evaluate agent outputs against fuzzy criteria. Generally less robust but can improve performance when latency tradeoffs are acceptable.

## Testing & Improvement Questions

Evaluate agents by examining their output, especially failures:

- Missing information? Restructure search APIs for easier discovery
- Repeated failures? Add formal rules in tool calls to identify problems
- Can't self-correct? Provide more creative or useful tools
- Inconsistent performance? Build representative test sets for programmatic evaluations

## Getting Started

Access the Claude Agent SDK through documentation (https://docs.claude.com/en/api/agent-sdk/overview). Existing users should follow the migration guide (https://docs.claude.com/en/docs/claude-code/sdk/migration-guide) for the latest version.

The agent loop framework—gathering context, taking action, verifying work—provides structure for building reliable, deployable agents.
