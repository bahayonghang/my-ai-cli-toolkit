---
name: codex-companion
description: >-
  Run the Codex companion runtime when the user wants plugin-style Codex task
  delegation from inside Codex itself: setup checks, background Codex jobs,
  resumable task handoff, built-in review and adversarial review, or job
  lifecycle commands like status, result, and cancel. Use this whenever the
  user wants Codex to keep working in the background or asks for the
  codex-plugin-cc style workflow inside Codex.
version: 1.0.0
category: development-tools
tags:
  - codex
  - codex-cli
  - background-jobs
  - job-control
  - code-review
  - adversarial-review
  - task-delegation
argument-hint: [task-description]
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

This skill is the plugin-style sibling to the direct [codex] skill. Use:

- `codex` for one-off `codex review` / `codex exec` CLI calls you want to drive manually
- `codex-companion` for setup checks, background jobs, resumable delegated work, and job lifecycle commands

## Prerequisites

1. Verify Codex CLI is installed.
   - Bash / zsh: `command -v codex`
   - PowerShell: `Get-Command codex`
   - If missing, tell the user to install it: `npm install -g @openai/codex`
2. Verify authentication with the companion setup command before the first real run:

```bash
node "$SKILL_DIR/scripts/codex-companion.mjs" setup
```

## Mode Router

Choose one primary subcommand:

- `setup`: readiness checks for `codex`, auth, npm, and app-server capability
- `review`: built-in diff-aware review of the current repo or a base branch
- `adversarial-review`: structured attack-minded review with findings first
- `task`: delegate diagnosis, research, or implementation work to a persistent Codex thread
- `status`: inspect running or recent jobs
- `result`: fetch the stored output for a finished job
- `cancel`: stop an active job

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
node "$COMPANION" setup
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

## Prompting

For delegated `task` runs, prefer compact, block-structured prompts. Read:

- `$SKILL_DIR/references/COMMANDS.md` for the command surface
- `$SKILL_DIR/references/PROMPTING.md` for prompt contracts and XML block patterns

## Notes

- The companion runtime stores per-workspace job state under the OS temp directory by default.
- `status`, `result`, and `cancel` operate on those persisted job records.
- The companion skill deliberately does not implement Claude-only hooks or stop-time review gates.
