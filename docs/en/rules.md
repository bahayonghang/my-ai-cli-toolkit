# Shared rules

[中文版](/rules)

Root `rules/` holds cross-project behavioral rules. Claude Code and OMP read this Markdown from their own rules directories. Codex uses the same files through `@` references in the global `AGENTS.md`.

Files in this directory are repository source. They do not prove that a client has loaded them.

## Files

| File | Contents |
| --- | --- |
| `anti-patterns.md` | Cross-skill behavioral boundaries |
| `chinese.md` | Chinese anti-AI moves, plus Chinese GitHub issue/PR comments |
| `clarity.md` | Reference, condition, obligation, and compression boundaries for everyday replies |
| `durable-context.md` | When reading memory or a prior decision, current state wins; memory is not authorization |
| `english.md` | Quiet corrections of English the user wrote |

## Claude Code

Claude Code reads `.claude/rules/*.md` and `~/.claude/rules/*.md`. The repository-root directory name `rules/` is not discovered by itself. Source: [memory](https://code.claude.com/docs/en/memory) (2026-10-07, official).

These files have no `paths` frontmatter. In a project `.claude/rules/` directory, Claude Code loads them at session start with the same priority as the project `.claude/CLAUDE.md`. User-level `~/.claude/rules/` loads before project rules. If the two conflict, Claude may follow either one.

The files are cross-project personal constraints. The default placement is the user-level directory:

```text
~/.claude/rules/
├── anti-patterns.md
├── chinese.md
├── clarity.md
├── durable-context.md
└── english.md
```

A project `.claude/rules/` directory can hold the same files. Claude Code treats a symlink whose target is outside the working directory as an external import: after approval, only rules without `paths` load. User-level `~/.claude/rules/` does not use that project approval. Creating a symlink on Windows needs Administrator rights or Developer Mode; copying the files also works.

This repository has no installer that links `rules/` into `~/.claude/rules/`. Client load: UNVERIFIED.

## OMP

OMP means [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi). Native rules directories (canonical `main`, 2026-10-07, official):

- User: `~/.omp/agent/rules/*.{md,mdc}`. `--profile` or `PI_CODING_AGENT_DIR` relocates that agent directory.
- Project: when the cwd `.omp/` directory is non-empty, `<cwd>/.omp/rules/*.{md,mdc}`.

`RULES.md` is a separate channel. It is one always-applied file (`~/.omp/agent/RULES.md`, and `RULES.md` in the nearest non-empty `.omp/` found by walking from the cwd toward the repository root). It is not the `rules/` directory.

On canonical `main`, bucketing keeps a file as always-applied when frontmatter sets `alwaysApply: true`. A `description` without `alwaysApply: true` goes to the rulebook. A file with neither is discovered and then dropped. The `rules/*.md` files in this repository currently have no such frontmatter.

`main` is a floating source. The installed OMP version was not checked in this round: UNVERIFIED.

## Codex

Codex global instructions live in the Codex home directory (default `~/.codex`, overridable with `CODEX_HOME`). A non-empty `AGENTS.override.md` wins over `AGENTS.md`. Codex reads only the first non-empty file at that level. Source: [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) (2026-10-07, official).

To add `rules/` to Codex, reference the files with `@` from the global file that is actually selected, one file per line:

```md
# ~/.codex/AGENTS.md

@/absolute/path/to/my-claude-code-settings/rules/anti-patterns.md
@/absolute/path/to/my-claude-code-settings/rules/chinese.md
@/absolute/path/to/my-claude-code-settings/rules/clarity.md
@/absolute/path/to/my-claude-code-settings/rules/durable-context.md
@/absolute/path/to/my-claude-code-settings/rules/english.md
```

Replace the absolute paths with the location of these files on the machine. `~/.codex/AGENTS.md` is not inside this repository.

The AGENTS guide read on 2026-10-07 describes whole-file concatenation and does not describe `@` expansion. On the same day, `codex-rs/core/src/agents_md.rs` on `openai/codex` `main` also concatenates the selected file text. Whether an installed Codex expands these `@` lines: UNVERIFIED.

## Distinct from platform source

Root `rules/` is the shared behavioral set above. `platforms/<platform>/rules/` is where a platform source asset would live. This repository has no `platforms/*/rules/` directory today.
