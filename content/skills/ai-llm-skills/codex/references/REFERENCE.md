# Codex CLI Reference

## Defaults and Override Order

These examples centralize the default model with a shell variable:

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
```

Use this order when choosing a model:

1. Example shell variable: `CODEX_MODEL`
2. Single-run CLI override: `-m <model>`
3. Persistent user config: `~/.codex/config.toml` with `model = "..."`
4. Profile override: `profiles.<name>.model`

## Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `<task>` | Task description, supports `@file` references | (required) |
| `-m <model>` | Override model (e.g., `gpt-5.4`, `gpt-5.4-pro`) | `gpt-5.4` |
| `-c model_reasoning_effort=<level>` | Reasoning depth: low/medium/high/xhigh | xhigh (code) / high (web) |
| `-c web_search="live"` | Enable live web search for current information | disabled |
| `-C <workdir>` | Working directory | current directory |
| `--json` | JSON output for programmatic use | disabled |

## Review Usage Guidance

### When to use `@file`

Use `@file` when the review target is a known file or a tight set of files and you want Codex to inspect the actual source, not just the patch summary.

Good fits:
- review one module before commit
- review a refactor in `@src/foo.ts`
- review a risky config file or migration script

Example:

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --skip-git-repo-check \
  -C <workdir> \
  "Review @src/foo.ts for correctness, maintainability, and missing tests. Do not modify files."
```

### When to use diff or branch review wording

Use diff-style prompts when the user cares about what changed relative to a base branch or the current working tree.

Good fits:
- PR review before merge
- local review of staged and unstaged edits
- regression check for a feature branch

Example:

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --skip-git-repo-check \
  -C <workdir> \
  "Review all changes in this branch against main. Do not modify files. Focus on correctness, regressions, and missing tests."
```

### When to use commit review wording

Use commit review when the user wants to validate one isolated change or decide if a commit is safe to keep, revert, or cherry-pick.

Example:

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --skip-git-repo-check \
  -C <workdir> \
  "Review commit <sha>. Do not modify files. Check intent, correctness, regressions, and follow-up risk."
```

## Copy-Ready Review Templates

### General code review

```text
Review <target>. Do not modify files. Summarize intent first, then list findings by severity. For each finding include evidence, why it matters, and a recommended fix. Also call out missing tests or docs if relevant.
```

### Pull request / base branch review

```text
Review all changes in this branch against <base-branch>. Do not modify files. Focus on correctness, regressions, API compatibility, migration risk, and missing test coverage. Return findings by severity with file evidence and suggested fixes.
```

### Uncommitted diff review

```text
Review the current uncommitted changes in @. Do not modify files. Focus on risky diffs, broken assumptions, incomplete refactors, and gaps in validation or tests. Return findings only.
```

### Commit review

```text
Review commit <sha>. Do not modify files. Explain the commit intent, identify correctness or maintainability issues, and note whether the commit is safe to merge, revert, or cherry-pick.
```

## Focus Prompt Templates

### Security review focus

```text
Review <target> with focus on security. Do not modify files. Check input validation, auth/authz, secret handling, injection risk, unsafe deserialization, SSRF/path traversal style issues, and data exposure. Report only security findings plus any critical blocker outside security.
```

### Performance review focus

```text
Review <target> with focus on performance. Do not modify files. Check hot paths, unnecessary allocations, N+1 or repeated I/O, caching opportunities, query patterns, and algorithmic complexity. Report only performance findings plus any critical blocker outside performance.
```

### Maintainability / code quality focus

```text
Review <target> with focus on maintainability. Do not modify files. Check duplication, unclear naming, oversized functions, poor abstraction boundaries, dead code, and missing tests. Report only maintainability findings plus any critical blocker outside maintainability.
```

### Test coverage focus

```text
Review <target> with focus on test coverage. Do not modify files. Identify untested branches, missing regression tests, fragile test setup, and places where the implementation changed without a corresponding test update.
```

## Structured Review Output Template

Use this when you want consistent, easy-to-scan review results:

```text
Review Scope
- Target:
- Focus:
- Assumptions:

Summary
- Overall risk:
- Ready to merge:

Findings
1. [severity] Title
   - Evidence: path/to/file:line or diff/commit context
   - Why it matters:
   - Recommended fix:

2. [severity] Title
   - Evidence:
   - Why it matters:
   - Recommended fix:

Open Questions
- ...

Suggested Next Steps
- ...
```

## Review-Only vs Apply/Fix Guidance

### Review-only default

Prefer review-only commands first for:
- code review
- PR review
- diff review
- commit review
- second-opinion analysis

Recommended pattern:

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --skip-git-repo-check \
  -C <workdir> \
  "<review prompt>. Do not modify files."
```

### Apply/fix mode

Use high-permission execution only when the user explicitly wants Codex to implement changes or fix findings.

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  -C <workdir> \
  "Fix the approved findings in <target>. Apply changes now and summarize what changed."
```

Safety reminder:
- `--dangerously-bypass-approvals-and-sandbox` gives Codex full write/delete power in the working directory.
- Keep it out of pure review runs.
- Review findings first, then choose which fixes to apply.

## Generate-Review-Fix Flow

Use this when the goal is implementation plus validation, not just review.

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"

# 1. Generate or change code
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  -C <workdir> \
  "Implement <task>."

# 2. Review without modifying files
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --skip-git-repo-check \
  -C <workdir> \
  "Review the changes for bugs, regressions, and missing tests. Do not modify files."

# 3. Fix approved findings
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  -C <workdir> \
  "Fix the approved findings from the review. Apply changes now and summarize what changed."
```

## Code Generation Examples

Basic code analysis:
```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "explain @src/main.ts"
```

Refactoring with custom reasoning:
```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" -c model_reasoning_effort=high \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "refactor @src/utils for performance"
```

Multi-file analysis:
```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  -C /path/to/project \
  "analyze @. and find security issues"
```

## Web Search Examples

Fetch GitHub repo:
```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" -c model_reasoning_effort=high -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "Fetch and summarize https://github.com/user/repo"
```

Documentation search:
```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" -c model_reasoning_effort=high -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "find the latest React 19 hooks documentation"
```

Technology research:
```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" -c model_reasoning_effort=high -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "compare Vite vs Webpack for React projects today"
```

## Session Resume

Resume a previous session for multi-turn conversations:
```bash
# First session output includes thread_id in JSON
codex exec resume <session_id> "<follow-up task>"
```

## Config Examples

Set a persistent default model:
```toml
model = "gpt-5.4"
```

Set a reusable profile for live web lookup:
```toml
[profiles.codex-web]
model = "gpt-5.4"
web_search = "live"
```

## Post-Review Checklist

- Confirm the review target was correct: file, branch diff, commit, or uncommitted work.
- Separate blockers from nice-to-have suggestions.
- Verify each finding has evidence, impact, and a concrete fix direction.
- Decide whether a follow-up apply/fix run is actually desired.
- If changes will be applied, review the resulting diff after Codex writes code.
- Re-run tests, lint, or type checks after any fix pass.

## Notes

- Requires Codex CLI installed and authenticated
- Use `codex login status` to verify login and `codex login` to authenticate
- All commands that write use `--dangerously-bypass-approvals-and-sandbox` for automation
- Use `--skip-git-repo-check` to work in any directory
- `codex e` remains a short alias, but `codex exec` is the preferred form in docs
- Prefer `-c web_search="live"` over the legacy web-search flag and old feature-toggle form

### Security: `--dangerously-bypass-approvals-and-sandbox`

This flag disables **all** confirmation prompts and filesystem sandboxing. When active:
- Codex can read, write, and delete any file without asking
- No sandbox isolation — commands run with your full user permissions
- Intended for automated/CI pipelines where human approval is impractical

**Recommendations:**
- Only use in controlled environments (local dev, CI)
- Never use on production systems or with untrusted prompts
- Review generated changes via `git diff` after execution

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `codex: command not found` | Install Codex CLI: `npm install -g @openai/codex` |
| Authentication error | Run `codex login` to authenticate |
| Session resume fails | Verify `session_id` from previous JSON output |
| Web search not working | Add `-c web_search="live"` or configure `web_search = "live"` |
