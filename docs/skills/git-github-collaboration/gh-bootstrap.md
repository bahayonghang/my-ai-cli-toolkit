# gh-bootstrap

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Initialize GitHub repository configuration from vetted upstream templates.

## 触发场景

- setting up repository automation, issue and PR templates, CI workflows, or baseline GitHub project files for a new or existing repo

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `gh-bootstrap` |
| 分类 | `git-github-collaboration` (Git / GitHub 协作) |
| 版本 | `1.2.0` |
| 标签 | `github`, `bootstrap`, `templates`, `ci`, `automation` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills --skill gh-bootstrap
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `content/skills/git-github-collaboration/gh-bootstrap/agents` | 目录 | 1 | 配套 agent |
| `content/skills/git-github-collaboration/gh-bootstrap/phases` | 目录 | 9 | 阶段说明 |
| `content/skills/git-github-collaboration/gh-bootstrap/references` | 目录 | 1 | 引用资料 |
| `content/skills/git-github-collaboration/gh-bootstrap/scripts` | 目录 | 1 | 可执行脚本 |
| `content/skills/git-github-collaboration/gh-bootstrap/specs` | 目录 | 5 | 规格说明 |
| `content/skills/git-github-collaboration/gh-bootstrap/templates` | 目录 | 1 | 模板 |
| `content/skills/git-github-collaboration/gh-bootstrap/test-prompts.json` | 文件 | 1 | 顶层文件 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `content/skills/git-github-collaboration/gh-bootstrap/agents` | 配套 agent |
| phases | `content/skills/git-github-collaboration/gh-bootstrap/phases` | 阶段说明 |
| references | `content/skills/git-github-collaboration/gh-bootstrap/references` | 引用资料 |
| scripts | `content/skills/git-github-collaboration/gh-bootstrap/scripts` | 可执行脚本 |
| specs | `content/skills/git-github-collaboration/gh-bootstrap/specs` | 规格说明 |
| templates | `content/skills/git-github-collaboration/gh-bootstrap/templates` | 模板 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `content/skills/git-github-collaboration/gh-bootstrap/SKILL.md`
- `content/skills/git-github-collaboration/gh-bootstrap`
