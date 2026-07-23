# AGENTS.md improver output contracts

Use the audit contract for read-only audit/optimize/plan intent and the update
contract after authorized edits. Omit conditional sections that have no rows.

## Audit report

````markdown
## AGENTS.md Audit

### Outcome

<Concise conclusion, highest-risk issue, and recommended next action.>

### Prioritized Findings

| Severity | File / scope | Evidence | Impact | Proposed change | Confidence |
| --- | --- | --- | --- | --- | --- |
| P1 | `<path>` | `<verified source or missing evidence>` | ... | ... | high/medium/low |

### Effective Instruction Chain

| Order | Directory | Selected file | Selection evidence | Bytes / budget status |
| ---: | --- | --- | --- | --- |
| 1 | `<root>` | `AGENTS.override.md` | highest-precedence non-empty candidate | ... |

### Shadowed Candidates

| File | Why shadowed or inactive | Activating CWD / condition |
| --- | --- | --- |
| `<path>` | ... | ... |

### Guidance and Navigation Decisions

| Directory | AGENTS decision | Instruction evidence / no-create reason | code_map decision | Navigation evidence / no-create reason |
| --- | --- | --- | --- | --- |
| `<path>` | keep/create/update/do not create | ... | keep/create/update/do not create | ... |

### Proposed Diff

#### `<path>`

```diff
<smallest proposed change>
```

### Validation Plan

- `<check>` - <claim it proves>

### Remaining Risks

- `<risk or missing evidence>`
````

Rules:

- Findings are severity-ordered and each row names fact evidence, impact, a
  concrete proposed change, and confidence or `missing evidence`.
- Include Effective Instruction Chain and Shadowed Candidates only when the
  launch context has multiple layers, alternatives, budget risk, or ambiguity.
- Include Proposed Diff only for files recommended to change. A proposed-change
  bullet is not a substitute for the diff.
- Average scores, if useful, follow the findings; they are not the outcome.

## Authorized update summary

```markdown
## AGENTS.md Update Summary

### Files Changed

- `<path>` - <behavioral purpose>

### Behavioral Outcome

- <what future Codex runs now select, understand, or avoid>

### Preservation Boundaries

- <human content, managed markers, sibling coexistence, and global scope kept intact>

### Verification

| Check | Status | Evidence |
| --- | --- | --- |
| `<command or inspection>` | passed / failed / skipped | <result or reason> |

### Remaining Risks

- `<risk or missing evidence>`
```

Never convert a failed, skipped, unavailable, recorded-fixture, or inferred
check into a pass. Name `missing evidence` directly when required proof was not
available.
