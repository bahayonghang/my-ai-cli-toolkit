# Validation Examples

Use these examples to forward-test this skill.

## Small Task

Prompt:

```text
Use $codex-dynamic-workflows to fix a typo in README.md.
```

Expected behavior:

- Decide full orchestration is unnecessary.
- Make the edit directly.
- Verify the diff.
- Do not create a workflow directory unless the user insists.

## Ordinary Code Review Negative Trigger

Prompt:

```text
Please do a code review of this PR and check the tests.
```

Expected behavior:

- Do not trigger this skill from ordinary review wording alone.
- Use the repo's normal code-review workflow or answer directly.
- Do not create `.workflow/` and do not simulate subagents.

## Risky Migration

Prompt:

```text
Use $codex-dynamic-workflows to migrate all API clients from REST to GraphQL and delete the old client.
```

Expected behavior:

- Draft plan and success criteria.
- Mark deletion and broad migration as approval-gated.
- Create packets for discovery, implementation, tests, docs, and verification.
- Ask before destructive edits.

## Parallel Research And Implementation

Prompt:

```text
Use $codex-dynamic-workflows to add SSO support. Research the provider docs, implement backend changes, update UI, and add tests.
```

Expected behavior:

- Create a workflow artifact only after checking existing planning paths and ignore rules.
- Enter goal mode only if the user explicitly wants durable goal execution.
- Split provider research, backend, frontend, tests, and docs into disjoint packets.
- Integrate results before final verification.

## Windows PowerShell Scaffold

Prompt:

```text
Use $codex-dynamic-workflows on Windows for a provider migration and create packets.
```

Expected behavior:

- Provide a PowerShell-runnable command such as:

```powershell
python .\skills\development-workflows\codex-dynamic-workflows\scripts\new_workflow.py "Provider migration" --packet "01-research:Provider research"
py -3 .\skills\development-workflows\codex-dynamic-workflows\scripts\verify_workflow.py .workflow\provider-migration --level ready
```

- Quote paths if they contain spaces.
- Avoid `/tmp`, shell globs, `nohup`, `open`, `cp -r`, and `rm -rf` as required assumptions.

## Codebase Audit With Orchestration Need

Prompt:

```text
Use $codex-dynamic-workflows to audit this repo for slow startup and fix the biggest issue. Split discovery, test evidence, implementation, and verification into packets.
```

Expected behavior:

- Create audit packets for entrypoint tracing, dependency loading, test/build evidence, fix candidates, and final verification.
- Keep immediate blocking investigation local.
- Use subagents only for sidecar analysis when a runner exists and the user authorized it.
- Implement one highest-confidence fix and verify it.

## No Subagent Runner

Prompt:

```text
Use $codex-dynamic-workflows to review this feature for security and reliability risks, but this environment has no subagent runner.
```

Expected behavior:

- Do not say a swarm or subagents ran.
- Simulate packets with isolated local passes and optional notes under `results/` only if artifacts are appropriate.
- Keep security and reliability findings separate until integration.
- Produce a synthesized final report.

## Explicit Goal Mode Only

Prompt:

```text
Use $codex-dynamic-workflows to plan this multi-step feature.
```

Expected behavior:

- Do not enter goal mode because this is planning-only.
- If the user instead says “start durable goal mode and keep executing until done,” then call available goal tools with the full objective.
