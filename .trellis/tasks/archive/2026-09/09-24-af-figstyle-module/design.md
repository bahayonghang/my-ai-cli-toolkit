# Design：figstyle 模块

## 模块结构

```text
scripts/figstyle.py
  OKABE_ITO, NEUTRAL_GRAY, F4P_PALETTE          # 常量
  TIERS = {"display": {...}, "compact": {...}}   # rcParams 片段
  apply_style(tier, *, journal=None) -> StyleContext
  save_figure(fig, base_path, formats, dpi, *, match_width) -> list[Path]
  legend_panel / split_legends / label_bars / text_color_for / sci_ticks
  simulate_cvd(rgb, kind) / check_palette(colors) -> dict
  main(argv)                                     # CLI: check-palette
```

- `StyleContext` 在 `__init__` 中保存 `matplotlib.rcParams.copy()` 并立即应用预设，
  所以不写 `with` 也能生效；`__exit__` 恢复保存的 rcParams。
- `journal` 参数为字典，键为 `width_in`、`font_pt`、`font_family`；本模块不解析
  `journal-specs.md`，由调用方从卡片取值传入。

## 色觉模拟

- 使用 Machado 等（2009）严重度 1.0 的 3×3 矩阵，作用于线性 RGB。
- 差值使用 CIELAB ΔE76（实现简单，只依赖 numpy）。灰度差值使用 L* 差。
- 阈值：`MIN_DELTA_E = 10`、`MIN_DELTA_L = 15`，低于阈值给出 WARN。阈值属于经验
  默认值，文档写明来源为本模块设定，不是期刊规则。

## 导出宽度

- `match_width=True`：调用 `fig.savefig(path, dpi=dpi)`，不传 `bbox_inches`。
  PNG 宽度像素 = `round(fig.get_figwidth() * dpi)`，测试检查该等式。
- `match_width=False`：传 `bbox_inches="tight", pad_inches=0.02`，用于展示级图。

## 与既有文档的关系

- 数值只存在于模块中；`matplotlib-recipes.md` 与 `design-theory.md` 写函数名与用途。
