# file-sorter

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Use when the user wants to categorize, sort, organize, or suggest renames for files in a local folder such as Downloads, or for files that share one parent directory.

## 触发场景

- the user wants to categorize, sort, organize, or suggest renames for files in a local folder such as Downloads, or for files that share one parent directory
- Builds a review plan with stable file-family categories, optional whitelist, project-root protection, and dry-run apply
- moves or renames only after explicit approval of that plan
- Use for 整理文件, 分类归档, Downloads 整理, 重命名建议, 审阅后再移动

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `file-sorter` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `0.1.0` |
| 标签 | `files`, `organize`, `categorize`, `rename`, `dry-run` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill file-sorter
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/file-sorter/agents` | 目录 | 1 | 配套 agent |
| `skills/developer-tools-integrations/file-sorter/evals` | 目录 | 2 | 评测样例 |
| `skills/developer-tools-integrations/file-sorter/LICENSE` | 文件 | 1 | 顶层目录 |
| `skills/developer-tools-integrations/file-sorter/manifest.json` | 文件 | 1 | 顶层文件 |
| `skills/developer-tools-integrations/file-sorter/README.md` | 文件 | 1 | 顶层文件 |
| `skills/developer-tools-integrations/file-sorter/references` | 目录 | 4 | 引用资料 |
| `skills/developer-tools-integrations/file-sorter/reports` | 目录 | 5 | 顶层目录 |
| `skills/developer-tools-integrations/file-sorter/scripts` | 目录 | 1 | 可执行脚本 |
| `skills/developer-tools-integrations/file-sorter/security` | 目录 | 1 | 顶层目录 |
| `skills/developer-tools-integrations/file-sorter/tests` | 目录 | 1 | 自动化测试 |
| `skills/developer-tools-integrations/file-sorter/THIRD_PARTY_NOTICES.md` | 文件 | 1 | 顶层文件 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/developer-tools-integrations/file-sorter/agents` | 配套 agent |
| evals | `skills/developer-tools-integrations/file-sorter/evals` | 评测样例 |
| references | `skills/developer-tools-integrations/file-sorter/references` | 引用资料 |
| scripts | `skills/developer-tools-integrations/file-sorter/scripts` | 可执行脚本 |
| tests | `skills/developer-tools-integrations/file-sorter/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just node-test
just ci
```

## 源码路径

- `skills/developer-tools-integrations/file-sorter/SKILL.md`
- `skills/developer-tools-integrations/file-sorter`
