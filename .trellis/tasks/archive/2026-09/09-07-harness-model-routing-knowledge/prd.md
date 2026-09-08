# 固化强模型审查与低成本执行分工

## Goal

将批准并验证的改造经验固化到项目 spec，明确适用工具，让后续任务按风险分工并保留可靠验收证据。

## Requirements

- R1：五套 harness 均说明适合承担的规划/审查角色，模型能力与宿主权限分别判断。
- R2：低成本执行限定到已冻结输入、独占文件与确定性检查；失败或新权限问题由强模型重新判断。
- R3：每项批准改造回写项目说明或 spec，记录适用工具、原始证据与验收；不将未批准建议沉淀成既定政策。
- R4：完成同时要求交付物、行为验证、必过检查、范围核对；未证实的客户端行为不得用测试 fixture 替代；正式错误处理规范区分通用 CLI 退出码与宿主 hook 协议。

## Acceptance Criteria

- [x] AC1（R1、R2）：`.trellis/spec/guides/harness-execution-routing.md` 覆盖 Claude Code、Codex、Grok Build、Kimi Code CLI、OMP；强模型职责、便宜模型子项、退回条件；无性能/价格排名。
- [x] AC2（R3、R4）：`research/acceptance-ledger.md` 映射 F1–F6 与每条 PRD AC；error-handling 区分通用 CLI 1 与 PreToolUse 2，UserPromptSubmit 日志失败为 1；跨工具事实链接 `docs/harnesses.md`。
- [x] AC3（R4）：PASS / SKIP / MISSING DEPENDENCY / UNVERIFIED 分行。`git diff --check` EXIT 0。父项 `just ci`、客户端启动、新 SHA hosted 仍 UNVERIFIED。

## Dependencies and scope

依赖其他三个子任务交付后完成事实回写；分工草稿可预先准备。只编辑本仓库项目 spec 与任务验收记录，不改用户全局 AGENTS、团队 Basic Memory 或模型配置，不建立新 skill/路由引擎，不强制五套工具全部调度。
