# Goal Meta Skill 0.6.0 creation handoff

## Result

`goal-meta-skill` 0.6.0 turns vague work into a verifiable platform-correct
`/goal` and, only after explicit approval, persists one root `GOAL.md` handoff
through a guarded writer. This revision injects Trellis sub-agent dispatch
into generated Trellis implementation `/goal` text. Local path:
`skills/developer-tools-integrations/goal-meta-skill/`. Publication status:
local repository implementation; no PR, merge, release, or install claim.

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

## Advantages and evidence

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

## Verification and limits

- Repository metadata validation: passed.
- Persistence tests: passed, including the Trellis fixture with dispatch
  wording.
- Inline/linter/package-contract tests: passed, including four dispatch
  inputs on both the contract branch and the inline `/goal` branch.
- Trigger boundary: unchanged in 0.6.0; this task does not edit
  `description` or routing.
- Full repository CI: passed after `just docs-sync`. Local result: docs
  catalog check, skills metadata, 52 Python files, 278 Node tests (276
  passed, 2 skipped), and `git diff --check`.
- Secret scan and Qiaomu package validator: unchanged schema deviation
  (no per-skill `README.md` or `manifest.json`).
- Provider-backed Codex/Claude/Grok/OMP/Kimi fresh-session runs, human
  blind review, install proof, telemetry, PR merge and public release:
  `missing evidence`.
- Dispatch-rate improvement after this `/goal` wording: `hypothesis`,
  not validated.
- Deliberately excluded: platform runtime changes, automatic rules/memory
  import, target execution, Git mutation, publish actions and
  deletion/restoration of a real user contract.
