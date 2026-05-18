# Codex Companion

Use the Codex companion runtime when you want the `codex-plugin-cc` style workflow inside Codex itself: readiness checks, background jobs, resumable delegated work, or job lifecycle commands such as status, result, and cancel.

This skill corresponds to the Codex companion prompt pack currently shipped under `content/platforms/codex/prompts/codex-companion/`.

If you need companion-style workflows for other CLIs instead of Codex-specific runtime lifecycle control, see:

- [claude-code-companion](./claude-code-companion.md)
- [gemini-companion](./gemini-companion.md)
- [skill-map](./skill-map.md)

| Skill | Positioning | Best for |
|---|---|---|
| Codex prompts | Codex CLI prompt pack | `task`, `review`, `status`, `result`, and `cancel` prompt flows |
| `codex-companion` | Companion runtime | Persistent jobs, follow-up task threads, plugin-like review and task orchestration |

## Command Surface

The skill drives:

```bash
node "$SKILL_DIR/scripts/codex-companion.mjs" <subcommand> [...]
```

| Subcommand | Purpose | Common flags | Example |
|---|---|---|---|
| `setup` | Check Codex CLI readiness, auth, npm, and app-server capability | `--json` | `node "$SKILL_DIR/scripts/codex-companion.mjs" setup` |
| `review` | Read-only review of the current repo or a base branch | `--base <ref>` `--scope ...` | `node "$SKILL_DIR/scripts/codex-companion.mjs" review --base main` |
| `adversarial-review` | Attack-minded review for regressions, edge cases, race conditions, and missing tests | `--base <ref>` `--scope ...` `[focus text]` | `node "$SKILL_DIR/scripts/codex-companion.mjs" adversarial-review --base main` |
| `task` | Delegate diagnosis, research, or implementation to a persistent task thread | `--write` `--background` `--resume-last` `--model` `--effort` | `node "$SKILL_DIR/scripts/codex-companion.mjs" task --background --write "implement the approved refactor"` |
| `status` | Inspect running and recent jobs | `[job-id]` `--wait` `--json` | `node "$SKILL_DIR/scripts/codex-companion.mjs" status` |
| `result` | Show the stored output for a finished job | `[job-id]` `--json` | `node "$SKILL_DIR/scripts/codex-companion.mjs" result <job-id>` |
| `cancel` | Cancel an active job | `[job-id]` `--json` | `node "$SKILL_DIR/scripts/codex-companion.mjs" cancel <job-id>` |

## What It Adds Beyond `codex`

| Added capability | Why it matters |
|---|---|
| Background jobs | The run can keep going after the current turn |
| `task --resume-last` | Lets you continue the same Codex task thread |
| Persisted job state | You can inspect jobs by workspace later |
| `status / result / cancel` | Gives the runtime a plugin-style lifecycle surface |

## Usage Table

| Layer | Invocation style | Example | Best for |
|---|---|---|---|
| Skill | Explicit skill call in chat | ``$codex-companion run an adversarial-review on the current repository and focus on hidden regressions, race conditions, and missing tests`` | Forcing Codex to use this skill |
| Runtime | Direct script invocation | ``node "$SKILL_DIR/scripts/codex-companion.mjs" adversarial-review --base main`` | Stable, low-level execution |
| Prompt command | Slash-like prompt installed into Codex | `/codex-companion:adversarial-review --base main` | Closest UX to Claude Code plugin commands |

## Calling It From Codex Chat

| Goal | Codex chat example |
|---|---|
| Adversarial review | ``$codex-companion run an adversarial-review on the current repository and focus on hidden regressions, race conditions, and missing tests`` |
| Background task | ``$codex-companion delegate this fix to a background Codex task and keep the job id so I can inspect status and result later`` |
| Continue previous task | ``$codex-companion continue the latest Codex task thread and take the next highest-value step`` |

## Notes

| Boundary | Meaning |
|---|---|
| `review` / `adversarial-review` | Always read-only |
| `task --write` | Reserved for explicit edit requests |
| Job state | Persisted per workspace under the OS temp directory |
| Excluded surface | No Claude-only hooks or stop-time review-gate behavior |
