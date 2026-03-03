# mermaid-expert

Mermaid.js 图表专家指导。

## 概述

Mermaid Expert 提供 Mermaid.js 图表语言的专家级指导。Mermaid 是一种基于 Markdown 的图表定义语言，可以在文档中直接渲染流程图、时序图、类图等。

## 图表类型

### 流程图

```mermaid
flowchart TD
    A[开始] --> B{条件判断}
    B -->|是| C[处理A]
    B -->|否| D[处理B]
    C --> E[结束]
    D --> E
```

### 时序图

```mermaid
sequenceDiagram
    participant U as 用户
    participant S as 服务器
    participant D as 数据库

    U->>S: 请求数据
    S->>D: 查询
    D-->>S: 返回结果
    S-->>U: 响应
```

### 类图

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +bark()
    }
    Animal <|-- Dog
```

### 甘特图

```mermaid
gantt
    title 项目计划
    dateFormat YYYY-MM-DD
    section 设计
    需求分析    :a1, 2024-01-01, 7d
    UI设计      :a2, after a1, 5d
    section 开发
    后端开发    :b1, after a2, 14d
    前端开发    :b2, after a2, 14d
```

### 状态图

```mermaid
stateDiagram-v2
    [*] --> 待处理
    待处理 --> 处理中: 开始
    处理中 --> 已完成: 完成
    处理中 --> 已取消: 取消
    已完成 --> [*]
    已取消 --> [*]
```

## 图表样式

### 节点样式

```mermaid
flowchart LR
    A[方形]
    B(圆角)
    C([体育场形])
    D[[子程序]]
    E[(数据库)]
    F((圆形))
```

### 连线样式

```mermaid
flowchart LR
    A --> B
    C --- D
    E -.-> F
    G ==> H
    I --文字--> J
```

## 主题配置

```mermaid
%%{init: {'theme': 'dark'}}%%
flowchart LR
    A --> B --> C
```

可用主题：
- `default` - 默认主题
- `dark` - 暗色主题
- `forest` - 绿色主题
- `neutral` - 中性主题

## 最佳实践

1. **选择合适的图表类型** - 根据内容选择最佳呈现方式
2. **保持简洁** - 避免过于复杂的图表
3. **使用有意义的标签** - 清晰描述节点和连线
4. **适当分组** - 使用子图组织相关元素
5. **测试渲染** - 确保在目标平台正确显示

## 集成支持

| 平台 | 支持状态 |
|------|----------|
| GitHub | ✅ |
| GitLab | ✅ |
| Notion | ✅ |
| VitePress | ✅ |
| VS Code | ✅ (扩展) |

## 相关资源

- [Mermaid 官方文档](https://mermaid.js.org/)
- [Mermaid Live Editor](https://mermaid.live/)
