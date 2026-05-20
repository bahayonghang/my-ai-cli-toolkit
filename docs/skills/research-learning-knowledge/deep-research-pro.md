# deep-research-pro

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Multi-source deep research skill for current-topic investigation, comparison, and cited report writing.

## 触发场景

- the user asks to research, compare, or deep-dive a topic with current web sources and citations, including phrases like research, deep dive, latest, 调研, 做个深度研究, or 带来源总结

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `deep-research-pro` |
| 分类 | `research-learning-knowledge` (研究、学习与知识) |
| 版本 | `1.0.0` |
| 标签 | `research`, `web`, `citations`, `synthesis`, `report-writing`, `current-events` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills --skill deep-research-pro
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `content/skills/research-learning-knowledge/deep-research-pro/_meta.json` | 文件 | 1 | 顶层文件 |
| `content/skills/research-learning-knowledge/deep-research-pro/package.json` | 文件 | 1 | 顶层文件 |
| `content/skills/research-learning-knowledge/deep-research-pro/README.md` | 文件 | 1 | 顶层文件 |
| `content/skills/research-learning-knowledge/deep-research-pro/test-prompts.json` | 文件 | 1 | 顶层文件 |

## 脚本、引用与测试资源

未检测到专门的 `scripts`、`references`、`tests` 或其他常见资源目录。

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `content/skills/research-learning-knowledge/deep-research-pro/SKILL.md`
- `content/skills/research-learning-knowledge/deep-research-pro`
