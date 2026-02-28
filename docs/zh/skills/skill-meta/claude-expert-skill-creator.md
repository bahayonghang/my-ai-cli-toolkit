# claude-expert-skill-creator

从专家知识创建生产级 Claude Code 技能。

## 概述

Claude Expert Skill Creator 是一个元技能，用于将结构化专家知识转化为格式完整、即用的 Claude Code 技能。该技能遵循久经验证的模式，确保一致的质量和最佳用户体验。

## 功能特性

- 🎯 **YAML 前置信息** - 自动生成符合 SKILL.md 格式的元数据
- 📋 **结构化章节** - 创建一致的文档布局
- ⚡ **快速启动指南** - 为常见任务提供即用命令
- 🔧 **配置模板** - 包含推荐设置
- 📚 **示例集成** - 可执行示例用于验证

## 使用方法

```
创建一个 [领域] 技能，专注于 [核心能力]
```

```
将这个专家知识转化为 Claude Code 技能
```

## 输出结构

生成的技能包含：

```
skills/[skill-name]/
├── SKILL.md          # 主技能定义
├── config/           # 可选配置
├── tips/             # 专业技巧
├── references/       # 外部资源
└── cookbook/         # 示例和模式
```

## 技能格式

### SKILL.md 结构

```yaml
---
name: skill-name
description: 简短描述
license: MIT
---

# 技能名称

## 概述
技能用途及目标用户

## 快速启动
常用命令和用例

## 功能特性
详细功能说明

## 最佳实践
推荐模式和方法

## 示例
可执行示例
```

## 最佳实践

1. **专注领域** - 每个技能聚焦单一领域
2. **可执行示例** - 提供可直接运行的命令
3. **渐进复杂度** - 从简单用例开始
4. **参考集成** - 链接到权威文档

## 相关技能

- [mcp-to-skill](./mcp-to-skill) - MCP 服务器转技能
- [skill-manager](./skill-manager) - 技能生命周期管理
- [github-to-skills](./github-to-skills) - GitHub 仓库转技能
