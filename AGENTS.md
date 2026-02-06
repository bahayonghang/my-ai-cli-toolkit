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
本仓库用于管理跨平台 AI 技能与命令。核心目录：`skills/`（本地技能模块，每个技能一个子目录含 `SKILL.md`）、`commands/`（各平台斜杠命令）、`prompts/`（全局提示词）、`external-skills/`（外部技能注册），测试位于 `tests/`，文档站点位于 `docs/`。入口脚本是 `src/install.py` 与 `src/install_tui.py`，共享模块位于 `src/core/`。

## 构建、测试与开发命令
常用命令如下：
```bash
uv run python src/install_tui.py   # 启动交互式 TUI
uv run python src/install.py install-all
uv run python src/install.py --target codex install-all
uv run pytest                      # 运行全部测试
uv run pytest tests/unit/          # 仅单元测试
just docs-dev                      # 文档站点开发
just ruff-check                    # 代码静态检查
```
`just` 任务定义于 `justfile`，文档构建使用 `docs/` 内的 npm 脚本。

## 编码风格与命名规范
Python 3.10+。测试与工具脚本使用 `snake_case`，模块目录与技能名使用 `kebab-case`（如 `skills/latex-paper-en/`）。格式化/静态检查使用 `ruff`，请在提交前运行 `just ruff-check` 与 `just ruff-format-check`。

## 测试指南
测试框架为 `pytest`，目录结构在 `tests/README.md` 中说明（`unit/`、`integration/`、`e2e/`、`properties/`、`manual/`）。测试文件命名 `test_*.py`，函数命名 `test_*`。属性测试使用 Hypothesis。

## 提交与 PR 规范
提交信息遵循 Conventional Commits：`feat(scope): 描述`、`fix(docs): 描述`、`refactor(...)` 等。请保持 scope 与变更模块一致（例如 `feat(drawio): ...`）。PR 建议包含：变更摘要、关联问题/需求、影响范围（如具体技能目录）、已运行的测试命令，若涉及 TUI 或文档，请附截图或预览说明。

## 安装与配置提示
默认安装到 Claude：`uv run python src/install.py install-all`。跨平台目标用 `--target`（如 `--target gemini`）。项目级安装可使用 `--project ./path`。
