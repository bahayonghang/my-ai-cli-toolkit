# document-writer

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Write or update technical documentation grounded in the real codebase.

## 触发场景

- the user asks for README, API docs, architecture guides, user guides, CONTRIBUTING docs, migration notes, or JSDoc/code comments, or wants technical docs rewritten into natural Chinese with correct terminology
- Not for general prose, marketing or social copy, or non-technical localization

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
| `skills/docs-writing-publishing/document-writer/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| evals | `skills/docs-writing-publishing/document-writer/evals` | 评测样例 |
| references | `skills/docs-writing-publishing/document-writer/references` | 引用资料 |
| tests | `skills/docs-writing-publishing/document-writer/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just node-test
just ci
```

## 源码路径

- `skills/docs-writing-publishing/document-writer/SKILL.md`
- `skills/docs-writing-publishing/document-writer`
