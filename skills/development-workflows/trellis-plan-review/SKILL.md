---
name: trellis-plan-review
description: "Independent review of Trellis task planning artifacts. Reads prd.md, design.md, implement.md, implement.jsonl, check.jsonl, and task.json in a .trellis/tasks/ directory, verifies every repository claim and path:line citation against the actual code, traces each acceptance-criterion clause back to a requirement and a design mechanism, rechecks arithmetic and unit assumptions, and reports evidence-backed findings with a verdict. Compares the plan against the real diff once the task has started. Use when the user asks to 审阅 trellis 任务, 审阅规划, 审查 prd design implement, 检查验收标准有没有机制支撑, review a trellis plan, audit a plan another agent wrote, or verify plan claims before implementation. Not for reviewing a code diff by itself (code-auditor for full-spectrum, code-quality-review for maintainability), not for writing or repairing the plan, and not for running the task."
category: development-workflows
tags:
  - trellis
  - plan-review
  - spec-audit
  - acceptance-criteria
  - traceability
  - read-only
version: 0.1.0
argument-hint: [trellis-task-dir]
allowed-tools: Read, Glob, Grep, Bash(python *), Bash(py -3 *), Bash(git diff *), Bash(git log *), Bash(git show *), Bash(git status *)
---

Review the Trellis planning artifacts at `$ARGUMENTS`. Report findings with evidence. Change nothing.

> Commands below write `<skill-dir>` as a placeholder. Substitute the literal skill directory
> path announced when this skill loads. Use `py -3` where `python` is not on PATH.

## Hard gates

- Do not edit `prd.md`, `design.md`, `implement.md`, `*.jsonl`, or `task.json`.
- Do not edit code, and do not fix a defect you find.
- Do not run `task.py start`, `task.py finish`, or any Trellis command that writes state.
- Do not produce a revised plan. Report the finding; the author decides the fix.
- Every finding carries evidence. Drop any candidate you cannot cite.

## Output mode

Detect the language of the request and surrounding discussion. Write the report in that language.
Keep file paths, identifiers, commands, and code excerpts exact.

## 1. Locate the task

The task directory may sit in another repository. Resolve it in this order:

1. An explicit path in `$ARGUMENTS`.
2. `python ./.trellis/scripts/task.py current` in the working repository.
3. `find . -maxdepth 5 -type d -name "<slug>"` when only a slug is known, then widen the search root.

Read `task.json` first. Its `status`, `dev_type`, `scope`, and `package` decide which passes apply.
Then read the artifacts. Details: `references/trellis-artifact-map.md`.

## 2. Pass 0 — mechanical precheck

```bash
python "<skill-dir>/scripts/plan_precheck.py" <task-dir> --output <task-dir>/../precheck.json
```

Omit `--output` to print the JSON only. The script writes the file itself; never redirect with `>`.
Exit `1` means a blocking item exists. Report those items before you start the judgment passes.

The script decides only what strings and the filesystem can decide: artifact presence, template
placeholder residue, `path:line` citation resolution, and `R`/`AC` identifier cross-reference.
Claim truth, mechanism presence, and arithmetic stay with you.

## 3. Passes 1–7 — judgment

Run each pass to answer one question. Full criteria and a worked example per pass:
`references/review-passes.md`.

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

## 4. Report

Four sections, in this order: verdict line, numbered findings, unverified list, sound parts.
Field definitions, severity rules, the anti-inflation rules, and the required blind-spot
disclosure: `references/finding-contract.md`.

A plan with no defects gets an empty findings list. Do not manufacture findings to fill it.

## 5. Routing

- Reviewing a code diff on its own: `code-auditor` (full-spectrum) or `code-quality-review`
  (maintainability only).
- Diagnosing an underspecified task or listing unknowns: `unknowns-first`.
- Writing, repairing, or executing the plan: the project's own Trellis planning and execution
  flow. Not this skill.

## Resource map

- `references/trellis-artifact-map.md` — artifact semantics, required sections, entry lookup.
- `references/review-passes.md` — Pass 0–7 criteria, triggers, worked examples.
- `references/claim-verification.md` — claim types and their evidence rules.
- `references/finding-contract.md` — output contract, severity, anti-inflation, disclosure.
- `references/case-study-font-picker.md` — a real seven-finding review, for severity calibration.
- `scripts/plan_precheck.py` — Pass 0.
- `evals/evals.json` — trigger and behavior regression cases.
