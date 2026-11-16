# Implement：缺陷修复

路径均相对 `skills/academic-research-tools/academic-figure/`。

1. 读 `research/skill-audit.md` 的 A1–A18、B1–B6、S2 与 catalog 第 2、4.3 节。
2. 许可证与出处（R1）：改 `references/attribution.md`、`design-theory.md`、
   `panel-layout-patterns.md`、`chart-recipes.md:306`。
3. 设计声明（R2）：改 `design-theory.md:74,75,84`。
4. 导出与布局（R3）：改 `matplotlib-recipes.md` 预设、`chart-recipes.md` 的
   `plt.subplots(` 调用、`qa-checklist.md` 导出行、`figure-contract.md`（A14）、
   `journal-specs.md` 或 `qa-checklist.md`（A17、A18）。
5. 配色（R4）：`matplotlib-recipes.md` 色表节保留唯一定义，其余文件改为引用。
6. GAN recipe（R5）：`chart-recipes.md` 第 6 节。
7. plotly（R6）：`plotly-recipes.md:15-67`、表 `:53-59`、`qa-checklist.md` plotly 节、
   `modes/journal-spec.md` 视觉审阅步骤。
8. 过时指针（R7）：`attribution.md:16`、审计 A4 列出的文件、A5 步骤号、A13 风格文档。
9. 无 LaTeX（R8）：逐个修改 usetex 脚本，加入 `USE_TEX = shutil.which("latex") is not None`
   与环境变量 `ACADEMIC_FIGURE_NO_TEX=1` 强制关闭；改 `modes/from-data.md:78-80` 与
   `agents/interface.yaml`。
10. 脚本健康（R9）：9 个风格脚本、`visual_qa.py`。
11. 测试（R10）：新增 `tests/style-scripts.test.mjs` 与 `tests/reference-paths.test.mjs`，
    解析 Python 的方式与 `tests/visual-qa.test.mjs:20-45` 相同。

## 验证

```bash
PYTHONUTF8=1 just skills-check
PYTHONUTF8=1 just python-check
PYTHONUTF8=1 node --test skills/academic-research-tools/academic-figure/tests/
PYTHONUTF8=1 just node-test
```

- AC7：`ACADEMIC_FIGURE_NO_TEX=1 python scripts/scatter_tsne.py <tmp>/out.png` 后查看 PNG。
- AC6：有 kaleido 时导出 plotly PDF 并运行 `scripts/audit_pdf_text.py --min-pt 8.5`。

## 回滚点

- 文档修改与脚本修改分两个提交：先提交 references 与 interface，再提交 scripts 与 tests。
- 某个脚本在无 LaTeX 模式下改变了有 LaTeX 时的输出：只回退该脚本的提交块，
  并在 check 记录中说明。
