# gh-pr Markdown Artifact Design Profile

## Direction

PR and review text should read like compact engineering collaboration, not a generated report. Optimize for reviewers scanning intent, evidence, blockers, and next actions in GitHub's narrow content column.

## PR Description

- Use repository templates when present.
- Otherwise prefer specific headings: `What`, `Why`, `How to test`, and `Out of scope`.
- Keep paragraphs short; use bullets for discrete changes or test evidence.
- Do not repeat the title, list every changed file, or add empty ceremonial sections.
- Put closing keywords near the related issue context, not in a detached footer dump.

## Review Summary

- Lead with the decision and blocking status.
- Group findings by severity or theme only when there are several; avoid one heading per sentence.
- Separate blocking issues from optional nits.
- Cite paths/lines compactly and avoid duplicating the full inline comment bodies in the summary.
- Do not use decorative badges, emoji, invented scores, or generic praise.

## Inline Comments And Replies

- Start with the Conventional Comments label and optional blocking decoration.
- State the concrete issue or answer first, then the reason and smallest useful next step.
- Keep one thread focused on one concern.
- Use code fences only for exact replacement snippets; do not paste large unchanged blocks.
- Preserve the user's language and repository terminology.

## Feedback And CI Fix Reports

- Group review items by thread and number them for selection; separate reviewer, general, and bot feedback.
- Lead CI reports with the explicit state: all green, pending, failures, or external only.
- Pair each failure with one short error block, its source URL, and the smallest local reproduction command.
- End with addressed, skipped, still-open, and not-authorized actions; never imply that a local fix was pushed or a thread was resolved.

## Final Check

Confirm that headings are specific, lists remain scannable, commands name their side effects, links support real context, and no placeholder or unsupported claim remains.
