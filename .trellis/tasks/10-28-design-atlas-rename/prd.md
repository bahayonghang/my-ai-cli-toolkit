# 改名：design-md → design-atlas

父任务：`10-28-design-atlas-upgrade`。这是第一个子任务。名字 `design-atlas` 已于 2026-10-28 由用户确认。

## Goal

纯改名，行为零变化。后续子任务都在新路径上开发。

## Requirements

- `git mv skills/development-workflows/design-md skills/development-workflows/design-atlas`，保留历史。
- 更新以下位置的 skill 名：
  - `SKILL.md` frontmatter `name` 与 `# design-md` 标题。
  - `agents/interface.yaml` 的 `display_name`（`Design Atlas`）与 `default_prompt` 中的 `$design-md`。
  - `evals/evals.json` 的 `skill_name`。
  - README 标题、安装命令里的 `--skill design-md`，另加一行“原名 design-md”。
  - `tests/*.py` 中硬编码的目录名（如有）。
  - `scripts/design_catalog.py` 的 provenance 注释前缀：`<!-- design-md: entry=... -->` 改为 `<!-- design-atlas: entry=... -->`。如果有代码或测试会解析这条注释，必须同时接受两种前缀，因为已有项目的 DESIGN.md 里还是旧前缀。
  - `scripts/build_catalog.py` 的模块 docstring（“Rebuild the design-md catalog”）。
- 仓库级引用：
  - `skills/development-workflows/AGENTS.md` 的成员列表。
  - `.trellis/spec/guides/skill-authoring-conventions.md` 中 “design-md first-party catalog entries” 一节的路径和标题，以及 `.trellis/spec/guides/index.md` 中的摘要词。
  - `code_map.md`（如有提及）。
  - 生成文档：运行 `just docs-sync`，生成 `docs/skills/development-workflows/design-atlas.md` 及英文版，并删除旧页面。
- 不改：项目产物文件名 `DESIGN.md`；`DESIGN.md` 相关触发词；`.trellis/tasks/archive/**` 与 journal 中的历史记录；`ref/`。
- 版本号 `0.2.0 → 0.3.0`（改名属于对外可见的变更）。

## Acceptance Criteria

- [ ] `skills/development-workflows/design-md/` 不存在，`design-atlas/` 存在，`git log --follow` 能追到旧历史。
- [ ] `rg -n "design-md" skills docs .trellis/spec code_map.md -g '!**/archive/**'` 的命中只剩有意保留的迁移说明。DESIGN.md 文件名不算命中，因为它是大写文件名，搜索时需人工逐条确认。
- [ ] `python "skills/development-workflows/design-atlas/scripts/design_catalog.py" list` 输出与改名前逐字节相同（先在改名前保存一份输出用于对比）。
- [ ] `just ci` 全绿。
