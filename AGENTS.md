<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Repository Guidelines

## 项目结构与模块组织
本仓库用于管理跨平台 AI 技能与命令。核心目录：`content/skills/`（本地技能模块，每个技能一个子目录含 `SKILL.md`）、`content/commands/`（各平台斜杠命令）、`content/prompts/`（全局提示词）、`tools/external-skills/`（外部技能注册），文档站点位于 `docs/`。技能管理通过 `mcs/`（Rust TUI）进行。工具类子项目位于 `tools/`（agentkit-desktop、external-skills、plugin-scripts）。

## 构建、测试与开发命令
常用命令如下：
```bash
just mcs                           # 启动交互式 Rust TUI（推荐）
just ci                            # 运行完整 CI 流程 (TypeScript + Rust)
just docs-dev                      # 文档站点开发
just rust-check-all                # Rust 格式 + Clippy + 测试
```
`just` 任务定义于 `justfile`，文档构建使用 `docs/` 内的 npm 脚本。

## 编码风格与命名规范
模块目录与技能名使用 `kebab-case`（如 `content/skills/latex-paper-en/`）。Rust 代码使用标准 Rust 格式化 (`cargo fmt`)，静态分析使用 Clippy。TypeScript/React 遵循 ESLint 配置。

## 测试指南
Rust 测试通过 `cargo test` 运行（mcs/ 和 tools/agentkit-desktop/src-tauri/）。TypeScript 类型检查使用 `npx tsc --noEmit`。

## 提交与 PR 规范
提交信息遵循 Conventional Commits：`feat(scope): 描述`、`fix(docs): 描述`、`refactor(...)` 等。请保持 scope 与变更模块一致（例如 `feat(drawio): ...`）。PR 建议包含：变更摘要、关联问题/需求、影响范围（如具体技能目录）、已运行的测试命令，若涉及 TUI 或文档，请附截图或预览说明。

## 安装与配置提示
默认通过 Rust TUI 管理技能：`just mcs`。跨平台目标在 TUI 中选择。
