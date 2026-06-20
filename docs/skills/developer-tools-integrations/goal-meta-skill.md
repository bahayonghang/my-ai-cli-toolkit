# goal-meta-skill

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Turn vague or complex Codex tasks into strong `/goal` commands with outcome, verification, constraints, boundaries, iteration policy, completion evidence, and pause/block conditions.

## 触发场景

- the user asks for Codex goal instructions, Goal 指令, 目标指令, `/goal` prompts, 中文 Goal 模板, plan-to-goal interviews, success criteria, verification commands, or bounded agent work definitions

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `goal-meta-skill` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `0.1.0` |
| 标签 | `codex`, `goal`, `prompt-engineering`, `agent-skills`, `verification` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill goal-meta-skill
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/goal-meta-skill/agents` | 目录 | 1 | 配套 agent |
| `skills/developer-tools-integrations/goal-meta-skill/evals` | 目录 | 1 | 评测样例 |
| `skills/developer-tools-integrations/goal-meta-skill/README.md` | 文件 | 1 | 顶层文件 |
| `skills/developer-tools-integrations/goal-meta-skill/references` | 目录 | 3 | 引用资料 |
| `skills/developer-tools-integrations/goal-meta-skill/scripts` | 目录 | 1 | 可执行脚本 |
| `skills/developer-tools-integrations/goal-meta-skill/tests` | 目录 | 1 | 自动化测试 |

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
