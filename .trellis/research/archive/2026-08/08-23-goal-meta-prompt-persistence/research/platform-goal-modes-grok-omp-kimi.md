# Platform Goal Modes: Grok Build, Oh My Pi, and Kimi Code

- Last verified: 2026-08-23 (Asia/Shanghai)
- Scope: first-party documentation and canonical source repositories only
- Question: can one persisted root `GOAL.md` be launched safely through each
  platform's real Goal mode without claiming automatic file discovery?

## Identity resolution

`OMP` is treated as **Oh My Pi** for this task. The repository's own Trellis
adapter maps `omp` to Oh My Pi in `.trellis/scripts/common/cli_adapter.py:23`,
and the canonical project exposes the `omp` executable. If a future user means
another product named OMP, platform selection must stop and ask instead of
silently reusing this adapter.

## Source snapshots

| Platform | Snapshot inspected | Mutable release evidence |
| --- | --- | --- |
| Grok Build | [`xai-org/grok-build@07b2f714`](https://github.com/xai-org/grok-build/commit/07b2f7144fd5c5c9d3dd1966937a87852d2dbdb8) | GitHub latest-release endpoint returned 404; no release tag claim |
| Oh My Pi | [`can1357/oh-my-pi@160ed439`](https://github.com/can1357/oh-my-pi/commit/160ed439ac0df594347e7d7018b813a7ffdb5e81) | [`v18.0.3`](https://github.com/can1357/oh-my-pi/releases/tag/v18.0.3) |
| Kimi Code | [`MoonshotAI/kimi-code@368b4b74`](https://github.com/MoonshotAI/kimi-code/commit/368b4b7400228028006c9b0d5789fcced85f75aa) | [`@moonshot-ai/kimi-code@0.38.0`](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.38.0) |

Version tags are observation anchors, not minimum-version claims. Minimum
supported versions remain `missing evidence` unless the platform publishes an
authoritative compatibility statement.

## Grok Build

Primary evidence:

- [Slash-command guide at the inspected commit](https://github.com/xai-org/grok-build/blob/07b2f7144fd5c5c9d3dd1966937a87852d2dbdb8/crates/codegen/xai-grok-pager/docs/user-guide/04-slash-commands.md)
- [Goal command implementation](https://github.com/xai-org/grok-build/blob/07b2f7144fd5c5c9d3dd1966937a87852d2dbdb8/crates/codegen/xai-grok-tools-api/src/slash_commands.rs)
- [File-reference guide](https://github.com/xai-org/grok-build/blob/07b2f7144fd5c5c9d3dd1966937a87852d2dbdb8/crates/codegen/xai-grok-pager/docs/user-guide/01-getting-started.md)
- [Project-rule discovery](https://github.com/xai-org/grok-build/blob/07b2f7144fd5c5c9d3dd1966937a87852d2dbdb8/crates/codegen/xai-grok-pager/docs/user-guide/12-project-rules.md)

Confirmed behavior:

- `/goal <objective> [--budget <tokens>]` starts autonomous work.
- `/goal status`, `pause`, `resume`, and `clear` manage the lifecycle.
- Completion candidates go through independent evidence review; missing or
  non-reproducible evidence keeps the goal active or pauses it with gaps.
- Goal mode can be disabled for a session. The adapter must report that state
  instead of pretending a prompt alone enabled the runtime.
- `@path` attaches files in ordinary prompts, but the inspected docs do not
  explicitly guarantee that a file-reference chip survives `/goal` command
  parsing. The safe first adapter uses a literal objective that instructs Grok
  to read `./GOAL.md`; an `@GOAL.md` optimization remains provider-test gated.
- Grok auto-discovers named project-rule files and `.grok/rules/*.md`, not an
  arbitrary root `GOAL.md` as a top-level rule. Do not claim automatic loading.
- No public objective-length limit was found in the inspected guide/source.
  A 4,000-character limit may remain a goal-meta portability policy, but must
  not be attributed to Grok Build.

Recommended launch shape:

```text
/goal First read and follow ./GOAL.md as the approved execution contract. Restate its objective, constraints, verification, completion, and pause conditions, then work until every completion gate has current evidence or a pause condition is reached.
```

Only add `--budget <tokens>` when the user explicitly requested and approved a
runtime token budget.

## Oh My Pi (OMP)

Primary evidence:

- [Built-in slash-command registry](https://github.com/can1357/oh-my-pi/blob/160ed439ac0df594347e7d7018b813a7ffdb5e81/packages/coding-agent/src/slash-commands/builtin-modes.ts)
- [Persisted goal state](https://github.com/can1357/oh-my-pi/blob/160ed439ac0df594347e7d7018b813a7ffdb5e81/packages/coding-agent/src/goals/state.ts)
- [Goal tool](https://github.com/can1357/oh-my-pi/blob/160ed439ac0df594347e7d7018b813a7ffdb5e81/packages/coding-agent/src/goals/tools/goal-tool.ts)
- [Active-goal prompt](https://github.com/can1357/oh-my-pi/blob/160ed439ac0df594347e7d7018b813a7ffdb5e81/packages/coding-agent/src/prompts/goals/goal-mode-active.md)
- [Context-file discovery](https://github.com/can1357/oh-my-pi/blob/160ed439ac0df594347e7d7018b813a7ffdb5e81/docs/context-files.md)

Confirmed behavior:

- `/goal <objective>` creates a goal; `/goal set <objective>` sets or replaces
  it. `/goal show`, `pause`, `resume`, `drop`, and `budget <N|off>` are the
  platform-specific management forms. `/guided-goal` is a separate interview
  entry point.
- Goal mode is session-persistent, preserves the full objective, tracks token
  and elapsed-time usage, and uses `active`, `paused`, `budget-limited`,
  `complete`, and `dropped` states.
- Completion requires a current-repository audit against all deliverables;
  budget exhaustion is explicitly not completion.
- Goal mode must be enabled in settings and is mutually exclusive with OMP plan
  and vibe modes. A launcher should surface these preconditions.
- OMP automatically discovers recognized context files such as `.omp/AGENTS.md`
  and root `AGENTS.md`. Its documented `@path` import expands inside those
  context files; it is not evidence that an arbitrary prompt token or root
  `GOAL.md` auto-loads. Use an explicit natural-language read instruction.
- No objective-length cap was found in the inspected goal sources. Keep 4,000
  characters only as this skill's conservative portability limit.

Recommended launch shape:

```text
/goal First read and follow ./GOAL.md as the approved execution contract. Preserve its full objective across turns, verify every deliverable against current repository evidence, and leave the goal active or paused when the contract is not fully satisfied.
```

Do not render Codex/Grok `clear`, Claude `cancel`, or Kimi `replace/next` as OMP
management commands.

## Kimi Code

Primary evidence:

- [Goal guide](https://github.com/MoonshotAI/kimi-code/blob/368b4b7400228028006c9b0d5789fcced85f75aa/docs/en/guides/goals.md)
- [Slash-command reference](https://github.com/MoonshotAI/kimi-code/blob/368b4b7400228028006c9b0d5789fcced85f75aa/docs/en/reference/slash-commands.md)
- [TUI goal parser and 4,000-character check](https://github.com/MoonshotAI/kimi-code/blob/368b4b7400228028006c9b0d5789fcced85f75aa/apps/kimi-code/src/tui/commands/goal.ts)
- [Headless goal exit contract](https://github.com/MoonshotAI/kimi-code/blob/368b4b7400228028006c9b0d5789fcced85f75aa/apps/kimi-code/src/cli/goal-prompt.ts)
- [File references](https://github.com/MoonshotAI/kimi-code/blob/368b4b7400228028006c9b0d5789fcced85f75aa/docs/en/guides/interaction.md)
- [Repository-root `GOAL.md` design document](https://github.com/MoonshotAI/kimi-code/blob/368b4b7400228028006c9b0d5789fcced85f75aa/GOAL.md)

Confirmed behavior:

- `/goal <objective>` starts a persistent objective. `/goal` or `status`, plus
  `pause`, `resume`, `cancel`, `replace <objective>`, and `next <objective>`
  manage it. Reserved first words can be escaped with `/goal -- ...`.
- States are `active`, `paused`, `blocked`, and `complete`. Resume after a
  restored active session starts paused rather than spending resources
  automatically. Completion clears the goal; blocked/paused remain resumable.
- Objectives are capped at 4,000 characters. The implementation itself tells
  users to put long content in a file and reference its path.
- Stop limits belong in the objective for the current TUI command surface.
  Kimi also has structured turn/token/wall-clock budgets internally, but the
  user-facing `/goal` command does not expose a generic budget flag.
- In headless mode, only create forms are goal controls; completion exits `0`,
  blocked exits `3`, and paused exits `6`.
- Kimi documents `@path` file mentions, but the persisted objective is parsed as
  text. Use a literal `read ./GOAL.md` launch first; treat `/goal @GOAL.md ...`
  as an optional adapter only after a fresh-session provider test.
- The Kimi repository's root `GOAL.md` is strong design precedent for a visible
  single Markdown goal artifact. It is not evidence that Kimi Code
  automatically loads arbitrary root `GOAL.md` files.

Recommended launch shape:

```text
/goal First read and follow ./GOAL.md as the approved execution contract. Restate its finish line, evidence, boundaries, iteration policy, and stop conditions, then continue until the goal is complete, blocked, or paused exactly as that contract defines.
```

For headless execution, the equivalent shell form is
`kimi -p "/goal First read and follow ./GOAL.md ..."`; it must be treated as a
separate output variant because lifecycle management commands are TUI-only.

## Cross-platform planning consequences

1. Keep one platform-neutral `GOAL.md` schema; render only launch and lifecycle
   management per selected platform.
2. Do not use one universal management-command table. `clear`, `drop`,
   `cancel`, `replace`, `next`, `show`, and `budget` are not interchangeable.
3. Keep the generated pointer below 4,000 characters. This is an official cap
   for Codex, Claude Code, and Kimi Code, and a conservative skill-owned cap for
   Grok Build and OMP pending authoritative limits.
4. Never auto-import `GOAL.md` through `AGENTS.md`, `CLAUDE.md`, `.grok/rules`,
   or `.omp/RULES.md`; task-specific execution state must not become permanent
   project policy.
5. Detect platform from explicit user wording first, then host evidence. An
   ambiguous target produces a platform choice rather than a blended command.
6. Provider-backed fresh-session tests remain required before claiming that
   any `@GOAL.md`-inside-`/goal` shortcut is reliable on Grok, OMP, or Kimi.

## Missing evidence

- No authenticated fresh-session run was performed on Grok Build, OMP, or Kimi
  Code in this planning turn.
- No official minimum-version statement was found for the three Goal modes.
- No official Grok Build or OMP objective-length limit was found.
- File-reference completion inside the `/goal` parser is not provider-verified
  for Grok Build, OMP, or Kimi Code; explicit read instructions are the safe
  fallback.
- Kimi's repository `GOAL.md` demonstrates a project artifact, not an automatic
  discovery contract or general cross-platform convention.
