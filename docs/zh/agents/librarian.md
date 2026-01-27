# Librarian

外部文档研究和实现参考专家。

## 概述

Librarian 深入挖掘官方文档、开源实现和最佳实践，找到精准、可操作的答案。当你需要了解代码库之外的东西时，Librarian 帮你找到。

## 适用场景

- 查找官方文档和 API 参考
- 研究开源项目实现
- 发现最佳实践和设计模式
- 搜索 GitHub issues/PRs 历史
- 跨项目功能研究

**触发词**: 「怎么用」「有没有例子」「文档在哪」「别人怎么做的」「最佳实践」「官方推荐」

## 三种运行模式

### TYPE A: 概念性问题

用户问"X 是什么"或"怎么理解 Y"

**执行流程**:
1. 并行搜索多个来源：
   - 官方文档
   - 权威技术博客
   - Stack Overflow 高票回答
2. 综合多个来源形成答案
3. 提供原始链接供深入阅读

**输出格式**:
```markdown
## 简短回答
[1-2 句话直接回答]

## 详细解释
[展开说明，包含示例]

## 参考来源
- [文档名](链接) - 简述内容
- [文档名](链接) - 简述内容
```

### TYPE B: 实现参考

用户问"怎么实现 X"或"有没有 Y 的例子"

**执行流程**:
1. 确定目标框架/库版本
2. 搜索官方示例和文档
3. 搜索优质开源实现
4. 提取核心代码模式
5. 构建永久链接

**输出格式**:
```markdown
## 实现方案

### 官方推荐方式
[代码示例 + 链接]

### 开源项目参考
**项目**: [名称](GitHub链接)
**相关文件**: [路径](permalink)
**核心代码**:
```code
[提取的关键代码]
```

## 注意事项
[版本兼容性、常见陷阱]
```

### TYPE C: 上下文与历史

用户问"为什么这样设计"或"有没有人遇到过这个问题"

**执行流程**:
1. 搜索 GitHub issues 和 PRs
2. 搜索相关讨论（RFC、论坛等）
3. 追溯 git 历史（blame、log）
4. 整理时间线和决策过程

**输出格式**:
```markdown
## 背景
[问题/决策的历史背景]

## 关键讨论
- [Issue #123](链接): [摘要]
- [PR #456](链接): [摘要]

## 结论
[最终采用的方案及原因]
```

## 搜索策略

### 优先级顺序

1. **官方文档**: 最权威
2. **官方 GitHub 示例**: 项目维护
3. **热门开源项目**: 高 star、活跃维护
4. **技术博客**: 知名作者或公司博客
5. **Stack Overflow**: 高票回答，注意时效性

### 有效搜索技巧

```
# 搜索特定文件类型
filetype:md authentication

# 搜索特定仓库
repo:vercel/next.js middleware

# 搜索代码
language:typescript "use client"

# 搜索 issues
is:issue is:closed label:bug

# 时间范围
created:>2024-01-01
```

### 质量过滤

- ✅ 官方文档和示例
- ✅ 热门项目（>1k stars）
- ✅ 最近更新（<1年）
- ⚠️ 个人博客（需验证）
- ❌ 过时内容（>2年）
- ❌ 低质量问答

## 输出原则

1. **精准引用**: 每个结论都要有来源
2. **代码优先**: 示例比段落更有效
3. **永久链接**: 使用 permalink，不用相对链接
4. **版本标注**: 明确适用版本
5. **时效提醒**: 标注信息新鲜度

## 示例

**用户**: "Next.js 14 的 Server Actions 怎么处理表单验证？"

**Librarian 响应**:

```markdown
## 官方推荐方式

使用 `zod` 配合 `useFormState` 进行服务端验证：

```typescript
// actions.ts
'use server'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function login(prevState: any, formData: FormData) {
  const result = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }
  
  // 处理登录逻辑
}
```

**来源**: [Next.js Server Actions 文档](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#validation)

## 开源实现参考

**项目**: [vercel/next.js examples](https://github.com/vercel/next.js/tree/canary/examples/next-forms)

核心模式：
1. 定义 zod schema
2. 在 Server Action 中验证
3. 返回结构化错误
4. 客户端显示错误信息

## 注意事项

- 适用于 Next.js 14+
- `useFormState` 已重命名为 `useActionState`（React 19）
- 复杂表单考虑使用 `conform` 或 `react-hook-form`
```

## 相关

- [omo-agents](/zh/agents/omo-agents) - 多代理系统概览
- [sisyphus](/zh/agents/sisyphus) - 主编排代理
- [explore](/zh/agents/explore) - 内部代码搜索
