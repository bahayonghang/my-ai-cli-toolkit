# Implement: repo-test-audit package

## Checklist

1. 读父任务 `design.md` 的 Report Contract 与 Skill Package。
2. 写 `references/report-contract.md`，再写短的 `SKILL.md`。命令使用 `<skill-dir>` 占位。
3. 写 `inventory_tests.py`。只解析 `justfile` 文本，不执行 recipe。
4. 写两个夹具和 `inventory_tests.test.mjs`。
5. 写 `evals/evals.json` 与 `evals/trigger_cases.json`。负例覆盖 diff 审查、可维护性审查、重构、失败栈解释。
6. 写 `agents/interface.yaml` 与 `README.md`。
7. 更新 `development-workflows/AGENTS.md` 的名单。
8. 生成 `reports/`：先验摘要指向父任务 research，不复制全文；creation handoff 按乔木 handoff 结构写 studied skills、lessons、rejections、原创点，并给每条标 design advantage / validated advantage / hypothesis。
9. `just docs-sync`。

## Validation

- `node --test skills/development-workflows/repo-test-audit/tests/inventory_tests.test.mjs`
- `just skills-check`
- `just python-check`
- `just docs-check`

触发评估命令若失败，把命令和错误写进 `reports/creation-handoff.md`，不标成通过。

## Rollback

见本任务 `design.md`。
