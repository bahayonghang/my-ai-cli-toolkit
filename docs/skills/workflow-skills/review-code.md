# Review Code

Multi-dimensional code review workflow covering correctness, security, performance, readability, testing, and architecture. The skill adapts its human-facing output to the user's language and applies a more localized review style in Chinese discussions.

## When to use it

- review git changes before merge
- audit a directory or file set
- run language-aware review passes across a codebase
- generate PR comments or review summaries that need actionable findings instead of generic approval
- review code in Chinese or mixed Chinese plus English engineering contexts without losing severity clarity

## Workflow

1. choose a target, or default to the current git changes
2. load the review dimensions, issue classification, workflow, and communication references
3. detect the active languages and load the matching language guides
4. decide the output language from the user's context and keep one consistent human-facing language per review
5. execute the phased review flow from `workflow-guide.md`
6. classify issues by severity and format the findings from the bundled templates

## Main assets

- `references/review-dimensions.md`
- `references/issue-classification.md`
- `references/workflow-guide.md`
- `references/communication-guide.md`
- `references/languages/`
- `references/rules/`
- `assets/review-report-template.md`
- `assets/pr-comment-template.md`
- `assets/quick-checklist.md`

## Notes

- If the workspace is too large, the review should narrow scope before continuing.
- Missing language-specific guidance falls back to general best practices.
- Chinese-mode output uses clearer review labels such as `必须修复` and `建议修改`, while English-mode output keeps `Must Fix` and `Should Fix`.
- Findings come before summary; if no blocking issues are found, the review should still explain what was checked.
