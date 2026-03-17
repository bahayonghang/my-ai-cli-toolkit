# 简介

本站文档以当前仓库 [`my-claude-code-settings`](https://github.com/bahayonghang/my-claude-code-settings) 的真实结构为准，不再沿用历史模板项目里的旧目录模型。

## 仓库里实际有什么

- `content/skills/`：按分类组织的可安装技能目录
- `content/commands/`：不同平台的 slash command / workflow 源文件
- `content/agents/`：分为 `ccw` 和 `specialist` 两组的 agent 定义
- `content/skills/external-skills/`：供 MCS Web 使用的外部技能注册表元数据
- `content/hooks/` 与 `content/memorys/`：运行时支持文件
- `mcs/`：Rust workspace，包含共享核心库、TUI 和 Web 应用

## 推荐入口

### 使用 MCS TUI

```bash
just mcs
```

- 适合查看 source 与 installed 状态、做 diff、批量安装和多平台同步。

[打开 TUI 指南 →](/zh/guide/mcs)

### 使用 MCS Web

```bash
just web
```

- 同时启动 Axum 后端和 React 前端。
- 适合浏览安装目标、查看详情抽屉和 Web 端 catalog。

[打开 MCS Web 指南 →](/zh/guide/mcs-web)

### 直接安装技能目录

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills
```

- 适合只想快速获取 skills catalog 的场景。
- 不会替代仓库级的 MCS、command catalog 和 runtime 说明。

## 文档地图

- [安装](/zh/guide/installation)：克隆、运行、构建、平台路径
- [MCS TUI](/zh/guide/mcs)：快捷键、安装模型、迁移、排错
- [MCS Web](/zh/guide/mcs-web)：后端/UI 启动、页面结构、安装流程
- [MCS 架构](/zh/guide/mcs-architecture)：`mcs-core`、`mcs-tui`、`mcs-web`
- [命令系统](/zh/guide/commands)：`content/commands` 如何映射到各平台
- [运行时文件](/zh/guide/runtime-files)：hooks、memory/runtime 文件、prompt 相关资源
- [外部技能](/zh/guide/external-skills)：第三方技能注册表与安装流程
- [创建技能](/zh/guide/creating-skills)：新增 `content/skills/<category>/<skill-name>/`

## 关于历史页面

旧页面里可能还会出现 `my-claude-skills`、`skills/`、`install.sh`、`install.ps1`、`src/install.py` 等历史说法。当前文档已经把这些内容降级为兼容说明，不再把它们当作仓库现状。
