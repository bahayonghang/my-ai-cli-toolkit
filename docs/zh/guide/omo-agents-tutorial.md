# 代理教程

专业 AI 代理的使用指南。

## 什么是代理？

代理是专注于特定领域的专业 AI 助手。不同代理各自发挥所长：

- **Frontend Engineer** 创建精美 UI
- **Document Writer** 撰写技术文档

## 快速开始

直接调用代理：

```
@frontend-engineer 创建一个带流畅动画的订阅表单

@document-writer 为认证模块编写完整的 API 文档
```

## 代理参考

### Frontend Engineer - UI 专家

**适用于**: 创建精美界面、动画、响应式设计

**原则**: 像素级完美、动效是灵魂、直觉优先

**示例**:
```
@frontend-engineer 创建一个带悬浮效果的仪表盘卡片组件

@frontend-engineer 构建一个带平滑进入/退出动画的模态框
```

### Document Writer - 技术写手

**适用于**: README、API 文档、架构文档、JSDoc 注释

**文档类型**: README.md、API 参考、架构文档、用户指南

**示例**:
```
@document-writer 为认证模块编写完整的 API 文档

@document-writer 给这个服务类添加 JSDoc 注释
```

## 最佳实践

### 1. 选择正确的代理

| 需求 | 代理 |
|------|------|
| 构建 UI 组件 | @frontend-engineer |
| 编写文档 | @document-writer |

### 2. 提供良好的上下文

**不好**:
```
@frontend-engineer 弄好看点
```

**好**:
```
@frontend-engineer 创建一个玻璃拟态风格的仪表盘卡片组件，带悬浮深度效果和响应式布局
```

## 故障排除

**代理响应不符合预期？**
- 提供更多项目上下文
- 具体说明你需要什么

**结果不准确？**
- 验证代理可以访问相关文件
- 提供文件路径或代码片段作为上下文
