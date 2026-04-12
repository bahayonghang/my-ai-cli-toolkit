# Code Auditor

Structured code-auditing workflow covering correctness, security, performance, readability, testing, and architecture. The skill adapts the human-facing report to the user's language while keeping findings concrete, severity-based, and easy to act on.

## When to use it

- review git changes or a pull request before merge
- audit a directory, file set, or the current working tree
- prepare merge feedback or review summaries with actionable findings
- run consistent language-aware review passes across a mixed codebase
- produce Chinese or English review output without translating identifiers, APIs, or code snippets

## Workflow

1. choose a target, or default to the current git changes or working directory
2. load the review dimensions, issue classification, workflow, communication, and rules references
3. detect the active repository languages and load the matching language guides
4. decide one human-facing output language from the user's context
5. run the 4-phase review flow: Collect Context, Quick Scan, Deep Review, and Generate Report
6. present findings first, then summaries and next-step recommendations

## Severity and output

- Chinese-mode output maps blocking issues to `必须修复`, medium-priority items to `建议修改`, and lower-priority notes to `仅供参考`
- English-mode output maps the same buckets to `Must Fix`, `Should Fix`, and `Nice to Have`
- each critical or high-severity issue should include location, risk, impact, and a concrete recommendation
- even when no blocking issues are found, the review should still explain what was checked

## Main assets

- `references/review-dimensions.md`
- `references/issue-classification.md`
- `references/workflow-guide.md`
- `references/communication-guide.md`
- `references/languages/`
- `references/rules/`
- `assets/issue-template.md`
- `assets/review-report-template.md`
- `assets/pr-comment-template.md`
- `assets/quick-checklist.md`

## Notes

- If the target is empty, the skill falls back to current git changes or the working directory.
- If the workspace is too large, narrow the review scope before continuing.
- Missing language-specific guidance falls back to general best practices and the shared review rules.
- Keep one consistent human-facing language per response instead of switching tone mid-review.
