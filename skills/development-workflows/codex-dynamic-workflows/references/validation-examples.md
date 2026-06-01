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

- Create a workflow artifact.
- Enter goal mode if the user wants sustained execution.
- Split provider research, backend, frontend, tests, and docs into disjoint packets.
- Integrate results before final verification.

## Codebase Audit

Prompt:

```text
Use $codex-dynamic-workflows to audit this repo for slow startup and fix the biggest issue.
```

Expected behavior:

- Create audit packets for entrypoint tracing, dependency loading, test/build evidence, and fix candidates.
- Keep immediate blocking investigation local.
- Use subagents only for sidecar analysis.
- Implement one highest-confidence fix and verify it.

## No Subagent Runner

Prompt:

```text
Use $codex-dynamic-workflows to review this feature for security and reliability risks.
```

Expected behavior:

- Simulate subagents with isolated packet notes under `results/`.
- Keep security and reliability findings separate until integration.
- Produce a synthesized final report.
