# Search Raw Dump: safety-guardrails

**Angle:** safety-guardrails

**Question:** What safety guardrails should wrap an agentic loop beyond permissions, including prompt-injection defenses, output validation, content filtering, action gating, and preventing destructive or runaway behavior?

---

## Query 1: "Anthropic agent safety guardrails prompt injection defense building agents"

- Anthropic Publishes Agent Safety Framework as AI Autonomy Risks Mount — https://blockchain.news/news/anthropic-trustworthy-agents-framework-safety
- Trustworthy agents in practice \ Anthropic — https://www.anthropic.com/research/trustworthy-agents
- Mitigate jailbreaks and prompt injections - Claude API Docs — https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks
- Mitigating the risk of prompt injections in browser use \ Anthropic — https://www.anthropic.com/research/prompt-injection-defenses
- Essential Framework for AI Agent Guardrails | Galileo — https://galileo.ai/blog/ai-agent-guardrails-framework
- LlamaFirewall: An open source guardrail system for building secure AI agents — https://arxiv.org/pdf/2505.03574
- The 2025 AI Agent Index: Documenting Technical and Safety Features of Deployed Agentic AI Systems — https://arxiv.org/pdf/2602.17753
- How we contain Claude across products \ Anthropic — https://www.anthropic.com/engineering/how-we-contain-claude

Key notes: Anthropic four components of agent behavior (model, harness/instructions+guardrails, tools, environment). Multi-layered defense: train models to recognize injection, monitor production traffic, external red-teaming, no single defense is enough. Plan Mode in Claude Code (review whole execution plan upfront). Computer use tool runs classifiers detecting prompt injection in screenshots, steers Claude to ask confirmation. Environmental containment: process sandboxes, VMs, filesystem boundaries, egress controls. Defense at every level.

## Query 2: "LLM agent output validation content filtering guardrails best practices"

- LLM guardrails: Best practices for deploying LLM apps securely | Datadog — https://www.datadoghq.com/blog/llm-guardrails-best-practices/
- The Ultimate Guide to Guardrails in GenAI | Ajay Verma | Medium — https://medium.com/@ajayverma23/the-ultimate-guide-to-guardrails-in-genai-securing-and-standardizing-llm-applications-1502c90fdc72
- Guardrails - Docs by LangChain — https://docs.langchain.com/oss/python/langchain/guardrails
- Guardrails Implementation Best Practice | Dickson Lukose | Medium — https://medium.com/@dickson.lukose/guardrails-implementation-best-practice-e5fa2c1e4e09
- Production Guardrails: Content Filtering and Output Validation for LLMs | ExplainLLM — https://explainllm.ru/en/production/guardrails
- Enhancing Guardrails for Safe and Secure Healthcare AI — https://arxiv.org/pdf/2409.17190
- A Different Approach to AI Safety (Columbia Convening) — https://arxiv.org/pdf/2506.22183
- The Attack and Defense Landscape of Agentic AI: A Comprehensive Survey — https://arxiv.org/pdf/2603.11088
- Agentic Web: Weaving the Next Web with AI Agents — https://arxiv.org/pdf/2507.21206

Key notes: Output guardrails do filtering and relevancy checks (domain drift, hallucinations). Structured output validation (validate/correct, don't hope for valid JSON). Combination of rule-based + AI-assisted. Pipeline: input validation, prompt-injection detection, output filtering (PII, content policy), format/schema validation. Agent-specific output guardrails validate tool usage and action sequences. Tools: NeMo Guardrails, Guardrails AI, LlamaGuard. Never trust LLM output in security-sensitive contexts.

## Query 3: "preventing runaway agent destructive actions safeguards human in the loop action gating"

- The risk of destructive capabilities in agentic ai - Noma Security — https://noma.security/blog/the-risk-of-destructive-capabilities-in-agentic-ai/
- AI Agent Guardrails That Won't Slow Your Team Down — https://hatchworks.com/blog/ai-agents/ai-agent-guardrails/
- Magentic-UI: Towards Human-in-the-loop Agentic Systems — https://arxiv.org/pdf/2507.22358
- Trustworthy Symbiotic Workflows With Human-in-the-Loop LLMs | DZone — https://dzone.com/articles/agentic-aiops-human-in-the-loop-workflows
- Externalization in LLM Agents (Memory, Skills, Protocols, Harness Engineering) — https://arxiv.org/pdf/2604.08224
- From LLM Reasoning to Autonomous AI Agents: A Comprehensive Review — https://arxiv.org/pdf/2504.19678
- SoK: The Attack Surface of Agentic AI -- Tools, and Autonomy — https://arxiv.org/pdf/2603.22928
- A Systematization of Security Vulnerabilities in Computer Use Agents — https://arxiv.org/pdf/2507.05445
- Human-in-the-Loop for AI Agents: Best Practices, Frameworks, Use Cases | Permit.io — https://www.permit.io/blog/human-in-the-loop-for-ai-agents-best-practices-frameworks-use-cases-and-demo
- Kill Switches Don't Work If the Agent Writes the Policy (Stanford Law CodeX) — https://law.stanford.edu/2026/03/07/kill-switches-dont-work-if-the-agent-writes-the-policy-the-berkeley-agentic-ai-profile-through-the-ailccp-lens/

Key notes: Layered defenses / multiple barriers. HITL mandatory for irreversible operations. Action gating patterns: pre-execution approval, post-execution review, escalation triggers (sensitive data, irreversible ops, low confidence). Runaway loops: agents stuck in cycles with no exit; example research tool racking up $47,000 in API costs. Rate limits + quotas bound action rate and cumulative cost; on threshold downgrade autonomy / require HITL / trigger kill-switch. Full autonomy rarely appropriate; place intervention gates.

## Query 4: "OpenAI agents SDK guardrails safety best practices building agents"

- Safety in building agents | OpenAI API — https://platform.openai.com/docs/guides/agent-builder-safety
- OpenAI AI Agents SDK Guardrails | Cobus Greyling | Medium — https://cobusgreyling.medium.com/openai-ai-agents-sdk-guardrails-206bb1e777bc
- Securing Agent Responses with Output Guardrails | CodeSignal — https://codesignal.com/learn/courses/controlling-and-securing-openai-agents-execution-in-typescript-2/lessons/securing-agent-responses-with-output-guardrails-1
- Hands-On with Agents SDK: Safeguarding Input and Output with Guardrails | Towards Data Science — https://towardsdatascience.com/hands-on-with-agents-sdk-safeguarding-input-and-output-with-guardrails/
- Guardrails and human review | OpenAI API — https://developers.openai.com/api/docs/guides/agents/guardrails-approvals
- Guardrails - OpenAI Agents SDK — https://openai.github.io/openai-agents-python/guardrails/
- Guardrails and Human Review in OpenAI Agents | Team 400 Blog — https://team400.ai/blog/2026-04-openai-agents-guardrails-human-review-guide
- Guardrails and Agent-Based Validation | The AI Agent Factory — https://agentfactory.panaversity.org/docs/Building-Agent-Factories/openai-agents-sdk/guardrails-agent-validation

Key notes: Two mechanisms - guardrails (automatic checks) + HITL approvals. Input guardrails (first agent) + output guardrails (final output agent). Guardrail = LLM agent (reasoning) or rule-based function (regex/blocklist). Optimistic parallel execution model, raise exceptions on violation (tripwire). Sanitize inputs, redact PII, detect jailbreaks. Even with mitigations agents can be tricked; limit access granted.
