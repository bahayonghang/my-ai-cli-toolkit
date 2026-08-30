# Prior-art research

Researched: 2026-08-29

## Queries

- `single pass code repair agent verification loop`
- `agent implementation review fix loop`
- `ask user before autonomous repair`
- `Trellis task implement check repair`

## Catalog evidence

- Qiaomu unified runner with `--strict` failed before producing output because Windows Python could not resolve bare `npx` (`FileNotFoundError [WinError 2]`).
- Manual skills.sh fallback used `npx.cmd`. The second query returned candidates; the other three returned no candidates. skills.sh counts are install telemetry, not ratings or correctness.
- The SkillsMP-only runner completed 4/4 queries with 32 candidate families. SkillsMP stars are repository stars, not installs, user ratings, or skill-specific quality. Results were noisy and were not ranked by stars.
- Dual-catalog unified deduplication is therefore `missing evidence`; only the inspected shortlist below informed design.

## Inspected shortlist

### affaan-m/ECC · continuous-agent-loop

Source: https://github.com/affaan-m/ECC/blob/main/skills/continuous-agent-loop/SKILL.md

- Signal: skills.sh returned the compatibility name `autonomous-loops` with 8.3K installs; source says `continuous-agent-loop` supersedes it. Dated catalog snapshot only.
- Keep: explicit quality gates, measurable progress, recovery from repeated root cause.
- Adapt: use the ideas inside one goal-meta execution contract rather than requiring the ECC stack.
- Reject: external command stack and freeze/audit handoff as the default resolution; this task must keep repair in the original Prompt.

### AgentWorkforce/skills · writing-agent-relay-workflows

Source: https://github.com/AgentWorkforce/skills/blob/main/skills/writing-agent-relay-workflows/SKILL.md

- Signal: source inspected; trustworthy adoption metric for this specific skill was not established.
- Keep: bounded review/fix paths, deterministic proof, stable finding schema, final signoff gate.
- Adapt: Trellis implement/check feedback and Qiaomu evidence boundaries.
- Reject: fixed deep multi-agent DAG and broker dependency; `goal-meta-skill` must remain platform-portable.

### alexio777/review-loop

Source: https://github.com/alexio777/review-loop

- Signal: GitHub page showed 1 repository star; this is not a quality score.
- Keep: converged/cap/stuck/failed terminal states and non-empty review target discipline.
- Adapt: freeze the full scan envelope, not only a Git diff target; ingest findings into a stable ledger.
- Reject: Codex plugin, Node/jq and free-text parser dependencies.

### openclaw/agent-skills · handoff

Source: https://github.com/openclaw/agent-skills/blob/main/skills/handoff/SKILL.md

- Signal: source inspected; no skill-specific adoption metric established.
- Keep: self-contained context, constraints, validation expectations, and explicit remote-action exclusions.
- Adapt: the first handoff Prompt is complete enough for a fresh Agent.
- Reject: making every post-check result another handoff; same-scope findings stay inside the active Goal.

## Invent

- Combine a frozen scan envelope with a stable finding ledger and Trellis implement/check feedback edge.
- Define the `AskUserQuestion` gate negatively: it cannot be used for same-scope findings or ordinary implementation choices.
- Make “one completion” mean one external Prompt with bounded internal repair, while preserving independent validation and honest `BLOCKED` states.

## Missing evidence

- provider-backed before/after outputs
- blind human review
- fresh-Agent execution transcript
- real telemetry on repair-Prompt count or convergence rate
- complete dual-catalog strict runner output
