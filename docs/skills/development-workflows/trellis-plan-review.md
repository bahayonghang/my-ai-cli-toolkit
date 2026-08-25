# trellis-plan-review

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Independent review of Trellis task planning artifacts. Reads prd.md, design.md, implement.md, implement.jsonl, check.jsonl, and task.json in a .trellis/tasks/ directory, verifies every repository claim and path:line citation against the actual code, traces each acceptance-criterion clause back to a requirement and a design mechanism, rechecks arithmetic and unit assumptions, writes an evidence-backed Markdown report into the reviewed project's .trellis/reviews directory, and returns a copyable handoff prompt. Compares the plan against the real diff once the task has started.

## 触发场景

- the user asks to 审阅 trellis 任务, 审阅规划, 审查 prd design implement, 检查验收标准有没有机制支撑, review a trellis plan, audit a plan another agent wrote, or verify plan claims before implementation
- Not for reviewing a code diff by itself (code-auditor for independent or full-spectrum review, code-quality-review for maintainability), not for writing or repairing the plan, and not for running the task

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `trellis-plan-review` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.3.0` |
| 标签 | `trellis`, `plan-review`, `spec-audit`, `acceptance-criteria`, `traceability`, `handoff` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill trellis-plan-review
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/development-workflows/trellis-plan-review/agents` | 目录 | 1 | 配套 agent |
| `skills/development-workflows/trellis-plan-review/evals` | 目录 | 1 | 评测样例 |
| `skills/development-workflows/trellis-plan-review/references` | 目录 | 7 | 引用资料 |
| `skills/development-workflows/trellis-plan-review/scripts` | 目录 | 2 | 可执行脚本 |
| `skills/development-workflows/trellis-plan-review/tests` | 目录 | 2 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/development-workflows/trellis-plan-review/agents` | 配套 agent |
| evals | `skills/development-workflows/trellis-plan-review/evals` | 评测样例 |
| references | `skills/development-workflows/trellis-plan-review/references` | 引用资料 |
| scripts | `skills/development-workflows/trellis-plan-review/scripts` | 可执行脚本 |
| tests | `skills/development-workflows/trellis-plan-review/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just node-test
just ci
```

## 源码路径

- `skills/development-workflows/trellis-plan-review/SKILL.md`
- `skills/development-workflows/trellis-plan-review`
