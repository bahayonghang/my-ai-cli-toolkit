# laoyeye 单入口整合技能

## Goal

在 `skills/research-learning-knowledge/laoyeye/` 新建一个自包含技能包，把 laoyeye 的 25 项入口功能整合为一个可发现入口。用户描述卡点或点名方法，即可完成澄清、学习、分析、决策、任务书、知识收尾或自我探索，不必另外安装 / 调用 25 个技能。

用户已审阅规划，并明确要求名称不带 qiaomu、可沿用 laoyeye，然后开始实施。本轮按 laoyeye 命名执行既定整合方案。

## Background

固定输入为 `LearnPrompt/laoyeye@5af2b57ceb169d81b2da90cc902556a2cad11c0a`。26 份入口实物对应 1 路由 + 18 提示语 + 7 收录 skill；其中 `matt-grill-me` 仅转调 `matt-grilling`（`ref/repo/laoyeye/skills/asking/matt-grill-me/SKILL.md:7`）。25 项来源、依赖、行为和迁移修正在 [source-analysis](research/source-analysis.md) 逐项编号，成为功能覆盖的权威输入。

实测全部 name+description 为 4,923 字符，排除模型禁用项后的候选值为 4,484 字符；原路由文件为 8,333 字符。详见 [context-evaluation](research/context-evaluation.md) 和原始 JSON。它们是静态字符 / bytes，不能当作实际 token、延迟或质量结论。

## Requirements

| ID | 要求 |
| --- | --- |
| R1 | 新包只有一个可递归发现的 `SKILL.md`，自包含 25 项功能入口；grill-me 与 grilling 共享方法，不依赖独立安装的兄弟 skill 或参考 checkout。 |
| R2 | 保留 source-analysis 的 01–25 行为合同、差异、支持资源、进入和停止条件。内容为有来源说明的方法适配，不承诺原文逐字复刻或相同模型效果。 |
| R3 | 降低整体安装的 metadata 和经路由单方法读取成本；普通请求不全量加载方法。分别披露整体发现、经路由、直接旧叶子和长会话的成本。 |
| R4 | 意图明确就运行命中方法；歧义只问能改变选择的问题；不适配则说明边界。保留苏格拉底、设计树 frontier 等不同节奏，禁止统一成一套问卷。 |
| R5 | 长期教学、天赋、人生设计需明确请求；会话风格可关闭。接力不隐式启动长期工作、任务书、实验、删除、外部消息或记忆写入。已有有效授权内的常规操作不重复申请。 |
| R6 | 核查 / 深研究使用可追溯证据；离线和私有材料无法外证时明示限制。专家视角不冒充真实人员，真实案例与虚构示例分开。 |
| R7 | 修正跨 skill 别名死链、no-fluff 示例 token 误索取、人生设计三个版本直接变二选一；任务书交付不激活宿主 Goal。 |
| R8 | 与现有专门技能保持边界；论文精读、润色、原生 Goal 管理、生产 UI、专业代码和 Trellis 规划审查不被宽描述自动截走。显式选择本包后，对应内部方法可独立工作。 |
| R9 | 遵守现有类别、frontmatter、interface、测试、eval schema 与 docs catalog 契约。来源、许可、取舍账本和已验证 / 缺失证据可查。 |

## Acceptance Criteria

| AC | 映射 | 可观察的通过标准 |
| --- | --- | --- |
| AC1 | R1 | 递归扫描只有根 `SKILL.md`；25 项均有资源，归一为 24 个方法；相对链接无死链。隔离副本不访问 ref / 其他已安装技能也能读取全部方法。 |
| AC2 | R2 | 01–25 每项都有来源 / 方法 / 行为 fixture 对应；教学状态、诊断复现、任务书、治理六面均保留；不能只检标题或关键词。 |
| AC3 | R3 | name+description≤650 Unicode 字符；根文件≤4,000 字符且≤9,000 UTF-8 bytes；经路由单方法同口径读取不超过旧版本；另报旧直接叶子可能更省的情况。 |
| AC4 | R4–R5 | 明确方法不强问；歧义不全跑。普通路径只需一份方法资源，额外依赖有条件；每轮至多两个主方法。长对话、设置关闭和已有授权均有正反例。 |
| AC5 | R5–R7 | 联网缺失、实验不自动执行、任务书不激活、未请求自我探索、治理不越范围 / 擅写记忆 / 擅删、示例 token、三方案衔接和别名各有禁止行为断言。 |
| AC6 | R4、R8 | trigger 至少 25 正例、12 负例、12 近邻，cases 内有领域概念表；output fixtures 至少 25 能力例 + 12 边界例。schema 和词项 smoke 通过，实际 agent traces 与 NOT_RUN 分列。 |
| AC7 | R9 | 顶层 name / description / category / tags / version 合法，interface 对齐，原许可与原创归属分清。qiaomu manifest / IR 限制明确记录，不为迎合外部 validator 增加 manifest。 |
| AC8 | R9 | 新测试被 `just python-test` 收集，含可变红的结构 / 预算 / 边界反向验证；实施后 docs-sync、针对性校验、一次完整 `just ci`。本轮规划和 repo 基线验证单列。 |

## Out of Scope

- 只实现新技能；不安装到用户环境、不执行原提示语、不修改 `ref/`。
- 不改全仓其他 skill，不重新安装用户环境，不删除旧包。
- 不构建路由框架、语义分类服务、Bash 依赖或宿主 adapter 矩阵。
- 不发消息、不自动启动 Goal、不发布 / 推送 / 创建 PR，不替用户作人生或商业决定。
- 不以 fixture、schema 或静态预算宣称模型效果、五宿主运行、真实安装发现或 token 节省已验证。

## Key Decisions

- 现有 `research-learning-knowledge` 类别；名称 `laoyeye`，初版 `0.1.0`，命名属于可调整实现选择。
- 单包渐进读取、完整功能覆盖，不把 80,771 字符拼进根文件。
- 采用 qiaomu Governed 所需的信任 / 权限 / 回滚 / 证据合同，按仓库产物规范适配，不增加发布或账号服务能力。
- 来源不明提示语自主撰写方法说明；MIT 实质复用保留原许可。细则见 [design](design.md)。

## Artifact Status

研究、规划和上下文清单已收敛。用户已明确授权实施；仅同步其指定名称及同名安装边界，不改变功能或权限。实施与验收状态由 task.json 和执行证据记录。
