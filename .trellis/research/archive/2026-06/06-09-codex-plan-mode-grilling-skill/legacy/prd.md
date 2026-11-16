# Refactor Spark for Codex and Claude Plan modes

## Goal

Rework the existing `skills/development-workflows/spark` skill plan so Spark, not a new `codex-grill` skill, absorbs the useful "grill me" behavior while correctly handling the different Plan mode semantics in Codex and Claude Code.

## User Value

The user wants Spark to be the durable planning workflow. When Spark runs inside native Codex Plan mode, it should ask strong structured questions and return a final chat-visible plan. When Spark runs inside Claude Code Plan mode, it should use Claude Code's native plan approval/exit flow and may materialize the approved plan after leaving Plan mode. When Spark runs in a writable/default mode, it should keep its existing `.plannings/` Markdown plan artifact behavior. The user does not want a separate `codex-grill` skill.

## Confirmed Facts

- User correction: do not implement `codex-grill`; refactor `skills/development-workflows/spark` instead.
- Current Spark frontmatter and README say Spark turns an idea into a Markdown implementation plan saved at `.plannings/YYYY-MM-DD-<feature-slug>.md` by default.
- Current Spark also says it should "prefer the current native plan surface", but the same flow still derives and writes a plan path. That is contradictory in native Codex Plan mode because Plan mode is not a file-writing surface.
- Current Spark tests lock the old behavior: `.plannings` default output, explicit HTML branch, `AskUserQuestion`, no `EnterPlanMode`, and no old superpowers path leakage.
- Current Spark visual companion writes scratch files under `.spark/brainstorm/`, so it is not valid inside native Plan mode either.
- `grill-me` contributes the interaction contract Spark should absorb: explore first, ask one question at a time, walk the decision tree, and provide a recommended answer.
- `grill-with-docs` contributes evidence discipline: read glossary/ADR/domain docs, challenge vague or conflicting terms, use concrete scenarios, and cross-check user claims against code. Its inline docs-writing behavior must be adapted to Plan mode by proposing changes in the final chat plan, not mutating files.
- Official Codex docs say Plan mode is toggled by the user with `/plan` or Shift+Tab and is for context gathering, clarifying questions, and stronger plans before implementation.
- The upstream Codex Plan mode template uses `request_user_input` for clarification and returns a final plan in conversation, not by saving a file.
- Official Claude Code docs describe Plan mode as a permission mode. It can be entered with `Shift+Tab`, `/plan`, or `claude --permission-mode plan`, left with `Shift+Tab`, and approved to continue in another permission mode.
- Claude Code's tool reference documents `EnterPlanMode` and `ExitPlanMode`; `ExitPlanMode` submits the plan for user approval and exits Plan mode when approved.

## Requirements

- Preserve the existing skill name `spark`. Do not create `codex-grill`.
- Refactor Spark into explicit planning surfaces:
  - native Codex Plan mode: read-only, structured questions when available, final chat plan only;
  - Claude Code Plan mode: use Claude Code's plan approval/exit flow; after approval exits Plan mode, materialize Spark's `.plannings` artifact if a durable plan file is part of the requested Spark output;
  - writable/default mode: Markdown plan saved under `.plannings/` as before;
  - optional HTML/visual branch: only in writable mode, never in native Plan mode.
- Update Spark instructions so native Plan mode never says to write `.plannings`, `.spark`, HTML, `CONTEXT.md`, ADRs, or task files.
- Update Spark instructions so Claude Code Plan mode does not write files until after `ExitPlanMode` / user approval has left Plan mode.
- Keep Spark's existing hard gate: no production code, no scaffolding, no implementation workflows before user approval.
- Add stronger interrogation mechanics to Spark's discovery phase:
  - inspect repo evidence before asking;
  - ask exactly one blocking question at a time;
  - include the decision needed, why it matters, recommended answer, and trade-off;
  - challenge overloaded or conflicting terminology;
  - test ambiguous requirements with concrete scenarios;
  - surface contradictions between user claims and code/docs.
- In native Plan mode, if the user asks for an artifact, HTML, visual companion, or docs update, Spark must record that as a follow-up request in the chat plan and ask the user to leave Plan mode / request implementation before writing files.
- In writable mode, preserve `.plannings` slug rules, Markdown structure, self-review, optional paired HTML artifact, and user approval gate.
- Update README and static tests so they describe and enforce the dual-surface behavior.
- If generated docs reflect skill descriptions, plan to run docs sync/check after implementation.

## Non-goals

- Do not implement a new skill package.
- Do not patch Codex or implement a custom collaboration mode.
- Do not require Codex Spark to auto-enter or auto-exit Plan mode.
- Do not deny Claude Code's native Plan mode enter/exit tools when they are available.
- Do not write artifacts while Codex native Plan mode or Claude Code Plan mode is still active.
- Do not run the full skill-creator evaluation loop in this planning turn.
- Do not change reference files under `ref/`.

## Acceptance Criteria

- [ ] `research.md` documents the revised conclusion: modify Spark, no `codex-grill`.
- [ ] `design.md` defines separate Codex Plan mode, Claude Code Plan mode, writable/default mode, and compatibility fallback behavior.
- [ ] `implement.md` lists exact Spark files and test/doc validation steps.
- [ ] The plan includes explicit tests preventing Codex Plan mode file-write instructions and preventing Claude Code Plan mode file writes before approval/exit.
- [ ] The plan includes Spark interrogation improvements based on `grill-me` and `grill-with-docs`.
- [ ] `python ./.trellis/scripts/task.py validate .trellis/tasks/06-09-codex-plan-mode-grilling-skill` passes.
- [ ] No production skill files are modified until the user approves implementation.

## Open Questions

- Version bump recommendation: `spark` should likely move from `0.5.0` to `0.6.0` because this changes runtime behavior in native Plan mode.
- Full benchmark loop is optional. Recommended default is static contract tests plus targeted manual prompts unless the user explicitly asks for the full `skill-creator` eval/reviewer loop.
