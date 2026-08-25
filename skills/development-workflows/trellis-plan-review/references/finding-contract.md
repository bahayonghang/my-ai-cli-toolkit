# Finding contract

The report has four sections, in this order. Write the report in the language of the request.

## 1. Verdict line

One line, one value:

| Value                                 | Rule                                                                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 可执行 / Ready                        | No blocking finding. Any remaining finding is a note the author can accept or decline.                               |
| 可执行但需修订 / Ready after revision | At least one should-fix finding, and no blocking finding. The plan's structure holds; specific clauses need an edit. |
| 需返回规划 / Return to planning       | At least one blocking finding.                                                                                       |

State the counts on the same line: for example, `可执行但需修订 — 阻断 0 / 应修 4 / 提示 3`.

When the task has already started, add the task status and, if the change is committed, the commit
identifier. A review that arrives after the change shipped is a retrospective record, and the report
must say so.

## 2. Findings

Number each finding `TPR-01`, `TPR-02`, … Order by severity, then by artifact order.

Each finding carries these fields:

| Field    | Content                                                                    |
| -------- | -------------------------------------------------------------------------- |
| Severity | 阻断 / 应修 / 提示 (blocking / should-fix / note)                          |
| Location | The artifact and the line or section: `prd.md:24`, `design.md` change list |
| Claim    | What the plan states, quoted or closely paraphrased                        |
| Evidence | The repository `path:line`, the command you ran, or the recomputed number  |
| Impact   | What goes wrong if the plan ships unchanged                                |
| Route    | The available fixes. Give the routes, not a decision.                      |

### Severity rules

**阻断 / blocking**

- A false claim that a requirement or a criterion depends on.
- A criterion clause with no mechanism anywhere in the plan.
- A user-visible behavior change that no requirement and no criterion covers.
- A missing `prd.md`, or a citation that names a file that does not exist.

**应修 / should-fix**

- A true observation with a false inference, where the inference shaped a decision.
- A calculation that is wrong in method while the conclusion holds.
- A contradiction between a requirement clause and a rejected option.
- A criterion whose result depends on an unstated condition.
- An undeclared mechanism in the implementation.

**提示 / note**

- Template placeholder residue.
- A citation that shifted or points at a body line instead of a declaration.
- A branch or field in `task.json` that the plan does not explain.
- A wording change that removes an ambiguity.

Do not inflate. A finding is blocking only when the plan, shipped as written, produces a wrong
result. "The plan could be clearer" is a note.

## 3. Unverified list

Every claim you could not check, with the reason. Keep this section even when the list is short. An
empty unverified list on a plan that touches a browser, a device, or an external service means the
review overstated its coverage.

Write each entry as the claim plus the reason: "the search input supports a selection range — not
checked, no browser available in this session."

## 4. Sound parts

The checks that passed and are worth keeping. This section is not praise. This section tells the
author what not to redo on the next round, and it tells the reader how much of the plan the review
actually covered.

Examples of entries that belong here: citations that all resolved, a scope check that held under a
whole-file search, a decision order that preserves the previous behavior, a rollback structure that
matches the real change boundaries.

## Anti-inflation rules

- Drop every candidate finding you cannot cite. A finding with no evidence is noise.
- Do not manufacture findings to fill the list. An empty findings list is a valid result.
- Do not re-litigate a decision the plan records as settled with a date and a reason, unless the
  decision rests on a claim that Pass 1 or Pass 2 disproved.
- Do not review the product decision. Review whether the artifacts state the decision, whether the
  artifacts agree, and whether the criteria can prove the decision was met.
- Do not raise style preferences about the plan's prose.
- Report one finding per defect. Do not split one defect across several numbers to raise the count.

## Required disclosure

Close the report with the limitation, in one or two sentences:

> An agent reviewing an agent's plan is not an independent second opinion. The reviewer and the
> author share most of the same blind spots. A clean report means "this pass found nothing", not
> "the plan is complete". Treat the findings as a triage list, not as an approval.

## What the report must not contain

- A rewritten plan, a revised requirement, or a corrected criterion in final form. Give the route.
- An edit to any planning artifact or to product code.
- A claim that a check ran when the check did not run.
- A severity raised to force a decision.

## Persist the report

After the four sections are ready, write the full report with
`scripts/write_review_report.py`. The destination is
`<repo-root>/.trellis/reviews/<task-dir-name>.md`. The file skeleton is
`report-template.md`. Same task, same path; a later review overwrites.

The chat is not the source of the findings. Print the verdict line, the report
path, and one `text` fence with the filled template from `handoff-prompt.md`.
Do not paste the TPR table into the chat unless the write failed or the user
asked to see the report in the conversation.

If the helper exits nonzero, explain the error and the attempted path, print
the four-section report in chat, and do not emit a path-based handoff prompt.
