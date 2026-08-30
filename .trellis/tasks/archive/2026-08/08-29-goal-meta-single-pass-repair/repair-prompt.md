# 单一修复 Prompt（已批准实施）

> 当前状态：用户已于 2026-08-30 明确批准在隔离 worktree 中实施；任务已启动为 `in_progress`。本 Prompt 只拥有当前任务实施与验证权限，不授权提交、归档、push、发布或安装。

```text
Active task: .trellis/tasks/08-29-goal-meta-single-pass-repair

目标：优化 skills/developer-tools-integrations/goal-meta-skill，使“扫描/审阅报告驱动的 Trellis 修复”由一条外部 Prompt 完成完整闭环。一次完成是一次用户启动/一条 Prompt，内部仍必须实施、独立检查、同范围返修和最终验证；不得把可在已批准范围内修复的 findings 交回用户后再生成第二条修复 Prompt。

启动门：先读取根 AGENTS.md、code_map.md、skills/developer-tools-integrations/AGENTS.md、.trellis/workflow.md、当前任务 prd.md/design.md/implement.md、implement.jsonl/check.jsonl 及其中 context。确认 `task.json` 为 `in_progress`、branch 为 `fix/gm` 且 worktree 是本任务记录的隔离路径；若不一致则报告漂移，不要重复请求已经取得的规划批准。保留并排除全部既有范围外 dirty 文件，至少包括另一任务 .trellis/tasks/08-29-consolidate-skill-review/、其 spec 改动，以及 skill-doctor/update-skill 来源树；先做完整 status 快照，不得只依赖此处列举。

前置决策：产品写入前先用仓库证据回答所有技术事实。只有某 finding 无法在已批准范围、行为合同、依赖政策和权限内确定性修复，且选择会实质改变范围、风险、成本、公开行为或授权时，才使用宿主结构化问题工具；Claude Code 使用 AskUserQuestion，其他宿主使用实际可用的等价工具。不得为普通实现细节、是否修复已批准 finding、是否运行原扫描、每批修复后的再次批准、或同范围新 finding 提问。

实施：按 implement.md 顺序工作。默认由主会话持有 ledger 和调度，不直接修改产品文件；派发 trellis-implement 独占目标包写入。只有宿主确实没有 agent 能力或用户已显式 opt out 时，才允许主会话按同一白名单 inline 实施，并保留独立 checker/复核上下文；不得因为能力降级改成向用户索取第二条 Prompt。新增显式 review-remediation profile，冻结扫描 command/identity/config/inputs/targets/baseline report/git baseline，维护稳定 finding ledger，并让 trellis-check 只返回 PASS、FINDINGS 或 BLOCKED。

闭环：checker 的同范围 actionable findings 必须在同一任务和同一 Prompt 内去重、加入原 ledger 并回灌 trellis-implement；修复后重跑聚焦检查和原参数扫描，再由 trellis-check 复核。宿主不能复用原 worker 时可在同一 Goal 内派发新 implementer，但要注入完整任务工件、scan envelope 和 ledger；不得向用户索取新修复 Prompt。最多三轮聚焦返修；同一 signature 连续两轮无进展或三轮后仍有 open actionable findings时只能 BLOCKED，报告残余 ID/证据/所需外部变化，不得标记 complete，也不得自动生成下一条 Prompt。

完成门：必须同时满足冻结范围 open actionable findings=0、原参数最终扫描成功且 envelope 未漂移、相关回归检查与 just ci 通过、diff/status 未越界。Qiaomu trigger/IR 门应通过；validate/release 只允许保留 scoped AGENTS.md 已声明的 README/manifest/第二种包内 eval schema 差异，且必须标为 missing evidence，不能伪报通过。provider-backed、人工盲评、fresh-Agent 真实接力和 telemetry 未实际取得时继续标记 missing evidence。

收尾边界：不 push、不 amend、不发布、不全局安装。实施与检查完成后先报告验证和实际 diff；提交、task.py archive 与任何远程动作仍服从用户和 Trellis 的独立授权门。不要改动或暂存范围外 dirty 文件。
```
