# 论文工作流

这篇 guide 解释如何把 `paper-workbench` 当作当前仓库里的标准文献工作流入口。

适用场景是：任务从论文类来源开始，最终想得到下面这些结果之一：

- 一份可复用的规范化 `paper-record`
- 一次快速判断，决定某篇论文是否值得继续细读
- 一份结合自己研究问题的单篇精读结果
- 一份多篇文献整合与研究空白地图
- 一份综述框架或段落写作支撑

## 推荐流程

1. 先把论文来源规范化成 `paper-record`
2. 检查 `status`、`provenance.confidence`、`warnings` 和 `errors`
3. 如果任务依赖研究定位，创建或加载 `researcher-profile`
4. 选择正确的单篇或多篇模式
5. 如果任务会跨多篇论文或多个会话，保存可复用 artifact

这样做的好处是：所有后续分析都建立在同一层事实之上，同时又能继续向上走到精读、整合和综述构建。

## 工作流阶段

| 阶段 | 主要模式或 artifact | 产出 |
|------|---------------------|------|
| intake | `json` -> `paper-record` | 规范化论文事实层 |
| triage | `scan` | 判断这篇论文值不值得继续读 |
| 单篇分析 | `deep-read` 或 `card` | 面向研究问题的单篇理解 |
| 兼容分析 | `interpret` 或 `xray` | 轻量讲解或紧凑批判 |
| 多篇整合 | `synthesis` | 概念图谱、争论光谱、方法矩阵、空白地图 |
| 综述构建 | `review` | 叙事策略、结构化大纲、段落写作支撑 |

## 怎么选模式

| 目标 | 推荐模式 | 原因 |
|------|----------|------|
| 查看或保存规范化论文事实 | `json` | 最适合做起点，也最适合做后续交接 |
| 快速判断这篇值不值得精读 | `scan` | 速度最快，也最稳妥 |
| 让论文和自己的研究问题发生关系 | `deep-read` | 有完整解构和战略关联 |
| 只保留可复用笔记 | `card` | 紧凑、适合后续写综述 |
| 不要完整精读，只想讲明白 | `interpret` | 轻量的人类可读输出 |
| 想挑战论证、假设和增量 | `xray` | reviewer-style 的紧凑批判 |
| 整合 3 篇及以上论文 | `synthesis` | 最适合比较和找空白 |
| 搭综述框架或写综述段落 | `review` | 把整合结果转成结构和写作支撑 |

如果拿不准：

- 单篇论文、用户是阅读诉求：先用 `scan`
- 单篇论文、用户明显要机器可读结果或保存结果：先用 `json`
- 3 篇及以上论文、用户要求比较或整合：先用 `synthesis`

## 研究者画像

`deep-read`、`card`、`synthesis` 和 `review` 在有 `researcher-profile` 时会明显更强。

画像字段包括：

- research field
- core research question
- thesis 或 tentative claim
- target tier
- current stage

当你希望系统回答下面这类问题时，就应该先有 profile：

- 这篇论文为什么和我的选题有关？
- 它是支持、挑战，还是复杂化我的论点？
- 我最适合补哪一类研究空白？
- 现在这组文献更适合用什么综述叙事策略？

## Artifact 复用

当工作流会跨多轮对话或多篇论文时，应该复用 artifact，而不是反复从原始来源开始。

| Artifact | 适用场景 |
|----------|----------|
| `paper-record` | intake 已完成，不想再重复抓取或解析 |
| `paper-deep-read` | 单篇精读已经做完，后面还要继续复用它的战略分析 |
| `literature-synthesis` | 多篇整合已经完成，准备进入综述规划 |
| `review-outline` | 想在后续会话继续打磨结构或段落 |

推荐目录：

```text
workspace/
├── researcher_profile.json
├── paper_deep_read/
├── literature_synthesis/
└── review_outline/
```

## 典型工作流

### 1. 快速筛一篇新论文

适用场景：刚下载一篇论文，想先判断值不值得细读。

推荐顺序：

1. 先规范化来源
2. 运行 `scan`
3. 如果相关性高，再进入 `deep-read`

这条路径最适合大批量筛论文。

### 2. 让单篇论文服务于自己的项目

适用场景：某篇论文已经看起来有价值，你需要的不只是摘要。

推荐顺序：

1. 先加载或创建 `researcher-profile`
2. 如果需要，先规范化来源
3. 运行 `deep-read`
4. 如果后面还会复用，保存成 `paper-deep-read` artifact

这个模式回答的是：“这篇论文做了什么，以及它对我的项目意味着什么。”

### 3. 建可复用的文献卡片

适用场景：你想为后续综述写作积累一批轻量但可复用的文献笔记。

推荐顺序：

1. 规范化来源
2. 如果战略关联重要，加载 profile
3. 运行 `card`
4. 如有需要，保存输出

这条路径适合快速沉淀文献素材库。

### 4. 整合多篇论文并找研究空白

适用场景：你已经有 3 篇及以上论文，想看清楚这个议题的结构。

推荐顺序：

1. 准备 3 篇及以上的 `paper-record` 或 `paper-deep-read`
2. 加载 `researcher-profile`
3. 运行 `synthesis`
4. 保存成 `literature-synthesis` artifact

如果只有 2 篇输入，应把结果理解为“对比优先”，研究空白只能视作 provisional。

### 5. 从整合结果走向综述写作

适用场景：文献整合已经完成，下一步要开始搭结构或写段落。

推荐顺序：

1. 从 `literature-synthesis` 开始；如果还没有，也可以使用 3 篇及以上 `paper-deep-read` 加 profile
2. 运行 `review`
3. 选择推荐的叙事策略
4. 用结构化大纲和 PEEL 段落支持继续写作

这是从“读文献”正式切到“建综述”的分界点。

## 来源路由与预期保真度

| 来源类型 | metadata 路径 | 全文路径 | 常见结果 | 常见回退或限制 |
|----------|---------------|----------|----------|----------------|
| arXiv ID / arXiv URL / AlphaXiv URL | AlphaXiv paper API | 有 AlphaXiv markdown 就用，否则回退 arXiv PDF | 往往是 preprint 里保真度最高的路径 | 如果 AlphaXiv 没覆盖，会自动退回 PDF 解析 |
| DOI / DOI URL | Crossref | 通常没有 | metadata 较丰富，但正文常常不足 | `--fulltext prefer` 也不保证有全文 |
| 本地 PDF | 本地提取 | 同一来源 | PDF 文本可抽取时效果较好 | 依赖 PyMuPDF 兼容提取 |
| 本地 `.txt`、`.md`、`.org` | 直接解析本地文件 | 同一来源 | 对学位论文、草稿、已抽取文本通常很稳 | 文本过稀疏时仍可能只是 `partial` |
| 远程 PDF URL | 下载 PDF | 同一来源 | 已有直链时比较直接 | PDF 文本质量差会拖低 summary 质量 |
| 论文落地页 | 页面 metadata 加解析出的 PDF | 只在能解析出 PDF 时才有 | 页面暴露 PDF 时可用 | 没有暴露 PDF 就会 `unresolved` |
| 已有 `paper-record` | 直接信任记录 | 直接复用记录 | 最快也最稳定 | 只有在关键信息明显缺失时才值得重抓 |

## 证据与 grounding 说明

- `paper-record` 仍然是事实层
- `content.page_chunks` 提供的是页级锚点，不是段落级精确引用
- 如果请求中的页码或引文无法被现有锚点支撑，正确回退是 `[信息待核实]`
- 不要把 DOI metadata 误当成正文事实

## 排障

### 落地页返回了 `unresolved`

常见原因：页面没有暴露 PDF 链接或 PDF meta tag。

处理方式：

- 直接找 PDF URL
- 如果只需要 metadata，就改用 DOI
- 或者把 PDF 下载到本地，再按本地文件处理

### DOI 可以解析，但还是没有全文

常见原因：当前 DOI intake 主要依赖 Crossref metadata，不会自动获得正文。

处理方式：

- 如果只是轻量解释，可以接受 metadata-only 结果
- 如果要做深度分析，改走 PDF 或本地文本 intake

### 本地 PDF 提取失败

常见原因：需要 `pymupdf` 或 `fitz`，或者 PDF 本身缺少可抽取文本。

处理方式：

- 安装兼容的 PyMuPDF 提取环境
- 如果有文本导出，优先用本地文本
- 换一个文本质量更好的 PDF 来源

### 你手里只有粘贴出来的自由文本

当前限制：`normalize_paper.py` 目前不把任意粘贴文本当成一等输入路径。

处理方式：

- 先保存成 `.txt`、`.md` 或 `.org`
- 或者先整理成规范化 `paper-record`，再复用这份产物

## 相关页面

- [Paper Workbench 技能说明](/zh/skills/research-learning-knowledge/paper-workbench)
- [技能概览](/zh/skills/)
