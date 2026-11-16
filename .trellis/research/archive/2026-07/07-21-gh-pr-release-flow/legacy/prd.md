# gh-pr 融入 release 流程并改名（tag/CI/发布打包 + release PR）

## Goal

将 `skills/git-github-collaboration/gh-pr` 从"PR 全生命周期"扩展为"PR + release 交付"技能：新增 release PR 准备、tag 创建与推送、GitHub Release 发布（含产物上传）、release CI 监控与诊断，并整体改名以同时体现 PR 与 release 两半能力（推荐 `gh-pr-release`），版本升至 3.0.0。

## 背景与动机

- gh-pr v2.0.0（07-21-merge-gh-pr-skills 定稿）覆盖 6 类 PR 意图，但链路止步于 merge；merge 之后的 release 链（版本号 PR → tag → GitHub Release → 发布 CI）完全缺失。
- release 操作天然承接 merge 模式的输出（`mergeCommit` OID），与既有安全契约（inspect 默认、GitHub 写逐项授权、pin SHA）同构。若另立独立 release 技能，会在"merge 后打 tag 发 release"这类复合意图上制造新的近邻触发混淆——正是 07-21 合并任务刚消除的问题类型。故选择路由扩展而非新建技能。
- 用户明确要求改名，名称需同时体现 PR 与面向 release 的 PR/发布流程。

## Feasibility（结论：可行，附风险）

**支持：**

- gh-pr 已是路由型结构（SKILL.md 路由 + references 分支），6→8 是自然扩展。
- gh CLI 原生覆盖 release 全链（`gh release create/upload/edit/view`、`gh run list/view/watch`），无需新增脚本或外部依赖。
- 复用共享前置（auth、仓库/PR 解析、不可信输入、rtk、token 回退）与三层安全契约；tag/release 写操作是"GitHub 写逐项授权"层的自然延伸。

**风险与代价（实现中必须处理）：**

- **不可逆面扩大**：publish release（通知 watchers、可标 latest）、push tag（下游消费者与模块代理缓存）、delete/re-push tag、delete release 是新的高危写。必须 draft-first 默认、逐项授权、拒绝 re-tag 类操作。
- **治理定级（Codex 审阅采纳）**：yao-meta operating-modes.md 将 "affects release" 与 "high-permission scripts" 归入 **Governed**；本技能实际执行 tag 推送与 Release 发布，命中判据，任务按 Governed 规划（manifest、trust/conformance/runtime-permission 门、waiver ledger、Review Studio、output_quality_scorecard）。被否决替代方案：维持 Production 并收缩为 inspect/draft/发布计划-only（与原始意图不符，备查于 design.md）。
- **token 预算**：SKILL.md 初始加载于 2026-07-21 实测 995/1000（body 754 tokens），新增 2 条路由 + release 安全条款后默认门很可能超限。沿用合并任务两步策略：先压缩，压不下则如实记 `missing evidence` 并以 Governed 档 1300-token 上限复跑 `resource_boundary_check.py`。
- **改名波及**：目录名、frontmatter `name`、evals `skill_name` 及夹具文内 3 处提名（#13/#16/#17）、reports 两份标题、NOTICE-upstream、interface.yaml（display_name 与 default_prompt 中的 `$gh-pr`）、套件 AGENTS.md、gh-bootstrap evals 转介断言、spec 指南例证、docs 再生。新名含旧名前缀，残留检查必须用词边界（`gh-pr` 后非 `-release` 才算残留）。`.trellis/tasks/`（含 archive）与 workspace journal 的历史名不清理（沿用合并任务先例）。
- **边界重划需双评测**：trigger_eval 证明激活边界（新增 release 正例与近邻负例），evals.json 行为夹具证明内部路由（新路由 ≥2 正例 + 链式用例）。
- 07-21 当天定稿的 v2.0.0 边界再次重划，提交信息需说明这是有意重划。

## Requirements

1. 新增 `references/release-pr.md`（release PR 准备）：先从既有 tags/releases 识别仓库 release tag pattern（`v` 前缀有无、monorepo 组件前缀、prerelease 处理均不得假设；`git describe` 仅作参考），按 pattern 定位锚点并收集变更，提出 semver 版本号方案；版本文件与 changelog 的本地编辑走既有"本地编辑批量授权"层，发布 PR 复用 create.md 的 push/create 流程（不复制其细节）；探测到 release-please/changesets 等自动化拥有版本 PR 时遵从 bot，不另造竞争 PR；首次发布走显式"初始版本"分支。
2. 新增 `references/release-publish.md`（tag + Release + 发布 CI）：**第 0 步发布拓扑判定**（A 自动化全权 / B tag-workflow 管理 / C 手工管理三种互斥拓扑；歧义上报，不默认 C），后续步骤按拓扑分流。目标 commit **绿检协议**：`gh run list --commit` 枚举全部适用 run，逐个核对 `headSha`；只有预期 run 集合完整，且每个 run 的 fresh read 均满足 `status==completed && conclusion==success` 才判绿（`gh run watch --exit-status` 仅用于等待、fine-grained PAT 走轮询回退；无 run、预期集合不完整、pending/不可读 = `missing evidence`，不发布）。tag 校验使用已解析 base remote（不硬编码 origin）：annotated tag 取 peeled `^{}` OID，lightweight tag 在无 peeled 行时取 direct ref OID，再与目标 commit 比较；新 tag 仍采用 annotated tag 单 ref 推送（禁 `--tags`）。draft-first Release（`--verify-tag`）。**产物证据链**：CI 产物按绿检定位的精确 RUN_ID `gh run download`，本地构建在固定到已解析 tag commit 的干净 worktree 中（脏树拒绝）；`upload --clobber` 默认拒绝。publish 默认 `--draft=false --latest=false`，Latest 指针单独授权并以 `gh release list --json isLatest` 验证。**授权展示含副作用枚举**（tag/publish 将触发的 workflows、环境与发布目标）。监控诊断复用 fix-ci 纪律（50 行日志上限、外部提供者分流）。
3. 重写 SKILL.md：改名（推荐 `gh-pr-release`）；description 重写——新增 release 触发词组（中英：创建 release PR/版本号 PR、打 tag、发布 GitHub Release、上传发布产物、release CI 失败诊断），新增排除（registry 发布如 npm/cargo/pypi publish 不属于本技能；从零搭建 release workflow YAML → gh-bootstrap；发布就绪度审计 → fuck-my-shit-mountain），保留既有五近邻排除；路由表 +2；安全契约新增 release 条款（draft-first、tag pin SHA、拒绝 delete/re-push tag、publish/latest/prerelease 逐项授权）；`allowed-tools: Read, Edit, Bash` 不变；version 3.0.0（最后落）。description 总长 ≤1024 字符（check.py 硬门）。
4. 改名落地（live 路径全量、词边界残留检查）：`git mv` 目录；同步更新 evals.json `skill_name` 与夹具文内提名、reports 两份标题、NOTICE-upstream.md、agents/interface.yaml（display_name、short_description、default_prompt）、套件 AGENTS.md（技能清单、allowed-tools 表、License 段）、gh-bootstrap/evals/evals.json 转介断言、`.trellis/spec/guides/skill-authoring-conventions.md` 中的例证名；docs 经 `just docs-sync` 收敛。
5. 三层评测：任务 `research/` 下建 trigger_cases.json（在合并任务用例基础上新增 release 正例 ≥6、should_not_trigger 新增 registry-publish 与 workflow-YAML 搭建类 ≥3、near_neighbor 覆盖 git-commit / gh-bootstrap / fuck-my-shit-mountain 及既有近邻）+ semantic_config.json，trigger_eval 通过；evals.json 每个新路由 ≥2 正例（中英混合）、链式流程 ≥1 例、拒绝面 ≥1 例、新负例 ≥2，**另加发布写保护的对抗夹具 ≥9**（同名 tag 同/异 SHA、自动化已建 release、无 run/pending、多 workflow 歧义、间接 registry/deploy 触发、immutability 仓库、`--clobber` 请求、脏树/非 pinned checkout、Latest 自动判定；清单见 design.md），人工评审留痕 `research/evals-review.md`；另建 output eval ≥5 例，覆盖 `file-backed fixture`、near-neighbor 与 boundary case，生成 baseline/with-skill scorecard 和盲评包，未取得真实 reviewer/model evidence 时必须标 `missing evidence`，不得把 recorded fixture 写成 model-executed evidence。
6. 资源预算：`resource_boundary_check.py` 默认门先跑；失败则记 `missing evidence` 于 `research/resource-budget.md`，以书面兼容上限（默认 1300 tokens，实测后可修订并记录理由）复跑证明资源连通。豁免不得表述为"通过默认门"。
7. 网络最佳实践依据落盘 `research/`（release PR 模式、tag 实践、release CI、gh release CLI、发布安全风险 5 主题 + 综述 `recommended-flow.md`），每条外部结论附来源 URL 与 `Last verified: 2026-07-21`；references 中的命令与 flag 必须与 research 验证结果及本机 gh 实测一致。
8. 不新增 scripts（gh 原生命令足够；若实现中证明 release run 监控必须脚本化，另立任务，不在本任务扩权）。
9. 两份 reports 增补：output-risk-profile.md 新增 release 风险行（不可逆发布、tag 竞态、re-tag 污染缓存、产物与 tag 不匹配、notes 含不可信文本、间接 workflow 触发、clobber 丢产物）；artifact-design-profile.md 新增 release notes / changelog 文案设计段。
10. Yao Governed 治理落地：新增 `manifest.json`（governance.md 字段集：name / version / owner=lyh / updated_at / review_cadence=quarterly / status=active / maturity_tier=governed / lifecycle_stage=governed / context_budget_tier=governed，并声明 `factory_components` / `target_platforms`）；在 manifest 或相邻治理报告中保留字面契约 `input_files`（将评测输入标为 `file-backed fixture`）、`output contract`、`rollback boundary`、`trust report`。门覆盖 resource/validate/trigger/governance、Skill IR + compiler + conformance、output eval + blind pack、Skill Atlas、trust + runtime permissions、registry/package/install、upgrade、adoption drift、review waiver ledger 与 Review Studio；新增 `reports/output_quality_scorecard.md`。Governed blocker 必须修复，不能以“已记录差距”替代通过；warning 只能由具名 reviewer、理由、scope 与 expiry 的 waiver 接受。盲评、遥测、provider-backed model run 等不可得证据一律如实标 `missing evidence`，不得把 recorded fixture 写成实测证据；无外部分发目标时仅免除目标专属 cross-packaging，仍做本地 generic package/install/verify 证据。

## Acceptance Criteria

- [ ] 目录已 `git mv` 为新名；`rg -n -P "gh-pr(?!-release)" skills platforms .trellis/spec` 无残留（`.trellis/tasks/` 与 workspace 不在检查范围；若最终定名不同，检查词边界随之调整）
- [ ] SKILL.md：8 类路由、release 安全条款、description 含新触发与新排除且 ≤1024 字符、version 3.0.0、`allowed-tools: Read, Edit, Bash`；`just skills-check` 通过
- [ ] `references/release-pr.md`、`references/release-publish.md` 存在，命令/flag 与 research 及本机 gh 实测一致；不复制 create/fix-ci 已有细节而是内部路由引用
- [ ] release-publish.md 可逐条对照：三拓扑分流（歧义不默认 C）、全部适用 run 的 status/conclusion fresh-read 绿检集合 + missing evidence 规则 + PAT 轮询回退、annotated peeled / lightweight direct OID 比较与 resolved remote、产物证据链（精确 RUN_ID / pinned 干净 worktree / clobber 默认拒绝）、publish 默认 `--latest=false` + Latest 单列授权、副作用枚举进授权展示
- [ ] Governed 门齐备：manifest.json 字段及 `input_files` / `output contract` / `rollback boundary` / `trust report` 契约完整；resource/validate/trigger/governance（score ≥90）、IR/compiler/conformance、output eval/盲评包、Skill Atlas、trust/permission、registry/package/install、upgrade/drift、waiver ledger 与 Review Studio 均有可追溯结果；blocker 为零，warning 已修复或取得合规 waiver；`reports/output_quality_scorecard.md` 存在且 missing evidence 标注诚实
- [ ] trigger_eval 通过：release 正例召回与近邻/排除负例全部通过；output eval 至少 5 例且 with-skill 不劣于 baseline，盲评/执行证据的真实状态未被夸大
- [ ] evals.json：`skill_name` 为新名，8 模式夹具齐备（新路由各 ≥2 正例、链式 ≥1、拒绝面 ≥1、新负例 ≥2、对抗夹具 ≥9），无夹具再以旧名指称本技能；人工评审记录留痕 `research/evals-review.md`
- [ ] 两份 reports 标题与内容更新完成（release 风险行 + release 文案段）
- [ ] 资源预算门：默认通过，或 missing evidence 记录 + 兼容上限复跑通过
- [ ] `research/` 含 5 主题调研文件 + 综述 `recommended-flow.md`，外部结论均有 URL 与验证日期
- [ ] `git status --porcelain -uall` 确认无未提交 docs 手改后 `just docs-sync`；docs 无旧名残留（同词边界）；`just ci` 全绿
- [ ] 提交信息说明：对 07-21 v2.0.0 边界的有意重划 + 改名动机

## Notes

- pre-bash hook 拦截 `rm -rf`；目录改名用 `git mv`，备份用 `mv`。
- PostToolUse formatter 会重排 Markdown 表格；需要精确格式的文件走 Bash 写入。
- `just ci` 不执行 Python 单测；本任务计划不改 scripts/，若实现中被迫改动，必须显式跑 `python -m unittest discover -s <skill>/tests -p "test_*.py"`。
- 仓库 `status.showUntrackedFiles=no`：验证"干净"必须用 `git status --porcelain -uall`。
- 子代理向任务目录写 summary/report 类命名的文件会被写钩子拦截（本次 `summary.md` 写入失败、改名 `recommended-flow.md` 后成功）；后续给子代理派活时避免此类文件名。
- 本机 gh 2.96.0 实测（2026-07-21）：`gh run view` **无** `--exit-status`；`gh run watch --exit-status` 存在但不支持 fine-grained PAT；`gh run list` 支持 `--commit SHA`；`isLatest` 仅在 `gh release list --json`，`isImmutable` 在 view/list 均有；`gh release edit --latest=false` flag 解析通过（API 行为实施时复核）；`upload --clobber` 帮助原文确认"上传失败则原资产丢失"；immutability 为仓库可选功能、仅 publish 后生效。research 两份文件的对应更正注记已加。
- 名称决策：推荐 `gh-pr-release`（保留套件 `gh-` 前缀，两半能力都在名字里）；备选 `gh-delivery`（丢失 pr/release 关键词，放弃）、`gh-pr-and-release`（冗长，放弃）。最终定名在 review gate 与用户确认。
