# 简介

AI Skills Hub 是一个跨平台的 AI CLI 资源管理器，为 Claude Code、Codex CLI、Gemini CLI、Qwen Code 等多个平台提供统一的技能、命令和提示词管理。

## 什么是技能？

技能是可复用的 AI 指令模块，用于增强 Claude Code 在特定领域的能力。每个技能通过 `SKILL.md` 文件定义，包含：

- AI 的清晰指令
- 领域特定知识
- 最佳实践和模式
- 可选的辅助文件（配置、提示、参考）

## 核心特性

- **模块化设计** - 每个技能独立且专注于特定任务
- **简单安装** - 简单的 CLI 命令或现代化 TUI 界面
- **更新检测** - 自动检测过期的安装
- **跨平台** - 支持 Linux、macOS 和 Windows
- **多目标** - 支持 Claude Code、Codex CLI、Gemini、Qwen、Antigravity 和 Windsurf
- **中文支持** - TUI 完整支持中文字符

## 可用技能

| 技能 | 描述 |
|------|------|
| article-cover | 生成专业的 SVG 封面图 |
| codex | Codex CLI 集成，支持代码分析 |
| excalidraw | 创建手绘风格图表 |
| frontend-design | 构建生产级前端界面 |
| gemini-image | 通过 Gemini API 生成图像 |
| research | 技术研究，支持引用 |
| interview-plan | 苏格拉底式访谈细化需求，生成可执行计划 |
| tech-blog | 撰写技术博客 |
| tech-design-doc | 生成技术设计文档 |

## 下一步

- [安装](/zh/guide/installation) - 设置 AI Skills Hub
- [命令](/zh/guide/commands) - 了解可用的 CLI 命令
- [创建技能](/zh/guide/creating-skills) - 构建自己的技能
