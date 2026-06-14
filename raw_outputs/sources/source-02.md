# Effective context engineering for AI agents — Anthropic
URL: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

Retrieval note: Fetched via WebFetch on 2026-06-14. Page returned substantive content (summarized/condensed by the fetch model). Content below reflects the meaningful text extracted.

---

## Core Definition
Context engineering involves strategically curating and managing tokens available to LLMs during inference. It represents "the natural progression of prompt engineering," shifting focus from crafting individual prompts to orchestrating entire context states across multi-turn agent interactions.

## Key Technical Insights

**Context Rot Problem**: LLMs experience degraded performance as context length increases—a phenomenon documented through "needle-in-a-haystack" benchmarking. This stems from transformer architecture's n² token relationships, creating what the article calls an "attention budget" with diminishing marginal returns.

**System Prompt Calibration**: The optimal approach avoids two extremes: overly rigid if-else logic (brittle) and vague guidance (ineffective). Effective prompts hit the "right altitude"—specific enough to guide behavior, flexible enough to leverage model heuristics.

## Practical Strategies

**Tool Design**: Tools should be self-contained with minimal functional overlap. Bloated tool sets create ambiguity; well-designed tools remain "token efficient" while encouraging efficient agent behaviors.

**Just-in-Time Retrieval**: Rather than pre-loading all context, agents use lightweight identifiers (file paths, URLs) and dynamically load data via tools. Claude Code exemplifies this, using targeted queries and Bash commands to analyze large datasets without exhausting context.

**Long-Horizon Techniques**:
- *Compaction*: Summarizing conversation history, preserving architectural decisions while discarding redundant outputs
- *Structured Note-Taking*: Agents maintain external memory (NOTES.md files) for persistent state across context resets
- *Sub-Agent Architectures*: Specialized agents handle focused tasks, returning condensed summaries to a coordinating agent

## Fundamental Principle
The guiding maxim: find "the smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome."
