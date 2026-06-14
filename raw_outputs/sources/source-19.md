# How we built our multi-agent research system | Anthropic
URL: https://www.anthropic.com/engineering/multi-agent-research-system

Retrieval note: Fetched via WebFetch on 2026-06-14. Page retrieved successfully and converted to markdown summary. Content below is the meaningful extracted text.

---

## Overview
Anthropic's Research feature leverages multiple Claude agents working together to explore complex topics more effectively than single-agent systems. The engineering journey from prototype to production revealed critical lessons about system architecture, tool design, and prompt engineering.

## Key Performance Metrics
The multi-agent approach demonstrated substantial improvements: "a multi-agent system with Claude Opus 4 as the lead agent and Claude Sonnet 4 subagents outperformed single-agent Claude Opus 4 by 90.2%" on internal research evaluations. However, there's a significant trade-off—agents typically use about 4× more tokens than standard chat interactions, and multi-agent systems consume approximately 15× more tokens than chats.

## Architecture Pattern
The system employs an orchestrator-worker design where:
- A **lead agent** analyzes queries, develops strategy, and spawns specialized subagents
- **Subagents** operate in parallel, exploring different query aspects simultaneously
- Results compress and consolidate before final synthesis
- A **CitationAgent** ensures proper source attribution

This contrasts with traditional Retrieval Augmented Generation (RAG), which uses static retrieval. Instead, the architecture performs "multi-step search that dynamically finds relevant information, adapts to new findings, and analyzes results to formulate high-quality answers."

## Eight Prompt Engineering Principles

1. **Think like your agents** — Use Console simulations to observe step-by-step agent behavior and identify failure modes

2. **Teach orchestration strategy** — Lead agents require detailed task descriptions including objectives, output formats, tool guidance, and clear task boundaries. Early simple instructions like "research X" caused duplicated work

3. **Scale effort to complexity** — Embed explicit scaling rules: simple fact-finding needs 1 agent with 3-10 tool calls; comparisons need 2-4 subagents with 10-15 calls each; complex research uses 10+ subagents

4. **Prioritize tool design** — Agent-tool interfaces matter critically. Provide explicit heuristics: examine available tools first, match tools to user intent, prefer specialized tools over generic ones

5. **Enable agent self-improvement** — Claude models can diagnose prompt failures and suggest improvements. A tool-testing agent rewrote tool descriptions based on repeated testing, "resulting in a 40% decrease in task completion time"

6. **Search strategy progression** — Start with short, broad queries, evaluate available information, then progressively narrow focus

7. **Guide thinking explicitly** — Use Extended Thinking mode as a "controllable scratchpad" for planning. Subagents use interleaved thinking after tool results to evaluate quality and identify gaps

8. **Implement parallel execution** — Two parallelization types: (1) spinning up 3-5 subagents simultaneously rather than serially; (2) subagents using 3+ tools in parallel. This "cut research time by up to 90% for complex queries"

## Evaluation Approaches

**Small-sample testing first**: Start with ~20 representative queries before building large-scale evaluations. Early development shows dramatic improvements where "prompt tweaks might boost success rates from 30% to 80%."

**LLM-as-judge methodology**: Evaluate outputs against rubrics covering factual accuracy, citation accuracy, completeness, source quality, and tool efficiency. Single LLM calls with 0.0-1.0 scores proved "most consistent and aligned with human judgements."

**Human testing remains essential**: Manual evaluation catches edge cases automations miss, including hallucinations, subtle source selection biases, and system failures that evals overlook.

## Production Reliability Challenges

**Stateful architecture complexity**: Agents maintain state across many turns. Restarts are expensive, so systems must resume from checkpoints. "Without effective mitigations, minor system failures can be catastrophic for agents."

**Debugging requires new approaches**: Non-deterministic agent behavior across identical runs complicates diagnosis. Full production tracing and monitoring of decision patterns help identify root causes while maintaining user privacy.

**Deployment coordination**: Rainbow deployments gradually shift traffic between old and new agent versions, preventing well-intentioned code changes from breaking in-flight agents.

**Synchronous execution bottlenecks**: Current lead agents execute subagents synchronously, waiting for completion before proceeding. This simplifies coordination but prevents mid-process steering and creates blocking bottlenecks awaiting single subagent completion.

## Top Use Cases
According to Clio embedding analysis, primary Research feature applications include: developing domain-specific software systems (10%), professional content optimization (8%), business growth strategies (8%), academic research support (7%), and information verification about entities (5%).

## Additional Production Patterns

**End-state evaluation**: Rather than validating every intermediate step, focus on whether agents achieved correct final outcomes, acknowledging multiple valid paths to solutions.

**Long-horizon context management**: For extended conversations spanning hundreds of turns, agents summarize completed phases and store essential information in external memory before approaching context limits.

**Distributed artifact systems**: Allow subagents to store specialized outputs independently (code, reports, visualizations) rather than channeling everything through the lead agent, preventing information loss and reducing token overhead.
