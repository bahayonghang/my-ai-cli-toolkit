# Implement: repo-test-audit

父任务不直接改产品文件。批准本规划后，按下面的顺序 `task.py start` 子任务。一个子任务归档后再开始下一个。

## Order

1. `10-06-repo-test-audit-package`
2. `10-06-repo-test-audit-backfill`
3. 父任务只做集成核对，不另写产品代码。

backfill 依赖 package 的 `scripts/inventory_tests.py` 契约：stdout JSON 含 `location`、`collected_by`、`behavior`。不依赖盘点结果已经是零 Missing。

## Package Checklist

- 按 `design.md` 的目录创建 skill。
- `references/this-repo-runners.md` 记录补齐前的七步 CI，并写明 backfill 之后的八步以 `justfile` 为准，避免两份步骤表长期分叉。正文只保留「读 justfile」这一条规则，数字示例放 research 引用。
- 夹具覆盖：有 `tests/test_sample.py` 但 `python-test` recipe 未列出该目录；有 `tests/sample.test.mjs` 且 `node-test` recipe 存在。
- 跑 `python .agents/skills/qiaomu-meta-skill/scripts/validate_skill.py` 指向新 skill 目录，若脚本接口要求从包内运行，则在实现笔记里记录实际命令。
- 触发评估使用乔木包里的 `trigger_eval.py` 生成 `reports/trigger-eval.json`。跑不通就在 handoff 里标 missing evidence，不编造通过率。
- `just docs-sync`，然后 `just skills-check` 与新 skill 自己的 `node --test`。

## Backfill Checklist

- 先改 `just python-test` 的发现范围，再改写两份 pytest 风格文件，避免 discover 暂时收集到 0 个 `TestCase` 还显示成功。
- 改写后的 `paper-workbench` 测试保持离线：外部 HTTP 仍由 mock 挡住。
- 14 个 `*.test.mjs` 各自只读本目录。
- `scripts/check_skill_evals.py` 用标准库。为它在 `scripts/` 旁或脚本同目录的既有风格下加 unittest；若放在 `scripts/test_check_skill_evals.py`，要让 `just python-test` 或单独 recipe 收集到。优先放进 `python-test` 的发现根，不新增第九个 CI 步骤。
- 更新步骤字符串：`justfile` 里全部 `N/7`，根 `AGENTS.md` 的 `just ci` 列举。
- 更新三份套件 `AGENTS.md` 与 `humanizer-paper` 里写着 pytest 不进 CI 的句子。
- `just docs-sync` 仅在 frontmatter 或 catalog 输入变化时需要。backfill 若只加测试和 `AGENTS.md`，先跑 `just docs-check` 确认无 catalog 漂移。

## Validation

- package：`just skills-check`；新 skill 的 `node --test`；`just python-check`。
- backfill：`just python-test`、`just node-test`、`just evals-check`，最后从仓库根跑 `just ci`。
- 集成：在仓库根运行盘点脚本，确认 35 个 skill（34 个既有 + `repo-test-audit`）没有「有脚本或有路由约定但 collected_by 为空」的 Missing。Shallow 若仍存在，写进父任务集成笔记，不在本任务里继续扩写断言。

## Rollback Points

- package 合并前：只删除新 skill 目录并还原 `docs/` catalog。
- backfill 中 pytest 改写开始前：记录 `humanizer-paper` 与 `paper-workbench` 测试文件的 git blob。
- `just ci` 步骤数改动与 `AGENTS.md` 列举必须在同一个提交里，避免文档和 recipe 分叉。

## Review Gate

开始任一子任务前，用户需要明确批准父任务这份规划摘要。批准前不 `task.py start`。
