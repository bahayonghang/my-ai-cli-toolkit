# Codex AGENTS discovery semantics

Last verified: 2026-07-23 against:

- https://learn.chatgpt.com/docs/agent-configuration/agents-md
- https://learn.chatgpt.com/docs/config-file/config-advanced#project-instructions-discovery
- https://learn.chatgpt.com/docs/skills
- https://developers.openai.com/codex/subagents

Use this reference when resolving which instructions actually apply. The URLs
are design evidence; running this skill does not require network access.

## Launch context

Record these before judging scope:

- project root, normally the Git root;
- launch/current working directory (CWD);
- Codex home when safely observable (`CODEX_HOME`, default `~/.codex`);
- effective `project_doc_fallback_filenames` and `project_doc_max_bytes` evidence.

Codex builds its instruction chain once per run. A repository-wide inventory is
not the same as the active chain for the recorded CWD.

## Selection and merge order

Global scope selects the first non-empty file from:

1. `AGENTS.override.md`
2. `AGENTS.md`

Project scope walks from project root through the CWD. In each directory it
selects at most one non-empty file in this order:

1. `AGENTS.override.md`
2. `AGENTS.md`
3. each configured fallback name in `project_doc_fallback_filenames` order

Selected project files merge root-to-CWD. Guidance closer to the CWD appears
later and therefore takes precedence. Sibling and descendant files outside that
path are inactive for the launch context; state which CWD would activate them
when they matter to a candidate analysis.

Record existing but losing candidates as shadowed. Empty candidates are skipped,
not selected. Do not describe a shadowed file as the effective instruction source.

## Byte budget and configuration evidence

`project_doc_max_bytes` controls the combined project-instruction budget and
defaults to 32 KiB. Codex stops adding instruction content when the combined
size reaches the effective limit. Check selected-file sizes and report
truncation or incomplete-chain risk when the limit can be crossed.

Defaults are documentation facts, not proof of effective config. When the
effective config cannot be read, label fallback names and the byte limit
`missing evidence`; do not assert that defaults are active. Likewise, an absent
fallback file is meaningful only after the effective fallback names are known.

## Scope boundaries

- Repository guidance may be read and audited in scope. Codex-home guidance and
  configuration are read-only by default and must not be written unless the user
  explicitly requests a global change.
- Audit existing `AGENTS.override.md` files. Create one only for an explicit
  temporary or strong override; ordinary narrowing belongs in `AGENTS.md`.
- `code_map.md` is this skill's companion navigation convention, not a native
  Codex instruction filename. It becomes useful when applicable guidance points
  to it or a user asks for navigation output.

## Current project extension roots

- Repo-scoped skills live under `.agents/skills`.
- User-scoped skills live under `$HOME/.agents/skills`.
- Project native subagent definitions live under `.codex/agents`.

Do not infer that a named skill or subagent is available merely because guidance
mentions it; verify the corresponding source or runtime capability.

## Audit checklist

1. Resolve root, CWD, and effective config evidence.
2. Inventory override, standard, configured fallback, and companion map files
   while excluding generated, vendored, dependency, cache, and build output.
3. Select one non-empty file per directory on the root-to-CWD path.
4. Record active order, shadowed candidates, out-of-chain inventory, empty files,
   selected bytes, budget state, and missing evidence.
5. Only then assess content quality or propose changes.
