# Paper Workbench

当前 academic skill 目录中的主文献工作台入口。

`paper-workbench` 已经不只是“论文归一化 + 两个读出模式”。它现在覆盖完整的论文工作流表面：先把来源规范化成 `paper-record`，再用 `researcher-profile` 作为研究锚点，产出可复用的单篇分析 artifact、跨文献整合 artifact，以及综述规划 artifact。

## 适用场景

- 用户给出论文类来源，而且目标不只是原始解析
- 任务是快速预判、精读、做卡片、对比、整合、找研究空白，或搭建综述框架
- 你希望先拿到一份规范化论文产物，再做多轮后续分析
- 你希望多篇整合建立在统一事实层之上，而不是每次临时重读来源

## 不适用场景

- 主要任务是搜索或筛选 `.bib` 文献库时，应改用专门的书目工作流
- 主要任务是把模型论文转成可运行代码时，应切换到面向实现的工作流
- 论文分析已经完成，下一步是做演示材料时，用 `academic-slides`

## 对外接口

| 接口 | 作用 |
|------|------|
| `paper-record` | 规范化后的单篇论文事实层 |
| `researcher-profile` | 用户研究锚点，用于相关性、定位与综述规划 |
| `paper-deep-read` | 可复用的单篇深读分析 artifact |
| `literature-synthesis` | 多篇文献整合 artifact |
| `review-outline` | 综述规划 artifact，用于结构和段落写作 |

## 支持的输入

| 输入 | 接入路径 | 说明 |
|------|----------|------|
| arXiv ID / arXiv URL / AlphaXiv URL | 优先 AlphaXiv metadata 与 overview，再回退到 arXiv PDF 解析 | 对 preprint 来说通常是最佳路径 |
| DOI 字符串或 `doi.org/...` URL | Crossref metadata 查询 | metadata 往往较丰富，但正文常常不足 |
| 本地 PDF | 本地文本抽取 | 依赖本地 PyMuPDF 兼容提取能力 |
| 本地 `.txt`、`.md`、`.org` | 直接解析本地文本 | 适合学位论文、草稿、已清洗文本 |
| 远程 PDF URL | 下载后解析 | 适合已经拿到直链 PDF 的情况 |
| 暴露 PDF 的论文落地页 URL | 先从页面解析 PDF，再进行正文解析 | 如果页面没有暴露 PDF，会返回 `unresolved` |
| 已有的 `paper-record` JSON | 直接复用 | 已完成归一化时是最快路径 |
| 已有的 workbench artifact JSON | 直接复用 profile、deep-read、synthesis 或 review 状态 | 适合持续性的文献工作流 |

## 模式

| 模式 | 输出 | 适合场景 |
|------|------|----------|
| `scan` | 快速预判，包含文章类别、学术意图、核心主张、相关度、阅读建议 | “这篇值不值得细读？” |
| `deep-read` | 完整论文解构加战略关联 | 面向自己研究问题的单篇精读 |
| `card` | 文献卡片加短批判摘要 | 后续写综述时可直接复用的笔记 |
| `synthesis` | 概念图谱、争论光谱、方法矩阵、空白地图、关系网 | 3 篇及以上文献整合 |
| `review` | 叙事策略、结构化大纲、PEEL 段落支持 | 综述规划与写作 |
| `json` | 原样返回规范化 `paper-record` | 复用、检查、作为后续输入 |
| `interpret` | 基于规范化事实的讲解 | 轻量理解、带读、讲解 |
| `xray` | 基于规范化事实的紧凑批判 | reviewer-style 的假设、增量与边界分析 |

## 默认行为

- 单篇论文、用户是人类阅读诉求、未指定模式：默认 `scan`
- 用户明显要机器可读结果、保存结果或检查 schema：默认 `json`
- 用户给出 3 篇及以上论文并要求比较或整合：默认 `synthesis`

## 关键参数

| 参数 | 作用 |
|------|------|
| `--mode scan|deep-read|card|synthesis|review|json|interpret|xray` | 选择输出形态 |
| `--profile PATH` | 复用已保存的 `researcher-profile` JSON |
| `--workspace PATH` | 将可复用 artifact 保存到 workspace |
| `--save PATH` | 保存规范化 `paper-record` JSON 产物 |
| `--lang LANG` | 获取 AlphaXiv overview 时使用的语言；默认 `en` |
| `--fulltext auto|prefer|never` | 控制是否把抽取到的全文放进规范化记录 |

### `--fulltext` 的实际行为

- `auto`：当文本较短，或记录缺少可用 summary 时，倾向于带上全文
- `prefer`：只要存在可行来源，就更积极地尝试带上全文
- `never`：保持记录以 metadata 和摘要为主

`prefer` 不是保证项。对于 DOI 输入，如果没有可用全文来源，结果仍可能只是 metadata。

## `paper-record` 中保留什么

`paper-record` 继续只承担规范化层角色。核心部分包括：

- `source`：用户给了什么输入，最后解析到了什么 canonical 或 resolved URL
- `document`：文档类型信号，例如 `preprint`、`conference-paper`、`journal-article`、`thesis`
- `bibliography`：标题、作者、年份、venue、DOI、摘要、关键词
- `content`：summary、problem、method、results、sections、页级锚点，以及可选全文
- `arxiv_enhancement`：可用时来自 AlphaXiv 的 arXiv 增强信息、key insights 与 citations
- `provenance`：metadata 来源、content 来源、warnings 和 confidence

### `content.page_chunks`

`page_chunks` 提供页级锚点，方便后续模式做更稳妥的定位。它适合标到正确页附近，但还不是段落级精确引用能力。如果请求中的页码或引文无法被现有锚点支撑，下游模式应该输出 `[信息待核实]`，而不是编造证据。

## 持久化工作流

当用户希望跨论文或跨会话持续复用时，使用 `researcher-profile` 和 workspace artifact。

推荐目录：

```text
workspace/
├── researcher_profile.json
├── paper_deep_read/
├── literature_synthesis/
└── review_outline/
```

`paper-workbench` 通过 `scripts/workbench_io.py` 完成 profile 初始化和 artifact 保存。

## 状态与保真度

| 状态 | 含义 |
|------|------|
| `resolved` | 已有足够结构化事实，可继续做后续分析 |
| `partial` | 已有部分可用 metadata，但关键内容字段仍缺失 |
| `unresolved` | 该来源无法转换成可用的规范化记录 |

在信任 deep-read、synthesis 或 review 结果前，先看 `status`、`provenance.confidence`、`provenance.warnings` 和 `errors`。

## 当前限制

- DOI 接入目前仍依赖 Crossref metadata，通常不保证全文
- 通用论文落地页必须暴露 PDF 链接或 PDF meta tag 才能继续解析
- 本地 PDF 提取需要 `pymupdf` 或 `fitz`
- 页级锚点目前是 page-level，不是 paragraph-level
- 自由粘贴的论文原文目前不是 `normalize_paper.py` 的输入路径；请改用本地文本文件或已有的规范化记录

## 当前已有测试覆盖

内置测试目前覆盖了：

- 本地 PDF 归一化
- 本地硕士论文与博士论文文本 fixture
- 已归一化 JSON 的 passthrough
- 基于 mocked Crossref metadata 的 DOI 接入
- 基于 mocked AlphaXiv metadata 的 arXiv 接入
- 落地页未暴露 PDF 时的失败路径
- `researcher-profile` 创建
- `paper-deep-read` 的 artifact 保存流程

## 主要支撑资源

- `scripts/normalize_paper.py`：来源识别与 `paper-record` 生成入口
- `scripts/xray_io.py`：本地 PDF / 文本提取辅助
- `scripts/workbench_io.py`：profile 与 artifact 持久化辅助
- `references/schema.md`：规范化 schema
- `references/artifacts.md`：上层 workbench artifact 合约
- `references/routing.md`：来源分类与模式路由
- `references/modes/*.md`：各模式的下游交接规则

## 相关文档

- [论文工作流](/zh/guide/paper-workflows)
- [技能概览](/zh/skills/)
