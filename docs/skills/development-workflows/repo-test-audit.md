# repo-test-audit

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Use when the user asks where tests live, which test directory holds them, how complete the tests are, or which tests are not collected by CI.

## 触发场景

- the user asks where tests live, which test directory holds them, how complete the tests are, or which tests are not collected by CI. 测试放在哪、测试目录、测试完善程度、哪些测试没进 CI
- Inventory test location, runner collection, and completeness

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `repo-test-audit` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `testing`, `audit`, `ci` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill repo-test-audit
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/repo-test-audit/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/repo-test-audit/evals` | 目录 | 2 | 评测样例 |
| `skills/development-workflows/repo-test-audit/README.md` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/repo-test-audit/references` | 目录 | 2 | 引用资料 |
| `skills/development-workflows/repo-test-audit/reports` | 目录 | 4 | 顶层目录 |
| `skills/development-workflows/repo-test-audit/scripts` | 目录 | 1 | 可执行脚本 |
| `skills/development-workflows/repo-test-audit/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/development-workflows/repo-test-audit/agents` | 配套 agent |
| evals | `skills/development-workflows/repo-test-audit/evals` | 评测样例 |
| references | `skills/development-workflows/repo-test-audit/references` | 引用资料 |
| scripts | `skills/development-workflows/repo-test-audit/scripts` | 可执行脚本 |
| tests | `skills/development-workflows/repo-test-audit/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just node-test
just ci
```

## 源码路径

- `skills/development-workflows/repo-test-audit/SKILL.md`
- `skills/development-workflows/repo-test-audit`
