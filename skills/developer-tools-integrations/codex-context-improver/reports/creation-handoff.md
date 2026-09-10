# Codex context improver 2.0.0 creation handoff

Local package: `skills/developer-tools-integrations/codex-context-improver/`.
Production; owner lyh; MIT. Audits task-relevant Codex instructions, skills and
prompts, or completes authorized local fixes while preserving verified constraints.
No commit, publication, global install or model configuration change is included.

## Reference skills studied

Research date 2026-09-10; full provenance, license and catalog observations are
in [prior-art research](prior-art-research.md).

| Studied source | Why / dated signal | Lesson and landing |
| --- | --- | --- |
| [samber/skill-progressive-disclosure-design](https://github.com/samber/cc-skills/blob/f866b800353719270a9ea101a41c5e2a2618d460/skills/skill-progressive-disclosure-design/SKILL.md) | Relevant specialist; skills.sh displayed 2K installs, MIT | Separate activation metadata from later reference reads; compact root and context-audit |
| [shipshitdev/agent-config-audit](https://github.com/shipshitdev/skills/blob/60a558762db37e361470ba60f26ae33aeb40bda7/skills/agent-config-audit/SKILL.md) | Instruction-audit overlap; 123 displayed installs; license unspecified | Resolve actual instructions and preserve scope before judging duplication; discovery/update references |
| [caph/agents-progressive-disclosure](https://github.com/caph-dev/agents-progressive-disclosure/blob/99fdf9d7b5364f8602f19e0217c25b683843ee0b/SKILL.md) | Preservation specialist; 70 displayed installs; license unspecified | Trace original intent to destination; update guidance and preservation scenario |
| First-party Codex 1.2.0 baseline and claude-context-improver | Inspectable repository sources; lyh/MIT | Keep override/fallback/budget evidence, independent AGENTS/map decision and byte-identical sibling map fences |

Installs measure adoption, SkillsMP stars describe repositories, neither is a
rating or quality score. Two unspecified licenses prohibit assuming prose reuse;
only mechanisms were adapted.

## Keep, adapt, reject, invent

- Keep actual launch/configuration evidence, ownership and shared navigation.
- Adapt short triggers, conditional references and instruction preservation.
- Reject age/copy/line-count deletion rules, forced broad scans, blanket approval
  loops, fixed subagent counts and assumed Claude-to-Codex loader equivalence.
- Invent for this task a source/authority comparison tying Astra guidance to
  observed metadata/body/reference reads, requested action and completion proof.

[Official Astra guidance](https://developers.openai.com/api/docs/guides/latest-model)
informs autonomy, instruction following, communication, delegation and validation.
The [specified X article](https://x.com/pvncher/status/2095991462416490862)
informs trigger/disclosure design; its text was read through a third-party relay.
Direct X page and embedded image verification are missing evidence. These sources
do not authorize writes or prove this skill's performance.

## Advantages and evidence

- **design advantage**: distinguish original-task load from audit-time reading;
  explicit scoped implementation from planning approval; see context-audit and
  output scenarios F-N.
- **design advantage**: lean root preserves required project gates and conditional
  detail; no generic scanner, compatibility alias or runtime heuristic engine.
- **hypothesis**: clearer context may reduce redundant work. Provider comparison,
  cost/time savings, new-session discovery and human usability are missing evidence.
- Current deterministic and heuristic check results are recorded below.
  They cannot establish model superiority or human acceptance.

## Verification and handoff boundary

- Node package contracts: **7/7 passed**, no skips; initial root+interface estimate
  **989 tokens** (characters/4, not a provider token count).
- Trigger smoke: **22/22 passed**, `ok=true`, no false positives/negatives in
  these lexical examples. One navigation-only main case has no standalone Codex
  routing signal and remains an output scenario rather than a smoke projection.
- Skill IR export and repository `just skills-check`: **passed**.
- Qiaomu package validation: **failed**, solely `missing required file: README.md`.
  Its warnings are `adapter target not declared: agent-skills-compatible`
  (the existing openai/claude/generic repository adapters are retained; no new
  support claim is added) and `manifest.json missing release_gates` (publication
  is outside this task; no factory release configuration is invented).

The main behavior oracle is `evals/evals.json`; trigger_cases is a separate
heuristic smoke projection. Output inputs are `scenario_input`, with no canned
winning outputs. The independent [output review](output-review.md) records all
18 actual in-session agent responses and assertion-by-assertion judgments.
Two initial presentation/routing failures were corrected and passed focused
reruns. Actual file edits/check execution and absent scenario branches remain
PARTIAL/NOT EXERCISED; this is not an 18/18 real execution pass or provider/human
evaluation. The review embeds the observed text for portable inspection.

Local installer probe: **passed** on Windows in a freshly created exclusive
temporary project. Catalog contained 41 skills, exactly one new identity and
no old identity. The installed `.agents/skills/codex-context-improver` junction
resolved to this source package; linked/root SKILL bytes matched SHA256
`A03C25B5F7D12F7BD5961B0990244D97E3B8A96BB5A17AA9A573A2552C8868D6`.
The junction was removed non-recursively before empty parent directories were
removed; the temporary project is gone and source bytes survived unchanged.
No user-global root or ignored repository live link was modified. This does
not prove remote `npx` installation or native Codex new-session discovery.

Generated docs and full repository `just ci`: **passed**. Catalog/build checks,
41 skill metadata checks, 65 Python file compilations, 22 PR-release tests,
16 hook tests, 35 installer tests and whitespace checks passed. Node suite:
416 total, 412 passed, 4 skipped, 0 failed; skips cover two opt-in browser
smokes and two platform-specific cases. VitePress used existing dependencies;
two dependency annotation warnings did not prevent its successful build.
No separate static type checker is configured for this prompt/reference package.

Docs-sync generated 82 bilingual skill detail pages and checked 89 generated
files. Six stale pages were removed: two from this rename, four derived from
the already-deleted codex-workflow-recommender and web-research packages.
Their 26 pre-existing source deletions were preserved, not performed by this
task. No commit, archive, PR, push, dependency addition or global change ran.

Production schema deviation: repository-generated bilingual catalog pages provide
README navigation. No standalone README is added solely to satisfy the factory.
The qiaomu validator must therefore be reported as failed, with only
`missing required file: README.md` allowed as the known failure.

The eleven 1.2.0 profile/scorecard/blind-review reports are retired, preserved in
Git history rather than renamed into 2.0.0 evidence. No old result proves this
version. Missing provider/human/remote-install evidence stays explicit.
