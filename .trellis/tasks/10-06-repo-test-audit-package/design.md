# Design: repo-test-audit package

共享契约在父任务 `design.md`。这里只写本子任务的文件边界。

## Files

新建：

- `skills/development-workflows/repo-test-audit/SKILL.md`
- `skills/development-workflows/repo-test-audit/README.md`
- `skills/development-workflows/repo-test-audit/agents/interface.yaml`
- `skills/development-workflows/repo-test-audit/evals/evals.json`
- `skills/development-workflows/repo-test-audit/evals/trigger_cases.json`
- `skills/development-workflows/repo-test-audit/references/report-contract.md`
- `skills/development-workflows/repo-test-audit/references/this-repo-runners.md`
- `skills/development-workflows/repo-test-audit/scripts/inventory_tests.py`
- `skills/development-workflows/repo-test-audit/tests/fixtures/` 下两个小型假 `justfile` 仓库
- `skills/development-workflows/repo-test-audit/tests/inventory_tests.test.mjs`
- `skills/development-workflows/repo-test-audit/reports/` 中的证据文件

修改：

- `skills/development-workflows/AGENTS.md`：技能名单加上 `repo-test-audit`。不改「对话型可以没有测试」那句，留给 backfill。
- `docs/` 中由 `just docs-sync` 生成的 catalog 页。

不修改 `justfile`、根 `AGENTS.md`、其他 skill。

## Script Output

`python <skill-dir>/scripts/inventory_tests.py <repo-root>` 打印一个 JSON 对象：

- `runners`: 从 `justfile` 识别出的 recipe 名列表
- `files`: 数组。每项含 `path`、`location`（`skill-tests` / `repo-tests` / `unknown`）、`collected_by`（recipe 名或空字符串）、`behavior`（`Covered` / `Shallow` / `Missing`）

`behavior` 在本子任务的自动判断里只用结构信号：没有 `assert` / `assertions` 且未被收集时为 Missing；已被收集但文件里没有断言关键字时为 Shallow；已被收集且有断言关键字时不自动升为 Covered，标 `needs-review`，由 skill 正文要求人工改判为 Covered 或 Shallow。这样脚本不会把关键字误当成行为证明。

父任务验收里的 Covered 由 backfill 的手写测试和审计报告完成。脚本字段保留 `behavior`，自动值允许 `needs-review`。

## Rollback

删除上述新目录，还原 `development-workflows/AGENTS.md` 的名单行和 `docs/` catalog。
