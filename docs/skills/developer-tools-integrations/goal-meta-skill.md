# goal-meta-skill

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Use when the user explicitly asks to use Goal mode or to author, save, or manage a Goal for Claude Code, Codex, Grok Build, Oh My Pi, or Kimi Code.

## 触发场景

- the user explicitly asks to use Goal mode or to author, save, or manage a Goal for Claude Code, Codex, Grok Build, Oh My Pi, or Kimi Code
- Requests may say `/goal`, Goal 指令, 目标指令, Goal 模式, "用 Goal 模式完成", or "写成 Codex 目标指令"
- the literal command is not required
- Compile project-aware, verifiable Goal text, optionally save an approved root `GOAL.md` contract, or show the correct command for an existing Goal

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `goal-meta-skill` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `0.8.2` |
| 标签 | `codex`, `claude-code`, `grok`, `kimi-code`, `goal`, `prompt-engineering`, `agent-skills`, `verification` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill goal-meta-skill
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/goal-meta-skill/agents` | 目录 | 1 | 配套 agent |
| `skills/developer-tools-integrations/goal-meta-skill/evals` | 目录 | 1 | 评测样例 |
| `skills/developer-tools-integrations/goal-meta-skill/references` | 目录 | 7 | 引用资料 |
| `skills/developer-tools-integrations/goal-meta-skill/reports` | 目录 | 3 | 顶层目录 |
| `skills/developer-tools-integrations/goal-meta-skill/scripts` | 目录 | 2 | 可执行脚本 |
| `skills/developer-tools-integrations/goal-meta-skill/tests` | 目录 | 2 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/developer-tools-integrations/goal-meta-skill/agents` | 配套 agent |
| evals | `skills/developer-tools-integrations/goal-meta-skill/evals` | 评测样例 |
| references | `skills/developer-tools-integrations/goal-meta-skill/references` | 引用资料 |
| scripts | `skills/developer-tools-integrations/goal-meta-skill/scripts` | 可执行脚本 |
| tests | `skills/developer-tools-integrations/goal-meta-skill/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just node-test
just ci
```

## 源码路径

- `skills/developer-tools-integrations/goal-meta-skill/SKILL.md`
- `skills/developer-tools-integrations/goal-meta-skill`
