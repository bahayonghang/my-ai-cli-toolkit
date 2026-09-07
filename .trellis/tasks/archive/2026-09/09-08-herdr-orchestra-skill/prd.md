# Herdr Orchestra 编排 skill

## Goal

创建 `skills/developer-tools-integrations/herdr-orchestra/`，让 Herdr 内的调用 Agent 以当前 CLI 协调有明确范围的 worker 并收集可验证结果。对应父任务 `09-08-herdr-review-skills` 的编排、路由、证据与简洁性要求，编号映射以父任务 Task map 为准。

## Confirmed facts

- 参考包的历史补丁、caller/focused 混淆、自动 trust 与假完成问题已有逐项证据，见父任务 `research/herdr-audit.md`。
- 官方 Herdr 自有 layout/pane/agent 区分，无需再写进程控制器；本机 help 不等于 server/实际运行证明。
- `docs/harnesses.md` 区分源码、安装器目标和实际 discovery，host-neutral 入口不意味着五种客户端均已验证。

## Requirements

- R1：显式 Herdr 编排才触发；非 Herdr 环境在任何会话控制前停止，普通本地 subagent 与简单 pane 检查不被接管。
- R2：取得 caller、cwd、任务目标、kind、权限/文件 ownership 和验收输出；布局默认同 tab 的 sibling，使用返回 ID 与 no-focus，启动前确认 shell 可用。
- R3：Agent 启动/提示/等待使用原生 agent surface；ordinary process 使用 pane surface。blocked、unknown、stalled、timeout、替换进程和旧输出不得当作当前任务完成。
- R4：把完整结果和生命周期分别交付；避免未经授权的历史滚屏；文件 fallback 需要 worker 已有写权限。保留用户资源，禁止自动 trust、kill server 或扩展清理。
- R5：以一处轻量 delegation reference 提供 `codex-review` 所需的 native argv、scope、leaf role 和响应完整性约束。支持一项任务的默认单 worker，以及已有授权下的独立并行/顺序分工。
- R6：提供仓库格式入口、neutral interface、行为/触发评估及来源/IR/handoff；不增加控制脚本、依赖、旧 CLI fallback、模型表或 runtime 安装修改。

## Acceptance Criteria

- [x] AC1（R1、R6）：唯一根入口、合法类别及中英 description，触发案例包含非 Herdr、普通 review、基本 pane 查询的 routing-negative；qiaomu lexical smoke 与人工语义结论分别记录。
- [x] AC2（R2、R3、R4）：行为案例覆盖 caller/focused 不同、占用 shell、返回/移动 ID、未观察活动、blocked/unknown/stalled/timeout/exit，结果包含相应停止或诊断行为而非误派发/误成功。
- [x] AC3（R2、R4、R5）：分工案例写明 exclusive ownership、cwd/no-focus、leaf 限制；截断案例区分 passive reads、禁止 UI、已有文件写权限与只读分页恢复；交付含 worker identity、实际 scope、结果及 completeness。
- [x] AC4（R5、R6）：Codex adapter 可只凭此包一处 handoff reference 指定 native args 和只读结果约束，无第二套 controller 或安装相对路径假设；资源引用、输出评估和生成 docs 检查通过。

## Out of scope and dependency

不实现 Codex 的审查内容；不改官方 Herdr skill、本地激活或安装；不创建 daemon/调度器；不引入 commit/publish 自动阶段。该子任务先于 `09-08-herdr-codex-review-skill` 的实现，向其提供已检查的 handoff reference。用户于 2026-09-08 已批准完整方案，本子任务已启动实施。
