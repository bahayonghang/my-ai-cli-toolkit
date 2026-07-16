# Manual Contract Smoke

Date: 2026-07-17

Performed a static route-and-contract walkthrough after `just ci`.

## Project Audit Prompt

Prompt: `对这个项目做一次全维度的代码审计`

- Trigger eval routes it into code-auditor.
- The routing table selects `project` and defaults to `quick` unless deep/全面 is requested.
- The project workflow requires Orient before Ground, Judge, and Report.
- Output defaults to the conversation.
- Saving is offered once and requires explicit opt-in; same-day files use `-02`, `-03`, and never overwrite a delta baseline.

## PR Review Prompt

Prompt: `review this PR`

- Trigger eval routes it into code-auditor.
- The `pr` route retains `gh pr diff <number>` / current-branch lookup and the existing four-phase review workflow.
- Existing evals 1-5 are unchanged.

## Safety and Neighbor Checks

- Maintainability/structure/refactoring-only prompt: routes out to the focused code-quality review neighbor.
- Compliance/privacy/accessibility/cost health-report prompt: routes out to the broader repository-health neighbor.
- Project tooling policy forbids automatic installation and unapproved network access.
- Every critical/high project finding requires exact `file:line` evidence.
