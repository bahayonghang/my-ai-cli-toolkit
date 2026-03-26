# interview-openspec

通过分阶段苏格拉底式访谈，创建完整的 OpenSpec artifacts。每个访谈阶段生成一个 artifact，支持增量进度和随时退出。

## 概述

`interview-openspec` 将需求挖掘与 OpenSpec artifact 工作流深度融合。通过结构化苏格拉底式提问，将粗糙的想法转化为四个可直接实施的 OpenSpec artifacts：`proposal.md`、`specs/<capability>/spec.md`、`design.md` 和 `tasks.md`。每个 artifact 在其访谈阶段完成后立即写入，可随时退出并保留有效的部分输出。

## 与同类技能的对比

| 技能 | 输出产物 | 适用场景 |
|------|---------|---------|
| `interview-plan` | 原生 Plan 模式执行计划 | 细化已有草稿/计划 |
| `interview-openspec` | OpenSpec artifacts（proposal/specs/design/tasks） | 启动新的 OpenSpec 变更 |
| `spec-interview` | 通用 `spec.md` 文件 | 独立规格说明文档 |

## 使用场景

- 启动需要厘清需求的新 OpenSpec 变更
- 将模糊的功能需求转化为结构化 OpenSpec artifacts
- 在实施前系统性收集需求
- 确保每个能力（capability）都有可测试的 WHEN/THEN 场景

## 触发方式

```
interview-openspec <变更名称或描述>
```

示例：
- `interview-openspec add-user-authentication`
- `interview-openspec "我想给 Dashboard 增加 CSV 导出功能"`

## 工作流程

### 阶段 1 → `proposal.md`

访谈 **为什么** 要做这个变更：业务目标、MVP 范围、能力识别和风险预览。运用 KISS/YAGNI 原则挑战范围假设。

### 阶段 2 → `specs/<capability>/spec.md`

访谈 **每个能力需要什么**。以 WHEN/THEN 格式收集场景：
- ADDED 需求（新行为）
- MODIFIED 需求（变更行为）
- REMOVED 需求（废弃行为）

同时涵盖 API 契约和 UI/UX 流程（如适用）。

### 阶段 3 → `design.md`

访谈 **如何实现**：技术决策、架构权衡、SOLID 原则、边缘情况与可靠性策略。

### 阶段 4 → `tasks.md`

访谈 **实施拆解**：层级化复选框任务列表，含优先级、依赖关系与验收标准。

## 访谈技术

所有问题通过 `AskUserQuestion` 提供 2-4 个可点击的收敛选项，不使用开放式文本问题。独立问题批量合并到一次调用中（最多 4 个），减少交互轮次。

```
AskUserQuestion({
  questions: [{
    question: "此次变更的主要驱动力是什么？",
    header: "动机",
    options: [
      { label: "用户需求", description: "客户呼声最高的功能请求" },
      { label: "合规要求", description: "法规或审计要求" },
      { label: "内部运营", description: "运营团队效率需求" }
    ]
  }]
})
```

## OpenSpec CLI 集成

技能调用 `openspec` CLI 确保 artifacts 符合 schema 规范：

```bash
openspec new change "<name>"                       # 创建变更目录
openspec status --change "<name>" --json           # 获取 artifact 序列
openspec instructions <artifact> --change "<name>" --json  # 获取 artifact 模板
openspec status --change "<name>"                  # 显示完成状态
```

## 访谈完成后

完成全部（或部分）阶段后：

```bash
/opsx:apply    # 从 tasks.md 开始实施
/opsx:verify   # 验证 artifacts 之间的一致性
/opsx:continue # 手动创建特定 artifact
```

## 最佳实践

- **提前提供上下文**：在访谈开始前告知现有技术栈、框架和约束，避免"真空架构"讨论
- **随时跳过**：任何阶段说"跳过"即可按默认值继续
- **安全中断**：每个 artifact 立即写入——随时停止，后续用 `/opsx:continue` 恢复
- **持续迭代**：写完 artifacts 后，可用 `/opsx:explore` 深入思考后再执行

## 示例对话片段

**阶段 1 — Proposal 访谈**

> **用户**：`interview-openspec add-csv-export`
>
> **系统**：已创建变更 `add-csv-export`。让我们先了解业务动机——

> *系统通过 `AskUserQuestion` 展示收敛选项...*
>
> **阶段 1 完成** → 写入 `openspec/changes/add-csv-export/proposal.md`

**阶段 2 — Specs 访谈**

> **系统**：现在定义 `csv-export` 能力需求，请用 WHEN/THEN 格式描述主要场景...
>
> **阶段 2 完成** → 写入 `openspec/changes/add-csv-export/specs/csv-export/spec.md`

*（依此类推，完成 design.md 和 tasks.md）*

> **完成**：所有 4 个 artifacts 创建完毕！运行 `/opsx:apply` 开始实施。
