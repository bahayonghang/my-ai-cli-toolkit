# document-writer

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Write or update technical documentation from the real codebase and project files.

## 触发场景

- the user asks for README, API docs, architecture guides, user guides, CONTRIBUTING docs, migration notes, or JSDoc/code comments, and also when they want technical documentation rewritten into natural Chinese with correct terminology and formatting

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `document-writer` |
| 分类 | `docs-writing-publishing` (文档写作与发布) |
| 版本 | `1.0.0` |
| 标签 | `documentation`, `technical-writing`, `readme`, `api-docs`, `architecture`, `user-guide`, `contributing`, `jsdoc`, `chinese-docs` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill document-writer
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/docs-writing-publishing/document-writer/evals` | 目录 | 1 | 评测样例 |
| `skills/docs-writing-publishing/document-writer/references` | 目录 | 4 | 引用资料 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| evals | `skills/docs-writing-publishing/document-writer/evals` | 评测样例 |
| references | `skills/docs-writing-publishing/document-writer/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/docs-writing-publishing/document-writer/SKILL.md`
- `skills/docs-writing-publishing/document-writer`
