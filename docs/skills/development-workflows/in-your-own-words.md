# in-your-own-words

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Restate in your own words what you think the user's goals are, what underlying problem they are trying to solve, what observable success looks like, and any high-leverage assumptions or open forks, then stop for confirmation before editing files or acting.

## 触发场景

- Restate in your own words what you think the user's goals are, what underlying problem they are trying to solve, what observable success looks like, and any high-leverage assumptions or open forks, then stop for confirmation before editing files or acting
- Use for /in-your-own-words or when the user asks to restate or play back goals, problem, and understanding before starting or coding (用你自己的话复述目标和要解决的问题、动手前先对齐需求理解、先确认理解再开工)
- Excludes multi-round design-tree interrogation (grilling, laoyeye), authoring full specs or tickets (/to-spec, /to-tickets), compiling execution prompts (matt-implement-prompt) or /goal directives (goal-meta-skill), paraphrasing or rewriting prose (write, renhua), translating or summarizing documents, and well-specified routine tasks unless explicitly invoked

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `in-your-own-words` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.1.0` |
| 标签 | `alignment`, `goal-playback`, `requirements`, `pre-execution`, `workflow`, `pstack` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill in-your-own-words
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/in-your-own-words/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/in-your-own-words/evals` | 目录 | 2 | 评测样例 |
| `skills/development-workflows/in-your-own-words/manifest.json` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/in-your-own-words/README.md` | 文件 | 1 | 顶层文件 |
| `skills/development-workflows/in-your-own-words/references` | 目录 | 1 | 引用资料 |
| `skills/development-workflows/in-your-own-words/reports` | 目录 | 4 | 顶层目录 |
| `skills/development-workflows/in-your-own-words/scripts` | 目录 | 1 | 可执行脚本 |
| `skills/development-workflows/in-your-own-words/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/development-workflows/in-your-own-words/agents` | 配套 agent |
| evals | `skills/development-workflows/in-your-own-words/evals` | 评测样例 |
| references | `skills/development-workflows/in-your-own-words/references` | 引用资料 |
| scripts | `skills/development-workflows/in-your-own-words/scripts` | 可执行脚本 |
| tests | `skills/development-workflows/in-your-own-words/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/development-workflows/in-your-own-words/SKILL.md`
- `skills/development-workflows/in-your-own-words`
