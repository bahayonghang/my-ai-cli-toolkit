# Goal Meta Skill 0.5.0 creation handoff

## Result

`goal-meta-skill` 0.5.0 turns vague work into a verifiable platform-correct
`/goal` and, only after explicit approval, persists one root `GOAL.md` handoff
through a guarded writer. Local path:
`skills/developer-tools-integrations/goal-meta-skill/`. Publication status:
local repository implementation; no PR, merge, release, or install claim.

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

## Advantages and evidence

- `design advantage`: compared with the inspected candidates, this package
  explicitly separates user authorization, deterministic mutation, contract
  authority and five incompatible Goal lifecycle grammars. Evidence:
  `SKILL.md`, `persistent-goal-contract.md`, `platform-goal-facts.md`.
- `validated advantage`: deterministic local tests cover create/replace/conflict,
  containment/link/encoding/secret behavior and platform command isolation;
  Qiaomu trigger cases pass 16/16. Evidence is local only and must not be
  described as provider/model compliance.
- `hypothesis`: a visible root contract plus an explicit-read launcher is
  expected to reduce cross-session intent loss. Provider-backed comparison and
  human blind handoff review are `missing evidence`.

## Verification and limits

- Repository metadata validation: passed.
- Persistence tests: 12/12 passed.
- Inline/linter/package-contract tests: 20/20 passed.
- Trigger boundary: 16/16 passed after correcting two disclosed near-neighbor
  false positives.
- Full repository CI: passed, including docs build, metadata checks, 49 Python
  files, 237 Node tests (235 passed, 2 skipped), and whitespace validation.
- Secret scan: no findings in the package under Qiaomu's scanner.
- Qiaomu package validator: not passed because this repository intentionally
  has no per-skill `README.md` or `manifest.json`; task-local trigger cases also
  differ from its package convention.
- Provider-backed Codex/Claude/Grok/OMP/Kimi fresh-session runs, human blind
  review, install proof, telemetry, PR merge and public release: `missing evidence`.
- Deliberately excluded: platform runtime changes, automatic rules/memory import,
  target execution, Git mutation, publish actions and deletion/restoration of a
  real user contract.
