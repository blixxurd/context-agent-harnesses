"""
01 — The minimal agent loop (from scratch, raw Messages API)
============================================================

The Python mirror of typescript/01-minimal-agent-loop.ts. An agent is a thin
control layer around a loop: call the model, run any tools it requests, feed
the results back, repeat until it stops asking for tools.

Best practices shown:
  - Always bound the loop (max_turns) — never ship an unbounded agent.
  - Persist the assistant turn verbatim so tool_use blocks survive round-trip.
  - Return tool errors as DATA (is_error=True), never raise — raising kills the
    loop and the model never gets to recover.

Sources:
  - Anthropic, "Building Effective Agents"
    https://www.anthropic.com/research/building-effective-agents
  - Claude Agent SDK, "How the agent loop works"
    https://code.claude.com/docs/en/agent-sdk/agent-loop

Run: pip install anthropic && ANTHROPIC_API_KEY=... python 01_minimal_agent_loop.py
"""

import json
from anthropic import Anthropic

client = Anthropic()  # reads ANTHROPIC_API_KEY

# --- 1. Tool definitions: the agent-computer interface ----------------------
tools = [
    {
        "name": "get_weather",
        "description": (
            "Get the current weather for a city. Returns temperature in Celsius. "
            "Use this whenever the user asks about weather or temperature."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name, e.g. 'Paris'"}
            },
            "required": ["city"],
        },
    }
]


def get_weather(city: str) -> str:
    # Pretend this calls a real weather API.
    return json.dumps({"city": city, "tempC": 21, "conditions": "partly cloudy"})


HANDLERS = {"get_weather": get_weather}


# --- 2. The loop ------------------------------------------------------------
def run_agent(user_prompt: str, max_turns: int = 10) -> str:
    messages = [{"role": "user", "content": user_prompt}]

    for _ in range(max_turns):
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system="You are a concise weather assistant. Use tools when you need live data.",
            tools=tools,
            messages=messages,
        )

        # Persist the assistant turn verbatim (text + tool_use blocks).
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason != "tool_use":
            # No tools requested => done. Concatenate the text blocks.
            return "".join(b.text for b in response.content if b.type == "text")

        # Run every requested tool; collect results into ONE user message.
        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            try:
                handler = HANDLERS.get(block.name)
                if handler is None:
                    raise ValueError(f"Unknown tool: {block.name}")
                result = handler(**block.input)
                tool_results.append(
                    {"type": "tool_result", "tool_use_id": block.id, "content": result}
                )
            except Exception as err:  # noqa: BLE001 — deliberately broad
                # Return the failure as data so the loop continues.
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": f"Error: {err}",
                        "is_error": True,
                    }
                )

        messages.append({"role": "user", "content": tool_results})

    # Bounded loops must report hitting the bound — never fail silently.
    raise RuntimeError(f"Agent did not finish within {max_turns} turns")


if __name__ == "__main__":
    answer = run_agent("What's the weather in Paris, and should I bring a jacket?")
    print("\nFinal answer:\n" + answer)
