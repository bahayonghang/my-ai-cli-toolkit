# Codex CLI Reference

`SKILL.md` owns routing and defaults. This reference file is the command,
prompt, and checklist library you load after the mode is already chosen.

> `$MODEL` refers to the default model set in SKILL.md (currently `gpt-5.4`).
> Substitute the literal model id in actual commands.

## Command Matrix

| Mode | Primary command | Default posture | When to use |
| --- | --- | --- | --- |
| Review | `codex review` | read-only | PR, diff, branch, commit, uncommitted review |
| Challenge | `codex exec` | read-only | adversarial probing, security, failure modes |
| Consult | `codex exec` | read-only | second opinion on code, plans, architecture |
| Research | `codex --search exec` | live web search | latest docs, comparisons, citation-backed summaries |
| Apply/Fix | `codex exec` | workspace-write first | only when the user wants Codex to make changes |

## Review Recipes

### Review uncommitted changes

```bash
codex -m $MODEL -s read-only review --uncommitted
```

### Review against a base branch

```bash
codex -m $MODEL -s read-only review --base <base-branch>
```

### Review a specific commit

```bash
codex -m $MODEL -s read-only review --commit <sha>
```

### Focused review of the default uncommitted diff

Use this when the user wants custom review instructions and is fine reviewing the
default uncommitted change set.

```bash
codex -m $MODEL -s read-only review "Focus on security, regressions, and missing tests."
```

Constraint:

- `codex review` does not allow a custom prompt together with `--uncommitted`, `--base`, or `--commit`.
- If you need both a fixed review target and a custom focus, use one of these paths:
  - run `codex review` with the target flag and accept Codex's default review behavior
  - use `consult` or `challenge` via `codex exec` with an explicit prompt over the relevant files or repo scope

### File-level second opinion

Use `consult`, not `review`, when the target is a specific file or document rather
than a repo diff.

```bash
codex -m $MODEL -s read-only exec \
  -c model_reasoning_effort=xhigh \
  -C <workdir> \
  "Review @src/server.ts as a second opinion. Do not modify files."
```

## Prompt Templates

### Review template

```text
Review the relevant changes. Do not modify files. Summarize intent first, then list findings by severity. For each finding include evidence, why it matters, and a recommended fix. Call out missing tests when relevant.
Structure your response as: Review Scope (target, focus, assumptions), Summary (overall risk, merge readiness), Findings (numbered by severity with evidence/impact/fix), Open Questions, and Suggested Next Steps.
```

### Challenge template

```text
Review the relevant changes or files. Be adversarial. Look for edge cases, race conditions, auth gaps, resource leaks, failure modes, and silent data corruption risks. Do not modify files. Return only substantive problems and the concrete evidence for each one.
Structure your response as: Review Scope (target, focus, assumptions), Summary (overall risk, merge readiness), Findings (numbered by severity with evidence/impact/fix), Open Questions, and Suggested Next Steps.
```

### Consult template

```text
Review @<target> as a second opinion. Explain the main risks, questionable assumptions, missing tests, and the simplest safe next step. Do not modify files.
Structure your response as: Review Scope (target, focus, assumptions), Summary (overall risk, merge readiness), Findings (numbered by severity with evidence/impact/fix), Open Questions, and Suggested Next Steps.
```

### Research template

```text
Research <topic>. Use live web search, prefer official sources, include dates when relevant, separate facts from opinion, and return clickable citations.
```

### Technology comparison template

```text
Compare <option A> vs <option B> for <use case>. Use live web search, prefer official docs and recent sources, and include clickable citations for each major claim.
```

### Decision memo template

```text
Research <topic> for a team deciding whether to adopt it. Cover architecture, operational tradeoffs, ecosystem maturity, migration risk, and current status. End with a recommendation only if the evidence is strong.
```

### Apply approved findings template

```text
Fix the approved findings in <target>. Apply the changes now, keep the scope tight, and end with a short summary plus any validation that still needs to run. If git writes or sandbox escape are required, stop and ask for explicit confirmation before using them.
```

## Research Query Design

Use focused queries instead of one overloaded search. One query per subtopic is
usually better.

Rules:

- Include the exact product, framework, or vendor name in each query.
- Add the current year when the user cares about latest information.
- Ask for URLs when the final answer needs citations.
- Split architecture, pricing, release history, benchmarks, and migration concerns into separate searches.

Good query shapes:

- `<product> architecture 2026`
- `<product A> vs <product B> for <use case> 2026`
- `<product> pricing enterprise 2026`
- `<product> changelog release notes 2026`

Command pattern:

```bash
codex --search -m $MODEL exec \
  -c model_reasoning_effort=high \
  --skip-git-repo-check \
  "Return raw search results with source URLs. Search: <focused query>"
```

## Citation Rules

- Use clickable citations for every major claim in research-heavy output.
- Prefer primary sources over summaries.
- Include dates for release or announcement claims when they matter.
- Do not present vendor benchmarks as neutral without calling out the source bias.
- If a result looks stale or suspicious, validate it before finalizing.

Recommended format:

```markdown
Codex works best with the latest GPT-5 models (source: [OpenAI Code Generation Guide]).

[OpenAI Code Generation Guide]: https://developers.openai.com/api/docs/guides/code-generation/
```

## Shell Notes

### Bash / zsh

- Prefer single quotes around prompts when no interpolation is needed.
- Use a heredoc for long prompts instead of over-escaping.
- Keep top-level flags before the subcommand when using `--search`, `-m`, or `-s`.

Example:

```bash
codex --search -m $MODEL exec 'Research the latest React 19 hooks docs with citations.'
```

### PowerShell

- Prefer double quotes for normal prompts.
- Use here-strings for long prompts.
- Keep top-level flags before the subcommand here as well.

Example:

```powershell
codex --search -m $MODEL exec "Research the latest React 19 hooks docs with citations."
```

Here-string example:

```powershell
$prompt = @"
Review @docs/plan.md as a second opinion.
Explain the major risks and missing validation.
Do not modify files.
"@

codex -m $MODEL -s read-only exec $prompt
```

## Resume Notes

Use resume for continuity on the same task, not to replace mode selection.

```bash
codex exec resume <session_id> "<follow-up>"
```

Good uses:

- continue a research thread with one more comparison
- continue an apply/fix run after new feedback
- continue a consult thread with one more target file

### Finding the session ID

- After any `codex exec` run, the CLI prints the session ID in its output
- List recent sessions: `codex sessions list`
- The most recent session can usually be found in Codex CLI output or `~/.codex/sessions/`

## Post-Run Safety Checklist

- Confirm the chosen mode matched the user's intent.
- Confirm review, challenge, and consult stayed in a review-safe posture.
- If search was required, confirm the command used top-level `--search`.
- If Codex wrote files, inspect the resulting diff.
- Run validation commands after any apply/fix pass.
- If research output includes many links, spot-check or validate them before presenting the final answer.

## Sandbox Configuration Reference

Codex enforces a sandbox on every tool-executed child process. The sandbox restricts
file system writes and network access to prevent unintended side effects. Git
operations are the most common casualty because `.git/` is protected even when the
working tree is writable.

### Sandbox modes

| Mode | CLI flag | Config key | Behavior |
|------|----------|------------|----------|
| Read-only | `-s read-only` | `sandbox_policy = "read-only"` | No writes anywhere |
| Workspace-write | `-s workspace-write` | `sandbox_policy = "workspace-write"` | Writes to workdir and `/tmp`; `.git/` stays read-only |
| Full-auto | `--full-auto` | `approval_policy = "full-auto"` | Auto-approve writes; sandbox still applies |
| Danger full access | n/a | `sandbox_policy = "danger-full-access"` | Full FS access including `.git/` |
| Bypass all | `--dangerously-bypass-approvals-and-sandbox` | n/a | No sandbox, no approval prompts |

Key insight: `--full-auto` controls **approval behavior**, not sandbox scope. A
`--full-auto` run still uses the sandbox and `.git/` remains read-only. To write to
`.git/`, you need `danger-full-access` or the full bypass flag.

### config.toml sandbox settings

```toml
# ~/.codex/config.toml

# Global sandbox policy
sandbox_policy = "workspace-write"

# Per-project trust (suppresses the "Do you trust this directory?" prompt)
[projects."/path/to/project"]
trust_level = "trusted"

# Profile with full access for automation
[profiles.git-automation]
model                  = "gpt-5.4"
approval_policy        = "full-auto"
sandbox_policy         = "danger-full-access"
model_reasoning_effort = "high"

# Windows-specific sandbox (set to "off" if bash fails)
[windows]
sandbox = "unelevated"          # "unelevated" | "elevated" | "off"
sandbox_private_desktop = false
```

Use a profile: `codex -p git-automation exec "..."`.

### Rules-based command allowlisting

Instead of disabling the sandbox entirely, you can allowlist specific commands via
`~/.codex/rules/default.rules`:

```text
prefix_rule(pattern=["git", "add"], decision="allow")
prefix_rule(pattern=["git", "commit"], decision="allow")
prefix_rule(pattern=["git", "push"], decision="allow")
prefix_rule(pattern=["git", "pull"], decision="allow")
prefix_rule(pattern=["git", "fetch"], decision="allow")
prefix_rule(pattern=["git", "checkout"], decision="allow")
prefix_rule(pattern=["git", "stash"], decision="allow")
prefix_rule(pattern=["git", "merge"], decision="allow")
prefix_rule(pattern=["git", "rebase"], decision="allow")
```

Note: on Windows, `default.rules` may not be honored for sandbox-escaping commands
even when the rules engine returns "allow" (issue
[#15298](https://github.com/openai/codex/issues/15298)). In that case, use
`danger-full-access` as a workaround.

### Apply/Fix recipes with git write access

Only use these recipes after the user explicitly confirms the bypassed run.
When git writes are required, prefer `danger-full-access` first and reserve the
full bypass flag for last-resort cases.

```bash
# Apply changes and commit
codex -m $MODEL --dangerously-bypass-approvals-and-sandbox exec \
  -c model_reasoning_effort=xhigh \
  "Fix the bug in auth.ts, then commit with a descriptive message."

# Using a profile instead (cleaner, reusable)
codex -p git-automation exec \
  -c model_reasoning_effort=xhigh \
  "Fix the bug in auth.ts, then commit with a descriptive message."
```

### Platform-specific sandbox troubleshooting

#### Windows

| Symptom | Cause | Fix |
|---------|-------|-----|
| `couldn't create signal pipe, Win32 error 5` | Bash cannot initialize in sandbox | Set `[windows] sandbox = "off"` in config.toml, or use PowerShell |
| Sandbox prompts on every run despite bypass flag | Trust not persisted | Add project to `[projects]` in config.toml |
| `default.rules` allow rules ignored | Known bug ([#15298](https://github.com/openai/codex/issues/15298)) | Use `danger-full-access` sandbox policy |

#### Linux

| Symptom | Cause | Fix |
|---------|-------|-----|
| `EACCES /proc/self/setgroups` | AppArmor blocks user namespaces | Set `kernel.apparmor_restrict_unprivileged_userns=0` or use `danger-full-access` |
| `.git/FETCH_HEAD: Permission denied` | bubblewrap mounts `.git/` read-only | Use `danger-full-access` or bypass flag |
| Sandbox fails silently | Landlock/bubblewrap unavailable | Codex falls back to `danger-full-access` automatically |

#### macOS

| Symptom | Cause | Fix |
|---------|-------|-----|
| `fsmonitor_ipc__send_query: unspecified error` | Sandbox blocks fsmonitor IPC socket | `git config --local core.fsmonitor false` |
| Network denied in sandbox | Sandbox restricts outbound network | Use `--dangerously-bypass-approvals-and-sandbox` for network-dependent tasks |

### Diagnosing sandbox issues

```bash
# Log all sandbox denials for a specific command
codex sandbox macos --log-denials git fetch
codex sandbox linux --log-denials git commit -m "test"

# Check effective configuration
codex --print-config

# Verify sandbox mode inside a session
# Use the /status slash command in interactive mode
```

### app-server sandbox caveats

When using `codex app-server`, the `--dangerously-bypass-approvals-and-sandbox` flag
does **not** propagate to tool-executed child processes (issue
[#14068](https://github.com/openai/codex/issues/14068)). Workaround: pass sandbox
settings explicitly in JSON-RPC calls:

- `thread/start`: include `"sandbox": "danger-full-access"`
- `turn/start`: include `"sandboxPolicy": { "type": "dangerFullAccess" }`
