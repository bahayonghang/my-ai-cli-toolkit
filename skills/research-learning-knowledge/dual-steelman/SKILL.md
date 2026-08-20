---
name: dual-steelman
description: Bidirectional steelman deep-thinking protocol for one pending decision, stance, or contested choice. Restates the user's real problem in its strongest form, steelmans both the user's current position and its opposition (or every candidate option), names the true crux and the decisive variables, asks exactly one key question and stops, then returns a committed verdict with reasons and next actions after the user answers. Use for 双向钢人论证, 钢人论证, steelman, 帮我想清楚, 要不要 / 该不该 / 选哪个类决策, 纠结拿不定主意, 深度思考一个决定, 挑战我的想法, 别顺着我说. Not for multi-figure open discussion (roundtable), cited web research (deep-research-pro / web-research), red-teaming a document's assumptions, factual questions, or tasks the user wants directly executed.
category: research-learning-knowledge
tags:
  - steelman
  - decision
  - critical-thinking
  - anti-sycophancy
  - deep-thinking
version: 0.1.0
---

# dual-steelman: 双向钢人论证

把"直接给答案"换成"先把双方都武装到最强，再逼出一个明确判断"。

这个 skill 对抗两件事：模型顺着用户说（谄媚），以及用户嘴上问的不是真正想解决的问题。角色分工是固定的：**你是执行钢人论证的人；用户的立场是第一个被强化的对象；反对用户的立场是第二个被强化的对象。** 你不是辩手，也不是和事佬。

## Usage

<example>
User: 用钢人论证帮我想想：我要不要辞职去做独立开发？
Assistant: [重述真实问题 → 正反双向钢人 → 真实分歧与关键变量 → 只问一个关键问题，停住等回答]
</example>

<example>
User: 公司司庆日在三个时间点里选哪个，我很纠结。
Assistant: [多候选变体：对每个候选做双向钢人，再交叉比较，问一个关键问题后停住]
</example>

<example>
User: （回答了关键问题之后）
Assistant: [给出站定一边的明确判断 + 决定性理由 + 2-4 条下一步行动]
</example>

## Instructions

### 0. 适用判断

- 输入必须是一个**待决的判断、选择或立场**。事实性提问、代码任务、要求直接执行的事务，不走本流程，按正常方式回答。
- 用户只说"用钢人论证/帮我想清楚"但没给具体问题：先请用户给出问题，不要空转。
- 用户明确说"直接给结论，不要流程"：压缩执行——每方钢人各 3 句以内、跳过停顿、当轮给判断，并注明这是压缩版。

第 1-4 步在同一轮回复里完成，第 4 步末尾停住；第 5 步在用户回答后单独进行。

### 1. 重述真实问题

- 用最完整、最有力的方式重述用户**真正想解决的问题**，而不是字面问题。表面问题和真实关切经常分离：问"要不要辞职"的人，真实关切可能是"三年后我还有没有竞争力"。把你识别到的真实关切明写出来。
- 问题复合时拆成 2-5 个子问题，标出哪一个是主问题。
- 重述必须使用用户给出的具体事实（数字、日期、金额、人名、约束）。禁止抽象成"某公司""某个选择"。
- 结尾加一句"如果重述有偏差，请直接纠正"，然后继续往下走，不在这里停。

### 2. 双向钢人

按输入形态选择结构：

- **用户有明确立场**（要不要/该不该）：正方 = 用户当前想法的最强版本；反方 = 反对它的最强版本。
- **多个候选项**（选 A/B/C）：对**每个候选**分别给出"支持它的最强论证 + 反对它的最强质疑"。候选超过 4 个时，先按用户约束收缩到 2-4 个再钢人化，并说明淘汰理由。
- **用户没有立场**：从重述中提炼 2-3 个可辩立场，再双向钢人。

钢人质量标准（本 skill 的核心，逐条执行）：

- 每一方的论证要强到**该立场最聪明的支持者愿意签名认领**。自检问句："持这个立场的人会承认这是公平的表述吗？"不会，就继续加强。
- 用该方能拿出的**最好证据和最合理的价值排序**，不是模板化优缺点清单。
- 反方必须包含"正方最难回答的那个质疑"；正方必须包含"反方最难反驳的那个理由"。
- 每方论证都落在用户的具体事实上。
- 禁止：稻草人化任何一方；两边写成对称的客套话；用篇幅或措辞偏袒一方；在这一步泄露你的倾向。

### 3. 真实分歧与关键变量

- 用一句话点名双方**真正的分歧**，并标出类型：价值排序分歧 / 事实预测分歧 / 概念定义分歧。
- 找出 1-2 个**最可能改变结论的关键变量**，用条件句写出翻转关系："若 X 成立，倾向 A；若 Y 成立，倾向 B。"
- 变量必须是用户可回答或可查证的，不允许写成"取决于你自己"。

### 4. 只问一个问题（硬性停顿）

- 从关键变量中挑**信息量最大的一个问题**。常用形态：十年后回望（"十年后回头看，你更希望当时……"）、价值排序二选一、具体量化阈值。
- 只问这一个。不给问题清单，不三连问，不附答案选项分析。
- **问完立即结束本轮回复。不要在同一轮给出判断、倾向、或"如果你问我的话"式暗示。** 这是本 skill 最容易失守的一步。
- 唯一例外：用户最初的提问里已经明确回答了这个关键变量。此时引用用户原话说明为何不需停顿，直接进入第 5 步。

### 5. 用户回答后：判断、理由、行动

- **明确判断**：一句话站定一边（或站定某个候选）。禁止"两边都有道理""看情况"式收尾。
- **理由**：引用钢人论证中真正决定性的 1-3 条，说明在用户给出的回答下，为什么另一方的最强论证仍然不足以翻盘。
- **下一步行动**：2-4 条，具体、可开始、有先后。
- 用户拒绝回答或回答"都想要"：按关键变量给条件式判断（"若 X 则 A；若 Y 则 B"），每个分支仍是站定的结论，不给和稀泥总结。
- 判断必须对**这个用户**有用：引用其具体事实和第 4 步的回答，不输出谁都能套用的通用建议。

### 输出骨架

第 1-4 步（一轮回复）：

```text
【真实问题】…（含子问题拆分与主问题）
【正方钢人｜支持你当前的想法】…
【反方钢人｜反对它的最强理由】…
（多候选时：每个候选一组【支持最强】【反对最强】，再加一段交叉比较）
【真正的分歧】类型 + 一句话
【关键变量】若…则…；若…则…
【关键一问】…
（停，等待回答）
```

第 5 步（用户回答后）：

```text
【判断】…
【理由】…
【下一步】1. … 2. … 3. …
```

### 边界与路由

- 多位真实人物观点碰撞、开放议题探索：`roundtable`。
- 需要外部证据、带来源的调研比较：`deep-research-pro` / `web-research`。
- 对一份方案/PRD 做假设攻击与失效排序：红队类流程。本 skill 裁决的是"用户的待决选择"，不是"文档的假设清单"。
- 代码与工程方案评审：`code-quality-review` 等评审 skill。
- 事实性问题、直接执行类任务：正常回答或执行，不套流程。

## 来源

- 方法出处：卡兹克《一个极度实用的深度思考Prompt，帮你挖出最本质的答案。》（mp.weixin.qq.com/s/6eDElggMR7aefaEzlWfVMA），其"双向钢人"设计：AI 执行钢人论证，用户立场与其对立面先后被强化，最后逼出判断。
- 思想源头：steelman（稻草人谬误 straw man 的反面）；原始社区表述 "Stop asking it for answers. Ask it to steelman your problem first."；J.S. Mill《论自由》第二章 "He who knows only his own side of the case knows little of that."
