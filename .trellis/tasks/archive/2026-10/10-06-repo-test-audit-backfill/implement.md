# Implement: test backfill

开始条件：`skills/development-workflows/repo-test-audit/scripts/inventory_tests.py` 已存在。

## Checklist

1. 扩展 `just python-test` 的发现范围，并加上 `scripts/test_check_skill_evals.py` 所在目录。此时两份旧 pytest 文件还不是 `TestCase`，discover 可能显示 0 tests。先不要把它们算作通过。
2. 把 `test_polish_lint.py` 与 `test_normalize_paper.py` 改成 `unittest.TestCase`。跑这两个目录，确认用例数不少于改写前的函数数（6 与 10）。
3. 为 `code-auditor`、`gh-bootstrap`、`renhua`、`job-application-kit` 写行为测试。`gh-bootstrap` 不克隆。`verify_pdf` 不调用 `pdfinfo`。
4. 写 `scripts/check_skill_evals.py` 和它的 unittest。用临时目录做缺文件失败用例。
5. 为 14 个说明型 skill 写 `*.test.mjs`。需要时追加 eval 元素。
6. 把 `evals-check` 插入 `just ci`，更新全部 `N/7` 提示和根 `AGENTS.md`。
7. 改写四份约定文档中的旧禁令。
8. 在仓库根跑盘点脚本。若 recipe 提取失败，只修提取逻辑。

## Validation

- `just python-test`
- `just node-test`
- `just evals-check`
- `just python-check`
- `just ci`

## Rollback

见本任务 `design.md`。`just ci` 步骤数和根 `AGENTS.md` 放在同一个提交。
