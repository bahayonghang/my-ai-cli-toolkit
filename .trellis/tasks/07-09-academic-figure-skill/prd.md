# 新建 academic 分类与 academic-figure 学术图表技能

## Goal

在 `skills/` 下新建一个学术类目，并在其中创建 `academic-figure` 技能：指导 AI 用 matplotlib（含 seaborn）与 plotly 绘制符合 IEEE、Elsevier、Nature 等期刊投稿规范的学术图表；对 industrytslib 项目自动走其内置可视化系统（`create_plotter` + 期刊风格），对独立项目提供期刊规格卡 + rcParams/模板方案。

参考基线：`ref/repo/nature-skills/skills/nature-figure`（静态/动态分层路由、五点图表契约、QA 契约、按需 references）。本技能是其"多期刊风格 × 多 Python 库"改造版，不继承 R 后端与 OpenRouter AI 生图路由。

## Background

- `industrytslib` 的可视化模块（`src/industrytslib/utils/visualization/`）已内置注册表式图表系统、Matplotlib/Plotly 双后端、IEEE/Elsevier/Nature/Springer/chinese_thesis 五种风格与导出管线；技能必须优先复用而非重造。
- 其图表家族覆盖：时序、真实/预测对比、箱线、分布、相关性热力图、扩散/GAN 损失曲线、区间预测、序列（npy）、决策序列、联合训练、可靠性、t-SNE/UMAP 降维、回归指标、训练报告。
- 研究材料见本任务 `research/`（期刊规范与工具链、industrytslib 盘点、nature-figure 方法论提炼）。
- **近邻技能**：`skills/research-learning-knowledge/paper-plot` 已存在——定位是"复现具体论文的视觉风格 / 复现上传的论文图"（8 个预置风格脚本、仅 matplotlib、输出 300dpi PNG，无期刊合规体系）。academic-figure 定位是"按目标期刊投稿规范出图"。两者必须显式划界并互相路由，触发词不得冲突。

## Requirements

- R1 类目：在 `skills/` 下新建学术类目目录 `academic-research-tools`（用户已定名，2026-07-09），并同步 `skills/code_map.md` 的类目路由说明。
- R2 入口：`skills/<category>/academic-figure/SKILL.md`，frontmatter 使用顶层 `name`/`description`/`category`/`tags`/`version`，`category` 与父目录一致；`description` 含中英文触发词（论文配图、学术图表、IEEE 图、期刊投稿图、科研绘图等），并与既有技能的触发边界不冲突。
- R3 风格轴：必须支持 `ieee` / `elsevier` / `nature` 三种期刊风格（尺寸、字体、字号、线宽、DPI、格式、色彩模式的规格卡，数值以官方指南为准并附来源）；`springer`、`chinese-thesis`（中文学位论文，含 CJK 字体处理）作为扩展档位。
- R4 库轴：必须支持 matplotlib 与 plotly；seaborn 作为 matplotlib 生态层支持（set_context/set_style + rcParams 协同），不单列后端。
- R5 industrytslib 集成路径：技能能识别 industrytslib 项目场景，优先通过 `create_plotter(backend, project, style=...)` / `plotter.set_style(...)` 出图，并提供"图表家族 → 库 API"映射（覆盖 Background 所列图表家族）。
- R6 独立路径：无 industrytslib 时，按期刊规格卡生成 rcParams / plotly template / seaborn 配置与导出代码，不依赖该库。
- R7 图表契约：继承 nature-figure 五点契约中的四点（核心结论、证据链、原型分类、期刊/导出契约），"backend 门控"改造为"库 + 期刊风格"双轴决策，允许从请求上下文自动推断，推断不出时最多问一次。
- R8 导出契约：按期刊输出正确格式（矢量 PDF/EPS 优先、TIFF/PNG 按 DPI 要求）、字体嵌入、色彩模式与色盲友好调色板约束。
- R9 QA 清单：交付前自查（尺寸、最小字号、线宽、DPI、格式、图例/标签完整性、色彩无障碍）。
- R10 仓库合规：目录与 frontmatter 符合 `skills/AGENTS.md`；若含 Python 脚本则过 `just python-check`；公开目录变化时 `just docs-sync` 后 `just docs-check` 通过。
- R11 评测：提供 `evals/` 触发评测用例（正例 + 近邻负例，中英文），格式参考 nature-figure `evals/evals.json` 并适配本仓库惯例。
- R12 近邻边界：`description` 明确排除 paper-plot 的核心场景（复现具体论文图/模仿特定论文风格），并在正文路由表中指向 paper-plot；在 paper-plot 的 description 末尾追加一句反向路由（期刊投稿合规诉求 → academic-figure，用户已批准 2026-07-09），除此之外不改动 paper-plot。
- R13 类目配套：新类目按仓库惯例补 `AGENTS.md`（样式对齐 `skills/research-learning-knowledge/AGENTS.md`），并更新 `skills/code_map.md`。

## Out of Scope

- R 语言后端；OpenRouter/AI 图像生成路由；dashboard/BI 大屏；Illustrator/Figma 后处理流程。
- 修改 industrytslib 仓库任何代码（只调用，不改动）。
- 期刊投稿系统操作、图注文案代写以外的论文写作能力（归 nature-writing 类技能）。

## Acceptance Criteria

- [ ] A1 `just skills-check` 通过（类目、frontmatter、目录结构合规）。
- [ ] A2 `just ci` 通过（含 python-check、node-test、docs 检查、`git diff --check`）。
- [ ] A3 SKILL.md 路由可走通三条代表路径的干跑（dry-run 叙述或脚本产物）：(a) IEEE + matplotlib 时序预测对比图；(b) Elsevier + plotly 相关性热力图并导出；(c) Nature + matplotlib/seaborn t-SNE 图。每条路径能给出正确的尺寸/字体/DPI/格式参数。
- [ ] A4 industrytslib 集成示例代码与该库当前 API 一致（以 `research/industrytslib-viz-inventory.md` 为准，方法名、参数可对上）。
- [ ] A5 期刊规格卡数值均有来源 URL；查不到官方值处标注 missing evidence，无编造数值。
- [ ] A6 触发评测：`evals/` 正负例全部按预期命中/不命中（人工核查或脚本断言）。
- [ ] A7 `skills/code_map.md` 与生成的公开文档反映新类目与新技能。

## Constraints

- Windows 环境：Python 脚本调用需 `PYTHONUTF8=1`；`rm -rf` 被 pre-bash hook 拦截（用 `mv` 替代）；`just docs-sync` 会重生成全部 docs，提交前先处理无关 WIP。
- 技能正文遵循 nature-figure 式"按需加载"：SKILL.md 保持精简路由，重内容放 `references/`。

## Notes

- 类目命名、目录内文件切分、manifest 是否引入等技术决策放 `design.md`。
- 复杂任务：`design.md` 与 `implement.md` 齐备后才可 `task.py start`。
