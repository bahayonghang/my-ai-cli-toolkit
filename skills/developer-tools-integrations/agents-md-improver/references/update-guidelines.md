# AGENTS.md update guidelines

## Establish the effective scope first

Read `codex-agents-discovery.md`. Record project root, launch CWD, selected and
shadowed candidates, effective fallback/budget evidence, and out-of-chain files
before changing content. An inactive file can still need repair, but label its
activation condition instead of treating it as current-session guidance.

Use structured file tools first. If a shell inventory is useful, use a
single-line `rg --files --hidden` command with include/exclude globs that works
in Git Bash and PowerShell. Add configured fallback names to the inventory after
resolving them. Exclude dependencies, generated output, caches, build output,
vendored source, and runtime state unless recovery is the task.

## Verify every proposed rule

Ground commands in manifests, task runners, CI, or working documentation. Ground
paths and entry points in the current tree. Ground safety, ownership, generated
boundaries, and recurring mistakes in source, history, or review evidence.
Remove or qualify claims that cannot be verified; use `missing evidence` when
the gap matters to a decision.

## Keep behavior and navigation separate

- Put durable commands, verification requirements, ownership, safety, generated
  boundaries, and intentional local overrides in `AGENTS.md`.
- Put routing, entry points, search anchors, internal structure, and
  generated/vendor navigation in `code_map.md`.
- Create nested `AGENTS.md` only when `quality-criteria.md`'s durable local
  instruction minimum is met. Complexity alone may justify only a local map.
- Every updated AGENTS file should name the exact useful local or parent
  `code_map.md` path when such a map exists or is created.

Do not create `AGENTS.override.md` as ordinary nested guidance. Audit an existing
override; create one only for a user-requested temporary or strong replacement
and state its exit condition.

## Edit narrowly

- Preserve human-authored constraints unless evidence proves them stale,
  unsafe, or contradictory.
- Preserve complete marker-bounded sections and content owned by generators.
- Keep root guidance repo-wide; move verified local contracts to the narrowest
  selected nested file without copying root sections.
- Use `templates.md` as conditional slots. Delete unsupported headings,
  placeholders, and generic defaults.
- Preserve coexistence with `CLAUDE.md`. If a shared fenced `code_map.md`
  template changes, update the sibling template in the same change and run the
  parity test.
- Keep Codex-home files read-only unless the user explicitly authorizes a
  global change.

## Validation matrix

| Changed claim or artifact | Minimum proof |
| --- | --- |
| documented command | source definition plus the cheapest safe command check |
| instruction selection | root/CWD/config evidence and selected/shadowed chain |
| new or moved AGENTS file | durable instruction need plus scope/map pointer check |
| new code map | navigation evidence and verified paths/anchors |
| managed content | marker boundaries unchanged unless repair was requested |
| removed stale path | targeted search shows no active occurrence |
| shared code-map template | deterministic sibling fenced-block parity test |

Run `git diff --check` and the repository's relevant docs/lint gates. Report each
check as passed, failed, or skipped with its reason; a command exit is evidence
only for what that command actually checks.
