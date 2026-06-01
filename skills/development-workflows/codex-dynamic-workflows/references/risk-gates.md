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

## Safe Without Extra Approval

Usually safe:

- reading local files in the requested workspace
- drafting plans, packet prompts, reports, or local artifacts
- running narrow tests, linters, typechecks, and dry runs
- creating non-destructive workflow directories under `.workflow/`
- spawning a small number of subagents when the user explicitly asked for subagents, a swarm, or this dynamic workflow skill to run

## If Risk Is Ambiguous

Prefer a reversible next step:

1. Do a read-only inspection.
2. Draft the exact command or action.
3. Explain the likely effect.
4. Ask for approval before execution.

Do not bury multiple risky approvals in one broad question.
