# skill-session-review

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Analyze how an existing agent skill was used in past Claude Code, Grok, Codex, and Oh My Pi conversations.

## 触发场景

- the user asks to 分析某 skill 的使用情况, 这个 skill 用着有什么问题, 根据历史对话反馈改进 this skill, review skill sessions, or write a session-review report
- Writes reports/skill-session-review and a copyable qiaomu-meta handoff prompt

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `skill-session-review` |
| 分类 | `developer-tools-integrations` (开发者工具集成) |
| 版本 | `0.2.0` |
| 标签 | `skills`, `session-review`, `claude-code`, `grok`, `codex`, `oh-my-pi`, `feedback` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill skill-session-review
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/developer-tools-integrations/skill-session-review/agents` | 目录 | 1 | 配套 agent |
| `skills/developer-tools-integrations/skill-session-review/evals` | 目录 | 1 | 评测样例 |
| `skills/developer-tools-integrations/skill-session-review/references` | 目录 | 5 | 引用资料 |
| `skills/developer-tools-integrations/skill-session-review/scripts` | 目录 | 8 | 可执行脚本 |
| `skills/developer-tools-integrations/skill-session-review/tests` | 目录 | 11 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/developer-tools-integrations/skill-session-review/agents` | 配套 agent |
| evals | `skills/developer-tools-integrations/skill-session-review/evals` | 评测样例 |
| references | `skills/developer-tools-integrations/skill-session-review/references` | 引用资料 |
| scripts | `skills/developer-tools-integrations/skill-session-review/scripts` | 可执行脚本 |
| tests | `skills/developer-tools-integrations/skill-session-review/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just node-test
just ci
```

## 源码路径

- `skills/developer-tools-integrations/skill-session-review/SKILL.md`
- `skills/developer-tools-integrations/skill-session-review`
