# Codex context improver output contracts

Use the audit contract for read-only audit/explain/plan intent and the update
contract after authorized edits. Omit conditional sections that have no rows.

## Audit report

````markdown
## Codex Context Audit

### Outcome

<Concise conclusion, highest-risk issue, and recommended next action.>

### Prioritized Findings

| Severity | File / scope (path:line) | Evidence | Impact | Proposed change | Confidence |
| --- | --- | --- | --- | --- | --- |
| P1 | `<path>` | `<verified source or missing evidence>` | ... | ... | high/medium/low |

### Effective Instruction Chain

| Order | Directory | Selected file | Selection evidence | Bytes / budget status |
| ---: | --- | --- | --- | --- |
| 1 | `<root>` | `AGENTS.override.md` | highest-precedence non-empty candidate | ... |

### Relevant Context Sources

| Source / owner | Evidence in original task | Audit-time read / inference | Relevance |
| --- | --- | --- | --- |
| `<path:line or message>` | metadata only / selected body / named reference read / unknown | <what this audit adds, without claiming original load> | ... |

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

- Lead with the highest-severity finding before chain inventory, including for
  a short report. A budget overrun is a finding, not just an inventory detail.
  Findings are severity-ordered and each row names fact evidence, impact, a
  concrete proposed change, and confidence or `missing evidence`.
- Record target, requested action, authority and completion criteria. For each
  conflict cite both actual rules and their scope. Explain keep/narrow/move/delete
  without treating source age, repeated wording or file presence as causal proof.
- Use Relevant Context Sources only where loading/provenance affects a finding.
  Clearly distinguish present, discoverable metadata, selected/read content,
  audit-time reads and inferred applicability; no inventory is a runtime trace.
- A pause links the exact blocking rule/file and quotes the relevant instruction;
  explain its applicability, the missing decision
  and completed independent preparation. Existing scoped authority is not
  something to request again. Prepare a concrete diff to remove redundant gates.
- Include Effective Instruction Chain and Shadowed Candidates only when the
  launch context has multiple layers, alternatives, budget risk, or ambiguity.
- Include Proposed Diff only for files recommended to change. A proposed-change
  bullet is not a substitute for the diff.
- Omit scores and empty tables; use the smallest report the decision needs.

## Authorized update summary

```markdown
## Codex Context Update Summary

### Files Changed

- `<path>` - <behavioral purpose>

### Behavioral Outcome

- <intended behavior supported by source changes; current-session reload needs evidence>

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
