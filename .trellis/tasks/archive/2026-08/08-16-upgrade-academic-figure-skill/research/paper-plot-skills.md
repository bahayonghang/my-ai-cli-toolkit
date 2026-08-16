# Research: paper-plot-skills（Trae1ounG/paper-plot-skills）差异校对

- **Query**: 现有 academic-figure 的 from-data / from-image 已移植该仓库，校对上游与移植版的差异
- **Scope**: internal（本地 shallow clone 与本仓库 skill 逐文件比对，未执行代码）
- **Date**: 2026-08-16
- **Clone**: `ref/repo/plot_ref/paper-plot-skills/`，remote `https://github.com/Trae1ounG/paper-plot-skills.git`，HEAD `cde5e84`（2026-04-20）

## 1. 仓库结构概览

```
paper-plot-skills/
├── README.md                                  # 风格总表 + 原图/复现对照 gallery
├── originals/                                 # 10 张论文原图 PNG
├── repro/                                     # 10 张复现结果 PNG
├── plot-from-data/                            # skill 入口 1
│   ├── SKILL.md                               # 54 行
│   ├── agents/openai.yaml                     # 4 行，OpenAI/Codex 接口元数据
│   ├── references/*.md                        # 8 个风格参数文档
│   └── scripts/*.py                           # 8 个复现脚本
└── plot-from-image/                           # skill 入口 2
    ├── SKILL.md                               # 83 行
    ├── agents/openai.yaml                     # 4 行
    ├── references/reproduction_guide.md       # 102 行
    └── scripts/classwise_iou_table.py         # 221 行
```

数量口径：**8 个风格**、**9 个脚本**（8 风格脚本 + `classwise_iou_table.py`）、
**10 张原图**（`line_selfdistill` 对应 train / scale 两张）、9 个参考文档（8 风格 + 1 复现指南）。

## 2. 核心能力与工作流

- **plot-from-data**：确认图型与数据 → 选风格 → 读 `references/<style>.md` 取精确参数 →
  复制 `scripts/<script>.py` 替换顶部数据区 → 运行 → 微调。输出统一 `dpi=300` PNG。
- **plot-from-image**：PIL 量测宽高比 → 匹配 8 个既有风格（命中则改写对应脚本）→
  未命中则按 `reproduction_guide.md` 从零分析（字体族、spine/刻度、配色、网格、特殊元素）→
  写脚本、跑图、目视比对、迭代。含 8 项迭代 checklist 与 6 条经验条目。
- **风格来源论文**（仅记录在 README，见 §4 缺口）：MemEvolve、SPICE、Self-Distillation、
  DAPO、SiameseNorm、MemGen、Meta-Harness、DoRA；`classwise_iou` 来自用户上传截图（issue #1）。

## 3. 逐项差异校对结论

以下比对均先做行尾 CR 归一化（上游为 LF，本地为 CRLF，直接 `diff` 会全文件报差异）。

| 对象                     | 上游                                  | 本地落点                                         | 归一化后差异                               | 结论             |
| ------------------------ | ------------------------------------- | ------------------------------------------------ | ------------------------------------------ | ---------------- |
| 8 个风格参数文档         | `plot-from-data/references/*.md`      | `references/styles/*.md`                         | 每文件 1–2 处路径改写                      | 内容一致，无遗漏 |
| `reproduction_guide.md`  | `plot-from-image/references/`         | `references/reproduction_guide.md`               | 1 处路径改写（第 57 行）                   | 内容一致         |
| 8 个风格脚本             | `plot-from-data/scripts/`             | `scripts/`                                       | 每文件 +`import sys`，`savefig` 路径参数化 | 内容一致         |
| `classwise_iou_table.py` | `plot-from-image/scripts/`            | `scripts/`                                       | 同上（221 → 222 行）                       | 内容一致         |
| 10 张原图 PNG            | `originals/`                          | `assets/originals/`                              | 字节完全相同                               | 一致             |
| 2 个 `SKILL.md`          | `plot-from-data/`、`plot-from-image/` | `references/modes/from-data.md`、`from-image.md` | 重构为模式文档                             | 见 §3.2          |

### 3.1 移植时所做的改写（均为有意适配）

1. **风格文档路径改写**：`repro/<script>.py` → `<skill-dir>/scripts/<script>.py`。
2. **复现指南路径改写**：`../plot-from-data/references/<name>.md` → `styles/<name>.md`。
3. **脚本输出路径参数化**：上游把输出硬编码为作者本机绝对路径
   （`/Users/bytedance/gitcode/paper_experiment_plot_skills/repro/<name>_repro.png`），
   本地改为 `sys.argv[1]`，缺省写当前目录。该改写移除了不可移植的绝对路径。

### 3.2 本地移植相对上游的增补

- `modes/from-data.md` 新增「Runtime dependencies」小节：记录 `scatter_break.py` 需 scipy，
  `bar_spice.py` / `line_selfdistill.py` / `line_loss_inset.py` / `scatter_tsne.py` 需 LaTeX，
  并给出 `text.usetex=False` 的回退指引。上游无此说明。
- `modes/from-data.md` 记录 argv 输出契约，含 `line_selfdistill.py` 产出两图、
  分别由 `argv[1]` / `argv[2]` 控制。上游无此说明。
- `modes/from-image.md` 新增与 `assets/originals/` 的目视比对指引，并把
  `classwise_iou_table.py` 标注为「从零分析」的完整范例。上游仅在 README 提及。
- 两个模式文档均接入本仓库 `SKILL.md` 的输出契约表，路由与 journal-spec 模式并列。

### 3.3 上游未移植的内容

| 对象                            | 是否需要补 | 说明                                                                                                              |
| ------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `README.md` 风格→来源论文对照表 | **需要**   | 见 §4 缺口 1                                                                                                      |
| `repro/` 10 张复现结果图        | 否         | 属可再生成产物；PRD 约束不 vendor 大体积资产                                                                      |
| `agents/openai.yaml` ×2         | 否         | OpenAI/Codex 平台接口元数据（`display_name` / `short_description` / `default_prompt`），与本仓库 skill 约定不兼容 |
| 2 个 `SKILL.md` 的 frontmatter  | 否         | 已由本仓库统一 `SKILL.md` 的 description 与路由表取代                                                             |

### 3.4 上游是否有新增

上游 HEAD 为 2026-04-20，本地移植内容与该 HEAD 完全对应，**无新增风格、脚本或文档**。
本次未发现遗漏项。注意：shallow clone 深度为 1，仅可见 1 个 commit，无法据此判断
2026-04-20 之后是否有未拉取的远端提交；如需确认应重新 `git fetch`。

## 4. 已发现的缺口

1. **5 个风格文档缺来源论文标注**。`bar_paired_delta`、`bar_grouped_hatch`、
   `line_confidence_band` 三份带 `**来源论文**：` 行；`line_training_curve`（DAPO）、
   `line_loss_with_inset`（SiameseNorm）、`scatter_tsne_cluster`（MemGen）、
   `scatter_broken_axis`（Meta-Harness）、`radar_dual_series`（DoRA）五份没有。
   该映射只存在于未移植的上游 README。此缺口在上游即存在，随移植传递。
2. **原图指针失效**。带来源标注的三份文档中，`**原图**：` 指向 `image1.png`、`image5.png`、
   `image2.png` / `image3.png`，与本地 `assets/originals/` 的实际文件名不对应。上游同样如此。
3. **本地 skill 无来源仓库标注**。对 `skills/academic-research-tools/academic-figure/`
   全目录检索 `Trae1ounG` / `paper-plot-skills` / `licen` 等关键词，0 命中。
   与 PRD「吸收内容需记录来源仓库与许可证」的要求不符。
4. **上游文案数字不一致**：README 写「9 张真实论文图表」，`plot-from-image/SKILL.md`
   写「9 reproduced figures across 7 papers」，而 README gallery 实列 10 行、8 篇具名论文
   加 1 张用户截图。原因未查明。本地 `modes/from-image.md` 沿用了「7 papers」的表述。

## 5. 建议吸收点

| 优先级 | 内容                                                                                                     | 建议落点                                                                                                                                           |
| ------ | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 高     | 补齐 5 个风格文档的来源论文标注（DAPO / SiameseNorm / MemGen / Meta-Harness / DoRA），口径与已有三份一致 | `references/styles/line_training_curve.md`、`line_loss_with_inset.md`、`scatter_tsne_cluster.md`、`scatter_broken_axis.md`、`radar_dual_series.md` |
| 高     | 新增来源与许可证标注章节，覆盖 paper-plot-skills 与本次整合的其余仓库                                    | 新增 `references/attribution.md`，并在 `SKILL.md` 资源区引用                                                                                       |
| 中     | 修正三份文档中失效的 `**原图**：image*.png` 指针，改为 `<skill-dir>/assets/originals/<name>.png`         | `references/styles/bar_paired_delta.md`、`bar_grouped_hatch.md`、`line_confidence_band.md`                                                         |
| 低     | 校正 `modes/from-image.md` 的「7 papers」表述，改为按实际可核对的数量陈述                                | `references/modes/from-image.md:56`                                                                                                                |

不建议吸收：`agents/openai.yaml`、`repro/` 图片、上游两个 `SKILL.md` 的 frontmatter。

## 6. 许可证与出处标注要求

- 仓库**无 LICENSE 文件**（已递归检索 `*licen*` / `*copying*` / `*notice*`，0 命中）。
  默认版权归作者保留。
- 本地已复制的内容包括：8 份风格文档、9 个脚本、10 张原图 PNG（原图本身来自各来源论文，
  版权归论文作者）。该复制已发生在既有提交中，本次为补标注而非重新决策。
- 建议标注格式：仓库名 `Trae1ounG/paper-plot-skills`、URL、HEAD `cde5e84`（2026-04-20）、
  「无 LICENSE」、已做的两项改写（路径改写、输出参数化）。
- 原图 PNG 需分别标注其来源论文，避免被理解为本仓库原创。

## 7. 依赖与体积注意事项

- 文本部分体积小（9 个文档合计约 700 行）。
- `assets/originals/` 10 张 PNG 已入库，属既有状态；`repro/` 不再引入。
- 运行依赖已在 `modes/from-data.md#runtime-dependencies` 记录：matplotlib + numpy 为基线，
  `scatter_break.py` 另需 scipy，4 个脚本需 LaTeX。该记录与本次核对一致。

## Caveats / Not Found

- 未执行任何脚本，未验证复现图与原图的视觉一致性。
- shallow clone 深度为 1，无法查看上游完整提交历史，§3.4 的「无新增」结论限于当前 HEAD。
- 仓库无 LICENSE 的原因未查明。
