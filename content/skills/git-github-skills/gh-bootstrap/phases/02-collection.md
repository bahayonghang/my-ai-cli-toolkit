# Phase 2: 配置收集

通过交互式问答收集用户配置偏好，提供教育性说明帮助用户理解每个组件的作用。

## ⚠️ CRITICAL: 完整信息收集

**在进入 Phase 4 执行之前，必须收集所有必要的变量！**

模板中的变量占位符不能留空，必须在本阶段全部确定：
- 项目基本信息（名称、描述、作者）
- **GitHub 信息**（用户名/组织名、仓库名）
- **组件特定变量**（根据用户选择的组件动态收集）

## Objective

- 展示 Phase 1 检测结果
- 引导用户选择配置模式
- 根据模式路由到对应子阶段
- 生成最终配置 JSON

## Prerequisites

- Phase 1 检测结果 JSON

## Sub-Phases

本阶段根据用户选择的模式，路由到不同的子阶段：

| 模式 | 子阶段 | 交互程度 | 适用场景 |
|------|--------|----------|----------|
| 🚀 快速模式 | [02.1-quick-mode.md](02.1-quick-mode.md) | 最少交互 | 新手用户、快速启动 |
| 🎯 自定义模式 | [02.2-custom-mode.md](02.2-custom-mode.md) | 详细交互 | 有经验用户、特定需求 |
| 📦 全量模式 | [02.3-full-mode.md](02.3-full-mode.md) | 确认即可 | 企业项目、完整配置 |

所有模式最终都进入 [02.9-finalize-config.md](02.9-finalize-config.md) 生成配置 JSON。

---

## Execution Steps

### Step 1: 展示检测结果

```
[ROLE] 检测结果展示专家

[TASK]
向用户展示检测结果，确认准确性

[INPUT]
- Phase 1 检测结果 JSON

[OUTPUT FORMAT]
## 🔍 项目检测结果

| 项目 | 检测值 |
|------|--------|
| 语言 | TypeScript |
| 框架 | React + Vite |
| 包管理器 | pnpm |
| Node 版本 | 20 |
| 现有配置 | README.md, .gitignore |

检测结果是否正确？如有问题请告诉我。
```

### Step 2: 模式选择

```
[ROLE] 配置模式引导专家

[TASK]
使用 AskUserQuestion 引导用户选择配置模式

[TOOL CALL]
AskUserQuestion({
  "question": "请选择配置模式",
  "header": "配置模式",
  "options": [
    {
      "label": "🚀 快速模式 (推荐新手)",
      "description": "智能推荐最佳实践配置，只需确认即可"
    },
    {
      "label": "🎯 自定义模式",
      "description": "逐个选择每个组件，了解每个功能的作用"
    },
    {
      "label": "📦 全量模式",
      "description": "启用所有可用组件，适合企业级项目"
    }
  ],
  "multiSelect": false
})

[OUTPUT]
用户选择的模式: quick | custom | full
```

### Step 3: 路由到子阶段

```
[ROLE] 流程路由专家

[TASK]
根据用户选择的模式，路由到对应的子阶段

[ROUTING RULES]
- 快速模式 → 执行 Phase 2.1
- 自定义模式 → 执行 Phase 2.2
- 全量模式 → 执行 Phase 2.3

[ACTIONS]
1. 读取对应的子阶段文件
2. 按照子阶段流程执行
3. 完成后进入 Phase 2.9 生成配置
```

---

## Output

- **Format**: 配置 JSON（内存保持）
- **Usage**: 传递给 Phase 3 进行冲突检测

## Quality Checklist

### Completeness (完整性)
- [ ] 检测结果已展示
- [ ] 配置模式已选择
- [ ] 子阶段已完成
- [ ] 配置 JSON 已生成

### Validation (验证)
- [ ] 所有必需变量已收集
- [ ] GitHub 信息已确认
- [ ] 组件特定变量已收集

## Reference Documents

| Document | Purpose |
|----------|---------|
| [02.1-quick-mode.md](02.1-quick-mode.md) | 快速模式流程 |
| [02.2-custom-mode.md](02.2-custom-mode.md) | 自定义模式流程 |
| [02.3-full-mode.md](02.3-full-mode.md) | 全量模式流程 |
| [02.9-finalize-config.md](02.9-finalize-config.md) | 生成配置 JSON |
| [specs/presets.md](../specs/presets.md) | 预设配置定义 |

## Next Phase

配置收集完成后，进入 [Phase 3: 冲突检测](03-conflict.md)，检查现有配置与目标配置的冲突。
