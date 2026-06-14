# Building Effective AI Agents — Anthropic
URL: https://www.anthropic.com/research/building-effective-agents

Retrieval note: Fetched via WebFetch on 2026-06-14. Page converted to markdown and summarized/extracted by the fetch model. Content below is the meaningful extracted text.

---

# Building Effective AI Agents: Key Concepts & Patterns

## Core Definitions

Anthropic distinguishes between two types of agentic systems:

- **Workflows**: "systems where LLMs and tools are orchestrated through predefined code paths"
- **Agents**: "systems where LLMs dynamically direct their own processes and tool usage, maintaining control over how they accomplish tasks"

## When to Use Agents

The guidance emphasizes starting simple. Agents trade "latency and cost for better task performance," making them appropriate only when simpler solutions prove insufficient. Workflows suit well-defined tasks needing predictability; agents excel when flexibility and model-driven decisions matter at scale.

## Design Patterns & Workflows

**Augmented LLM** (foundation): An LLM enhanced with retrieval, tools, and memory capabilities.

**Prompt Chaining**: Decomposing tasks into sequential steps with programmatic gates for verification. Useful for fixed subtasks like generating marketing copy then translating it.

**Routing**: Classifying inputs to specialized downstream handlers, improving performance across diverse input types.

**Parallelization**: Running subtasks simultaneously (sectioning) or repeating tasks for consensus (voting). Effective for guardrails and evaluations.

**Orchestrator-Workers**: A central LLM delegates unpredictable subtasks to workers. Suited for complex problems like multi-file code changes.

**Evaluator-Optimizer**: One LLM generates responses while another provides feedback iteratively. Works for refinement tasks with clear evaluation criteria.

## Agent Implementation Principles

Anthropic recommends three core principles:

1. Maintain **simplicity** in agent design
2. Prioritize **transparency** in planning steps
3. Craft thorough **tool documentation and testing**

## Tool Design Best Practices

The guidance emphasizes treating agent-computer interfaces (ACI) with the same rigor as human-computer interfaces. Key recommendations include:

- Give models "enough tokens to think before it writes itself into a corner"
- Keep formats "close to what the model has seen naturally occurring in text"
- Eliminate formatting overhead (avoid line counting, complex escaping)
- Write detailed tool descriptions as if documenting code for junior developers
- Test extensively in workbenches
- Apply "poka-yoke" principles—redesign arguments to make mistakes harder

The SWE-bench agent example illustrates this: developers "spent more time optimizing tools than the overall prompt," discovering that absolute filepaths prevented model errors with relative paths.

## Practical Applications

**Customer Support**: Natural fit combining conversation with tool integration for data retrieval and actions (refunds, ticket updates). Success is measurable through resolutions.

**Coding Agents**: Particularly effective due to verifiable outputs, iterative feedback from tests, well-defined problem spaces, and objective quality measurement.

## Implementation Guidance

Frameworks can accelerate development but risk obscuring underlying mechanics. Start with "LLM APIs directly; many patterns can be implemented in a few lines of code." Use frameworks only when you understand their underlying implementation, avoiding the common error of incorrect assumptions about what's "under the hood."

The overarching philosophy: "Success in the LLM space isn't about building the most sophisticated system. It's about building the right system for your needs."
