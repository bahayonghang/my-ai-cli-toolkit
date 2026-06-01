---
name: codex-dynamic-workflows
description: Use only when the user explicitly asks for swarm, subagents, parallel agents, dynamic workflow, multi-agent orchestration, 多智能体编排, or when the task truly needs coordinated research plus implementation plus review plus verification packets. Do not use for ordinary code review, planning-only work, single-line bugfixes, routine audits, or migrations unless orchestration is requested or at least two independent workflow dimensions are present.
argument-hint: "[task-or-workflow-brief]"
category: development-workflows
tags:
  - codex
  - orchestration
  - subagents
  - workflows
  - verification
version: 0.2.0
---

# AI Agent Dynamic Workflows

Use this skill to decide whether a Codex task needs dynamic workflow orchestration, then safely shape and run that workflow only when the trigger is real. A valid workflow has an explicit success contract, disjoint work packets, an integration policy, and verification matched to risk.

This skill works in agents that support skills. Do not claim that a local script can call subagent tools unless the current environment exposes such a runner. When no programmable runner exists, create a human-readable orchestration artifact, simulate packets locally, and operate only through the available agent tools.

## Trigger Boundary

Trigger this skill when the user explicitly asks for one of these ideas:

- swarm, subagents, parallel agents, multi-agent workflow, dynamic workflow, agent orchestration
- 多智能体、多 agent、并行智能体、动态工作流、编排、分包执行
- a coordinated workflow that combines research, implementation, review, and verification across independent packets

Do **not** trigger this skill for these prompts by themselves:

- ordinary code review or PR review
- planning-only discussion or an implementation plan with no execution orchestration request
- a single-thread bugfix, typo fix, local script edit, or small refactor
- a routine audit or migration where one agent can inspect, edit, and verify directly
- broad words such as “large”, “audit”, or “migration” without a packeted orchestration need

If a prompt names this skill explicitly but the task is too small, say that full orchestration is unnecessary and proceed directly without creating workflow artifacts unless the user asked for durable artifacts.

## Decision Rule

Use dynamic orchestration when the explicit trigger is present **or** at least two independent workflow dimensions are present:

- research or dependency/API investigation
- implementation across disjoint files or modules
- dedicated review, security, risk, or UX packet
- test, QA, migration dry-run, or verification packet
- docs, examples, rollout, or operational handoff packet
- reusable workflow recipe or durable artifact needed for later runs

Risk can strengthen the case for orchestration, but risk alone is not a trigger. For risky but single-thread work, inspect locally, draft the approval gate, and proceed only through the normal safety rules.

## Operating Contract

When using this skill:

1. Restate the goal and pass/fail success criteria.
2. Decide whether orchestration is necessary before creating artifacts.
3. Choose a repo-local artifact path that follows existing planning conventions.
4. Ask for approval before risky, expensive, external, or destructive steps.
5. Enter goal mode only when the user explicitly requests durable goal mode or sustained execution.
6. Split work into disjoint packets with clear ownership and verification.
7. Spawn subagents only when the current environment exposes a runner and the user authorized delegated or parallel agent work.
8. Simulate subagents with isolated packet notes when no runner exists.
9. Integrate results explicitly; do not paste raw subagent dumps as the final answer.
10. Verify with checks matched to the task's blast radius.
11. Save reusable artifacts only when they will help future work and will not pollute the repository.

## Workflow Artifacts

Before writing artifacts, inspect the repository for existing planning conventions and ignore rules. Prefer, in order:

1. Existing repo-local planning locations such as `.planning/`, `.plannings/`, `.omx/plans/`, `task_plan.md`, `progress.md`, or `findings.md` when they already govern the repo.
2. A user-specified artifact path.
3. `.workflow/<slug>/` only when durable workflow artifacts are genuinely useful and the path is ignored, local-only, or acceptable for the repo.

Do not edit `.gitignore` just to hide `.workflow/` unless the user explicitly asks. If `.workflow/` would create unwanted tracked noise, keep packet notes in the existing planning path or present the workflow in chat.

A durable run directory uses this shape:

```text
.workflow/<slug>/
|-- plan.md
|-- state.json
|-- orchestration.md
|-- packets/
|-- results/
`-- final-report.md
```

Use `scripts/new_workflow.py` to scaffold this structure. Cross-platform examples:

```powershell
python .\skills\development-workflows\codex-dynamic-workflows\scripts\new_workflow.py "Task title"
py -3 .\skills\development-workflows\codex-dynamic-workflows\scripts\new_workflow.py "Task title" --packet "01-research:Provider research" --packet "02-tests:Verification plan"
```

```bash
python <skill-dir>/scripts/new_workflow.py "Task title" --packet "01-research:Provider research"
```

Keep paths quoted when they may contain spaces. Prefer `python` with `py -3` as a Windows fallback. Avoid POSIX-only helpers such as `nohup`, `open`, `cp -r`, or shell globs in workflow instructions.

Keep `plan.md` human-readable. Use `state.json` for status, packet IDs, approval state, runner capabilities, artifact policy, platform notes, and verification state. Use `orchestration.md` as the executable mental model: sequence, branching rules, packet prompts, and integration rules.

## Orchestration Plan

Draft a concise plan with:

```text
Goal:
Success criteria:
Current context:
Constraints:
Risks:
Approval required:
Artifact policy:
Runner capabilities:
Platform notes:
Workflow artifact path:
Work packets:
Integration policy:
Verification:
Reusable artifacts:
```

Do not over-plan obvious work. The plan should guide delegation and verification, not replace execution.

## Approval Gates

Ask one clear approval question before:

- deleting, overwriting, mass-renaming, or force-pushing
- running migrations or broad codemods
- deploying, publishing, emailing, posting, or changing external systems
- touching credentials, secrets, production data, billing, or user accounts
- spawning many agents or long-running expensive jobs
- making irreversible Git or repository operations
- writing outside the requested repository or agreed artifact path

If approval is denied or unavailable, continue only with safe read-only planning, local drafts, or non-destructive checks.

Read `references/risk-gates.md` when risk is unclear.

## Goal Mode

Enter goal mode only when the user explicitly requests durable goal execution, goal mode, sustained autonomous execution, or a named runtime that requires it. Do not infer goal mode merely because a task looks multi-step or may take multiple turns.

When goal mode tools are available and explicitly requested, call goal mode with the full objective. Keep the objective intact; do not shrink it to the next step.

In Codex App, outside tmux, or any environment without OMX/runtime goal tools, do not pretend goal mode was started. Use the currently available tools, local artifacts, and normal verification instead.

Do not enter goal mode for a small one-shot task, a purely advisory discussion, ordinary planning, or a workflow artifact draft.

## Work Packets

Each packet must be self-contained:

```text
Packet ID:
Objective:
Context:
Files / sources:
Ownership:
Do:
Do not:
Expected output:
Verification:
```

Prefer packets with disjoint ownership:

- codebase discovery
- dependency or API research
- implementation slice
- tests and fixtures
- docs and examples
- UX or product review
- security or risk review
- final verification

For code-edit packets, assign non-overlapping files or modules. Tell workers they are not alone in the codebase, must not revert others' edits, and must adapt to concurrent changes.

## Subagents

When a subagent runner is available and the user authorized delegated or parallel agent work:

- Spawn only concrete, bounded, materially useful subtasks.
- Keep immediate blocking work local.
- Delegate sidecar work that can run while the main agent makes progress.
- Avoid duplicate work across agents.
- Give workers disjoint write scopes before allowing edits.
- Wait for subagents only when their result is needed for the next critical-path step.

When no subagent runner is available or authorization is absent:

- Do not claim that a swarm ran.
- Split packets in the plan and execute safe local passes yourself.
- Read only packet-relevant files during each pass.
- Write packet notes under `results/` only when a durable artifact is appropriate.
- Integrate only after packet outputs are separate.

## Integration

After packets complete, synthesize:

```text
Accepted:
Rejected:
Conflicts:
Decisions:
Final changes:
Remaining risks:
```

Resolve conflicts explicitly. If two packets disagree, inspect the authoritative source before choosing.

Use `scripts/collect_results.py` to produce an integration checklist from result files:

```powershell
python .\skills\development-workflows\codex-dynamic-workflows\scripts\collect_results.py .workflow\<slug>
```

```bash
python <skill-dir>/scripts/collect_results.py .workflow/<slug>
```

## Verification

Run the narrowest reliable checks first, then broaden as risk warrants:

- unit tests for touched code
- typecheck or lint
- build
- browser or UI smoke test
- script dry run
- source citation check
- migration dry run
- manual checklist for non-code work

Use `scripts/verify_workflow.py` to check artifact readiness:

```powershell
python .\skills\development-workflows\codex-dynamic-workflows\scripts\verify_workflow.py .workflow\<slug> --level structure
py -3 .\skills\development-workflows\codex-dynamic-workflows\scripts\verify_workflow.py .workflow\<slug> --level ready
```

```bash
python <skill-dir>/scripts/verify_workflow.py .workflow/<slug> --level complete
```

Verification levels:

- `structure`: base files/directories exist and `state.json` is valid.
- `ready`: structure plus at least one packet file.
- `complete`: ready plus at least one result file and a non-empty final report. This is the default and preserves the previous strict check.

Report skipped checks honestly. Do not treat a workflow as complete until the evidence proves the original success criteria.

## Reusable Recipes

When a run produces a useful pattern, save a concise recipe in a project-appropriate location, such as an existing planning folder, `.workflow/recipes/<name>.md`, or a repo docs folder. Include:

- trigger
- plan shape
- packet list
- verification checklist
- known risks

Do not save transcripts, secrets, bulky logs, credentials, or sensitive personal details.

## References

- Read `references/plan-schema.md` when a machine-readable workflow plan is useful.
- Read `references/risk-gates.md` before risky or ambiguous operations.
- Read `references/validation-examples.md` when forward-testing or improving this skill.
