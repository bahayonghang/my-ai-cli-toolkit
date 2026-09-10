---
name: herdr-orchestra
description: "Use when the user explicitly asks to coordinate worker agents in Herdr, delegate tasks across Herdr panes, or collect and compare their results; 支持 Herdr 多 Agent 编排、分工、交叉核验和结果收集。Do not use for ordinary local subagents, simple pane inspection, documentation research, work outside Herdr, or when already assigned as a leaf worker."
category: developer-tools-integrations
tags: [herdr, orchestration, agents, delegation]
version: 0.2.0
---

# Herdr Orchestra

在 Herdr 中把明确任务交给 worker，并向调用者交付可核验的结果。默认一项任务、一个 worker；调用者负责权限、分工和最终验收。

## Router Rules

- 只接管显式 Herdr 编排请求，或已获授权的上层 skill 委派。普通 review 走既有审查流程，简单 pane 查询走官方 `herdr` 指引或 CLI help；研究 Herdr 文档不启动进程。
- 已被分配为 leaf 的 worker 直接做本职工作，不再次调用此入口。新进程不会自动继承调用者加载的技能：把必要约束放进任务文本。
- 非 Herdr 环境停止本 skill 的会话操作，并说明限制；缺少能力时不偷偷改用其他传输。

## Compact Workflow

1. 阅读 [委派契约](references/delegation.md)，取得目标、cwd、kind/native argv、输入范围、权限/文件 ownership、输出和验收条件。未指定模型就沿用用户配置。未授权的范围变化才需要补问。
2. 在任何 Herdr 会话控制前检查 `HERDR_ENV=1`。使用当前 CLI help 确认语法，通过 caller context 取调用 pane；不以 focused pane 代替调用者。
3. 按契约在创建 sibling 与 `agent start` 前选择 surface：用户明确要求交互 TUI/Agent 则 agent；否则 kind 原生非交互命令能满足验收则 pane；其余 agent。默认在调用 tab/cwd 创建一个 sibling，按布局选 right/down，保持 `--no-focus`。解析返回 ID，确认 shell 可用。
4. pane surface：`pane run` 与非碰撞 wait，完成证据是命令退出后的输出，不是 agent idle/done。agent surface：`agent start` 指定 kind，确认 ready identity 后向任务自有且 idle 的 worker 发送一次完整 assignment，使用 `agent prompt --wait` 和有限 timeout。start 或 identity 失败时按契约检查同一 pane 并 incomplete；不重复提交或自动替换。blocked、unknown、旧输出都不能证明完成。
5. 按契约收集完整响应，区分 passive read 与可能滚屏的 history read。只读 worker 的截断响应以小段重述恢复；文件 fallback 需要已有写权限。核验实际 scope、证据和缺失项。
6. 交付下列 receipt，保留 worker pane。需要进一步独立分工或异常恢复时阅读 [模式与恢复](references/patterns-and-recovery.md)。提交、发布、修复、trust、更改集成或扩大清理均不因编排而获得授权。

## Output Contract

- 返回解析得到的 worker name/kind/pane identity，以及本任务创建的资源和保留状态。
- 分开记录已观察的 lifecycle、实际任务/输入范围、收到的响应、覆盖与完整性、错误或待决事项。终端 idle/done 和任务成功是两个判断。
- 调用者对照输入核验结果；不以多 Agent 一致意见代替证据。响应仍缺失时明确 incomplete，不把它压缩成“无问题”。

## Evidence

来源与设计取舍见 [调研记录](reports/prior-art-research.md)，当前评估和限制见 [交付记录](reports/creation-handoff.md)。本包提供指令契约，不声称本地检查证明真实 server、模型执行或新会话加载。
