# CLI 工具命令

初始化 CLI 工具配置并使用外部 CLI 工具执行代码审查。

## 命令

### `cli-init`

**描述**: 生成 `.gemini/` 和 `.qwen/` 配置目录，包含 settings.json 和基于技术栈检测的忽略文件。
**用法**: `/cli:cli-init [--tool gemini|qwen|all] [--output path] [--preview]`

#### 工作原理

1. **工作区分析** - 运行 `get_modules_by_depth.sh` 分析项目结构
2. **技术栈检测** - 根据配置文件、目录和文件扩展名识别技术栈
3. **配置创建** - 生成工具特定的配置目录和 `settings.json`
4. **忽略规则生成** - 创建包含技术特定过滤规则的 `.geminiignore` 和 `.qwenignore`

#### 选项

| 选项 | 描述 |
|------|------|
| `--tool gemini` | 仅初始化 Gemini（`.gemini/` + `.geminiignore`） |
| `--tool qwen` | 仅初始化 Qwen（`.qwen/` + `.qwenignore`） |
| `--tool all` | 初始化两者（默认） |
| `--preview` | 预览将生成的内容，不创建文件 |
| `--output <path>` | 在指定目录中生成文件 |

#### 支持的技术栈

| 类别 | 技术 | 检测方式 |
|------|------|----------|
| 前端 | React/Next.js、Vue/Nuxt、Angular | `package.json`、框架配置文件 |
| 后端 | Node.js、Python、Java、Go、C#/.NET | `requirements.txt`、`pom.xml`、`go.mod` |
| 基础设施 | Docker、Kubernetes | `Dockerfile`、helm charts |

### `codex-review`

**描述**: 使用 Codex CLI 进行交互式代码审查，支持配置审查目标、模型和自定义指令。
**用法**: `/cli:codex-review [--uncommitted|--base branch|--commit sha] [--model model] [prompt]`

#### 工作原理

1. **解析参数** - 从输入中检测目标标志和选项
2. **交互式选择** - 如未指定目标，引导用户选择审查目标、模型和关注领域
3. **构建提示** - 根据选定的关注领域（通用、安全、性能、代码质量）构建审查提示
4. **执行审查** - 通过 ccw cli 端点运行 `codex review`

#### 选项

| 选项 | 描述 |
|------|------|
| `--uncommitted` | 审查已暂存、未暂存和未跟踪的更改 |
| `--base <branch>` | 审查相对于基准分支的更改 |
| `--commit <sha>` | 审查特定提交引入的更改 |
| `--model <model>` | 覆盖模型（default、o3、gpt-4.1、o4-mini） |

#### 关注领域

| 关注点 | 检查内容 |
|--------|----------|
| 通用审查 | 正确性、风格、缺陷、文档 |
| 安全审查 | 注入、认证、验证、数据暴露 |
| 性能审查 | 复杂度、内存、查询、缓存 |
| 代码质量 | SOLID、重复、命名、测试 |

## 示例

```bash
# 初始化所有 CLI 工具
/cli:cli-init

# 预览将生成的内容
/cli:cli-init --preview

# 仅初始化 Gemini
/cli:cli-init --tool gemini

# 审查未提交的更改
/cli:codex-review --uncommitted

# 使用 o3 模型审查相对于 main 分支的更改
/cli:codex-review --base main --model o3

# 交互模式（引导流程）
/cli:codex-review
```

## 注意事项

- `cli-init` 在覆盖前会备份现有配置文件
- 忽略文件使用 gitignore 语法，包含基础规则（VCS、OS、IDE、日志）和技术特定规则
- `codex-review` 的目标标志（`--uncommitted`、`--base`、`--commit`）与自定义提示互斥
- 指定目标标志时，codex 使用默认审查行为，不附加自定义提示
