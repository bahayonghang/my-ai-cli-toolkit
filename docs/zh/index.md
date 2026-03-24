---
layout: home
hero:
  name: My Claude Code Settings
  text: 跨平台 AI 内容仓库与 MCS 工作区
  tagline: 文档直接对齐当前仓库中的 `content/` 与 `mcs/` 结构，覆盖 skills、commands、runtime files，以及 Rust TUI/Web 管理器。
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/
    - theme: alt
      text: 浏览技能
      link: /zh/skills/
    - theme: alt
      text: MCS 文档
      link: /zh/guide/mcs
    - theme: alt
      text: GitHub
      link: https://github.com/bahayonghang/my-claude-code-settings

features:
  - icon: 🧭
    title: 对齐真实仓库结构
    details: 文档以当前的 `content/skills`、`content/platforms/*/{commands,agents,guidance}`、`content/hooks` 和 `mcs/` 为准，其中外部注册表文件位于 `content/skills/`。
  - icon: 🦀
    title: MCS TUI 与 Web
    details: 说明 `mcs-core`、`mcs-tui`、`mcs-web` 的职责划分，以及内容发现、安装、diff、同步的工作流。
  - icon: 📚
    title: 技能目录
    details: 技能页只围绕当前可安装的 `content/skills` 条目，不再把旧模板页当作真实目录展示。
  - icon: 🔌
    title: Runtime 与外部内容
    details: 除主技能库外，还覆盖 hooks、memory/runtime 文件以及 community-skills-registry 注册表。
---
