# Implementation evidence

## Conditional report acceptance

### A — repository `goal-meta-skill`

- Confirmed snapshot: repo root `<repo-root>`; canonical name `goal-meta-skill`; paths `reports/skill-session-review/.input/goal-meta-skill.json`, `reports/skill-session-review/goal-meta-skill.md`, and `reports/skill-session-review/goal-meta-skill.html`; effects `create input → create Markdown → create HTML → proof-gated remove input → open HTML`. No replace was authorized.
- True source: `skills/developer-tools-integrations/goal-meta-skill/SKILL.md`, SHA-256 `a0ecb811ec7410b199b267c4c0e68288e8bdce64f0790e0bc52afcb9b0d8f9f6`.
- Scanner command:

```text
python "<repo-root>/skills/developer-tools-integrations/skill-session-review/scripts/scan_invocations.py" --skill-name goal-meta-skill --skill-path "<repo-root>/skills/developer-tools-integrations/goal-meta-skill/SKILL.md" --scope global --repo-root "<repo-root>"
```

- Strict instance-binding recheck after the final four-platform scanner repair:

| Platform | Coverage | Invoked | Loaded | Available |
| --- | --- | ---: | ---: | ---: |
| Claude | `ok` | 0 | 0 | 0 |
| Grok | `ok` | 0 | 0 | 0 |
| Codex | `ok` | 0 | 19 | 0 |
| Oh My Pi | `ok` | 0 | 0 | 0 |
| Total | all stores available | 0 | 19 | 0 |

- Total classified sessions: 19. Branch result: `unrated: no-invoked-sessions`. This supersedes the earlier 905-row check, whose name/catalog fallback did not prove the explicitly selected repository instance and is not acceptance evidence.
- The confirmed A authorization was not consumed. The workflow stopped before private slice reads, review JSON construction, input/report writers, aggregate/overall/grade/ratio calculation, or `open_report.py`.
- All three A targets were absent before and after the scan; no Git index entry exists for them. Semantic score/finding sampling is not applicable because there were no invoked sessions.

### B — deterministic browser fixture

- Confirmed snapshot: repo root `<repo-root>`; canonical name `skill-session-review-browser-fixture`; paths `reports/skill-session-review/.input/skill-session-review-browser-fixture.json`, `reports/skill-session-review/skill-session-review-browser-fixture.md`, and `reports/skill-session-review/skill-session-review-browser-fixture.html`; effects `create input → create Markdown → create HTML → proof-gated remove input → open HTML`. No replace was used.
- Input: 2,481 bytes, SHA-256 `2bda77c93c871534632d7c3acc153ce034266f927d8bc2760ca2530d44fa02ac`; proof-gated removal completed and the input is absent.
- Markdown: 2,451 bytes, SHA-256 `6b863abaaa82544d9d509c508dfaee1094895e4ff0f0147e46676d4cfb4043ee`.
- HTML: 7,072 bytes, SHA-256 `ec1a3ebd7f71ed48fac33b57cc5b08c4855bd8013d9666242387616f435f5507`.
- `open_report.py` returned `opened: true`. The actual default browser was identified by process title as `Tabbit Browser`; its user agent reported Chrome major version 151.
- Manual browser check: 100% zoom (`Control+0`), 1440×900 viewport, visual scale 1, device pixel ratio approximately 1, and `clientWidth == scrollWidth == 1425`.
- Hostile `<script>alert(1)</script>` content rendered as text; DOM `scriptCount == 0`. All four `<details>` regions were verified in expanded and collapsed states. No horizontal overflow was observed.
- Screenshot evidence: Tabbit task `SSR-B-visual`, artifact `skill-session-review-browser-fixture-open-shot-b570578e-322c-494c-bfb0-b3a2aa2a16f0.png`.
- Static self-contained checks: 2/2 passed; the HTML contained no raw `<script`, `<link`, `warp`, `factories`, or `request access` match.

## Post-removal release hardening

- The independent release audit found two blockers and the implementation was reopened: explicit `--skill-path` could still attribute a different same-name skill instance to the selected target, and proof-gated input removal checked proof before unlink without holding the report-subtree destination leases across both operations.
- Scanner repair now requires exact normalized target-instance path evidence on Claude, Grok, Codex, and Oh My Pi whenever `--skill-path` is explicit. Name-only and broad same-name fallbacks cannot bind another instance; only assistant-authored, target-bound workflow markers can promote a bound session to `invoked`. Generic step text and tool output remain non-invocation evidence. Codex session identity is the rollout filename stem. Path comparison uses host `normpath`/`normcase`, preserving POSIX case sensitivity.
- Scanner regression tests reported 17 total / 16 pass / 1 Windows-only expected skip / 0 fail. They include four-platform same-name/different-instance negatives, generic-marker negatives, exact lowercase typed-body enforcement for Codex/Oh My Pi, raw-string and non-canonical-casing rejection, complete-event tool-carrier rejection, POSIX case sensitivity, distinct fork rollout IDs, and a 250,000-character non-path performance guard. The strict production A rescan therefore remains the 19-row `unrated: no-invoked-sessions` result recorded above; it was not replaced by the rejected 905-row fallback evidence.
- Proof-gated removal now acquires the input, Markdown, and HTML destination leases in fixed order, verifies proof bytes and file identities twice while all leases are held, atomically renames the proved input to a GUID quarantine path, verifies the quarantined object, and deletes only that object. A late input replacement is restored and rejected as `input-proof-stale`; a late report replacement is rejected as `artifact-proof-stale`. Leases are released in reverse order on contention.
- Removal regressions use byte-identical, same-hash, different-file-identity replacements for both input and Markdown. Both cases are rejected and preserve the replacement. The helper's guarantee is bounded to cooperative serialization through the same lease protocol; it does not claim protection from a continuously malicious same-user process that ignores advisory locks.
- The durable source migration ledger at `research/source-migration-evidence.md` now owns the narrow facts required from the deleted sources. PRD and design citations point to that ledger rather than live missing paths; no host absolute path is recorded.
- The formal 2026-08-30 12:53 plan review completed Pass 0–7 with precheck blocking=0 and snapshot drift=0, then reported 0 blocking / 2 should-fix / 1 note. TPR-01 was closed with a shared canonical assistant-body predicate for the real Codex and Oh My Pi envelopes plus tool-bearing negatives. TPR-02 was closed by registering the migration ledger in the exhaustive design boundary and the current task-evidence/archive classification. TPR-03 was addressed by anchoring implementation-before line references to base revision `02fc877756302e14587dda108fc33a8f4b6849e6`.
- After the strict predicate fixes and `trellis-check`, the formal Pass 0–7 review at 2026-08-30 13:49 reported `可执行 — 0 blocking / 0 should-fix / 0 notes`, precheck blocking=0, and snapshot drift=0 across HEAD, status, and 50 task/product/protected hashes. The official report SHA-256 was `904d19b66fe799e7d86623d09185e716e2625eb3fb553f587145ae6e855e9587`; the later scanner findings below supersede it as a current release conclusion.

### Scanner event-order and cwd-scope release repair

- A later independent release audit found two scanner blockers. Codex and Oh My Pi accumulated canonical assistant text for the whole rollout and promoted it after any later target read, so a marker-before-read could be misclassified as `invoked`. Codex `scope=cwd` also checked cwd only when a truthy string was present, so missing or invalid `session_meta.payload.cwd` failed open.
- Codex and Oh My Pi now process JSONL events in order. Each event establishes an exact target-bound `loaded` state before its canonical assistant marker is considered; a marker observed before the target read is not buffered. Deterministic fixtures prove marker-before-read remains `loaded` and read-before-marker becomes `invoked` on both platforms.
- Codex cwd scoping now requires at least one recorded metadata cwd, requires every value to be a normalizable absolute path, and requires every normalized value to equal the confirmed repo root. Missing, NUL-invalid, relative/un-normalizable, conflicting, and mismatched values return no hit. The same six-session fixture proves `scope=global` still collects all six rollouts while `scope=cwd` retains only the matching one.
- The follow-up `trellis-check` also reproduced a narrower same-event false positive: canonical Codex assistant prose that merely spelled `Get-Content` plus the exact target path could establish `loaded` and promote its own marker without a recorded tool read. Codex target-read evidence now must occur in a tool/function carrier event; assistant prose cannot self-promote. The regression matrix also now includes Codex nested tool metadata and conflicting cwd metadata.
- Targeted scanner verification: 19 total / 18 pass / 1 Windows-only expected skip / 0 fail. `python -m py_compile` for `scan_invocations.py` passed, and the scoped `git diff --check` passed with line-ending conversion warnings only.
- No private session rescan, browser action, report writer, deleted-source read, fixed-backup read/mutation, Git staging, commit, archive, or push was performed for this repair. The 19-row A result remains historical acceptance evidence and was not recomputed. The fresh independent check is complete; formal Pass 0–7 review and final full CI remain required before the release gate can be checked again.

### Formal TPR-01 Route A predicate-separation repair

- The formal review generated at 2026-08-30 14:31 found that Codex reused the broad recursive tool-carrier predicate in two incompatible directions: it conservatively excluded assistant events containing arbitrary `tool*`/`function_call*` metadata, but also treated that same broad match as positive proof of a target read. A synthetic `toolbox_note + assistant Get-Content prose + later workflow marker` event could therefore become `invoked` without a real Codex tool/function call.
- Route A now keeps those predicates independent. The recursive predicate remains a negative assistant-event filter only. Positive Codex read evidence requires an exact `response_item` envelope, one of `custom_tool_call` / `custom_tool_call_output` / `function_call` / `function_call_output`, a supported read action, an exact target `SKILL.md` path, and evidence located only in the carrier type's allowlisted payload fields. Ordinary assistant prose, `world_state`, arbitrary tool-like metadata such as `toolbox_note`, non-whitelisted envelopes, and non-whitelisted fields cannot establish `loaded`; target-bound `world_state` may still establish `available`.
- Focused regressions cover all four real carrier types and the `toolbox_note` false-positive shape while preserving exact instance binding, canonical lowercase typed assistant text, complete-event tool exclusion, marker-before-read/read-before-marker ordering, generic-step rejection, and the cwd fail-closed/global matrix. Targeted scanner verification reports 20 total / 19 pass / 1 Windows-only expected skip / 0 fail; `python -m py_compile` for `scan_invocations.py` and repository-wide `git diff --check` both passed, with only existing LF-to-CRLF conversion warnings from Git.
- No private session rescan, browser action, report writer, deleted-source read, fixed-backup read or mutation, Git staging, commit, archive, or push was performed. Fresh independent review and final full CI remain required before release closeout.

### Codex path/action collision repair

- The subsequent release audit found that action matching still ran across the same carrier text that contained the target path. A path segment named `rg`, `cat`, `read_file`, `read_text`, or `get-content` could therefore supply the apparent action even when an allowlisted result carried only the path, allowing a later marker to become `invoked` without a real read command.
- `codex_has_target_read` now binds the exact recorded target path first, masks every recorded `SKILL.md` path span, and searches for a supported read action only in the remaining carrier text. Real allowlisted action-plus-path carriers remain positive; path-only carriers cannot manufacture their own action.
- The new five-case fixture uses each action token as the target directory name, seeds only the lower `available` state, emits a path-only `custom_tool_call_output`, then emits a canonical marker. All five remain `available`. The complete scanner suite now reports 21 total / 20 pass / 1 Windows-only expected skip / 0 fail; Python compile also passes.
- A follow-up adversarial pass found two extractor defects: JSON command strings without inner path quotes were masked as one quoted path and lost their real action, while a quoted path containing spaces was rescanned by the bare regex and emitted a false suffix that could bind another instance. The scanner now derives identity and masking from one ordered, non-overlapping span set. Four JSON-carrier positives and a cwd-controlled quoted other-instance/suffix-collision negative cover both defects; the scanner suite now reports 23 total / 22 pass / 1 Windows-only expected skip / 0 fail.
- A second adversarial probe showed that JSON-escaped double quotes (`\"...\"`) around a spaced path still defeated the raw quoted regex. The shared extractor now recognizes escaped wrappers before raw wrappers and excludes both from later bare extraction. Four escaped-carrier positives, an escaped other-instance collision negative, and direct Windows/POSIX span fixtures pass; the scanner suite now reports 25 total / 24 pass / 1 Windows-only expected skip / 0 fail.
- A nested-encoding probe then reproduced the suffix collision with a multi-backslash escaped wrapper. The escaped wrapper recognizer now accepts one or more escaping backslashes on both quote boundaries. A double-encoded target/other pair proves the target becomes `invoked` while the other instance remains only `available`; the scanner suite now reports 26 total / 25 pass / 1 Windows-only expected skip / 0 fail.
- No private session rescan, browser action, report writer, deleted-source read, fixed-backup read or mutation, Git staging, commit, archive, or push was performed for this repair. The latest formal report remains stale until a fresh Pass 0–7 review is generated.

### External-task archive drift rebase

- The formal review generated at 2026-08-30 15:24 found that the historical protected active 9-row contract had become impossible after the external task completed independently. Commit `35648631` archived `08-29-goal-meta-single-pass-repair`; HEAD `f6d21107` recorded its journal. The old active root is absent and must not be restored.
- Historical evidence remains valid: before the external closeout, all nine fixed rows stayed `??`, unstaged, non-reparse, and byte-identical throughout this task's prior broad commands. It is retained as history, not as a future existence gate.
- Current isolation baseline: `.trellis/tasks/archive/2026-08/08-29-goal-meta-single-pass-repair/` contains 12 tracked regular files, is worktree/index clean, and has ordered content manifest SHA-256 `9b28cd1f908f1403b8194d406051fb3695abd7585e6a3176bcd532e8a5fe0059`. The unrelated tracked modification `.github/workflows/agentkit-desktop.yml` is the current protected external dirty row (` M`) with SHA-256 `115d803439c8e7aa551445d352b45b83c55d6dbaba417e37629c23410a1e72bf`.
- Future broad commands compare both baselines before and after in one PowerShell process. This task never writes, stages, commits, or archives either external target; Phase 3.4 recaptures live owned files and lists the workflow separately from unrecognized dirt.
- The formal review generated at 2026-08-30 15:39 found one remaining guard-order blocker: descendant enumeration did not prove that the unresolved archive root itself was checked for `ReparsePoint`. Route A now performs `Get-Item -LiteralPath` on the exact unresolved root before `Resolve-Path`, checks the canonical path before recursion, and preserves the descendant, manifest, Git-clean, and protected-workflow gates.
- `.trellis/tasks/08-29-consolidate-skill-review/scripts/test-external-root-guard.ps1` is the task-scoped root-order regression fixture. Its Windows junction run returned `normal_canonical=true`, `junction_is_reparse=true`, `junction_rejected=true`, and `junction_rejected_before_enumeration=true`; cleanup removed only the exact empty fixture paths from leaf to root without recursive deletion.
- Fresh formal Pass 0–7 review generated at `2026-08-30T15:56:00.3547312+08:00` concluded `可执行 — blocking 0 / should-fix 0 / notes 0`; report SHA-256 is `8cfd6af46dc103e7a31bc2e4aa2b24dbd2a65f3843fa8699e860a3082259dbd0`. Its complete `just ci` run reported 410 total / 407 pass / 3 skip / 0 fail. The root-aware external snapshot was identical before and after: archived manifest `9b28cd1f908f1403b8194d406051fb3695abd7585e6a3176bcd532e8a5fe0059`, protected workflow ` M` with SHA-256 `115d803439c8e7aa551445d352b45b83c55d6dbaba417e37629c23410a1e72bf`, and empty index.
- Phase 3.4 one-shot confirmation was granted as `按计划提交`. Exact-path local commits completed in order: `79c4fb12ec665270097e444cdd06be1e87678484` (`docs(spec)`), `e017fee997993316ea02f330d1c04a8d45df292a` (`feat(skill-session-review)`), and `aed9a5354289298912951a7c5a1cc3e2c512c8a4` (`docs(skills)`). Each cached set exactly matched its approved file list; each commit used local `git commit -F`; no amend, push, task evidence, external archive, or protected workflow path entered a work commit. The final index was empty and the external manifest/workflow identity remained unchanged.
- Archive preflight reloaded the single task-scoped inventory implementation under the mutation lease and verified the fixed backup as governed `28/d8aaae56cf834141b81d658308a48ad503dd522d5c057ddce3a67ff352e16290` and physical `34/f531893622531b73c16b2829f8065b3665d3a5d7926d0b0f1b34f6f82b675c21`. Both repository source directories remained absent, the root-junction fixture remained 4/4, the index was empty, and the external archive/workflow identities were unchanged. Together with the fresh 410/407/3/0 CI and 0/0/0 formal review, all root-task AC gates were satisfied before lifecycle transition.

## Source removal evidence

- Removal occurred after source migration, scanner repair, focused tests, conditional A evaluation, B browser acceptance, and final plan review `可执行 — 0/0/0`.
- Removal execution evidence: `.removed` created at 2026-08-30T11:47:30.5548078+08:00; actual-final revalidated under the task mutation lock at 2026-08-30T11:48:12+08:00.
- Stable backup placeholder: `%USERPROFILE%/.claude-skill-backup/08-29-consolidate-skill-review`. No host absolute backup path is recorded.
- Algorithm: recursively enumerate regular files; governed inventory excludes any path segment equal to `__pycache__`, physical inventory excludes nothing; normalize paths to relative POSIX form; sort by path with ordinal comparison; encode each row as `<lowercase-file-sha256><two spaces><path>\n`; hash the BOM-free UTF-8 manifest with SHA-256.
- Initial backup preparation self-tests covered first/second copy failure cleanup, subsequent success, verified reuse, physical drift rejection, and lock cleanup. The production prepare state was `backup-verified-reused` with invocation-owned staging clean.
- Removal self-test result: all passed, including first/second delete failure recovery, verified-reused retry, `unexpected.bin` physical-drift rejection, lock-contention rejection, unchanged source/final/staging identities, and lock cleanup.
- Production removal result: `state=removed`, `removed_copy_mode=prepared`, both `skill-doctor` and `update-skill` are missing from the repository, `failed_source_index=null`, `failure_phase=null`, `failure_category=null`, and invocation-owned `.removed.staging-*` is clean.
- Protected external set: all 9 fixed files remained `??`, full SHA-256 values were unchanged, no reparse point was observed, and the protected index count remained 0.
- `just docs-sync` completed with 80 skill detail pages and 87 generated files; only the Chinese and English `skill-session-review` detail pages changed. The protected external set was unchanged across the command.
- Full `just ci` completed successfully after the release-hardening fixes and canonical typed-body tightening: docs catalog and VitePress build passed, all 40 skills passed metadata validation, 59 Python files byte-compiled, Node tests reported 388 total / 385 pass / 3 skip / 0 fail, and `git diff --check` passed with line-ending conversion warnings only. The protected external set was unchanged across the command (`JUST_CI_PROTECTED_OK`).
- The fixed backup was revalidated after full CI at 2026-08-30T11:52:36+08:00 as governed `28/d8aaae56cf834141b81d658308a48ad503dd522d5c057ddce3a67ff352e16290` and physical `34/f531893622531b73c16b2829f8065b3665d3a5d7926d0b0f1b34f6f82b675c21`; lock cleanup succeeded and both repository source directories remained absent.
- `trellis-update-spec` review captured the reusable proof-gated removal and cooperative-lease safety contract in `.trellis/spec/backend/governed-report-subtree-writing.md` and linked it from the backend spec index. Scanner target/path identity remains a product-specific executable contract owned by `references/invocation-signals.md`, R2.14, design §3.3a, implement 2.10a, and AC46.

### Identity summary

| Identity | Count | SHA-256 |
| --- | ---: | --- |
| Governed source | 14 | `f1b179a6754fa5f555f65d5ed35eb2304bea7fb9ff388c37cf84905ead9ae48e` |
| Physical source | 17 | `05f29ffa61cde14b4c6200a76c22f04766a37d1fc97ecce6f034b3f0b0676ca8` |
| Governed virtual-final | 28 | `d8aaae56cf834141b81d658308a48ad503dd522d5c057ddce3a67ff352e16290` |
| Governed actual-final | 28 | `d8aaae56cf834141b81d658308a48ad503dd522d5c057ddce3a67ff352e16290` |
| Physical virtual-final | 34 | `f531893622531b73c16b2829f8065b3665d3a5d7926d0b0f1b34f6f82b675c21` |
| Physical actual-final | 34 | `f531893622531b73c16b2829f8065b3665d3a5d7926d0b0f1b34f6f82b675c21` |

### Governed source manifest — 14 rows

```text
2cd9eb4d0a707320211e536456bb541eb7d737388f559bb2688bdcf50dcd512b  skill-doctor/SKILL.md
317d05eb4d97faab47dabb029b074bece64b457dbe17b06490315fcc173d3525  skill-doctor/assets/pierre-diffs.js
cbf3e7d8bffb3133e323e09f85906e6be4ccda285b490ab366d174c7ce291848  skill-doctor/assets/warp-pixel-icon.svg
ec7ac264ec719380e8473a331abba5689aaf89c1e5eb6b0bf1e3198603af7d11  skill-doctor/references/skill-improvements.md
a0237538ea615b02b9e643abef036edd9100d05613b782e3412f4add96b6040f  skill-doctor/references/supported-harnesses.md
8d53db1c0a708519444dd2a9295f0dd52054cda7ee4fcb7cbcc5b1fa615ac798  skill-doctor/scorers/code-quality.md
35332dc761e31f0086568bbae529005f98358359a288a86d20bf7e921aae298e  skill-doctor/scorers/efficiency.md
2fd0232ce47a42aa626e3b9e39d76dd5cab20c294240ed2d5b0111fef5612662  skill-doctor/scripts/collect_sessions.py
c20a3c7d8651a2ec25c0b6fc15d75c42a083e794475054904898851ccf6efef9  skill-doctor/scripts/render_report.py
9f46c49f7d7cf7f1b19a36b7f473f25386502e82a353a60d85925a771ca039cf  skill-doctor/scripts/test_collect_sessions.py
4f366a3a1cea0ffba5bcec1fd066dcb7e30418c28bf889adad025f15f4789606  skill-doctor/scripts/test_render_report.py
afc99fe98306c1a0dd537ef63a23ec891ff7e9f7146410e6a5e4cda86f3fdf83  skill-doctor/scripts/warp_decoder.py
93d57602e1fcd4babbb52fe1e4c89b21e8b5da492ac39f4b8ef46fe3f6c2da0a  update-skill/SKILL.md
f8efa6adef85f01646347b0b5da7f5d29596961782ec7c0c59c658bb4cc1f157  update-skill/references/best-practices.md
```

### Physical source manifest — 17 rows

```text
2cd9eb4d0a707320211e536456bb541eb7d737388f559bb2688bdcf50dcd512b  skill-doctor/SKILL.md
317d05eb4d97faab47dabb029b074bece64b457dbe17b06490315fcc173d3525  skill-doctor/assets/pierre-diffs.js
cbf3e7d8bffb3133e323e09f85906e6be4ccda285b490ab366d174c7ce291848  skill-doctor/assets/warp-pixel-icon.svg
ec7ac264ec719380e8473a331abba5689aaf89c1e5eb6b0bf1e3198603af7d11  skill-doctor/references/skill-improvements.md
a0237538ea615b02b9e643abef036edd9100d05613b782e3412f4add96b6040f  skill-doctor/references/supported-harnesses.md
8d53db1c0a708519444dd2a9295f0dd52054cda7ee4fcb7cbcc5b1fa615ac798  skill-doctor/scorers/code-quality.md
35332dc761e31f0086568bbae529005f98358359a288a86d20bf7e921aae298e  skill-doctor/scorers/efficiency.md
58a129e268c75ef06c910b4f6ffd8c3769c1dceffe6c25eee0ceb742a9c7cc1e  skill-doctor/scripts/__pycache__/collect_sessions.cpython-314.pyc
a7fd8e1ffff012f7e84ed48265750a75ebf4806a96fa4473e605ec066f02dacc  skill-doctor/scripts/__pycache__/render_report.cpython-314.pyc
2edb02c6bd8db66f2626669b30e2a657352929ad4cd80a96b14c2bc549574b18  skill-doctor/scripts/__pycache__/warp_decoder.cpython-314.pyc
2fd0232ce47a42aa626e3b9e39d76dd5cab20c294240ed2d5b0111fef5612662  skill-doctor/scripts/collect_sessions.py
c20a3c7d8651a2ec25c0b6fc15d75c42a083e794475054904898851ccf6efef9  skill-doctor/scripts/render_report.py
9f46c49f7d7cf7f1b19a36b7f473f25386502e82a353a60d85925a771ca039cf  skill-doctor/scripts/test_collect_sessions.py
4f366a3a1cea0ffba5bcec1fd066dcb7e30418c28bf889adad025f15f4789606  skill-doctor/scripts/test_render_report.py
afc99fe98306c1a0dd537ef63a23ec891ff7e9f7146410e6a5e4cda86f3fdf83  skill-doctor/scripts/warp_decoder.py
93d57602e1fcd4babbb52fe1e4c89b21e8b5da492ac39f4b8ef46fe3f6c2da0a  update-skill/SKILL.md
f8efa6adef85f01646347b0b5da7f5d29596961782ec7c0c59c658bb4cc1f157  update-skill/references/best-practices.md
```

### Governed virtual-final and actual-final manifest — 28 rows

```text
2cd9eb4d0a707320211e536456bb541eb7d737388f559bb2688bdcf50dcd512b  .removed/skill-doctor/SKILL.md
317d05eb4d97faab47dabb029b074bece64b457dbe17b06490315fcc173d3525  .removed/skill-doctor/assets/pierre-diffs.js
cbf3e7d8bffb3133e323e09f85906e6be4ccda285b490ab366d174c7ce291848  .removed/skill-doctor/assets/warp-pixel-icon.svg
ec7ac264ec719380e8473a331abba5689aaf89c1e5eb6b0bf1e3198603af7d11  .removed/skill-doctor/references/skill-improvements.md
a0237538ea615b02b9e643abef036edd9100d05613b782e3412f4add96b6040f  .removed/skill-doctor/references/supported-harnesses.md
8d53db1c0a708519444dd2a9295f0dd52054cda7ee4fcb7cbcc5b1fa615ac798  .removed/skill-doctor/scorers/code-quality.md
35332dc761e31f0086568bbae529005f98358359a288a86d20bf7e921aae298e  .removed/skill-doctor/scorers/efficiency.md
2fd0232ce47a42aa626e3b9e39d76dd5cab20c294240ed2d5b0111fef5612662  .removed/skill-doctor/scripts/collect_sessions.py
c20a3c7d8651a2ec25c0b6fc15d75c42a083e794475054904898851ccf6efef9  .removed/skill-doctor/scripts/render_report.py
9f46c49f7d7cf7f1b19a36b7f473f25386502e82a353a60d85925a771ca039cf  .removed/skill-doctor/scripts/test_collect_sessions.py
4f366a3a1cea0ffba5bcec1fd066dcb7e30418c28bf889adad025f15f4789606  .removed/skill-doctor/scripts/test_render_report.py
afc99fe98306c1a0dd537ef63a23ec891ff7e9f7146410e6a5e4cda86f3fdf83  .removed/skill-doctor/scripts/warp_decoder.py
93d57602e1fcd4babbb52fe1e4c89b21e8b5da492ac39f4b8ef46fe3f6c2da0a  .removed/update-skill/SKILL.md
f8efa6adef85f01646347b0b5da7f5d29596961782ec7c0c59c658bb4cc1f157  .removed/update-skill/references/best-practices.md
2cd9eb4d0a707320211e536456bb541eb7d737388f559bb2688bdcf50dcd512b  skill-doctor/SKILL.md
317d05eb4d97faab47dabb029b074bece64b457dbe17b06490315fcc173d3525  skill-doctor/assets/pierre-diffs.js
cbf3e7d8bffb3133e323e09f85906e6be4ccda285b490ab366d174c7ce291848  skill-doctor/assets/warp-pixel-icon.svg
ec7ac264ec719380e8473a331abba5689aaf89c1e5eb6b0bf1e3198603af7d11  skill-doctor/references/skill-improvements.md
a0237538ea615b02b9e643abef036edd9100d05613b782e3412f4add96b6040f  skill-doctor/references/supported-harnesses.md
8d53db1c0a708519444dd2a9295f0dd52054cda7ee4fcb7cbcc5b1fa615ac798  skill-doctor/scorers/code-quality.md
35332dc761e31f0086568bbae529005f98358359a288a86d20bf7e921aae298e  skill-doctor/scorers/efficiency.md
2fd0232ce47a42aa626e3b9e39d76dd5cab20c294240ed2d5b0111fef5612662  skill-doctor/scripts/collect_sessions.py
c20a3c7d8651a2ec25c0b6fc15d75c42a083e794475054904898851ccf6efef9  skill-doctor/scripts/render_report.py
9f46c49f7d7cf7f1b19a36b7f473f25386502e82a353a60d85925a771ca039cf  skill-doctor/scripts/test_collect_sessions.py
4f366a3a1cea0ffba5bcec1fd066dcb7e30418c28bf889adad025f15f4789606  skill-doctor/scripts/test_render_report.py
afc99fe98306c1a0dd537ef63a23ec891ff7e9f7146410e6a5e4cda86f3fdf83  skill-doctor/scripts/warp_decoder.py
93d57602e1fcd4babbb52fe1e4c89b21e8b5da492ac39f4b8ef46fe3f6c2da0a  update-skill/SKILL.md
f8efa6adef85f01646347b0b5da7f5d29596961782ec7c0c59c658bb4cc1f157  update-skill/references/best-practices.md
```

### Physical virtual-final and actual-final manifest — 34 rows

```text
2cd9eb4d0a707320211e536456bb541eb7d737388f559bb2688bdcf50dcd512b  .removed/skill-doctor/SKILL.md
317d05eb4d97faab47dabb029b074bece64b457dbe17b06490315fcc173d3525  .removed/skill-doctor/assets/pierre-diffs.js
cbf3e7d8bffb3133e323e09f85906e6be4ccda285b490ab366d174c7ce291848  .removed/skill-doctor/assets/warp-pixel-icon.svg
ec7ac264ec719380e8473a331abba5689aaf89c1e5eb6b0bf1e3198603af7d11  .removed/skill-doctor/references/skill-improvements.md
a0237538ea615b02b9e643abef036edd9100d05613b782e3412f4add96b6040f  .removed/skill-doctor/references/supported-harnesses.md
8d53db1c0a708519444dd2a9295f0dd52054cda7ee4fcb7cbcc5b1fa615ac798  .removed/skill-doctor/scorers/code-quality.md
35332dc761e31f0086568bbae529005f98358359a288a86d20bf7e921aae298e  .removed/skill-doctor/scorers/efficiency.md
58a129e268c75ef06c910b4f6ffd8c3769c1dceffe6c25eee0ceb742a9c7cc1e  .removed/skill-doctor/scripts/__pycache__/collect_sessions.cpython-314.pyc
a7fd8e1ffff012f7e84ed48265750a75ebf4806a96fa4473e605ec066f02dacc  .removed/skill-doctor/scripts/__pycache__/render_report.cpython-314.pyc
2edb02c6bd8db66f2626669b30e2a657352929ad4cd80a96b14c2bc549574b18  .removed/skill-doctor/scripts/__pycache__/warp_decoder.cpython-314.pyc
2fd0232ce47a42aa626e3b9e39d76dd5cab20c294240ed2d5b0111fef5612662  .removed/skill-doctor/scripts/collect_sessions.py
c20a3c7d8651a2ec25c0b6fc15d75c42a083e794475054904898851ccf6efef9  .removed/skill-doctor/scripts/render_report.py
9f46c49f7d7cf7f1b19a36b7f473f25386502e82a353a60d85925a771ca039cf  .removed/skill-doctor/scripts/test_collect_sessions.py
4f366a3a1cea0ffba5bcec1fd066dcb7e30418c28bf889adad025f15f4789606  .removed/skill-doctor/scripts/test_render_report.py
afc99fe98306c1a0dd537ef63a23ec891ff7e9f7146410e6a5e4cda86f3fdf83  .removed/skill-doctor/scripts/warp_decoder.py
93d57602e1fcd4babbb52fe1e4c89b21e8b5da492ac39f4b8ef46fe3f6c2da0a  .removed/update-skill/SKILL.md
f8efa6adef85f01646347b0b5da7f5d29596961782ec7c0c59c658bb4cc1f157  .removed/update-skill/references/best-practices.md
2cd9eb4d0a707320211e536456bb541eb7d737388f559bb2688bdcf50dcd512b  skill-doctor/SKILL.md
317d05eb4d97faab47dabb029b074bece64b457dbe17b06490315fcc173d3525  skill-doctor/assets/pierre-diffs.js
cbf3e7d8bffb3133e323e09f85906e6be4ccda285b490ab366d174c7ce291848  skill-doctor/assets/warp-pixel-icon.svg
ec7ac264ec719380e8473a331abba5689aaf89c1e5eb6b0bf1e3198603af7d11  skill-doctor/references/skill-improvements.md
a0237538ea615b02b9e643abef036edd9100d05613b782e3412f4add96b6040f  skill-doctor/references/supported-harnesses.md
8d53db1c0a708519444dd2a9295f0dd52054cda7ee4fcb7cbcc5b1fa615ac798  skill-doctor/scorers/code-quality.md
35332dc761e31f0086568bbae529005f98358359a288a86d20bf7e921aae298e  skill-doctor/scorers/efficiency.md
58a129e268c75ef06c910b4f6ffd8c3769c1dceffe6c25eee0ceb742a9c7cc1e  skill-doctor/scripts/__pycache__/collect_sessions.cpython-314.pyc
a7fd8e1ffff012f7e84ed48265750a75ebf4806a96fa4473e605ec066f02dacc  skill-doctor/scripts/__pycache__/render_report.cpython-314.pyc
2edb02c6bd8db66f2626669b30e2a657352929ad4cd80a96b14c2bc549574b18  skill-doctor/scripts/__pycache__/warp_decoder.cpython-314.pyc
2fd0232ce47a42aa626e3b9e39d76dd5cab20c294240ed2d5b0111fef5612662  skill-doctor/scripts/collect_sessions.py
c20a3c7d8651a2ec25c0b6fc15d75c42a083e794475054904898851ccf6efef9  skill-doctor/scripts/render_report.py
9f46c49f7d7cf7f1b19a36b7f473f25386502e82a353a60d85925a771ca039cf  skill-doctor/scripts/test_collect_sessions.py
4f366a3a1cea0ffba5bcec1fd066dcb7e30418c28bf889adad025f15f4789606  skill-doctor/scripts/test_render_report.py
afc99fe98306c1a0dd537ef63a23ec891ff7e9f7146410e6a5e4cda86f3fdf83  skill-doctor/scripts/warp_decoder.py
93d57602e1fcd4babbb52fe1e4c89b21e8b5da492ac39f4b8ef46fe3f6c2da0a  update-skill/SKILL.md
f8efa6adef85f01646347b0b5da7f5d29596961782ec7c0c59c658bb4cc1f157  update-skill/references/best-practices.md
```
