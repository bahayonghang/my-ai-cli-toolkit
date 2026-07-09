# roundtable

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Multi-perspective roundtable discussion — a truth-seeking moderator plus a small set of representative real figures explore one topic through disciplined debate.

## 触发场景

- Multi-perspective roundtable discussion — a truth-seeking moderator plus a small set of representative real figures explore one topic through disciplined debate
- Use for 圆桌讨论, roundtable, 多人物观点碰撞, 让几位思想家讨论, 结构化辩论探索
- Not for ordinary argumentative writing, pros/cons lists, or single-speaker explanation

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `roundtable` |
| 分类 | `research-learning-knowledge` (研究、学习与知识) |
| 版本 | `2.0.1` |
| 标签 | `roundtable`, `debate`, `multi-perspective`, `philosophy`, `knowledge-network`, `org-mode` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill roundtable
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/research-learning-knowledge/roundtable/evals` | 目录 | 1 | 评测样例 |
| `skills/research-learning-knowledge/roundtable/references` | 目录 | 1 | 引用资料 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| evals | `skills/research-learning-knowledge/roundtable/evals` | 评测样例 |
| references | `skills/research-learning-knowledge/roundtable/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/research-learning-knowledge/roundtable/SKILL.md`
- `skills/research-learning-knowledge/roundtable`
