# uv-workflow

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Use when a coding agent needs to run Python code, modules, one-liners, tools, tests, or standalone scripts through uv, or create and maintain PEP 723 scripts with uv init/add/remove --script.

## 触发场景

- a coding agent needs to run Python code, modules, one-liners, tools, tests, or standalone scripts through uv, or create and maintain PEP 723 scripts with uv init/add/remove --script
- Avoid direct python/python3 shell entrypoints

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `uv-workflow` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `0.1.0` |
| 标签 | `uv`, `python`, `scripts`, `dependencies`, `tooling` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill uv-workflow
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/uv-workflow/agents` | 目录 | 1 | 配套 agent |
| `skills/developer-tools-integrations/uv-workflow/evals` | 目录 | 1 | 评测样例 |
| `skills/developer-tools-integrations/uv-workflow/references` | 目录 | 1 | 引用资料 |
| `skills/developer-tools-integrations/uv-workflow/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/developer-tools-integrations/uv-workflow/agents` | 配套 agent |
| evals | `skills/developer-tools-integrations/uv-workflow/evals` | 评测样例 |
| references | `skills/developer-tools-integrations/uv-workflow/references` | 引用资料 |
| tests | `skills/developer-tools-integrations/uv-workflow/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just node-test
just ci
```

## 源码路径

- `skills/developer-tools-integrations/uv-workflow/SKILL.md`
- `skills/developer-tools-integrations/uv-workflow`
