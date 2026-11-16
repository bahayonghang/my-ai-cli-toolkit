# 创建仓库测试完善 skill

## Goal

在 `skills/development-workflows/repo-test-audit/` 交付一个一方 skill，并按它的契约补当前仓库的测试缺口，让 `just ci` 能收集这些测试。

用户价值：以后可以用同一套报告看清测试文件在哪、声明的 runner 会不会收集、断言有没有核验行为。当前仓库不再只靠会话回忆 `just ci` 覆盖了什么。

## Background

任务目录：`.trellis/tasks/10-06-repo-test-skill`。状态保持 `planning`。本文件批准前不 `task.py start`。

证据日期 2026-10-06。研究文件：

- `research/local-repo-test-layouts.md`：18 个本机同类仓库的入口、路径和约定原文。
- `research/prior-art-test-skills.md`：pytest 9.1.1、Node test runner、Anthropic skill 评估、addyosmani 三层评估、skill-up、dotnet `test-quality-auditor`、openclaw `test-audit`。安装量不是质量分。没有读到「测试完善度」的官方百分比定义。

本仓库当时的事实：

- `skills/` 下 34 个 `SKILL.md`。16 个有 `tests/`。18 个没有。两者都没有 `evals/evals.json` 的只有 `claude-context-improver`。
- `just ci` 七步：`docs-check`、`skills-check`、`python-check`、`python-test`、`install-projects-test`、`node-test`、`git diff --check`。`python-test` 只 discover `gh-pr-release/tests` 与 `platforms/claude/hooks/tests`。`node-test` 收集 `skills/**/tests/*.mjs`。`python-check` 只做 `py_compile`。
- `humanizer-paper/tests/test_polish_lint.py` 与 `paper-workbench/tests/test_normalize_paper.py` 是 pytest 风格函数，使用 `tmp_path` / `monkeypatch`。仓库不把 pytest 列为依赖。`skills/research-learning-knowledge/AGENTS.md` 写明不要把 pytest 接进 `just ci`。
- 有脚本且没有 `tests/`：`code-auditor`、`gh-bootstrap`、`job-application-kit`、`renhua`。
- 没有 `scripts/` 也没有 `tests/` 的 14 个 skill：`ast-grep`、`claude-context-improver`、`herdr-orchestra`、`ripgrep`、`uv-workflow`、`code-quality-review`、`code-refactor`、`codex-review`、`rust-build-optimization`、`beautiful-mermaid-editor`、`bidwriter`、`document-writer`、`touying`、`literature-mentor`。
- `code-auditor` 负责 diff / PR / 全维度审计里的测试盲区。它不改产品代码，也不定义本仓库的测试布局契约。

## Requirements

1. Skill 路径是 `skills/development-workflows/repo-test-audit/`。frontmatter `category` 为 `development-workflows`。
2. 默认动作是只读审计。报告固定三列：文件位置、声明的 runner 是否收集、行为是否被断言核验。完善度只用 Covered / Shallow / Missing。不使用覆盖率百分比，不把外置 `tests/` 写成唯一合法布局。
3. 收集规则以目标仓库已经写明的入口为准。对本仓库，入口是 `justfile` 里的 recipe。上游 pytest / `node --test` 的默认 glob 只在该仓库没有自己的入口时作对照，并标明来源。
4. 用户在本任务里已经要求补缺口。补缺口是子任务 `10-06-repo-test-audit-backfill` 的范围。skill 的 apply 模式只在当次请求明确要求改测试时编辑文件。审计模式不改文件。
5. 每个目前没有 CI 可收集测试的一方 skill，补至少一条会被 `just node-test` 或 `just python-test` 收集的测试。
6. 4 个有脚本的 skill 补行为测试：断言脚本的可观察结果。`gh-bootstrap` 不在测试里克隆远程仓库。`verify_pdf.py` 不要求 CI 安装 poppler。
7. `humanizer-paper` 与 `paper-workbench` 的现有用例改成标准库 `unittest`，并由 `just python-test` 收集。不新增 pytest 依赖。同步改写 `skills/research-learning-knowledge/AGENTS.md` 里「不要把 pytest 接进 CI」的句子，改成标准库 unittest 进入 `just python-test`。
8. 14 个说明型 skill 各加一条 `tests/*.test.mjs`。断言该 skill `description` 里的排除对象，以及 `evals/evals.json` 里至少两条路由负例。`claude-context-improver` 补齐 `evals/evals.json`。
9. 新增 `just evals-check`：校验每个一方 skill 的 `evals/evals.json` 符合现有 git-commit schema（`skill_name`、`evals[]` 的 `id` / `prompt` / `expected_output` / `files` / `assertions`）。不调用模型。把该步放进 `just ci`，步骤数从 7 改为 8，并改根 `AGENTS.md` 的 `just ci` 列举。
10. 触发边界排除 `code-auditor`、`code-quality-review`、`code-refactor`、`trellis-plan-review`。
11. 包按 Production 交付：`SKILL.md`、`agents/interface.yaml`、`README.md`、`evals/evals.json`、`evals/trigger_cases.json`、触发报告、Skill IR、先验报告、creation handoff。判断规则放 `references/`。可重复的只读盘点放 `scripts/`。版权归本仓库，不发布，不写乔木版权行。

## Acceptance Criteria

- [ ] `skills/development-workflows/repo-test-audit/SKILL.md` 存在，`just skills-check` 通过，`description` 同时含中英文触发词，且写明不承接 diff 审查、可维护性审查和重构。
- [ ] 对当前仓库跑盘点时，三列报告能指出补齐之前的两类漏收集：`humanizer-paper` 与 `paper-workbench` 的 Python 测试不在当时的 `python-test` discover 根里；`evals/` 当时不在 `just ci`。实现完成后，这两份测试被 `just python-test` 收集，`evals-check` 在 `just ci` 中。
- [ ] 34 个既有 skill 加上 `repo-test-audit`，每个都至少有一条被 `just node-test` 或 `just python-test` 收集的测试。
- [ ] `just python-test` 不发现 `.agents/`、`.claude/`、`.trellis/` 里的测试。
- [ ] `just evals-check` 在缺文件、非法 JSON 或缺少 schema 字段时退出非 0。它不发网络请求。
- [ ] `just ci` 的步骤提示与根 `AGENTS.md` 的步骤列举都是 8 步，且包含 `evals-check`。
- [ ] 新 skill 的路由负例至少覆盖：只要 diff 审查、只要可维护性审查、只要重构、只要解释某一段失败栈。
- [ ] 公开文字只声称触发评估和本地命令已经跑过的结果。模型行为评估、安装量和全仓库行覆盖率标为 missing evidence。

## Out of Scope

- 发布到 GitHub，或做 `npx skills add` 安装验证。
- 调用模型来给 `evals/evals.json` 打分，或把覆盖率百分比设成门禁。
- 替换 `code-auditor`。
- 给 `gh-bootstrap` 写会克隆远程模板的测试，或给 `verify_pdf.py` 增加 poppler 依赖。
- 修改 orca、deepseek-harness、skills-janitor 等其他仓库的测试布局。
- 把 `IMAGE2_SKILL_BROWSER_TESTS` 变成全库开关。

## Decisions

- 2026-10-06：同一父任务下交付 skill 包，并补本仓库缺口。
- 2026-10-06：每个没有可执行测试的 skill 都补至少一条，包括 14 个说明型 skill。同时改套件约定。
- 2026-10-06：说明型 skill 的那一条由 `just node-test` 执行；另外把 evals 纳进 `just ci`。纳进 CI 的部分是 schema 检查，不调用模型。这一步把 addyosmani 与 skill-up 的「CI 只跑零 token 检查」用在本仓库，不采用它们的阈值或 schema。
- 2026-10-06：两个 pytest 风格文件改写成标准库 unittest 后再进入 `python-test`。不添加 pytest。这覆盖 `research-learning-knowledge/AGENTS.md` 的旧禁令，旧句子要在同一子任务里改掉。

## Child Tasks

- `10-06-repo-test-audit-package`：skill 包、只读盘点脚本、该 skill 自己的测试与 eval。
- `10-06-repo-test-audit-backfill`：4 个脚本 skill 的行为测试、14 条路由测试、两份 pytest 改写、`python-test` 发现范围、`evals-check`、约定与 `just ci` 步骤数。依赖 package 子任务里的盘点脚本契约；不依赖脚本已经在本仓库上报「零 Missing」。
