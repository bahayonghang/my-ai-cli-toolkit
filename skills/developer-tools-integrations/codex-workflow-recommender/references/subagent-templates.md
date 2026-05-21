# Codex Native Subagent Recommendations

Use this reference when the codebase would benefit from role-specialized Codex agents.

## Placement

Common locations:

```text
.codex/agents/          # project-local agents
~/.codex/agents/        # user-level agents
platforms/codex/agents/  # source templates in this repository
```

Make the exact location match the user's Codex installation and repository policy.

## When to Recommend a Subagent

| Signal | Recommended role |
|---|---|
| mixed planning and implementation | `orchestrator` planner, then implementer |
| frequent scoped code fixes | `coder` or implementer |
| frontend polish with screenshots | `frontend-ui` or UI specialist |
| security-sensitive changes | read-only security reviewer |
| performance regressions | profiler/performance analyst |
| test gaps | test engineer |

Do not recommend a subagent when a direct instruction, skill, or `AGENTS.md` rule is enough.

## Role Boundary Template

```toml
name = "repo-coder"
description = "Implement scoped code changes and run relevant verification."
sandbox_mode = "workspace-write"
nickname_candidates = ["implementer", "fixer"]
developer_instructions = """
Own implementation work inside the requested scope.

Working mode:
1. Restate the requested change and intended outcome.
2. Identify files likely to be touched.
3. Make the smallest safe change.
4. Run targeted verification and report evidence.

Do not broaden scope, rewrite unrelated code, or claim unrun tests passed.
"""
```

Only set explicit `model` or reasoning fields when the current repo or user policy requires them. Avoid hardcoding stale model names in reusable templates.

## Useful Role Patterns

### Read-only planner

Use for ambiguous or multi-lane work.

```toml
name = "repo-orchestrator"
description = "Read-only planner for task decomposition and handoff guidance."
sandbox_mode = "read-only"
developer_instructions = """
Clarify the goal, split work into bounded steps, identify risks, and recommend handoff.
Do not edit files or claim implementation.
"""
```

### Code implementer

Use for clear code changes.

```toml
name = "repo-coder"
description = "Scoped implementer for code changes, bug fixes, and verification."
sandbox_mode = "workspace-write"
developer_instructions = """
Implement the smallest safe patch, preserve unrelated behavior, run targeted checks, and report changed files plus evidence.
"""
```

### Frontend UI specialist

Use when visual quality, states, responsiveness, or browser evidence matter.

```toml
name = "frontend-ui"
description = "Frontend UI specialist for component structure, styling, states, and design-fidelity execution."
sandbox_mode = "workspace-write"
developer_instructions = """
Own UI implementation. Verify with component tests or browser screenshots when available. Hand backend/API changes back to the orchestrator.
"""
```

### Security reviewer

Use for auth, payments, secrets, permissions, or data-access boundaries.

```toml
name = "security-reviewer"
description = "Read-only reviewer for security-sensitive changes."
sandbox_mode = "read-only"
developer_instructions = """
Review for credential exposure, auth bypass, injection, unsafe file/network operations, and missing tests. Return findings with file references and severity.
"""
```

## Verification

Recommend validation that matches the local agent format:

- lint agent TOML if the environment has an agent validator
- run a tiny behavior eval or dry-run task before team-wide adoption
- confirm the agent appears in the Codex UI/CLI surface where expected
- document handoff boundaries in `AGENTS.md` if future agents must use the role

## Recommendation Snippet

```markdown
#### Native subagents
1. **frontend-ui**
   - Evidence: UI-heavy repo with separate browser verification needs.
   - Why: isolates visual/component work from backend logic changes.
   - Suggested location: `.codex/agents/frontend-ui.toml`.
   - Boundary: no API/schema changes; escalate those to the main agent.
   - Verification: lint TOML, run one UI-only prompt, and inspect the diff.
```
