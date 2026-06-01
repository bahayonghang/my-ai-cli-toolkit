# Risk Gates

Use this checklist before launching or continuing a dynamic workflow.

## Ask For Approval

Ask one clear approval question before work that may:

- delete, overwrite, mass-rename, force-push, or rewrite history
- deploy, publish, email, post, create public resources, or mutate external systems
- run database migrations, broad codemods, or dependency upgrades
- touch credentials, secrets, billing, production data, user accounts, or private customer data
- spawn many agents, run expensive jobs, or consume unusual time or compute
- make changes outside the requested repository or workspace
- write artifacts outside the repo root or outside a user-approved local planning path
- depend on external production systems, paid APIs, or credentials

## Windows And Local Path Risks

Treat these as risk multipliers even when the work is local:

- unquoted paths that may contain spaces, especially under `C:\Users\...` or `D:\Documents\...`
- scripts that assume `/tmp`, `/bin/sh`, POSIX path separators, shell glob expansion, `nohup`, `open`, `cp -r`, or `rm -rf`
- workflow artifacts written into tracked source directories without checking existing planning conventions or ignore rules
- commands that write outside the requested repository root
- subagent or swarm claims when the current environment has no actual runner

Use `python` first and `py -3` as a Windows fallback in examples. Prefer `pathlib.Path` in Python scripts and pass argument lists to subprocesses instead of shell strings.

## Safe Without Extra Approval

Usually safe:

- reading local files in the requested workspace
- drafting plans, packet prompts, reports, or local artifacts in an existing ignored planning path
- running narrow tests, linters, typechecks, and dry runs
- creating non-destructive workflow directories under `.workflow/` only when durable artifacts are explicitly useful and acceptable for the repo
- simulating packets locally when no subagent runner exists
- spawning a small number of subagents only when the user explicitly asked for subagents, a swarm, parallel agents, or this dynamic workflow skill to run, and the write scopes are disjoint

## If Risk Is Ambiguous

Prefer a reversible next step:

1. Do a read-only inspection.
2. Draft the exact command or action.
3. Explain the likely effect.
4. Ask for approval before execution.

Do not bury multiple risky approvals in one broad question.
