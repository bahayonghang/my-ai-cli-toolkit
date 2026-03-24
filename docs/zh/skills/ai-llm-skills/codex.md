# Codex CLI Integration

当你希望明确走 Codex CLI 工作流，而不是普通 shell 调用时，使用这个 skill：
diff 感知代码审查、对抗式 challenge、second opinion、实时技术调研，或让 Codex
直接修改代码。

从 GPT-5.4 开始，OpenAI 推荐在大多数 Codex 编码任务中优先使用通用模型
`gpt-5.4`，因此这个 skill 默认也使用它。

## 默认配置

- 主审查命令：`codex review`
- 主通用命令：`codex exec`
- 默认模型：`gpt-5.4`
- 审查与咨询推理强度：`xhigh`
- 调研推理强度：`high`
- 实时搜索入口：顶层 `--search`
- 默认安全策略：先 review-only，再按明确要求进入写入模式

## 模式说明

### Review

用于 PR、分支、commit、未提交改动的代码审查。

```bash
codex -m gpt-5.4 -s read-only review --uncommitted
codex -m gpt-5.4 -s read-only review --base main
codex -m gpt-5.4 -s read-only review --commit <sha>
```

带重点的默认未提交改动审查：

```bash
codex -m gpt-5.4 -s read-only review "Focus on security, regressions, and missing tests."
```

约束：

- `codex review` 不能把自定义 prompt 和 `--uncommitted`、`--base`、`--commit` 一起使用。
- 如果你既要固定审查目标，又要自定义重点，要么先对目标做普通 `codex review`，要么改用 `codex exec` 的 consult / challenge 路径。

### Challenge

当你想让 Codex 站在“找问题、试图打破它”的角度工作，而不是做平衡审查时使用。

```bash
codex -m gpt-5.4 -s read-only exec \
  -c model_reasoning_effort=xhigh \
  -C <workdir> \
  "Review the relevant changes or files. Be adversarial. Find edge cases, race conditions, security holes, failure modes, and silent data corruption risks. Do not modify files."
```

### Consult

用于对某个文件、方案、迁移计划或架构决策做 second opinion。

```bash
codex -m gpt-5.4 -s read-only exec \
  -c model_reasoning_effort=xhigh \
  -C <workdir> \
  "Review @<target> as a second opinion. Explain the main risks, questionable assumptions, missing tests, and the simplest safe next step. Do not modify files."
```

### Research

用于当前文档、最新信息、带引用的技术对比。

```bash
codex --search -m gpt-5.4 exec \
  -c model_reasoning_effort=high \
  --skip-git-repo-check \
  "Research <topic>. Prefer official sources, include dates when relevant, and return clickable citations."
```

示例：

```bash
codex --search -m gpt-5.4 exec \
  -c model_reasoning_effort=high \
  "Compare Vite vs Webpack for React projects in 2026. Prefer official docs and recent sources, and include citations."
```

### Apply / Fix

只有在你明确希望 Codex 动手改代码时才使用。

优先使用受控的自动写入：

```bash
codex -m gpt-5.4 exec \
  -c model_reasoning_effort=xhigh \
  --full-auto \
  -C <workdir> \
  "<task>"
```

只有在你明确接受完全无沙箱的自动写入时，才使用全量绕过：

```bash
codex -m gpt-5.4 exec \
  -c model_reasoning_effort=xhigh \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  -C <workdir> \
  "<task>"
```

## 会话恢复

继续已有的非交互会话：

```bash
codex exec resume <session_id> "<follow-up task>"
```

示例：

```bash
codex exec resume <session_id> "now compare this with the latest official migration guide"
```

## 配置说明

持久化用户配置位于 `~/.codex/config.toml`。

基础默认值：

```toml
model = "gpt-5.4"
```

用于实时调研的 profile：

```toml
[profiles.codex-web]
model = "gpt-5.4"
web_search = "live"
```

## 前置要求

- 检查安装：
  - Bash / zsh: `command -v codex`
  - PowerShell: `Get-Command codex`
- 检查登录：`codex login status`
- 需要登录时执行：`codex login`

## 说明

- 对于 diff 感知的审查任务，优先使用 `codex review`，而不是手写 `codex exec "Review ..."`。
- `codex review` 的自定义 prompt 与 `--uncommitted`、`--base`、`--commit` 互斥。
- 对于实时网络调研，优先使用顶层 `--search`，不要继续沿用旧的 feature toggle 示例。
- `@file` 表示相对当前工作目录引用文件。
- `@.` 表示引用当前工作树。
- 需要机器可读输出时，使用 `--json`。
- 默认应保持只读姿态；写入应是显式选择。
