# OMO Agents

受 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) 启发的多代理编排系统。

## 概述

OMO Agents 将多代理协作的力量带入你的开发工作流。不再是单个 AI 处理所有事情，而是让专业代理协同工作——各自发挥所长——交付更好的结果。

## 核心理念

oh-my-opencode 项目证明了 LLM 代理在以下情况下工作最佳：

1. **专业化**: 每个代理专注于自己最擅长的领域
2. **协作性**: 代理根据专业领域相互委派任务
3. **并行化**: 独立任务同时执行
4. **上下文感知**: 代理通过委派探索任务保持精简上下文

## 代理阵容

| 代理 | 角色 | 适用场景 |
|------|------|----------|
| [@sisyphus](/zh/agents/sisyphus) | 编排者 | 复杂多步骤任务、协调工作 |
| [@oracle](/zh/agents/oracle) | 架构师 | 设计决策、代码审查、调试 |
| [@librarian](/zh/agents/librarian) | 研究员 | 文档查找、最佳实践、开源研究 |
| [@explore](/zh/agents/explore) | 侦察兵 | 代码搜索、依赖追踪 |
| [@frontend-engineer](/zh/agents/frontend-engineer) | UI 专家 | 精美界面、动画效果 |
| [@document-writer](/zh/agents/document-writer) | 写手 | README、API 文档、技术写作 |
| [@multimodal-looker](/zh/agents/multimodal-looker) | 分析师 | 图片、PDF、图表分析 |

## 快速开始

### 直接调用代理

```
@oracle 状态管理应该用 Redux 还是 Zustand？

@explore 找到所有认证相关的代码

@librarian Next.js 14 的 Server Actions 怎么用？

@frontend-engineer 创建一个带动画的订阅表单
```

### 编排模式

对于复杂任务，让 Sisyphus 来协调：

```
@sisyphus 给这个电商项目添加用户认证功能
```

Sisyphus 会自动：
1. 分析任务并拆解为子任务
2. 派遣 @explore 查找现有认证代码
3. 咨询 @oracle 进行架构决策
4. 派遣 @librarian 研究最佳实践
5. 将 UI 工作委派给 @frontend-engineer
6. 让 @document-writer 更新文档

## 工作原理

```
┌─────────────────────────────────────────────────────────┐
│                      用户请求                           │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 @sisyphus (编排者)                       │
│  • 分析意图                                              │
│  • 创建 TODO 列表                                        │
│  • 委派给专家                                            │
│  • 追踪进度                                              │
└───────┬─────────┬─────────┬─────────┬─────────┬────────┘
        │         │         │         │         │
        ▼         ▼         ▼         ▼         ▼
   @explore   @oracle  @librarian  @frontend  @document
   (搜索)     (建议)    (研究)     (构建UI)   (写作)
```

## 最佳实践

### 1. 选择正确的代理

| 需求 | 代理 |
|------|------|
| "X 在代码库哪里？" | @explore |
| "X 应该怎么设计？" | @oracle |
| "别人怎么实现 X？" | @librarian |
| "构建这个 UI 组件" | @frontend-engineer |
| "给 X 写文档" | @document-writer |
| "这张图显示什么？" | @multimodal-looker |

### 2. 提供上下文

```
❌ "@explore 找那个函数"
✅ "@explore 找支付处理函数，可能在 src/services/ 目录"

❌ "@oracle 这样好吗？"
✅ "@oracle 评估这个认证流程，用于中等规模的 SaaS 应用"
```

### 3. 复杂任务用 Sisyphus

- 简单查询 → 直接调用代理
- 多步骤开发 → @sisyphus
- 不确定用哪个？→ @sisyphus 会帮你路由

## 示例工作流

### 功能开发

```
用户: @sisyphus 给产品页添加用户评价系统

Sisyphus:
1. @explore → 查找现有产品/评价代码
2. @oracle → 设计评价数据模型和 API
3. @librarian → 研究评价系统模式
4. 执行后端实现
5. @frontend-engineer → 构建评价 UI 组件
6. @document-writer → 更新 API 文档
```

### 代码重构

```
用户: @sisyphus 重构用户模块以提高可维护性

Sisyphus:
1. @explore → 映射所有用户相关文件
2. @oracle → 识别问题和改进计划
3. @librarian → 研究类似项目结构
4. 执行重构并追踪 TODO
5. @document-writer → 更新模块文档
```

### Bug 调查

```
用户: @sisyphus 用户反馈登录偶尔失败

Sisyphus:
1. @explore → 查找认证/登录代码路径
2. @oracle → 分析潜在故障点
3. @librarian → 检查依赖的已知问题
4. 实现修复并添加错误处理
```

## 相关技能

- [sisyphus](/zh/agents/sisyphus) - 主编排代理
- [oracle](/zh/agents/oracle) - 架构顾问
- [librarian](/zh/agents/librarian) - 文档研究员
- [explore](/zh/agents/explore) - 代码搜索专家
- [frontend-engineer](/zh/agents/frontend-engineer) - UI/UX 专家
- [document-writer](/zh/agents/document-writer) - 技术写手
- [multimodal-looker](/zh/agents/multimodal-looker) - 视觉内容分析师
