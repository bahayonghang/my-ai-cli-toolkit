# Tree Review Evidence and Prior Art

- Researched at: 2026-08-26
- Target: `skills/development-workflows/trellis-plan-review/`
- Mode: Production+ behavior redesign under repository-native packaging rules
- External writes/install: none

## Pre-change mechanism and negative example

At implementation start, base commit `87a1246a23c17021c02aac374bd29107a927a54e` had singular
ownership at every stage. The anchors below refer to that base revision, not the changed worktree:

- `SKILL.md:37-46` locates and reads one task.
- `SKILL.md:50-60` runs Pass 0 for one task.
- `SKILL.md:93-110` writes `.trellis/reviews/<task-dir-name>.md` and returns one Prompt for that task.
- `scripts/plan_precheck.py:332-398` builds one task report and one task-derived review path.
- `scripts/write_review_report.py:81-96` derives the destination from one task basename.
- `references/handoff-prompt.md:26-40` tells the reviser to read one task directory.

The reported anti-case contains one parent and two children. Their `task.json` files confirm `children`/`parent` relationships. The review directory contains three Markdown reports. The parent report says at line 22 that child tasks were reviewed in separate reports; parent TPR-01 and child patent TPR-04 describe the same unresolved M8 scope conflict, while the software-copyright report line 87 points back to a duplicate parent finding.

Root cause: the agent repeated the single-task protocol for each tree member. The writer itself is already one-file-per-call.

## Qiaomu generalization gate

- Domain-neutral rule: one user-selected review scope produces one atomic durable report and one handoff Prompt.
- Classification: core mechanism. It controls completeness, deduplication and revision handoff for any hierarchical task system.
- Eval-only fixture: the Quanergy parent/two-child names and IP-specific findings stay in task research/evals, not in the runtime skill prose.
- Boundary case: a leaf scope remains one task; unrelated roots are not silently combined.

## Prior-art discovery

Intent queries:

1. `trellis parent child plan review`
2. `consolidated task review report`
3. `agent plan audit handoff prompt`

The Qiaomu unified runner failed before catalog aggregation because its Windows subprocess invokes bare `npx`; this host resolves `npx.cmd`. The documented underlying `npx.cmd skills find` calls succeeded. SkillsMP calls returned no usable result in the bounded run, so SkillsMP star evidence is unavailable. No candidate code was installed or executed.

Metrics below are mutable catalog observations from 2026-08-26. Installs indicate adoption, not satisfaction or quality.

| Candidate | Role | skills.sh installs | Source inspection | Lesson |
| --- | --- | ---: | --- | --- |
| `mindfold-ai/trellis@trellis-meta` | Trust/domain anchor | 368 | Official task-system source inspected | `children` is current, `subtasks` deprecated; archived children stay referenced; children remain independently verifiable. |
| `dongshuyan/compass-skills@session-handoff-prompt` | Complementary handoff specialist | 147 | `SKILL.md`, task-forest integration and output contract inspected | Read a task forest as structured context, merge it into one stable prompt, label conflicts instead of mutating the forest. |
| `dzhng/skills@implement-spec` | Consolidation specialist | 153 | Current `SKILL.md` inspected | Long scopes need one current handoff and a final whole-scope reconciliation; incremental fragments must not become the final review surface. |
| `levnikolaevich/claude-code-skills@ln-402-task-reviewer` | Popularity anchor | 378 | Current repository tree did not expose the catalog path | Reject as an adoption-only signal: current source could not be verified, so no mechanism is adopted. |

Sources:

- https://github.com/mindfold-ai/Trellis/blob/main/.agents/skills/trellis-meta/references/core/tasks.md
- https://github.com/dongshuyan/compass-skills/tree/master/skills/session-handoff-prompt
- https://github.com/dzhng/skills/blob/main/skills/engineering/implement-spec/SKILL.md

## Keep / adapt / reject / invent

### Keep

- Current report writer confinement, UTF-8/LF atomic write, Git visibility note and single-task overwrite semantics.
- Current four-section finding contract, evidence requirement, anti-inflation rule and one fenced handoff.
- Trellis canonical `children` and independent child verification semantics.

### Adapt

- Adapt task-forest source merging to Trellis `task.json` rather than external export files.
- Adapt “one current handoff” into one tree-wide revision Prompt pointing to a combined evidence report.
- Adapt whole-spec reconciliation into a tree-wide Pass 5 and aggregate verdict without adopting implementation/commit behavior.

### Reject

- Mechanical concatenation of separate reports: it preserves duplicate TPRs and conflicting counts.
- One Prompt per child: it fragments revision authority and lets cross-task fixes land partially.
- Inferring dependency order from tree position: Trellis explicitly treats hierarchy as ownership, not dependencies.
- Deleting old child reports during the new review: destructive migration is not required for the behavior fix.
- Multi-agent orchestration and auto-repair from external candidates: outside the read-only review contract.
- Qiaomu README/manifest ceremony: this monorepo has its own package contract and explicitly treats those validator failures as schema deviation.

### Invent

- A review-scope contract that separates task membership from report cardinality.
- Deterministic live/archive child resolution with cycle, ambiguity and parent-backlink guards.
- Cross-task root-cause deduplication before global TPR numbering.
- A shared single/task-tree report schema and one Prompt that routes each TPR to all affected task artifacts.

## Evidence classification

- Design advantage: one scope/one report/one Prompt and cross-task deduplication are explicit source-level contracts.
- Validated advantage: deterministic local tests now prove recursive live/archive membership, root-first order, leaf compatibility, legacy fallback, aggregate JSON output, fail-closed tree errors, one root writer target, historical child-report preservation, and executable root/interface/template/eval package contracts. A read-only replay against the reported Quanergy task tree resolved the expected three members and one root report path without changing historical reports. Repository-native `just ci` also passes.
- Hypothesis: a combined report reduces missed cross-task revisions and handoff friction compared with three independent reports.

## Implemented behavior and local validation

- `plan_precheck.py --include-descendants` resolves one root scope, reports per-member checks plus one aggregate blocking list, and computes Git visibility only for `.trellis/reviews/<root>.md`.
- Scope resolution covers current and `archive/*` children, `children` authority with absent-key `subtasks` fallback, ordered DFS, safe basenames, path/reparse confinement, unique membership, cycles, and child `parent` backlinks.
- Tree mode blocks missing/empty member status instead of silently skipping the status-selected drift pass. The precheck and writer share the same direct/archived task-shape and Windows junction/reparse confinement, including unsafe root basenames, linked task roots, task aliases, report-directory junctions, and existing report links.
- The writer now creates its temporary sibling with exclusive no-clobber ownership, flushes and fsyncs before replacement, and only cleans up a temporary path it created. Deterministic tests prove an ordinary stale temp file and a temp symlink are preserved while both the existing report and external symlink target remain byte-for-byte unchanged.
- `SKILL.md` 0.4.0, `agents/interface.yaml`, the artifact/pass/finding references, report schema, and handoff template now agree on one scope, one combined root report, one global TPR sequence, and one Prompt.
- `evals/evals.json` case 10 records the reported parent/two-child anti-case as a behavior fixture without promoting its IP-domain prose into the runtime instructions.
- Focused tests: `plan-precheck.test.mjs` 20/20, `write-review-report.test.mjs` 18/18, and `tree-review-contract.test.mjs` 3/3 (41/41 total).
- Repository gates: `just node-test`, `just skills-check`, `just python-check`, `just docs-sync`, and `just ci` passed on 2026-08-26 after the final check fixes; `git diff --check` passed with line-ending conversion warnings only.
- Spec judgment: the hostile pre-existing temporary-sibling case exposed a reusable ownership/no-follow contract not stated precisely enough in `.trellis/spec/backend/governed-file-writing.md`; the specification and verification matrix now require exclusive creation, foreign-residue preservation, and owned-only cleanup.
- Real anti-case precheck: `D:/Documents/Code/Rust/Exp/quanergy_client_rs/.trellis/tasks/08-26-intellectual-property-materials` resolved `task-tree`, root plus two children (`task_count=3`), and the single destination `.trellis/reviews/08-26-intellectual-property-materials.md`. Exit `1` represented two existing planning blockers; SHA-256 comparison proved all three historical `08-26-*.md` reports remained unchanged.

## Qiaomu schema-deviation check

The Qiaomu `validate_skill.py` command was run read-only after implementation and exited `1` because this monorepo intentionally does not ship per-skill `README.md`, `manifest.json`, Qiaomu `compatibility.adapter_targets`, or `evals/trigger_cases.json`. The repository-native package contract is `scripts/check.py`, `agents/interface.yaml`, `evals/evals.json`, generated docs, and `just ci`; all of those relevant gates pass. Adding ceremonial Qiaomu-only files would conflict with the reviewed repository conventions, so these external-validator items remain an intentional schema deviation rather than implementation failures. Trigger routing did not change; case 10 is an output/behavior fixture, not provider trigger evidence.

## Missing evidence

- Qiaomu unified dual-catalog JSON due the bare-`npx` Windows incompatibility.
- SkillsMP metrics and rating/review evidence.
- Current source for catalog hit `ln-402-task-reviewer`.
- Provider-backed runs proving models consistently follow the one-report/one-Prompt rule.
- Human review comparing combined-report usability with the three-file anti-case.
- Full provider/model replay that produces and human-checks one combined Quanergy report plus one Prompt. Only deterministic tree precheck and no-mutation evidence were run; report prose generation was intentionally not executed.
- Qiaomu-native package validation because this repository intentionally omits its README/manifest/adapter/trigger-case schema.
