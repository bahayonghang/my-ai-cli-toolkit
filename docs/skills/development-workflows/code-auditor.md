# code-auditor

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Structured code review across correctness, security, performance, readability, testing, and architecture, with language-specific guidance and human-readable findings.

## 触发场景

- the user asks to review a PR, inspect git changes before merge, audit a directory or file set, prepare merge feedback, summarize review findings, or do code review / PR review / CR / review comments / 代码审查
- Adapt the output language to the user's context: use Chinese review wording for Chinese or mixed Chinese discussions, and English review wording for English-first discussions

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `code-auditor` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.2.0` |
| 标签 | `code-review`, `quality-assurance`, `security`, `performance`, `best-practices`, `testing`, `multi-language` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills --skill code-auditor
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `content/skills/development-workflows/code-auditor/assets` | 目录 | 4 | 素材资源 |
| `content/skills/development-workflows/code-auditor/evals` | 目录 | 1 | 评测样例 |
| `content/skills/development-workflows/code-auditor/references` | 目录 | 22 | 引用资料 |
| `content/skills/development-workflows/code-auditor/scripts` | 目录 | 3 | 可执行脚本 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| assets | `content/skills/development-workflows/code-auditor/assets` | 素材资源 |
| evals | `content/skills/development-workflows/code-auditor/evals` | 评测样例 |
| references | `content/skills/development-workflows/code-auditor/references` | 引用资料 |
| scripts | `content/skills/development-workflows/code-auditor/scripts` | 可执行脚本 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `content/skills/development-workflows/code-auditor/SKILL.md`
- `content/skills/development-workflows/code-auditor`
