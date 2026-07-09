# ripgrep

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Use when the user needs text or regex content search with ripgrep: composing rg commands, choosing flags, glob/type filtering, multiline or PCRE2 searches, pipeline output, grep-to-rg migration, or diagnosing why rg missed a file (gitignore, hidden, binary defaults).

## 触发场景

- the user needs text or regex content search with ripgrep: composing rg commands, choosing flags, glob/type filtering, multiline or PCRE2 searches, pipeline output, grep-to-rg migration, or diagnosing why rg missed a file (gitignore, hidden, binary defaults)
- Not for syntax-aware structural queries (ast-grep) or semantic renames/references (language tooling)

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `ripgrep` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `0.1.0` |
| 标签 | `ripgrep`, `rg`, `text-search`, `regex`, `code-search`, `grep` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill ripgrep
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/ripgrep/agents` | 目录 | 1 | 配套 agent |
| `skills/developer-tools-integrations/ripgrep/evals` | 目录 | 1 | 评测样例 |
| `skills/developer-tools-integrations/ripgrep/references` | 目录 | 1 | 引用资料 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/developer-tools-integrations/ripgrep/agents` | 配套 agent |
| evals | `skills/developer-tools-integrations/ripgrep/evals` | 评测样例 |
| references | `skills/developer-tools-integrations/ripgrep/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/developer-tools-integrations/ripgrep/SKILL.md`
- `skills/developer-tools-integrations/ripgrep`
