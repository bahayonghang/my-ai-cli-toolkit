# 简介

本站文档以当前仓库 [`my-claude-code-settings`](https://github.com/bahayonghang/my-claude-code-settings) 的真实结构为准，不再沿用历史模板项目里的旧目录模型。

## 仓库里实际有什么

- `content/skills/`：按分类组织的可安装技能目录
- `content/platforms/<platform>/commands/`：平台级 command / workflow 源文件
- `content/platforms/claude/agents/`：按 `ccw` 与 `specialist` 分组的 Claude agent 定义
- `content/platforms/<platform>/guidance/`：平台级指导文件种子，如 `CLAUDE.md`、`AGENTS.md`
- `content/skills/external-skills/`：供 MCS Web 使用的外部技能注册表元数据
- `content/hooks/`：运行时支持文件
- `mcs/`：Rust workspace，包含共享核心库、TUI 和 Web 应用

## 推荐入口

### 直接从 GitHub 安装 skills

```bash
# macOS / Linux
bash <(curl -fsSL https://raw.githubusercontent.com/bahayonghang/my-claude-code-settings/main/tools/scripts/skills-install/skills-install.sh)
```

```powershell
# Windows PowerShell
irm https://raw.githubusercontent.com/bahayonghang/my-claude-code-settings/main/tools/scripts/skills-install/skills-install.ps1 | iex
```

- 适合想在终端里交互式安装，又不想克隆仓库的场景。
- 同时支持一方 GitHub 安装和 `external-skills` 三方安装，并会先识别已安装技能。

### 直接安装一方 skills catalog

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills
```

- 适合只想快速获取一方 skills catalog 的场景。
- 不会替代仓库级的 MCS、command catalog 和 runtime 说明。

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

### 克隆仓库后使用本地安装包装命令

```bash
just skills-install
just skills-install-ps1
```

- 这是对同一套安装脚本的本地包装入口。
- 只有在仓库已经克隆到本地时才有意义。

## 文档地图

- [安装](/zh/guide/installation)：远程直接安装、克隆后工作流、构建、平台路径
- [MCS TUI](/zh/guide/mcs)：快捷键、安装模型、迁移、排错
- [MCS Web](/zh/guide/mcs-web)：后端/UI 启动、页面结构、安装流程
- [MCS 架构](/zh/guide/mcs-architecture)：`mcs-core`、`mcs-tui`、`mcs-web`
- [命令系统](/zh/guide/commands)：`content/platforms/*/commands` 如何映射到各平台
- [运行时文件](/zh/guide/runtime-files)：hooks 与平台 guidance/runtime 文件
- [外部技能](/zh/guide/external-skills)：第三方技能注册表与安装流程
- [创建技能](/zh/guide/creating-skills)：新增 `content/skills/<category>/<skill-name>/`

## 关于历史页面

旧页面里可能还会出现 `my-claude-skills`、`skills/`、`install.sh`、`install.ps1`、`src/install.py` 等历史说法。当前文档已经把这些内容降级为兼容说明，不再把它们当作仓库现状。
