# Reference comparison and evidence

审计日期：2026-09-10。范围仅为用户指定的本地参考包与第一方 goal-meta-skill；采用 qiaomu-meta-skill 2.8.1 的先例取舍、轻入口、权限与证据分层方法。不是新包创建或公开发布。

## Provenance and research scope
- Local skill：skills/developer-tools-integrations/goal-meta-skill/SKILL.md:5，版本 0.8.1；仓库基线提交 2c0d049d，分支 dev。
- Reference：ref/repo/qiaomu-goal-meta-skill，Git HEAD f29e0189f2ea03392c50b4f1c7230886bd838a13，提交日期 2026-06-11，工作树检查无改动；manifest 版本 0.2.0，MIT LICENSE。只读源码，未执行参考脚本。
- Authoring method：本次实际读取 .agents/skills/qiaomu-meta-skill/SKILL.md、references/operating-modes.md 与 references/gate-selection.md。
- Prior-art discovery disposition：用户已指定比较对象，本轮为有界审计和修复规划，不设计新的通用技能或进行重大重构，因此不运行额外双目录搜索。若实施范围改成重大重新设计，须重新评估先例发现。
- 没有采集当前 installs/stars/用户评分；参考包 maturity/context tier 只是声明。双目录覆盖、实时维护状态和相对效果均为 missing evidence。不为查看候选而运行 npx 或安装依赖。
- 本轮没有重新核实五平台官方生命周期/字符限制；只检查本地现有预算逻辑，不声称外部事实最新。

## Findings
### F1 · P1 · 普通 lint 可借用围栏外说明或另一条 Goal
证据：skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py:1146 在全文检查 required markers；skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py:1164 从全文取字段；只有 opt-in review-remediation 在 skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py:1185 才逐块检查。
当前探针：完整 base 通过；仅有一行 outcome 的 Goal 后放空行和完整说明字段也通过；完整 Goal 后附残缺第二条也通过。复制单条命令后缺少契约但工具已报通过。
最小机制：普通与专项共用边界提取，逐条校验，wrapper 只用于 companion 版式检查。不是增加自然语言规则库。

### F2 · P2 · fence 被算入长度
证据：skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py:315 到空行前全部计数；closing fence 不是终止条件。
当前探针：raw 4000 字符正文通过；相同正文包在 text fence 中报 4004。仅验证该长度函数，不声称无字段的 a 串是完整合法 Goal。
最小机制：长度消费同一条 payload，不纳入 fence、外部说明或相邻 Goal。

### F3 · P2 · 聊天 lint 缺少可用无落盘输入路径
证据：skills/developer-tools-integrations/goal-meta-skill/SKILL.md:34 要求聊天默认不写文件，skills/developer-tools-integrations/goal-meta-skill/SKILL.md:64 要求已 lint，skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py:1445 仅接受 files，skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py:1460 只读 Path。
没有 stdin 支持，也没有正式临时文件流程，导致代理无法按文档完成聊天 lint。增加 '-' stdin，保持 writer 独占用户授权保存。

### F4 · P2 · interview 示例仍把缺检查纳入完成
证据：skills/developer-tools-integrations/goal-meta-skill/references/interview-checklist.md:167、skills/developer-tools-integrations/goal-meta-skill/references/interview-checklist.md:195、skills/developer-tools-integrations/goal-meta-skill/references/interview-checklist.md:214、skills/developer-tools-integrations/goal-meta-skill/references/interview-checklist.md:234。
参考的同类弱条件见 ref/repo/qiaomu-goal-meta-skill/SKILL.md:62 和 ref/repo/qiaomu-goal-meta-skill/SKILL.md:74；本地不应延续。现有发布示例测试入口 skills/developer-tools-integrations/goal-meta-skill/tests/lint-goal-command.test.mjs:909 只枚举 playbook，漏了 interview。
最小机制：修示例并扩展真实资源覆盖，保持完成的合取语义；不要制作通用中文语义判定器。

### F5 · P2 · legacy 子目录写入承诺超过 helper 能力
证据：skills/developer-tools-integrations/goal-meta-skill/references/default-goal-strategy.md:123 声称 legacy .planning 子目录可 explicit write；skills/developer-tools-integrations/goal-meta-skill/scripts/persist_goal_contract.py:107 拒绝路径分隔符，只允许直接子文件。
最小机制：撤销旧路径写入承诺，不扩展 helper 或添加兼容层，不伪造项目根目录绕过约束。

### F6 · P3 · 重复指令与陈旧现状增加维护负担
root 9803 字符，interface 5246 字符（Python UTF-8 read_text/LF 口径），合计 15049。入口已经指向专项 references，但又复述完整扫描闭环、Trellis 节奏和五平台管理表；interface default_prompt 也复制这些细节。依据：skills/developer-tools-integrations/goal-meta-skill/SKILL.md:35、skills/developer-tools-integrations/goal-meta-skill/SKILL.md:96、skills/developer-tools-integrations/goal-meta-skill/SKILL.md:129、skills/developer-tools-integrations/goal-meta-skill/agents/interface.yaml:4。
另有 skills/developer-tools-integrations/AGENTS.md:72 仍声称 goal-meta 用 expectations；实际 skills/developer-tools-integrations/goal-meta-skill/evals/evals.json:9 已为 assertions。
最小机制：按职责精简 root/interface，只修 category 现状一句，不新增 schema 迁移任务。字符负担可度量，provider 改善仍是假设。

## Candidate-specific synthesis
| Choice | Reference lesson | Local action and evidence class |
|---|---|---|
| keep | 参考 SKILL.md:23 低风险默认与先给完整草稿 | 本地已有，不扩展功能 |
| keep | 参考 references/default-goal-strategy.md:54 陌生领域先发现上下文 | 保留本地 discovery-first 与真实检查来源 |
| adapt | 参考 SKILL.md:34 的紧凑流程、agents/interface.yaml:3 的短接口 | 精简重复入口；design advantage，效果尚未验证 |
| reject | 参考 SKILL.md:50 的 cwd-relative 脚本命令 | 保留本地 literal skill-dir，并补 stdin |
| reject | 参考 SKILL.md:62 的缺检查仍完成 | 修本地残留，不回退合取门 |
| reject | 参考 scripts/lint_goal_command.py:64 的全文标签验证 | 修逐块边界，不复制参考 linter |
| reject | 仅因参考有 README/manifest 就要求本地增加文件 | 本轮不需要，不把上游声明当测试证据 |
| invent | 在既有 linter 加 stdin 与共用分块 | 本轮设计方案，只有后续回归通过才可称 validated advantage |

## Preserved boundaries
保留编译/执行分离、同轮明确保存、create-only/expected hash/reparse/readback、非 Git source snapshot、五平台隔离、Trellis 开关与提交后归档、scan envelope/ledger/独立检查/同范围回灌/有限轮次。
历史报告可提供背景，但不是当前 provider 行为证据；不改写已归档验证结果。

## Current validation
- PASS：目标 Node suite 64 tests / 64 passed / 0 failed / 0 skipped（本轮真实运行）。
- PASS：本轮 just ci 完成；docs catalog/build、技能元数据、65 个 Python 文件编译、22+16 项 Python unittest、35 项 installer tests 均通过；全仓 Node 416 项中 412 passed、0 failed、4 skipped。跳过项不计为通过证据。
- PASS：父与两个子任务的 task.py validate 均通过；plan_precheck --include-descendants 覆盖 3 个 planning 任务，0 blocking items，全部 R/AC 有映射且无未定义引用。
- REPRODUCED：F1 两个漏检样例与 F2 fence 长度误算；详见 reproduce_lint_gaps.py 的输出。探针没有修改第一方产品或用户合同。
- READ-ONLY VERIFIED：F3 CLI 文件输入、F4 四处示例、F5 path validator、F6 重复与 schema 现状。
- missing evidence：provider 输出/触发质量、跨会话接力、真实安装、人类盲评、线上平台当前行为；没有以测试或静态分析替代。
