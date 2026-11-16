# 优化并更名 agents-md-improver 为 codex-context-improver

## Goal

依据 GPT-6 Astra 官方指南和用户指定的 pvncher 文章，将现有技能升级为精简、有来源、有权限边界的 Codex 上下文审计与改进技能，覆盖项目指导和任务相关技能指令；使用 qiaomu-meta-skill 完成可复用包设计与验收。

## Background

- 用户指定新名称 `codex-context-improver`、两份来源和创建 Trellis 任务。按项目流程，展示最终方案并获得后续实施确认后才进入 `in_progress`。
- 改造前包为 `skills/developer-tools-integrations/agents-md-improver`，版本 1.2.0、owner `lyh`、Production。已有发现链、参考模板、接口、manifest、输出样例与 Node 合约测试。
- 2026-09-10 基线：目标包 Node 合约 7/7 通过；qiaomu 校验缺 README、Skill IR、触发报告、研究报告与交付说明。
- 起始树有 26 项既有删除，属于 `codex-workflow-recommender` 和 `web-research`。不恢复或归入本任务成果。
- 来源证据见 `research/source-guidance.md`，仓库与更名影响见 `research/repository-analysis.md`，参考技能研究见 `research/prior-art-research.md`。

## Requirements

- R1：正式更名为 `codex-context-improver`，统一目录、入口、接口、manifest、当前评测与有效引用；不增加旧名兼容入口。保留 owner 和许可证归属。
- R2：保留 AGENTS 有效发现链与 code_map 独立决策，新增对目标启动上下文中指导文件、技能元数据、已选技能正文及已读取参考的冲突、重复、过宽触发与不适当流程审计。区分可发现、选择/读取证据及生效推断。
- R3：落实按需阅读、短触发、清晰完成条件、授权内持续完成、暂停来源、适量委派、必要验证与简洁输出；不得将模型建议转成强制流程或权限豁免。
- R4：审计/解释/规划只读；明确范围内修改请求可执行该范围必要修改与检查，规划批准本身不自动授权实施。全局、外部、生产、付费及破坏性行为遵循真实授权。本次仅修改目标包及更名必需引用，不改全局或其他技能行为。
- R5：按 qiaomu Production 补齐有用的 Skill IR、触发证据、研究与交付说明；依仓库约定以生成的双语技能页承担 README 导航，记录缺独立 README 的工具 schema 差异，不为校验添文件。保留单个 discoverable root 和精简入口，更新或撤销失效质量声明。
- R6：用原有发现/导航边界回归、新增上下文冲突/授权/触发样例、包校验与仓库 CI 验证；区分静态合约、启发式 trigger smoke、实际输出、模型实跑、安装与人工证据。
- R7：同步公共目录与必要邻接路由引用，保护既有删除和其他并发工作；报告无法独立归因的既有失败，不扩展修复。

## Acceptance Criteria

- [x] AC1（R1）：仅有新包入口；目录、SKILL、interface 默认提示、manifest、Skill IR、当前 eval/report 名称一致；现用跨包路由/文档不指向旧入口；历史任务与来源归属可标明历史用途后保留旧名。
- [x] AC2（R2）：样例覆盖 override/empty/fallback/字节预算与未知配置，以及技能已发现但未选用、用户提供任务提示、加载技能冲突、同名/禁用或链接技能证据不足；不把文件存在等同加载。AGENTS 与 code_map 分别判断。
- [x] AC3（R3、R4）：输出样例覆盖只读、明确修改、仅规划批准、已授予修改权限、必要外部审批、无条件全仓阅读、反复扩大测试和子代理不可用；判断符合请求；暂停有具体文件/规则，重复确认有可审阅改法。
- [x] AC4（R5）：仓库元数据校验通过，所选 Production 证据齐全；qiaomu 包校验仅允许已登记的 `missing required file: README.md` 失败，并如实报告工具未通过；SKILL+interface 保持已有约 1000-token 合约，根入口按需路由，旧报告不冒充新版成功证据。
- [x] AC5（R5、R6）：触发样例有正例、负例与近邻，执行生成的 trigger smoke 报告注明启发式局限；输出场景有断言与逐例审核记录。未实跑的 provider、人审、安装或效果比较标记 `missing evidence`。
- [x] AC6（R6、R7）：目标 Node 合约、元数据/链接通过，qiaomu 校验符合 AC4；完成 docs 生成与 `just ci`。若有既有失败或依赖/安装证据不足，保留失败与归因，明确完整实现验收尚未通过，不以目标测试代替 CI。
- [x] AC7（R7）：起始删除与无关改动保留；目录中既有删除派生变化与更名变化分别说明；无用户全局修改、发布、push、未经请求的依赖增加或其他技能行为重构。

## Out of Scope

API/模型配置迁移、自动扫描全部用户历史、全局技能治理、通用插件/MCP/工作流推荐、自动删除或禁用技能、Claude 兄弟技能行为升级、运行时规则引擎、付费模型基准、发布/PR/提交/归档。

## Deferred Evidence

X 正文经转接 API 读取，直接页面与配图文字未核验；目录检索失败如有则记录。新包真实宿主发现、付费 provider 对照与人工使用结果未执行前均为 `missing evidence`，本地实现验收不包含这些外部结果。

## Implementation Result — 2026-09-10

用户明确要求“开始实施”后已启动并完成批准范围的实现与检查；新包为 2.0.0。验收证据见 [独立检查记录](research/check-validation.md)。七项 AC 按已批准的本地范围验收，不代表所有模拟分支或真实宿主已执行。

目标 Node 7/7、trigger smoke 22/22、隔离本地安装及完整 `just ci` 通过（Node 412 通过、4 跳过）。18 个输出场景均有独立响应和逐项审核；部分操作因模拟输入限制仍为 PARTIAL/NOT EXERCISED。qiaomu 校验仍以 exit 1 报告唯一已批准 README 缺失，不能称为全绿。实际宿主加载、provider 对照、人工使用和效果收益仍缺证据。

既有 26 项源删除和无关锁文件已保留。未提交、归档或发布；任务保留 `in_progress`，后续 Git 与归档收尾需单独授权。

## Authorized Closeout — 2026-09-10

用户后续明确要求“提交所有改动和归档任务”，并授权清理其删除弃用技能后导致 CI 报错的残留。本轮授权覆盖全部非忽略工作树改动（包括既有技能删除和 `skills-lock.json`）、现用失效技能引用、必要生成文档同步、CI、当前任务归档与会话记录；不包含推送或发布。此授权取代上方实现阶段尚未授权提交/归档的状态说明。

清理限定于实际弃用入口及其现用路由；历史来源、存档和仍有效的内部 reference 不做机械替换。清理诊断与最新检查见 `research/retired-skills-cleanup.md`。技能包内首轮评测与交付报告保持其原有实跑范围，不将本次 Git 收尾推断为模型或宿主验收。
