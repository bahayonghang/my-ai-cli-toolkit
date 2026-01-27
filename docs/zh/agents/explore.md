# Explore

快速代码搜索代理，用于在项目中定位代码、文件和模式。

## 概述

Explore 是你的快速响应代码侦察兵。它快速定位代码、理解结构、追踪依赖——保持主代理的上下文精简，同时收集所需信息。

## 适用场景

- 查找特定代码位置
- 搜索文件和模块
- 理解代码结构
- 追踪函数调用链
- 查找相似实现

**触发词**: 「在哪里」「哪个文件」「找一下」「搜索」「定位」

## 搜索策略

### 多角度方法

对于任何搜索任务，同时从多个角度发起搜索：

```
角度 1: 文件名/路径搜索 (glob)
角度 2: 内容搜索 (grep)
角度 3: 符号搜索 (LSP)
角度 4: AST 模式搜索 (ast-grep)
角度 5: Git 历史搜索 (git log/blame)
```

### 工具选择指南

| 任务 | 工具 | 示例 |
|------|------|------|
| 找文件 | glob | `**/*auth*` |
| 搜文本 | grep | `grep -r "TODO"` |
| 找定义 | LSP goto_definition | 跳转到函数 |
| 找引用 | LSP find_references | 所有调用处 |
| 找符号 | LSP workspace_symbols | 搜索类/函数名 |
| 模式匹配 | ast_grep_search | `console.log($MSG)` |
| 提交历史 | git log | `git log -p --all -S 'keyword'` |
| 追责 | git blame | 谁改了这行 |

### 搜索顺序

1. **先窄后宽**: 先精确搜索，无结果再放宽
2. **先结构后内容**: 先看目录布局
3. **先定义后引用**: 先找定义，再找使用

## 搜索模式

### 模式 1: 功能定位

"找到处理认证的代码"

```bash
# 1. 目录结构
ls -la src/
tree src/auth/ 2>/dev/null || tree src/ -L 2

# 2. 文件名搜索
find . -name "*auth*" -o -name "*login*" -o -name "*session*"

# 3. 内容搜索
grep -r "authenticate\|authorization\|session" --include="*.ts"

# 4. LSP 符号搜索
lsp_workspace_symbols query="auth"
```

### 模式 2: 函数追踪

"找到 handleSubmit 的所有调用"

```bash
# 1. 找定义
lsp_goto_definition file="src/form.tsx" line=42

# 2. 找引用
lsp_find_references file="src/form.tsx" line=42

# 3. 确认上下文
grep -B5 -A10 "handleSubmit" src/
```

### 模式 3: 模式搜索

"找到所有 console.log 语句"

```bash
# AST 精确搜索
ast_grep_search pattern="console.log($MSG)" lang="typescript"

# 或快速 grep
grep -rn "console\.log" --include="*.ts" --include="*.tsx"
```

### 模式 4: 历史追溯

"这段代码是谁什么时候加的"

```bash
# 文件修改历史
git log --oneline -20 -- path/to/file.ts

# 特定行来源
git blame -L 10,20 path/to/file.ts

# 搜索包含关键词的提交
git log -p --all -S 'keyword' --since="2024-01-01"
```

## 输出格式

### 文件列表

```markdown
## 找到的文件

| 文件 | 描述 |
|------|------|
| `src/auth/login.ts` | 登录逻辑 |
| `src/auth/session.ts` | Session 管理 |
| `src/middleware/auth.ts` | 认证中间件 |
```

### 代码位置

```markdown
## 搜索结果

### `src/auth/login.ts:42`
```typescript
export async function handleLogin(credentials: Credentials) {
  // 验证逻辑
}
```

### `src/api/auth.ts:15`
```typescript
import { handleLogin } from '../auth/login'
```
```

## 执行原则

1. **并行搜索**: 同时发起多个搜索
2. **快速响应**: 有初步结果就先返回
3. **渐进细化**: 从粗到细逐步缩小范围
4. **可操作结果**: 返回具体的文件路径和行号

## 常用命令

```bash
# 找所有 TypeScript 文件
find . -name "*.ts" -o -name "*.tsx" | head -50

# 搜索函数定义
grep -rn "function\s\+functionName\|const\s\+functionName" --include="*.ts"

# 搜索 import
grep -rn "from.*moduleName" --include="*.ts"

# 排除 node_modules
grep -r "pattern" --exclude-dir=node_modules --exclude-dir=.git
```

## 相关

- [omo-agents](/zh/agents/omo-agents) - 多代理系统概览
- [sisyphus](/zh/agents/sisyphus) - 主编排代理
- [librarian](/zh/agents/librarian) - 外部文档研究
