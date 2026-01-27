# 代理概览

OMO Agents 是受 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) 启发的多代理编排系统。不再是单个 AI 处理所有事情，而是让专业代理协同工作——各自发挥所长——交付更好的结果。

## 代理阵容

| 代理 | 角色 | 适用场景 | 描述 |
|------|------|----------|------|
| [@sisyphus](./sisyphus) | 编排者 | 复杂任务 | 主编排代理，负责多步骤任务、委派和并行执行 |
| [@oracle](./oracle) | 架构师 | 设计决策 | 专家级技术顾问，负责架构、代码审查和调试 |
| [@explore](./explore) | 侦察兵 | 代码搜索 | 快速代码搜索代理，定位代码、文件和模式 |
| [@librarian](./librarian) | 研究员 | 文档查找 | 外部文档研究员和实现参考专家 |
| [@frontend-engineer](./frontend-engineer) | UI 专家 | 精美界面 | UI/UX 设计开发专家，打造精致界面 |
| [@document-writer](./document-writer) | 写手 | 技术文档 | 技术文档专家，负责 README、API 文档和指南 |
| [@multimodal-looker](./multimodal-looker) | 分析师 | 视觉内容 | 视觉内容分析专家，处理图片、PDF 和图表 |

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

## 选择正确的代理

| 需求 | 代理 |
|------|------|
| "X 在代码库哪里？" | @explore |
| "X 应该怎么设计？" | @oracle |
| "别人怎么实现 X？" | @librarian |
| "构建这个 UI 组件" | @frontend-engineer |
| "给 X 写文档" | @document-writer |
| "这张图显示什么？" | @multimodal-looker |
| 复杂多步骤任务 | @sisyphus |

## 核心理念

oh-my-opencode 项目证明了 LLM 代理在以下情况下工作最佳：

1. **专业化**: 每个代理专注于自己最擅长的领域
2. **协作性**: 代理根据专业领域相互委派任务
3. **并行化**: 独立任务同时执行
4. **上下文感知**: 代理通过委派探索任务保持精简上下文

## 另请参阅

- [技能](/zh/skills/) - 单独的技能定义
- [OMO Agents 教程](/zh/guide/omo-agents-tutorial) - 详细教程和示例
