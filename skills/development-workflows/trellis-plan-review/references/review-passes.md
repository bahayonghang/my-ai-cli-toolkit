# Review passes

Eight passes. Pass 0 is a script. Passes 1 to 7 are judgment. Each pass answers one question.

Run the passes in order. A later pass often reuses evidence that an earlier pass collected.

Every worked example below comes from one real review: `case-study-font-picker.md`.

---

## Pass 0 — Mechanical precheck

**Trigger**: always.

```bash
python "<skill-dir>/scripts/plan_precheck.py" <root-task-dir> --include-descendants
```

Substitute the literal skill directory path for `<skill-dir>`. Use `py -3` where `python` is not on
PATH. The command prints one aggregate JSON result. An optional `--output <path>.json` writes that
same result itself; do not redirect with `>`.

The script resolves the root's recursive current/archive children and reports these categories:

| Category                                                                             | Blocking |
| ------------------------------------------------------------------------------------ | -------- |
| Missing/ambiguous member, malformed tree metadata, cycle, duplicate edge, backlink/path escape | yes |
| Missing `prd.md` in any member                                                       | yes      |
| Blocking template residue (`_example`, `TBD`, `[PLACEHOLDER]`, `待补`)               | yes      |
| Advisory marker mention (`TODO`, `FIXME`, `???`)                                     | no       |
| A `path:line` citation that names a missing file, or a line past the end of the file | yes      |
| An `AC` with no requirement annotation, or an `R`/`AC` reference with no definition  | no       |
| The report destination is neither ignored nor tracked by git (an untracked entry in `git status`) | no       |

Report the blocking items first. A blocking item often makes the later passes cheaper: an
unresolvable citation tells you which claim to check first.

The result contains one ordered scope, per-member mechanical results, aggregate blocking items, and
only the root report destination. The script writes no review report. It decides nothing about
truth; claim truth, mechanism presence, and arithmetic stay with Passes 1 to 7.

---

## Pass 1 — Claim verification

**Question**: does every statement about the repository hold?

**Trigger**: always.

Run this pass once per scope member. Use task-qualified evidence when two members cite similarly
named artifacts.

**Procedure**

1. List every statement in the artifacts that asserts something about the repository.
2. Classify each statement, then collect the evidence its class requires. See
   `claim-verification.md`.
3. Resolve every `path:line` citation to the construct the text claims sits there. A citation that
   resolves to a different construct is a finding even when the file and the line exist.
4. Record each verified citation. Pass 1 produces the "sound parts" list as well as findings.

**Findings**

- A claimed file, function, field, or CSS rule does not exist.
- A behavior claim does not match the implementation.
- An identifier differs from the code by any character.
- A count differs from the real count.
- A citation points at the wrong construct.

**Worked example**

The reviewed plan carried more than fifteen `path:line` citations across three files. Every citation
matched the pre-change file: `main.ts:1330` was the `root.innerHTML` assignment,
`main.ts:1348-1350` was the focus restore, `styles.css:1813` was the `.font-picker-list` rule.

That result belongs in the report. A plan whose citations resolve is auditable, and the author
should not have to re-derive the citations on the next round.

---

## Pass 2 — Fact and inference

**Question**: is each confirmed fact's observation true, and is its inference true?

**Trigger**: `prd.md` has a `Confirmed facts` section, or the plan states any "therefore" step.

**Procedure**

1. Split each entry into the **observation** and the **inference**. An entry often carries both in
   one sentence.
2. Verify the observation with Pass 1 evidence rules.
3. Verify the inference separately. An observation can be true while its inference is false.
4. For any inference of the form "therefore X is not affected", run a **reverse enumeration**:
   - Read the code path the plan removes, skips, or gates.
   - List every piece of state that the code path updates today.
   - For each piece of state, ask whether the reviewed page or feature displays that state.
   - Do not stop at the items the document names. The document names the items its author checked.

**Findings**

- The observation is false.
- The observation is true and the inference is false.
- The inference rests on a scope the document never states (for example, "nothing else reads this
  object" when the object is one of several data sources).

**Worked example**

The plan stated: "the only content on the settings page that the overview drives is the connection
badge … therefore skipping the pushes cannot make any visible content on the settings page lag."

The observation held. A search of the whole render function found `overview` at four lines only, and
all four read `overview.health.session`.

The inference failed. The settings page also shows a collector-status field. That field reads a
separate variable, and a tray fetch inside `refreshLivePage()` updates the variable. The skipped
branch sat before the `refreshLivePage()` call, so the skip stopped the tray fetch. The field
stopped updating while the operator stayed on the settings page.

The reverse enumeration finds this class of error. The document scoped its check to one object.
The removed code path updated two.

---

## Pass 3 — Acceptance criteria to requirement and mechanism

**Question**: does every acceptance-criterion **clause** reach a requirement and a design mechanism?

**Trigger**: always.

**Procedure**

1. Split each criterion into clauses. Split on `；`, `，` before a second obligation, `and`, and any
   list of separate observable outcomes.
2. For each clause, find the requirement that states the obligation.
3. For each clause, find the section of `design.md` that supplies the mechanism.
4. Record a finding when either the requirement or the mechanism is missing.

Split by clause, not by criterion. A criterion that bundles one covered clause with one uncovered
clause reads as covered at criterion granularity. That is the exact shape this pass exists to catch.

**Findings**

- A clause has no requirement.
- A clause has a requirement and no mechanism.
- A clause has a mechanism that the design elsewhere declares unnecessary.
- A requirement has no criterion (the reverse direction).

**Worked example**

Two criteria each bundled two clauses, and each bundle held one covered clause and one uncovered
clause.

- `AC2` required that "the font list scroll position **and** the workspace scroll position are not
  reset". `R3` covered the workspace scroll only. Two sections of `design.md` stated that the font
  list needed no scroll preservation. The implementation had to add a scroll-tracking attribute that
  no artifact mentioned.
- `AC3` required that "the caret stays at the insertion point; **IME composition is not
  interrupted**". The caret clause had a mechanism. The composition clause had none: the remaining
  repaint path rebuilds the input element, which ends any composition session, and restoring the
  selection range does not restore the composition buffer.

At criterion granularity both criteria pass. At clause granularity both fail.

---

## Pass 4 — Quantitative argument

**Question**: does each calculation recompute, and are its units what the plan assumes?

**Trigger**: `design.md` contains a calculation, a budget, a threshold, or a timeout.

**Procedure**

1. Recompute each calculation. Report the arithmetic result, not an impression.
2. Check every unit source:
   - `rem` and `em` — find the element that sets the root or parent font size. Check whether a
     setting changes that font size at runtime.
   - Box dimensions — find the `box-sizing` value. Under `border-box`, a `max-height` already
     includes padding and border.
   - Percentages — find the containing block.
   - Timeouts and retries — check the clock unit and whether the value is per attempt or total.
3. Ask a separate question: does the conclusion follow from this calculation, or from a different
   mechanism the plan never names? A conclusion that holds for an unstated reason is still a
   finding, because the stated model drives the next change.

**Findings**

- The arithmetic is wrong.
- A unit source is variable and the calculation assumes one value.
- A fixed-unit term sits inside an otherwise scalable budget.
- The conclusion holds for a reason the plan does not state.

**Worked example**

The plan compared `0.35rem×2 + 40px + 0.3rem + 14rem ≈ 274px` against a `max-height: 18rem`
panel, and read the panel budget as 288px.

Three errors:

- A global `box-sizing: border-box` rule applies. The `18rem` limit already includes the `0.35rem`
  padding on each side and a 1px border on each side. The real content budget is 274.8px, not 288px.
- The root element sets `font-size` from a variable, and three settings tiers assign 14px, 16px, and
  18px. One `rem` is not always 16px. The filter input uses a fixed `min-height: 40px`, so the fixed
  term does not scale with the rest.
- The listed terms sum to 280px, not 274px.

Recomputed per tier: 16px tier, content 268.8px against a 274.8px budget; 14px tier, content
240.2px against a 240.2px budget, which is zero slack; 18px tier, 12px of slack.

The conclusion — that no stylesheet change is needed — still holds, for a mechanism the plan never
names. The list is a column flex item with `overflow: auto`, so its automatic minimum size is zero.
The list shrinks when the budget runs short. The list does not overflow the panel. Report the
mechanism, because the plan rejected an `overflow` property on the panel on the strength of the
wrong model.

---

## Pass 5 — Internal contradiction

**Question**: do the artifacts agree with each other?

**Trigger**: always.

**Procedure**

For each member, compare four pairs:

1. Requirements against `Out of scope`.
2. Requirements against `Key decisions`.
3. Requirements against the `已考虑不做` list in `design.md`.
4. The change list in `design.md` against the step list in `implement.md`.

Then compare the task tree as a whole:

5. Parent requirements against each child's declared scope, mechanisms, and acceptance criteria.
6. Parent exclusions against behavior introduced by children.
7. Cross-child ordering against explicit planning text; never accept tree order as dependency proof.
8. Shared interfaces, evidence boundaries, delivery paths, and rollback contracts across members.

**Findings**

- A requirement clause names an outcome that a rejected option was the only route to.
- A decision reverses a requirement without amending the requirement.
- A file appears in the change list and in no step, or in a step and in no change list.
- A step introduces a mechanism that no requirement asks for.
- A child omits or contradicts a parent obligation it claims to own.
- Cross-child execution depends on an order that only the tree position implies.
- Two members define incompatible forms of the same shared contract.

**Worked example**

`R1` required that "scrolling the wheel over the list does not move the workspace". The `已考虑不做`
list declined the CSS property that stops scroll chaining, on the ground that chaining no longer
causes a jump. Scroll chaining still happens at the list boundary. No criterion tested the clause.

The resolution is a choice, not a defect to fix during review: remove the clause from `R1`, or add
the property. Report the contradiction and both routes.

---

## Pass 6 — Criterion determinacy

**Question**: does each criterion give one pass/fail result under its stated preconditions?

**Trigger**: always.

**Procedure**

For each criterion, ask what a verifier needs to know before running the check. Flag any criterion
whose result depends on an unstated condition:

- scroll position, window size, viewport, or zoom
- timing, wait duration, or event order
- external service state, network condition, or data volume
- a visual impression with no measurable threshold

**Findings**

- The criterion depends on an unstated condition.
- The criterion states a threshold with no measurement method.
- The criterion can pass and fail on the same build.

**Worked example**

`AC1` required that "the bottom edge of the panel does not go outside the visible area of the
settings card". The panel uses absolute positioning with a fixed top offset and no flip logic. The
panel height has a fixed maximum, so the height is determinate. The bottom edge position is not: the
edge depends on where the trigger button sits when the operator opens the dropdown. The same build
passes at one scroll position and fails at another.

Two routes: restate the criterion as the determinate part ("panel height stays within its maximum,
and the list scrolls inside the panel"), or state the scroll precondition for the check.

---

## Pass 7 — Implementation drift

**Question**: does the real change match the planned change list?

**Trigger**: `task.json` `status` is not `planning`, or the task is archived.

**Procedure**

1. Take the change list in `design.md` as the planned side.
2. Collect the real side with read-only git commands:

```bash
git status --porcelain -uall
git diff --stat
git diff -- <path>
git log --oneline -5
git show --stat <commit>
```

The repository may set `status.showUntrackedFiles = no`. Always pass `-uall`.

3. Compare, and classify each difference.

**Findings**

| Class                     | Meaning                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Undeclared file           | A file changed that the change list does not name.                                                                |
| Undeclared mechanism      | A property, field, attribute, or call site appeared that no artifact mentions.                                    |
| Uncovered behavior change | A real behavior change that no criterion tests.                                                                   |
| Unimplemented plan item   | A change list entry with no matching edit.                                                                        |
| Silent spec amendment     | A project spec document changed to describe the new behavior, with no requirement or criterion behind the change. |

A change outside the plan is not a defect by itself. The absence of a declaration is the defect. An
implementer who finds a planning gap and closes the gap did useful work; the plan still needs the
gap recorded, because the next reader trusts the plan.

**Worked example**

The implementation added three items that no artifact named:

- A scroll-tracking attribute on the font list, which `design.md` twice said was unnecessary. The
  attribute is what makes `AC2` true.
- Two extra data-refresh calls, on route entry and on section switch, which compensate for the
  false inference that Pass 2 found.
- An edit to a project spec document, which recorded the new stale-value behavior. No requirement
  and no criterion authorized the behavior change.

All three are undeclared. Two of the three exist because the plan was wrong. The stale
collector-status value is a user-visible behavior change that the operator never approved as a
trade-off.
