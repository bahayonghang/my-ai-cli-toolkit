# Implement：recipe 与评测

前置：`09-24-af-figstyle-module` 已提交；`09-24-af-defect-fixes` 已提交（本任务修改其改过的 `chart-recipes.md`）。

1. 读 `chart-selection.md`、`chart-recipes.md`、`scripts/figstyle.py`、`viz-pitfalls.md`。
2. 按 design 模板写 10 节 recipe。
3. 核对 `chart-selection.md` 推荐表每一行的去向（AC2）。
4. 运行 design 所述一次性检查脚本（AC1）。
5. 扩充 `evals/evals.json`（R4），新建 `evals/trigger_cases.json`（R5）。

## 验证

```bash
python -m json.tool skills/academic-research-tools/academic-figure/evals/evals.json > /dev/null
python -m json.tool skills/academic-research-tools/academic-figure/evals/trigger_cases.json > /dev/null
PYTHONUTF8=1 just skills-check
PYTHONUTF8=1 just node-test
```

## 回滚点

- recipe 与 evals 分两个提交，可单独回退。
