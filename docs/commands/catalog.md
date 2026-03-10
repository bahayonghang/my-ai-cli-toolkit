# Commands Catalog

## Source directories in `content/commands/`

| Source directory | Notes |
|------------------|-------|
| `claude/` | The largest command tree: core commands plus `cc`, `gh`, `issue`, `kiro`, `memory`, `task`, `workflow`, and `zcf` families |
| `gemini/` | Summary commands plus `plan` and `zcf` families |
| `antigravity/` | Workflow-style summary commands |
| `trae/` | Summary commands plus `zcf` family |
| `windsurf/` | Summary workflow commands |

## Installed platform mapping

| Installed platform | Command source | Fallback source | Installed folder |
|--------------------|----------------|-----------------|------------------|
| Claude | `claude` | none | `~/.claude/commands/` |
| Codex | `codex` | `claude` | `~/.codex/prompts/` |
| Gemini | `gemini` | none | `~/.agents/commands/` |
| Qwen | `qwen` | `claude` | `~/.qwen/commands/` |
| Kiro | `kiro` | `claude` | `~/.kiro/steering/` |
| Qoder | `qoder` | `claude` | `~/.qoder/commands/` |
| Trae | `trae` | `claude` | `~/.trae/commands/` |
| Trae CN | `trae` | `claude` | `~/.trae-cn/commands/` |
| OpenCode | `opencode` | `claude` | `~/.config/opencode/commands/` |
| iFlow | `iflow` | `claude` | `~/.iflow/commands/` |
| Antigravity | `antigravity` | none | `~/.gemini/antigravity/workflows/` |
| Windsurf | `windsurf` | none | `~/.codeium/windsurf/workflows/` |

## Claude command families

- `export-summary`
- `import-summary`
- `enhance-prompt`
- `version`
- `cc/`: command authoring and meta-agent helpers
- `gh/`: commit, fix-issue, review-pr
- `issue/`: discover, new, plan, execute, queue
- `kiro/`: design, execute, spec, task, vibe
- `memory/`: memory loading, docs, compaction, workflow memory, swagger docs
- `task/`: create, breakdown, execute, replan
- `workflow/`: clean, debug, plan, execute, review, session, UI design, TDD, tooling helpers
- `zcf/`: git-cleanBranches, git-rollback, git-worktree, init-project

## Gemini command families

- `export-summary`
- `import-summary`
- `plan/`: `impl`, `new`
- `zcf/`: git-cleanBranches, git-commit, git-rollback, git-worktree, init-project

## Other source families

- `antigravity/`: export-summary, import-summary
- `trae/`: export-summary, import-summary, `zcf/`
- `windsurf/`: export-summary, import-summary

## Notes

- The command catalog is broader than the three standalone command docs in this section.
- For exact file-level truth, inspect `content/commands/` directly.
- For how MCS resolves target paths and fallbacks, inspect `platforms.toml` and `mcs-core/src/config/platform.rs`.
