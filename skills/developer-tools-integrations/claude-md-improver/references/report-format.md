# CLAUDE.md Improver Report Formats

Skeletons for the two required outputs. Keep table columns; replace placeholder values.

## Quality Report (Phase 4, before edits)

```markdown
## CLAUDE.md Quality Report

### Summary

- Files found: X (CLAUDE.md: X, CLAUDE.local.md: X, .claude/rules: X, code_map: X)
- Project root guidance: present at <path>/missing
- Root code map: present/missing/shared with agents-md-improver
- Nested project files: X (X over 200 lines)
- Average score: X/100
- Files needing update: X
- Candidate nested guidance dirs: X create / X candidate-only / X skipped

### Layering Map

| File                       | Loads when                          | Adds                                        | Notes        |
| -------------------------- | ----------------------------------- | ------------------------------------------- | ------------ |
| `CLAUDE.md`                | session start (ancestor)            | repo-wide pointers + gotchas                | 142 lines    |
| `packages/api/CLAUDE.md`   | reading files under `packages/api/` | API stack, local commands, secrets boundary | 88 lines     |
| `.claude/rules/testing.md` | reading `**/*.test.ts`              | TDD rules                                   | paths-scoped |

### Code Map Coverage

| Map           | Covers    | Referenced by            | Notes                          |
| ------------- | --------- | ------------------------ | ------------------------------ |
| `code_map.md` | repo root | `CLAUDE.md`, `AGENTS.md` | shared with agents-md-improver |

### Nested Guidance Candidates

| Directory       | Score | Decision                        | Evidence                                                     |
| --------------- | ----: | ------------------------------- | ------------------------------------------------------------ |
| `packages/api/` |    75 | create `packages/api/CLAUDE.md` | distinct Python stack, own pytest commands, secrets boundary |

### File-by-File Assessment

#### 1. `CLAUDE.md`

**Score: XX/100 (Grade: X)**

| Criterion                     | Score | Notes                        |
| ----------------------------- | ----: | ---------------------------- |
| additive layering clarity     |  X/20 | ...                          |
| executable commands and gates |  X/20 | ...                          |
| architecture and routing      |  X/15 | ...                          |
| tool permissions and safety   |  X/15 | ...                          |
| Claude Code workflow fit      |  X/15 | ...                          |
| conciseness and currency      |  X/15 | line count XXX vs 200 target |

**Issues**

- ...

**Proposed changes**

- ...
```

## Update Summary (after approved edits)

```markdown
## CLAUDE.md Update Summary

### Files changed

- `CLAUDE.md` — ...
- `packages/api/CLAUDE.md` — ...
- `.claude/rules/testing.md` — ...
- `code_map.md` — ...

### What improved

- layering clarity and root-vs-nested division of labor
- command/gate accuracy
- safety boundaries aligned with `.claude/settings.json`
- map-first search flow with explicit relative `code_map.md` paths
- root file shrunk from XXX to YYY lines

### Verification

- `git diff --check` — passed
- `<targeted command>` — passed/failed/skipped with reason

### Remaining risks

- ...
```
