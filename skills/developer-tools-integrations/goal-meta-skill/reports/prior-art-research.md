# Prior-Art Research

- Researched: 2026-08-29
- Queries: `single pass code repair agent verification loop`, `agent implementation review fix loop`, `ask user before autonomous repair`, `Trellis task implement check repair`
- Scope: catalog discovery plus source inspection; no third-party skill was executed.

## Catalog evidence

- The Qiaomu unified strict runner failed before output because its Windows
  subprocess could not resolve bare `npx` (`FileNotFoundError [WinError 2]`).
- A manual skills.sh fallback used `npx.cmd`; one of four queries returned
  candidates. skills.sh install counts are adoption telemetry, not ratings or
  correctness evidence.
- The SkillsMP-only runner completed four queries and returned 32 candidate
  families. Its stars are parent-repository stars, not installs, ratings, or
  skill-specific quality.
- Unified two-catalog deduplication is therefore `missing evidence`. The design
  uses only the inspected shortlist below.

## Keep, adapt, reject, invent

| Source | Keep | Adapt | Reject |
| --- | --- | --- | --- |
| [affaan-m/ECC continuous-agent-loop](https://github.com/affaan-m/ECC/blob/main/skills/continuous-agent-loop/SKILL.md) | measurable progress, explicit quality gates, repeated-root-cause recovery | place the loop inside one generated Goal contract | external command stack and freeze/audit handoff as the default |
| [AgentWorkforce writing-agent-relay-workflows](https://github.com/AgentWorkforce/skills/blob/main/skills/writing-agent-relay-workflows/SKILL.md) | bounded review/fix paths, stable findings, deterministic signoff | Trellis implement/check feedback with Qiaomu evidence labels | fixed deep agent DAG and broker dependency |
| [alexio777/review-loop](https://github.com/alexio777/review-loop) | converged/cap/stuck/failed terminal states | freeze the full scan envelope and merge stable findings | Codex-plugin, Node/jq, and free-text parser dependencies |
| [openclaw handoff](https://github.com/openclaw/agent-skills/blob/main/skills/handoff/SKILL.md) | self-contained scope, constraints, validation, remote exclusions | make the first Prompt fresh-Agent complete | a new handoff after every checker result |

Invented combination:

- frozen scanner/config/input/target/report/Git envelope;
- stable finding ledger plus checker-to-implementation feedback in one Goal;
- a negative `AskUserQuestion` gate that excludes same-scope findings;
- at most three rounds, two-round same-signature stall detection, and honest
  `BLOCKED` residuals instead of another repair Prompt.

## Evidence boundary

- `validated advantage`: source contract and deterministic local lint/tests,
  after those gates run successfully.
- `recorded_fixture`: package behavior evals and task trigger cases.
- `hypothesis`: the wording reduces real second-Prompt handoffs.
- `missing evidence`: provider-backed before/after runs, blind human review,
  fresh-Agent execution, real repair-count telemetry, and complete strict
  dual-catalog output.
