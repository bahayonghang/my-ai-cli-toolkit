# code-quality-review

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Run a maintainability and structure review focused on abstraction quality, branching complexity, file growth, canonical ownership, duplication, and refactoring opportunities.

## 触发场景

- the user asks for code quality review, maintainability review, 代码质量审查, 可维护性审查, or comments about whether the change stays easy to understand, modify, test, and extend, including layering and ownership of the change / 改动的分层与归属
- Not for generic PR review or independent diff review hunting regressions, concurrency, or test gaps
- not for full-spectrum or 全维度代码审计
- not for system architecture audits

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `code-quality-review` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.3.0` |
| 标签 | `code-review`, `code-quality`, `maintainability`, `architecture`, `refactoring` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill code-quality-review
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/code-quality-review/assets` | 目录 | 1 | 素材资源 |
| `skills/development-workflows/code-quality-review/evals` | 目录 | 2 | 评测样例 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| assets | `skills/development-workflows/code-quality-review/assets` | 素材资源 |
| evals | `skills/development-workflows/code-quality-review/evals` | 评测样例 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/code-quality-review/SKILL.md`
- `skills/development-workflows/code-quality-review`
