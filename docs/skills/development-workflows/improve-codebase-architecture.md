# improve-codebase-architecture

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Review a codebase for architectural friction, rank deep-module refactoring opportunities, and draft RFCs for safer interfaces and boundary-test strategies.

## 触发场景

- the user wants to improve architecture, identify refactoring seams, consolidate tightly coupled modules, deepen shallow modules, redesign an interface around a core concept, replace brittle unit tests with boundary tests, or turn an architecture review into an RFC or issue draft

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `improve-codebase-architecture` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `1.2.0` |
| 标签 | `architecture`, `refactoring`, `testability`, `modularity`, `rfc` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill improve-codebase-architecture
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/improve-codebase-architecture/references` | 目录 | 1 | 引用资料 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| references | `skills/development-workflows/improve-codebase-architecture/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/improve-codebase-architecture/SKILL.md`
- `skills/development-workflows/improve-codebase-architecture`
