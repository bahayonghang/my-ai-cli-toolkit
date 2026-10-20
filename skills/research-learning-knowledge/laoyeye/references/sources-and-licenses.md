# 来源与许可账本

主输入固定为 [LearnPrompt/laoyeye@5af2b57](https://github.com/LearnPrompt/laoyeye/tree/5af2b57ceb169d81b2da90cc902556a2cad11c0a)。这是行为整合适配，不是官方版本、逐字提示语镜像或原模型效果的等价承诺。下面的来源供审阅；方法运行不需联网读取它们。

18 条提示语自主组织方法与表达，不复制整段、机械同义改写或提供原文导出。主输入 [LICENSE](https://github.com/LearnPrompt/laoyeye/blob/5af2b57ceb169d81b2da90cc902556a2cad11c0a/LICENSE) 明确区分仓库自有内容、原提示语和收录技能；其 MIT 不能推导所有提示语都可重新按 MIT 发布。原帖归属按上游声明列出，未声称独立核验所有原帖转载授权。

## 完整功能映射

来源路径均在主输入的 `skills/` 下。P 表示自主撰写的提示语方法；M 表示对 MIT 技能的实质方法适配并保留许可；A 是同方法别名。

| # | 来源路径 | 包内方法 | 处理 |
| --- | --- | --- | --- |
| 01 | asking/socratic-inquiry | [socratic](modes/socratic.md) | P，逐问澄清 |
| 02 | asking/matt-grilling | [grilling](modes/grilling.md) | M，设计树与 frontier |
| 03 | asking/matt-grill-me | [grilling](modes/grilling.md) | A，显式复用 02，不转外部技能 |
| 04 | asking/johari-window | [johari](modes/johari.md) | P，会话协作设置 |
| 05 | asking/no-fluff-output | [concise](modes/concise.md) | P，行动先行，移除凭据误索取 |
| 06 | learning/two-layer-explain | [explain](modes/explain.md) | P，两层与三自测 |
| 07 | learning/reverse-teardown | [teardown](modes/teardown.md) | P，范例证据与迁移 |
| 08 | learning/horizontal-vertical-analysis | [research](modes/research.md) | P，纵横轴与三种未来 |
| 09 | learning/fact-check | [fact-check](modes/fact-check.md) | P，五档核查与推理 |
| 10 | learning/parable | [parable](modes/parable.md) | P，单概念补救 |
| 11 | learning/memory-parable | [memory-story](modes/memory-story.md) | P，选领域概念助记 |
| 12 | learning/eli5 | [visual-explain](modes/visual-explain.md) | P，实际 HTML artifact |
| 13 | learning/matt-teach | [teaching](modes/teaching.md) | M，工作区与四格式见下 |
| 14 | solving/expert-panel | [panel](modes/panel.md) | P，三互补视角 |
| 15 | solving/first-principles | [first-principles](modes/first-principles.md) | P，约束重建 |
| 16 | solving/cross-domain-borrow | [cross-domain](modes/cross-domain.md) | P，三远距同构 |
| 17 | solving/inversion | [inversion](modes/inversion.md) | P，五至七失败路径 |
| 18 | solving/carl-idea-king | [adversarial](modes/adversarial.md) | M，三攻击点与 checklist |
| 19 | solving/matt-diagnosing-bugs | [debugging](modes/debugging.md) | M，真实红灯闭环 |
| 20 | deciding/steelman-both-sides | [steelman](modes/steelman.md) | P，二选项与关键一问 |
| 21 | deciding/minimum-experiment | [experiment](modes/experiment.md) | P，三假设与七天设计 |
| 22 | doing/kaz-leader | [brief](modes/brief.md) | M，执行 / 探索合同，交付不激活 |
| 23 | doing/kaz-neat-freak | [reconcile](modes/reconcile.md) | M，六面治理与范围 |
| 24 | self-knowledge/hidden-talent | [talent](modes/talent.md) | P，经历证据与十主问 |
| 25 | self-knowledge/life-design | [life-design](modes/life-design.md) | P，四阶段与三个版本 |

教学的 MISSION / RESOURCES / LEARNING-RECORD / GLOSSARY 四格式适配至 [教学工作区](teaching-workspace.md)。任务书吸收 anatomy 的验收与恢复机制；治理吸收 governance / verification / sync-matrix 的事实与范围机制；对抗方法吸收 adversarial-checklist 的隐性耦合、集成成本和证伪机制。没有搬运 Bash helper、旧宿主路径、专属模型 / 费用 / 频道或调侃语料。

## MIT 实质适配的固定来源

固定版本取自主输入的 [vendor lock](https://github.com/LearnPrompt/laoyeye/blob/5af2b57ceb169d81b2da90cc902556a2cad11c0a/vendor/vendor.lock.json)，不随 main 漂移。

| 来源与版本 | 对应内容 | 保留完整通知 |
| --- | --- | --- |
| [mattpocock/skills@5b15a47](https://github.com/mattpocock/skills/tree/5b15a47f2d7150f545fbcacbfe381787fc0230dc) | grilling / grill-me、teach 及四格式、diagnosing-bugs | [Matt Pocock MIT](../assets/licenses/mattpocock-skills-MIT.txt) |
| [KKKKhazix/khazix-skills@7a5c493](https://github.com/KKKKhazix/khazix-skills/tree/7a5c4934be4106ac740ffdb95280bb81b3f4b83c) | leader / anatomy、neat-freak / governance / verification / sync-matrix | [数字生命卡兹克 MIT](../assets/licenses/khazix-skills-MIT.txt) |
| [LearnPrompt/partner-skill@3bf07bd](https://github.com/LearnPrompt/partner-skill/tree/3bf07bd8b3722e79ce5828f44342b9f259b414cc) | idea-king 与 adversarial-checklist | [LearnPrompt MIT](../assets/licenses/partner-skill-MIT.txt) |

前两份许可与固定本地收录副本核对；第三份从 [pinned canonical LICENSE](https://raw.githubusercontent.com/LearnPrompt/partner-skill/3bf07bd8b3722e79ce5828f44342b9f259b414cc/LICENSE) 核实，Copyright (c) 2026 LearnPrompt。这里保留通知不是重新许可原作者的其他作品。

## 提示语归属与研究启发

上游 README 将十三条提示语归于数字生命卡兹克，记忆寓言归于陈乔维 Justin 转述 Amanda Askell 思路，行动先行归于 ayghri/i-have-adhd，大图小字归于苏乐转述，乔哈里版本未署名。具体原始链接及转载声明见 [上游致谢](https://github.com/LearnPrompt/laoyeye/blob/5af2b57ceb169d81b2da90cc902556a2cad11c0a/README.md)。本包仅自主实现行为合同，不因原帖被转载就认定完整授权；不复制其故事、黑名单或原帖表达。

前期还研究了 [ask-matt](https://raw.githubusercontent.com/mattpocock/skills/main/skills/engineering/ask-matt/SKILL.md) 的先读方法纪律、[thinking-socratic](https://raw.githubusercontent.com/tjboudreaux/cc-thinking-skills/main/skills/thinking-socratic/SKILL.md) 的停止追问条件，以及 [critical-thinking-logical-reasoning](https://raw.githubusercontent.com/sammcj/agentic-coding/main/Skills/critical-thinking-logical-reasoning/SKILL.md) 的准确理解论证机制。它们是研究启发，不是本包中的文字副本；尤其未复制第三者的 Apache-2.0 内容。浮动 main 只作研究链接，不宣称其版本已固定或已做公平输出比较。

## 本包新增原创归属

Copyright (c) 向阳乔木；[X](https://x.com/vista8) · [GitHub](https://github.com/joeseesun/)。新增原创内容遵循本仓库许可；上述归属不覆盖 MIT 原作者、提示语作者或其他研究来源，不代表其背书。未核验的安装、客户端发现、token、模型行为或用户评价，不能借来源声誉宣称通过。
