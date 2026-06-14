# Don't Build Multi-Agents | Cognition
URL: https://cognition.ai/blog/dont-build-multi-agents

Retrieval note: Fetched successfully via WebFetch on 2026-06-14. Content below is the meaningful text extracted and summarized from the article (page rendered to markdown).

---

# Don't Build Multi-Agents: Key Principles & Arguments

**Article Overview**
Published June 12, 2025 by Walden Yan (Cognition), this piece argues against multi-agent architectures in favor of single-threaded agent designs for production reliability.

---

## Core Principles

**Principle 1 - Context Sharing**
"Share context, and share full agent traces, not just individual messages"

The author emphasizes that subagents require complete conversation history and decision logs, not isolated task descriptions. Sharing only task summaries causes miscommunications.

**Principle 2 - Implicit Decisions**
"Actions carry implicit decisions, and conflicting decisions carry bad results"

When parallel subagents operate independently, their work reflects unstated assumptions. Without visibility into each other's choices, they produce inconsistent outputs.

---

## Architecture Recommendations

**Preferred Approach: Single-Threaded Linear Agent**
The simplest reliable design maintains continuous context through one agent executing sequential steps. This prevents decision conflicts entirely.

**For Extended Tasks: Compression Model**
When context windows overflow, introduce a specialized LLM compressing action history into key details, events, and decisions—though the author notes this "is hard to get right."

**Against Multi-Agent Collaboration**
Current systems lack sufficient "cross-agent context-passing" capability. Agents cannot negotiate conflicts like humans do. The author expects this limitation to resolve as single-agent communication improves.

---

## Real-World Examples

- **Claude Code**: Deliberately avoids parallel subagents; uses sequential subtasks for investigation-only work
- **Edit Apply Models**: Earlier unreliable systems separated decision-making from code application; modern approaches unify these in single actions
