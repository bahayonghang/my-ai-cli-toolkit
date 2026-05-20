# cold-shower

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Challenge ideas, requirements, technical plans, products, pricing, markets, pitch/BP narratives, and major personal decisions with a no-flattery adversarial review.

## 触发场景

- the user asks for 泼冷水, 挑刺, 骂我, 给我泼盆冷水, 假设你是我的对手, 帮我 challenge 一下, 我这个想法有什么问题, 哪里会崩, 魔鬼代言人, devil's advocate, challenge assumptions, 别夸我, hidden assumptions, failure modes, overengineering, missing evidence, or kill criteria before implementation or commitment

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `cold-shower` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.2.0` |
| 标签 | `decision-review`, `devil-advocate`, `assumptions`, `planning`, `product`, `risk` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills --skill cold-shower
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `content/skills/development-workflows/cold-shower/agents` | 目录 | 1 | 配套 agent |
| `content/skills/development-workflows/cold-shower/evals` | 目录 | 1 | 评测样例 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `content/skills/development-workflows/cold-shower/agents` | 配套 agent |
| evals | `content/skills/development-workflows/cold-shower/evals` | 评测样例 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `content/skills/development-workflows/cold-shower/SKILL.md`
- `content/skills/development-workflows/cold-shower`
