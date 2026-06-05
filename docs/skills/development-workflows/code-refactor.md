# code-refactor

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Implement safe, behavior-preserving code refactors after inspecting the existing project.

## 触发场景

- the user asks to refactor code, split large files or modules, extract functions or methods, reduce duplicated logic, rename confusing classes/functions/variables, improve code comments, remove unused or dead code, or says 重构代码, 拆分模块, 提取方法, 减少重复代码, 优化命名, 优化注释, 删除未调用代码
- For broad refactor requests, plan safe slices and wait for approval
- for narrow scoped requests, directly implement the smallest verifiable slice

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `code-refactor` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `refactoring`, `code-quality`, `maintainability`, `modularity`, `cleanup` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill code-refactor
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/code-refactor/evals` | 目录 | 1 | 评测样例 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| evals | `skills/development-workflows/code-refactor/evals` | 评测样例 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/code-refactor/SKILL.md`
- `skills/development-workflows/code-refactor`
