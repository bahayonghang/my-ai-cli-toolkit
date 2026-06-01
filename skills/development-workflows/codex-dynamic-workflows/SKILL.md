---
name: codex-dynamic-workflows
description: Plan and run AI-agent dynamic workflows for complex tasks that benefit from explicit orchestration, goal mode, subagents or simulated work packets, approval gates, integration, verification, and reusable workflow artifacts. Use when the user invokes this skill, asks for a swarm, subagents, parallel agents, a dynamic workflow, a large migration or audit, multi-track research plus implementation, or Claude Code-style workflow orchestration.
category: development-workflows
tags:
  - codex
  - orchestration
  - subagents
  - workflows
  - verification
version: 0.1.0
---

# AI Agent Dynamic Workflows

Use this skill to turn a large task into a supervised AI-agent workflow: draft an orchestration artifact, enter goal mode when sustained execution is requested, delegate disjoint work to subagents when available, integrate results, verify the outcome, and save reusable workflow artifacts.

This skill works in agents that support skills. Do not claim that a local script can call subagent tools unless the current environment exposes such a runner. When no programmable runner exists, create a human-readable orchestration script and operate it through the available agent tools.

## Decision Rule

Use dynamic orchestration when at least two are true:

- The task has independent research, coding, review, migration, QA, docs, or design tracks.
- The task is broad enough that an explicit success contract would reduce drift.
- The task has risk: destructive edits, external writes, deploys, secrets, production data, billing, user accounts, or large repo-wide changes.
- Verification benefits from a separate pass from implementation.
- The workflow could become a reusable recipe for future tasks.
- The user explicitly asks for a dynamic workflow, swarm, subagents, parallel agents, or Claude Code-style workflow.

If the task is small, do it directly and mention that full workflow orchestration was unnecessary.

## Operating Contract

When using this skill:

1. Restate the goal and success criteria.
2. Create or update a workflow artifact before delegating.
3. Ask for approval before risky, expensive, external, or destructive steps.
4. Enter goal mode when the user explicitly requests sustained execution or when the invoked task clearly requires multi-turn completion.
5. Split work into disjoint packets with clear ownership.
6. Spawn subagents only when the current environment allows it and the user has authorized delegated or parallel agent work.
7. Simulate subagents with isolated packet notes when no subagent runner is available.
8. Integrate results explicitly; do not paste raw subagent dumps as the final answer.
9. Verify with checks matched to the task's blast radius.
10. Save reusable artifacts only when they will help future work.

## Workflow Artifacts

Prefer creating a local run directory:

```text
.workflow/<slug>/
|-- plan.md
|-- state.json
|-- orchestration.md
|-- packets/
|-- results/
`-- final-report.md
```

Use `scripts/new_workflow.py` to scaffold this structure:

```bash
python3 /path/to/codex-dynamic-workflows/scripts/new_workflow.py "Task title"
```

Keep `plan.md` human-readable. Use `state.json` for status, packet IDs, approval state, and verification state. Use `orchestration.md` as the executable mental model: the sequence the agent will follow, the branching rules, and the packet prompts.

## Orchestration Plan

Draft a concise plan with:

```text
Goal:
Success criteria:
Current context:
Constraints:
Risks:
Approval required:
Workflow artifact path:
Work packets:
Integration policy:
Verification:
Reusable artifacts:
```

Do not over-plan obvious work. The plan should be detailed enough to guide delegation and verification, not a substitute for execution.

## Approval Gates

Ask one clear approval question before:

- deleting, overwriting, mass-renaming, or force-pushing
- running migrations or broad codemods
- deploying, publishing, emailing, posting, or changing external systems
- touching credentials, secrets, production data, billing, or user accounts
- spawning many agents or long-running expensive jobs
- making irreversible Git or repository operations

If approval is denied or unavailable, continue only with safe read-only planning, local drafts, or non-destructive checks.

Read `references/risk-gates.md` when risk is unclear.

## Goal Mode

If goal mode tools are available and the user has asked this skill to run the workflow, call goal mode with the full objective. Keep the objective intact; do not shrink it to the next step.

Do not enter goal mode for a small one-shot task, a purely advisory discussion, or when the user asks only for a plan.

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

When a subagent runner is available:

- Spawn only concrete, bounded, materially useful subtasks.
- Keep immediate blocking work local.
- Delegate sidecar work that can run while the main agent makes progress.
- Avoid duplicate work across agents.
- Ask workers to edit directly only when their write scope is disjoint and clear.
- Wait for subagents only when their result is needed for the next critical-path step.

When no subagent runner is available:

- Simulate the swarm with isolated packet passes.
- Read only packet-relevant files during each pass.
- Write packet notes under `results/`.
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

```bash
python3 /path/to/codex-dynamic-workflows/scripts/collect_results.py .workflow/<slug>
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

Use `scripts/verify_workflow.py` to check workflow artifact completeness:

```bash
python3 /path/to/codex-dynamic-workflows/scripts/verify_workflow.py .workflow/<slug>
```

Report skipped checks honestly. Do not treat a workflow as complete until the evidence proves the original success criteria.

## Reusable Recipes

When a run produces a useful pattern, save a concise recipe in a project-appropriate location, such as `.workflow/recipes/<name>.md` or a repo docs folder. Include:

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
