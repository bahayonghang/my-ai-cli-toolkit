# Platform Goal Facts

Single source of truth for platform-specific `/goal` behavior. Other references
may describe policy and launch shapes but must not invent or fork lifecycle,
length, budget, permission, headless, or file-loading claims.

Last verified: 2026-08-23 against the dated primary sources linked below.

Evidence labels: `official` is platform documentation or canonical source;
`local-probe` is a named local observation; `community-observed` is not a
platform guarantee; `missing evidence` means the inspected sources did not
establish the claim.

## Compatibility matrix

| Platform | Start | Management | States / completion | Length | File handoff |
| --- | --- | --- | --- | --- | --- |
| Codex | `/goal <objective>` | view/edit/pause/resume/clear | active/paused/cleared/completed/budget-limited; evidence required | official 4,000 | explicit `read ./GOAL.md`; arbitrary root file is not auto-loaded |
| Claude Code | `/goal <condition>` | view/clear; no edit/pause/resume | transcript evaluator auto-continues or clears on success | official 4,000 | documented `@GOAL.md`; restate evidence in transcript |
| Grok Build | `/goal <objective> [--budget N]` | status/pause/resume/clear | independent evidence review; missing proof remains active/paused | `missing evidence`; skill-owned 4,000 portability budget | explicit read; `@` inside `/goal` is unverified |
| Oh My Pi | `/goal <objective>` or `set` | set/show/pause/resume/drop/budget | active/paused/budget-limited/complete/dropped; budget is not completion | `missing evidence`; skill-owned 4,000 portability budget | explicit read; arbitrary root file is not auto-loaded |
| Kimi Code | `/goal <objective>` | status/pause/resume/cancel/replace/next | active/paused/blocked/complete | official 4,000 | explicit read; combined `@` + `/goal` is unverified |

`both` in this skill remains the backward-compatible Codex+Claude linter
aggregate. `all` means all five and is valid only for explicit multi-platform
contracts/fixtures.

## Codex

Sources (official unless labeled otherwise):

- [Goal mode guidance](https://developers.openai.com/codex/long-running-work)
- [AGENTS.md discovery](https://developers.openai.com/codex/agent-configuration/agents-md)
- [Slash commands](https://developers.openai.com/codex/cli/slash-commands)
- [Goal cookbook](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex)
- [`/goal edit` PR, community-observed](https://github.com/openai/codex/pull/21954)

Facts:

- `/goal <text>` attaches an objective; the text is the first prompt and the
  completion criteria. `/goal`, `edit`, `pause`, `resume`, and `clear` manage it.
- Goals are documented from Codex 0.128.0. A prior `local-probe` on 0.146.0
  reported `goals stable true`; managed/older environments may need
  `features.goals` enabled.
- Objectives are non-empty and at most 4,000 characters.
- A goal grants no new sandbox/approval permissions and may pause for decisions.
- `community-observed`: edit retains budget/accounting; clear and recreate to
  reset it. Goal text token/turn wording is a soft stop clause, not a runtime
  budget control.
- Official automatic instruction discovery covers `AGENTS.md` and configured
  fallbacks, not arbitrary root `GOAL.md`. Point the objective at the file.
- When outcome is unclear, `/plan` is the neighbor for requirements discovery.

## Claude Code

Sources (official):

- [Goal mode](https://code.claude.com/docs/en/goal)
- [Memory and CLAUDE.md](https://code.claude.com/docs/en/memory)
- [Common workflows and file references](https://code.claude.com/docs/en/tutorials)

Facts:

- `/goal <condition>` sets a session completion condition and immediately starts
  a turn. An independent small model reads only the transcript after each turn;
  “no” auto-continues and “yes” clears the goal.
- `/goal` views status. `/goal clear` removes it; `stop`, `off`, `reset`, `none`,
  and `cancel` are aliases. `/clear` also removes it. There is no goal
  edit/pause/resume command.
- Requires Claude Code v2.1.139+, accepted workspace trust, and hooks not
  disabled by `disableAllHooks` or managed `allowManagedHooksOnly`.
- Conditions are at most 4,000 characters. Always include an evaluator-judged
  turn/time bound such as “stop after 20 turns”; it is not a hard runtime budget.
- The evaluator runs no tools. Exit codes, test/lint output, diffs/status and
  file listings must be surfaced in the transcript. Screenshots/human review
  alone cannot prove completion to it.
- Goals grant no permission. Unattended use also requires auto mode.
- `@file` is documented message context, so `@GOAL.md` is the preferred launcher,
  but the executing Claude must restate the contract/evidence in the transcript.
- `claude -p "/goal ..."` is a one-shot non-interactive loop; stream JSON is
  preferable when progress is required.

## Grok Build

Snapshot: [`xai-org/grok-build@07b2f714`](https://github.com/xai-org/grok-build/commit/07b2f7144fd5c5c9d3dd1966937a87852d2dbdb8).
The latest-release endpoint returned 404 at verification time, so no release
version or minimum-version claim is made.

Sources (official canonical repository):

- [Slash commands](https://github.com/xai-org/grok-build/blob/07b2f7144fd5c5c9d3dd1966937a87852d2dbdb8/crates/codegen/xai-grok-pager/docs/user-guide/04-slash-commands.md)
- [Goal command implementation](https://github.com/xai-org/grok-build/blob/07b2f7144fd5c5c9d3dd1966937a87852d2dbdb8/crates/codegen/xai-grok-tools-api/src/slash_commands.rs)
- [File references](https://github.com/xai-org/grok-build/blob/07b2f7144fd5c5c9d3dd1966937a87852d2dbdb8/crates/codegen/xai-grok-pager/docs/user-guide/01-getting-started.md)
- [Project rules](https://github.com/xai-org/grok-build/blob/07b2f7144fd5c5c9d3dd1966937a87852d2dbdb8/crates/codegen/xai-grok-pager/docs/user-guide/12-project-rules.md)

Facts:

- `/goal <objective> [--budget <tokens>]` starts; `status`, `pause`, `resume`,
  and `clear` manage it.
- Completion candidates receive an independent evidence review. Missing or
  irreproducible evidence keeps the goal active or pauses it with gaps.
- Goal mode may be disabled for a session. A prompt cannot enable it.
- Ordinary prompts support `@path`; survival through `/goal` parsing is
  `missing evidence`, so use an explicit `read ./GOAL.md` objective.
- Auto-discovered project-rule files do not include arbitrary root `GOAL.md`.
- Objective length limit is `missing evidence`. This skill applies a 4,000
  portability budget without attributing it to Grok.

## Oh My Pi (OMP)

Snapshot: [`can1357/oh-my-pi@160ed439`](https://github.com/can1357/oh-my-pi/commit/160ed439ac0df594347e7d7018b813a7ffdb5e81), observed release
[`v18.0.3`](https://github.com/can1357/oh-my-pi/releases/tag/v18.0.3).
The tag is an observation anchor, not a minimum version.

Sources (official canonical repository):

- [Built-in mode commands](https://github.com/can1357/oh-my-pi/blob/160ed439ac0df594347e7d7018b813a7ffdb5e81/packages/coding-agent/src/slash-commands/builtin-modes.ts)
- [Goal state](https://github.com/can1357/oh-my-pi/blob/160ed439ac0df594347e7d7018b813a7ffdb5e81/packages/coding-agent/src/goals/state.ts)
- [Goal tool](https://github.com/can1357/oh-my-pi/blob/160ed439ac0df594347e7d7018b813a7ffdb5e81/packages/coding-agent/src/goals/tools/goal-tool.ts)
- [Active-goal prompt](https://github.com/can1357/oh-my-pi/blob/160ed439ac0df594347e7d7018b813a7ffdb5e81/packages/coding-agent/src/prompts/goals/goal-mode-active.md)
- [Context files](https://github.com/can1357/oh-my-pi/blob/160ed439ac0df594347e7d7018b813a7ffdb5e81/docs/context-files.md)

Facts:

- `/goal <objective>` creates; `/goal set <objective>` sets/replaces. `show`,
  `pause`, `resume`, `drop`, and `budget <N|off>` manage it. `/guided-goal` is a
  different intake flow.
- States are active, paused, budget-limited, complete, and dropped. The full
  objective persists; completion requires a current-repository audit of every
  deliverable. Budget exhaustion is explicitly not completion.
- `goal.enabled` must be on. Goal mode conflicts with plan and vibe modes.
- Recognized context-file discovery does not make arbitrary `GOAL.md` a context
  file. Documented `@path` expansion inside context files is not prompt-level
  attachment proof; use an explicit read objective.
- Objective length limit is `missing evidence`; use the skill-owned 4,000
  portability budget.

## Kimi Code

Snapshot: [`MoonshotAI/kimi-code@368b4b74`](https://github.com/MoonshotAI/kimi-code/commit/368b4b7400228028006c9b0d5789fcced85f75aa), observed release
[`@moonshot-ai/kimi-code@0.38.0`](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.38.0).
The tag is an observation anchor, not a minimum version.

Sources (official canonical repository):

- [Goal guide](https://github.com/MoonshotAI/kimi-code/blob/368b4b7400228028006c9b0d5789fcced85f75aa/docs/en/guides/goals.md)
- [Slash commands](https://github.com/MoonshotAI/kimi-code/blob/368b4b7400228028006c9b0d5789fcced85f75aa/docs/en/reference/slash-commands.md)
- [TUI parser and 4,000 check](https://github.com/MoonshotAI/kimi-code/blob/368b4b7400228028006c9b0d5789fcced85f75aa/apps/kimi-code/src/tui/commands/goal.ts)
- [Headless exit contract](https://github.com/MoonshotAI/kimi-code/blob/368b4b7400228028006c9b0d5789fcced85f75aa/apps/kimi-code/src/cli/goal-prompt.ts)
- [File references](https://github.com/MoonshotAI/kimi-code/blob/368b4b7400228028006c9b0d5789fcced85f75aa/docs/en/guides/interaction.md)
- [Repository root GOAL.md precedent](https://github.com/MoonshotAI/kimi-code/blob/368b4b7400228028006c9b0d5789fcced85f75aa/GOAL.md)

Facts:

- `/goal <objective>` starts. `/goal` or `status`, plus `pause`, `resume`,
  `cancel`, `replace <objective>`, and `next <objective>` manage it. `/goal --`
  escapes a reserved first word.
- States are active, paused, blocked, and complete. Restored active sessions
  resume as paused; completion clears, while blocked/paused remain resumable.
- Objectives are capped at 4,000 characters; the implementation recommends a
  file path for longer content.
- Stop limits belong in the current TUI objective; `/goal` exposes no generic
  user budget flag.
- Headless mode accepts create forms only. Completion exits 0, blocked exits 3,
  and paused exits 6.
- `@path` is documented, but combined `@GOAL.md` + `/goal` is provider-unverified;
  use an explicit read objective.
- The repository's own root `GOAL.md` is design precedent, not evidence of
  automatic discovery in arbitrary projects.

## Rendering and selection rules

1. Explicit user platform wins, then host evidence, then one bounded platform
   choice. `OMP` maps to Oh My Pi unless the user means another product.
2. Render one neutral contract and only platform-specific launch/management,
   budget and stop semantics. Never blend commands.
3. Codex/Grok/OMP/Kimi explicitly read `./GOAL.md`. Claude may use `@GOAL.md`
   and must require transcript-visible proof.
4. Grok/OMP/Kimi prompt-level `@GOAL.md` remains `UNVERIFIED` until a named
   provider-backed fresh-session transcript proves it.
5. Enabling Goal mode never grants broader permission and never causes an
   arbitrary root `GOAL.md` to load automatically.
