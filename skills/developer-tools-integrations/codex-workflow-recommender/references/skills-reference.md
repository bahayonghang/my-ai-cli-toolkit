# Codex skill recommendations

Load this reference only when a repeated workflow may need a reusable skill.

## Discovery and placement

Current Codex discovery roots, verified 2026-07-23:

| Scope | Root |
| --- | --- |
| Project | `.agents/skills` from launch CWD toward repository root |
| User | `~/.agents/skills` |
| Admin | `/etc/codex/skills` |
| Built-in | bundled system skills |

A skill directory contains `SKILL.md`; references, scripts, assets, evals, and
tests are optional and must support a real behavior contract.

## Hard decision gate

Recommend a skill only when all apply:

- the job repeats or is costly to reconstruct;
- it has a reusable input/output contract;
- prompt/thread, AGENTS, memory, or an installed capability is insufficient;
- packaging the workflow lowers more ambiguity than context/maintenance cost.

One-off instructions stay in the prompt/thread. Durable repository rules belong
in AGENTS. Learned non-mandatory context may belong in memory. Prefer a suitable
installed plugin that already provides the workflow before creating a duplicate
skill.

Stack detection is not a creation reason. Tie a candidate to an observed
repeated failure or job, an owner, validation, and a defer/rollback condition.

## Recommendation contract

Name the job, evidence, existing capability, proposed scope/root, inputs and
output contract, maintenance owner, permission risk, verification task, and
rollback/defer reason. Creating or editing the skill requires separate approval.

Example project layout:

```text
.agents/skills/release-readiness/
  SKILL.md
  references/release-policy.md
  tests/contracts.test.mjs
```
