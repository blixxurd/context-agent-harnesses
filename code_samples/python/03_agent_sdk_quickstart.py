"""
03 — Claude Agent SDK quickstart (Python)
=========================================

Python mirror of typescript/03-agent-sdk-quickstart.ts. Embeds Claude Code's
autonomous loop with production guardrails.

Best practices shown:
  - Bound the loop: max_turns + max_budget_usd.
  - Iterate the async message stream to completion; don't break on the result
    (trailing system events can follow it).
  - Handle every result subtype; `result` text exists only on success.
  - Be explicit about setting_sources for reproducibility.
  - Capture session_id (resume) and total_cost_usd (accounting).

Requires Python 3.10+ (a hard SDK requirement).

Sources:
  - Claude Agent SDK, "How the agent loop works"
    https://code.claude.com/docs/en/agent-sdk/agent-loop
  - Claude Agent SDK, "Overview"
    https://code.claude.com/docs/en/agent-sdk/overview

Run: pip install claude-agent-sdk && python 03_agent_sdk_quickstart.py
"""

import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

options = ClaudeAgentOptions(
    system_prompt=(
        "You are a coding assistant. Make minimal, well-scoped edits and explain "
        "what you changed."
    ),
    model="claude-sonnet-4-6",  # pin for reproducibility
    # The two guardrails every production agent needs:
    max_turns=30,            # counts tool-use round trips only
    max_budget_usd=1.5,      # hard cost ceiling -> subtype "error_max_budget_usd"
    # Reproducible, locked-down tool surface:
    allowed_tools=["Read", "Glob", "Grep", "Edit"],
    permission_mode="dontAsk",   # deny anything not pre-approved
    setting_sources=["project"],  # explicit; [] would disable filesystem settings
)


async def main() -> None:
    session_id = None

    # query() is an async generator. Iterate to the END.
    async for message in query(
        prompt="Find the TODO comments in this project and summarize them.",
        options=options,
    ):
        msg_type = type(message).__name__

        if msg_type == "SystemMessage":
            if getattr(message, "subtype", None) == "init":
                print(f"[init] session {message.data.get('session_id')}")
            elif getattr(message, "subtype", None) == "compact_boundary":
                # Auto-compaction happened; early non-system-prompt details may
                # now be summarized. Durable rules belong in CLAUDE.md.
                print("[compaction] older history summarized")

        elif msg_type == "AssistantMessage":
            for block in message.content:
                if getattr(block, "type", None) == "text":
                    print(block.text, end="")

        elif msg_type == "ResultMessage":
            session_id = message.session_id
            # Handle every subtype; result text only on success.
            if message.subtype == "success":
                print(f"\n\n✅ done in {message.num_turns} turns")
            elif message.subtype == "error_max_turns":
                print(f"\n\n⚠️ hit max_turns ({message.num_turns})")
            elif message.subtype == "error_max_budget_usd":
                print("\n\n⚠️ hit the USD budget ceiling")
            else:
                print(f"\n\n⚠️ ended with subtype: {message.subtype}")
            # cost/usage/session present on ALL subtypes — always record them.
            print(f"cost: ${message.total_cost_usd:.4f} | session: {message.session_id}")

    if session_id:
        print(f'\nResume later with: ClaudeAgentOptions(resume="{session_id}")')


if __name__ == "__main__":
    asyncio.run(main())
