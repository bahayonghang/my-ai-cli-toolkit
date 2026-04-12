# MCP to Skill

将 MCP (Model Context Protocol) 服务器转换为 Claude Code 技能。

## 概述

MCP-to-Skill 技能用于将现有的 MCP 服务器转换为格式规范的 Claude Code 技能。它分析 MCP 服务器的工具、资源和提示，生成对应的技能文档和指导说明。

## 功能特性

- 🔍 **自动发现** - 从 MCP 服务器 manifest 中提取工具和资源
- 📝 **文档生成** - 创建完整的 SKILL.md 文档
- 🔧 **配置映射** - 将 MCP 配置转换为技能配置
- 📋 **用例生成** - 基于工具能力生成常见用例
- ⚡ **快速启动** - 提供即用命令模板

## 使用方法

```
将这个 MCP 服务器转换为 Claude Code 技能
```

```
从 @mcp-server-xxx 创建技能文档
```

## 转换流程

1. **分析 MCP 服务器**
   - 读取服务器 manifest
   - 提取工具定义
   - 识别资源端点

2. **生成技能结构**
   - 创建 SKILL.md 主文件
   - 编写工具使用指南
   - 添加配置模板

3. **验证和优化**
   - 测试生成的命令
   - 添加示例和最佳实践

## 输出格式

```
skills/[mcp-name]/
├── SKILL.md          # 主技能定义
├── config/
│   └── settings.json # MCP 配置映射
├── tips/
│   └── usage.md      # 使用技巧
└── cookbook/
    └── examples.md   # 常见用例
```

## 支持的 MCP 特性

| 特性 | 支持状态 |
|------|----------|
| 工具 (Tools) | ✅ |
| 资源 (Resources) | ✅ |
| 提示 (Prompts) | ✅ |
| 采样 (Sampling) | ⚠️ 部分支持 |

## 相关技能

- [skill-manager](./skill-manager) - 技能生命周期管理
- [claude-expert-skill-creator](./claude-expert-skill-creator) - 专家技能创建
