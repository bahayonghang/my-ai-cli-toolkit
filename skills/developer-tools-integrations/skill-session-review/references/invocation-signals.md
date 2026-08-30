# Invocation signals

Classify each matching session as `available`, `loaded`, or `invoked`. Only `invoked` sessions may ground `UPDATE SKILL` or `COMPLIANCE GAP` suggestions.

## Status

| Status | Meaning | May ground required SKILL.md changes |
| --- | --- | --- |
| `available` | Catalog or `host_skills` lists the skill | No |
| `loaded` | The agent read or was injected the target `SKILL.md` | No |
| `invoked` | Structured call, or loaded then workflow/output-contract markers | Yes |

Keyword hits in prose stay low confidence. They never become `invoked` by themselves.

## Platforms

| Platform | Store | `invoked` | Never `invoked` |
| --- | --- | --- | --- |
| claude | `~/.claude/projects/<encoded-cwd>/*.jsonl` | `Skill` tool or `attributionSkill` | Path string only |
| grok | `~/.grok/sessions/<encoded-cwd>/<session-id>/chat_history.jsonl` | `<skills_referenced>` path (or name when no path and no `--skill-path`) | Assistant file lists |
| codex | `~/.codex/sessions/**/rollout-*.jsonl` | `loaded` then workflow markers | `host_skills`; read-only `SKILL.md` |
| oh-my-pi | `~/.omp/agent/sessions/<encoded-cwd>/*.jsonl` | `loaded` then workflow markers | `~/.pi`; read-only `SKILL.md` |

## Identity

Explicit path input: keep only sessions with platform-supported evidence that
normalizes to that exact instance. Claude requires a matching injected base
directory before a name-only `Skill` / `attributionSkill` signal can apply;
Grok requires the matching `<skills_referenced>` path; Codex and Oh My Pi
require a matching recorded `SKILL.md` path. A name-only signal or a same-name
copy elsewhere does not belong to the selected target.

Name input without explicit `--skill-path`: retain platform name fallback,
resolve local `SKILL.md` copies, and stop with their paths when more than one is
found. Do not merge copies.

All scanner session/skill path comparisons use host `normpath` / `normcase`
semantics. Windows comparison is case-insensitive; POSIX comparison preserves
case. This scanner identity rule is separate from report basename validation.

For Codex, the session `id` is the unique rollout filename stem. Do not replace
it with `payload.session_id`: full-history forks can share that root identifier
while remaining distinct rollout files.

Codex and Oh My Pi map their different event envelopes to one canonical
assistant-body predicate. Codex requires a `response_item` whose payload is a
`message` with `role=assistant`; Oh My Pi requires a top-level `message` whose
nested message has `role=assistant`. Only the exact lowercase, explicitly typed
`text` / `output_text` body blocks are eligible; raw string content, raw list strings,
and non-canonical type casing are rejected. The complete platform event is checked
recursively. Any non-empty
`tool*` or `function_call*` metadata key, or any block type containing `tool` /
beginning with `function_call`, excludes the whole event, including mixed
text-plus-tool events. Skill text echoed by a tool therefore proves `loaded`,
not `invoked`. Every accepted workflow marker must name the target skill;
generic step labels such as `Step 1` or `步骤 1` do not independently advance a
loaded session. Event order is part of the evidence: Codex and Oh My Pi process
each event once, establish an exact target-bound `loaded` state first, and only
then accept a canonical assistant marker from that event or a later event. A
marker recorded before the target read is not buffered and cannot be promoted
retroactively by a later read.

The recursive `tool*` / `function_call*` check above is a conservative negative
predicate for assistant events only. It must never serve as positive evidence
that Codex read the target. Positive Codex read evidence requires the exact
`response_item` envelope plus one of these exact payload contracts:

| `payload.type` | Allowed evidence fields |
| --- | --- |
| `custom_tool_call` | `cmd`, `command`, `input` |
| `custom_tool_call_output` | `output` |
| `function_call` | `arguments` |
| `function_call_output` | `output` |

Only those field values are inspected, and they must contain both a supported
read action and a recorded `SKILL.md` path that binds the selected instance.
All recorded `SKILL.md` path spans are masked before action-token matching, so
an action-like directory name such as `rg`, `cat`, `read_file`, `read_text`, or
`get-content` inside the target path cannot manufacture a read action. Path
identity and masking share one ordered, non-overlapping span extractor: an
accepted quoted path is never rescanned for a bare suffix, while a quoted JSON
command container is not treated as one path and preserves its action while
only the actual inner path span is masked. Raw quote wrappers and one-or-more
levels of JSON-escaped quote wrappers are both recognized as complete path
spans, including paths with spaces and Windows separators.
Assistant prose, `world_state`, arbitrary tool-like metadata such as
`toolbox_note`, and every non-allowlisted envelope or field cannot establish
`loaded`. `world_state` may still prove the lower `available` state when its
catalog path binds the selected instance.

## Scope

Default `--scope global`. `--scope cwd` limits all four platforms to the current
repository. Codex rollouts are discovered from a global store, so cwd scoping is
fail closed: every recorded `session_meta.payload.cwd` must be a normalizable
absolute path equal to `--repo-root`. Missing, invalid, relative, or mismatched
cwd metadata excludes the rollout. Global scope does not apply this cwd filter.

```text
python "<skill-dir>/scripts/scan_invocations.py" --skill-name <name> [--skill-path <abs>] [--scope global|cwd] [--repo-root <abs>]
```

Stdout is JSON. It must not echo private message bodies. Missing stores set `coverage.<platform>` to `missing-store` and still exit 0.
