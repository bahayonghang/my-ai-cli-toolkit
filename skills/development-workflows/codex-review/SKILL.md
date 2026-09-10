---
name: codex-review
description: >-
  Use when the user asks an Agent inside Herdr to start Codex for an independent review through herdr-orchestra, or invokes codex-review with established Herdr task context; 支持在 Herdr 中让 Codex 审查改动、提交、文件或计划。Do not use for generic review, direct non-Herdr Codex collaboration, automatic fixes or CHANGELOG generation, research-only discussion, or when already assigned as the leaf reviewer.
category: development-workflows
tags: [codex, herdr, review, read-only, delegation]
version: 0.1.0
---

# Codex Review

在 Herdr 中发起一个独立、只读的 Codex reviewer，由调用者核验可定位的审查结论。

## Router Rules

- 仅在明确要求 Herdr + Codex 审查，或本技能调用已有该任务上下文时使用。普通正确性审查交给现有 review 流程；可维护性问题沿用 `code-quality-review`；非 Herdr 的 Codex 协作不要走本技能。
- 若已被分配为 leaf reviewer，直接完成审查，不调用本技能、orchestra 或更多 Agent。讨论/研究这些技能不授权启动进程。
- 通过已加载的 `herdr-orchestra` 名称/实际路径读取其 `references/delegation.md`；它是唯一进程控制 owner。本包不分配 pane、不重复环境探测、不直接启动 Codex。缺少依赖时报告源路径 `skills/developer-tools-integrations/herdr-orchestra/` 与未完成项，不绕过 Herdr。
- 核对当前加载的本包身份；同名第三方入口不等于此源。若仍加载含自动 CHANGELOG 的旧入口，报告不匹配，不修改安装、全局配置或 hooks。宿主加载边界见仓库 `docs/harnesses.md`。

## Compact Workflow

1. 按 [审查契约](references/review-contract.md) 明确 cwd、用户标准与一个审查范围，捕获 HEAD/ref、diff 和相关输入内容。当前全部改动默认含 staged、unstaged、untracked；用户指定 staged-only 时保留该边界。
2. 准备六字段文本 handoff 与完整 leaf prompt。以 [Codex CLI 边界](references/codex-cli.md) 的交互 root 参数 `--sandbox read-only --ask-for-approval never --no-alt-screen` 请求一个新 `kind=codex` worker；实际执行时核验当前 help。用户指定模型则保留，否则继承配置。
3. 交给 orchestra 一次派发与收集。prompt 是任务文本，不是 shell 命令或 `/review` UI 操作；启动失败不得切换到 `exec review` 或另一 reviewer。
4. 对 receipt 核对身份、目标、生命周期与完整响应。截断时仅由 orchestra 向同一 ready worker 请求缺失的小段；只读 reviewer 不写 temp file、不扩大 sandbox。恢复未完成就保持 incomplete。
5. 接受前复核输入与 finding anchors。目标变化则标记 scope drift；完整且范围一致才核验结论。输出已接受发现、被排除的重要误报与不确定性，不自动修复或递归复审。

## Output Contract

- 返回实际 reviewed cwd/scope/input identity、worker identity/lifecycle、响应覆盖与完整性，以及调用者的范围复核结果。
- 发现按优先级列出路径/行、触发场景、影响、证据和验证缺口。证据不足归入 uncertainty；无可行动发现必须有完整审查依据。
- 将通过、失败、未运行检查与 missing evidence 分开。blocked、timeout、unknown、空响应、缺段和 scope drift 不得写成通过；遗留 worker 资源状态来自 orchestra receipt。
- 仅在调用者已有产物写权限内保存已捕获文本；不把审查授权扩展为修复、CHANGELOG、Git 写操作、安装、trust/config/hooks 变更或资源清理。

包内资源以本技能加载时公布的实际目录解析；`<skill-dir>` 表示该目录，不假定安装目录之间的相对位置。行为 fixtures 见 [evals](evals/evals.json)，独立词法输入见 [trigger cases](evals/trigger_cases.json)。[创建交接](reports/creation-handoff.md) 汇总来源、实际检查和未验证边界；这些材料不证明新会话已加载本包。
