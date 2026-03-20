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

## Research Source Priority

Prefer sources in this order unless the task requires something else:

1. Official documentation
2. Official blogs, announcements, changelogs, and release notes
3. Reputable third-party technical analysis
4. Benchmarks and surveys, with source bias called out when relevant

Guidance:
- Prefer official docs for APIs, product behavior, and current platform limits.
- Prefer official announcements for release timing, roadmap signals, and deprecations.
- Use third-party analysis only when it adds missing context or comparison value.
- Do not present vendor benchmarks as neutral without labeling the bias.

## Research Query Construction

Use focused queries. One query per subtopic is usually better than one broad prompt.

Rules:
- Include the exact product or framework name.
- Add the current year when the task asks for latest information.
- Ask for raw URLs when you need citations or link validation.
- Separate architecture, pricing, benchmarks, release history, and comparisons into distinct searches.

Good query patterns:
- `<product> architecture 2025 2026`
- `<product A> vs <product B> for <use case> 2025 2026`
- `<product> pricing enterprise 2026`
- `<product> changelog release notes 2026`

Common pitfalls:
- Broad queries that blur multiple questions together
- Searching for a category without the exact product name
- Missing year constraints for fast-moving topics
- Asking for conclusions before gathering source links

## Batch Retrieval Pattern

Use a small batch of focused searches for research-heavy requests:

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"

codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=high \
  -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "Return raw results with URLs. Search: <focused query 1>"

codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=high \
  -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "Return raw results with URLs. Search: <focused query 2>"
```

Use batches for:
- technology comparisons
- latest-info roundups
- vendor landscape research
- reports that need citations per section

Legacy note:
- `codex e` still works as a short alias, but prefer `codex exec` in docs and reusable snippets.

## Link Validation and Citation Rules

Validate links before finalizing when the answer contains multiple citations, the results look stale, or the user needs a durable report.

Validation options:
- Let the user click-check simple URLs when speed matters.
- Use Codex validation for batch verification or replacement hunting.

Example validation prompt:

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=high \
  -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "Verify whether these URLs are still valid. For any broken URL, find the best replacement from the same source if possible:\n1. <url1>\n2. <url2>"
```

Citation rules:
- Every major claim should have a clickable citation when the task is research-heavy.
- Match the citation label to the actual page title or publisher.
- Do not cite summary pages when the primary document is available.
- Do not include performance numbers, pricing, or release claims without a source.

Recommended format:

```markdown
React 19 expands the stable hooks surface (source: [React Docs]).

[React Docs]: https://react.dev/
```

## Research Report Structure

Use this structure for deeper research or comparison outputs:

```markdown
# [Topic] Research Report

## Overview
Brief framing of the topic and why it matters

## Key Findings
- Concise fact with citation
- Concise fact with citation

## Comparison
| Option | Strengths | Tradeoffs | Sources |
|--------|-----------|-----------|---------|

## Recommendation
Recommendation only when supported by evidence

## References
[Source Name]: URL
```

Guidance:
- Keep headings declarative, not phrased as questions.
- Trim sections the user did not ask for.
- Separate facts, interpretation, and recommendation.
- Call out uncertainty explicitly when sources conflict.

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

## Research Workflow Reference

Use this playbook when the user wants more than a one-shot docs lookup: technology comparisons, latest updates, literature-style technical surveys, market or vendor analysis, or any answer that must include clickable citations.

### Research principles

- Codex should retrieve raw sources and URLs; you should synthesize the final answer yourself.
- Keep only the evidence the user actually cares about.
- Do not invent performance numbers, release claims, or market facts without sources.
- Prefer declarative section titles over question headings in the final report.
- Make sure each reference name matches the destination page content.

### Source priority

1. Official documentation
2. Official blogs, changelogs, and announcements
3. Reputable third-party technical analysis
4. Benchmarks and market reports, with vendor bias called out where relevant

### Query design

- Use one focused query per subtopic instead of one overloaded search.
- Include the exact product or project name in each query.
- Add year constraints when recency matters.
- Ask for raw URLs in the result when collecting evidence.

Example query shapes:

```text
Return raw search results with source URLs. Search: OpenSearch unique features architecture 2025 2026
Return raw search results with source URLs. Search: OpenSearch vs Elasticsearch key differences 2025 2026
Return raw search results with source URLs. Search: Bun vs Node serverless cold start comparison 2025 2026
```

Recommended command pattern:

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=high \
  -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "Return raw search results with source URLs. Search: <focused query>"
```

### Link validation

For long reference lists or suspicious results, validate links in batch before finalizing:

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=high \
  -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "Use web search to verify whether these URLs are valid. For each broken URL, find the correct replacement and report both the bad link and the replacement."
```

Rules:
- Let the user click-check a few simple links if that is faster.
- Use batch validation when there are many citations or when 404 replacement is needed.
- Replace broken URLs before delivering the final report.

### Citation format

Inline citation example:

```markdown
OpenSearch forked from Elasticsearch 7.10 in 2021 (source: [AWS OpenSearch Blog]).
```

Link definitions at the end:

```markdown
[AWS OpenSearch Blog]: https://aws.amazon.com/blogs/opensource/...
```

### Report structure

```markdown
# [Topic] Research Report

## 1. Overview
What it is, what problem it solves

## 2. Core Features/Architecture
Key technical points with citations

## 3. Comparison (if applicable)
Table comparison, each item with source

## 4. Recommendations
Conclusions based on research

## References
[Link Name 1]: URL1
[Link Name 2]: URL2
```

### Common pitfalls

| Pitfall | Solution |
|---------|----------|
| Codex searches the wrong product | Include the exact product name in every query |
| Final report contains 404 links | Validate links before finalizing |
| Reference name does not match destination | Verify the page title and content before citing |
| Vendor benchmark presented as neutral | Note the source bias explicitly |
| Query is too broad | Split it into focused subqueries |
| Recent changes are missing | Add current-year constraints |

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

## Post-Run Checklist

- Confirm the task mode was correct: review, apply/fix, web lookup, or research.
- Confirm the search scope or review target was correct.
- Verify each finding or claim has evidence and a concrete source.
- Separate blockers from nice-to-have suggestions.
- Validate links when the output is citation-heavy.
- If changes were applied, review the resulting diff after Codex writes code.
- Re-run tests, lint, or type checks after any fix pass.

## Notes

- Requires Codex CLI installed and authenticated.
- Use `codex login status` to verify login and `codex login` to authenticate.
- All commands that write use `--dangerously-bypass-approvals-and-sandbox` for automation.
- Use `--skip-git-repo-check` to work in any directory.
- Prefer `codex exec` in docs and automation; `codex e` is only a legacy short alias.
- Prefer `-c web_search="live"` over the legacy web-search flag and old feature-toggle form.

### Security: `--dangerously-bypass-approvals-and-sandbox`

This flag disables **all** confirmation prompts and filesystem sandboxing. When active:
- Codex can read, write, and delete any file without asking
- No sandbox isolation — commands run with your full user permissions
- Intended for automated or CI-style environments where human approval is impractical

**Recommendations:**
- Only use in controlled environments
- Never use on production systems or with untrusted prompts
- Review generated changes via `git diff` after execution

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `codex: command not found` | Install Codex CLI: `npm install -g @openai/codex` |
| Authentication error | Run `codex login` to authenticate |
| Session resume fails | Verify `session_id` from previous JSON output |
| Web search not working | Add `-c web_search="live"` or configure `web_search = "live"` |
| Stale or broken citations | Re-run focused searches and validate URLs before finalizing |
