# My Claude Code Settings

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

跨平台 AI 内容仓库：可安装 skills、平台级 commands/agents/prompts/rules，以及运行时 hooks。

仓库在根目录直接组织内容：

- `skills/`：一方技能目录
- `platforms/<platform>/`：平台级 commands、agents、prompts、rules
- `platforms/claude/hooks/`：Claude Code 运行时 hook 资源
- `scripts/`：共享的校验与维护脚本

## 快速开始

### 直接从 GitHub 安装 skills

只是想安装 skills 的话，不需要克隆本仓库。

直接安装一方 skills catalog：

```bash
npx skills add bahayonghang/my-claude-code-settings/skills
```

把全部一方 skills 无交互式安装到指定 Agent：

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill '*' -g -y -a universal -a antigravity -a claude-code -a kiro-cli -a qwen-code -a trae -a trae-cn
```

### 用 skills-manage 管理 skills

如果你更习惯桌面界面管理 skills，直接用 [skills-manage](https://github.com/iamzhihuix/skills-manage)。

它可以统一管理 `~/.agents/skills/` 共享目录，从 GitHub 导入 skills，并把 skills 安装或链接到已支持的 agent 客户端。

本仓库的 `skills/` 可作为一方 skills 源使用。

### 本地校验时再克隆

只有当你要在本地校验或贡献修改时，才需要克隆仓库：

```bash
git clone https://github.com/bahayonghang/my-claude-code-settings.git
cd my-claude-code-settings

just ci
```

`just ci` 会执行 skills 元数据校验、Python 编译检查、Node 技能测试和 `git diff --check`。

## 仓库结构

```text
.
├── skills/             # 一方技能目录
│   └── <category>/<skill-name>/
├── platforms/
│   └── <platform>/
│       ├── commands/   # 平台 command / workflow 源（存在时）
│       ├── agents/     # 平台 agent 定义（存在时）
│       ├── prompts/    # 平台 prompt packs（存在时）
│       ├── rules/      # 平台基础指导文件（存在时）
│       └── hooks/      # 运行时 hook 资源（当前位于 platforms/claude/ 下）
├── scripts/            # 共享的校验与维护脚本
└── justfile            # 本地校验入口
```

## 当前技能分类

`skills/` 下的一方 catalog 当前使用以下分类目录：

- `development-workflows`
- `developer-tools-integrations`
- `git-github-collaboration`
- `docs-writing-publishing`
- `research-learning-knowledge`

## 平台内容

平台专属源文件位于 `platforms/<platform>/`。消费本仓库的运行时工具负责安装或链接目标解析，因此仓库内不再维护单独的 `platforms.toml` 映射文件。

## License

MIT
