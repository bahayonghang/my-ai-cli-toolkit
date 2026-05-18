# 命令目录

## `content/platforms/*/commands/` 中的源目录

| 源目录 | 当前命令文件 |
|--------|--------------|
| `content/platforms/claude/commands/` | `init-projects.md` |
| `content/platforms/gemini/commands/` | `export-summary.toml`、`import-summary.toml`、`plan/new.toml`、`plan/impl.toml` |
| `content/platforms/antigravity/commands/` | `export-summary.md`、`import-summary.md` |
| `content/platforms/trae/commands/` | `export-summary.md`、`import-summary.md` |
| `content/platforms/windsurf/commands/` | `export-summary.md`、`import-summary.md` |

> 说明：仓库里还保留了 `content/platforms/gemini/commands/import- summary.toml` 这个兼容文件名。当前应把 `import-summary.toml` 视为规范 live 源。

## 安装平台映射

| 安装平台 | 命令源 | fallback 源 | 安装目录 |
|----------|--------|-------------|----------|
| Claude | `claude` | 无 | `~/.claude/commands/` |
| Codex | `codex` prompts，再按配置读取命令源 | 默认 `claude` | `~/.codex/prompts/` |
| Gemini | `gemini` | 无 | `~/.agents/commands/` |
| Qwen | `qwen` | 默认 `claude` | `~/.qwen/commands/` |
| Kiro | `kiro` | 默认 `claude` | `~/.kiro/steering/` |
| Qoder | `qoder` | 默认 `claude` | `~/.qoder/commands/` |
| Trae | `trae` | 默认 `claude` | `~/.trae/commands/` |
| Trae CN | `trae` | 默认 `claude` | `~/.trae-cn/commands/` |
| OpenCode | `opencode` | 默认 `claude` | `~/.config/opencode/commands/` |
| Antigravity | `antigravity` | 无 | `~/.gemini/antigravity/workflows/` |
| Windsurf | `windsurf` | 无 | `~/.codeium/windsurf/workflows/` |

映射表描述的是安装配置，不代表当前 checkout 中每个命名的命令源目录都存在。

## Live 命令清单

### Claude

- `init-projects.md`：用于创建仓库指导文件的项目初始化 prompt。

### Gemini

- `export-summary.toml`
- `import-summary.toml`
- `plan/new.toml`
- `plan/impl.toml`

### Antigravity / Trae / Windsurf

- `export-summary.md`
- `import-summary.md`

## 相关的非 command prompt 源

Codex 当前把 prompt 源放在 `content/platforms/codex/prompts/`，包括 `init-projects.md` 和 `codex-companion/` prompt 集。Codex 基础指导文件位于 `content/platforms/codex/rules/AGENTS.md`。

## 历史页面

旧的命令家族文档（`cc`、`cli`、`gh`、`issue`、`kiro`、`memory`、`task`、`workflow`、`zcf`、`utilities`）描述的是已经移除的源家族。它们仅作为兼容参考保留，不再进入 live sidebar，也不应被当作当前清单。

## 说明

- 如果你需要逐文件核对，请直接查看 `content/platforms/*/commands/`。
- 若要理解 MCS 如何决定 fallback 和目标路径，请查看 `platforms.toml` 与 `mcs-core/src/config/platform.rs`。
- 新增或删除命令源后，请同步更新本页并运行 `python docs/scripts/audit_sync.py`。
