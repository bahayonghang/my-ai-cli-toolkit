# Design：recipe 与评测

## recipe 节模板

每节顺序固定：适用条件（引用 `chart-selection.md` 行）→ 数据形状 → 最小代码 → 期刊导出 → 常见错误（引用 `viz-pitfalls.md` 编号）。

最小代码的开头固定为：

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from figstyle import apply_style, save_figure, OKABE_ITO

apply_style("journal", journal={"width_in": 3.5, "font_pt": 8, "font_family": ["Arial"]})
fig, ax = plt.subplots(figsize=(3.5, 2.6), layout="constrained")
```

- 数据用 `numpy.random.default_rng(0)` 生成，保证可复现。
- 显著性括号只画括号与标记；统计检验由用户提供 p 值，recipe 不计算检验。

## 可运行性检查

- 实施时用一次性脚本抽取 `chart-recipes.md` 中新节的 python 代码块，替换 `<skill-dir>` 为实际路径后逐块运行，结果写入 check 记录。该脚本不随 skill 发布。

## evals 编号

- 新用例从现有最大 id（26）之后连续编号。
