# Platform Goal Facts

Single source of truth for platform-specific `/goal` behavior. Other files in
this skill must reference these facts instead of restating them. If official
docs change, update this file first, then the prose that cites it.

Last verified: 2026-08-03 against
https://developers.openai.com/codex/cli/slash-commands,
https://developers.openai.com/codex/use-cases/follow-goals,
https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex,
https://learn.chatgpt.com/docs/long-running-work, and
https://code.claude.com/docs/en/goal.

Evidence labels below are deliberate: `official` means documented platform
behavior, `local-probe` means observed on the named local version, and
`community-observed` is not a platform guarantee.

## Codex (CLI and app)

- Semantics (official): `/goal` attaches an objective to the current thread;
  the goal text is both the first prompt and the completion criteria.
- Commands (official): `/goal <text>` sets, `/goal` views, `/goal edit` revises,
  `/goal pause` pauses, `/goal resume` resumes, and `/goal clear` removes a goal.
- Availability (official): Goals are available starting in Codex 0.128.0.
  A `local-probe` on Codex 0.146.0 reports `goals stable true`, so Goals are
  stable and enabled by default there. If `/goal` is missing, use the official
  troubleshooting fallback: enable `features.goals` in `config.toml` or run
  `codex features enable goals`.
- Length: objectives must be non-empty and at most 4,000 characters. Longer
  contracts go in a file with a short `/goal` pointing at it.
- Evaluation: official docs describe attach-and-track behavior. There is no
  documented independent per-turn evaluator.
- Permissions and decisions (official): starting a goal grants no broader
  access; the existing sandbox and approval policy remain, and Codex pauses
  when it needs a decision.
- Lifecycle (official): states include active, paused, cleared, completed, and
  budget-limited. User or system actions control pause, resume, clear, and
  budget transfer; the model may create a goal and mark it complete only when
  evidence supports completion.
- Goal shape (official): use Outcome, Constraints, and Verification; the
  cookbook expands these into outcome, verification surface, constraints,
  boundaries, iteration policy, and blocked stop conditions.
- Starting context (official): point Codex at files, docs, issues, logs, or a
  plan to read first; work in checkpoints and keep a short progress log.
- Neighbors (official): when the outcome is unclear, use `/plan` to interview
  the user, identify constraints, and form measurable success criteria before
  setting a goal.

### Community-observed Codex behavior

- `community-observed` (openai/codex PR #21954): `/goal edit` opens the current
  objective for revision. Active and paused goals keep their state, completed
  goals become active, and budget-limited goals stay budget-limited. Editing
  retains the goal's token budget and elapsed/token accounting; clear and
  create a new goal when that accounting must reset.
- `community-observed` (PR #21954 discussion): text such as `use up to 8000
  tokens` does not set a platform runtime budget. Treat goal-text time, turn,
  or token limits only as soft stop clauses and say so explicitly.
- `community-observed` (win4r/goal-prompt-builder): a `continuation.md` audit
  trail is a community workflow pattern, not an official Codex requirement.

## Claude Code

- Semantics: `/goal <condition>` sets a session-scoped completion condition.
  After each turn an independent small fast model (default Haiku) reads the
  transcript and decides yes/no; on "no" Claude starts the next turn
  automatically, on "yes" the goal clears itself.
- Commands: `/goal <condition>` sets (and immediately starts a turn with the
  condition as the directive), `/goal` shows status (condition, elapsed time,
  turns, token spend, latest evaluator reason), `/goal clear` removes it.
  `stop`, `off`, `reset`, `none`, and `cancel` are aliases for `clear`.
  Starting a new session with `/clear` also removes the active goal. There is
  no `/goal pause` and no `/goal resume`.
- Enablement: requires Claude Code v2.1.139+. Runs only in workspaces where
  the trust dialog was accepted. Unavailable when `disableAllHooks` is set at
  any settings level or `allowManagedHooksOnly` is set in managed settings.
- Permissions: a goal does not change tool permissions. In default permission
  mode, tool calls still require approval; unattended use must pair `/goal`
  with auto mode.
- Length: conditions can be up to 4,000 characters.
- Evaluation constraint: the evaluator runs no tools and reads only the
  transcript. Evidence must be something Claude's own output can demonstrate:
  command exit codes, test output, lint output, `git status` / `git diff`
  results, file listings. Screenshots or external human confirmation are not
  visible to the evaluator.
- Evaluation guidance: the evaluator returns a reason after every turn. Use
  the latest reason, shown in status, to redirect the next attempt.
- Goal shape: include a measurable end state, a stated verification method,
  and key constraints.
- Bounding: include a turn or time clause in the condition, such as
  `or stop after 20 turns`. This is a soft boundary reported each turn and
  judged from the conversation, not a hard timer or runtime budget.
- Resume: an active goal is restored by `--resume` / `--continue`; elapsed
  time, turn count, and token baselines reset.
- Mechanism: `/goal` wraps a session-level prompt-based Stop hook whose
  evaluator uses the configured small fast model (Haiku by default).
- Non-interactive: `claude -p "/goal ..."` runs the loop to completion once;
  default text output remains silent until completion, so prefer
  `--output-format stream-json --verbose` when progress output is required.
- Neighbors: `/loop` re-runs on a time interval; a Stop hook supports custom
  evaluation logic. Route to those when a time cadence or scripted check fits
  better than a completion condition.

## Rendering Rules

Shared contract first: outcome, verification, constraints, boundaries,
iteration policy, stop condition, pause/stop-and-report condition. Both
platforms keep the same field labels (Chinese or English per the output
contract). Platform differences enter at rendering time.

### Codex rendering

- Phrase the objective as an outcome to reach ("deliver X with Y verified");
  remember that the goal text is also the first prompt.
- Keep existing field labels unchanged.
- Management answers may use `/goal edit`, `/goal pause`, and `/goal resume`.
  When discussing edit accounting, retain the `community-observed` label above.
- Per the `community-observed` evidence above, treat time/token text only as a
  soft stop clause, distinct from the official `budget-limited` runtime state.
- Goals are stable and enabled by default on current Codex; troubleshooting
  older or managed environments may point at `features.goals`.

### Claude Code rendering

- Phrase the goal as a completion condition ("X is true, proven by Y").
- Verification evidence must be transcript-visible: command exit codes, test
  or lint output, `git status` / `git diff`, file existence listings. Rewrite
  screenshot-only or human-confirmation evidence into a transcript-visible
  check, or move it into constraints as guidance Claude follows but the
  evaluator does not judge.
- Always include a bounding clause such as
  `否则在 20 轮后停止并总结剩余问题` / `or stop after 20 turns and summarize
  remaining issues`, and describe it as evaluator-judged rather than a hard
  runtime timer.
- Keep the `暂停条件` / `Pause if` label, but write its body as
  stop-and-report: Claude Code cannot pause a goal, so high-risk situations
  must instruct Claude to stop, report, and wait for a human decision (the
  user then clears or resets the goal).
- Never recommend `/goal pause` or `/goal resume` to a Claude Code user. For
  a pause request, explain the command does not exist and offer `/goal clear`
  plus re-setting later, or simply interrupting the session.
- For unattended use, remind the user to pair `/goal` with auto mode. Use the
  latest evaluator reason as evidence for changing direction between turns.

## Platform Selection

1. Explicit statement wins: if the user names Codex or Claude Code, render for
   that platform.
2. Otherwise infer from the host environment the skill is running in.
3. If still ambiguous, add one numbered choice to the existing 可选调整 block
   (for example `0. 平台：A Claude Code / B Codex`) instead of opening a
   separate questionnaire round.
