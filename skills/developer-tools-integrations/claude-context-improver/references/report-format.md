# Claude Context Improver Report Formats

Skeletons for the two required outputs. Keep table columns; replace placeholder values.

## Quality Report (Phase 4, before edits)

```markdown
## Claude Context Quality Report

**Scope: 当前仓库 / 全局** (`<repo path>` or `~/.claude`)

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

### Context Engineering Findings

Cross-layer findings that no single file's score captures. Omit rows with nothing to report.

| Finding              | Where                                         | Evidence                                                            | Recommendation                                 |
| -------------------- | --------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| conflict             | `CLAUDE.md` L42 vs `.claude/rules/docs.md` L8 | root forbids comments; rule asks for docstrings on public functions | keep the rule, delete the root absolute        |
| over-constraint      | `CLAUDE.md` L15-19                            | five `NEVER` rules on formatting and comments                       | rewrite as intent; keep only the secrets one   |
| obvious content      | `CLAUDE.md` L60-78                            | directory listing reproducing `ls packages/`                        | move routing value to `code_map.md`, drop rest |
| memory dump          | `CLAUDE.md` L120-134                          | "we tried Redis and reverted" history                               | drop; auto memory covers it                    |
| example wall         | `CLAUDE.md` L88-110                           | four full commit-message examples                                   | replace with the format contract               |
| extraction candidate | `CLAUDE.md` L140-166                          | 9-step release procedure inline                                     | belongs in a skill; `CLAUDE.md` points to it   |

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

| Criterion                          | Score | Notes                        |
| ---------------------------------- | ----: | ---------------------------- |
| judgement fit and conflict-freedom |  X/20 | ...                          |
| additive layering clarity          |  X/15 | ...                          |
| executable commands and gates      |  X/15 | ...                          |
| progressive disclosure             |  X/15 | ...                          |
| architecture and routing           |  X/10 | ...                          |
| tool permissions and safety        |  X/10 | ...                          |
| Claude Code workflow fit           |  X/10 | ...                          |
| conciseness and currency           |   X/5 | line count XXX vs 200 target |

**Issues**

- ...

**Proposed changes**

- ...
```

## Update Summary (after approved edits)

```markdown
## Claude Context Update Summary

**Scope: 当前仓库 / 全局**

### Files changed

- `CLAUDE.md` — ...
- `packages/api/CLAUDE.md` — ...
- `.claude/rules/testing.md` — ...
- `code_map.md` — ...

### What improved

- conflicts resolved and over-constraining absolutes rewritten as intent
- obvious content and session memory removed
- procedures extracted to skills / path rules; entry file points rather than holds
- layering clarity and root-vs-nested division of labor
- command/gate accuracy
- safety boundaries aligned with `.claude/settings.json`
- map-first search flow with explicit relative `code_map.md` paths
- root file shrunk from XXX to YYY lines

### Verification

- `git diff --check` — passed / not applicable (global scope, not a git repository)
- `<targeted command>` — passed/failed/skipped with reason

### Remaining risks

- ...
```
