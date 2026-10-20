# laoyeye

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

整合式思考与学习伙伴：理清问题、追问设计、讲透概念、拆解范例、横纵深度研究、核查说法、多视角解题、比较两项选择、设计最小实验；明确请求时做持续教学、agent 任务书、知识收尾、天赋探索与人生设计。支持 Socratic questioning, grilling, critical thinking, first principles, steelman, fact check；可点名原方法。排除普通润色翻译、学术论文精读综述、生产 UI 实施、专业 diff 或 Trellis 规划审查、原生 Goal 管理；代码诊断与治理仅在明确选择本包或其流程内执行。

## 触发场景

- 整合式思考与学习伙伴：理清问题、追问设计、讲透概念、拆解范例、横纵深度研究、核查说法、多视角解题、比较两项选择、设计最小实验；明确请求时做持续教学、agent 任务书、知识收尾、天赋探索与人生设计。支持 Socratic questioning, grilling, critical thinking, first principles, steelman, fact check；可点名原方法。排除普通润色翻译、学术论文精读综述、生产 UI 实施、专业 diff 或 Trellis 规划审查、原生 Goal 管理；代码诊断与治理仅在明确选择本包或其流程内执行。

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `laoyeye` |
| 分类 | `research-learning-knowledge` (研究、学习与知识) |
| 版本 | `0.1.0` |
| 标签 | `thinking`, `learning`, `questioning`, `decision-making`, `evidence` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill laoyeye
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/research-learning-knowledge/laoyeye/agents` | 目录 | 1 | 配套 agent |
| `skills/research-learning-knowledge/laoyeye/assets` | 目录 | 3 | 素材资源 |
| `skills/research-learning-knowledge/laoyeye/evals` | 目录 | 3 | 评测样例 |
| `skills/research-learning-knowledge/laoyeye/README.md` | 文件 | 1 | 顶层文件 |
| `skills/research-learning-knowledge/laoyeye/references` | 目录 | 26 | 引用资料 |
| `skills/research-learning-knowledge/laoyeye/reports` | 目录 | 6 | 顶层目录 |
| `skills/research-learning-knowledge/laoyeye/scripts` | 目录 | 1 | 可执行脚本 |
| `skills/research-learning-knowledge/laoyeye/tests` | 目录 | 1 | 自动化测试 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/research-learning-knowledge/laoyeye/agents` | 配套 agent |
| assets | `skills/research-learning-knowledge/laoyeye/assets` | 素材资源 |
| evals | `skills/research-learning-knowledge/laoyeye/evals` | 评测样例 |
| references | `skills/research-learning-knowledge/laoyeye/references` | 引用资料 |
| scripts | `skills/research-learning-knowledge/laoyeye/scripts` | 可执行脚本 |
| tests | `skills/research-learning-knowledge/laoyeye/tests` | 自动化测试 |

## 验证方式

```bash
just skills-check
just python-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/research-learning-knowledge/laoyeye/SKILL.md`
- `skills/research-learning-knowledge/laoyeye`
