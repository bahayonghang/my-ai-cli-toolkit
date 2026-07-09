# goudi

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Ground an ambitious proposal into the smallest verifiable first move with stop rules — pressure-test feasibility, avoid over-grand designs, make a bold direction executable.

## 触发场景

- Ground an ambitious proposal into the smallest verifiable first move with stop rules — pressure-test feasibility, avoid over-grand designs, make a bold direction executable
- Trigger on 落地, 先落地, 别太飘, 收一收, 可执行, 可验证, 止损, or follow-ups after geju-style big-picture thinking
- Not for ordinary code review or implementation unless asked to ground or shrink the plan

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `goudi` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `execution-planning`, `feasibility`, `strategy`, `risk`, `scope-control` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill goudi
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/goudi/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/goudi/evals` | 目录 | 1 | 评测样例 |
| `skills/development-workflows/goudi/references` | 目录 | 1 | 引用资料 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/development-workflows/goudi/agents` | 配套 agent |
| evals | `skills/development-workflows/goudi/evals` | 评测样例 |
| references | `skills/development-workflows/goudi/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/goudi/SKILL.md`
- `skills/development-workflows/goudi`
