---
name: codex
description: >-
  OpenAI Codex CLI wrapper — five modes: `codex review` for PR/diff/commit
  review, adversarial challenge for edge cases and security, consult for
  second opinions on code or architecture, live research with citations via
  `--search`, and apply/fix for approved code changes. Use when the user
  invokes /codex or explicitly wants the local Codex CLI.
version: 1.5.0
category: developer-tools-integrations
tags:
  - openai-codex
  - codex-cli
  - gpt-5.4
  - second-opinion
  - code-review
  - adversarial-review
  - technical-research
argument-hint: [task-description]
allowed-tools:
  - Bash(codex *)
  - Bash(command -v codex)
  - Bash(Get-Command codex*)
  - Read
---

Run Codex CLI for `$ARGUMENTS`.

## Defaults

- Primary review command: `codex review`
- Primary general command: `codex exec`
- Default model: `gpt-5.4` (referred to as `$MODEL` in recipes below)
- Default review / consult reasoning config: `-c model_reasoning_effort=xhigh`
- Default research reasoning config: `-c model_reasoning_effort=high`
- Default research search path: top-level `--search`
- Default posture: review-only first, write only when the user explicitly wants Codex to apply changes
- Preferred automation path for writes: `--full-auto` before `--dangerously-bypass-approvals-and-sandbox`
- Keep sandbox bypass available for exceptional cases, but only after explicit user confirmation for that specific run
- Resume path: `codex exec resume <session_id> "<follow-up>"`

## Prerequisites

1. Verify Codex CLI is installed.
   - Bash / zsh: `command -v codex`
   - PowerShell: `Get-Command codex`
   - If missing, tell the user to install it manually: `npm install -g @openai/codex`
2. Verify authentication: `codex login status`
   - If not authenticated, tell the user to run `codex login`
3. If Codex is unavailable and the task is mainly research or docs lookup, fall back to the host's native web or documentation tools instead of blocking.

## Current CLI Compatibility

Treat current local CLI help as the source of truth before constructing commands:

- Check `codex --help`, `codex exec --help`, `codex review --help`, and `codex resume --help` when a recipe looks stale.
- Never emit a `--reasoning` flag. Current Codex CLI exposes reasoning through `-c model_reasoning_effort=<level>`.
- `codex review` accepts either a review target flag (`--uncommitted`, `--base`, `--commit`) or a custom prompt, not both in the same command.
- If the user wants a targeted review plus custom instructions, switch from `codex review` to `codex exec` with an explicit prompt over the repo or files.
- Do not rely on undocumented commands like `codex sessions list` or `codex --print-config`; prefer `codex resume --all`, the session id printed by `codex exec`, or reading `~/.codex/config.toml` directly.

## Bypass Confirmation Gate

Keep `danger-full-access` and `--dangerously-bypass-approvals-and-sandbox`
available, but never use them by default.

Before using either bypass path:

1. Try `read-only`, `workspace-write`, or `--full-auto` first.
2. State why the narrower sandbox is insufficient.
3. Show the exact Codex command that would run with bypass.
4. Ask the user to confirm this specific bypassed run.
5. Only proceed after an explicit yes.

Use this confirmation shape:

```text
Codex needs <danger-full-access | full bypass> for this run to <reason>.
This would allow <scope>. Proceed?
```

## Scope Boundary

This skill wraps the **local Codex CLI** (`codex` command). It is distinct from the
OMC orchestration layer's `ask_codex` MCP tool, which delegates to Codex as an
agent role (architect, planner, critic, etc.) via the MCP protocol.

- **This skill**: user explicitly wants `codex review`, `codex exec`, or Codex CLI features
- **OMC `ask_codex`**: orchestrator delegates analysis/review to Codex as a reasoning backend

If the user says "ask codex about X" without specifying CLI usage, defer to OMC's
MCP delegation. This skill activates on `/codex` invocation or explicit CLI intent.

## Mode Router

If `$ARGUMENTS` is empty, ask the user for the task description.

Choose one primary mode:

- `review`: PR, diff, branch, commit, uncommitted changes, merge readiness, or review-style second opinion. Prefer `codex review`.
- `challenge`: adversarial probing for edge cases, race conditions, security issues, or failure modes. Use `codex exec` with a read-only posture and an attack-minded prompt.
- `consult`: second opinion on a file, module, architecture decision, migration, or plan. Use `codex exec` without write access.
- `research`: latest docs, current product comparisons, citations, release notes, or vendor landscape. Use top-level `--search` with `codex exec`.
- `apply/fix`: generation, refactoring, debugging, or fixing approved findings. Only use when the user explicitly wants Codex to make changes.
- `resume`: follow-up on a previous non-interactive session via `codex exec resume`.

If a task spans multiple modes, do them in this order:

1. `review` or `challenge`
2. `consult`
3. `research`
4. `apply/fix`

### Keyword Signals

| Keywords in `$ARGUMENTS`                         | → Mode      |
|--------------------------------------------------|-------------|
| review, PR, diff, merge, branch, commit, changes | review      |
| challenge, break, attack, adversarial, scary     | challenge   |
| consult, second opinion, what do you think, @file| consult     |
| research, compare, latest, docs, citations       | research    |
| fix, apply, refactor, implement, write, generate | apply/fix   |
| resume, continue, follow-up, session             | resume      |

If ambiguous, prefer read-only modes (review/challenge/consult) over write modes (apply/fix).

## Planned Run Header

Before any Codex invocation, emit this block exactly once:

```text
Planned AI Run
- Tool: Codex CLI
- Mode: <review | challenge | consult | research | apply/fix | resume>
- Model: <literal model id>
- Runtime: <model_reasoning_effort=xhigh | model_reasoning_effort=high | model_reasoning_effort=<level>; sandbox=<mode>>
- Search: <off | live>
- Access: <review-safe | workspace-write | confirmed danger-full-access | confirmed bypassed sandbox/approvals>
- Workdir: <path or current>
```

Rules:

- Keep the header and the final command aligned.
- Use the same literal model id in the header and the actual Codex invocation when you override the model explicitly.
- For `codex review`, pass model or sandbox overrides as top-level Codex options before the subcommand, for example `codex -m $MODEL -s read-only review ...`.
- If you set reasoning, surface it as `-c model_reasoning_effort=<level>` in the final command. Never invent a `--reasoning` flag.
- Do not combine `codex review` target selectors with a prompt. Use `codex exec` when the user needs both a fixed scope and custom focus.
- Use `Search: live` only for runs started with top-level `--search`.
- `review`, `challenge`, and `consult` should default to read-only or another review-safe posture.
- `apply/fix` should default to `workspace-write` / `--full-auto`.
- Use `danger-full-access` or full bypass only after explicit confirmation for that exact run.
- If `-C` is omitted, show `current` for `Workdir`.

## Quick Reference

| Mode      | Command                          | Default flags              |
|-----------|----------------------------------|----------------------------|
| Review    | `codex review`                   | `-m $MODEL -s read-only`   |
| Challenge | `codex exec`                     | `-s read-only -c model_reasoning_effort=xhigh` |
| Consult   | `codex exec`                     | `-s read-only -c model_reasoning_effort=xhigh` |
| Research  | `codex --search exec`            | `--skip-git-repo-check -c model_reasoning_effort=high` |
| Apply/Fix | `codex exec`                     | `--full-auto -c model_reasoning_effort=xhigh` |
| Resume    | `codex exec resume <id> "<msg>"` | inherits previous session  |

For full command recipes, prompt templates, and shell-quoting notes, read `$SKILL_DIR/references/REFERENCE.md`.

## Reference

Read `$SKILL_DIR/references/REFERENCE.md` for:

- review, challenge, consult, and research prompt templates (with output format instructions)
- target-specific command recipes
- query-splitting guidance
- citation and shell-quoting notes
- session ID retrieval for resume
- post-run safety checklist

## Sandbox & Git Permissions

Codex runs commands inside a sandbox that restricts file system access. This is the
single most common source of "Permission denied" errors, especially for git operations.

### Why git fails in the sandbox

Even in `workspace-write` mode, Codex force-mounts `.git/` as **read-only** after
writable roots are applied. Any git command that writes metadata — `fetch`, `commit`,
`pull`, `push`, `checkout`, `merge`, `rebase`, `stash` — will fail with:

```
error: cannot open '.git/FETCH_HEAD': Permission denied
```

### Quick fix: choose the right sandbox mode

| Sandbox mode | git read | git write | When to use |
|--------------|----------|-----------|-------------|
| `read-only` (default) | Yes | **No** | review, challenge, consult |
| `workspace-write` | Yes | **No** (`.git/` stays read-only) | editing files only |
| `--full-auto` | Yes | **No** (same sandbox; sets `-a on-request` + `-s workspace-write`) | low-friction file edits |
| `danger-full-access` | Yes | **Yes** | apply/fix that needs git write |
| `--dangerously-bypass-approvals-and-sandbox` | Yes | **Yes** | last resort, unrestricted |

For any mode that needs git write access (commit, push, pull), you **must** use
`danger-full-access` or `--dangerously-bypass-approvals-and-sandbox`.
Do not switch to either mode until the user has explicitly confirmed the bypassed run.

### Recommended sandbox flags by mode

- **Review / Challenge / Consult**: `-s read-only` (default, safe)
- **Research**: `--skip-git-repo-check` (no repo context needed)
- **Apply/Fix without git writes**: `--full-auto` (low-friction, sandboxed)
- **Apply/Fix with git writes**: `danger-full-access` after confirmation; use full bypass only as a confirmed last resort

### Platform-specific sandbox issues

**Windows:**
- Git Bash (`bash.exe`) fails inside Windows sandbox with `"couldn't create signal pipe, Win32 error 5"` (issue [#15016](https://github.com/openai/codex/issues/15016)).
- **Workaround**: use PowerShell as the shell, or disable sandbox:
  ```toml
  # ~/.codex/config.toml
  [windows]
  sandbox = "off"
  ```

**Linux (bubblewrap):**
- `.git/` and resolved `gitdir:` targets are force-mounted read-only after writable
  roots, and `--add-dir` cannot override this (issue [#14338](https://github.com/openai/codex/issues/14338)).
- AppArmor `unprivileged_userns` restriction can prevent the sandbox from starting
  entirely (issue [#9273](https://github.com/openai/codex/issues/9273)).

**macOS:**
- Git fsmonitor IPC socket is blocked by sandbox network policy
  (issue [#14372](https://github.com/openai/codex/issues/14372)).
- **Workaround**: disable fsmonitor before running Codex:
  ```bash
  git config --local core.fsmonitor false
  ```

### Pre-trusting a workspace

To avoid the trust prompt on every run, add the project to `config.toml`:

```toml
# ~/.codex/config.toml
[projects."/path/to/your/project"]
trust_level = "trusted"
```

### Diagnosing sandbox denials

Use the built-in sandbox diagnostic to see what is being blocked:

```bash
codex sandbox <platform> --log-denials <command>
# Example:
codex sandbox macos --log-denials git diff
codex sandbox linux --log-denials git commit -m "test"
```

For full sandbox configuration details, read `$SKILL_DIR/references/REFERENCE.md`.

## Error Handling

- `codex: command not found`: tell the user to install `@openai/codex`
- `codex login status` fails or shows no auth: tell the user to run `codex login`
- rate limit or timeout: retry with a smaller scope, lower reasoning, or a lighter model
- research output lacks citations: rerun with `--search` and an explicit request for URLs
- review task accidentally ran in write mode: stop, surface the mismatch, and switch back to review-safe mode
- Codex unavailable: fall back to native tools when the task does not strictly require Codex
- **sandbox permission denied on `.git/`**: switch to `danger-full-access` or `--dangerously-bypass-approvals-and-sandbox`; see the Sandbox section above
- **Windows bash signal pipe error**: switch to PowerShell or disable Windows sandbox
- **git fsmonitor IPC error (macOS)**: run `git config --local core.fsmonitor false`
- **sandbox fails to start (Linux AppArmor)**: check `kernel.apparmor_restrict_unprivileged_userns` sysctl

## Notes

- `codex exec` is the preferred general non-interactive entrypoint.
- `codex review` is the preferred review entrypoint for branch, diff, commit, and uncommitted review.
- Read-only and review-safe paths are the default. Writing is opt-in.
- For current Codex configuration semantics, project-scoped overrides, and web search modes, rely on `~/.codex/config.toml` and current CLI help.
