# codex

通过 Codex CLI 执行代码生成、分析和网络搜索。

## 能力

### 1. 代码生成

具有最大推理能力的深度代码分析和生成。

**使用场景**：
- 需要深度理解的复杂代码分析
- 跨多个文件的大规模重构
- 带安全控制的自动代码生成

**默认配置**：
- 模型：`gpt-5.2-codex`
- 推理：`xhigh`（最大思考深度）

**命令**：
```bash
codex e -m gpt-5.2-codex -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "<task>"
```

**示例**：
```bash
# 解释代码
codex e ... "explain @src/main.ts"

# 重构
codex e ... "refactor @src/utils for performance"

# 多文件分析
codex e ... -C /path/to/project "analyze @. and find security issues"
```

### 2. 网络搜索与获取

带网络搜索和页面内容获取的在线研究。

**使用场景**：
- 文档查找
- 获取和总结网页
- 当前信息检索
- 技术对比

**默认配置**：
- 模型：`gpt-5.1-codex`
- 推理：`high`
- 网络搜索：启用

**命令**：
```bash
codex e -m gpt-5.1-codex -c model_reasoning_effort=high \
  --enable web_search_request \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "<task>"
```

**示例**：
```bash
# 获取 GitHub 仓库
codex e ... "Fetch and summarize https://github.com/user/repo"

# 文档搜索
codex e ... "find the latest React 19 hooks documentation"

# 技术研究
codex e ... "compare Vite vs Webpack for React projects in 2024"
```

## 会话恢复

继续之前的对话：

```bash
codex e resume <session_id> "<follow-up task>"
```

## 文件引用

- `@file` - 引用特定文件
- `@.` - 引用整个工作目录
- `-C <dir>` - 设置工作目录

## 前置要求

- 已安装并认证 Codex CLI
- 已配置 API 访问
