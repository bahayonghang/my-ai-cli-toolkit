---
name: trellis-plan-review
description: "Independent review of Trellis task planning artifacts. Treats the selected task and its recursive current or archived children as one review scope, verifies repository claims and path:line citations against code, traces every acceptance-criterion clause to a requirement and design mechanism, rechecks arithmetic and units, writes one combined evidence-backed Markdown report under the reviewed project's .trellis/reviews directory, and returns one copyable handoff prompt. Compares the plan with the real diff after the task starts. Use when the user asks to 审阅 trellis 父子任务, 审阅规划, 审查 prd design implement, 检查验收标准有没有机制支撑, review a trellis plan or task tree, audit a plan another agent wrote, or verify plan claims before implementation. Not for a code-diff-only review, writing or repairing the plan, or running the task."
category: development-workflows
tags:
  - trellis
  - plan-review
  - spec-audit
  - acceptance-criteria
  - traceability
  - handoff
version: 0.5.0
argument-hint: [trellis-task-dir]
allowed-tools: Read, Write, Glob, Grep, Bash(python *), Bash(py -3 *), Bash(git diff *), Bash(git log *), Bash(git show *), Bash(git status *)
---

Review the Trellis planning artifacts at `$ARGUMENTS`. Persist the report. Leave planning artifacts and product code unchanged.

> Commands below write `<skill-dir>` as a placeholder. Substitute the literal skill directory
> path announced when this skill loads. Use `py -3` where `python` is not on PATH.

## Hard gates

- Do not edit `prd.md`, `design.md`, `implement.md`, `*.jsonl`, `task.json`, or product code.
- Do not fix a defect you find. Do not produce a revised plan.
- The only allowed durable write is one review report under the reviewed project's
  `.trellis/reviews/` directory, or a temporary `--input` file for the helper.
  `Write` is not a grant to edit planning artifacts.
- One selected review scope produces exactly one combined report and one handoff Prompt. Never
  create a report or Prompt per child. Do not delete, overwrite, or migrate historical child reports.
- Do not run `task.py start`, `task.py finish`, or any Trellis command that writes state.
- Every finding carries evidence. Drop any candidate you cannot cite.

## Output mode

Detect the language of the request and surrounding discussion. Write the report in that language.
Keep file paths, identifiers, commands, and code excerpts exact.

## 1. Locate the root task

The task directory may sit in another repository. Resolve it in this order:

1. An explicit path in `$ARGUMENTS`.
2. `python ./.trellis/scripts/task.py current` in the working repository.
3. `find . -maxdepth 5 -type d -name "<slug>"` when only a slug is known, then widen the search root.

Read the root `task.json` first. Details: `references/trellis-artifact-map.md`.

## 2. Resolve one review scope

The root task and the recursive closure of `task.json.children` form one scope. Resolve children
root-first, preserving each `children` list's order. Search exact basenames in live tasks and
`archive/*/`; `subtasks` is a legacy fallback only when the `children` key is absent. A leaf is a
one-member scope.

Fail closed before judgment or report writing on a missing or ambiguous child, malformed metadata,
cycle, duplicate edge/member, unsafe path, or incorrect child `parent` backlink. Hierarchy expresses
ownership, not execution order. For every resolved member, read `task.json` and the existing planning
artifacts; each member's status decides whether Pass 7 applies.

## 3. Pass 0 — mechanical precheck

```bash
python "<skill-dir>/scripts/plan_precheck.py" <root-task-dir> --include-descendants
```

The default is one aggregate JSON document on stdout. Use `--output <path>` only when a persisted
diagnostic is needed; the script writes that one file itself, so never redirect with `>`. Exit `1`
means a tree or member blocking item exists. Report those items before the judgment passes and do not
invoke the report writer while any blocking item remains.

The script decides only what strings, the filesystem, and read-only git queries can decide:
tree membership and integrity, per-member artifact presence, template placeholder residue,
`path:line` citation resolution, `R`/`AC` identifier cross-reference, and whether the single root
report destination is ignored or tracked by git. The git check is a note, never a blocking item.
Claim truth, mechanism presence, and arithmetic stay with you.

## 4. Passes 1–7 — judgment

Run each pass to answer one question. Full criteria and a worked example per pass:
`references/review-passes.md`.

Run Passes 1–7 for every member, using that member's status and artifacts. Pass 5 also compares the
parent and children for requirement coverage, declared cross-task ordering, shared contracts, and
scope exclusions. Before numbering findings, merge candidates that share the same violated contract
and correction choice; one cross-task root cause gets one TPR with every affected task and location.

| Pass           | Question                                                              | Applies when               |
| -------------- | --------------------------------------------------------------------- | -------------------------- |
| 1 · 断言核对   | Does every claim about the repository hold?                           | always                     |
| 2 · 事实与推论 | Is each confirmed fact's observation true **and** its inference true? | `Confirmed facts` present  |
| 3 · AC 追溯    | Does every AC **clause** reach a requirement and a design mechanism?  | always                     |
| 4 · 量化论证   | Does each calculation recompute, with the right units?                | numbers in `design.md`     |
| 5 · 内部矛盾   | Do requirements, out-of-scope, decisions, and steps agree?            | always                     |
| 6 · 判据确定性 | Does each AC give one pass/fail result under stated preconditions?    | always                     |
| 7 · 实现漂移   | Does the real change match the planned change list?                   | `status` is not `planning` |

Two rules carry most of the yield:

- Pass 3 splits each AC **by clause**, not by AC. An AC that bundles a covered clause with an
  uncovered one reads as covered at AC granularity.
- Pass 2 treats "therefore nothing else is affected" as a separate claim. Enumerate what the
  changed code path actually updates; do not stop at the items the document names.

Evidence rules per claim type: `references/claim-verification.md`.

## 5. Persist one combined report

Assemble the scope section and four evidence sections in `references/finding-contract.md` (verdict,
numbered findings, unverified list, sound parts) using `references/report-template.md`.
A plan with no defects gets an empty findings list. Do not manufacture findings to fill it.

Write the file with the helper. The helper writes the file itself; never redirect with `>`.
Prefer `--input` on Windows.

```bash
python "<skill-dir>/scripts/write_review_report.py" <root-task-dir> --input <filled-report.md>
```

Invoke the helper exactly once. The destination is the reviewed project's
`.trellis/reviews/<root-task-name>.md`; a leaf keeps its existing basename path. A later review of the
same root overwrites only that root report. Existing child reports are historical files and stay
byte-for-byte untouched.
If the destination is neither ignored nor tracked, the helper prints a gitignore note on
stderr. Repeat that note in the chat after the handoff fence. Do not edit `.gitignore`;
adding the ignore rule or committing the report is the project's decision.

On success, the chat contains only:

1. The verdict line with counts.
2. The one combined report path (repo-relative and absolute).
3. Exactly one `text` fence whose body is the filled scope-wide template from
   `references/handoff-prompt.md`.

The fenced handoff is the reviser's contract and includes a structured
confirmation gate (`references/revision-question-gate.md`). This skill's agent
still does not ask, edit planning artifacts, or start the task.

If the helper exits nonzero: explain the error and the attempted path; print the
scope-plus-evidence report in chat; do not emit a path-based handoff prompt.

If the user asks to see the report in the conversation, print it after the fence.
Still persist the file first.

## 6. Routing

- Reviewing a code diff on its own: `code-auditor` (independent git-diff / full-spectrum)
  or `code-quality-review` (maintainability only).
- Diagnosing an underspecified task or listing unknowns: `unknowns-first`.
- Writing, repairing, or executing the plan: the project's own Trellis planning and execution
  flow. Not this skill.

## Resource map

- `references/trellis-artifact-map.md` — artifact semantics, required sections, entry lookup.
- `references/review-passes.md` — Pass 0–7 criteria, triggers, worked examples.
- `references/claim-verification.md` — claim types and their evidence rules.
- `references/finding-contract.md` — output contract, severity, anti-inflation, disclosure, persist rules.
- `references/report-template.md` — on-disk Markdown skeleton.
- `references/handoff-prompt.md` — copyable prompt for the agent that revises the plan,
  including the reviser confirmation gate.
- `references/revision-question-gate.md` — reviser structured confirmation duty; reviewer does not ask.
- `references/case-study-font-picker.md` — a real seven-finding review, for severity calibration.
- `scripts/plan_precheck.py` — Pass 0.
- `scripts/write_review_report.py` — path-confined write to `.trellis/reviews/`.
- `evals/evals.json` — trigger and behavior regression cases.
