# renhua

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Chinese public-writing editor for AI/tech posts, X/Twitter threads, product notes, model reviews, and public technical essays.

## 触发场景

- the user asks to 去AI味, 改得像本人, 写推特post, 精修中文AI技术文章, or remove AI-flavored shells while preserving facts, judgment, technical terms, lived experience, and author voice

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `renhua` |
| 分类 | `docs-writing-publishing` (文档写作与发布) |
| 版本 | `1.0.0` |
| 标签 | `chinese-writing`, `public-writing`, `ai-tells`, `technical-writing`, `social-posts`, `product-notes`, `model-reviews` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill renhua
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/docs-writing-publishing/renhua/agents` | 目录 | 1 | 配套 agent |
| `skills/docs-writing-publishing/renhua/evals` | 目录 | 1 | 评测样例 |
| `skills/docs-writing-publishing/renhua/references` | 目录 | 1 | 引用资料 |
| `skills/docs-writing-publishing/renhua/scripts` | 目录 | 1 | 可执行脚本 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/docs-writing-publishing/renhua/agents` | 配套 agent |
| evals | `skills/docs-writing-publishing/renhua/evals` | 评测样例 |
| references | `skills/docs-writing-publishing/renhua/references` | 引用资料 |
| scripts | `skills/docs-writing-publishing/renhua/scripts` | 可执行脚本 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/docs-writing-publishing/renhua/SKILL.md`
- `skills/docs-writing-publishing/renhua`
