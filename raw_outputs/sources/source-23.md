# Use XML tags to structure your prompts — Claude Docs
URL: https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags

Retrieval note: The original URL 302-redirected to https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/use-xml-tags. The page is now a consolidated "Prompting best practices" guide (covering clarity, examples, XML structuring, thinking, and agentic systems) for Claude's latest models (Fable 5, Mythos 5, Opus 4.8/4.7/4.6, Sonnet 4.6, Haiku 4.5). Content extracted via WebFetch on 2026-06-14.

---

# Prompting best practices

Comprehensive guide to prompt engineering techniques for Claude's latest models, covering clarity, examples, XML structuring, thinking, and agentic systems.

The page is organized in three parts: model-specific guidance first; techniques for all current models; migration considerations last.

## General principles

### Be clear and direct
Claude responds well to clear, explicit instructions. Being specific about your desired output can help enhance results. If you want "above and beyond" behavior, explicitly request it rather than relying on the model to infer this from vague prompts.

Golden rule: Show your prompt to a colleague with minimal context on the task and ask them to follow it. If they'd be confused, Claude will be too.

- Be specific about the desired output format and constraints.
- Provide instructions as sequential steps using numbered lists or bullet points when the order or completeness of steps matters.

### Add context to improve performance
Providing context or motivation behind your instructions can help Claude better understand your goals and deliver more targeted responses. (Example: explaining that a response will be read aloud by a text-to-speech engine, so never use ellipses.)

### Use examples effectively
Examples (few-shot / multishot prompting) are one of the most reliable ways to steer Claude's output. Make them Relevant, Diverse, and Structured (wrap examples in `<example>` tags, multiple in `<examples>` tags). Include 3–5 examples for best results.

### Structure prompts with XML tags
XML tags help Claude parse complex prompts unambiguously, especially when a prompt mixes instructions, context, examples, and variable inputs. Wrapping each type of content in its own tag (e.g. `<instructions>`, `<context>`, `<input>`) reduces misinterpretation.
Best practices:
- Use consistent, descriptive tag names across your prompts.
- Nest tags when content has a natural hierarchy (documents inside `<documents>`, each inside `<document index="n">`).

### Give Claude a role
Setting a role in the system prompt focuses Claude's behavior and tone. Even a single sentence makes a difference (e.g. system="You are a helpful coding assistant specializing in Python.").

### Long context prompting
For large documents (20k+ tokens):
- Put longform data at the top, above your query, instructions, and examples.
- Queries at the end can improve response quality by up to 30% in tests, especially with complex, multi-document inputs.
- Structure document content/metadata with XML tags: wrap each document in `<document>` tags with `<document_content>` and `<source>` subtags.
- Ground responses in quotes: ask Claude to quote relevant parts of documents first before carrying out its task.

### Model self-knowledge
Sample prompt for model identity: "The assistant is Claude, created by Anthropic. The current model is Claude Opus 4.8." The exact model string for Claude Opus 4.8 is claude-opus-4-8.

## Output and formatting
Claude's latest models have a more concise and natural communication style: more direct and grounded, more conversational, less verbose (may skip verbal summaries after tool calls).

### Control the format of responses
1. Tell Claude what to do instead of what not to do.
2. Use XML format indicators (e.g. "Write the prose sections in <smoothly_flowing_prose_paragraphs> tags").
3. Match your prompt style to the desired output (removing markdown from your prompt can reduce markdown in output).
4. Use detailed prompts for specific formatting preferences.

### LaTeX output
Claude's latest models default to LaTeX for mathematical expressions; add instructions to use plain text if preferred.

### Migrating away from prefilled responses
Starting with Claude 4.6 models and Claude Mythos Preview, prefilled responses on the last assistant turn are no longer supported. Requests with prefilled assistant messages return a 400 error. Earlier models continue to support prefills; adding assistant messages elsewhere in the conversation is not affected. Migration options: Structured Outputs feature, tools with enum field, direct instructions to skip preamble, move continuation to user message.

## Tool use
Claude's latest models are trained for precise instruction following and benefit from explicit direction to use specific tools. "Can you suggest some changes" may yield suggestions rather than implementation; be explicit ("Change this function...").

`<default_to_action>` and `<do_not_act_before_instructions>` sample prompts steer proactiveness. Opus 4.5/4.6 are more responsive to system prompt; dial back aggressive language like "CRITICAL: You MUST use this tool when..." to "Use this tool when...".

### Optimize parallel tool calling
Claude's latest models excel at parallel tool execution. Without prompting the model already has a high success rate; you can boost this to ~100% with a `<use_parallel_tool_calls>` prompt.

## Thinking and reasoning
Claude Opus 4.6 does significantly more upfront exploration than previous models, especially at higher effort settings. Replace blanket defaults with targeted instructions; remove over-prompting; use effort as a fallback.

`budget_tokens` cap is still functional on Opus 4.6 and Sonnet 4.6 but is deprecated. Prefer lowering effort or using max_tokens with adaptive thinking.

Claude Opus 4.6 and Sonnet 4.6 use adaptive thinking (`thinking: {type: "adaptive"}`), calibrating based on the effort parameter and query complexity. In internal evaluations, adaptive thinking reliably drives better performance than extended thinking. Thinking is off by default when you omit the thinking parameter.

When extended thinking is disabled, Claude Opus 4.5 is particularly sensitive to the word "think" and its variants; consider "consider," "evaluate," or "reason through."

## Agentic systems
### Long-horizon reasoning and state tracking
Claude maintains orientation across extended sessions by focusing on incremental progress. Claude 4.6 and 4.5 models feature context awareness (track remaining token budget).

Multi-context window workflows: use a different prompt for the first context window; have the model write tests in structured format (tests.json); set up quality-of-life tools (init.sh); starting fresh vs compacting; provide verification tools (Playwright MCP); encourage complete usage of context.

State management: use structured formats (JSON) for state data; unstructured text for progress notes; git for state tracking; emphasize incremental progress.

### Balancing autonomy and safety
Without guidance, Claude Opus 4.6 may take hard-to-reverse actions (deleting files, force-pushing, posting to external services). Add a prompt to confirm before destructive/hard-to-reverse/externally-visible actions.

### Research and information gathering
Provide clear success criteria; encourage source verification across multiple sources; use structured approach with competing hypotheses and confidence levels.

### Subagent orchestration
Claude's latest models can delegate to subagents without explicit instruction. Claude Opus 4.6 has a strong predilection for subagents and may overuse them; add guidance about when subagents are/aren't warranted.

### Reduce file creation in agentic coding
Models may create temp files as a scratchpad. Instruct cleanup if desired.

### Overeagerness / overengineering
Claude Opus 4.5 and 4.6 tend to overengineer (extra files, unnecessary abstractions, unrequested flexibility). Add guidance to keep solutions minimal.

### Avoid focusing on passing tests and hard-coding
Add prompt requiring general-purpose, non-hard-coded solutions.

### Minimizing hallucinations in agentic coding
`<investigate_before_answering>`: Never speculate about code you have not opened; read referenced files before answering.

## Capability-specific tips
- Improved vision: giving Claude a crop tool shows consistent uplift on image evals.
- Frontend design: avoid "AI slop" aesthetic; `<frontend_aesthetics>` prompt snippet provided.

## Migration considerations
When migrating to Claude 4.6 models: be specific; frame instructions with modifiers; request specific features explicitly; update thinking config to adaptive thinking; migrate away from prefilled responses; tune anti-laziness prompting (dial back aggressive guidance — models are more proactive and may overtrigger).
