"""
02 — Tool design & the tool-result contract (Python / Claude Agent SDK)
======================================================================

Python mirror of typescript/02-tool-result-contract.ts. Tools matter more than
the prompt; design them like an API for a junior developer.

Python-specific notes (these differ from TypeScript!):
  - Use the @tool decorator. The schema is a dict mapping name -> type, e.g.
    {"city": str}; the SDK converts it to JSON Schema. For enums/ranges/optional
    fields, pass a full JSON Schema dict instead.
  - Every key in the dict schema is REQUIRED. To make a param optional, leave it
    out of the schema, document it in the description, and read it with
    args.get().
  - Return errors as data: {"is_error": True}. Raising stops the agent loop.
  - The @tool decorator forwards only `content` and `is_error`. To return
    `structuredContent`, you must run a STANDALONE MCP server, not the in-process
    SDK server.

Sources:
  - Anthropic, "Writing tools for agents"
    https://www.anthropic.com/engineering/writing-tools-for-agents
  - Claude Agent SDK, "Give Claude custom tools"
    https://code.claude.com/docs/en/agent-sdk/custom-tools
"""

import json
from claude_agent_sdk import tool, create_sdk_mcp_server

# Mirror Claude Code's own 25,000-token cap on tool responses. Never return
# unbounded output — it is the fastest way to exhaust the context budget.
MAX_CHARS = 20_000


def bound(text: str) -> str:
    if len(text) <= MAX_CHARS:
        return text
    return text[:MAX_CHARS] + f"\n\n[...truncated {len(text) - MAX_CHARS} chars. Narrow your query.]"


# A read-only tool. annotations.readOnlyHint=True lets the harness run it in
# parallel with other read-only tools.
@tool(
    "calendar_lookup_contact",
    "Look up a contact's email by name. Read-only. Use before scheduling if you only have a name.",
    {"name": str},
    annotations={"readOnlyHint": True},
)
async def lookup_contact(args):
    matches = [c for c in [{"name": "Ada Lovelace", "email": "ada@example.com"}]
               if args["name"].lower() in c["name"].lower()]
    return {"content": [{"type": "text", "text": bound(json.dumps(matches))}]}


# A mutating, workflow-shaped tool. We use a full JSON Schema dict (not the
# simple {name: type} form) so we can express formats, ranges, and an enum.
@tool(
    "calendar_schedule_meeting",
    (
        "Schedule a calendar meeting and invite attendees. Use when the user wants to "
        "book, set up, or arrange a meeting. Times must be ISO-8601 with an explicit "
        "timezone offset (ambiguous local times are rejected). Returns the event id."
    ),
    {
        "type": "object",
        "properties": {
            "title": {"type": "string", "description": "Human-readable meeting title"},
            # Poka-yoke: force an unambiguous time format via pattern.
            "start_iso": {
                "type": "string",
                "pattern": r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)",
                "description": "Start, ISO-8601 WITH offset, e.g. 2026-06-14T09:00:00-07:00",
            },
            "duration_minutes": {"type": "integer", "minimum": 5, "maximum": 480},
            "attendee_emails": {"type": "array", "items": {"type": "string", "format": "email"}},
            # Let the model trade detail for tokens.
            "response_format": {"type": "string", "enum": ["concise", "detailed"]},
        },
        "required": ["title", "start_iso", "attendee_emails"],
    },
    annotations={"readOnlyHint": False, "destructiveHint": False},
)
async def schedule_meeting(args):
    try:
        event_id = "evt_12345"  # ... real calendar API call ...
        if args.get("response_format") == "detailed":
            payload = {
                "eventId": event_id,
                "title": args["title"],
                "start": args["start_iso"],
                "durationMinutes": args.get("duration_minutes", 30),
                "attendees": args["attendee_emails"],
                "status": "confirmed",
            }
        else:
            payload = {"eventId": event_id, "status": "confirmed"}
        return {"content": [{"type": "text", "text": bound(json.dumps(payload))}]}
    except Exception as err:  # noqa: BLE001
        # Return failure as data so the loop continues and the model can recover.
        return {
            "content": [{"type": "text", "text": f"Could not schedule meeting: {err}"}],
            "is_error": True,
        }


# Bundle into an in-process MCP server; pass `mcp_servers={"calendar": server}`
# to query() and pre-approve names like "mcp__calendar__calendar_lookup_contact".
server = create_sdk_mcp_server(
    name="calendar",
    version="1.0.0",
    tools=[lookup_contact, schedule_meeting],
)
