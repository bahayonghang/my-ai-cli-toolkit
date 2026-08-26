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

Path input: keep sessions whose recorded skill path normalizes to that instance.

Name input: resolve local `SKILL.md` copies. More than one path → list them and stop. Do not merge copies.

## Scope

Default `--scope global`. `--scope cwd` limits all four platforms to the current repository.

```text
python "<skill-dir>/scripts/scan_invocations.py" --skill-name <name> [--skill-path <abs>] [--scope global|cwd] [--repo-root <abs>]
```

Stdout is JSON. It must not echo private message bodies. Missing stores set `coverage.<platform>` to `missing-store` and still exit 0.
