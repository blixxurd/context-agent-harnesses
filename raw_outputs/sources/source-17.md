# Managing Context on the Claude Developer Platform — Anthropic
URL: https://www.anthropic.com/news/context-management

Retrieval note: The original anthropic.com/news/context-management URL issued a 308 permanent redirect to https://claude.com/blog/context-management, which was fetched successfully via WebFetch on 2026-06-14.

---

## Overview
Anthropic introduced two new capabilities for the Claude Developer Platform on September 29, 2025: context editing and the memory tool, designed to help developers build AI agents handling extended tasks without exhausting context limits.

## Key Features

### Context Editing
This feature automatically removes outdated tool calls and results from the context window as token limits approach. By clearing stale data while preserving conversation flow, agents can operate longer while maintaining performance. The system focuses Claude's attention on pertinent information only.

### Memory Tool
Developers can leverage a file-based system allowing Claude to store and retrieve information beyond the context window. The tool enables agents to create, read, update, and delete files in a dedicated memory directory. This allows for:
- Building knowledge bases across sessions
- Maintaining project state information
- Referencing previous learning without cluttering active context
- Client-side operation with developer-controlled storage backends

## Performance Metrics

The announcement highlighted significant improvements in agent capabilities:
- Combined memory tool plus context editing showed "39% improvement over baseline" on agentic search evaluations
- Context editing alone delivered "29% improvement"
- In a 100-turn web search test, context editing enabled agents to complete workflows that would otherwise fail while reducing "token consumption by 84%"

## Supported Platforms
These capabilities are available in public beta on the Claude Developer Platform, Amazon Bedrock, and Google Cloud's Vertex AI.
