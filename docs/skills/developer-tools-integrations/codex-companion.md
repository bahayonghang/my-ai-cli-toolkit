# codex-companion

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Manage Codex background tasks, persistent job threads, adversarial code reviews, and job lifecycle (status, result, cancel) from inside any AI coding session.

## 触发场景

- the user wants to delegate work to Codex and check back later, run a security-focused or attack-minded code review, resume a previous Codex task, check on running Codex jobs
- Also use when the user mentions "background task", "Codex job", "adversarial review", "diff review", or wants Codex to keep working while they do something else

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `codex-companion` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `1.1.0` |
| 标签 | `codex`, `codex-cli`, `background-jobs`, `background-task`, `job-control`, `code-review`, `adversarial-review`, `security-review`, `diff-review`, `task-delegation`, `persistent-thread` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill codex-companion
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/codex-companion/prompts` | 目录 | 1 | 提示词 |
| `skills/developer-tools-integrations/codex-companion/README.md` | 文件 | 1 | 顶层文件 |
| `skills/developer-tools-integrations/codex-companion/references` | 目录 | 2 | 引用资料 |
| `skills/developer-tools-integrations/codex-companion/schemas` | 目录 | 1 | 数据结构 |
| `skills/developer-tools-integrations/codex-companion/scripts` | 目录 | 17 | 可执行脚本 |
| `skills/developer-tools-integrations/codex-companion/tests` | 目录 | 7 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| prompts | `skills/developer-tools-integrations/codex-companion/prompts` | 提示词 |
| references | `skills/developer-tools-integrations/codex-companion/references` | 引用资料 |
| schemas | `skills/developer-tools-integrations/codex-companion/schemas` | 数据结构 |
| scripts | `skills/developer-tools-integrations/codex-companion/scripts` | 可执行脚本 |
| tests | `skills/developer-tools-integrations/codex-companion/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just node-test
just ci
```

## 源码路径

- `skills/developer-tools-integrations/codex-companion/SKILL.md`
- `skills/developer-tools-integrations/codex-companion`
