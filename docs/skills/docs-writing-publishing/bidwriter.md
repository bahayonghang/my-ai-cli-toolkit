# bidwriter

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

智能招投标文件编写专家，覆盖工程咨询、建筑设计、市政、IT、软件开发、货物与服务采购等各类招投标，工程建设类为深度强项。能解析招标文件、提取评分标准与废标条款、制定投标策略、撰写技术标与商务标、做逐条响应与合规性及废标风险审核。当用户提到标书、投标、招标、技术标、商务标、评分标准提取、废标风险、逐条响应、偏离表、政府采购、tender、RFP response 时使用。不适用于通用商务写作、营销文案、学术论文或与招投标无关的文档。

## 触发场景

- 智能招投标文件编写专家，覆盖工程咨询、建筑设计、市政、IT、软件开发、货物与服务采购等各类招投标，工程建设类为深度强项。能解析招标文件、提取评分标准与废标条款、制定投标策略、撰写技术标与商务标、做逐条响应与合规性及废标风险审核。当用户提到标书、投标、招标、技术标、商务标、评分标准提取、废标风险、逐条响应、偏离表、政府采购、tender、RFP response 时使用。不适用于通用商务写作、营销文案、学术论文或与招投标无关的文档。

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `bidwriter` |
| 分类 | `docs-writing-publishing` (文档写作与发布) |
| 版本 | `1.1.0` |
| 标签 | `bidwriting`, `tender`, `proposal`, `procurement`, `rfp`, `engineering`, `construction`, `municipal`, `标书`, `投标`, `招投标`, `政府采购` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill bidwriter
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/docs-writing-publishing/bidwriter/agents` | 目录 | 1 | 配套 agent |
| `skills/docs-writing-publishing/bidwriter/evals` | 目录 | 1 | 评测样例 |
| `skills/docs-writing-publishing/bidwriter/references` | 目录 | 4 | 引用资料 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| agents | `skills/docs-writing-publishing/bidwriter/agents` | 配套 agent |
| evals | `skills/docs-writing-publishing/bidwriter/evals` | 评测样例 |
| references | `skills/docs-writing-publishing/bidwriter/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/docs-writing-publishing/bidwriter/SKILL.md`
- `skills/docs-writing-publishing/bidwriter`
