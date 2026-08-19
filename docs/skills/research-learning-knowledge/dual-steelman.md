# dual-steelman

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Bidirectional steelman deep-thinking protocol for one pending decision, stance, or contested choice.

## 触发场景

- Bidirectional steelman deep-thinking protocol for one pending decision, stance, or contested choice
- Restates the user's real problem in its strongest form, steelmans both the user's current position and its opposition (or every candidate option), names the true crux and the decisive variables, asks exactly one key question and stops, then returns a committed verdict with reasons and next actions after the user answers
- Use for 双向钢人论证, 钢人论证, steelman, 帮我想清楚, 要不要 / 该不该 / 选哪个类决策, 纠结拿不定主意, 深度思考一个决定, 挑战我的想法, 别顺着我说
- Not for multi-figure open discussion (roundtable), cited web research (deep-research-pro / web-research), red-teaming a document's assumptions, factual questions, or tasks the user wants directly executed

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `dual-steelman` |
| 分类 | `research-learning-knowledge` (研究、学习与知识) |
| 版本 | `0.1.0` |
| 标签 | `steelman`, `decision`, `critical-thinking`, `anti-sycophancy`, `deep-thinking` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill dual-steelman
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/research-learning-knowledge/dual-steelman/evals` | 目录 | 1 | 评测样例 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| evals | `skills/research-learning-knowledge/dual-steelman/evals` | 评测样例 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/research-learning-knowledge/dual-steelman/SKILL.md`
- `skills/research-learning-knowledge/dual-steelman`
