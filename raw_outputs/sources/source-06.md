# Effective harnesses for long-running agents — Anthropic Engineering
URL: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

Retrieval note: Fetched 2026-06-14 via WebFetch. Page retrieved successfully; content below is the extracted meaningful text/markdown.

---

## Overview

This article addresses the challenge of maintaining agent consistency across multiple context windows. When AI agents work on complex tasks spanning hours or days, they must operate in discrete sessions without memory of previous work. The solution involves a two-part harness: an initializer agent and a coding agent.

## Core Problem

"The core challenge of long-running agents is that they must work in discrete sessions, and each new session begins with no memory of what came before." Even advanced models like Claude Opus 4.5 struggle with production-quality development on high-level prompts without proper structure, exhibiting two failure patterns:

1. Attempting to complete too much simultaneously, leaving features half-implemented
2. Prematurely declaring projects complete after initial progress

## Two-Part Solution Architecture

### Initializer Agent (First Session)
- Creates `init.sh` script for environment setup
- Generates `claude-progress.txt` for logging agent activity
- Makes initial git commit documenting added files
- Establishes comprehensive feature requirements file

### Coding Agent (Subsequent Sessions)
- Makes incremental progress on single features
- Leaves environment in production-ready state
- Updates structured progress documentation
- Creates descriptive git commits

## Key Environment Components

### Feature List
A structured JSON file containing over 200 discrete features, each marked as passing or failing. The instructions emphasize: "It is unacceptable to remove or edit tests because this could lead to missing or buggy functionality."

Example feature structure includes:
- Category classification
- Detailed step-by-step descriptions
- Pass/fail status tracking

### Incremental Progress Strategy
Rather than attempting full implementation, agents work through one feature at a time, using git for state management and recovery from failed changes.

### Testing Requirements
Agents must verify features end-to-end using appropriate tools (browser automation via Puppeteer MCP for web applications). Testing must replicate actual user workflows rather than relying solely on unit tests or API calls.

## Session Startup Procedure

Each coding session follows these steps:
1. Execute `pwd` to confirm working directory
2. Review git logs and progress files
3. Identify highest-priority incomplete feature
4. Start development server using `init.sh`
5. Run basic end-to-end verification tests

## Failure Modes and Solutions Table

| Problem | Initializer Approach | Coding Agent Approach |
|---------|----------------------|----------------------|
| Premature project completion | Feature list file | Select single feature; verify with careful testing |
| Buggy undocumented progress | Initial git repo + progress notes | Read notes/logs at start; test before new work; commit and update at session end |
| Features marked complete prematurely | Feature list file | Self-verify all features; mark passing only after testing |
| Unclear app execution process | Write `init.sh` script | Read `init.sh` at session start |

## Future Directions

Outstanding research questions include whether single general-purpose agents outperform specialized multi-agent architectures (testing agents, QA agents, cleanup agents). Current implementation targets full-stack web development; applicability to scientific research, financial modeling, and other domains remains unexplored.
