# bidwriter

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

智能标书编写专家，专精工程咨询、建筑设计、市政工程领域的投标文件编写。

## 触发场景

- 智能标书编写专家，专精工程咨询、建筑设计、市政工程领域的投标文件编写。 当用户提到：标书、投标、招标、投标文件、技术标、商务标、招标响应、投标方案、 bid document、bid proposal、tender、proposal writing、编写标书、写标书、 招标文件分析、评分标准优化 时使用此技能。

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `bidwriter` |
| 分类 | `docs-writing-publishing` (文档写作与发布) |
| 版本 | 未声明 |
| 标签 | `bidwriting`, `tender`, `proposal`, `engineering`, `construction`, `municipal`, `标书`, `投标` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill bidwriter
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/docs-writing-publishing/bidwriter/references` | 目录 | 4 | 引用资料 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| references | `skills/docs-writing-publishing/bidwriter/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/docs-writing-publishing/bidwriter/SKILL.md`
- `skills/docs-writing-publishing/bidwriter`
