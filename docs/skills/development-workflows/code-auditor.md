# code-auditor

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Independent pre-merge review of a git diff, PR, or named files.

## 触发场景

- the user asks to review a PR, inspect current git changes, or hunt functional regressions, missed scenarios, wrong assumptions, concurrency bugs, and test gaps as an independent reviewer who does not defend the author's approach / 独立审查、功能回归、遗漏场景、错误假设、并发、测试盲区
- Also use for a full-spectrum multi-dimension project audit across correctness, security, performance, readability, testing, and architecture / 全维度代码审计 / 全维度的代码审计
- Not for maintainability-only or structure/refactoring reviews
- not for applying code changes

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `code-auditor` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.4.0` |
| 标签 | `code-review`, `quality-assurance`, `security`, `performance`, `best-practices`, `testing`, `multi-language` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill code-auditor
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/code-auditor/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/code-auditor/assets` | 目录 | 5 | 素材资源 |
| `skills/development-workflows/code-auditor/evals` | 目录 | 1 | 评测样例 |
| `skills/development-workflows/code-auditor/references` | 目录 | 23 | 引用资料 |
| `skills/development-workflows/code-auditor/scripts` | 目录 | 3 | 可执行脚本 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/development-workflows/code-auditor/agents` | 配套 agent |
| assets | `skills/development-workflows/code-auditor/assets` | 素材资源 |
| evals | `skills/development-workflows/code-auditor/evals` | 评测样例 |
| references | `skills/development-workflows/code-auditor/references` | 引用资料 |
| scripts | `skills/development-workflows/code-auditor/scripts` | 可执行脚本 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/code-auditor/SKILL.md`
- `skills/development-workflows/code-auditor`
