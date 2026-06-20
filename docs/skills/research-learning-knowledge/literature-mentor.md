# literature-mentor

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

文献深度解读助手，像研究生导师一样交互式解读 Zotero 库中的学术论文，面向计算机科学、深度学习、自动化等方向（个人向）。当用户提供文献题目、DOI、PDF 或要求解读某篇论文时触发，通过 Zotero MCP 优先获取全文，并根据用户意图自动选择快速筛选、导师深读或研究复盘模式。完整深读时先完成叙事类型判断、阅读前预检、novelty 校准和作者思考路径重建，再整体概览，并基于图例、正文和表格逐图详细解读（Zotero MCP 无法提取 PDF 图片，解读基于文字信息，必要时提醒上传图片）。适用于：(1)快速判断文献是否值得深读 (2)深入理解某篇论文 (3)学习文章中的方法和技术 (4)批判性分析研究设计 (5)寻找研究灵感。需要多篇论文综合、对比或找研究空白，或 arXiv/DOI 批量规范化时，改用 paper-workbench。

## 触发场景

- 文献深度解读助手，像研究生导师一样交互式解读 Zotero 库中的学术论文，面向计算机科学、深度学习、自动化等方向（个人向）。当用户提供文献题目、DOI、PDF 或要求解读某篇论文时触发，通过 Zotero MCP 优先获取全文，并根据用户意图自动选择快速筛选、导师深读或研究复盘模式。完整深读时先完成叙事类型判断、阅读前预检、novelty 校准和作者思考路径重建，再整体概览，并基于图例、正文和表格逐图详细解读（Zotero MCP 无法提取 PDF 图片，解读基于文字信息，必要时提醒上传图片）。适用于：(1)快速判断文献是否值得深读 (2)深入理解某篇论文 (3)学习文章中的方法和技术 (4)批判性分析研究设计 (5)寻找研究灵感。需要多篇论文综合、对比或找研究空白，或 arXiv/DOI 批量规范化时，改用 paper-workbench。

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `literature-mentor` |
| 分类 | `research-learning-knowledge` (研究、学习与知识) |
| 版本 | `1.1.0` |
| 标签 | `literature`, `research`, `zotero`, `paper-reading`, `academic`, `deep-learning` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill literature-mentor
```

## 目录内容

| 路径 | 类型 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| `skills/research-learning-knowledge/literature-mentor/evals` | 目录 | 1 | 评测样例 |
| `skills/research-learning-knowledge/literature-mentor/references` | 目录 | 4 | 引用资料 |

## 脚本、引用与测试资源

| 资源 | 路径 | 用途 |
| --- | --- | --- |
| evals | `skills/research-learning-knowledge/literature-mentor/evals` | 评测样例 |
| references | `skills/research-learning-knowledge/literature-mentor/references` | 引用资料 |

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/research-learning-knowledge/literature-mentor/SKILL.md`
- `skills/research-learning-knowledge/literature-mentor`
