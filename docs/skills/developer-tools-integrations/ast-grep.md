# ast-grep

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Write, debug, and validate ast-grep structural code search rules.

## 触发场景

- the user needs syntax-aware code search, AST pattern matching, structural refactor discovery, language-construct queries, or searches that plain text tools like rg can miss, such as finding functions with particular descendants, calls inside specific contexts, missing error handling, React hook shapes, decorators, or other Tree-sitter-backed code structures

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `ast-grep` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `0.1.0` |
| 标签 | `ast-grep`, `structural-search`, `code-search`, `tree-sitter`, `static-analysis`, `refactoring` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill ast-grep
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/ast-grep/evals` | 目录 | 1 | 评测样例 |
| `skills/developer-tools-integrations/ast-grep/references` | 目录 | 1 | 引用资料 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| evals | `skills/developer-tools-integrations/ast-grep/evals` | 评测样例 |
| references | `skills/developer-tools-integrations/ast-grep/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/developer-tools-integrations/ast-grep/SKILL.md`
- `skills/developer-tools-integrations/ast-grep`
