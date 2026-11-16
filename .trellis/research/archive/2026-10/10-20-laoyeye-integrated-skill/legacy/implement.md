# Implementation Plan

用户已明确授权名称改为 laoyeye 并开始实施。以下实施项已完成并验证；任务仍保留待提交状态。一个技能包共用同一验收，使用一个任务，不按 25 方法拆子任务。

## 0. 范围与上下文

- [x] 重读三份规划和 research；核对用户批准、源 SHA、Git 变化、task 状态。目录按宿主日期为 `10-20-...`，研究日期按用户时区为 2026-10-19。
- [x] 写入范围限新包、本任务证据和生成 docs；不改 ref、全局 qiaomu、其他技能和 ignored 激活目录。
- [x] 按 Phase 2 顺序派 implement / check 子代理。dispatch 首行 `Active task: .trellis/tasks/10-20-laoyeye-integrated-skill`；主会话冻结职责，子代理不覆盖其他改动。原生注入优先，缺失才 child-side pull。
- [x] 读取 skill-authoring spec、skills 和类别 AGENTS，确认 manifest validation 已过。

## 1. 行为与来源先冻结

- [x] source-analysis 01–25 转覆盖 fixtures，映射到 24 方法；别名显式性保留，不复制方法。
- [x] 包内保存离线 baseline：固定 SHA、体量和必要资源，不带作者本机绝对路径。
- [x] 为教学、诊断、brief、治理列出依赖闭包与不可丢机制。18 提示语自主撰写，不复制表达；实质 MIT 复用保留完整通知，partner 原许可未读到时先核实 pinned 源。

验证：25 项无空 / 无未知目标，distinct=24，每项有来源与输出 / 禁止行为，而非只检名字。无法完整覆盖就回规划，不以 MVP 为由删能力。

## 2. 入口和触发先于正文扩展

- [x] 创建根 / interface，写自然 description、排除、意图门、方法表。
- [x] 至少 25 正例、12 负例、12 近邻；明确区分显式包内全部功能和隐式发现边界。
- [x] qiaomu cases 内配置领域概念，不能用默认 skill-authoring 词表或不存在的 --semantic-config。
- [x] 锁住 name+description≤650 字符，完整根≤4,000 字符且≤9,000 bytes，不靠放宽阈值过关。

验证：lexical smoke 零失败；负例包含论文、润色、生产 UI、专业 diff / Trellis 审查、原生 Goal、未请求自我探索。不用 prompt 全句 negative pattern 作弊；移除核心触发 / 边界应使对应测试失败。

## 3. 方法与支持资源

- [x] 完成 24 方法，保留各自输入、节奏、输出、进入 / 停止条件，不宣称原文效果等价。
- [x] 分开 grilling frontier、socratic、adversarial 盘问的节奏；不统一成问卷。
- [x] 教学工作区：mission、resume、递增编号、学习证据、glossary、可信 resources、共享 assets；四格式合并按需附录。
- [x] 诊断保留真实红灯、最小化、可证伪假设、回归和清理；人工降级不依赖 Bash。
- [x] brief 根 / interface / 方法都锁住 payload 不激活；治理保留六面状态与范围；长模式显式进入、会话设置可关闭。
- [x] 修复 token 索取、三选变两选、跨 skill 别名；普通请求不预读全分类 / reports / evals。

验证：逐项对照 01–25；无死链、第二 SKILL、硬编码模型 / 本机路径 / 未核实官方限制或原文提取器。

## 4. 确定性检查与真实证据分层

- [x] stdlib 维护脚本 context_report.py：自定位包、入口计数、链接 / 别名、metadata/root 字符和 bytes、三个基线场景；只读文件，仅写明确输出报告，不联网 / 调模型 / 分类意图。
- [x] unittest 测结构、链接、别名、预算和边界；临时副本注入额外 SKILL、断链、失效 alias、超预算根，证明会红。
- [x] output fixtures 至少 25 能力 + 12 边界，符合 repo schema；prompt 自然语言，expected_output / assertions 英文。schema 通过不能称模型通过。
- [x] context-budget 报三场景、支持资源全闭包；无 tokenizer 不填 token 节省，不隐去直接旧叶子便宜的情形。
- [x] 按 context-evaluation 的八类记录真实 agent trace 或 NOT_RUN，不写预期输出冒充 actual。
- [x] 隔离临时目录复制包，禁用 ref / 外部 skill 后核对资源；不改用户安装。package isolation 不等于宿主 discovery。

未来创建文件后的验证命令：

```powershell
python -m unittest discover -s skills/research-learning-knowledge/laoyeye/tests -p 'test_*.py'
python skills/research-learning-knowledge/laoyeye/scripts/context_report.py --output skills/research-learning-knowledge/laoyeye/reports/context-budget.json
python .agents/skills/qiaomu-meta-skill/scripts/trigger_eval.py skills/research-learning-knowledge/laoyeye --cases evals/trigger_cases.json --output reports/trigger-eval.json
python .agents/skills/qiaomu-meta-skill/scripts/export_skill_ir.py skills/research-learning-knowledge/laoyeye --output reports/skill-ir.json
```

已检查 exporter 源码：相对 --output 从 skill 根解析，所以使用 reports/skill-ir.json。runtime 示例必须使用 `"<skill-dir>/scripts/..."`；上列 repo-relative 命令只是本仓库开发命令。

## 5. 文档和外部工具适配

- [x] README：价值、自然例子、单包 / 旧包并存、方法、长模式、输出、副作用、Troubleshooting、验证和未跑项；不写未经证实的发布 / token 优势。
- [x] 来源、license notices、prior-art、keep / adapt / reject / invent、handoff 三种优势标签对齐。
- [x] 导出原始 IR，null 保留；frontmatter 为版本权威。
- [x] qiaomu validate 保存原结果：manifest 缺失是 intentional schema deviation，其他缺陷修复；不宣称全部门禁通过。
- [x] 不执行依赖 manifest 的发布脚本，不改全局 validator、不新增 manifest；独立记录 secret / permission / trust / rollback / isolation。

## 6. 集成与结束

- [x] check 子代理按 PRD + 实际 diff 审查 R1–R9、AC1–AC8，不能只按 diff 自洽性改写要求。
- [x] 针对性测试后 `just docs-sync`，最后根目录一次完整 `just ci`。
- [x] `git status --porcelain -uall` 和 diff whitespace；生成 docs 仅通过 generator。
- [x] 报告真实结果、外部 schema deviation、NOT_RUN、直接叶子成本取舍；实际完成后才宣称实现。
- [x] 没有明确 commit / push / publish 指令不做这些操作；归档与收尾服从后续授权及现场流程。

## 回滚与暂停点

若发现功能缺失、许可不明实质复用、新宿主权限或预算无法满足，停止该项回主会话，继续独立检查。仅回滚本任务新增包与生成 catalog，不 broad reset / clean，不删旧技能、用户资料、worktree 或分支。

## 本轮状态

规划阶段的实际记录见 research/planning-verification.md；本轮实施状态与验收证据另行记录，不能用之前的仓库 baseline 代替实施后检查。

最终实施证据见 research/implementation-status.md 与 research/integration-review.md。实施验收结束时尚未安装、commit、push、发布或归档；用户随后已授权提交全部改动并归档，执行结果由归档 task.json 与会话记录留痕。
