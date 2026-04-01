# Codex Companion Commands

Use the companion runtime through:

```text
node "$SKILL_DIR/scripts/codex-companion.mjs" <subcommand> [...]
```

## Surface

- `setup`
  - readiness checks for `node`, `npm`, `codex`, login state, and app-server capability
- `review`
  - built-in read-only review of uncommitted changes or `--base <ref>`
- `adversarial-review`
  - structured attack-minded review with findings first
- `task`
  - persistent Codex task delegation
  - supports `--write`, `--background`, `--resume-last`, `--model`, `--effort`
- `status`
  - inspect active and recent jobs
- `result`
  - show stored output for a finished job
- `cancel`
  - interrupt and mark a running job as cancelled

## Common Patterns

### Setup

```bash
node "$SKILL_DIR/scripts/codex-companion.mjs" setup
```

### Read-only review

```bash
node "$SKILL_DIR/scripts/codex-companion.mjs" review
node "$SKILL_DIR/scripts/codex-companion.mjs" review --base main
```

### Adversarial review

```bash
node "$SKILL_DIR/scripts/codex-companion.mjs" adversarial-review
node "$SKILL_DIR/scripts/codex-companion.mjs" adversarial-review --base main
```

### Delegate work to Codex

```bash
node "$SKILL_DIR/scripts/codex-companion.mjs" task "investigate the CI regression"
node "$SKILL_DIR/scripts/codex-companion.mjs" task --write "apply the smallest safe fix"
node "$SKILL_DIR/scripts/codex-companion.mjs" task --background --write "implement the approved refactor"
node "$SKILL_DIR/scripts/codex-companion.mjs" task --resume-last "continue from the latest task thread"
```

### Job lifecycle

```bash
node "$SKILL_DIR/scripts/codex-companion.mjs" status
node "$SKILL_DIR/scripts/codex-companion.mjs" status <job-id> --wait
node "$SKILL_DIR/scripts/codex-companion.mjs" result <job-id>
node "$SKILL_DIR/scripts/codex-companion.mjs" cancel <job-id>
```

## Defaults

- Keep `review` and `adversarial-review` read-only.
- Prefer foreground `task` for small bounded requests.
- Prefer `--background` for long-running or open-ended work.
- Only add `--write` when the user explicitly wants Codex to edit files.
