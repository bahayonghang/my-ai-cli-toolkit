# 记忆系统命令

> 历史 / 已下线说明：本页记录的是已经移除的命令家族。当前 `content/platforms/*/commands/` 中没有对应源树，因此本页只作为兼容参考保留，不进入 live sidebar。


用于管理项目记忆、文档生成、会话恢复和技能包的命令。处理上下文加载、记忆压缩和自动化文档工作流。

## 命令

### 文档生成

#### `docs`

**描述**: 规划文档工作流，动态分组生成 IMPL 任务，支持并行模块文档生成。
**用法**: `/memory:docs [path] [--tool <gemini|qwen|codex>] [--mode <full|partial>] [--cli-execute]`

轻量级规划器，分析项目结构，将文档工作分解为任务（每任务最多 10 个文档），生成执行计划。支持代理模式（默认）和 CLI 模式。输出镜像源码结构至 `.workflow/docs/{project_name}/`。

#### `docs-full-cli`

**描述**: 使用 CLI 执行和批量代理生成完整项目文档，支持工具回退。
**用法**: `/memory:docs-full-cli [path] [--tool <gemini|qwen|codex>]`

使用三层架构（自底向上：Layer 3 到 1）编排项目级文档生成。<20 个模块使用直接并行执行，更大项目使用代理批处理（4 模块/代理）。包含 gemini/qwen/codex 回退链。

#### `docs-related-cli`

**描述**: 仅为 git 变更模块生成/更新文档。
**用法**: `/memory:docs-related-cli [--tool <gemini|qwen|codex>]`

上下文感知的增量文档生成。通过 git diff 检测变更模块，使用 `single` 策略进行聚焦更新。<15 个模块直接并行，更大集合使用代理批处理。适合日常开发工作流。

### 记忆加载

#### `load`

**描述**: 通过 Gemini/Qwen CLI 分析项目并返回 JSON 核心内容包。
**用法**: `/memory:load [--tool gemini|qwen] "任务上下文描述"`

委托给 universal-executor 代理，分析项目结构、发现相关文件，返回结构化内容包（架构、技术栈、相关文件、集成点、约束条件）。只读操作，节省 token。

#### `load-skill-memory`

**描述**: 激活 SKILL 包并根据任务意图智能加载文档。
**用法**: `/memory:load-skill-memory [skill_name] "任务意图描述"`

从任务描述或文件路径自动检测技能，或接受手动指定。根据意图关键词加载适当深度的文档（快速概览 ~2K token 到全面了解 ~40K token）。

### 记忆管理

#### `compact`

**描述**: 将会话记忆压缩为结构化文本，通过 MCP core_memory 保存以便会话恢复。
**用法**: `/memory:compact [会话描述]`

从当前会话提取目标、执行计划、工作/参考文件、决策、约束和状态。保存到持久存储并返回恢复 ID，用于未来会话恢复。

#### `update-full`

**描述**: 使用分层执行和批量代理更新所有 CLAUDE.md 文件。
**用法**: `/memory:update-full [--tool gemini|qwen|codex] [--path <directory>]`

全项目 CLAUDE.md 重新生成，使用 Layer 3 到 1 自底向上处理。<20 个模块直接并行，更大项目使用代理批处理。

#### `update-related`

**描述**: 仅为 git 变更模块更新 CLAUDE.md。
**用法**: `/memory:update-related [--tool gemini|qwen|codex]`

基于 git 变更的增量 CLAUDE.md 更新。<15 个模块直接执行，否则使用代理批处理。

### SKILL 包生成

#### `code-map-memory`

**描述**: 为特定功能生成基于 Mermaid 的代码流文档和 SKILL 包。
**用法**: `/memory:code-map-memory "feature-keyword" [--regenerate] [--tool <gemini|qwen>]`

三阶段编排器：解析功能关键词，委托 cli-explore-agent 进行深度代码分析（双源：Bash + Gemini），然后生成 5 个 Mermaid 文档文件（架构、函数调用、数据流、条件路径、完整流程）加 SKILL.md 索引（含渐进加载级别）。

#### `skill-memory`

**描述**: 从项目文档生成带渐进加载的完整 SKILL 包。
**用法**: `/memory:skill-memory [path] [--tool <gemini|qwen|codex>] [--regenerate] [--mode <full|partial>] [--cli-execute]`

四阶段自主编排器：检查现有文档、通过 `/memory:docs` 规划、通过 `/workflow:execute` 执行、生成 SKILL.md 渐进加载索引。文档已存在时跳过阶段 2-3。

#### `style-skill-memory`

**描述**: 从样式参考生成 SKILL 记忆包，用于一致的设计系统使用。
**用法**: `/memory:style-skill-memory [package-name] [--regenerate]`

#### `workflow-skill-memory`

**描述**: 处理归档的工作流会话以生成 workflow-progress SKILL 包。
**用法**: `/memory:workflow-skill-memory session <session-id> | all`

使用 universal-executor 代理和 Gemini 分析处理 WFS-* 归档会话，生成会话时间线、经验教训和冲突文档。

### 专项命令

#### `swagger-docs`

**描述**: 按照 RESTful 标准生成完整的 Swagger/OpenAPI 文档。
**用法**: `/memory:swagger-docs [path] [--tool <gemini|qwen|codex>] [--format <yaml|json>] [--version <v3.0|v3.1>] [--lang <zh|en>]`

生成全局安全定义、API 端点详情、错误码和验证测试。

#### `tech-research-rules`

**描述**: 提取技术栈、通过 Exa 研究并生成路径条件规则（由 Claude Code 自动加载）。
**用法**: `/memory:tech-research-rules [session-id | tech-stack-name] [--regenerate] [--tool <gemini|qwen>]`

## 示例

```bash
# 为新功能加载项目上下文
/memory:load "在当前前端基础上开发用户认证功能"

# 生成完整项目文档
/memory:docs-full-cli

# 为最近变更的模块更新文档
/memory:docs-related-cli --tool qwen

# 压缩会话以便后续恢复
/memory:compact "完成认证模块实现"

# 为功能生成代码流图
/memory:code-map-memory "支付处理"

# 带意图加载技能记忆
/memory:load-skill-memory my_project "修改认证模块增加OAuth支持"
```

## 注意事项

- 文档命令输出到 `.workflow/docs/{project_name}/`，镜像源码结构。
- 工具回退顺序：gemini -> qwen -> codex（可通过 `--tool` 配置）。
- 记忆加载为会话级别；新会话需要重新执行。
- SKILL 包存储在 `.claude/skills/` 下，包含渐进加载级别（0-3）。
