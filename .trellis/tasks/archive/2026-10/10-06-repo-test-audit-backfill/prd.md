# 补齐本仓库测试并接入 CI

## Goal

让每个一方 skill 至少有一条被 `just node-test` 或 `just python-test` 收集的测试，并把 eval schema 检查放进 `just ci`。

## Background

父任务契约：`.trellis/tasks/10-06-repo-test-skill/design.md`。

依赖：`10-06-repo-test-audit-package` 已提供 `inventory_tests.py` 的 JSON 字段。本子任务开始前该目录必须存在。

本子任务开始时的缺口：

- 有脚本无 `tests/`：`code-auditor`、`gh-bootstrap`、`job-application-kit`、`renhua`。
- pytest 风格、未被 `python-test` 收集：`humanizer-paper/tests/test_polish_lint.py`、`paper-workbench/tests/test_normalize_paper.py`。
- 无 `scripts/` 且无 `tests/`：`ast-grep`、`claude-context-improver`、`herdr-orchestra`、`ripgrep`、`uv-workflow`、`code-quality-review`、`code-refactor`、`codex-review`、`rust-build-optimization`、`beautiful-mermaid-editor`、`bidwriter`、`document-writer`、`touying`、`literature-mentor`。
- 无 `evals/evals.json`：`claude-context-improver`。

## Requirements

1. 测试形态、禁止项和 CI 八步以父任务 `design.md` 为准。
2. `just python-test` 收集 `platforms/claude/hooks/tests` 以及 `skills/**/tests` 里含 `test_*.py` 的目录。不收集 `.agents/`、`.claude/`、`.trellis/`。
3. 两份 pytest 风格文件改为 `unittest.TestCase`。不新增 pytest。外部 HTTP 保持 mock。
4. 14 个说明型 skill 各有 `tests/*.test.mjs`，断言本 skill 的排除对象，并要求 `evals/evals.json` 里至少两条点名这些对象的 assertions。缺则追加 eval 元素，不改旧 `id`。
5. `python scripts/check_skill_evals.py` 做 schema 检查。`just evals-check` 调用它。`just ci` 变为八步，根 `AGENTS.md` 的列举同步。
6. 改写 `skills/AGENTS.md`、`skills/development-workflows/AGENTS.md`、`skills/research-learning-knowledge/AGENTS.md` 和 `humanizer-paper` 文档里与新门禁冲突的句子。

## Acceptance Criteria

- [ ] `just python-test` 执行 `humanizer-paper`、`paper-workbench`、四个脚本 skill 的新测试，以及 hook 测试。
- [ ] `just node-test` 执行 14 个新的 `*.test.mjs` 和 `repo-test-audit` 的夹具测试。
- [ ] `just evals-check` 在删除任一 skill 的 `evals/evals.json` 的干跑夹具中失败。干跑用临时副本，不改真实文件。
- [ ] `just ci` 从仓库根通过。
- [ ] 根 `AGENTS.md` 与 `justfile` 都列出八步，且第 7 步是 `evals-check`。

## Out of Scope

- 调用模型给 eval 打分。
- 覆盖率门禁。
- 为 `verify_pdf.py` 安装 poppler，或为 `gh-bootstrap` 克隆远程仓库。
- 重写 `repo-test-audit` 的盘点算法。若新 `justfile` 解析失败，只修脚本里的 recipe 提取，不改报告字段名。

## Decisions

- 继承父任务 2026-10-06 的四条决定。pytest 禁令在本子任务改写。
