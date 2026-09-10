# Independent implementation check — 2026-09-10

Reviewer: dispatched trellis-check. Authorization: approved implementation and
in-scope self-fixes; exclusive generated-doc/integration ownership. Main owns
task status/spec and final diff attribution. No recursive subagent dispatch.

## Findings fixed

- `SKILL.md`, `references/report-format.md`: actual first response for
  effective-instruction-chain gave a correct chain/budget calculation but did
  not lead with severity. Made the existing finding-first contract explicit.
- `SKILL.md`: actual Claude-only response omitted the required sibling name.
  Restored `claude-context-improver` routing when available, preserving the
  exclusion and not inventing runtime availability. Root/interface estimate
  remains 989 tokens under the existing 1000 characters/4 heuristic contract.
- `references/codex-agents-discovery.md`: added the verified conflict between
  per-file wording in Advanced Configuration and combined-budget wording in
  the AGENTS guide. The main session's official loader/config source check
  supports shared remaining bytes; dated main source is not proof of any
  installed binary or exact loaded bytes. No algorithm or scenario changed.
- `reports/output-review.md`: added portable full observed text and per-case
  assertion judgments for all 18 current output cases, with original failures
  and two focused reruns. `tests/contracts.test.mjs` now catches absent/stale
  report identity or omitted case review headings. It does not pretend to
  execute natural-language assertions or determine their pass state.
- `reports/creation-handoff.md` and generated `skill-ir.json`: synchronized
  current review/install/check evidence and explicit limitations.

## Actual output review

The separate probe agent did not read the oracle. Inputs were fictional and
forbade real edits. Original responses: `behavior-probe-responses.json`;
focused A/E reruns: `behavior-probe-rerun.json`. Both corrected behaviors passed
review without weakening assertions. The remaining 16 outputs were unchanged.

This is not an 18/18 actual-edit pass. C/D/I contain action decisions, not
executed changes/checks; Scenario C also lacks the specific command source
needed by its eval-3 projection. G lacks concrete higher-priority/official
comparison inputs; O does not exercise rule movement. The package report
marks those assertions PARTIAL/NOT EXERCISED, preserving missing evidence.
No provider comparison, human adjudication, native Codex loading or performance
claim is inferred from the in-session scenario execution.

J names and links fictional AGENTS.md:15 and quotes the supplied fixture
description, explicitly disclosing that it is not verbatim inspected file
content. No real filesystem quotation or publication execution is fabricated.

## Commands and outcomes

1. Target Node contract check after root/report fix: exit 0, 7/7 passed.
2. Qiaomu Skill IR export: exit 0; repeated once when output-review became a
   new resource, so final IR inventories all five reports.
3. Qiaomu trigger smoke: exit 0, 22/22, `ok=true`; lexical heuristic only.
4. Qiaomu validator: exit 1, exactly the approved README schema discrepancy.
   Raw output follows. Neither failure nor warnings are reported as a pass.

```json
{
  "ok": false,
  "root": "D:\\Documents\\Code\\Agents\\my-claude-code-settings\\skills\\developer-tools-integrations\\codex-context-improver",
  "failures": [
    "missing required file: README.md"
  ],
  "warnings": [
    "adapter target not declared: agent-skills-compatible",
    "manifest.json missing release_gates"
  ]
}
```

Warnings reflect the unchanged repository adapter names and absent publication
configuration, not an authority to add support claims or release machinery.
Generated bilingual skill pages provide the approved README navigation.

5. `just docs-sync`: exit 0; 82 skill pages, 89 generated files; six stale pages
   removed. Two old-name pages belong to the rename; four pages belong to the
   already-deleted recommendation/research packages. No generated file was
   hand-edited and no source package deletion was performed by the checker.
6. `just ci`: exit 0, complete seven-step run. Catalog current at 41 skills / 89
   generated files; docs-generator 4 tests passed; VitePress build passed;
   metadata all 41 passed; Python compilation 65 files passed; Python tests
   22 PR-release + 16 hooks passed; installer 35 tests passed; Node 416 total /
   412 passed / 4 skipped / 0 failed; final git whitespace check passed.
   No separate static type-check command exists for this package. Python
   compilation is reported as compilation, not static type checking.
7. Node skips: two opt-in browser smoke tests, case-sensitive path comparison
   on Windows, and a Linux-only unsupported-platform case. These are missing
   execution on the current surface, not failed tests. VitePress emitted two
   existing node_modules VueUse PURE-annotation warnings; build still passed.
   Existing VitePress entrypoint was checked before CI; ensure_docs_deps
   explicitly skipped installation. No dependency installation ran.

## Isolated local install probe

- `python -X utf8 scripts/install_projects.py --json`: exit 0; 41 catalog
  entries, exactly one `codex-context-improver`, no `agents-md-improver`.
- Standard `tempfile.mkdtemp(prefix='codex-context-improver-')` created the
  exclusive absolute project
  `C:\Users\lyh\AppData\Local\Temp\codex-context-improver-50l59twp`.
- `python -X utf8 scripts/install_projects.py --project <that path> --skill
  codex-context-improver`: exit 0. Its `.agents\skills\codex-context-improver`
  is a Junction whose target is
  `D:\Documents\Code\Agents\my-claude-code-settings\skills\developer-tools-integrations\codex-context-improver`.
- Linked SKILL.md is readable and has the new identity. Source and linked
  entry SHA256 both
  `A03C25B5F7D12F7BD5961B0990244D97E3B8A96BB5A17AA9A573A2552C8868D6`.
- An initial cleanup command combining link removal and recursive temp cleanup
  was rejected by automatic policy before execution (generic blocked-by-policy
  reason). After separately inspecting exact paths and link target, cleanup
  used non-recursive `Directory.Delete(path, false)` first for the junction,
  then each now-empty parent. All steps succeeded. `probe_exists=False`;
  source still exists with the same SHA256. No recursive traversal ran.
- No global skills root or this repository's ignored runtime live link was
  changed. Local linking does not prove remote installation or new-session
  native skill discovery; these remain missing evidence.

## Scope and acceptance trace

| Acceptance | Verified evidence / limit |
| --- | --- |
| AC1 | New identity across package/interface/manifest/IR/evals, unique entrypoint, old entry absent, installer catalog and regenerated bilingual pages. Old name remains only in dated baseline research and the explicit absence regression assertion. |
| AC2 | Actual A/B/F/G/M/N/O outputs distinguish selection, empty/shadowed/fallback/budget, uncertain configuration, metadata/body/audit reads, same-name/disabled/link uncertainty, and independent AGENTS/map decisions. No native loading proof claimed. |
| AC3 | Actual C/D/G/H/I/J/K/L responses exercise read-only/current versus historical authority, plan-only approval, continued scoped authorization, real approval source, proportional reads/tests and unavailable delegation; physical edits/checks remain unexecuted where fixtures prohibit them. |
| AC4 | Metadata, 989 initial heuristic tokens, current five-report evidence set, lyh/MIT ownership and single root pass. Factory validator intentionally remains failed only for README. Eleven obsolete reports retired, not renamed into new results. |
| AC5 | 22-case trigger smoke plus all 18 output-case reviews; failures/reruns and partial/not-exercised assertions visible. No invented provider/human claims. |
| AC6 | Target suite, links/parity, docs-sync and complete just ci pass; fixture/provider boundaries retained. |
| AC7 | Original 26 source deletions remain; only their approved derived docs cleanup occurred. No global/remote/dependency/Git-history changes. Final attribution remains main-session responsibility. |

`git status --porcelain -uall` includes new task/package/docs files and the
pre-existing untracked `skills-lock.json`. Its SHA256 remained
`C585AABE0D8EBDE0C3B4C598CFCF9015A26683A091FB87B8468F8ECEF2848EF1`.
Current-reference search after docs-sync found the old name only in version
1.2.0 provenance and the no-old-directory assertion. Archived tasks/journals
were not rewritten. No commit, archive, PR, push or publication was performed.
