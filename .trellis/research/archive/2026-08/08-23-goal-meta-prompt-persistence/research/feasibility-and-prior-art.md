# Feasibility and prior-art research: persistent Goal contract

- Researched at: 2026-08-23 (Asia/Shanghai)
- Target: `skills/developer-tools-integrations/goal-meta-skill/`
- Queries: `persist agent goal contract markdown`; `cross-session agent handoff prompt file`; `project task prompt file agent`
- Catalogs: skills.sh CLI, SkillsMP API, GitHub source, official OpenAI and Anthropic docs
- Rating evidence: unavailable; installs and repository stars are not ratings
- Platform extension: Grok Build, Oh My Pi, and Kimi Code were verified against
  first-party docs/canonical source; see `platform-goal-modes-grok-omp-kimi.md`.

## Verdict

The requested design is feasible and useful if it is framed as an explicit,
project-local handoff artifact rather than automatic platform memory.

A fresh Agent can reliably be told to read a root Markdown file, but neither
Codex nor Claude Code documentation says an arbitrary `GOAL.md` is automatically
loaded. The robust pattern is therefore:

1. persist one approved contract at root `GOAL.md`;
2. return a selected-platform `/goal` that explicitly reads (or, where proven,
   `@`-references) the file;
3. require the Agent to restate goal, constraints, verification and stop gates;
4. refuse silent overwrite and report whether the file is visible to Git;
5. keep formal project/Trellis artifacts authoritative;
6. render lifecycle, budgets, file references, and stop states through separate
   Claude/Codex/Grok/OMP/Kimi adapters rather than a universal command table.

This removes chat-length and context-loss pressure while avoiding a false claim
that a new Agent inherits the old session.

## Current repository evidence

- `SKILL.md:34,74` already defines a long-contract pointer at
  `.planning/goal-<slug>.md`, but instructs the user to save it manually.
- `references/default-goal-strategy.md:80-89` makes file creation a separate,
  explicitly requested action.
- `scripts/lint_goal_command.py:159-183` measures a short `/goal` block up to the
  next blank line and directs long contracts to a file, but does not validate a
  persistent root contract.
- `tests/lint-goal-command.test.mjs:193` pins a narrow, described-as-read-only
  tool grant; a writer must either use an explicitly documented helper within
  the existing Python grant or honestly add a write tool and update the suite
  contract.
- `.planning/` is ignored in this repository, while a root `GOAL.md` is not.
  Root placement improves visibility but introduces tracked/ignored/untracked
  and collision decisions that the current file-pointer design avoids.

## Official platform facts

### Codex

OpenAI's [Goal mode guidance](https://developers.openai.com/codex/long-running-work)
says the `/goal` text becomes both the first prompt and completion criteria, and
recommends outcome, constraints, and verification. It also says independent
parallel work should use separate chats/worktrees.

OpenAI's [AGENTS.md discovery documentation](https://developers.openai.com/codex/agent-configuration/agents-md)
documents automatic loading for `AGENTS.md` / configured fallback names, not an
arbitrary root `GOAL.md`. Therefore “open Goal mode” alone is insufficient; the
Goal text must explicitly say to read the file.

### Claude Code

Anthropic's [Goal documentation](https://code.claude.com/docs/en/goal) says a
goal is session-scoped, setting it starts a turn, and its independent evaluator
judges only what Claude surfaces in the conversation. The contract must require
commands/evidence and a bounded turn/time clause in the transcript.

Anthropic's [memory documentation](https://code.claude.com/docs/en/memory)
documents automatic loading for `CLAUDE.md`, and documents `@path` imports from
CLAUDE.md. Its [common workflows](https://code.claude.com/docs/en/tutorials)
document `@file` references in messages. A target-specific Claude launch can use
`@GOAL.md`, but the file remains task context rather than a new policy file.

### Grok Build, Oh My Pi, and Kimi Code

The dated primary-source matrix is recorded in
`platform-goal-modes-grok-omp-kimi.md`. All three have native persistent Goal
modes, but their management surfaces are incompatible: Grok uses
`status/pause/resume/clear` and optional `--budget`; OMP uses
`set/show/pause/resume/drop/budget`; Kimi uses
`status/pause/resume/cancel/replace/next` and has distinct headless exit codes.

Kimi's canonical repository contains a root
[`GOAL.md`](https://github.com/MoonshotAI/kimi-code/blob/368b4b7400228028006c9b0d5789fcced85f75aa/GOAL.md)
that documents the product's own Goal architecture. This is concrete precedent
for a visible single-file goal artifact, but it is not evidence of automatic
runtime discovery. The safe cross-platform launch remains an explicit read.

## Options

| Option | Benefits | Costs / risks | Decision |
| --- | --- | --- | --- |
| Keep chat-only `.planning/...` suggestion | No write risk; ignored path | User must copy; fresh Agent can miss it | Retain for ordinary/named compatibility, not recommended handoff |
| Root `GOAL.md` single active contract | One obvious path; easy short `/goal`; reviewable | Git noise; one-goal collision; not auto-loaded | Recommended for explicit persistence/handoff |
| Root `GOAL.<slug>.md` per goal | Supports history/concurrency | Root clutter; user must remember filename | Conflict fallback only |
| `.goal-task/<slug>/` state bundle | Rich recovery and progress | Duplicates Trellis; multiple truth files; much larger scope | Reject for this task |
| Import contract from AGENTS/CLAUDE | Automatic context | Pollutes every session; changes instruction authority | Reject by default |
| Store in agent-native memory | Cross-session convenience | Harness-specific, less inspectable, may be stale | Reject; file is portable contract |

## Shortlist and source review

| Candidate | Signal observed 2026-08-23 | Mechanism learned | Deliberate limit | License |
| --- | --- | --- | --- | --- |
| [imbajin/goal-prompt](https://github.com/imbajin/goal-prompt/blob/master/skills/goal-prompt/SKILL.md) | skills.sh CLI returned 28 installs while its web page showed 25; mutable cache evidence only | Confirm an initialization brief before writing; validate every referenced path; keep a short `/goal` pointing to durable truth | Its deep `.goal-task/<slug>/state/todo/design/lessons` bundle is broader than one handoff file and explicitly avoids `goal.md` | Apache-2.0 |
| [oh-my-claudecode ultragoal](https://github.com/Yeachan-Heo/oh-my-claudecode/blob/main/skills/ultragoal/SKILL.md) | SkillsMP reported repository stars, not skill quality; no rating evidence | Separate durable repo state from session-scoped `/goal`; print a model-facing handoff; guard concurrent plan IDs | Ledger, multi-story orchestration and CLI runtime are unnecessary here | MIT |
| [ToolMonsters handoff](https://github.com/ToolMonsters/handoff-skill/blob/main/SKILL.md) | GitHub showed 36 stars and one commit; source inspected, maintenance depth limited | One portable Markdown, zero invention, exact paths/names, written for a stranger | Full verbatim conversation can leak secrets and bloat; this Goal contract should contain only execution-relevant facts | MIT |
| [fmaher agent-handoff](https://github.com/fmaher/agent-skills/blob/main/skills/agent-handoff/SKILL.md) | Source inspected; rating/maintenance evidence unavailable | Two-part delivery: durable prompt file plus a 3-4 line pointer; required-reading and prerequisite gates | Universal “start in plan mode” conflicts with a user explicitly starting Goal mode; use only for irreversible-first-action cases | License evidence not verified |

## Keep / adapt / reject / invent

### Keep

- Existing read-only reconnaissance, real command discovery, 4k guard,
  platform-specific rendering, Trellis cadence, and S6 final confirmation.
- Durable file plus short pointer as two separate layers.
- Fresh-Agent contract includes objective, scope, evidence, blockers, and next
  startup action; no invented facts.

### Adapt

- From `goal-prompt`: retain explicit initialization authorization and referenced
  path verification, but write one immutable root contract instead of a state
  directory.
- From `ultragoal`: retain the distinction between durable disk truth and
  session `/goal`, but omit CLI ledger/orchestration.
- From handoff skills: retain a stranger-readable document and short pointer,
  but summarize only task-relevant evidence; do not copy raw transcripts.
- From official docs: Codex uses explicit `read ./GOAL.md`; Claude may use
  `@GOAL.md` and must surface evidence in transcript.
- From Grok/OMP/Kimi sources: keep one contract but isolate lifecycle grammar;
  use explicit reads until file-reference behavior inside `/goal` is proven.
- From Kimi's own root `GOAL.md`: retain a visible stable objective contract,
  while keeping live runtime progress and task systems separate.

### Reject

- Claiming `GOAL.md` auto-loads.
- Blending `clear`, `drop`, `cancel`, `replace`, `next`, or `budget` into a
  supposedly universal management answer.
- Writing on every goal request or during read-only reconnaissance.
- Silent overwrite, automatic ignore/commit/push, hidden file mutation, or
  storing secrets.
- Making Goal persistence a memory vault, progress database, or Trellis clone.
- Automatically importing a task-specific contract into AGENTS/CLAUDE.

### Invent

- A Governed root-contract mode with create-only default, expected-hash replace,
  root containment, symlink/reparse refusal, UTF-8/LF, secret non-echo, readback
  hash, and tracked/ignored/untracked report.
- One cross-platform Markdown schema plus platform-specific launch adapters.
- Baseline drift guard that makes a fresh Agent compare current repository truth
  before acting instead of blindly trusting a stale handoff.

## Qiaomu discovery notes and missing evidence

The bundled unified runner failed before producing JSON because Windows Python
could not launch the extensionless `npx` command (`WinError 2`) although
`npx.cmd` exists. Per the Qiaomu degradation rule, the underlying skills.sh CLI
and SkillsMP client were run separately; the failure remains missing evidence
rather than being hidden.

Other missing evidence:

- no public rating/review field for the shortlisted skills;
- no fair before/after provider comparison for this repository's skill;
- no fresh Codex or Claude session has yet demonstrated that the proposed
  pointer reads, restates and follows the generated contract;
- no fresh Grok Build, OMP, or Kimi Code session has demonstrated its proposed
  pointer; combined `@GOAL.md` + `/goal` behavior is especially unverified for
  these platforms;
- no cross-worktree/cloud test proves an untracked `GOAL.md` is available (it is
  expected not to be, based on filesystem semantics);
- secret pattern checks cannot prove a file contains no sensitive data.

These must remain `UNVERIFIED` / `missing evidence` until implementation-stage
tests produce named evidence.
