# Trellis artifact map

What each artifact holds, what a reviewer must find in it, and how to locate the task.

## Task directory shape

```
.trellis/tasks/<MM-DD-slug>/
  task.json          status, dev_type, scope, package, branch, parent, children
  prd.md             requirements, constraints, acceptance criteria
  design.md          technical design (complex tasks only)
  implement.md       ordered execution plan (complex tasks only)
  implement.jsonl    spec/research manifest for the implement sub-agent
  check.jsonl        spec/research manifest for the check sub-agent
  research/          optional research output
```

Archived tasks move to `.trellis/tasks/archive/<YYYY-MM>/<MM-DD-slug>/`. For every child basename,
search both the live task directory and every archive period. Zero exact matches is missing; more
than one exact match is ambiguous.

## Locating the task

1. Use an explicit path when the request gives one.
2. Run `python ./.trellis/scripts/task.py current` in the working repository.
3. Search for the slug when only a name is known. Start in the working repository, then widen:

```bash
find . -maxdepth 5 -type d -name "08-20-*"
```

A task named after a product feature often lives in a different repository from the one that holds
this skill. Widen the search root before you report the task as missing.

## task.json — read first

| Field                    | Effect on the review                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `status`                 | `planning` skips Pass 7. Any other value activates Pass 7.                                                                      |
| `dev_type`               | `bugfix` requires a root cause per defect. `feature` requires scope boundaries.                                                 |
| `scope` / `package`      | Sets the search root for claim verification.                                                                                    |
| `branch` / `base_branch` | Supplies the diff range for Pass 7. A branch reused from an earlier task is a finding when the plan does not explain the reuse. |
| `parent` / `children`    | `children` defines recursive review membership; every child's `parent` must point back. Tree position never defines dependency order. |

## One review scope

The explicitly selected task is the root. Its recursive `children` closure is one atomic review
scope, traversed root-first while preserving each declared child order. A leaf produces the same
one-member scope and report path as before.

- `children` is authoritative. Only when the key is absent may non-empty `subtasks` be used as a
  deprecated fallback. Conflicting non-empty fields block the review.
- A child basename must resolve exactly once under `.trellis/tasks/<child>` or
  `.trellis/tasks/archive/*/<child>` in the same repository.
- Missing or malformed `task.json`, missing/ambiguous children, unsafe or escaping paths, cycles,
  duplicate edges/membership, and mismatched `parent` backlinks block report writing.
- Hierarchy is ownership, not dependency. Pass 5 must find cross-child sequencing in the planning
  artifacts themselves.
- Review every member's artifacts under its own status, but aggregate and deduplicate findings once.
  Persist only `.trellis/reviews/<root-task-name>.md`; never create one report per child.

## prd.md — required content

| Section               | Reviewer obligation                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `Goal`                | One outcome, stated from the operator's view.                                                            |
| `Background`          | The reported symptoms and the located defects. Each located defect needs a `path:line`.                  |
| `Confirmed facts`     | Split each entry into observation and inference. Pass 2 checks both.                                     |
| `Requirements`        | Numbered `R1`…. Each requirement is one testable obligation.                                             |
| `Acceptance Criteria` | Numbered `AC1`…, each annotated with the requirements it proves. Pass 3 splits each criterion by clause. |
| `Out of scope`        | Explicit exclusions. Pass 5 compares the exclusions against the requirements.                            |
| `Key decisions`       | The decision, the date, and the reason. Pass 5 compares the decisions against the requirements.          |

A PRD-only task is valid for lightweight work. A missing `design.md` is not a defect by itself.
A missing `design.md` becomes a defect when the plan changes contracts, adds a data path, or names
more than a few files.

## design.md — required content

| Section               | Reviewer obligation                                                                     |
| --------------------- | --------------------------------------------------------------------------------------- |
| Change list           | A table of file to change. Pass 7 compares this table against the real diff.            |
| Contract              | Signatures and decision order for any changed function.                                 |
| Per-defect design     | One section per defect, with the mechanism that fixes the defect.                       |
| Compatibility         | What stays unchanged, and why.                                                          |
| Verification boundary | What automation covers, and what stays manual.                                          |
| Rollback              | One entry per independently revertible unit.                                            |
| 已考虑不做            | Rejected options with reasons. Pass 5 compares the rejections against the requirements. |

Pass 3 reads this file as the mechanism source. A criterion clause with no mechanism section is a
finding even when the clause looks obvious.

## implement.md — required content

- An ordered step list. Each step names files, lines, and the change.
- A verification command per step.
- A validation command block for the whole task.
- Manual acceptance steps for anything automation cannot reach.
- Rollback points.
- Review gates, if the plan stops for approval.

Check that every step maps to a requirement, and that every requirement reaches a step.

## implement.jsonl and check.jsonl

Each line is `{"file": "<spec path>", "reason": "<why>"}`. Rules:

- The files hold spec and research paths only. A code path in these files is a finding.
- The template ships an `_example` first line. That line must be deleted once real entries exist.
  Pass 0 reports a surviving `_example` line.
- Every referenced spec file must exist. Pass 0 resolves each path.

## Sequenced tasks

A slug of the form `MM-DD-<same-feature>` that follows an earlier task on the same feature carries
extra risk: the new plan inherits the earlier plan's assumptions. Read the earlier task's artifacts
when the new plan cites them, and check whether the cited state still holds.
