# Codex CLI Integration

Run the local Codex CLI when you want an explicit Codex-powered workflow instead
of a generic shell command: diff-aware review, adversarial challenge, second
opinion analysis, live research, or Codex-applied fixes.

Starting with GPT-5.4, OpenAI recommends the general-purpose GPT-5.4 model for
most Codex coding tasks, so this skill defaults to `gpt-5.4`.

## Default Configuration

- Primary review command: `codex review`
- Primary general command: `codex exec`
- Default model: `gpt-5.4`
- Review and consult reasoning: `xhigh`
- Research reasoning: `high`
- Live search entrypoint: top-level `--search`
- Default safety posture: review-only first, write only when explicitly requested

## Mode Guide

### Review

Use this for PR, branch, commit, and uncommitted review.

```bash
codex -m gpt-5.4 -s read-only review --uncommitted
codex -m gpt-5.4 -s read-only review --base main
codex -m gpt-5.4 -s read-only review --commit <sha>
```

Focused review of the default uncommitted diff:

```bash
codex -m gpt-5.4 -s read-only review "Focus on security, regressions, and missing tests."
```

Constraint:

- `codex review` does not allow a custom prompt together with `--uncommitted`, `--base`, or `--commit`.
- If you need both a fixed review target and a custom focus, use plain `codex review` for the target first or switch to `codex exec` in consult or challenge mode.

### Challenge

Use this when you want Codex to attack the change instead of doing a balanced review.

```bash
codex -m gpt-5.4 -s read-only exec \
  -c model_reasoning_effort=xhigh \
  -C <workdir> \
  "Review the relevant changes or files. Be adversarial. Find edge cases, race conditions, security holes, failure modes, and silent data corruption risks. Do not modify files."
```

### Consult

Use this for a second opinion on a file, plan, migration, or architecture decision.

```bash
codex -m gpt-5.4 -s read-only exec \
  -c model_reasoning_effort=xhigh \
  -C <workdir> \
  "Review @<target> as a second opinion. Explain the main risks, questionable assumptions, missing tests, and the simplest safe next step. Do not modify files."
```

### Research

Use this for current docs, latest information, and citation-backed comparisons.

```bash
codex --search -m gpt-5.4 exec \
  -c model_reasoning_effort=high \
  --skip-git-repo-check \
  "Research <topic>. Prefer official sources, include dates when relevant, and return clickable citations."
```

Example:

```bash
codex --search -m gpt-5.4 exec \
  -c model_reasoning_effort=high \
  "Compare Vite vs Webpack for React projects in 2026. Prefer official docs and recent sources, and include citations."
```

### Apply / Fix

Use this only when you want Codex to make changes.

Sandboxed first:

```bash
codex -m gpt-5.4 exec \
  -c model_reasoning_effort=xhigh \
  --full-auto \
  -C <workdir> \
  "<task>"
```

Full bypass only when you explicitly want unrestricted autonomous writes:

```bash
codex -m gpt-5.4 exec \
  -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  -C <workdir> \
  "<task>"
```

## Session Resume

Continue an existing non-interactive session:

```bash
codex exec resume <session_id> "<follow-up task>"
```

Example:

```bash
codex exec resume <session_id> "now compare this with the latest official migration guide"
```

## Configuration Notes

Persistent user-level config lives in `~/.codex/config.toml`.

Basic default:

```toml
model = "gpt-5.4"
```

Reusable profile for live research:

```toml
[profiles.codex-web]
model = "gpt-5.4"
web_search = "live"
```

## Prerequisites

- Verify installation:
  - Bash / zsh: `command -v codex`
  - PowerShell: `Get-Command codex`
- Verify login: `codex login status`
- Authenticate if needed: `codex login`

## Notes

- Prefer `codex review` for diff-aware review tasks instead of a hand-written `codex exec "Review ..."` prompt.
- `codex review` custom prompts are mutually exclusive with `--uncommitted`, `--base`, and `--commit`.
- Prefer top-level `--search` for live web research instead of older feature-toggle examples.
- `@file` references files relative to the working directory.
- `@.` references the current working tree.
- Use `--json` when you need machine-readable output.
- Read-only is the default posture. Writing should be intentional.
