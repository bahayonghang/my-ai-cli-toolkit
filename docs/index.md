---
layout: home

hero:
  name: My Claude Code Settings
  text: 跨平台 AI 内容仓库
  tagline: 管理可安装 skills、平台源资产，以及 Claude Code 运行时 hooks。
  actions:
    - theme: brand
      text: 浏览 Skills
      link: /skills
    - theme: alt
      text: 查看 Hooks
      link: /hooks
    - theme: alt
      text: Harness 事实表
      link: /harnesses

features:
  - title: 根级工作区
    details: skills/ platforms/ scripts/ 三个工作区直接挂在仓库根；docs/ 只负责说明和导航，不改变现有安装或运行逻辑。
  - title: 平台源分层
    details: Claude 源是 agents/ 与 hooks/；Codex 源只有 agents/（没有 prompts/）；Antigravity 使用 commands/。静态安装映射不是新会话发现证明。
  - title: 本地可验证
    details: just ci 依次运行 docs-check、skills-check、python-check、python-test、install-projects-test、node-test，然后 git diff --check。
---

## 五套 Harness 能力边界

Claude Code、Codex、Grok Build、Kimi Code CLI、OMP 的原生指令根、skill 发现、hook/扩展、代理、权限与验证边界见 [Harness 事实表](/harnesses)。该页标注 official / repo contract / local probe / UNVERIFIED。客户端加载保持 UNVERIFIED。

Kimi 指当前 Kimi Code CLI，不是旧 kimi-cli。OMP 不借用 Pi 的能力结论。Goal 生命周期见 `skills/developer-tools-integrations/goal-meta-skill/references/platform-goal-facts.md`，不要复制那张表。

## 首版范围

这个文档站说明当前仓库的核心区域：

- `platforms/claude/agents/` 与 `platforms/claude/hooks/`：Claude Code agent 提示与 hook 配置、脚本。
- `platforms/codex/agents/`：Codex agent 模板；没有 `platforms/codex/prompts/`。
- `platforms/antigravity/commands/`：现有 Antigravity command 源。
- `skills/`：按分类组织的一方 skill catalog。

第三方 `npx skills add` 按该 CLI 的目标安装。克隆后的 `just install-projects` 是本地 live-link，默认写到项目 `.agents/skills/`，并且只在对应 agent 根目录已存在时额外链接。`scripts/install_projects.py` 里的 dest 映射不是新会话 discovery 证明。

## 本地运行

```bash
npm --prefix docs install
just docs
```

`docs/` 是独立 VitePress 项目；仓库根目录继续不需要 `package.json`。

## 验证入口

当前 `just ci` 顺序：

```bash
just docs-check
just skills-check
just python-check
just python-test
just install-projects-test
just node-test
git diff --check
```
