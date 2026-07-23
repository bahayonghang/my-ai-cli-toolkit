# AGENTS.md discovery and update scenarios

Classification: `file-backed fixture`.

These scenarios are deterministic review inputs. They are not provider/model
runs and do not represent human adjudication.

## Scenario A: effective chain, shadows, fallback, and budget

Launch context:

- project root: `C:/repo`
- current working directory: `C:/repo/packages/api`
- effective `project_doc_fallback_filenames`: `["TEAM_GUIDE.md"]`
- effective `project_doc_max_bytes`: `32768`

Non-empty candidates and sizes:

| Directory | Candidate | Bytes | Note |
| --- | --- | ---: | --- |
| `C:/repo` | `AGENTS.override.md` | 14000 | highest-precedence non-empty file |
| `C:/repo` | `AGENTS.md` | 5000 | shadowed by override |
| `C:/repo` | `TEAM_GUIDE.md` | 4000 | shadowed by override |
| `C:/repo/packages` | `AGENTS.override.md` | 0 | empty; skipped |
| `C:/repo/packages` | `TEAM_GUIDE.md` | 10000 | selected fallback |
| `C:/repo/packages/api` | `AGENTS.override.md` | 12000 | selected |
| `C:/repo/packages/api` | `AGENTS.md` | 3000 | shadowed by override |
| `C:/repo/packages/web` | `AGENTS.md` | 2000 | outside the root-to-CWD chain |

Expected reasoning:

- Select at most one non-empty instruction file per directory.
- The selected order is root override, packages fallback, then api override.
- Root `AGENTS.md`, root fallback, and api `AGENTS.md` are shadowed candidates.
- `packages/web/AGENTS.md` is inventoried only; it is not active for this CWD.
- The selected bytes exceed the effective 32 KiB budget, so the audit must flag
  truncation/incomplete-chain risk rather than claim every selected byte loaded.

Variant: if effective config cannot be read, documented defaults may be named as
defaults, but the effective fallback list and byte limit must be labeled
`missing evidence` rather than asserted.

## Scenario B: navigation-only subtree

`modules/` contains 24 source directories and several public entry points. It
has no distinct local commands, generated-file policy, safety boundary,
ownership rule, intentional override, or recurring review failure. Root
guidance already covers its language, tests, and verification gates.

Expected decision:

- navigation need: yes; propose `modules/code_map.md` with routing anchors;
- durable local instruction need: no; do not create `modules/AGENTS.md`;
- complexity and file count are evidence for a map, not a substitute for a
  non-inferable behavioral contract.

## Scenario C: approved scoped edit

The user approved a plan that changes root `AGENTS.md`, root `code_map.md`, and
`packages/api/AGENTS.md`. The files contain human-authored prose and a
`<!-- TRELLIS:START --> ... <!-- TRELLIS:END -->` managed block.

Expected behavior:

- edit the approved files directly without another report/approval round;
- preserve the managed block and unrelated human content;
- verify new commands and map pointers;
- return changed files, behavioral outcome, passed/failed/skipped checks, and
  remaining risk.

## Scenario D: explicit trivial fast path

The user explicitly invokes `$agents-md-improver` and requests one exact,
repository-scoped sentence in `AGENTS.md`. No global file, external write, or
scope expansion is involved.

Expected behavior: run a minimal semantic check, make the edit, validate the
file, and stop. Do not render the full audit report.

## Scenario E: near-neighbor boundary

The request is to audit only `CLAUDE.md`, `.claude/rules`, and import behavior.

Expected behavior: route to `claude-md-improver`; do not inspect or edit Codex
guidance under this skill. A shared `code_map.md` may be preserved only when the
owning workflow actually changes its shared fenced template contract.
