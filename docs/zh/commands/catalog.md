# 命令目录

## `content/platforms/*/commands/` 中的源目录

| 源目录 | 说明 |
|--------|------|
| `content/platforms/claude/commands/` | 最大的一棵命令树，包含核心命令以及 `cc`、`gh`、`issue`、`kiro`、`memory`、`task`、`workflow`、`zcf` 等家族 |
| `content/platforms/gemini/commands/` | summary 命令，以及 `plan`、`zcf` 家族 |
| `content/platforms/antigravity/commands/` | workflow 风格的 summary 命令 |
| `content/platforms/trae/commands/` | summary 命令，以及 `zcf` 家族 |
| `content/platforms/windsurf/commands/` | summary workflow 命令 |

## 安装平台映射

| 安装平台 | 命令源 | fallback 源 | 安装目录 |
|----------|--------|-------------|----------|
| Claude | `claude` | 无 | `~/.claude/commands/` |
| Codex | `codex` | `claude` | `~/.codex/prompts/` |
| Gemini | `gemini` | 无 | `~/.agents/commands/` |
| Qwen | `qwen` | `claude` | `~/.qwen/commands/` |
| Kiro | `kiro` | `claude` | `~/.kiro/steering/` |
| Qoder | `qoder` | `claude` | `~/.qoder/commands/` |
| Trae | `trae` | `claude` | `~/.trae/commands/` |
| Trae CN | `trae` | `claude` | `~/.trae-cn/commands/` |
| OpenCode | `opencode` | `claude` | `~/.config/opencode/commands/` |
| iFlow | `iflow` | `claude` | `~/.iflow/commands/` |
| Antigravity | `antigravity` | 无 | `~/.gemini/antigravity/workflows/` |
| Windsurf | `windsurf` | 无 | `~/.codeium/windsurf/workflows/` |

## Claude 命令家族

- `export-summary`
- `import-summary`
- `enhance-prompt`
- `version`
- `cc/`：命令创建与 meta-agent 辅助
- `gh/`：commit、fix-issue、review-pr
- `issue/`：discover、new、plan、execute、queue
- `kiro/`：design、execute、spec、task、vibe
- `memory/`：memory load、docs、compact、workflow memory、swagger docs
- `task/`：create、breakdown、execute、replan
- `workflow/`：clean、debug、plan、execute、review、session、UI design、TDD、tool helpers
- `zcf/`：git-cleanBranches、git-rollback、git-worktree、init-project

## Gemini 命令家族

- `export-summary`
- `import-summary`
- `plan/`：`impl`、`new`
- `zcf/`：git-cleanBranches、git-commit、git-rollback、git-worktree、init-project

## 其他源家族

- `antigravity/`：export-summary、import-summary
- `trae/`：export-summary、import-summary、`zcf/`
- `windsurf/`：export-summary、import-summary

## 说明

- 命令目录远大于当前文档站点中那几个独立命令页。
- 如果你需要逐文件核对，请直接查看 `content/platforms/*/commands/`。
- 若要理解 MCS 如何决定 fallback 和目标路径，请查看 `platforms.toml` 与 `mcs-core/src/config/platform.rs`。
- `codex` 命令源在当前仓库会回退到 `claude`，因为仓库中没有 `content/platforms/codex/commands/`。
