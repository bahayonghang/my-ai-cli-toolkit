# archive-planning

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Archive root-level planning files (`task_plan.md`, `findings.md`, and `progress.md`) into a timestamped `.plannings/` directory for the current feature.

## 触发场景

- Codex should run `$archive-planning [feature-name]`, close out an active plan, preserve completed planning context, or replace the deprecated Codex prompt workflow with a deterministic skill script

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `archive-planning` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `0.1.0` |
| 标签 | `codex`, `planning`, `archive`, `project-state` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill archive-planning
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/archive-planning/evals` | 目录 | 1 | 评测样例 |
| `skills/developer-tools-integrations/archive-planning/scripts` | 目录 | 1 | 可执行脚本 |
| `skills/developer-tools-integrations/archive-planning/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| evals | `skills/developer-tools-integrations/archive-planning/evals` | 评测样例 |
| scripts | `skills/developer-tools-integrations/archive-planning/scripts` | 可执行脚本 |
| tests | `skills/developer-tools-integrations/archive-planning/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just node-test
just ci
```

## 源码路径

- `skills/developer-tools-integrations/archive-planning/SKILL.md`
- `skills/developer-tools-integrations/archive-planning`
