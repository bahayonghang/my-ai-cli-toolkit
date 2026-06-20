# geju

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Use when the user explicitly asks to think bigger, open up the design space, challenge conservative design, avoid over-indexing on backward compatibility, escape local-detail fixation, or make a bold high-level product or architecture direction call.

## 触发场景

- the user explicitly asks to think bigger, open up the design space, challenge conservative design, avoid over-indexing on backward compatibility, escape local-detail fixation, or make a bold high-level product or architecture direction call
- Use for strategic reframing, not for ordinary code review, PRD writing, implementation planning, or adversarial risk review

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `geju` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `strategy`, `architecture`, `product-direction`, `design-judgment`, `compatibility` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill geju
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/geju/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/geju/evals` | 目录 | 1 | 评测样例 |
| `skills/development-workflows/geju/references` | 目录 | 1 | 引用资料 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/development-workflows/geju/agents` | 配套 agent |
| evals | `skills/development-workflows/geju/evals` | 评测样例 |
| references | `skills/development-workflows/geju/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/geju/SKILL.md`
- `skills/development-workflows/geju`
