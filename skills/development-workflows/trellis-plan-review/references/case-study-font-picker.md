# Case study — settings font picker repaint

One real review of one real Trellis task. Use this file to calibrate severity and to recognize the
shape of each finding class. The project is a Tauri desktop application with a TypeScript front end
that renders the whole page from template strings.

## The task under review

A bug-fix task with three located defects in a settings-page font dropdown:

1. The list markup carried an `id` but no `class`, so two stylesheet rules that set a height limit
   and `overflow: auto` never applied. The list overflowed the panel.
2. A monitor push repainted the whole page about once per second on the settings route, which reset
   scroll positions.
3. The repaint restored focus by element id only, so the caret jumped to position 0.

Artifacts present: `prd.md`, `design.md`, `implement.md`, both `.jsonl` manifests, `task.json`.
Six requirements, six acceptance criteria.

## Result

Verdict: 可执行但需修订 — 阻断 1 / 应修 4 / 提示 2.

Three of the seven findings were repaired during implementation by the implementing agent, without
any artifact recording the repair. The review arrived after the change was committed and archived, so
the report was a retrospective record.

## The findings

### TPR-01 · 阻断 · A false inference removed a visible data refresh

**Pass 2.** `prd.md` stated: the only settings-page content the overview object drives is the
connection badge, therefore skipping the pushes cannot make any visible content lag.

The observation held. The inference did not. The settings page also renders a collector-status
field. That field reads a different variable, and a tray fetch inside the live-page refresh updates
the variable. The skip returned before the refresh call, so the field froze while the operator stayed
on the settings page.

No requirement and no criterion covered the change. The implementation added two refresh calls and
recorded the new stale-value behavior in a project spec document.

**Why blocking**: a user-visible behavior change that the plan neither declared nor asked the user to
accept.

### TPR-02 · 应修 · A criterion clause with no mechanism, denied twice by the design

**Pass 3.** `AC2` required that the font list scroll position **and** the workspace scroll position
survive a repaint. `R3` covered the workspace only. `design.md` stated twice that the list needed no
scroll preservation.

The implementation added a scroll-tracking attribute on the list. The attribute is what makes `AC2`
true, and no artifact names the attribute.

### TPR-03 · 应修 · A criterion clause with no mechanism at all

**Pass 3.** `AC3` required that the caret stays at the insertion point **and** that IME composition
is not interrupted. The caret clause had a mechanism. The composition clause had none.

The remaining repaint path rebuilds the input element, which ends any composition session. Restoring
a selection range does not restore a composition buffer. A project spec already forbade repainting on
filter keystrokes, so only one low-frequency message could interrupt a composition. The risk is small
and the criterion is still unprovable.

### TPR-04 · 应修 · A pixel budget with two wrong unit assumptions

**Pass 4.** `design.md` compared `0.35rem×2 + 40px + 0.3rem + 14rem ≈ 274px` against a `18rem`
panel limit read as 288px.

- A global `border-box` rule makes the limit include padding and border. The budget is 274.8px.
- The root font size comes from a setting with 14px, 16px, and 18px tiers, so one `rem` is not fixed.
  The input's `40px` minimum does not scale with the tiers.
- The listed terms sum to 280px.

Per tier: 16px gives 268.8px against 274.8px; 14px gives 240.2px against 240.2px, which is zero
slack; 18px gives 12px of slack.

The conclusion held for an unstated reason: the list is a column flex item with `overflow: auto`, so
its automatic minimum size is zero and the list shrinks instead of overflowing. The plan declined an
`overflow` property on the panel on the strength of the wrong model.

### TPR-05 · 应修 · A requirement clause the design rejected

**Pass 5.** `R1` required that scrolling over the list does not move the workspace. The `已考虑不做`
list declined the property that stops scroll chaining. Chaining still happens at the list boundary.
No criterion tested the clause.

### TPR-06 · 提示 · A criterion with an unstated precondition

**Pass 6.** `AC1` required that the panel's bottom edge stays inside the card's visible area. The
panel uses absolute positioning with a fixed top offset and no flip logic. The height maximum is
determinate; the bottom edge position depends on the scroll position when the dropdown opens.

### TPR-07 · 提示 · Artifact hygiene

**Pass 0.** Both `.jsonl` manifests still carried the template's `_example` first line, which the
template instructs the author to delete. `task.json` named the previous task's branch, with no
explanation in the plan.

## Sound parts

The report listed these, and the list mattered as much as the findings:

- More than fifteen `path:line` citations across three files all resolved to the construct the text
  claimed, against the pre-change revision.
- The scope check for the overview object held under a whole-function search: four occurrences, all
  reading one field.
- The error-message precedence in the skip decision was correct, because the compared variable is
  assigned only inside the paint function and therefore keeps its old value across a skip.
- Reordering the two guard conditions preserved the previous behavior, because both orders return the
  same value in every branch.
- The environment claim about the test runner was correct: the config file sets only the include
  pattern, with no DOM environment.
- The rollback structure split along the three defects, and the real change matched that split.

## Severity calibration

| Finding | Severity | Deciding rule                                                                                |
| ------- | -------- | -------------------------------------------------------------------------------------------- |
| TPR-01  | 阻断     | A user-visible behavior change with no requirement and no criterion.                         |
| TPR-02  | 应修     | The criterion is provable only through an undeclared mechanism.                              |
| TPR-03  | 应修     | The criterion is not provable, and the residual risk is low.                                 |
| TPR-04  | 应修     | The method is wrong; the conclusion survives; a future change would inherit the wrong model. |
| TPR-05  | 应修     | Two artifacts contradict each other, and no criterion settles the contradiction.             |
| TPR-06  | 提示     | The criterion is testable once a precondition is stated.                                     |
| TPR-07  | 提示     | Hygiene, with no effect on the shipped result.                                               |

## What the case teaches

Three of the seven findings share one shape: **an acceptance criterion states an outcome that the
plan's own text never supplies a mechanism for.** In all three the implementing agent found the gap
and closed the gap, and in none of the three did any artifact record the repair.

Pass 3 at clause granularity is the cheapest check that finds this shape. Pass 2's reverse
enumeration finds the variant where the gap hides behind a true observation.
