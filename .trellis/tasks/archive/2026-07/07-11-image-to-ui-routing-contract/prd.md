# 收紧 image-to-ui 路由、接口与评测契约

## Goal

将 `image-to-ui-skill` 明确按 yao-meta 的 **Production**（团队复用、公开可安装）模式治理：精简 description，补齐 references 索引，保持 `agents/interface.yaml` 与路由契约一致，并把 trigger/output 回归样例固化到包内 `evals/evals.json`。

## Confirmed Facts

- 当前 description 为 335 字符，混入通道选择、交付形态等执行策略。
- 原任务草案为 243 字符，仍超过“≤200 字符”验收且保留执行策略。
- `references/` 有 8 个 Markdown 文件，SKILL.md 详细规则索引只列 6 个。
- 当前 `agents/interface.yaml` 的 default prompt 可以承载执行策略，但 plan 未要求它与新 description 同步检查。
- `skills/developer-tools-integrations/AGENTS.md` 要求 eval 统一放在 `evals/evals.json`，使用 `assertions`，并至少包含两个 near-neighbor routing-negative。
- 本机 `yao-meta-skill` 安装包缺少整个 `references/` 与 `scripts/` 目录，无法运行其声明的 `trigger_eval.py`、Review Studio 与完整 Skill OS 自动门禁。

## Requirements

- R1 将 frontmatter description 收敛到硬上限 200 Unicode 字符，只保留能力、触发语和明确 routing exclusion；不得包含通道回退顺序、截图步骤或 iOS 外框等执行策略。
- R2 description 必须覆盖中文与关键英文触发：UI/reference screenshot to code、clickable app demo、mobile/iOS prototype、高保真参考图复刻；明确排除 standalone image generation 与无参考图的普通 UI polish。
- R3 同步更新 `agents/interface.yaml`：`short_description` 与 description 不冲突；`default_prompt` 可保留 image2/fallback、资产集成和截图验真等执行策略。
- R4 SKILL.md 详细规则索引覆盖 `references/` 全部 8 个文档，并说明 fashion / museum 案例的适用场景。
- R5 新增 `evals/evals.json`，遵循仓库 schema。至少 6 个 routing-positive 与 6 个 routing-negative；负例至少覆盖 standalone image generation、无参考图 UI polish、纯海报、纯落地页、数据可视化和通用前端开发。
- R6 positive eval 同时包含 output assertions：应拆分代码 UI/位图资产、需要生图时使用登记通道、生成资产必须接回页面、可点击交互和截图验真。不得只记录主观“会触发”。
- R7 在本子任务目录生成 `trigger-eval.md` 与 `gate-report.md`。`gate-report.md` 明确 Production 模式、已执行门禁、waiver、rollback boundary，并把无法运行的 yao-meta 自动化写为 `missing evidence`，不得伪造通过。
- R8 不要求 Governed 专属的 `trust report` 或 `reports/output_quality_scorecard.md`；若实施中升级为 release-critical/Governed，必须回到 planning 补齐。

## Acceptance Criteria

- [x] 新 description ≤200 Unicode 字符，且不含 fallback 顺序、截图流程或 iOS 框架交付策略。
- [x] `agents/interface.yaml` 三字段存在并与新路由/执行边界一致。
- [x] 详细规则索引中的文件名集合与 `references/*.md` 文件名集合完全相等。
- [x] `evals/evals.json` 可被 JSON parser 读取，使用 `skill_name/evals/assertions` schema，≥6 正例、≥6 负例，且至少两个 near-neighbor negative 明确路由到更合适能力。
- [x] `trigger-eval.md` 逐条记录输入、期望路由、实际判定和结论；全部符合预期。
- [x] `gate-report.md` 包含 boundary、exclusion、output contract、rollback boundary、waiver 与 `missing evidence`。
- [x] `just skills-check` 和 `git diff --check` 通过；docs-sync/docs-check 明确由父任务集成阶段负责，不阻塞本 child 的独立完成。

## Implementation Evidence

- Description length: 199 Unicode characters.
- Reference index: 8/8 filenames matched.
- Package evals: 12 total, 6 routing-positive and 6 routing-negative, all with `assertions`.
- Manual trigger matrix: 12/12 PASS; unavailable yao-meta automation remains `missing evidence`.
- `python scripts/check.py skills/developer-tools-integrations/image-to-ui-skill`: passed.
- `just skills-check`: passed for all skills.
- `git diff --check`: passed.
- Spec sync: no new spec required; existing `skill-authoring-conventions.md` already defines description/interface/evals rules.

## Dependencies

- 本子任务不依赖 wrapper 子任务，可独立实施。
- validator 子任务中的结构测试依赖本子任务先完成最终 references 索引，因此 validator 子任务必须在本子任务之后完成。
- 生成 docs 由父任务在全部子任务完成后统一执行。

## Out Of Scope

- 不修改 image2 wrapper 实现。
- 不修改 demo HTML/CSS/JS、资产或 validator。
- 不把本次维护提升为 Governed/release-critical 发布。

## Open Questions

无。Production 模式与仓库 eval/interface 约定已由现有代码库确定。
