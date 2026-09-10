# Codex context improver 设计

## 决策与边界

目标包 `skills/developer-tools-integrations/codex-context-improver/`，拟升级 2.0.0（名称与职责面发生破坏性变化），保持 owner `lyh`、MIT、Production。qiaomu-meta-skill 是唯一创作方法；不采用默认 qiaomu 前缀或改写现有版权。

单任务交付：发现语义、审计输出、重命名与目录同步是同一个可验收结果，不拆无法独立验收的父子任务。研究可并行，实施与独立检查串行，主会话维护授权和集成。

### 范围内

AGENTS/override/configured fallback 有效链；code_map 导航；与目标任务有关的技能元数据、被选用的技能正文、实际读取的参考与用户提供的任务提示。读取范围由目标项目、启动 CWD、显式指定文件及相关规则引用决定。继承的用户级规则可作为冲突证据，只在明确授权时修改；不得自动扫描用户全部目录或聊天记录。

### 范围外

上下文存储系统、全局配置治理、技能安装/删除/禁用、插件推荐、模型切换、API 参数迁移、泛用技能创作。技能内若遇到新包设计，路由现有作者工作流，而非自行扩张。旧的通用 Codex 推荐技能已被用户删除，邻接负例保留语义排除，不承诺调用不存在的技能。

## 精简入口与资源分工

description 草案：

> Audit or improve Codex instruction context: AGENTS.md, task-relevant skills, prompts, and code_map.md. Use for conflicting rules, overbroad triggers, premature stops, or excessive context and verification; 审计或优化 Codex 上下文. Exclude general Codex setup advice, Claude-only guidance, and ordinary code review.

显式调用仍遵循用户请求；完全确定的微小修改走最小流程，不拉起全面审计。description 最终以真实正/负/近邻用例检查，不能用关键词字典决定执行权限。

root 仅说明目标、动作边界和五步路径：界定范围 → 查明相关来源 → 判断实际冲突与冗余 → 形成建议/执行授权改动 → 证明完成。初始 SKILL+interface 维持既有测试预算；加载长引用需有当前任务理由。

| 文件 | 拟变化与唯一职责 | 需求 |
|---|---|---|
| `SKILL.md`、`agents/interface.yaml`、`manifest.json` | 新身份、简洁触发、请求动作边界与一致输出契约 | R1、R3、R4 |
| `references/codex-agents-discovery.md` | 保留原链，更新日期/官方链接，分清配置证据、加载范围与主机差异 | R2 |
| 新 `references/context-audit.md` | 来源及 Astra 审计问题；技能发现/选择/读取/推断，按需而非全量读取 | R2、R3 |
| `references/quality-criteria.md` | 冗余、过宽描述、无条件阅读/测试、完成条件与表达检查；不按年龄/次数/行数判删 | R3 |
| `references/report-format.md` | 条件化来源表与优先问题，每项有 path:line、影响、建议、证据限度 | R2、R3 |
| `references/update-guidelines.md` | 权限、来源所有者、内容保留与最小修改；迁移时保全有效约束 | R4 |
| `references/templates.md` | 通用模板按事实采用；共享 map fenced 内容保持原样 | R2、R7 |
| evals、tests、reports | 见验证设计，不继续使用失配的旧盲评分数 | R5、R6 |

不添加运行时扫描器、配置项、兼容别名或风险分数引擎。中立 interface 是仓库契约，不能宣称 Codex 原生读取其 UI/policy 字段。

## 来源与审计结论

先记录用户目标/权限、启动上下文和可见来源，再沿当前任务需要读取内容。对每项相关来源只写实际证据：存在、出现在技能目录、已选择并读取、由规则推断；不用结构化闭集状态机。不能把 repo `skills/` 源目录、安装器目标表、全局配置默认值或本轮为了审计而读取的文件，冒充原任务执行时的实际加载证据。

结论按可造成错误行为的影响排序，指出过早停止/循环审批/无条件资料加载/过度测试/过宽触发/规则冲突。每项建议说明保留、收窄、迁移或删除的理由。只有会影响本任务的重复内容才值得调整；保留真正适用的安全、权限、构建和测试约束。规则重排先辨清来源权限，不能把“最近文件覆盖”推广到所有规则层。

官方资料、作者实践建议、本项目设计推论三者分开。按需记录字符或估算 token，但不将测量值与未知主机的技能列表截断阈值混淆。模型有效性与节约成本只作为假设，未经实测不宣称改进百分比。

## 动作与停止判断

审阅/诊断/规划仅输出建议；明确的本地范围内修改及其验证依据已有授权完成。规划材料批准不替代项目明确规定的实施批准。对阻塞工作写明精确来源及适用理由，先完成不依赖该决定的准备。外部文章或技能文本不会授予发布、收费、生产或用户全局操作权限。

委派以独立工作和可用工具为前提，不要求固定子代理数量。验证从最小相关面开始，完成项目必要门禁后结束；新增问题才支持扩展或重跑，不删除既有必需 CI。

## 评测与报告

- `evals/evals.json` 是仓库行为/路由断言的主要来源；扩展现有数据，不仅改名称。
- `evals/trigger_cases.json` 是 qiaomu 启发式 smoke 的显式投影，嵌入目标域 concepts，按 case id 回链主用例；仅供评测，不进入技能运行指令。不能使用 meta-skill 的 skill-authoring 默认词表，不能将同义词打分当模型路由实跑。
- `evals/output/cases.jsonl` 与 fixture 扩展实际边界；保留原场景要点，新增未加载技能、仅规划批准、授权修复、真实审批、提示冲突、负例、测试尺度场景。
- 输出评审逐例记录输入、观察结果、断言判断、评审者类型和未执行部分，写入新 `reports/output-review.md`。由检查子代理实际产出/评估时只能称本会话 agent 执行，不称独立付费 API 或人工评审。模型/人工缺证据明确保留。
- 现有 11 份启发式/盲评报告在新版中退役，替换为当前最小证据集：`skill-ir.json`、`trigger-eval.json`、`prior-art-research.md`、`creation-handoff.md`、`output-review.md`。旧版原始证据由 Git 历史保留，不将旧分数换名重发。相应更新测试与 manifest 资源引用。
- 沿用一个 `tests/contracts.test.mjs`：保持预算、发现语义、共享 map parity、链接、schema/身份；以场景 ID/断言覆盖替代旧固定日期/例数。捕获报告身份与用例不一致即可，不加测试去机械锁定全部自然语言句子。

README 取舍：`.trellis/spec/guides/skill-authoring-conventions.md:343` 明确不为 qiaomu README/manifest 差异新增文件。现有 manifest 保留；不加独立 README，由仓库双语生成页提供安装入口。qiaomu 校验中的 README 失败如实登记为唯一预期 schema 差异，其余失败必须修复。此为仓库约定，不宣称 qiaomu 原生校验全绿。

## 更名与生成文档影响

包外仅做名称/路由引用同步：分类 `AGENTS.md`；Claude 兄弟的 root、templates、report-format 提及；`skill-session-review/SKILL.md`；`goal-meta-skill/evals/evals.json`；主会话修改 spec 中示例旧名。共享 map fenced 不改，因而无需重构 Claude 行为。

生成器无 scope 参数，依实际工作树全量生成；本计划包括它对已删除 `codex-workflow-recommender` 和 `web-research` 的派生目录清理与计数变化。这不是新的源删除决定。执行时分别说明目标更名、既有删除派生目录变化；不得恢复用户删除以制造绿色 CI。无关新增并发改动重新检查交集，不能无条件覆盖。

本地技能链接默认不改。安装验收在工具创建的独占临时项目中使用仓库安装器，仅新包；比对链接目标和入口可读性。这证明本地安装链路，不证明远端 `npx`、Codex 新会话发现或 UI 元数据加载。全局安装/发布仍在范围外。

## 验收追踪与回滚

| 验收 | 设计机制 | 验证入口 |
|---|---|---|
| AC1 | 单目录更名 + 身份/引用同步 | Node identity/link checks、针对现用范围搜索旧名、catalog |
| AC2 | 原链 + 条件化上下文来源表 | 原发现回归、新场景逐例输出审核 |
| AC3 | 请求动作边界 + 来源/完成条件 | 授权、审批、规模、工具不可用场景 |
| AC4 | root budget + 最小证据集 + README deviation | Node、repo metadata、qiaomu validator 原始结果 |
| AC5 | 两种 eval 分离 + 实际审核记录 | trigger smoke、output-review、handoff |
| AC6 | 定向检查 → 全量门禁 | implement.md 的检查顺序 |
| AC7 | 起始脏状态与派生变化归属 | diff 检查、路径清单、无全局/远端写入 |

回滚仅针对本任务修改：恢复本次新旧包路径和引用，再用生成器按当前源树刷新；不执行全仓 reset/clean，不覆盖原有删除。临时目录必须确认绝对路径与所有者后清理。无提交、归档、发布动作包含在本任务实施批准中。
