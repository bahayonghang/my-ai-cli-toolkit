# ast-grep

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Write, debug, and validate ast-grep structural code search rules.

## 触发场景

- Write, debug, and validate ast-grep structural code search rules
- Use for syntax-aware code search, AST pattern matching, structural refactor discovery, or searches plain text tools like rg can miss — functions with particular descendants, calls inside specific contexts, decorators, or other Tree-sitter-backed structures
- Not for plain-text ripgrep search or semantic renames

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
| `skills/developer-tools-integrations/ast-grep/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| evals | `skills/developer-tools-integrations/ast-grep/evals` | 评测样例 |
| references | `skills/developer-tools-integrations/ast-grep/references` | 引用资料 |
| tests | `skills/developer-tools-integrations/ast-grep/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just node-test
just ci
```

## 源码路径

- `skills/developer-tools-integrations/ast-grep/SKILL.md`
- `skills/developer-tools-integrations/ast-grep`
