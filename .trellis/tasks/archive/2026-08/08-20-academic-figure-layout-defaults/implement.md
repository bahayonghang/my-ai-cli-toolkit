# Implement — academic-figure 1.2.0 画幅与曲线留白

执行前提：用户批准最新规划摘要后，`task.py start` 使状态为 `in_progress`。上下文按 `implement.jsonl` 注入。数值与落点以 `design.md` 为准；失败样本事实以 `research/layout-failure-analysis.md` 为准。

## 硬约束

1. 只改 `skills/academic-research-tools/academic-figure/` 与 version 触发的 `docs/` 目录页。
2. 不改 8 个目录风格脚本的 `figsize` / `set_ylim`（A8）。
3. SKILL.md 脚本引用保持 `python "<skill-dir>/scripts/...." `。
4. 含 ``` 的 Markdown 示例外层用 4 反引号。
5. 数值只写进 `references/layout-defaults.md`，其它文件指针引用。
6. Windows：`PYTHONUTF8=1`。

## 批次（顺序执行，B 依赖 A 的文件名）

### Batch A — 合同与指针

- 新增 `references/layout-defaults.md`：画布、y 留白、字号、绘图框占比、例外、matplotlib/plotly 最小代码。
- 修改 `references/matplotlib-recipes.md`：三套 PRESETS 的 `figure.figsize` 高度改为宽度×9/16（IEEE 3.5×1.97，Elsevier 3.54×1.99，Nature 3.5×1.97）；示例 `subplots(figsize=(3.5, 2.6))` 同步；SciencePlots 段写明随后覆盖尺寸；指针到 layout-defaults。
- 修改 `references/plotly-recipes.md`：默认 `height_px = round(width_px * 9/16)`；指针。
- 修改 `references/chart-recipes.md`：替换 “Dynamic y-axis tightening” 条。
- 修改 `references/visual-review.md`：读图清单 + 修复表。
- 修改 `references/qa-checklist.md`：Final size 行。
- 修改 `references/viz-pitfalls.md`：P4 适用范围。
- 修改 `references/reproduction_guide.md`：whitespace 行限定 from-image。
- 修改 `references/design-theory.md`：普通论文路径禁止 Display/Compact 字号。
- 修改 `references/modes/journal-spec.md`：加载步加入 layout-defaults。
- 修改 `SKILL.md`：Resources 一行；`version: 1.2.0`。

### Batch B — 机器检查与测试

- 修改 `scripts/visual_qa.py`：`audit_layout` 增加 y 留白 WARN 与单面板绘图框占比 WARN（阈值见 design.md）。
- 修改 `tests/visual-qa.test.mjs`：
  - 贴数据 ylim 的折线夹具 → 断言 stdout/返回结构含留白 WARN。
  - 过大 labelsize 的小画布折线夹具 → 断言含绘图框 WARN。
  - 保留 `--help` 与 demo 测试。
  - skip 条件与现文件一致。

### Batch C — 评测、目录、验证

- 修改 `evals/evals.json`：追加 id 24–26（design.md 表）。
- `just docs-sync`（frontmatter version）。
- 验证命令（仓库根目录）：

```text
just skills-check
just python-check
just node-test
just docs-check
git diff --check
```

若只改 academic-figure 测试，可先：

```text
node --test skills/academic-research-tools/academic-figure/tests/visual-qa.test.mjs
```

收尾可跑 `just ci`。

## 风险文件

| 文件 | 风险 | 回滚 |
| --- | --- | --- |
| `scripts/visual_qa.py` | 新 WARN 误报 polar/双轴/无数据轴 | 测试夹具 + 跳过条件；回滚该函数增量 |
| `matplotlib-recipes.md` PRESETS | 漏改示例 figsize 造成两套高度 | grep `2.6` / `2.66` |
| `evals/evals.json` | 改到旧 id 路由 | 只追加 |
| 目录 `scripts/*.py` | 误改复现 ylim | 实施前 `git diff` 确认不在名单内 |

## `task.py start` 前检查

- [x] `prd.md` 已收敛（无 TBD、无未决 Open Questions）
- [x] `design.md` 与 `implement.md` 已写
- [ ] `implement.jsonl` / `check.jsonl` 已换成真实条目（本步在规划收尾写入）
- [ ] 用户批准本规划摘要
- [ ] 然后才 `python ./.trellis/scripts/task.py start 08-20-academic-figure-layout-defaults`
