# Design — literature-mentor 领域改造与拆分

- Task: `.trellis/tasks/06-20-litmentor-redomain`
- 关联: `prd.md`

## 设计原则

骨架不动，皮肤替换，重量下沉。literature-mentor 的价值在交互式导师**流程**（叙事类型判断 →
预检 → novelty 校准 → 思考路径重建 → 概览 → 逐图停顿 → 四级诚实标注 → 复现/反例/follow-up），
这套与领域无关，原样保留。只替换"领域皮肤"，并把可独立成章的重内容移到 `references/`。

## 一、领域映射（牛基因组学 → CS/DL/自动化）

### 1.1 §6.4 图片类型特化指南

| 原（群体遗传学） | 新（CS/DL/自动化） | 文字充分性提示 |
|---|---|---|
| PCA/MDS 群体聚类图 | 嵌入可视化（t-SNE/UMAP/PCA of features） | 文字常够（解释方差/簇）；簇重叠、离群点需图 |
| 系统发育树 🌳 | 模型/方法架构图、pipeline 框图 | ⚠️ 强烈建议图：拓扑/数据流无法用文字准确描述 |
| Admixture/Structure 图 | 注意力热图 / saliency / MoE 路由权重 | 文字常够（层/头、权重比例）；细粒度梯度需图 |
| Manhattan plot | 训练/验证曲线（loss/acc/reward vs step） | 文字常够（最终指标、拐点）；多曲线交叉、抖动需图 |
| LD decay 图 | 缩放律 / 收敛曲线 / 超参敏感性曲线（常 log-log） | 文字常够（斜率/趋势）；曲线形状、拐点位置需图 |
| ROH/选择信号图 | 消融实验表·图 / 混淆矩阵 / 误差分析 | 文字常够（候选项、数值）；信号强弱对比、矩阵格局需图 |
| （新增）| benchmark 对比柱状图 / SOTA 表 | 文字常够（排名、数值）；密集分组对比需图 |
| （新增）| 定性样例（生成结果、before/after、失败案例） | ⚠️ 视觉内容，通常需图 |

保留原指南的"文字通常足够 / 可能需要图片"两档结构，只换条目。

### 1.2 领域背景整合段（原"中国黄牛"段）

| 原 | 新 |
|---|---|
| 中国黄牛遗传背景（瘤牛×普通牛混血） | 主流模型家族与范式（如 Transformer/CNN/扩散/RL/具身），按子领域取舍 |
| 高原适应/热适应等性状 | 具体任务领域（NLP/CV/语音/RL/系统与自动化）的核心问题 |
| GATK/PLINK/ADMIXTURE/SNeP | PyTorch/JAX、HuggingFace、vLLM、常见 benchmark（ImageNet/GLUE/MMLU/SWE-bench 等） |
| LD/Ne/Fst/选择信号 | 梯度下降/注意力/过拟合/缩放律/样本效率/泛化差距等核心概念 |
| 「3700样本 / 中国黄牛品种鉴定」示例 | 去单数据集硬编码；改为"你的 CS/DL/自动化研究数据或复现实验"这类通用表述 |

### 1.3 叙事类型判断（§2）微调

原"方法/工具型 vs 科学发现型"对 CS/DL **天然契合**，基本保留：

- 方法/工具型："我们提出 X 方法/架构/系统" + benchmark 表 + 以 SOTA/效率提升为卖点
  → 看 ablation 是否充分、baseline 是否公平、提升是否在真实/大规模设置成立。
- 科学发现型："我们发现 X 现象/规律"（如缩放律、涌现、训练动力学）+ 以证据链为核心
  → 看证据是否支持结论、有无替代解释、推广条件是否清晰。

仅把示例从"Nature 子刊工具论文"换成 CS 语境（如顶会 vs arXiv 预印本的卖点错位）。

## 二、拆分架构（450 行 → 精简 SKILL.md + references/）

### 2.1 SKILL.md 保留（精简入口，目标 ≤ 220 行）

- frontmatter（改造后）
- 顶部：个人向 CS/DL/自动化定位 + "何时改用 paper-workbench" 边界（新增，简短）
- §0 阅读模式自动选择（模式表保留在主文件——它是路由核心）
- §1 文献获取（Zotero 优先 + web 兜底，保留，可压缩）
- 各流程段保留**简要步骤 + 指向 references 的指针**，不再内联长表与长指南

### 2.2 下沉到 references/

| 新文件 | 来源（原 SKILL.md 段） | 内容 |
|---|---|---|
| `references/reading-protocol.md` | §2 §3 §3.1 §4 §5 | 叙事类型判断、阅读前 3 件事、novelty 校准、作者思考路径重建、整体概览 |
| `references/figure-reading.md` | §6.1 §6.2 §6.3 §6.4 | 信息源综合策略、信息充分性检查、逐图解读框架、四级诚实标注、CS/DL 图类型指南 |
| `references/research-generation.md` | §8.2 §8.3 §8.4 §8.5 | 最脆弱假设、一周最小复现、最强反例、非增量 follow-up、生成性追问 |
| `references/mentor-style.md` | 「解读风格」整段 | 导师角色、三维视角、CS/DL 领域背景整合、语言约定 |

§7（交互式逐图停顿）含禁止行为，是行为铁律，**留在 SKILL.md**（不能下沉到易被忽略的 references）。
§8.1 核心提炼（问题/解法/发现/领域位置）作为输出契约，保留在 SKILL.md 主干，细化模板放 references。

### 2.3 引用方式

SKILL.md 在每段保留一句话职责 + `参见 references/<file>.md`。references 文件用相对路径互链。
本 skill 无脚本，**不涉及 `<skill-dir>` 脚本路径问题**；references 路径用相对引用即可。

## 三、边界声明（vs paper-workbench）

在 description 与 SKILL.md 顶部加入：

> 本 skill 面向**个人 CS/DL/自动化文献的交互式导师深读**，Zotero 优先、逐图停顿。
> 若需要：多篇论文综合/对比/找研究空白、researcher-profile 驱动、arXiv·DOI·PDF 批量规范化 →
> 改用 `paper-workbench`。

## 四、兼容性与回滚

- 纯文档改动，无脚本/依赖变化，回滚 = 还原 `literature-mentor/` 目录。
- 行为契约（三种模式、逐图停顿、四级标注、证据纪律）必须前后一致，仅领域示例与组织结构变化。
- 与 `06-20-rlk-conventions` 协调：后者补的触发 eval 必须用本任务定稿的 CS/DL 领域口径。
