# AGENTS.md templates

Use only slots supported by repository evidence. Delete unused headings and
placeholders; these are shapes, not default advice.

## Root repository template

```markdown
# Repository Guidelines

This `AGENTS.md` governs the repository root and descendants unless a selected
deeper instruction file narrows or overrides it.

Before broad search, read `./code_map.md`. <!-- Include only when the map exists or is created. -->

## Commands

- `<verified command>` - run from `<cwd>`; proves `<scope>`

## Durable Repository Contracts

- `<non-inferable ownership, generated-file, API, or change-coupling rule>`

## Safety Boundaries

- `<verified destructive, credential, external, production, or data boundary>`

## Verification

- `<targeted check>` - required for `<change class>`
- `<full gate>` - required for `<broader change class>`

## Local Codex Surfaces

- `.agents/skills/<skill>/` - `<verified repo workflow>`
- `.codex/agents/<role>.toml` - `<verified native subagent role>`
```

## Nested guidance template

Use only after the durable-instruction hard minimum is met.

```markdown
# `<subtree>` Guidelines

This file governs `<subtree>/**`. Root guidance still applies; this file changes
only the local contracts named below.

For navigation, read `<exact local-or-parent code_map.md path>`.

## Local Commands and Gates

- `<verified command>` - run from `<cwd>`; proves `<scope>`

## Local Contracts

- `<verified rule that cannot be cheaply inferred from code>`

## Local Safety or Generated Boundaries

- `<verified boundary>`
```

## Override template

Use only when the user explicitly needs temporary or strong override semantics.

```markdown
# `<subtree>` Override

This `AGENTS.override.md` intentionally replaces other instruction candidates in
this directory while `<condition or time window>` applies.

- `<specific override and why ordinary nested guidance is insufficient>`
- Remove or rename this file when `<exit condition>` is met.
```

## Root code_map.md Template

The root and nested `code_map.md` templates below are shared with `claude-md-improver`: `code_map.md` is a single artifact serving both agents, so the wording must stay identical in both skills — edit both together, and never remove the other tool's guidance-file mention from an existing map.

```markdown
# Repository Code Map

Use this map for navigation and search routing. Behavioral rules, required commands, and safety constraints live in `CLAUDE.md` / `AGENTS.md` (whichever exist in this repository).

## Top-Level Routing

- `<dir>/` — <responsibility>; start here for <task type>
- `<dir>/` — <responsibility>; start here for <task type>

## Key Entrypoints

- `<path>` — <runtime, CLI, library, or app entry>
- `<path>` — <configuration or public contract entry>

## Search Anchors

- `<symbol-or-string>` — <what it locates and when to search for it>
- `<file-pattern>` — <why it matters>

## Generated, Vendored, and Ignored Paths

- `<path>/` — generated/build output; do not edit by hand
- `<path>/` — vendored/third-party/dependency path; skip during guidance creation

## Verification Command Index

- `<command>` — <scope and expected use>
- `<command>` — <scope and expected use>
```

## Nested code_map.md Template

```markdown
# `<subtree>` Code Map

Use this map for `<subtree>/**` navigation. Behavioral rules and local commands live in this directory's `CLAUDE.md` / `AGENTS.md` (or the nearest parent guidance file).

## Subtree Responsibility

<one-sentence responsibility and why this subtree has its own map>

## Internal Routing

- `<dir-or-file>` — <responsibility>; start here for <task type>
- `<dir-or-file>` — <responsibility>; start here for <task type>

## Key Files

- `<path>` — <entry point, public contract, test fixture, or config>
- `<path>` — <entry point, public contract, test fixture, or config>

## Upstream and Downstream Boundaries

- Upstream: `<path-or-package>` provides <contract>
- Downstream: `<path-or-package>` consumes <contract>

## Local Search Anchors

- `<symbol-or-string>` — <what it locates>
- `<file-pattern>` — <what it locates>

## Generated or Ignored Local Paths

- `<path>/` — <reason to skip or regenerate instead of editing>
```

## Marker preservation snippet

Include only when matching managed markers exist.

```markdown
## Managed Sections

Preserve `<START marker> ... <END marker>` exactly unless the request is to
repair that managed state.
```
