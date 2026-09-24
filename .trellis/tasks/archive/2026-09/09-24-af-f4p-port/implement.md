# Implement：figures4papers 移植

前置：`09-24-af-defect-fixes` 已提交。本任务修改该任务改过的 `attribution.md`、
`viz-pitfalls.md`、`modes/from-data.md`、`modes/from-image.md` 与路径存在性测试。

1. 读父任务 `design.md` 第 3、4 节与本任务 `design.md`；读 catalog 第 1、3 节与推荐 9。
2. 复制 25 个 `.py` 到 `scripts/figures4papers/<project>/`，逐个应用 design 第 3 节
   的通用改动，再应用 R4 的专项修正。
3. 逐个在临时目录以缺省 DPI 运行一次，确认输出文件名与 catalog 第 1.3 节一致。
   有 LaTeX 的脚本再以 `ACADEMIC_FIGURE_NO_TEX=1` 运行一次，并查看 PNG。
4. 缩放原图到 `assets/originals/figures4papers/`，检查总大小。
5. 写 14 份 `references/styles/f4p_<family>.md`。
6. 更新 `modes/from-data.md`（表格、参数列、展示级分支）、`modes/from-image.md`
   （匹配表）、`viz-pitfalls.md`（P3 边界）、`attribution.md`（移植记录表）。
7. 写 `tests/f4p-scripts.test.mjs`；把 `references/styles/f4p_*.md` 加入路径存在性测试。

## 验证

```bash
PYTHONUTF8=1 node --test skills/academic-research-tools/academic-figure/tests/f4p-scripts.test.mjs
PYTHONUTF8=1 just python-check
PYTHONUTF8=1 just node-test
du -sh skills/academic-research-tools/academic-figure/assets/originals/figures4papers
```

## 回滚点

- 分三个提交：(1) 脚本与测试；(2) 原图；(3) 风格文档、路由与 attribution。
  原图提交可以单独回退，以控制仓库体积。
