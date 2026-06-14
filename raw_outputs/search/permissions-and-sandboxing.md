# Raw Search Results: permissions-and-sandboxing

**Angle:** permissions-and-sandboxing

**Question:** How should an agent harness implement permissions, approval flows, and sandboxing/isolation for tool execution (filesystem, network, shell) to safely constrain autonomous actions?

---

## Query 1: Claude Agent SDK permissions allowlist tool approval permission modes

- **GitHub - anthropics/claude-agent-sdk-python** — https://github.com/anthropics/claude-agent-sdk-python
  - Official Python SDK repo; source for permission/tool-config primitives.
- **Handling Permissions - Claude Docs** — https://docs.claude.com/en/docs/agent-sdk/permissions
  - Primary docs on permission modes, allowed_tools/disallowed_tools, canUseTool callback.
- **Permissions — ClaudeCode v0.36.3** — https://hexdocs.pm/claude_code/permissions.html
  - Elixir community SDK permission docs.
- **Configure permissions - Claude Code Docs** — https://code.claude.com/docs/en/agent-sdk/permissions
  - Mirror of permissions docs on code.claude.com.
- **Permissions Guide — claude_agent_sdk v0.7.5** — https://hexdocs.pm/claude_agent_sdk/0.7.5/permissions.html
  - Community SDK guide.
- **ClaudeAgentSDK.Permission — claude_agent_sdk v0.17.2** — https://hexdocs.pm/claude_agent_sdk/ClaudeAgentSDK.Permission.html
  - API reference for permission module.
- **Configure permissions - Claude API Docs** — https://platform.claude.com/docs/en/agent-sdk/permissions
  - Platform docs mirror.
- **Claude Code --dangerously-skip-permissions: 5 Modes, Only ...** — https://www.morphllm.com/claude-code-dangerously-skip-permissions
  - Third-party explainer of the 5 permission modes (SEO-ish, lower trust).
- **Claude Agent SDK Complete Guide** — https://hidekazu-konishi.com/entry/claude_agent_sdk_complete_guide.html
  - Practitioner deep-dive guide.

Key extracted facts: `allowed_tools` is an auto-approve allowlist; `disallowed_tools` blocks. Permission modes: default, accept_edits, plan, bypass_permissions, auto, dont_ask. Evaluation order: PreToolUse Hook → Deny Rules → Allow Rules → Ask Rules → Permission Mode Check → canUseTool Callback → PostToolUse Hook. Four control mechanisms: Permission Modes, canUseTool callback, Hooks, Permission rules (settings.json).

---

## Query 2: agent sandboxing isolation shell filesystem execution containerization network policy

- **Caging the Agents: A Zero Trust Security Architecture for Autonomous AI in Healthcare** — https://arxiv.org/pdf/2603.17419
  - Academic zero-trust architecture for agents.
- **How to sandbox AI agents in 2026: MicroVMs, gVisor & isolation strategies — Northflank** — https://northflank.com/blog/how-to-sandbox-ai-agents
  - Engineering blog comparing isolation strategies (microVMs, gVisor, containers).
- **Coding Agent Sandbox: Secure Environments for AI-Generated Code — Bunnyshell** — https://www.bunnyshell.com/guides/coding-agent-sandbox/
  - Vendor guide on coding-agent sandboxes.
- **Claude Code Sandboxing: Network Isolation, File System Controls, and Container Security — TrueFoundry** — https://www.truefoundry.com/blog/claude-code-sandboxing
  - Practitioner write-up of Claude Code sandbox controls.
- **What Is AI Agent Sandboxing? Kubernetes-Native Enforcement Explained - ARMO** — https://www.armosec.io/blog/what-is-ai-agent-sandboxing-kubernetes-native-enforcement-explained/
  - Security vendor blog; K8s/gVisor enforcement.
- **Externalization in LLM Agents: A Unified Review...Harness Engineering** — https://arxiv.org/pdf/2604.08224
  - Academic survey including harness engineering.
- **Configure the sandboxed Bash tool - Claude Code Docs** — https://code.claude.com/docs/en/sandboxing
  - Primary docs: OS-enforced filesystem/network boundaries for Bash and child processes.
- **The OpenHands Software Agent SDK** — https://arxiv.org/pdf/2511.03690
  - Academic paper on production agent SDK design.
- **Sandboxing & Isolation | openclaw/openclaw | DeepWiki** — https://deepwiki.com/openclaw/openclaw/7.3-sandboxing-and-isolation
  - Generated wiki on a sandbox implementation.

Key extracted facts: Sandboxing = isolated env (often Docker) restricting filesystem, network, command exec. Threat vectors: code-exec exploits, filesystem access, network comms, resource consumption, privilege escalation. gVisor = userspace kernel (Sentry) intercepting syscalls; Docker = namespaces+cgroups sharing host kernel; microVMs (Kata/Firecracker) = hardware-enforced per-workload kernel. Controls: read-only root mount with specific writable dirs, network domain allowlists, resource limits; OS enforces boundary per Bash command + children.

---

## Query 3: Anthropic Claude Code secure agent human in the loop approval flow engineering blog

- **Inside Claude Code Auto Mode: ...Human Approval Gates - InfoQ** — https://www.infoq.com/news/2026/05/anthropic-claude-code-auto-mode/
  - News coverage of Auto Mode + subagent outbound/return checks.
- **How we contain Claude across products — Anthropic** — https://www.anthropic.com/engineering/how-we-contain-claude
  - Primary Anthropic engineering blog on containment.
- **Anthropic Introduces Code Review via Claude Code... - MarkTechPost** — https://www.marktechpost.com/2026/03/09/anthropic-introduces-code-review-via-claude-code...
  - Coverage of agentic security review (lower trust).
- **Anthropic's agentic solution for vulnerability detection | Claude Security — Anthropic** — https://www.anthropic.com/product/security
  - Product/security page.
- **Trustworthy agents in practice — Anthropic** — https://www.anthropic.com/research/trustworthy-agents
  - Anthropic research on trustworthy agents.
- **Claude Code | Anthropic's agentic coding system — Anthropic** — https://www.anthropic.com/product/claude-code
  - Product overview.
- **Claude Code Review by Anthropic... - DEV Community** — https://dev.to/umesh_malik/anthropic-code-review-for-claude-code-multi-agent-pr-reviews-pricing-setup-and-limits-3o35
  - Community write-up.
- **Making frontier cybersecurity capabilities available to defenders — Anthropic** — https://www.anthropic.com/news/claude-code-security
  - Anthropic news post.
- **Engineering at Anthropic (Claude Code sandboxing)** — https://anthropic.com/engineering/claude-code-sandboxing
  - Primary engineering blog on Claude Code sandboxing.

Key extracted facts: Claude Code started with "allow reads, require approval for write/bash/network" — led to approval fatigue within weeks. Sandboxing cut permission prompts ~84% internally. Plan-up-front + review/edit/approve + intervene-anytime. Auto Mode adds outbound intent-alignment checks and return checks for prompt-injection detection on subagents.

---

## Query 4: OpenAI Codex agent sandbox network access approval policy tool execution

- **Agent approvals & security – Codex | OpenAI Developers** — https://developers.openai.com/codex/agent-approvals-security
  - Primary Codex docs on approvals + security model.
- **Running Codex safely at OpenAI | OpenAI** — https://openai.com/index/running-codex-safely/
  - OpenAI primary post on safe operation, monitoring.
- **Sandbox and Approval Policies | openai/codex | DeepWiki** — https://deepwiki.com/openai/codex/2.4-sandbox-and-approval-policies
  - Repo wiki on sandbox/approval policies.
- **Sandbox – Codex | OpenAI Developers** — https://developers.openai.com/codex/concepts/sandboxing
  - Primary docs on Codex sandboxing concepts.
- **How to enable non-interactive network access only... · openai/codex Discussion #7058** — https://github.com/openai/codex/discussions/7058
  - Maintainer/community discussion on network config.
- **Advanced Configuration – Codex | OpenAI Developers** — https://developers.openai.com/codex/config-advanced
  - Config reference.
- **Understanding Codex Sandbox and Agent Approvals** — https://azukiazusa.dev/en/blog/codex-sandbox-agent-authorization/
  - Practitioner blog.

Key extracted facts: Network access OFF by default in sandbox. Sandbox = technical boundaries; approval policy = when to stop and ask before crossing them. Codex cloud = isolated OpenAI-managed containers, two-phase: setup phase (network on for deps) then agent phase (offline by default). Configurable sandbox/approval/network by risk tolerance. AI security triage agent reviews logs (request, tool activity, approval decisions, results, network policy decisions/blocks).
