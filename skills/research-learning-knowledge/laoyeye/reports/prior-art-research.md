# Prior-Art Research

研究日期：2026-10-19（America/New_York）。本包整合方法而非镜像原提示语；不主张官方身份、逐字保真或未实测的质量优势。

## 发现与证据

查询为 `critical thinking`、`socratic questioning`、`decision making`。三个 `npx --yes skills find` 查询成功；qiaomu 内建 SkillsMP runner 的三次查询也成功，归一为 27 个候选 family。没有安装候选、执行候选脚本或加载额外发现技能。

skills.sh 的 installs 是其显示的安装遥测；SkillsMP repo_stars 是目录采集的源仓库星数，可能滞后。它们不相加、不当作用户评分、满意度、安全性或准确率。用户评分证据不可得。

| 读过的参考 | 当时观察与边界 | 学到什么 | 在本包的落点 |
| --- | --- | --- | --- |
| LearnPrompt/laoyeye | 用户指定；本地固定到 `5af2b57ceb169d81b2da90cc902556a2cad11c0a`，读完 26 个入口 | 按处境选择方法、相邻方法分界、拒绝硬路由、方法接力 | 单根中直接定位内部方法；全部 25 项入口保留，grill-me 共享 grilling |
| mattpocock/skills 的 ask-matt、grilling、teach、diagnosing-bugs | pinned 来源由 laoyeye vendor lock 记录；SkillsMP 的 grilling 源仓库显示 292968 stars，仅为目录观察 | 选择后读方法正文；设计树 frontier；学习 mission 与状态；症状特定的红灯反馈 | 按需方法读取、grilling、teaching 与 debugging；去掉跨 skill 转调和宿主专属假设 |
| sammcj/agentic-coding 的 critical-thinking-logical-reasoning | skills.sh 显示 2.4K installs；canonical SKILL 与 Apache-2.0 LICENSE 已读 | 先准确理解论证、只指出改变结论的问题；弱论证不自动等于错误结论 | 对抗分析与核查的判断纪律；不复制该候选文字、不继承英语拼写要求 |
| tjboudreaux/cc-thinking-skills 的 thinking-socratic | skills.sh 显示 589 installs；canonical SKILL 与 MIT LICENSE 已读 | 明确任务就停止盘问、事实自己查，只问会改变下一步的问题 | socratic 的适用 / 停止条件和边界案例；不采纳多独立入口布局 |

本仓库 paper-workbench 是结构参照：同类别、单根与按需资源。它的论文归一化流程不属于本包。检索顶部的 research / to-questionnaire 等没有仅因安装数高就被称为最佳候选。

## 保留、改造、拒绝与新增

- **keep**：事实优先、适用边界、互动节奏、证伪与低成本实验、课程状态和实际诊断回路。
- **adapt**：独立 skill 转包内方法；显式调用限制转意图门；按现场工具执行；教学文件写入明确的课程目录。
- **reject**：26 个可发现入口、全正文拼接、六个巨型分类文件、所有方法统一问卷、自动启动 Goal / 写记忆，以及原文完整再分发承诺。
- **invent**：25→24 覆盖账本、包内别名、按方法读取预算、三个成本场景、token 示例误索取与三方案误接二选一的回归。

## 直接来源

- [laoyeye pinned source](https://github.com/LearnPrompt/laoyeye/tree/5af2b57ceb169d81b2da90cc902556a2cad11c0a)。其 vendor lock 固定 Matt、Khazix 与 Partner 的版本。
- [ask-matt source](https://raw.githubusercontent.com/mattpocock/skills/main/skills/engineering/ask-matt/SKILL.md)。浮动 main 仅用于机制研究，不搬未核实的上下文数值。
- [critical-thinking source](https://raw.githubusercontent.com/sammcj/agentic-coding/main/Skills/critical-thinking-logical-reasoning/SKILL.md)、[license](https://raw.githubusercontent.com/sammcj/agentic-coding/main/LICENSE)、[catalog](https://skills.sh/sammcj/agentic-coding/critical-thinking-logical-reasoning)。
- [thinking-socratic source](https://raw.githubusercontent.com/tjboudreaux/cc-thinking-skills/main/skills/thinking-socratic/SKILL.md)、[license](https://raw.githubusercontent.com/tjboudreaux/cc-thinking-skills/main/LICENSE)、[catalog](https://skills.sh/tjboudreaux/cc-thinking-skills/thinking-socratic)。
- [Agent Skills specification](https://agentskills.io/specification)、[creation practices](https://agentskills.io/skill-creation/best-practices)：支持 metadata、入口、按需资源分层，不代表任何宿主已经实测。

## 优势与缺证据

**design advantage**：同一个安装包内只保留一个可发现入口，方法级读取，并保留完整能力和显式别名。这个差异服务整体使用目标，不能推出单独调用旧叶子也更省。

**validated advantage**：具体结构和静态体积结果以 context-budget.json 与 verification.md 的实际记录为准，不用规划阈值冒充结果。

**hypothesis**：减少 metadata 和路由材料有望降低整体使用成本；真实客户端注入 token、延迟、公平输出质量比较及用户满意度仍是 missing evidence。单纯安装本包也不会自动清除旧叶子的描述。
