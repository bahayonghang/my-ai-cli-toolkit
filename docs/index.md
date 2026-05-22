---
layout: home

hero:
  name: My Claude Code Settings
  text: 跨平台 AI 内容仓库
  tagline: 管理可安装 skills、平台级 commands / prompts / agents / rules，以及运行时 hooks。
  actions:
    - theme: brand
      text: 浏览 Skills
      link: /skills
    - theme: alt
      text: 查看 Hooks
      link: /hooks

features:
  - title: 根级工作区
    details: skills/ platforms/ scripts/ 三个工作区直接挂在仓库根；docs/ 只负责说明和导航，不改变现有安装或运行逻辑。
  - title: 平台分层
    details: Antigravity 与 Claude 使用 commands；Codex 可复用工作流优先使用 skills，平台目录保留 agents、rules 与少量遗留 prompts。
  - title: 本地可验证
    details: 使用 just ci 校验 skills 元数据、Python 脚本、Node 测试和空白问题。
---

## 首版范围

这个文档站说明当前仓库的三个核心区域：

- `platforms/claude/hooks/`：Claude Code hook 配置与脚本。
- `platforms/`：不同 agent 平台的 commands、prompts、agents、rules。
- `skills/`：按分类组织的一方 skill catalog。

## 本地运行

```bash
npm --prefix docs install
just docs
```

`docs/` 是独立 VitePress 项目；仓库根目录继续不需要 `package.json`。

## 验证入口

```bash
just skills-check
just python-check
just node-test
just ci
```
