# Design — paper-plot skill

## 1. 目标结构

```
skills/research-learning-knowledge/paper-plot/
├── SKILL.md                       # 精简路由：两 mode + 风格目录速查
├── references/
│   ├── modes/
│   │   ├── from-data.md           # 源自 plot-from-data/SKILL.md 的 workflow + 数据替换规则
│   │   └── from-image.md          # 源自 plot-from-image/SKILL.md 的 workflow + 累积经验
│   ├── styles/                    # 8 个风格参数文档（内容不改，仅修脚本引用路径）
│   │   ├── bar_paired_delta.md
│   │   ├── bar_grouped_hatch.md
│   │   ├── line_confidence_band.md
│   │   ├── line_training_curve.md
│   │   ├── line_loss_with_inset.md
│   │   ├── scatter_tsne_cluster.md
│   │   ├── scatter_broken_axis.md
│   │   └── radar_dual_series.md
│   └── reproduction_guide.md      # from-scratch 分析清单
├── scripts/
│   ├── bar_memevolve.py           # 8 个 from-data 风格脚本
│   ├── bar_spice.py
│   ├── line_aime.py
│   ├── line_loss_inset.py
│   ├── line_selfdistill.py
│   ├── radar_dora.py
│   ├── scatter_break.py
│   ├── scatter_tsne.py
│   └── classwise_iou_table.py     # from-image 示例脚本
├── assets/
│   └── originals/                 # 10 张论文原图（from-image 风格匹配画廊）
└── evals/
    └── evals.json
```

设计依据：对齐房规 exemplar `paper-workbench`（精简 SKILL.md + `references/modes/` 分层 +
`scripts/` + `evals/`）。`styles/` 子层是对 8 个并列风格文档的合理归类，避免 references 根目录铺平。

## 2. SKILL.md 契约

- **Frontmatter**（顶层）：
  - `name: paper-plot`
  - `description`: 单段，覆盖两用法触发语（"用 X 风格画我的数据"/"plot this data"/"复现这张图"/
    "reproduce this figure" 等），并显式划界：本 skill 负责**生成/复现学术图表**，
    文献阅读/综述/对比走 `paper-workbench` / `literature-mentor`。
  - `category: research-learning-knowledge`
  - `tags: [matplotlib, plotting, figures, paper, reproduction, visualization]`
  - `version: 1.0.0`
- **Body**：路由型，约 50–80 行。包含：
  1. 两 mode 一句话说明 + 何时用哪个 → 指向 `references/modes/*.md`。
  2. 8 风格速查表（风格名 / 类型 / 脚本 / 适用场景），与原 plot-from-data 表等价。
  3. 脚本运行约定：`<skill-dir>` 占位符说明 + `python scripts/<x>.py [out.png]` + Windows `PYTHONUTF8=1` 提示。

## 3. 内容迁移映射

| 源 | 目标 | 改动 |
|----|------|------|
| `plot-from-data/SKILL.md`（workflow/数据替换/风格表） | `references/modes/from-data.md` | 去 frontmatter；脚本引用改 `<skill-dir>/scripts/...`；`python3→python` |
| `plot-from-image/SKILL.md` | `references/modes/from-image.md` | 同上；`../plot-from-data/references/<n>.md` → `../styles/<n>.md`；`../plot-from-data/scripts/` → `../../scripts/` |
| `plot-from-data/references/*.md`（×8） | `references/styles/*.md` | 文中 `repro/xx.py` / `scripts/xx.py` 引用对齐到 `<skill-dir>/scripts/` |
| `plot-from-image/references/reproduction_guide.md` | `references/reproduction_guide.md` | 跨 skill 引用改 skill 内路径 |
| `plot-from-data/scripts/*.py`（×8） | `scripts/*.py` | 见 §4 |
| `plot-from-image/scripts/classwise_iou_table.py` | `scripts/classwise_iou_table.py` | 见 §4 |
| `originals/*.png`（×10） | `assets/originals/` | 原样复制 |
| `repro/*`、`agents/openai.yaml`、根 `README.md` | — | 不迁移 |

## 4. 脚本可移植性修复（统一最小改动）

每个脚本仅做以下**机械性**改动，不动绘图逻辑：

1. **输出路径参数化**：原硬编码 `fig.savefig('xxx_repro.png', ...)` →
   ```python
   import sys
   OUT = sys.argv[1] if len(sys.argv) > 1 else '<default>.png'
   fig.savefig(OUT, dpi=300, facecolor='white', bbox_inches='tight')
   ```
   默认名落在当前工作目录（不写回 skill 目录）。
2. **`python3` 仅出现在文档**，脚本 shebang 若有则保留无害；文档统一用 `python`。
3. 脚本本身不读外部文件（数据内嵌），故无需 `Path(__file__)` 自定位；若有读资源的脚本
   （如 classwise_iou 若引用图）才加 `Path(__file__).parent` 锚定。实施时按文件实际情况判定。
4. 不改 import、不改 rcParams、不改数据。

## 5. evals 设计

`evals/evals.json`，git-commit schema：
- 正例：
  - `from-data`：给定数据 + 指定风格名 → 期望走 paper-plot 的 from-data。
  - `from-image`：上传论文图要求复现 → from-image。
- 路由反例（≥2）：
  - "帮我深读这篇 arXiv 论文的方法" → `literature-mentor`，非 paper-plot。
  - "把这 5 篇论文做成文献综述/对比表" → `paper-workbench`，非 paper-plot。

## 6. 兼容性 / 回滚

- 纯新增目录，不动现有 skill 与源参考目录 → 低风险。
- 回滚边界：删除 `skills/research-learning-knowledge/paper-plot/` 整个目录即可复原；
  若已跑过 `just docs-sync`，回滚后需再次 `docs-sync` 还原 docs 目录。

## 7. 关键风险

- **docs-sync 副作用**（见记忆 `docs-sync-regenerates-all-docs`）：结构定稿后再统一跑 `docs-sync`，
  先确认无其它未提交 WIP。
- **Windows GBK**（见记忆 `windows-python-utf8`）：脚本/校验涉及读 UTF-8 时前置 `PYTHONUTF8=1`。
- 风格脚本可能依赖 matplotlib/numpy/PIL；抽样运行前确认环境可用，否则 evals/验证降级为「脚本可 py_compile + 人工确认逻辑等价」。
