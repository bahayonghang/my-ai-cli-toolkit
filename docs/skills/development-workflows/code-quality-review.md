# code-quality-review

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Run a code quality review focused on maintainability, structure, abstraction quality, file growth, branching complexity, boundary cleanliness, and refactoring opportunities.

## 触发场景

- the user asks for code quality review, code review, maintainability review, architecture quality review, PR code quality feedback, 代码质量审查, 代码质量 review, 可维护性审查, 架构质量审查, or review comments about code structure

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `code-quality-review` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `code-review`, `code-quality`, `maintainability`, `architecture`, `refactoring` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill code-quality-review
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/code-quality-review/evals` | 目录 | 1 | 评测样例 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
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
