# Gemini CLI 集成 Skill

这个 skill 用于让 Claude Code 更稳定地编排 Gemini CLI，覆盖代码生成、代码审查、架构分析和联网研究等场景。当前默认模型改为 `gemini-3.1-pro-preview`，并采用统一变量约定，后续切换新模型时只需要改一处默认值。

## 适用场景

在以下情况优先使用这个 skill：

1. 需要 Gemini 提供第二工程视角，补充代码审查、缺陷分析或安全检查
2. 需要 Google Search 加持的实时信息，例如最新文档、版本、发布说明、社区方案
3. 需要借助 `codebase_investigator` 做跨文件架构理解
4. 需要把长耗时任务交给 Gemini CLI 后台执行
5. 需要生成测试、文档、迁移代码等专项产出

对于非常小的一步式任务，不建议使用，CLI 调起成本通常高于收益。

## 默认模型约定

### Bash / zsh

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
GEMINI_FAST_MODEL="${GEMINI_FAST_MODEL:-gemini-3.1-flash-preview}"
```

### PowerShell

```powershell
if (-not $env:GEMINI_MODEL) { $env:GEMINI_MODEL = "gemini-3.1-pro-preview" }
if (-not $env:GEMINI_FAST_MODEL) { $env:GEMINI_FAST_MODEL = "gemini-3.1-flash-preview" }
```

### 官方覆盖顺序

1. `--model`
2. `GEMINI_MODEL`
3. `settings.json` 中的 `model.name`
4. Gemini CLI 自身默认值 `auto`

如果当前环境没有 3.1 preview 权限，兼容回退到 `gemini-2.5-pro` 或 `auto`。

## 快速开始

### 检查安装

```bash
command -v gemini
```

```powershell
Get-Command gemini
```

如果未安装，可执行：

```bash
npm install -g @google/gemini-cli
```

### 默认命令模式

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "[prompt]" -m "$GEMINI_MODEL" --approval-mode yolo -o text 2>&1
```

关键参数：

- `--approval-mode yolo`：自动批准工具调用
- `-o text`：文本输出
- `-o json`：结构化输出，包含统计信息
- `-m "$GEMINI_MODEL"`：本 skill 的主默认模型
- `-m "$GEMINI_FAST_MODEL"`：轻量任务的快速模型

## 核心行为说明

### `yolo` 不会跳过计划阶段

`--approval-mode yolo` 只会自动批准工具调用，不会阻止 Gemini 先输出计划。如果你需要它直接动手，提示词里要明确加入：

- "Apply changes now"
- "Start immediately"
- "Do this without asking for confirmation"

### 输出必须校验

Gemini 生成的代码至少要检查：

- 安全风险
- 与需求是否一致
- 风格与架构是否匹配当前项目
- 依赖是否合理

### 限流与配额

Gemini CLI 会自动指数退避重试。若 preview 配额紧张，优先把轻量任务切到 `GEMINI_FAST_MODEL`，或者把主模型回退到 `gemini-2.5-pro` / `auto`。

## 常用命令模板

### 代码生成

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Create [description] with [features]. Output complete file content." -m "$GEMINI_MODEL" --approval-mode yolo -o text
```

### 代码审查

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Review [file] for features, bugs, security issues, and improvements." -m "$GEMINI_MODEL" -o text
```

### 修复缺陷

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Fix these bugs in [file]: [list]. Apply fixes now." -m "$GEMINI_MODEL" --approval-mode yolo -o text
```

### 生成测试

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Generate [Jest/pytest] tests for [file]. Focus on [areas]." -m "$GEMINI_MODEL" --approval-mode yolo -o text
```

### 生成文档

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Generate JSDoc for all functions in [file]. Output as markdown." -m "$GEMINI_MODEL" --approval-mode yolo -o text
```

### 架构分析

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Use codebase_investigator to analyze this project" -m "$GEMINI_MODEL" -o text
```

### 联网研究

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "What are the latest [topic]? Use Google Search." -m "$GEMINI_MODEL" -o text
```

### 轻量任务快速模型

```bash
GEMINI_FAST_MODEL="${GEMINI_FAST_MODEL:-gemini-3.1-flash-preview}"
gemini "[prompt]" -m "$GEMINI_FAST_MODEL" -o text
```

## 后台执行

### Bash / zsh

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "[long task]" -m "$GEMINI_MODEL" --approval-mode yolo -o text > gemini.log 2>&1 &
echo $!
```

### PowerShell

```powershell
if (-not $env:GEMINI_MODEL) { $env:GEMINI_MODEL = "gemini-3.1-pro-preview" }
Start-Process gemini -ArgumentList @("[long task]", "-m", $env:GEMINI_MODEL, "--approval-mode", "yolo", "-o", "text") -RedirectStandardOutput "gemini.log" -RedirectStandardError "gemini.err"
```

## 模型选择建议

| 模型 | 用途 |
|-------|------|
| `gemini-3.1-pro-preview` | 主默认模型，适合代码生成、评审、分析 |
| `gemini-3.1-flash-preview` | 更快、更低延迟，适合轻量任务 |
| `gemini-2.5-pro` | 3.1 preview 不可用时的兼容回退 |
| `auto` | 让 Gemini CLI 自行选型的兜底方案 |

## 持久化配置

### 环境变量

```bash
export GEMINI_MODEL=gemini-3.1-pro-preview
export GEMINI_FAST_MODEL=gemini-3.1-flash-preview
```

### `settings.json`

```json
{
  "model": {
    "name": "gemini-3.1-pro-preview"
  },
  "general": {
    "previewFeatures": true
  }
}
```

## Gemini 的独特能力

Gemini CLI 相对 Claude Code 额外有几个很有价值的能力：

1. `google_web_search`
2. `codebase_investigator`
3. `save_memory`

## 相关文件

- `content/skills/developer-tools-integrations/gemini/SKILL.md`
- `content/skills/developer-tools-integrations/gemini/references/reference.md`
- `content/skills/developer-tools-integrations/gemini/references/patterns.md`
- `content/skills/developer-tools-integrations/gemini/references/tools.md`
