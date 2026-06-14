# awesome-harness-engineering — GitHub
URL: https://github.com/ai-boost/awesome-harness-engineering

Retrieval note: Fetched via WebFetch on 2026-06-14. Content is the meaningful text/markdown extracted from the GitHub repository README. Page retrieved successfully.

---

# Awesome Harness Engineering: Key Concepts & Practices

## Overview
This is a curated resource collection on **harness engineering**—the discipline of designing scaffolding around AI agents (context delivery, tool interfaces, planning artifacts, verification loops, memory systems, sandboxes) that determines success or failure on real tasks.

The collection emphasizes that "the harness, not the model" is the primary lever for agent reliability.

---

## Core Foundational Principles

**Key insight from Anthropic**: "Every harness component assumes the model can't do something; those assumptions expire as models improve."

Essential reading includes:
- **Unrolling the Codex Agent Loop** (OpenAI): Breaks down observe → plan → act → verify cycle
- **Building Effective Agents** (Anthropic): Workflows vs. agents; compositional primitives
- **Harness Engineering** (Martin Fowler): Three interlocking systems—context engineering, architectural constraints, entropy management

---

## Design Primitives (Problem-Solving Components)

### Agent Loop Architecture
- **ReAct pattern**: Thought/Action/Observation cycle as foundational structure
- **Loop control flow**: Directed graphs with typed state, conditional edges, checkpointing (LangGraph model)
- **Extended thinking integration**: `budget_tokens` controls reasoning depth; thinking blocks must be preserved when passing tool results back

**Critical finding**: "Mismatching your runtime persistence mode to the model's training-time semantics produces either 80% missing-variable errors or 3.5× token overhead" (from agent training studies).

### Planning & Task Decomposition
- **Milestone-based planning**: Persistent Plan.md, Implement.md, Documentation.md artifacts
- **Plan-and-execute separation**: Planner LLM generates step list once; executor works through it, replanning only when needed
- **Multi-agent orchestration**: Specialized roles (planner, coder, reviewer, executor) with different model sizes and tool access improve outcomes

### Context Delivery & Compaction
**Harness-level context management:**
- Automatic server-side compaction when approaching window limits (reduced tokens 84% in 100-turn eval)
- Prompt caching for repeated system prompts, tool definitions, long documents
- **Active context compression**: Agents autonomously trigger compression between tasks rather than reactive-at-limit

**Practical patterns**:
- Hierarchical context delivery (agents pull only paths they need)
- Symbol-based navigation instead of file reading (reduces active tokens by 77%)
- `CLAUDE.md` for critical rules that survive compaction

### Tool Design
- **Tool-as-UX principle**: Tool naming, schemas, and error messages make agents more reliable
- **Structured output guarantees**: Regex/CFG/JSON Schema constraint at decoding layer (no model fine-tuning needed)
- **Tool annotations**: `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint` as risk vocabulary
- **Parallel tool calling**: Enables concurrent execution rather than sequential observe→act loops

**Key pattern**: "Code execution approach—agents write code to interact with tools rather than calling each tool discretely—cuts token overhead up to 98.7%."

### Skills & MCP (Model Context Protocol)
- **MCP standard**: Open protocol for connecting agents to tools, data, services in standardized way
- **Skill bundling**: Versioned SKILL.md manifests with negative examples (routing accuracy 73% → 85%)
- **Remote MCP deployment**: HTTP POST + SSE (with session management complexity for scaling)
- **Tool composition patterns**: Shell/filesystem paradigm (agents already fluent in grep, cat, cp) eliminates schema bloat

### Permissions & Authorization
**Core principle**: Structure authorization into harness, not prompts alone.

**Five-layer evaluation order**:
1. Hooks
2. Deny rules
3. Permission mode
4. Allow rules
5. canUseTool

**Safe-by-default approach** (Claude Code Auto Mode):
- Two-stage classifier: fast single-token gate, chain-of-thought only on flagged actions
- Deny-and-continue recovery instead of halt-on-deny
- Strip assistant messages to prevent rationalization of dangerous actions

**On-behalf-of vs. fixed-credential models**:
- On-behalf-of: agent uses end-user credentials (requires cross-channel identity, per-user memory isolation)
- Fixed-credential: agent owns account (requires HITL guardrails on high-risk actions)

### Memory & State
- Cross-session persistence with note-taking for learning
- Persistent knowledge graphs indexed by symbol/call graph
- Hibernation-and-wake checkpointing for tasks exceeding context limits (Meta's 6-hour ML pipeline case)

### Observability & Tracing
- 27-event-type hook pipeline (from Claude Code architecture analysis)
- Per-turn streaming events for real-time monitoring
- Instrumentation of all agent decisions for audit trails

---

## Reference Implementations & Patterns

**Key open-source projects**:
- **TaskWeaver** (Microsoft): Code-first task decomposition with planner/executor split
- **Playwright MCP** (Microsoft): Accessibility tree snapshots instead of screenshots (token-efficient automation)
- **Composio**: 250+ SaaS API wrappers with managed OAuth
- **LLMLingua**: Prompt compression (20× with minimal performance loss; 3–6× speedup with v2)
- **outlines**: Constrain token sampling via regex/CFG/JSON Schema at decode layer
- **instructor**: Pydantic model mapping for structured LLM extraction with retry/validation loops

**Enterprise patterns**:
- **Azure SRE Agent**: Reduced time-to-mitigation from 40.5 hours to 3 minutes via MCP tool integration + filesystem context engineering; "Intent Met" rose from 45% → 75% on novel incidents
- **Meta's Ranking Engineer Agent (REA)**: Checkpoint-resume harness for 6-hour ML pipelines; split workload across sessions without losing coherence
- **GitHub Copilot Coding Agent**: Three core responsibilities (context assembly, tool exposure, tool execution); multi-provider model routing (Anthropic, Google, OpenAI, xAI, Mistral)

---

## Critical Harness Insights from 2026 Research

1. **Infrastructure as optimization variable**: Harness setup alone can swing benchmarks 5+ percentage points (Anthropic 2026 Agentic Coding Trends Report)

2. **Loop architecture > model size**: Local models achieved 2/10 → 10/10 pass rate on SWE-bench subset purely by shrinking tool space through state-machine guardrails (statewright)

3. **Context pressure is a navigation problem, not just compression**: Code intelligence via tree-sitter AST (codebase-memory-mcp) cuts active tokens 120×, reframes the problem as pointer-chasing vs. context bloat

4. **Skill improvement is measurable & tunable**: Skills compiled to execution graphs (AIP proposal) moved Claude Sonnet pass rate from 53% → 67%; skills should respond to feedback like any other parameter

5. **Harness-only changes outperform model swaps**: LangChain's verification loops + context injection + reasoning sandwich moved SWE-Bench rank 30 → top 5 without model change

6. **Permission fatigue breaks intent**: Users approve 93% of prompts in naive systems, making approvals meaningless; two-stage classification (fast gate + reasoning) restores signal

---

## Project File Structure Best Practices

Standard repository harness artifacts:
- **CLAUDE.md** / **AGENTS.md**: Agent-specific instructions (survives compaction; lives in system prompt)
- **HARNESS.md**: Harness configuration and constraints
- **FEATURE_INTAKE.md**: Product contract, risk assessment, inheritance decisions
- **DESIGN.md**: Machine-readable design tokens + rationale (for design-focused agents)
- **SKILL.md**: Skill definitions with negative examples
- **.github/agents/**: Custom agent files (GitHub Copilot pattern)
- **.agent/** folder: Portable cross-tool harness layer with adapters for Claude Code, Cursor, Codex CLI, Gemini CLI

---

## Related Standards & Protocols

- **MCP**: Tool/data connectivity
- **A2A Protocol** (Google): Inter-agent routing via Agent Card discovery
- **AG-UI**: Event-driven agent-to-UI streaming (filling gap between MCP and A2A)
- **IETF draft-klrc-aiagent-auth**: Agent identity via SPIFFE, delegation via OAuth Token Exchange
- **Microsoft Skills Framework**: Standardized skill definition and distribution

---

## Key Takeaway

"The best harnesses are designed knowing components will become unnecessary as models improve." Harness engineering is thus a discipline of building optimal *current* scaffolding while remaining ready to simplify or remove it as agent capabilities evolve.
