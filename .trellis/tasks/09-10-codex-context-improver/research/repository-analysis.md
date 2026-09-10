# Research: Repository context improver rename and scope

- Query: Identify the smallest complete rename from `agents-md-improver` to `codex-context-improver`, including context-audit gaps, references, and verification obligations.
- Scope: internal; external model and X source research belongs to the main session.
- Date: 2026-09-10
- Authority: planning research only; this report is the only file written. Product files, active-task state, installation, Git, and dependencies were not changed.

## Findings

### P1 — The current contract cannot establish which skills and instructions were actually loaded

`skills/developer-tools-integrations/agents-md-improver/SKILL.md:36` starts with project root/CWD/config discovery, and line 40 builds only the AGENTS selection chain. `references/codex-agents-discovery.md:70` lists extension roots and line 76 says to verify source or runtime capability, but does not separate filesystem presence, discovery metadata, loaded body, and invocation evidence. `references/report-format.md:21` provides an instruction-chain table, with no skill/context provenance record.

Minimal extension: retain the existing AGENTS chain, then inspect only relevant context surfaces observable in the request/session and source files. Record per material item its source, scope, evidence, and state in plain report rows. Distinguish candidate/present, discoverable, loaded, and invoked; a catalog entry or installer mapping must never prove body loading or execution. Missing runtime evidence remains `missing evidence`. Do not build a new scanner, state machine, or installation manager for this judgment.

The repository already owns the key invariant: `docs/harnesses.md:30` separates installation targets from runtime discovery, and `.trellis/spec/guides/harness-execution-routing.md` requires local fixtures, repo contracts, and provider/runtime evidence to remain distinct.

### P1 — Historical output artifacts already disagree with the current fixture

`evals/output/cases.jsonl:5` routes Claude-only requests to `claude-context-improver`. However, `reports/output_blind_review_pack.json:198` and `reports/output_blind_review_pack.md:89` still identify `claude-md-improver`. The current Node suite passes despite this mismatch because it checks report existence and selected metadata, not correspondence of blind outputs to current cases (`tests/contracts.test.mjs:200`).

Regenerate or explicitly retire superseded generated reports from the changed fixture source. Do not perform blind name replacement and present it as a rerun. Current scorecard is expressly recorded fixtures only (`reports/output_quality_scorecard.md:18`), provider GPT-5.6 evidence is absent (line 21), and all human decisions remain pending (line 22). These are not GPT-6 Astra effectiveness evidence. New model-specific improvement claims require separate actual execution evidence or must stay hypotheses/design advantages.

### P2 — Tests pin old identity, date, URL, and case count

`tests/contracts.test.mjs:87` pins the discovery verification date to 2026-07-23 and lines 88–91 pin a historical documentation URL. Lines 114–115 pin package identity/version, line 137 pins eval identity, and line 149 fixes output cases at five. `references/codex-agents-discovery.md:3` has the same old verification date.

Refresh verified facts from the main session's source research, update identity/version checks, and replace fixed case-count assertions with checks of required material scenario IDs and evidence state. Preserve the 1000-token root-plus-interface initial-load constraint (`tests/contracts.test.mjs:44`) and the sibling fenced-template parity test (line 247). Do not enlarge the budget merely to fit new prose; move detailed judgments into references.

### P2 — One named routing destination is absent in the observed working tree

`evals/evals.json:94` asks for capability recommendations and lines 95–101 route to `codex-workflow-recommender`, but the corresponding directory is absent as observed during this research. The category guidance and generated docs still name it. This may be pre-existing or concurrent work; this role did not inspect Git state.

For the new skill, preserve the semantic exclusion for general workflow/tool recommendations but do not promise that an unavailable named skill can be invoked. Use the available owning workflow or direct advice according to session capabilities. The rename does not authorize restoring/deleting that other package.

### P2 — Root action language must follow the explicit request boundary

`SKILL.md:25` groups “optimize” with audit/plan and says not to write, while line 27 permits explicit scoped changes. Keep audit/review/plan read-only, but make explicit optimize-and-change requests and already-authorized scoped work executable without a new permission round. Merely approving a planning artifact is not automatically implementation authorization where the enclosing Trellis workflow requires a start decision. Align the root/interface/report wording with the actual requested action instead of using keywords as an approval rule engine.

## Files found and minimal package changes

All paths in this section are under `skills/developer-tools-integrations/agents-md-improver/` before the rename.

| Surface | Current responsibility | Planned change |
| --- | --- | --- |
| `SKILL.md` | 65-line prompt-only audit/update entrypoint | Rename, widen triggers to Codex context quality, add context evidence step, preserve narrow editing and exclusions. |
| `agents/interface.yaml` | Production inline neutral interface; explicit default invocation | Rename display/default invocation and describe context evidence boundary consistently. |
| `manifest.json` | Identity, version, ownership, Production mode, fixture/report components | Rename and update contract/version/date; retain owner `lyh`, avoid adding fabricated proof. |
| `references/codex-agents-discovery.md` | AGENTS selection, shadowing, budget/config evidence, extension roots | Refresh official facts and qualify runtime evidence; either broaden this file or add one focused context reference if readability requires it. |
| `references/quality-criteria.md` | Quality criteria and independent AGENTS/map creation decisions | Add source-backed context redundancy/conflict/over-prescription judgments; preserve durable-instruction minimum. |
| `references/update-guidelines.md` | Scoped evidence-backed edits and verification | Include loaded-skill/source ownership, minimal context edits and preservation. |
| `references/report-format.md` | Evidence-first report and update summary | Rename report headings and add conditional context provenance/findings rows. |
| `references/templates.md` | Conditional AGENTS templates plus shared maps | Preserve map fences unchanged unless the shared contract needs an actual change. |
| `evals/evals.json` | 11 human-review behavior/routing fixtures | Rename identity/invocation; add context provenance and latest-source boundaries. |
| `evals/output/cases.jsonl`, `evals/output/fixtures/agents-md-scenarios.md` | Five recorded examples; two labelled holdouts | Rename relevant prompts, add meaningful failure/boundary scenarios, maintain honest pending human status. Filename rename is optional. |
| `tests/contracts.test.mjs` | Seven static/fixture/parity tests | Update identity and meaningful new invariants; catch generated fixture/report mismatch if those artifacts are kept. |
| `reports/` | 11 heuristic/fixture report files | Regenerate relevant artifacts from changed inputs; explicitly distinguish heuristic classifications and fixture success from runtime/human evidence. |

No bundled executable helper currently exists or is needed for this prompt/reference refinement. The existing manifest makes the package Production, but there is no per-package README, trigger-case/report pair, prior-art report, creation handoff, or Skill IR. `.trellis/spec/guides/skill-authoring-conventions.md` explains qiaomu-versus-repository schema deviations: do not add README solely to silence a generic validator; retain actual missing evidence and justify earned artifacts proportionately. Main-session qiaomu planning owns that decision.

## Full active-reference rename impact

Targeted searches followed `code_map.md` and `skills/code_map.md`, excluding runtime/dependency paths. Product source references outside the package are:

- `skills/developer-tools-integrations/AGENTS.md:4`, `:17`, `:50`, `:83` — suite name, sibling relation, tools row, and eval notes.
- `skills/developer-tools-integrations/claude-context-improver/SKILL.md:70` — shared-map co-maintainer.
- `skills/developer-tools-integrations/claude-context-improver/references/templates.md:242` — symmetric shared-template notice; rename the notice, not fenced contents.
- `skills/developer-tools-integrations/claude-context-improver/references/report-format.md:16`, `:47` — shared-map owner.
- `skills/developer-tools-integrations/skill-session-review/SKILL.md:146` — delegation/routing reference.
- `skills/developer-tools-integrations/goal-meta-skill/evals/evals.json:76`, `:80` — negative routing expected owner.
- `.trellis/spec/guides/skill-authoring-conventions.md:369` — illustrative shared-map owner reference; main session owns spec changes.

Generated references are `docs/skills.md:32`, `docs/en/skills.md:32`, both language detail pages named `agents-md-improver.md`, and `docs/.vitepress/generated/catalog.mjs:37` / `:256`. Regenerate with `just docs-sync`; do not hand-edit. `docs/scripts/sync_docs_catalog.py:932` removes stale generated pages, so an already-absent unrelated package can cause unrelated generated removals; main session must inspect that delta against its working-tree baseline.

No direct old-name reference was found in `scripts/install_projects.py`, `scripts/test_install_projects.py`, `docs/scripts/sync_docs_catalog.py`, `platforms/`, `README.md`, or `justfile`. The installer derives catalog identity from frontmatter/path (`scripts/install_projects.py:81` and `:95`). A source rename may leave ignored live links pointing at the former path; do not change ignored or global installation state automatically. Source/catalog discovery and actual new-session skill discovery require separate evidence. Historical archived task/journal entries were intentionally not searched or rewritten.

## Validation obligations

### Docs generator scope and pre-existing deletion handling

The generator has **no scope/filter/output-root option**: `docs/scripts/sync_docs_catalog.py:148` accepts only `--check`; lines 17–23 bind roots to the script location; lines 949–954 always discover all skills/hooks/platforms. Lines 932–934 delete every stale generated detail page. It also obtains a tracked/untracked skill-file inventory through Git when available (lines 211–214), so a copied tree without Git may take a different fallback path; validate the resulting resource counts rather than assuming byte parity.

Main session reports 26 existing source deletions. There is no way to keep those sources deleted, change only the target's generated catalog entries, and simultaneously claim the live repository's full catalog check is current: the global checker compares against the entire observed tree.

**Smallest operational choice for a consistent live tree:** retain all existing source deletions and run the unchanged generator after implementation. Explain before execution that generated removal of already-deleted skills is a derived synchronization effect, not a new source-deletion decision. Classify target rename effects separately from pre-existing deletion effects in the final diff/report, without restoring any deleted source. Do not invent a scoped generator feature for this task. This option needs no temporary repository or generator modification, but does enlarge the generated-doc delta; main session owns whether that derivative scope is included in the execution plan the user approves.

**If exact task-only generated changes are required:** prepare an isolated, owned temporary snapshot of the HEAD catalog sources and generator, overlay only the target rename and its approved sibling edits, and generate there; copy only the target detail-page rename and the attributable common-catalog outputs back after checking those output paths have no unrelated user edits. Preserve all live source deletions. Validate the task-only snapshot separately and record the live full-catalog check as blocked by pre-existing source/catalog drift. Do not report isolated CI as live-tree CI, and do not later run unqualified live `docs-sync` as an unnoticed cleanup. This is safer for strict file ownership but has more bookkeeping and cannot honestly give a green live full-CI result until the existing deletions' generated consequences are included.

For either option, record the initial source/deletion/generated-doc state and use the generator itself for content; no hand-maintained catalog hunk edits or restoration of user-deleted packages. This role did not execute either option.

- Baseline run: `node --test skills/developer-tools-integrations/agents-md-improver/tests/contracts.test.mjs` — **PASS, 7/7**, on 2026-09-10. This proves only current deterministic package contracts.
- After implementation, run the renamed package's Node suite first; preserve initial-load limit, shared map parity, root/interface identity, reference integrity, and honest fixture evidence.
- Add meaningful cases for present-versus-loaded skill evidence, loaded-body provenance, unknown configuration/runtime state, source claims versus opinion, bounded simplification preserving verified project constraints, user-global read/write distinction, and existing near-neighbor exclusions.
- Repository `evals/evals.json` is not executed by CI (`skills/developer-tools-integrations/AGENTS.md:80`); qiaomu trigger eval is separate. Record fixture/heuristic/provider/human evidence separately.
- Public rename requires `just docs-sync`, `just skills-check`, and the final `just ci` gate. `just ci` runs docs, metadata, Python compile/unittest, installer tests, Node tests, and whitespace checks (`justfile:97`). These were not run in read-only planning research.
- Do not run a live installation or claim new-session availability from static tests. An isolated install can be planned if needed by the earned package gate; no dependency/global mutation is authorized by this research dispatch.

## Related specs and external references

- `.trellis/spec/guides/skill-authoring-conventions.md` — progressive disclosure, neutral interface, shared map parity, two eval systems, qiaomu deviations, factual-source verification.
- `.trellis/spec/backend/quality-guidelines.md` — source-generated docs, scoped changes, mandatory relevant checks.
- `.trellis/spec/guides/harness-execution-routing.md` — ownership and runtime evidence boundaries.
- `skills/AGENTS.md` and `skills/developer-tools-integrations/AGENTS.md` — package schema and suite obligations.
- External research inputs assigned to main session: `https://developers.openai.com/api/docs/guides/latest-model` and `https://x.com/pvncher/status/2095991462416490862`. This report makes no claim that either source was retrieved or verified by this role.

## Caveats / Not Found

- The reported absent recommendation package and stale generated catalog may reflect concurrent user work. Main session owns dirty-state reconciliation; this researcher performed no Git operation.
- No runtime/provider/human or new installation evidence was collected. No skill behavior improvement is empirically established by this report.
- Native memory registry search had no relevant hit; no historical memory facts were used.
- A nonexistent `README.en.md` search target and a PowerShell wildcard path search initially returned lookup errors; subsequent concrete-directory searches supplied the reported references.
