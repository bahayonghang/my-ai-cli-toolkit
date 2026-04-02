---
name: codex-companion
description: >-
  Manage Codex background tasks, persistent job threads, adversarial code
  reviews, and job lifecycle (status, result, cancel) from inside any AI
  coding session. Use this skill proactively whenever the user wants to
  delegate work to Codex and check back later, run a security-focused or
  attack-minded code review, resume a previous Codex task, check on running
  Codex jobs. Also use when the user mentions "background task", "Codex
  job", "adversarial review", "diff review", or wants Codex to keep
  working while they do something else.
version: 1.1.0
category: development-tools
tags:
  - codex
  - codex-cli
  - background-jobs
  - background-task
  - job-control
  - code-review
  - adversarial-review
  - security-review
  - diff-review
  - task-delegation
  - persistent-thread
argument-hint: "[task-description | review | adversarial-review | status | result | cancel]"
allowed-tools:
  - Bash(node *)
  - Bash(command -v codex)
  - Bash(Get-Command codex)
  - Bash(npm *)
  - Read
---

Run the Codex companion runtime for `$ARGUMENTS`.

Script path:

```text
$SKILL_DIR/scripts/codex-companion.mjs
```

## Quick Start

```bash
node "$SKILL_DIR/scripts/codex-companion.mjs" review --base main       # 1. Review changes
node "$SKILL_DIR/scripts/codex-companion.mjs" task "fix the bug"       # 2. Delegate work
node "$SKILL_DIR/scripts/codex-companion.mjs" status                   # 3. Check progress
node "$SKILL_DIR/scripts/codex-companion.mjs" result <job-id>          # 4. Get output
```

## When to Use This vs the `codex` Skill

| Scenario | Use |
|----------|-----|
| One-off `codex review` or `codex exec` you drive manually | `codex` skill |
| Background jobs you check on later | `codex-companion` |
| Resumable multi-turn task threads | `codex-companion` |
| Structured adversarial review with JSON findings | `codex-companion` |
| Job lifecycle: status, result, cancel | `codex-companion` |

## Prerequisites

1. Verify Codex CLI is installed.
   - Bash / zsh: `command -v codex`
   - PowerShell: `Get-Command codex`
   - If missing, tell the user to install it: `npm install -g @openai/codex`
2. If Codex is installed but not authenticated, run `codex login`.
   - If browser login is blocked, retry with `codex login --device-auth` or `codex login --with-api-key`

## Mode Router

Choose one primary subcommand:

| Subcommand | Purpose | Read-only? |
|------------|---------|------------|
| `review` | Built-in diff-aware review of the current repo or a base branch | Yes |
| `adversarial-review` | Structured attack-minded review with findings first | Yes |
| `task` | Delegate diagnosis, research, or implementation to a persistent Codex thread | Configurable |
| `status` | Inspect running or recent jobs | Yes |
| `result` | Fetch the stored output for a finished job | Yes |
| `cancel` | Stop an active job | N/A |

If the user asks to "continue", "resume", "keep going", or "follow up" on prior Codex work, prefer `task --resume-last`.

## Default Command Forms

Set a helper variable first when the session is command-heavy.

### Bash / zsh

```bash
COMPANION="$SKILL_DIR/scripts/codex-companion.mjs"
```

### PowerShell

```powershell
$COMPANION = "$SKILL_DIR/scripts/codex-companion.mjs"
```

Then use:

```bash
node "$COMPANION" review --base main
node "$COMPANION" adversarial-review --base main
node "$COMPANION" task "investigate why the flaky test started failing"
node "$COMPANION" task --write "apply the smallest safe fix for the failing test"
node "$COMPANION" task --background --write "implement the approved refactor"
node "$COMPANION" task --resume-last "continue from the latest task and finish the next highest-value step"
node "$COMPANION" status
node "$COMPANION" result <job-id>
node "$COMPANION" cancel <job-id>
```

## Execution Rules

- Prefer `review` or `adversarial-review` before `task --write` when the user wants validation first.
- Keep `review` and `adversarial-review` read-only. Do not turn findings into fixes unless the user separately asks for a write-capable `task`.
- Use `task --write` only when the user explicitly wants Codex to modify files.
- Use `task --background` for long-running or open-ended work.
- When the user did not explicitly ask for backgrounding, keep clearly bounded work in the foreground.
- If `result` shows touched files, inspect the diff or run follow-up verification before claiming the work is complete.

## Structured Output

All commands support `--json` for machine-readable output. The adversarial review returns findings matching the schema in `$SKILL_DIR/schemas/review-output.schema.json`:

- **verdict**: `approve` or `needs-attention`
- **findings[]**: each with `severity`, `title`, `body`, `file`, `line_start`, `line_end`, `confidence`, `recommendation`
- **summary**: terse ship/no-ship assessment
- **next_steps**: suggested follow-up actions

## Prompting

For delegated `task` runs, prefer compact, block-structured prompts. Read:

- `$SKILL_DIR/references/COMMANDS.md` for the full command surface and exit codes
- `$SKILL_DIR/references/PROMPTING.md` for prompt contracts and XML block patterns

## Error Recovery

| Problem | Solution |
|---------|----------|
| Codex is not installed | Run `npm install -g @openai/codex` |
| Codex is not authenticated | Run `codex login` (or `codex login --device-auth` if browser is blocked) |
| Task fails mid-execution | Check `status <job-id>` for error details; use `task --resume-last` to retry from the last thread |
| `state.json` corrupt or missing | The runtime auto-recovers from individual job files; if all state is lost, start fresh with a new `task` |
| Broker process not responding | Kill stale processes (`ps aux | grep codex-companion`) and retry; the broker restarts automatically |

## Notes

- The companion runtime stores per-workspace job state under the OS temp directory by default (`$TMPDIR/codex-companion/`).
- `status`, `result`, and `cancel` operate on those persisted job records.
- The companion skill deliberately does not implement Claude-only hooks or stop-time review gates.
- Maximum 50 jobs retained per workspace; older jobs are pruned automatically.
