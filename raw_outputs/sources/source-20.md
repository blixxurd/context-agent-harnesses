# Configure the sandboxed Bash tool - Claude Code Docs
URL: https://code.claude.com/docs/en/sandboxing

Retrieval note: Fetched via WebFetch on 2026-06-14. Page retrieved successfully (full content). Content below is the meaningful markdown extracted from the page.

---

# Configure the sandboxed Bash tool

The Bash sandbox lets Claude run most shell commands without stopping to ask permission. Instead of approving each command, you define which files and network domains commands can touch, and the operating system enforces that boundary for every Bash command and its child processes.

## Get started

The sandbox is built into Claude Code and runs on macOS, Linux, and WSL2. Native Windows is not supported. On Windows, run Claude Code inside a WSL2 distribution.

On macOS, there is nothing to install: sandboxing uses the built-in Seatbelt framework. On Linux and WSL2, the sandbox relies on two packages.

Run `/sandbox` to open the sandbox panel with three tabs:
* **Mode**: choose how sandboxed commands are approved
* **Overrides**: choose whether commands that fail under the sandbox can fall back to running unsandboxed. This is the `allowUnsandboxedCommands` setting
* **Config**: view the resolved sandbox settings

By default, commands inside the sandbox can write only to the working directory and the session temp directory. The first time a command needs a new network domain, Claude Code prompts for approval.

Selecting a mode in the panel writes to your project's local settings at `.claude/settings.local.json`. To enable the sandbox across all of your projects, set `sandbox.enabled` to `true` in your user settings at `~/.claude/settings.json`.

By default, if the sandbox cannot start because dependencies are missing or the platform is unsupported, Claude Code shows a warning and runs commands without sandboxing. To make this a hard failure instead, set `sandbox.failIfUnavailable` to `true`.

### Set up Linux and WSL2

On Linux and WSL2, the sandbox relies on two packages:
* `bubblewrap`: the unprivileged sandboxing tool that enforces filesystem isolation
* `socat`: the relay used to route network traffic through the sandbox proxy

Ubuntu/Debian: `sudo apt-get install bubblewrap socat`
Fedora: `sudo dnf install bubblewrap socat`

The Dependencies tab in `/sandbox` shows whether `ripgrep`, `bubblewrap`, `socat`, and the seccomp filter are available. Ripgrep is bundled with the native Claude Code binary. The seccomp filter is optional and adds Unix domain socket blocking. Install it with `npm install -g @anthropic-ai/sandbox-runtime` if missing.

On Ubuntu 24.04 and later, the default AppArmor policy prevents bubblewrap from creating the user namespaces it needs for isolation. Check with `sysctl kernel.apparmor_restrict_unprivileged_userns`; if it returns `1`, add an AppArmor profile for `bwrap`.

On WSL2, sandboxed commands cannot launch Windows binaries such as `cmd.exe`, `powershell.exe`, or anything under `/mnt/c/`. WSL hands these off to the Windows host over a Unix socket, which the sandbox blocks. Add them to `excludedCommands`.

### Sandbox modes

**Auto-allow mode**: Bash commands attempt to run inside the sandbox and are automatically allowed without requiring permission. Commands that cannot be sandboxed fall back to the regular permission flow.

Even in auto-allow mode:
* Explicit deny rules are always respected
* `rm` or `rmdir` commands that target `/`, your home directory, or other critical system paths still trigger a permission prompt
* Content-scoped ask rules like `Bash(git push *)` still force a prompt even for sandboxed commands
* A bare `Bash` ask rule, or the equivalent `Bash(*)` form, is skipped for commands that run sandboxed

**Regular permissions mode**: All Bash commands go through the regular permission flow, even when sandboxed.

In both modes, the sandbox enforces the same filesystem and network restrictions.

The session temp directory is writable inside the sandbox by default, alongside the working directory. Claude Code sets `$TMPDIR` to this directory for sandboxed commands.

When a command fails because of sandbox restrictions, Claude analyzes the failure and may retry the command with the `dangerouslyDisableSandbox` parameter, which runs outside the sandbox and goes through the regular permission flow. Disable by setting `"allowUnsandboxedCommands": false` (shown as "Strict sandbox mode").

Auto-allow mode works independently of your permission mode setting.

## Configure sandboxing

By default, sandboxed commands can write only to the current working directory and the session temp directory. Use `sandbox.filesystem.allowWrite` to grant access to specific paths:

```json
{
  "sandbox": {
    "enabled": true,
    "filesystem": {
      "allowWrite": ["~/.kube", "/tmp/build"]
    }
  }
}
```

These paths are enforced at the OS level. When the same filesystem array is defined in multiple settings scopes, the arrays are merged.

Path prefixes:
* `/` Absolute path from filesystem root (`/tmp/build` stays `/tmp/build`)
* `~/` Relative to home directory (`~/.kube` becomes `$HOME/.kube`)
* `./` or no prefix: Relative to project root for project settings, or to `~/.claude` for user settings

You can deny access using `sandbox.filesystem.denyWrite` and `sandbox.filesystem.denyRead`, and re-allow specific paths using `sandbox.filesystem.allowRead`.

## How sandboxing works

### Filesystem isolation

* **Default write behavior**: read and write access to the current working directory and its subdirectories, plus the session temp directory that `$TMPDIR` points to
* **Default read behavior**: read access to the entire computer, except certain denied directories. This default still allows reading credential files such as `~/.aws/credentials` and `~/.ssh/`. Add them to `denyRead` to block them.
* **Blocked access**: cannot modify files outside the current working directory and session temp directory without explicit permission, including shell config files such as `~/.bashrc` and system binaries in `/bin/`
* **Git worktrees**: when the working directory is a linked git worktree, the sandbox also allows writes to the main repository's shared `.git` directory. Writes to `hooks/` and `config` inside remain denied.

### Network isolation

* **Domain restrictions**: no domains are pre-allowed. The first time a command needs a new domain, Claude Code prompts for approval. Pre-allow with `allowedDomains`.
* **Managed lockdown**: if `allowManagedDomainsOnly` is set in managed settings, non-allowed domains are blocked automatically instead of prompting.
* The built-in proxy enforces the allowlist based on the requested hostname and does not terminate or inspect TLS traffic.

### OS-level enforcement

* **macOS**: uses Seatbelt
* **Linux**: uses bubblewrap
* **WSL2**: uses bubblewrap, same as Linux

WSL1 is not supported because bubblewrap requires kernel features only available in WSL2.

## How sandboxing relates to permissions and permission modes

Permission rules control which tools Claude Code can use and are evaluated before any tool runs. Sandboxing provides OS-level enforcement that restricts what Bash commands can access. The OS enforces the sandbox boundary on the running process, so it holds regardless of what the model chose to run.

`/sandbox` is not a permission mode. `--dangerously-skip-permissions` is blocked when running as root or via sudo on Linux and macOS; the check is skipped automatically inside a recognized sandbox.

## Configure the sandbox for your organization

Managed settings example:
```json
{
  "sandbox": {
    "enabled": true,
    "failIfUnavailable": true,
    "allowUnsandboxedCommands": false
  }
}
```

For boolean keys such as `enabled` and `failIfUnavailable`, Claude Code uses the managed value and ignores local. For array keys such as `excludedCommands` and `allowRead`, entries from every scope are merged. Set `allowManagedReadPathsOnly` to `true` so only managed `allowRead` entries are honored.

Custom proxy: set `httpProxyPort` and `socksProxyPort` in sandbox.network settings.

## Troubleshooting

* `jest` hangs or fails: `watchman` is incompatible; run `jest --no-watchman`.
* Go-based CLIs (`gh`, `gcloud`, `terraform`) may fail TLS verification under Seatbelt on macOS; list them in `excludedCommands`.
* `docker` is incompatible with the sandbox; add `docker *` to `excludedCommands`.
* Bubblewrap fails inside an unprivileged container: set `enableWeakerNestedSandbox` to `true`.

## Limitations

### Security limitations

* Network filtering restricts domains; the built-in proxy does not terminate or perform TLS inspection. Allowing broad domains such as `github.com` can create paths for data exfiltration via domain fronting.
* Privilege escalation via Unix sockets: `allowUnixSockets` can grant access to powerful services (e.g., `/var/run/docker.sock`).
* Filesystem permission escalation: overly broad write permissions can enable privilege escalation.
* The sandbox automatically denies write access to Claude Code's `settings.json` files at every scope and to the managed settings directory.

### Scope

* Built-in file tools (Read, Edit, Write) use the permission system directly rather than running through the sandbox.
* Environment variables: sandboxed Bash commands inherit the parent process environment by default, including credentials. Set `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` to strip Anthropic and cloud provider credentials.
* Subagents run in the same process as the parent session and use the same sandbox configuration.

Effective sandboxing requires both filesystem and network isolation.
