# codex

通过 Codex CLI 执行深度代码分析、调试、重构、实时技术检索，以及带引用的研究工作流。

从 GPT-5.4 开始，OpenAI 推荐在大多数 Codex 编码场景中优先使用最新的 GPT-5 通用模型，因此这个 skill 现在默认使用 `gpt-5.4`。

## 默认配置

- 规范命令：`codex exec`
- 兼容短别名：`codex e`
- 默认模型：`gpt-5.4`
- 代码任务推理：`xhigh`
- 网络搜索推理：`high`
- 实时搜索配置：`-c web_search="live"`

## 统一模型入口

下面的示例都把默认模型集中在一个变量里：

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
```

这只是示例里的 shell 约定，Codex 真正需要的只有最终传给 `-m` 的模型名。

## 代码执行模板

适用于代码分析、调试、重构和生成：

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  -C <workdir> \
  "<task>"
```

### 示例

```bash
# 解释文件
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "explain @src/main.ts"

# 重构代码
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=high \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "refactor @src/utils for performance"

# 分析整个项目
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  -C /path/to/project \
  "analyze @. and find security issues"
```

## 网络搜索与研究模板

适用于当前文档、网页总结，以及已经并入 Codex 的实时技术调研工作流：

- 将宽泛问题拆成多个聚焦子查询
- 优先使用官方文档与官方公告
- 最终输出保留可点击引用
- 当引用较多或结果可疑时，先做链接校验

```bash
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=high \
  -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "<task>"
```

### 示例

```bash
# 获取 GitHub 仓库页面并总结
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=high \
  -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "Fetch and summarize https://github.com/user/repo"

# 检索当前文档
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=high \
  -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "find the latest React 19 hooks documentation"

# 做技术对比
CODEX_MODEL="${CODEX_MODEL:-gpt-5.4}"
codex exec -m "$CODEX_MODEL" \
  -c model_reasoning_effort=high \
  -c web_search="live" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  "compare Vite vs Webpack for React projects today"
```

## 模型覆盖与配置

单次覆盖模型：

```bash
codex exec -m gpt-5.4-pro "review @src/server.ts for race conditions"
```

在 `~/.codex/config.toml` 中设置持久化默认模型：

```toml
model = "gpt-5.4"
```

或定义一个复用 profile：

```toml
[profiles.codex-web]
model = "gpt-5.4"
web_search = "live"
```

## 会话恢复

继续已有的非交互 Codex 会话：

```bash
codex exec resume <session_id> "<follow-up task>"
```

示例：

```bash
codex exec resume <session_id> "now add type hints"
```

## 前置要求与说明

- 检查安装：`command -v codex`
- 检查登录：`codex login status`
- 需要登录时执行：`codex login`
- `@file` 表示相对当前工作目录引用文件
- `@.` 表示引用整个工作目录
- `--json` 可用于程序化输出
- 自动化示例默认都使用 `--dangerously-bypass-approvals-and-sandbox`
- 一次性目录可配合 `--skip-git-repo-check`
- 优先使用 `-c web_search="live"`，不要继续使用旧版 web 搜索 flag 或旧的 feature toggle 写法
