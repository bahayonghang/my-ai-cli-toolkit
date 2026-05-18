# CC 命令创建工具 (Command Creation)

> 历史 / 已下线说明：本页记录的是已经移除的命令家族。当前 `content/platforms/*/commands/` 中没有对应源树，因此本页只作为兼容参考保留，不进入 live sidebar。


创建和管理 Claude Code 自定义命令及子代理配置。

## 命令

### `create-command`

**描述**: 使用规范结构和最佳实践创建新的 Claude Code 自定义命令。
**用法**: `/cc:create-command [命令名称] [描述]`

#### 工作流程

1. **命令分析** - 确定命令目的、范围和适当位置（项目级 vs 用户级）
2. **结构规划** - 定义所需参数、工作流步骤、工具和权限
3. **命令创建** - 在 `.claude/commands/` 中生成包含 YAML frontmatter（`description`、`argument-hint`、`allowed-tools`）和完整文档的命令文件
4. **质量保证** - 验证语法、结构、工具权限，并对照最佳实践进行审查

#### 模板结构

```markdown
---
description: 命令的简要描述
argument-hint: 预期的参数格式
allowed-tools: 所需工具列表
---

# 命令名称

此命令的作用以及何时使用它的详细描述。

## 用法

`/[类别:]命令名称 [参数]`
```

### `meta-agent`

**描述**: 根据用户描述生成新的 Claude Code 子代理配置文件。
**用法**: `/cc:meta-agent [描述]`

#### 工作流程

1. **获取最新文档** - 从 Anthropic 文档获取最新的 Claude Code 子代理功能文档
2. **分析输入** - 解析用户提示，理解新代理的用途、任务和领域
3. **设计名称** - 创建简洁、描述性的 `kebab-case` 名称（如 `dependency-manager`）
4. **选择工具** - 根据代理任务推断所需的最小工具集
5. **构建系统提示** - 编写包含分步指令和最佳实践的详细系统提示
6. **写入文件** - 将完整的 `.md` 代理定义输出到 `.claude/agents/<代理名称>.md`

#### 输出格式

```markdown
---
name: <代理名称>
description: <面向操作的描述>
tools: <工具-1>, <工具-2>
model: haiku | sonnet | opus
---

# 用途

你是一个<角色定义>。

## 指令

1. 分步指令...

## 报告 / 响应

以清晰有序的方式提供你的最终响应。
```

## 示例

```bash
# 创建一个数据库迁移命令
/cc:create-command db-migrate "运行和管理数据库迁移"

# 生成一个新的代码审查代理
/cc:meta-agent "一个审查 TypeScript 代码无障碍合规性的代理"
```

## 注意事项

- `create-command` 在生成的命令中使用 `$ARGUMENTS` 进行参数处理
- `meta-agent` 默认使用 `sonnet` 模型，除非另有指定
- 两个命令都使用 `WebSearch` 在需要时获取最新文档
- 生成的文件遵循仓库中现有的命令/代理约定
