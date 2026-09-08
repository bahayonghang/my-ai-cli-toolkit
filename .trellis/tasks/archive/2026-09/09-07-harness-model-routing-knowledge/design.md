# Design

## Ownership and knowledge destination

新增 `.trellis/spec/guides/harness-execution-routing.md`（英文 spec，与项目语言规范一致）。
编辑 `.trellis/spec/guides/index.md`、`.trellis/spec/backend/quality-guidelines.md`、`.trellis/spec/backend/error-handling.md`、`.trellis/spec/guides/skill-authoring-conventions.md`。
更新父任务 `research/acceptance-ledger.md` 记录已批准项的最终证据；正式事实表和 public docs 由说明子任务独占。

## Mechanism

R1/R2：写小型任务分工表，不新增模型 registry 或硬编码可用性检查器。Claude Code 优先本机 hook/import 审查，Codex 优先跨文件根因与确定性测试、原生 subagents 独立验收；Grok Build 审阅其原生规则/plan/goal 接缝；Kimi Code 执行绑定其实际产品版本的窄任务并核 subagent 语义；OMP 审阅扩展/task 子代理与权限边界。它们均可使用强模型承担规划，适配判断不构成品牌能力排名。

便宜模型只处理确认过的文本/字段调整、fixture 和小范围实现；文档生成、lint、tests 直接由命令执行。冻结内容之外的要求、权限变化、失败根因不明确时退回主会话强模型。可以参考当前 Codex 中 terra/luna 等可用低成本角色，但不修改源模板钉死型号，调度时核当次可用性与用户模型偏好。

R3：唯一验收 ledger 用发现编号、批准状态、文件、检查、结果、适用工具、知识落点七列。任务报告记录历史过程，spec 仅保存已验证的稳定契约。已存在的 goal-meta 平台 facts 和 codex-bridge 模型路由继续各自负责其领域，若本轮未发现需修复的已证实缺陷则不编辑这些 skills。

R4：backend quality 写入“编译不等于事件协议测试”；authoring conventions 写入“路径链接不等于宿主发现、fixture 不等于 provider 行为”。error-handling 将普通 CLI 默认 exit 1 与宿主约定分开：Claude PreToolUse 拒绝/无效事件按 C1 返回 2，日志失败返回非阻断 1；改掉第 41 行的旧阻断例和第 29 行不允许宿主专用码的限制。不得将 Claude 的返回码复制为所有工具统一规则。所有五工具通用事实引用 docs/harnesses，避免复制第二份能力表。

## Traceability and rollback

R1/R2→分工与退回条件→AC1；R3→ledger及工具限定知识→AC2；R4→分层证据规则→AC3。
只回退本项 spec/记录；不迁移 Basic Memory，不更改既有 task 生命周期或 runtime。
