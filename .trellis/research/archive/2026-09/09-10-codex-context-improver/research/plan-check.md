# Research: Independent planning cross-check

- Query: Cross-check the completed PRD, design, execution plan, task metadata, and stated manifest readiness for requirement coverage and authorization consistency.
- Scope: internal, read-only planning review; no product or planning artifacts changed.
- Date: 2026-09-10

## Findings

**No blocking planning issue found in the documents independently inspected.** The plan has a concrete implementation boundary and does not claim implementation acceptance before execution. `task.json` remains `planning`; the user must approve the final implementation scope before `task.py start` (`implement.md:3`, `:7`).

| Requirement / acceptance | Mechanism and evidence checked | Conclusion |
| --- | --- | --- |
| R1 / AC1 | `design.md:3` fixes new identity, version 2.0.0, owner and license; `:29` assigns identity sources, `:60` replaces evidence artifacts, `:67` enumerates external references; `implement.md:32` requires bounded old-name search and unique new entrypoint. | Covered; historical attribution may retain the old name without a compatibility entry. |
| R2 / AC2 | `design.md:30` preserves AGENTS discovery; `:31` adds context-audit ownership; `:42` distinguishes observed provenance from inferred loading, including audit-time reads; `:58` extends fixtures; `implement.md:33` requires every PRD behavior boundary to have case IDs and results. | Covered, including unknown config, present-but-unselected skills, prompts, conflicts, and insufficient same-name/disabled/link evidence required in `prd.md:28`. Existing AGENTS/map independent decisions remain required. |
| R3–R4 / AC3 | `design.md:44` names harmful behaviors without removing legitimate constraints; `:48` defines read-only versus authorized mutation and precise pause sources; `:52` makes delegation conditional and retains mandatory gates; `implement.md:33` binds output checks to all PRD clauses. | Covered; planning approval and explicit implementation authorization are kept distinct. The effect of absent subagent tools is specified by the conditional-delegation rule and required output case. |
| R5 / AC4 | `design.md:25` retains the initial-load budget, `:60` specifies the five new reports, `:63` records README deviation; `implement.md:30` admits only the exact documented validator failure and does not call it a pass. | Covered; repository conventions and qiaomu tool status are reported separately. |
| R5–R6 / AC5 | `design.md:56` separates behavior fixtures from trigger projection, `:59` records reviewer type and actual outputs; `implement.md:30` requires complete passing trigger results and `:33` rejects static-only success claims. | Covered; heuristic smoke, agent output, provider runs, humans, and install evidence remain distinct. |
| R6–R7 / AC6 | Target checks, source-generated docs, and full CI are ordered in `implement.md:18` onward and `:47` onward; `prd.md:32` explicitly leaves full acceptance incomplete on missing CI evidence. | Covered; extra validator failures cannot be hidden by the README deviation. |
| R7 / AC7 | `implement.md:7` preserves existing deletions and unrelated untracked file; `design.md:69` explicitly includes generated consequences; `implement.md:58` forbids source restoration and hand-edited catalogs. | Covered; source deletion ownership is not reassigned to this task. |

### README and old-report retirement are feasible

- `.trellis/spec/guides/skill-authoring-conventions.md:343` explicitly identifies missing README/manifest as repository-versus-qiaomu schema differences. The plan keeps the existing manifest and uses generated bilingual docs rather than inventing an independent README solely for validation.
- The current qiaomu validator requires Production evidence at `reports/skill-ir.json`, `reports/trigger-eval.json`, `reports/prior-art-research.md`, and `reports/creation-handoff.md` (`.agents/skills/qiaomu-meta-skill/scripts/validate_skill.py:106`). The proposed replacement set includes all four plus the useful output review.
- The legacy 11 profiles/scorecards/blind packs are not required by that validator. Retiring them is workable because the plan also updates the existing Node tests and manifest references; retaining them under a new name would instead preserve misleading stale evidence.
- The literal factory CLI arguments in the execution plan match current parsers: IR `--output` and trigger `--cases` / `--output` resolve relative to the target skill directory. These are command-shape checks, not execution evidence for the new package.

### Derived docs changes are explicitly authorized by the proposed scope

The plan now chooses the actual-tree global generation option rather than temporary HEAD generation. This matches the generator's real interface: only `--check` is supported (`docs/scripts/sync_docs_catalog.py:148`), global discovery is unconditional, and stale generated pages are removed (`:932`). `implement.md:7` makes approval cover those already-deleted skills' derived docs changes. There is no contradiction with preserving the existing source deletions; no source restoration or unrelated behavioral refactor is proposed.

The baseline inventory and final attribution remain necessary execution checks, especially if another agent changes source or docs during implementation. They are not already-proven outcomes.

### Temporary local installation probe does not contradict global-install exclusion

`design.md:15` excludes skill-installation management as runtime product behavior, while `:71` and `implement.md:35` define a bounded package-validation probe in a newly created task-owned temporary project. These are different responsibilities. `scripts/install_projects.py:120` accepts the planned `--project`, `--skill`, and `--json` options; `:837` creates a directory junction on Windows, and `:894` resolves an existing project directory and rejects the user home.

The plan explicitly requires a newly created absolute temporary project, no user-global roots, no ignored repository link changes, and ownership/path checks before cleanup. It correctly limits the result to local installer linkage. Runtime Codex discovery and remote `npx` installation remain missing evidence. No additional global-install authorization is needed for the proposed disposable local validation once implementation scope is approved.

## Caveats / Not Found

- The Trellis researcher role expressly forbids loading `implement.jsonl` or `check.jsonl`; neither manifest was opened. Main session reports 5 + 5 real entries passing `task.py validate` and a precheck with zero blockers. That is **delegated mechanical evidence**, not independent manifest-content verification by this reviewer. An authorized main/check role owns final manifest-content confirmation.
- This review did not repeat precheck, full CI, provider calls, installation, or future output evaluations. No implementation acceptance checkbox is justified by this planning review.
- No plan-review skill or `.trellis/reviews/` output was used. Only this research record was written.
