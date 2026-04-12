# Codex Companion Commands

Use the companion runtime through:

```text
node "$SKILL_DIR/scripts/codex-companion.mjs" <subcommand> [...]
```

All commands support `--json` for machine-readable output and `-C <dir>` / `--cwd <dir>` to override the working directory.

## Command Reference

### `review`

Built-in read-only review of uncommitted changes or a base branch.

```bash
node "$COMPANION" review [--base <ref>] [--scope auto|working-tree|branch] [--model <model>] [--json]
```

Does not accept custom focus text. For focused review, use `adversarial-review` instead.

**Exit codes:** 0 = review completed; non-zero = Codex error or invalid target.

### `adversarial-review`

Structured attack-minded review with findings first. Returns JSON matching `schemas/review-output.schema.json`.

```bash
node "$COMPANION" adversarial-review [--base <ref>] [--scope auto|working-tree|branch] [--model <model>] [focus text]
```

**Exit codes:** 0 = review completed; non-zero = Codex error.

**JSON output shape:**
```json
{ "review": "Adversarial Review", "target": {...}, "result": { "verdict": "approve|needs-attention", "findings": [...], "summary": "...", "next_steps": [...] } }
```

### `task`

Persistent Codex task delegation with optional write access and background execution.

```bash
node "$COMPANION" task [--write] [--background] [--resume-last|--resume|--fresh] [--model <model|spark>] [--effort <none|minimal|low|medium|high|xhigh>] [--prompt-file <path>] [prompt]
```

**Key flags:**
- `--write`: Allow Codex to modify files (default: read-only sandbox)
- `--background`: Detach and return a job ID immediately
- `--resume-last` / `--resume`: Continue from the most recent task thread
- `--fresh`: Force a new thread (cannot combine with `--resume`)
- `--model spark`: Use the fast `gpt-5.3-codex-spark` model
- `--effort`: Set reasoning effort level
- `--prompt-file`: Read prompt from a file instead of positional arguments

Prompt can also be piped via stdin.

**Exit codes:** 0 = task completed; non-zero = execution error. Background tasks return 0 immediately after queuing.

### `status`

Inspect running and recent jobs for the current workspace.

```bash
node "$COMPANION" status [job-id] [--wait] [--timeout-ms <ms>] [--all] [--json]
```

- Without job-id: shows the 8 most recent jobs (use `--all` for all)
- With `--wait`: polls until the job completes or the timeout (default 240s) is reached

**Exit codes:** 0 = status retrieved.

### `result`

Show the stored output for a finished job.

```bash
node "$COMPANION" result [job-id] [--json]
```

Without job-id, returns the most recent completed job.

**Exit codes:** 0 = result found; 1 = no matching job.

### `cancel`

Interrupt and cancel a running job. Sends a turn interrupt to the Codex app-server and terminates the worker process.

```bash
node "$COMPANION" cancel [job-id] [--json]
```

Without job-id, cancels the most recent active job.

**Exit codes:** 0 = cancellation processed.

## Common Patterns

### Read-only review

```bash
node "$COMPANION" review
node "$COMPANION" review --base main
```

### Adversarial review

```bash
node "$COMPANION" adversarial-review
node "$COMPANION" adversarial-review --base main "focus on auth and data loss"
```

### Delegate work to Codex

```bash
node "$COMPANION" task "investigate the CI regression"
node "$COMPANION" task --write "apply the smallest safe fix"
node "$COMPANION" task --background --write "implement the approved refactor"
node "$COMPANION" task --resume-last "continue from the latest task thread"
```

### Job lifecycle

```bash
node "$COMPANION" status
node "$COMPANION" status <job-id> --wait
node "$COMPANION" result <job-id>
node "$COMPANION" cancel <job-id>
```

## Defaults

- Keep `review` and `adversarial-review` read-only.
- Prefer foreground `task` for small bounded requests.
- Prefer `--background` for long-running or open-ended work.
- Only add `--write` when the user explicitly wants Codex to edit files.
