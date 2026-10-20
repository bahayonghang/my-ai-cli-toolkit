# laoyeye 源码研究与能力映射

研究日期：2026-10-19（America/New_York）。本地 `ref/repo/laoyeye` 的 origin 为 `https://github.com/LearnPrompt/laoyeye.git`，HEAD 为 `5af2b57ceb169d81b2da90cc902556a2cad11c0a`。参考仓库只读；未执行其安装、同步、shell helper 或提示语。

## 结论与证据范围

“少装入口”与“少读正文”是两项独立优化。上游选择保留原文和可独立安装的能力，因此多入口有其产品理由；对本次要求的整体安装、统一使用场景，26 个入口确实不是必要条件。不能进一步推成“任何路由加子 skill 的设计都错了”。

已经阅读：中文 README、LICENSE、CLAUDE.md、路由及全部 25 个叶子入口，教学的四份格式文件、任务书 anatomy、对抗审查 checklist，以及文档治理的 governance / verification / sync-matrix；检查了 vendor lock、两个 shell helper 和其余资源清单。平台路径参考只作为风险与依赖线索，不采用其中未重新验证的宿主事实。

上游说明：`README.md:9`（25 件）、`:19-55`（安装和 26 目录）、`:73-88`（来源与许可）、`:163-180`（原文策略）。实物计数与内容摘要在 `source-inventory.json`。

## 25 项入口 → 24 套方法

下表路径均相对 `ref/repo/laoyeye/skills/`；每项 `SKILL.md:1` 可定位源入口。目标路径为未来包中的 `references/modes/<内部方法>.md`，不创建子 `SKILL.md`。

| # | 原入口及所在目录 | 内部方法 | 必须保留的行为与结果 | 调用 / 副作用边界 |
| --- | --- | --- | --- | --- |
| 01 | asking/socratic-inquiry | socratic | 单次一问，最多六问；第二问起说明判断更新；输出事实、假设、关键变量和重述问题，用户确认后才给建议 | 对话，不能预发问卷 |
| 02 | asking/matt-grilling | grilling | 设计树按依赖分轮，只问当前已解锁 frontier，每问附建议；事实自行查，决策交用户；共同理解前不执行 | 对话；有独立问题时可成组，不能混入尚未解锁问题 |
| 03 | asking/matt-grill-me | grilling 的显式别名 | 复用 02，保留“用户主动要求拷问”的入口身份 | `SKILL.md:7` 只有一次转调；不复制正文、不创建第二个方法 |
| 04 | asking/johari-window | johari | 按双方已知、用户独知、模型可补、共同未知选择直接答 / 追问 / 提醒 / 探索 | 显式开启的会话协作设置；可与 concise 共存，不写长期记忆 |
| 05 | asking/no-fluff-output | concise | 行动先行、短步骤、清楚的完成状态；用户关闭后恢复，任务需要解释时允许充分解释 | 会话设置；不推断用户有 ADHD，不索取示例 credential |
| 06 | learning/two-layer-explain | explain | 小白例子 + 专业机制、边界、误解、术语对应、三道自测 | 单次讲解 |
| 07 | learning/reverse-teardown | teardown | 有实际优秀范例；拆目标、结构、关键选择、标准，给 3–5 条可迁移规律、操作清单和练习 | 不是事故复盘；材料不可见就说明缺口 |
| 08 | learning/horizontal-vertical-analysis | research | 时间纵轴、同维横轴、三种未来路径；一手来源、日期、事实 / 推断 / 判断区分和缺口 | 联网研究；离线只给框架与待检索清单；支持原深度长报告 |
| 09 | learning/fact-check | fact-check | 拆事实 / 推论 / 价值判断；来源、样本、日期、上下文；五档标注、推理漏洞和补强结论 | 联网核查；私有材料不能冒充已外部证实 |
| 10 | learning/parable | parable | 单概念间接寓言，末段揭示，再映射和两道理解 / 迁移题；故事精炼、避开套路 | 新写方法与故事，不复制上游表达或整份黑名单 |
| 11 | learning/memory-parable | memory-story | 根据给定领域选概念、用异域故事帮助记忆、最后解释隐喻 | 不能和 10 的“理解失败后补救”混为一套无区别行为 |
| 12 | learning/eli5 | visual-explain | 大图、少字、可打开的 HTML 讲解；文本需求不用此方法 | 生成实际 artifact 时遵守用户目标路径和文件写入边界 |
| 13 | learning/matt-teach | teaching | mission、可信 resources、递增 lesson / learning-record、reference / glossary、共享 assets；检索练习、间隔和迁移；只有展示理解才记为学会 | 明确要求持续学习才进入；专用教学工作区，不静默占用软件 repo 根目录 |
| 14 | solving/expert-panel | panel | 三种互补视角，各自风险和证伪证据，相互质疑后输出共识、分歧、条件、退出条件和第一步 | 模拟分析视角，不能伪称真人专家已审阅或发起外部联系 |
| 15 | solving/first-principles | first-principles | 分事实、未经验证假设、目标、约束；重建路径，对照旧方案并给验证第一步 | 用户要重新推导时使用；不抢“攻击已有成型方案” |
| 16 | solving/cross-domain-borrow | cross-domain | 抽象底层结构，至少三个远距领域同构案例，列迁移条件 / 失效条件，推荐低成本实验 | 真实案例需证据；虚构示例必须标注 |
| 17 | solving/inversion | inversion | 5–7 个具体失败操作，按破坏力排序，翻成可检查规则，指出易漏点和立即防护 | 预防性分析，不执行破坏操作 |
| 18 | solving/carl-idea-king | adversarial | 第一性原理与对抗检查；最多三个最强攻击点及证伪实验，明确 verdict / 幸存结论 / 修改建议；证据与推断分开 | 盘问子形态只在明确要求时；Partner 专属模型 / 费用 / 频道规则不移植 |
| 19 | solving/matt-diagnosing-bugs | debugging | 脱敏、症状特定红灯、最小复现、3–5 个可证伪假设、逐变量探针、修复回归、清理临时日志；性能先测基线 | 读代码 / 跑命令 / 写测试有副作用，服从当前任务授权；没有可行自动接缝可用结构化人工复现，不伪造红灯 |
| 20 | deciding/steelman-both-sides | steelman | 两边最强论证、成立条件、收益风险、关键分歧；只问一个最可能改结论的问题，回答后才推荐 | 恰好两个选项；多项先由用户缩小，不悄悄删选项 |
| 21 | deciding/minimum-experiment | experiment | 三个假设中选关键一个；默认七天或用户指定周期，可逆、指标、继续 / 停止阈值、资源和第一步 | 设计实验本身不授权运行实验 |
| 22 | doing/kaz-leader | brief | 先查真实环境，最多五个必须用户决定的问题；执行 / 探索分型，白名单、验收、防作弊、进度与阻塞交接；输出可复制任务书 | compile → validate → present → stop；默认 4000 字符是本包交付预算，不说成所有宿主官方上限，不启动 Goal |
| 23 | doing/kaz-neat-freak | reconcile | 代码、运行态、docs、rules、获准记忆、workspace 六面状态；轻量 / 完整路径；事实对齐、残留预览和验证证据 | 当前项目范围；记忆依宿主与明确授权；审计不等于可删除 / 发布 / 跨项目编辑 |
| 24 | self-knowledge/hidden-talent | talent | 用户经历证据链、最多十个主问题逐问、能量与优势及失效环境、30 天可逆探索；支持原详细说明书 | 用户明确要求深度自我探索；不从低落语句自动展开、不伪称心理诊断 |
| 25 | self-knowledge/life-design | life-design | 六至九个主问题逐问，四个阶段，三个都值得考虑的五年版本、四维评估、原型行动；支持原长蓝图 | 用户明确要求；反向人生想象另需同意，脆弱状态跳过；三个版本不能直接二选一 |

## 依赖闭包：迁移正文还不够

- `matt-teach`：四个 `*-FORMAT.md` 合成一份按需 `references/teaching-workspace.md`，保留文件用途、编号、术语和 mission 更新规则；共享 CSS / quiz / diagrams 是教学输出，不是要求用户安装额外 skill。资源与社区是推荐，不替用户报名或发消息。
- `kaz-leader`：吸收 `references/anatomy.md` 的执行 / 探索合同；不继承 `style.md` 的调侃语料，也不继承“替用户拍板”的默认授权推论。
- `carl-idea-king`：吸收 adversarial checklist 的可证伪检查；去掉 Partner 调度、指定模型与费用结论。
- `kaz-neat-freak`：吸收事实矩阵、轻量 / 完整治理和同步范围；不搬陈旧的跨宿主路径表，不自动写 Codex 生成记忆。
- 两份 Bash helper：当前包的目标是方法整合，不增加 Bash runtime 依赖。人工复现及只读 inventory 保留为可按宿主工具执行的步骤；若未来必须新增脚本，需实际跨平台测试后再纳入。

## 有证据的迁移修正

| 问题 | 证据 | 本包的明确机制 |
| --- | --- | --- |
| 旧别名依赖另一个已安装 skill | asking/matt-grill-me/SKILL.md:7 | 内部别名指向同一份 grilling 文件 |
| 示例 credential 被提取为用户必填项 | asking/no-fluff-output/SKILL.md:117、:159-163 | 移除自动占位符索取；用负例验证“不索取 token” |
| 三选项接二选项 | self-knowledge/life-design/SKILL.md:27；laoyeye/SKILL.md:152 | 保留三个版本；用户先选关键两项，或直接设计验证；不静默裁掉一项 |
| 上游原文保真与新整合目标冲突 | laoyeye/SKILL.md:155-159；README.md:163-176 | 本包是方法整合适配，明确不承诺逐字原文 / 原效果等价 |
| 任务书写完可能被误激活 | doing/kaz-leader/SKILL.md:16-24、:31 | 根和 interface 均写“任务书是交付文本，不授权执行”；不复制未经核实的宿主限制 |

## 许可与归属处理

`LICENSE:25-37` 把仓库自有代码文档、提示语原文、vendored skill 分开。`README.md:79-88` 又列出转载与无署名状态。它们只能证明上游的声明，不能推导所有原文可由本包重新以 MIT 发布。

实施采用“保留行为合同、自主撰写表达”的方法整合路线。18 条提示语不整段复制、不作机械同义词改写、不提供原文导出；说明方法来源并链接原处。7 个收录 skill 如复用具有实质性的 MIT 内容，保留原作者完整许可通知和固定 commit；partner-skill 的具体许可正文必须从 canonical pinned 源核实，未找到就自主撰写且不声称完成该来源的再分发许可核验。`Copyright (c) 向阳乔木`、X 与 GitHub 链接只标识本包新增原创内容，不能替代上游权利人。

## 上下文与功能之间的代价

保留独立 skill 的上游更适合只安装一两条能力；新包适合用户要求的整体使用。新包单次显式叶子调用可能多读统一根入口。压缩前后的行为等价、实际宿主发现与 token 成本仍需实施阶段验证，不能以“26 → 1”替代它们。
