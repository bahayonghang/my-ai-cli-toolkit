# Goal Meta Skill 0.8.0 creation handoff

## 0.8.1 maintenance — 2026-09-05

Ordinary bilingual examples and the persistent schema now require deliverable
existence, named-entry behavior, required checks, and authorized diff/status
together. Missing checks/access or exhausted rounds remain incomplete. Pause
categories, Trellis rules, compile-only authority, and same-turn authorized
create-only persistence are unchanged. The package version, Skill IR, linter
metadata check, and contract test metadata are aligned to 0.8.1; the historical
0.8.0 evidence below remains dated evidence, not a claim about this patch.

Local regression evidence: both Node suites pass 64/64; Python compilation
passes. Added ordinary behavior evals 50–56 are review cases, not provider runs.
Description/interface routing is unchanged, so trigger evaluation is not
applicable to this maintenance patch. Actual installation/new-session discovery,
provider compliance, human blind review and telemetry remain missing evidence.
Full repository CI and discovery disposition are owned by the parent task.

## Result

`goal-meta-skill` 0.8.0 compiles vague work into reviewable,
platform-correct `/goal` text and, only after the governed file-write
confirmation, can persist one approved root `GOAL.md` handoff through a guarded
writer. It never creates, activates, submits, dispatches, or executes a Goal;
both draft and approved text are terminal review states. Local path:
`skills/developer-tools-integrations/goal-meta-skill/`. Publication status:
local repository implementation; no PR, merge, release, or install claim.

## 0.8.0 change

Review/scan remediation is now an explicit opt-in Goal-authoring profile. One
approved external Prompt freezes the scanner/config/input/target/report/Git
envelope, owns a stable finding ledger, sends independent checker `FINDINGS`
back to implementation inside the same task, reruns the original scanner, and
forbids requesting or emitting a second repair Prompt. Ordinary Goal lint and
pure read-only review retain their existing routes.

The generated execution contract names the only structured question gate:
before first product write, Claude Code may use `AskUserQuestion` only for an
unresolved user-owned choice that materially changes scope, risk, cost, public
behavior, or authorization. Same-scope findings and routine implementation do
not qualify. This wording does not add that tool to the meta-skill itself.

Convergence is bounded to three focused rounds. Two no-progress rounds for one
finding signature or residual actionable findings after round three end
`BLOCKED` with the ledger; they never become completion or a new handoff. The
new `--review-remediation` linter profile applies fail-closed checks to both
inline text and persisted contracts while remaining opt-in for compatibility.

Qiaomu alignment follows the repository-native package contract: trigger cases
and their generated report live under the Trellis task, not as a second package
eval schema. No per-skill README or manifest was added. Qiaomu validator/release
schema differences remain `missing evidence`, not a pass.

The Qiaomu raw IR exporter is diagnostic only for this package. Without the
forbidden per-skill manifest it produces a useful schema skeleton but leaves
governance, intent, trigger, workflow, and gate fields empty; it must never
overwrite the canonical report or count as the final IR gate. The checked-in
report receives a deterministic repository-native enrichment, then the task's
`research/assert_skill_ir.py` fails closed unless version `0.8.0`, governed
lifecycle, permissions, gates, trigger groups, workflow groups, and evidence
limits are non-empty and no host absolute path is present.

## 0.7.1 change

Trellis implementation Prompt text now exposes its subagent preference in the
first `/goal` statement: default-on when the user is silent or ambiguous,
explicitly disabled only after a clear user opt-out, or retained as default-on
with a named inline technical-fallback reason when project/platform capability
prevents dispatch. The linter rejects missing and contradictory first/later
states.

Task closeout now commits both the current task's related product changes and
the planning artifacts under that concrete task directory, confirms both are
in version history, excludes unrelated active/untracked task directories and
out-of-scope dirty files, and only then runs `task.py archive`. Product/planning
work may be split into semantically clear Conventional Commits; the archive
move/state update remains a separate archive commit. Child tasks repeat the
loop, and parents still wait for their children plus the named release gate.

## 0.7.0 change

The root contract now enforces `compile → lint → present → stop`. An initial
request always ends with `状态：DRAFT — Goal 未创建、未激活、未执行`; imperative
phrases such as “请实施” or “直到完成” remain payload. A later approval produces
`APPROVED TEXT — not launched` and stops again. Goal activation is a separate
user action outside the skill.

The same boundary is repeated in `agents/interface.yaml` with
`goal_activation: forbid`, the ordinary and persistent output references, two
recorded behavior fixtures, and a deterministic Node package-contract test.
Persistence may still write a separately confirmed approved contract through
the existing helper, but the returned launcher remains fenced text and is not
submitted. Management commands are also displayed as fenced text only.

## 0.6.0 change

Trellis implementation `/goal` text now requires `trellis-implement` for
code and `trellis-check` for verification, unless the target project is in
inline mode. The requirement covers the cadence adapter, playbook templates,
linter, and evals. Ordinary tasks and inline-mode platforms do not receive
dispatch clauses.

Pre-existing Trellis `GOAL.md` contracts that lack dispatch wording fail the
new linter. That failure is expected.

## Reference skills studied

- [imbajin/goal-prompt](https://github.com/imbajin/goal-prompt/blob/master/skills/goal-prompt/SKILL.md): shortlisted for initialization confirmation, path validation and durable task state. On 2026-08-23, skills.sh CLI showed 28 installs while its page showed 25; this mutable signal is not a rating. The confirmation/path mechanisms appear in `persistent-goal-contract.md` and `persist_goal_contract.py`.
- [oh-my-claudecode ultragoal](https://github.com/Yeachan-Heo/oh-my-claudecode/blob/main/skills/ultragoal/SKILL.md): shortlisted for separating session `/goal` from durable repository state and preserving full objectives. SkillsMP exposed repository-star metadata, not a skill-quality rating. The separation appears in the neutral contract plus thin renderer design.
- [ToolMonsters handoff](https://github.com/ToolMonsters/handoff-skill/blob/main/SKILL.md): shortlisted for a stranger-readable single Markdown handoff with exact paths/names. GitHub showed 36 stars and one commit on 2026-08-23, so maintenance depth remains uncertain. The concise Required reading/current context section adapts this mechanism without copying transcripts.
- [fmaher agent-handoff](https://github.com/fmaher/agent-skills/blob/main/skills/agent-handoff/SKILL.md): shortlisted for durable prompt plus short pointer. Rating and maintenance evidence were unavailable. Its two-layer delivery appears in `GOAL.md` plus the selected platform launcher.

## Absorbed and rejected

- Keep: read-only reconnaissance, explicit confirmation, short pointer, exact
  required reading, bounded verification, and a stable approved contract.
- Adapt: one root immutable contract replaces multi-file task-state bundles;
  platform-neutral content is paired with five lifecycle-correct launchers.
- Reject: automatic `GOAL.md` loading claims, raw transcript copying, memory or
  progress ledgers, multi-goal schedulers, persistent AGENTS/CLAUDE imports,
  silent overwrite, and automatic Git actions.
- Invent: create-only plus expected-hash replace, root containment,
  symlink/reparse refusal, strict UTF-8/LF, no-body JSON results, Git visibility,
  secret backstop, and baseline drift guard in one standard-library helper.
- 0.6.0 keep: commit-then-archive and parent 发布门 wording in both Trellis
  playbook templates.
- 0.6.0 reject: editing `.trellis/workflow.md`, hooks, or
  `platform-goal-facts.md` to force dispatch. Dispatch is a Trellis fact in
  `trellis-goal-cadence.md`.
- 0.7.0 keep: the existing Goal body fields, platform lifecycle facts,
  persistence schema, Trellis cadence, and guarded writer.
- 0.7.0 reject: treating a prompt's imperative payload, text approval, file
  persistence, or a management request as authority to call a host Goal
  facility or submit a slash command.
- 0.7.0 invent: a cross-host text state machine (`DRAFT` → `APPROVED TEXT — not
  launched` → outside-skill user activation) backed by root/interface/eval/test
  continuity checks.
- 0.7.1 keep: the review-before-activation gate, concrete Trellis task binding,
  dispatch capability boundary, Conventional Commit policy, separate archive
  commit, and parent release gate.
- 0.7.1 adapt: promote the screenshot's hidden dispatch preference into one
  first-statement three-state switch, and expand task closeout from product-only
  commit to current-task product plus planning artifacts without claiming all
  untracked `.trellis/tasks/` directories.
- 0.7.1 reject: inferring opt-out from silence, silently degrading to inline,
  forcing subagents on an incapable platform, mixing unrelated task directories
  into a commit, or folding product/planning changes into the archive commit.
- 0.8.0 keep: bounded evidence-driven iteration, independent checking,
  review-before-activation, the Trellis dispatch switch, and separate closeout.
- 0.8.0 adapt: combine a frozen scan envelope, stable finding ledger, and
  checker-to-implementation feedback edge inside one externally approved Goal.
- 0.8.0 reject: external loop frameworks, broker/DAG dependencies, unlimited
  retries, question-per-finding behavior, or post-check repair handoff prompts.
- 0.8.0 invent: the negative question gate, same-signature stall state,
  conjunctive zero-open completion, and an opt-in fail-closed linter profile.

## Advantages and evidence

- `design advantage`: separating prompt compilation, text approval, governed
  persistence, and Goal activation gives every state one explicit authority
  boundary and removes the screenshot's ambiguous generation-to-execution
  transition.
- `validated advantage`: local static contracts and deterministic Node tests
  require the root review gate, exact status labels, imperative-as-payload
  wording, narrow allowed tools, interface `goal_activation: forbid`, and eval
  ids 36/37. The targeted results are 29/29 lint/package tests and 12/12
  persistence tests.
- `recorded fixture`: eval 36 reproduces the user-provided Trellis “请实施直到完成”
  shape, while eval 37 covers approval after review. These are review fixtures,
  not provider/model execution evidence.
- `missing evidence`: no post-fix Cursor provider transcript, cross-platform
  compliance rate, telemetry, or human blind review exists. The screenshot
  proves the pre-fix occurrence only.
- `design advantage`: putting dispatch into user-pasted `/goal` text matches
  the host predicate "the user requested AgentTool", so the skill does not
  compete with the Claude Code system prompt or repository hooks. Evidence:
  `research/host-directive-and-breadcrumb-evidence.md` in task
  `08-25-goal-meta-subagent-dispatch`.
- `validated advantage`: generated Trellis templates contain dispatch
  clauses; the linter reports an error when Trellis implementation text omits
  them and passes inline-mode and non-Trellis text; evals 15, 16, and 29
  require dispatch; eval 17 forbids it; evals 34 and 35 cover inline
  exceptions. Evidence is local `just node-test` and `just ci` only. Do not
  describe this as provider or model compliance.
- `hypothesis`: whether dispatch clauses raise the executing agent's
  dispatch rate remains unobserved. After a new session runs a generated
  Trellis `/goal`, compare Task/Agent calls and main-session edits with the
  baseline table in `research/host-directive-and-breadcrumb-evidence.md`. Do
  not describe this rate change as validated.
- `validated advantage`: deterministic linter/package tests cover default-on,
  explicit opt-out, explained capability fallback, first/later consistency,
  current-task product-and-planning commits before archive, and non-Trellis
  negative routing. Evals 38–41 record the Cursor-like long Prompt, default
  silence, explicit opt-out, and `codex.dispatch_mode: inline` fallback. These
  fixtures remain local `recorded_fixture` evidence, not provider compliance.
- `validated advantage`: 0.8.0 deterministic tests cover complete inline and
  persisted review-remediation contracts, every scan-envelope field,
  checker feedback, no-second-Prompt wording, the question gate, same-envelope
  rescan, drift, stall, round cap, opt-out/fallback, and read-only routing.
- `recorded fixture`: evals 42–47 cover the output boundary and the task-local
  Qiaomu trigger gate covers 19 routing cases, including the negated
  “不要生成第二条修复 Prompt” trigger. Neither executes a provider.
- `hypothesis`: one externally approved Prompt plus internal feedback reduces
  real repair Prompt count and user-launched validation rounds.
- `missing evidence`: provider-backed before/after runs, blind human review,
  fresh-Agent execution, repair-count telemetry, and strict two-catalog
  deduplication remain unavailable.

## Verification and limits

- 0.8.0 targeted goal-meta tests: passed, 63/63 (51 linter/package-contract,
  12 persistence).
- 0.8.0 repository skill metadata validation: passed.
- 0.8.0 targeted Python byte compilation: passed for both bundled helpers.
- 0.8.0 Qiaomu task-local trigger gate: passed, 19/19 with no false positive
  or false negative at threshold 0.34.
- 0.8.0 repository-native Skill IR assertion: passed for version `0.8.0`,
  governed lifecycle, non-empty permissions/gates/triggers/workflow, bounded
  local evidence, and no host absolute path. Raw Qiaomu export remains a
  diagnostic skeleton rather than final evidence.
- 0.8.0 full repository `just ci`: passed, including docs catalog/build,
  metadata validation, Python compilation, the full Node suite, and
  `git diff --check`.
- Qiaomu `validate_skill.py` / local `release_check.py` remain expected
  `missing evidence` when their nonzero output is limited to absent per-skill
  `README.md`, `manifest.json`, or the incompatible package trigger schema.
  Repository-local rules deliberately forbid adding those ceremonial files.
- Provider-backed Codex/Claude/Grok/OMP/Kimi runs, human blind review,
  fresh-Agent execution, public install, release, and convergence telemetry:
  `missing evidence`.

Historical verification retained below for earlier versions:

- 0.7.1 targeted goal-meta tests: passed, 50/50 (38 linter/package-contract,
  12 persistence).
- Repository skill metadata validation: passed.
- Python byte compilation: passed, 53 files.
- Docs catalog synchronization/check and VitePress build: passed; only the
  English and Chinese `goal-meta-skill` detail pages changed from 0.7.0 to
  0.7.1.
- Full repository CI: passed after `just docs-sync`; docs catalog/build,
  skills metadata, 53 Python files, 314 Node tests (312 passed, 2 skipped),
  and `git diff --check` all passed.
- Behavior evals 38–41 are manually reviewed `recorded_fixture` assets and are
  not executed by CI; they do not prove provider/model behavior.
- Trigger boundary: unchanged in 0.7.1; this task does not edit
  `description` or routing.
- Qiaomu `validate_skill.py`: rerun for 0.7.1 and produced the expected
  schema-deviation block because this
  repository deliberately has no per-skill `README.md`, `manifest.json`, or
  Qiaomu-format `evals/trigger_cases.json`; the repository-authoritative
  `scripts/check.py`, interface, behavior fixtures, Node tests, and docs catalog
  passed instead. No ceremonial files were added.
- Qiaomu `release_check.py --phase local --run-tests` was not rerun for 0.7.1;
  its prior schema boundary still lacks `manifest.json`, so current Qiaomu-format
  secret and release-readiness evidence remains `missing evidence`.
- Provider-backed Codex/Claude/Grok/OMP/Kimi fresh-session runs, human
  blind review, install proof, telemetry, PR merge and public release:
  `missing evidence`.
- Dispatch-rate improvement after this `/goal` wording: `hypothesis`,
  not validated.
- Deliberately excluded: platform runtime changes, automatic rules/memory
  import, target execution, Git mutation, publish actions and
  deletion/restoration of a real user contract.
