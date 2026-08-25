# goal-meta-skill

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Turn vague or complex agent tasks into project-aware, verifiable `/goal` commands and optional approved root `GOAL.md` handoff contracts for Claude Code, Codex, Grok Build, Oh My Pi, and Kimi Code.

## 触发场景

- Turn vague or complex agent tasks into project-aware, verifiable `/goal` commands and optional approved root `GOAL.md` handoff contracts for Claude Code, Codex, Grok Build, Oh My Pi, and Kimi Code
- Use for Goal 指令, 目标指令, `/goal` prompts, 中文 Goal 模板, goal 持久化/保存/落盘, fresh-Agent or 跨会话交接, plan-to-goal interviews, bounded agent work definitions, Trellis 任务实施, 子任务实施, commit-then-archive cadence, or 终稿展示

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `goal-meta-skill` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `0.6.0` |
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
| `skills/developer-tools-integrations/goal-meta-skill/references` | 目录 | 6 | 引用资料 |
| `skills/developer-tools-integrations/goal-meta-skill/reports` | 目录 | 1 | 顶层目录 |
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
