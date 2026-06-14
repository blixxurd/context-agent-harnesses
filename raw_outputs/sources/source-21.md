# Trustworthy Agents in Practice — Anthropic
URL: https://www.anthropic.com/research/trustworthy-agents

Retrieval note: Fetched via WebFetch on 2026-06-14. Page retrieved successfully and converted to markdown/summary form by the fetch model. Content below is the meaningful extracted text.

## Overview

Anthropic describes AI agents as systems that "direct its own processes and tool use when accomplishing a task" rather than following fixed scripts. Unlike chatbots, agents operate in self-directed loops of planning, acting, observing results, and adjusting.

## Core Framework: Five Principles

Anthropic's safety approach rests on five pillars:
1. Keeping humans in control
2. Aligning with human values
3. Securing agents' interactions
4. Maintaining transparency
5. Protecting privacy

## Agent Architecture: Four Components

Each layer provides both capability and oversight opportunities:

- **The model**: Provides core intelligence through training
- **A harness**: Includes instructions and guardrails governing behavior
- **Tools**: Services and applications the model can access
- **An environment**: The product context and data access permissions

## Practical Safety Implementations

### Human Control
Users can enable/disable tools and configure permissions (always allow, needs approval, or block). Claude Code introduced "Plan Mode," where agents display full action plans upfront for user review and approval before execution.

### Goal Alignment
Training emphasizes recognizing when agents should "pause and ask for clarification" rather than assuming intent. Research shows agents roughly double their check-in rate on complex tasks compared to simple ones.

### Attack Defense
Multiple layers protect against prompt injection attacks:
- Model training to recognize injection patterns
- Production traffic monitoring
- External red-team testing

## Ecosystem Recommendations

**Benchmarks**: Standards bodies like NIST should establish shared, independently-verified benchmarks for prompt injection resistance and uncertainty surfacing.

**Evidence sharing**: Developers should publish usage data and failure modes to inform policymakers.

**Open standards**: Anthropic created and donated the Model Context Protocol to enable secure infrastructure design at scale rather than patching individual deployments.
