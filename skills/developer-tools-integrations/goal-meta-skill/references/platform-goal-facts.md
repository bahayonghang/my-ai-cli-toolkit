# Platform Goal Facts

Single source of truth for platform-specific `/goal` behavior. Other files in
this skill must reference these facts instead of restating them. If official
docs change, update this file first, then the prose that cites it.

Sources: developers.openai.com/codex/cli/slash-commands,
developers.openai.com/codex/use-cases/follow-goals,
developers.openai.com/codex/app/commands, code.claude.com/docs/en/goal.

## Codex (CLI and app)

- Semantics: `/goal` attaches a persistent objective to the current thread and
  keeps tracking it while work continues.
- Commands: `/goal <text>` sets, `/goal` views, `/goal pause`, `/goal resume`,
  and `/goal clear` manage the active goal.
- Enablement: experimental. If `/goal` is missing from the slash command list,
  enable `features.goals` in `config.toml` or run `codex features enable goals`.
- Length: objectives must be non-empty and at most 4,000 characters. Longer
  contracts go in a file with a short `/goal` pointing at it.
- Evaluation: official docs describe attach-and-track behavior. There is no
  documented independent per-turn evaluator.
- Persistence: goals persist across sessions (v0.128.0+).
- Neighbors: use `/plan` first to shape a goal, then set it with `/goal`.

## Claude Code

- Semantics: `/goal <condition>` sets a session-scoped completion condition.
  After each turn an independent small fast model (default Haiku) reads the
  transcript and decides yes/no; on "no" Claude starts the next turn
  automatically, on "yes" the goal clears itself.
- Commands: `/goal <condition>` sets (and immediately starts a turn with the
  condition as the directive), `/goal` shows status (condition, elapsed time,
  turns, token spend, latest evaluator reason), `/goal clear` removes it.
  `stop`, `off`, `reset`, `none`, and `cancel` are aliases for `clear`.
  There is no `/goal pause` and no `/goal resume`.
- Enablement: requires Claude Code v2.1.139+. Runs only in workspaces where
  the trust dialog was accepted. Unavailable when `disableAllHooks` is set at
  any settings level or `allowManagedHooksOnly` is set in managed settings.
- Length: conditions can be up to 4,000 characters.
- Evaluation constraint: the evaluator runs no tools and reads only the
  transcript. Evidence must be something Claude's own output can demonstrate:
  command exit codes, test output, lint output, `git status` / `git diff`
  results, file listings. Screenshots or external human confirmation are not
  visible to the evaluator.
- Bounding: include a turn or time clause in the condition, such as
  `or stop after 20 turns`, so the goal cannot run unbounded.
- Resume: an active goal is restored by `--resume` / `--continue`; elapsed
  time, turn count, and token baselines reset.
- Non-interactive: `claude -p "/goal ..."` runs the loop to completion once.
- Neighbors: `/loop` re-runs on a time interval; a Stop hook supports custom
  evaluation logic. Route to those when a time cadence or scripted check fits
  better than a completion condition.

## Rendering Rules

Shared contract first: outcome, verification, constraints, boundaries,
iteration policy, stop condition, pause/stop-and-report condition. Both
platforms keep the same field labels (Chinese or English per the output
contract). Platform differences enter at rendering time.

### Codex rendering

- Phrase the objective as an outcome to reach ("deliver X with Y verified").
- Keep existing field labels unchanged.
- Management answers may use `/goal pause` and `/goal resume`.
- Troubleshooting points at `features.goals`.

### Claude Code rendering

- Phrase the goal as a completion condition ("X is true, proven by Y").
- Verification evidence must be transcript-visible: command exit codes, test
  or lint output, `git status` / `git diff`, file existence listings. Rewrite
  screenshot-only or human-confirmation evidence into a transcript-visible
  check, or move it into constraints as guidance Claude follows but the
  evaluator does not judge.
- Always include a bounding clause such as
  `否则在 20 轮后停止并总结剩余问题` / `or stop after 20 turns and summarize
remaining issues`.
- Keep the `暂停条件` / `Pause if` label, but write its body as
  stop-and-report: Claude Code cannot pause a goal, so high-risk situations
  must instruct Claude to stop, report, and wait for a human decision (the
  user then clears or resets the goal).
- Never recommend `/goal pause` or `/goal resume` to a Claude Code user. For
  a pause request, explain the command does not exist and offer `/goal clear`
  plus re-setting later, or simply interrupting the session.

## Platform Selection

1. Explicit statement wins: if the user names Codex or Claude Code, render for
   that platform.
2. Otherwise infer from the host environment the skill is running in.
3. If still ambiguous, add one numbered choice to the existing 可选调整 block
   (for example `0. 平台：A Claude Code / B Codex`) instead of opening a
   separate questionnaire round.
