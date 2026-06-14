# Guardrails — OpenAI Agents SDK
URL: https://openai.github.io/openai-agents-python/guardrails/

Retrieval note: Fetched via WebFetch on 2026-06-14. Page rendered/converted to markdown; substantive content extracted below.

## Overview

Guardrails enable validation checks on user input and agent output. They're particularly useful for preventing misuse—for example, blocking math homework requests before expensive model operations consume tokens and resources.

## Types of Guardrails

Two primary categories exist:
- **Input guardrails**: Run on initial user input
- **Output guardrails**: Run on final agent output

Additionally, **tool guardrails** wrap function tools to validate before/after execution.

## Workflow Boundaries

Importantly, guardrails don't run uniformly across all workflow steps:

- Input guardrails execute only for the first agent in a chain
- Output guardrails execute only for the final agent producing output
- Tool guardrails trigger on every custom function-tool invocation

For multi-agent workflows with managers, handoffs, or specialists, tool guardrails are recommended rather than relying solely on agent-level checks.

## Input Guardrails

Input guardrails follow a three-step process:

1. The guardrail receives the same input passed to the agent
2. A guardrail function executes, producing `GuardrailFunctionOutput` wrapped in `InputGuardrailResult`
3. If `.tripwire_triggered` is true, an `InputGuardrailTripwireTriggered` exception is raised

### Execution Modes

Input guardrails support two modes:

**Parallel execution** (default): Guardrail runs concurrently with agent execution for better latency. However, the agent may consume tokens before being cancelled if the guardrail fails.

**Blocking execution**: The guardrail completes before the agent starts. If triggered, the agent never executes, preventing token consumption and tool side effects. This optimizes costs.

## Output Guardrails

Output guardrails similarly follow three steps:

1. Receive the agent's output
2. Execute the guardrail function returning `GuardrailFunctionOutput`
3. Raise `OutputGuardrailTripwireTriggered` if the tripwire triggers

Output guardrails always run after agent completion and don't support parallel execution.

## Tool Guardrails

These wrap function tools specifically, with input guardrails running pre-execution and output guardrails running post-execution. They apply only to tools created with `function_tool` decorator, not to handoffs, hosted tools, or built-in execution tools.

## Tripwires

"As soon as we see a guardrail that has triggered the tripwires, we immediately raise a `{Input,Output}GuardrailTripwireTriggered` exception and halt the Agent execution."

## Implementation Example

Guardrails require a function returning `GuardrailFunctionOutput`. The provided code example demonstrates a math homework detection guardrail using an internal agent that evaluates input and sets `tripwire_triggered` accordingly.

Similarly, output guardrails receive an agent's output and validate before returning the result structure. Tool guardrails use decorators (`@tool_input_guardrail`, `@tool_output_guardrail`) with methods like `reject_content()` or `allow()`.
