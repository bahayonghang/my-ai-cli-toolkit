# 核对并删除 6 个过时 skill

## Goal

随着 Agents 能力发展，以下 6 个 skill 已不再需要。核对它们在仓库中的所有引用，
安全删除目录，并修复因删除产生的悬挂引用，保持仓库文档/校验一致。

## Scope — 删除目标

1. `skills/development-workflows/cold-shower`
2. `skills/development-workflows/geju`
3. `skills/development-workflows/goudi`
4. `skills/development-workflows/handoff`
5. `skills/development-workflows/implementation-notes`
6. `skills/developer-tools-integrations/archive-planning`

## Requirements

- 删除上述 6 个 skill 目录（含 `SKILL.md`、`evals/`、`tests/`、`references/` 等全部内容）。
- 修复 A 类「真实交叉引用」，使删除后无悬挂链接（详见 `research/reference-triage.md`）：
  - `skills/development-workflows/AGENTS.md`
  - `skills/developer-tools-integrations/AGENTS.md`
  - `skills/development-workflows/unknowns-first/SKILL.md`
  - `skills/development-workflows/html-artifact/evals/README.md`
  - `.gitignore`（移除 `goudi-workspace/` 孤儿规则）
- 通过 `just docs-sync` 重新生成 docs catalog 与 skill 详情页，移除 6 个 skill 的文档页。
- 不改动：`.trellis/tasks/archive/**` 历史、个人 journal、`gh-pr-release/reports/*` 快照，
  以及仅使用通用英文词 "handoff"/"implementation" 的 C 类误报。

## Constraints

- 手改仅限 A 类文件；docs 走生成，不手改。
- `rm -rf` 被 pre-bash hook 拦截 → 用 `git rm -r`。
- 保持既有风格；不顺手重构相邻内容。

## Acceptance Criteria

- [ ] 6 个目录在工作树中已删除（`git status` 显示为 deleted）。
- [ ] A 类 5 个文件已更新，删除目标名称不再作为「有效引用」出现。
- [ ] 全仓库检索 6 个名称，剩余命中只属于 B(已再生成)/C(通用词)/D(历史快照) 三类。
- [ ] `just docs-sync` 后 `just docs-check` 无 catalog 漂移。
- [ ] `just ci` 通过（skills-check / python-check / node-test / git diff --check）。

## Notes

- 详细引用分类见 `research/reference-triage.md`。
- 复杂度：跨多文件 + 交叉引用重写 + 文档再生成 → 需 `design.md` + `implement.md`。
