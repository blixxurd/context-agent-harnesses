# Writing effective tools for AI agents—using AI agents (Anthropic Engineering)
URL: https://www.anthropic.com/engineering/writing-tools-for-agents

Retrieval note: Fetched 2026-06-14 via WebFetch. Page retrieved successfully and converted to markdown/summary form by the fetch model. Content below is the meaningful extracted text.

---

# Writing Effective Tools for AI Agents — Key Takeaways

## Core Concept
Tools represent a contract between deterministic systems and non-deterministic agents. Unlike traditional software, tools must be designed specifically for agent ergonomics rather than following conventional API patterns.

## Building Process

**Prototyping Phase:**
Start with a quick prototype using documentation (like `llms.txt` files). Connect tools via local MCP servers or Desktop extensions. Test locally before broader deployment.

**Evaluation Framework:**
Generate realistic evaluation tasks requiring multiple tool calls. The article emphasizes avoiding "sandbox" environments—instead use "tasks like 'Schedule a meeting with Jane next week to discuss our latest Acme Corp project. Attach the notes from our last project planning meeting and reserve a conference room.'"

Run evaluations programmatically using simple agentic loops. Include reasoning and feedback blocks in system prompts to trigger chain-of-thought behaviors.

**Iterative Improvement:**
Collaborate with AI agents to analyze transcripts and optimize tool implementations. Track metrics beyond accuracy: "total runtime of individual tool calls and tasks, the total number of tool calls, the total token consumption, and tool errors."

## Five Design Principles

**1. Selective Tool Implementation**
"More tools don't always lead to better outcomes." Instead of exposing raw API endpoints, consolidate functionality. Example: Implement `schedule_event` (handles availability + scheduling) rather than separate `list_users`, `list_events`, and `create_event` tools.

**2. Clear Namespacing**
Group related tools under common prefixes (e.g., `asana_projects_search`, `asana_users_search`). This reduces confusion when agents access hundreds of tools.

**3. Meaningful Context in Responses**
Return "high signal information" prioritizing relevance over flexibility. Use semantic identifiers over cryptic UUIDs. Optionally expose a `response_format` enum allowing agents to request `"concise"` or `"detailed"` responses—the detailed version consumed 206 tokens versus 72 for concise.

**4. Token Efficiency**
Implement "pagination, range selection, filtering, and/or truncation with sensible default parameter values." Claude Code restricts responses to 25,000 tokens by default. Craft error messages to be "specific and actionable improvements, rather than opaque error codes."

**5. Prompt Engineering Tool Descriptions**
"Small refinements to tool descriptions can yield dramatic improvements." Unambiguously name parameters (use `user_id` instead of `user`). Explicitly describe specialized query formats and relationships between resources.

## Measurable Results
Internal evaluations showed significant performance gains. For instance, their Slack MCP server improved substantially when human-written implementations were refined through Claude-assisted optimization.

## Implementation Resources
The article references their "tool evaluation cookbook" and recommends reviewing the Developer Guide's "best practices for tool definitions" and understanding how tools load into Claude's system prompt.
