# AGENTS.md Improver Report Formats

Skeletons for the two required outputs. Keep table columns; replace placeholder values.

## Quality Report (Phase 4, before edits)

```markdown
## AGENTS.md Quality Report

### Summary

- Files found: X
- Root guidance: present/missing
- Root code map: present/missing
- Nested scoped files: X
- Nested code maps: X
- Average score: X/100
- Files needing update: X
- Candidate nested guidance dirs: X create / X candidate-only / X skipped

### Scope Map

| File                     | Governs           | Parent guidance | Notes |
| ------------------------ | ----------------- | --------------- | ----- |
| `AGENTS.md`              | repo root         | none            | ...   |
| `packages/api/AGENTS.md` | `packages/api/**` | root            | ...   |

### Code Map Coverage

| Map           | Covers    | Referenced by | Notes |
| ------------- | --------- | ------------- | ----- |
| `code_map.md` | repo root | `AGENTS.md`   | ...   |

### Nested Guidance Candidates

| Directory       | Score | Decision                                                     | Evidence                           |
| --------------- | ----: | ------------------------------------------------------------ | ---------------------------------- |
| `packages/api/` |    75 | create `packages/api/AGENTS.md` + `packages/api/code_map.md` | independent tests, deploy boundary |

### File-by-File Assessment

#### 1. `AGENTS.md`

**Score: XX/100 (Grade: X)**

| Criterion                     | Score | Notes |
| ----------------------------- | ----: | ----- |
| scope and override clarity    |  X/20 | ...   |
| executable commands and gates |  X/20 | ...   |
| architecture and ownership    |  X/15 | ...   |
| safety and permissions        |  X/15 | ...   |
| Codex workflow fit            |  X/15 | ...   |
| conciseness and currency      |  X/15 | ...   |

**Issues**

- ...

**Proposed changes**

- ...
```

## Update Summary (after approved edits)

```markdown
## AGENTS.md Update Summary

### Files changed

- `AGENTS.md` — ...
- `packages/api/AGENTS.md` — ...
- `code_map.md` — ...
- `packages/api/code_map.md` — ...

### What improved

- scope/override clarity
- command/gate accuracy
- safety boundaries
- map-first search flow with explicit relative `code_map.md` paths

### Verification

- `git diff --check` — passed
- `<targeted command>` — passed/failed/skipped with reason

### Remaining risks

- ...
```
