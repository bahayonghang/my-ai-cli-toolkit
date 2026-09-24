# Implement：figstyle 模块

1. 读父任务 `design.md` 与本任务 `design.md`；读 `scripts/visual_qa.py` 的
   CLI 与自定位写法作为风格参照。
2. 写 `scripts/figstyle.py`：常量 → `apply_style` → `save_figure` → 标注辅助 →
   色觉模拟与 `check_palette` → CLI。
3. 写 `tests/figstyle.test.mjs`，Python 解析与跳过逻辑沿用
   `tests/visual-qa.test.mjs:20-45`，临时目录用 `fs.mkdtempSync`。
4. 在 `references/matplotlib-recipes.md` 与 `references/design-theory.md` 各加一行指针
   （若 `af-defect-fixes` 尚未提交，等待其提交后再改这两个文件）。

## 验证

```bash
PYTHONUTF8=1 python skills/academic-research-tools/academic-figure/scripts/figstyle.py --help
PYTHONUTF8=1 python skills/academic-research-tools/academic-figure/scripts/figstyle.py check-palette "#D55E00" "#009E73"
PYTHONUTF8=1 node --test skills/academic-research-tools/academic-figure/tests/figstyle.test.mjs
PYTHONUTF8=1 just python-check
PYTHONUTF8=1 just node-test
```

## 回滚点

- 模块与测试为新增文件；回滚时删除两个文件并撤销两行文档指针。
