# 独立 diff 审查思想写入 code-auditor 并收紧双审查 skill 边界

## Goal

把用户给出的独立 Git diff 审查思想写成 `code-auditor` 的 `pr`/`dir` 默认姿态，并改写两个 skill 的触发词与文档，使路由器能把「合并风险审查」和「可维护性审查」分开。

用户价值：同一句「帮我审查代码」不再随机落到两个包；独立审查者、功能回归、遗漏场景、错误假设、并发、测试盲区这类请求稳定进入 `code-auditor`；结构、抽象、拆分机会稳定进入 `code-quality-review`。

## Background

用户提供的固定用法：

> 请以独立代码审查者的身份检查当前 Git diff。不要根据原开发思路替改动辩护，重点寻找功能回归、遗漏场景、错误假设、并发问题和测试盲区。暂时不要修改代码，先按严重程度列出问题，并提供对应文件和证据。

条款对照见 `research/prompt-mapping.md`。残留碰撞见 `research/current-collisions.md`。

既有决定（保持，不重开）：

- 两个 skill 互补，不合并（`07-22-clarify-code-review-skill-boundary`，`skills/development-workflows/AGENTS.md`）。
- `code-auditor` `project` 路由继续做六维全谱审计；正向用词是 full-spectrum / 全维度，禁止单独写「架构和质量」（`07-17-code-auditor-audit-upgrade`）。
- 两边严重度词汇保持两套（auditor：`critical`…`info` → `[必须修复]`；CQR：`Verdict` + `CQ-ID` + `Confidence`）。

## Confirmed facts

- 条款映射把该 prompt 全部落到 `code-auditor` 的 `pr`/`dir`，不落到 CQR，也不需要第三个 skill。见 `research/prompt-mapping.md`。
- 审计入口 `description` 已声明 review a PR / inspect git changes / 全维度代码审计，并排除可维护性-only 与非代码健康报告。`skills/development-workflows/code-auditor/SKILL.md:3`
- 审计入口未声明：独立审查者、不要替改动辩护、功能回归、遗漏场景、错误假设、并发、测试盲区、禁止改产品代码。
- CQR 入口声明了 `PR code quality feedback` 与 `架构质量审查`。`skills/development-workflows/code-quality-review/SKILL.md:3`
- CQR 正文和 eval #7 已把全谱审计交给 auditor；frontmatter `description` 没有这条排除。
- CQR eval #3 要求抓住 `evals/files/order_service.ts` 里先 `charge` 再 `orders.update` 的非原子更新。这是正确性 / 并发缺陷。
- Auditor `allowed-tools` 含 `Write`。CQR 已规定产品代码只读，仅 opt-in 写 `code_review/`。
- `references/communication-guide.md` 把审查目标写成「共同提高」，并在作者不同意时「寻求共识」。
- 套件 eval 规范：`evals/evals.json` 用 git-commit schema，CI 不执行；近邻负例至少两条。`skills/development-workflows/AGENTS.md`
- Frontmatter `description` ≤1024 字符、无尖括号。`scripts/check.py:197-199`
- 改 SKILL.md frontmatter 后必须 `just docs-sync`。`.trellis/spec/guides/skill-authoring-conventions.md`
- qiaomu-meta `trigger_eval.py` 的概念表写在 cases JSON 里，不需要单独 `semantic_config.json`。本仓库权威门禁是 `just ci`，不是 qiaomu 的 README/manifest 校验。

## Requirements

- R1. 用户这段 prompt 的思想写入 `code-auditor`，作为 `pr` 与 `dir` 的默认姿态，不新增 skill，不做成 CQR 模式。
- R2. `pr`/`dir` 的主搜查顺序固定为：功能回归、遗漏场景、错误假设、并发、测试盲区。安全与性能在 diff 引入风险时仍要报。可读性、结构、架构只在构成合并风险时进入 `pr`/`dir` 报告。
- R3. `pr`/`dir` 审查者不得根据原开发思路替改动辩护。不确定时提问。阻塞问题仍按阻塞问题写出。中文建议语气与英文直陈语气保持现有 Review Tone。
- R4. 审查过程不修改产品代码。`Write` 只用于用户明确要求的报告落盘（现有 `docs/audits/` opt-in）。
- R5. `code-auditor` `description` 增加独立审查 / Git diff / 功能回归 / 遗漏场景 / 错误假设 / 并发 / 测试盲区等正向触发，并排除可维护性-only、直接改代码、非代码健康报告。同时收录 `全维度代码审计` 与 `全维度的代码审计`（当前 eval #6 带「的」，baseline trigger_eval 对无「的」形式打了 0 分）。长度 ≤1024，无尖括号，含中英触发语。
- R6. `project` 路由、六维全谱、全维度用词、对 fuck-my-shit-mountain 的排除保持 07-17 的合同。
- R7. `code-quality-review` `description` 去掉 `PR code quality feedback` 和 `架构质量审查`。正向只保留可维护性、结构、抽象、改动的分层与归属、重构机会。排除：裸 PR / 独立 diff 审查、全维度审计、系统架构审计、落地重构、纯安全 / 纯格式 / 性能 profiling。
- R8. CQR 清单把「半成功状态 / 非原子更新」从本透镜拿开，交给 auditor。CQR eval #3 不再要求抓住支付非原子更新。`order_service.ts` 夹具可保留给结构问题（`any`、薄包装、重复优惠逻辑）。
- R9. 两边 `evals/evals.json` 增加：用户原句作为 auditor 正例、CQR 近邻负例；至少保留各两条近邻负例。
- R10. 更新 `skills/development-workflows/AGENTS.md` 路由节，使目的、触发、姿态、输出契约与 R1–R7 一致。
- R11. 邻居 one-liner 若因此变成假陈述，只改那一句：`code-refactor`、`trellis-plan-review`。不改 `gh-pr-release`。
- R12. 任务目录留下可复现的 qiaomu-meta trigger cases（每 skill 一份）。脚本不可用时记 `missing evidence`，不把计划当证据。
- R13. Auditor `agents/interface.yaml` 的 `default_prompt` 与新 description 对齐。CQR 若新增 interface，按套件规范只允许 `agents/interface.yaml`；本任务不强制给 CQR 补 interface。

## Acceptance Criteria

- [ ] AC1（R1, R2, R3, R4）：`code-auditor/SKILL.md` 对 `pr`/`dir` 写明独立审查姿态、五类主搜查、禁止替改动辩护、禁止改产品代码。`project` 路由仍指向 `references/audit-workflow.md`。
- [ ] AC2（R5, R6）：auditor `description` ≤1024、无尖括号，含独立审查与五类风险的中英触发，仍含全维度项目审计与两条 07-17 排除语。
- [ ] AC3（R7）：CQR `description` 不再含 `PR code quality feedback` 或 `架构质量审查`；含可维护性 / 代码质量审查正向词；含全维度与独立 diff 审查排除语。
- [ ] AC4（R8）：CQR 清单不再把半成功状态当作本透镜必报项。evals.json #3 不再断言非原子支付。结构断言（`any`、薄包装或重复逻辑）仍在。
- [ ] AC5（R9）：auditor evals 含用户原句正例，断言 findings 先于总结、带文件证据、不改产品代码、覆盖回归或并发或测试盲区至少一类。CQR evals 含同一原句近邻负例，断言应交 auditor。
- [ ] AC6（R9）：两边 evals 仍各有 ≥2 条 routing-negative；id 连续；schema 为 `id` / `prompt` / `expected_output` / `files` / `assertions`。
- [ ] AC7（R10）：`skills/development-workflows/AGENTS.md` 路由节写明：裸 PR / 独立 diff → auditor；可维护性 / 结构 → CQR；全维度 → auditor `project`；落地重构 → `code-refactor`。
- [ ] AC8（R11）：`code-refactor` 与 `trellis-plan-review` 的路由句在变更后仍为真。
- [ ] AC9（R12）：`research/` 下有两份 trigger cases JSON；对可用的 `trigger_eval.py` 各跑一次并留下报告。脚本缺失则在 `research/` 记 `missing evidence`。
- [ ] AC10（R5, R7, R13）：`just docs-sync` 后 `just ci` 通过。auditor `agents/interface.yaml` 与新 description 一致。
- [ ] AC11（R5, R7）：两 skill 的 `version` 因行为变更上调（auditor 0.3.0 → 0.4.0，CQR 0.2.0 → 0.3.0）。

## Out of scope

- 合并两个 skill，或统一严重度词汇。
- 改 `references/rules/*.json` 正则，或重写 `BACKGROUND.md` 里的旧状态机。
- 给 CQR 补 README / manifest / `agents/interface.yaml`（除非为实现 R13 所必须；R13 明确不强制）。
- 把 SKILL.md 压到 qiaomu 默认 1000-token 初始负载。
- 改 `gh-pr-release`、`dual-steelman`、`fuck-my-shit-mountain`。
- 实现阶段改产品代码或提交本任务之外的文件。

## Key decisions

- D1. 思想放入 `code-auditor` `pr`/`dir` 默认姿态，不放到 CQR，不新建 skill。依据：`research/prompt-mapping.md` 条款表。
- D2. `project` 六维全谱保持不变。依据：07-17 已锁定；用户 prompt 针对当前 Git diff。
- D3. `pr`/`dir` 里可读性 / 架构降为「仅合并风险」。依据：用户列出的重点搜查不含结构与可维护性。
- D4. 非原子更新从 CQR 必报项移出。依据：用户把并发交给独立 diff 审查。
- D5. 中文建议语气保留；反辩护是内容规则，不是改成命令式辱骂。

## Risks

- 路由先看 description。只改正文、不改 frontmatter，碰撞会留下。
- CQR description 若写入「独立审查」作为正向概念，qiaomu trigger_eval 会把用户原句误判为 CQR。排除语可写在 description，正向概念表不得收录 auditor 专属短语。
- `evals/evals.json` 不被 CI 执行。路由回归依赖人工读 evals + 任务内 trigger_eval。
- `communication-guide.md` 若整篇改成对抗语气，会和现有中文 Review Tone 冲突。本任务只补反辩护短节，不重写文化文档。
