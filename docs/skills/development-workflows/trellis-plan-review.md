# trellis-plan-review

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

Independent review of Trellis task planning artifacts. Treats the selected task and its recursive current or archived children as one review scope, verifies repository claims and path:line citations against code, traces every acceptance-criterion clause to a requirement and design mechanism, rechecks arithmetic and units, writes one combined evidence-backed Markdown report under the reviewed project's .trellis/reviews directory, and returns one copyable handoff prompt. Compares the plan with the real diff after the task starts.

## 触发场景

- the user asks to 审阅 trellis 父子任务, 审阅规划, 审查 prd design implement, 检查验收标准有没有机制支撑, review a trellis plan or task tree, audit a plan another agent wrote, or verify plan claims before implementation
- Not for a code-diff-only review, writing or repairing the plan, or running the task

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `trellis-plan-review` |
| 分类 | `development-workflows` (开发工作流) |
| 版本 | `0.4.0` |
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
| `skills/development-workflows/trellis-plan-review/tests` | 目录 | 3 | 自动化测试 |

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
