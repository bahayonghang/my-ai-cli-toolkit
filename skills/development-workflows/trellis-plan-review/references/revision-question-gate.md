# Reviser confirmation gate

This gate binds the **handoff reviser**, the agent that consumes the
copyable prompt in `handoff-prompt.md`. It does not bind the reviewer
who loaded this skill. The reviewer still does not ask, edit planning
artifacts, or run `task.py start`.

## Classify before writing

Split remaining blockers into three classes:

1. Facts the repository can answer. Inspect the code, tests, configs, and
   artifacts. Do not ask.
2. Implementation choices inside already approved contracts and authority.
   Decide. Do not ask.
3. User-owned decisions that change scope, product semantics, risk, cost, or
   authorization. This includes mutually exclusive product options in a TPR
   `Route`, and start-front items the revision itself just introduced.

Only class 3 may use a structured question tool.

## Positive duty

When any class-3 item remains, call the host structured question tool **before**
continuing to write planning artifacts. One batch, at most four questions.
Each question has a recommended option and mutually exclusive choices.

Name the tool that actually exists on the host:

| Host | Tool in the handoff text |
| --- | --- |
| Claude Code | `AskUserQuestion` |
| Oh My Pi | `ask` |
| Codex | `request_user_input` if that is the live tool, else the current equivalent; never invent a name |
| Other / none | the actual available equivalent; if none, one concise numbered question |

Confirm the live tool name first. Do not write a Claude-only tool name as a
callable API on another host.

## Dump-and-wait is forbidden

Do not list confirmation options as chat prose and wait for the user to type
“请使用 AskUserQuestion” or any reminder. That extra round is a defect.

If no class-3 item remains, do not ask ceremonially.

## Write back in the same turn

After answers arrive, write only the decided clauses into the named members'
`prd.md`, `design.md`, `implement.md`, and jsonl manifests. Apply every
blocking and should-fix TPR in the same session. Unique routes need no
question; take them.

If the write-back creates new class-3 items, run one more structured batch
(still ≤4). Never fall back to a dumped list.

## Still not start

Do not run `task.py start`, `finish`, or `archive`. Do not claim the plan is
approved. When the session ends, the plan must be ready for a later
implementation request without another reminder planning round.

## Negative exclusions

Do not ask about:

- repository-answerable facts
- ordinary implementation details
- whether to fix a TPR whose Route is unique
- ceremonial confirmation when class 3 is empty
