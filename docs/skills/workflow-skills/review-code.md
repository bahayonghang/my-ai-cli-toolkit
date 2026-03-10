# Review Code

Multi-dimensional code review workflow covering correctness, security, performance, readability, testing, and architecture.

## When to use it

- review git changes before merge
- audit a directory or file set
- run language-aware review passes across a codebase

## Workflow

1. choose a target, or default to the current git changes
2. load the review dimensions and issue classification references
3. detect the active languages and load the matching language guides
4. execute the phased review flow from `workflow-guide.md`
5. classify issues by severity and format the report from the bundled template

## Main assets

- `references/review-dimensions.md`
- `references/issue-classification.md`
- `references/workflow-guide.md`
- `references/languages/`
- `references/rules/`
- `assets/review-report-template.md`

## Notes

- If the workspace is too large, the review should narrow scope before continuing.
- Missing language-specific guidance falls back to general best practices.
