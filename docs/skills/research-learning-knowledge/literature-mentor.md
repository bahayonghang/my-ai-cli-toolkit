# literature-mentor

> 此页由 `docs/scripts/sync_docs_catalog.py` 从 `SKILL.md` 自动生成。

## 用途概览

文献深度解读助手，像研究生导师一样交互式解读Zotero库中的学术论文。当用户提供文献题目、DOI、PDF或要求解读某篇文献时触发。通过Zotero MCP优先获取全文，并根据用户意图自动选择快速筛选、导师深读或研究复盘模式。完整深读时先完成叙事类型判断、阅读前3件事预检、novelty校准和作者思考路径重建，再整体概览，并基于图例、正文和表格逐图详细解读（注：Zotero MCP无法提取PDF图片，解读基于文字信息；如图例或正文描述不足，会提醒用户上传图片后再详细分析）。结合牛基因组学/群体遗传学领域背景进行综合分析（方法学评价、核心概念学习、研究启发、最小复现、反例设计和非增量follow-up）。适用于：(1)快速判断文献是否值得深读 (2)深入理解某篇文献 (3)学习文章中的方法和技术 (4)批判性分析研究设计 (5)寻找研究灵感和可借鉴之处

## 触发场景

- 文献深度解读助手，像研究生导师一样交互式解读Zotero库中的学术论文。当用户提供文献题目、DOI、PDF或要求解读某篇文献时触发。通过Zotero MCP优先获取全文，并根据用户意图自动选择快速筛选、导师深读或研究复盘模式。完整深读时先完成叙事类型判断、阅读前3件事预检、novelty校准和作者思考路径重建，再整体概览，并基于图例、正文和表格逐图详细解读（注：Zotero MCP无法提取PDF图片，解读基于文字信息；如图例或正文描述不足，会提醒用户上传图片后再详细分析）。结合牛基因组学/群体遗传学领域背景进行综合分析（方法学评价、核心概念学习、研究启发、最小复现、反例设计和非增量follow-up）。适用于：(1)快速判断文献是否值得深读 (2)深入理解某篇文献 (3)学习文章中的方法和技术 (4)批判性分析研究设计 (5)寻找研究灵感和可借鉴之处

## 元数据

| 字段 | 值 |
| --- | --- |
| 名称 | `literature-mentor` |
| 分类 | `research-learning-knowledge` (研究、学习与知识) |
| 版本 | `1.0.0` |
| 标签 | `literature`, `research`, `zotero`, `paper-reading`, `academic` |

## 安装命令

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill literature-mentor
```

## 目录内容

未检测到 `SKILL.md` 以外的顶层资源。

## 脚本、引用与测试资源

未检测到专门的 `scripts`、`references`、`tests` 或其他常见资源目录。

## 验证方式

```bash
just skills-check
just ci
```

此 skill 没有检测到 `tests/*.mjs`；如新增 Node 测试，请让 `just node-test` 覆盖它。

## 源码路径

- `skills/research-learning-knowledge/literature-mentor/SKILL.md`
- `skills/research-learning-knowledge/literature-mentor`
