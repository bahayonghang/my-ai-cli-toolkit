# Implementation Plan: goal-meta-skill 单 Prompt 修复闭环

## Phase 0 · Baseline and ownership

- [x] 读取本任务 `prd.md`、`design.md`、`implement.md`、context manifests 和目标包局部规则。
- [x] 在隔离 `fix/gm` worktree 运行 `git status --porcelain=v1 --untracked-files=all`；启动时除当前任务工件外无既有产品 dirty path，主工作树中的其他任务/spec/skill 改动不在该 worktree 中且未触碰。
- [x] 重跑 focused baseline：目标 Node tests 50/50、`scripts/check.py`、Python byte-compile 全部通过。
- [x] 未修改或启动其他 active/planning 任务。

## Phase 1 · Canonical review-remediation contract

- [x] 新建 `references/review-remediation-contract.md`，写清 detection、scan envelope、ledger、`PASS|FINDINGS|BLOCKED`、AskUserQuestion 唯一门、同参数重扫、有限轮次、停滞、合取完成与证据边界。
- [x] 更新 `SKILL.md`：新增最小触发和 profile 流程、条件 lint 命令、quality bar 与 resource map；版本升为 `0.8.0`，不扩张 authoring/activation 权限。
- [x] 更新 `default-goal-strategy.md`、`goal-command-playbook.md`、`interview-checklist.md`；只在 review-remediation 场景引用 canonical reference，避免复制整套规则。
- [x] 在 `trellis-goal-cadence.md` 增加窄接缝：review-remediation 闭环完成后才进入既有 commit/archive；不把该规则普遍注入普通 Trellis Goal。

## Phase 2 · Fail-closed linter

- [x] 为 `lint_goal_command.py` 增加 `--review-remediation`，兼容 inline/contract/platform 参数。
- [x] 用独立函数检查 envelope、ledger、feedback edge、question gate、completion；保留具体 stderr 和非零退出。
- [x] 重构 Trellis implementation detection，覆盖不含 archive 的具名实施 Goal，同时保留纯只读 review 与无关文件排除负例。
- [x] 未增加依赖，未改变 `persist_goal_contract.py` 实现。

## Phase 3 · Regression and output eval

- [x] 更新 Node fixture 为闭环形状；保留 50 个现有测试并扩展到 63 个全通过。
- [x] 正例覆盖 inline/contract/default-on/opt-out/fallback；负例逐个删除 envelope/rescan/no-new-prompt/question/zero-open/final-gate 簇。
- [x] 增加 concrete scanner version、corpus drift、same-signature stall、round-cap residual、Trellis detection 和纯只读 review/普通 fix 非触发用例。
- [x] 扩展 `evals/evals.json` 至 47 个 fixture，新增 42–47 且每条 assertion 同时检查需要与禁止行为并保留 `recorded_fixture` 边界。

## Phase 4 · Qiaomu Governed package alignment

- [x] 未添加 scoped `AGENTS.md` 禁止的 `README.md`、`manifest.json` 或第二种包内 eval schema；Qiaomu schema deviation 已标为 `missing evidence`。
- [x] 在本任务 `research/trigger-cases.json` 添加 should-trigger、should-not-trigger、near-neighbor，并在同目录生成 19/19 通过的 `trigger-eval.json`；否定式“不要生成第二条修复 Prompt”仍正确触发。
- [x] 更新 `agents/interface.yaml` 与 `reports/creation-handoff.md`；写入 keep/adapt/reject/invent、evidence labels 和 `missing evidence`。
- [x] 将本任务 prior-art 研究同步为目标包 `reports/prior-art-research.md`，保留日期、metrics 语义、检索器失败与 source shortlist。
- [x] Qiaomu raw exporter 只用于查看 schema skeleton，不能直接覆盖 canonical `reports/skill-ir.json`：本仓库按 scoped `AGENTS.md` 不提供 manifest，raw 输出会合法但不完整地留下空 version/owner/maturity、intent/triggers/workflow/gates。
- [x] 对 canonical IR 做 deterministic repo-native enrichment，补齐 `0.8.0`、owner、governed lifecycle、intent、trigger samples、workflow/gates、permissions/trust/degradation 与 evidence boundary；随后运行 task-local `research/assert_skill_ir.py` 对非空字段和主机绝对路径 fail closed。

## Phase 5 · Validation and independent repair loop

- [x] 目标 Node 63/63、package check、Python compile、Qiaomu trigger/IR 均通过；Qiaomu validate 仅缺 README/manifest 并警告第二种包内 trigger schema，release check 在读取缺失 manifest 时非零，均按 scoped 规则记为 `missing evidence`。
- [x] 运行 `just docs-sync`；内容 diff 仅新增/修改目标包、本任务工件及中英文 `goal-meta-skill` 生成页。Windows checkout 的其他生成页仅有 LF/CRLF stat 噪声，`git diff --name-only` 不包含它们。
- [x] 派发 `trellis-check` 做全范围独立检查；`GM-CHECK-001` 至 `GM-CHECK-005` 已在同一任务内直接修复并复查，没有创建第二条用户修复 Prompt。
- [x] 独立检查修复后 `just ci` 再次退出 0：327 个 Node tests 中 325 passed、2 个既有平台条件项 skipped，包含 `git diff --check`；内容 diff 未越出目标包、本任务与两份生成 docs，未暂存或提交。
- [x] provider-backed、human blind review、fresh-Agent real handoff、telemetry 均保留 `missing evidence`。

## Implementation evidence (2026-08-30)

- focused baseline: 50/50 Node tests; implementation pass: 58/58；独立检查加固后：63/63。
- Qiaomu trigger: first run 17/18 with one pure-exploration false positive; after adding the explicit undecided-direction negative boundary, 18/18 passed；独立检查加入否定式第二 Prompt 正例后 19/19 passed。
- `validate_skill.py`: exit 1 only for missing `README.md` and `manifest.json`; warning for missing incompatible package `evals/trigger_cases.json`。
- `release_check.py --phase local --run-tests`: exit 1 at `manifest.json` read; no release-readiness claim。
- `just ci`: exit 0; docs check/build、40 skills metadata、Python compile、Node suite 与 `git diff --check` passed。

### Independent check repairs

- `GM-CHECK-001`: 原 profile 可由 wrapper 或错误字段中的关键词满足完成/ledger/提问规则。修复为逐个 inline `/goal` block 校验、结构化且非空的 envelope records、canonical field ownership、stable ID/同任务复查关系、矛盾授权检测与合取完成门；新增对应反例。
- `GM-CHECK-002`: Qiaomu negative pattern `第二条修复 Prompt` 会误伤“不要生成第二条修复 Prompt”的正确请求。改为只拒绝肯定式多 Prompt 意图，并新增否定式正例；trigger gate 为 19/19、0 FP、0 FN。
- `GM-CHECK-003`: Governed Skill IR 的 permissions/gates 为空，且生成报告证据表述过宽。同步 interface/IR 的只读、唯一写入器、AskUserQuestion 不扩权、禁止动作、profile/repo/schema gates，并把生成报告证据限定为其记录的本地 deterministic gate。
- `GM-CHECK-005`: Qiaomu raw exporter 在缺少 manifest 的 repo-native package 上只能产出骨架，且 repo-relative `--output` 会再次相对 skill root 解析，曾生成嵌套空字段 IR。删除该污染文件；明确 raw export 仅为诊断、不得作为最终门；canonical IR 必须经 deterministic enrichment 后由 task-local assertion 检查 version/governance、intent/triggers/workflow、permissions/gates/evidence boundary 与无主机绝对路径。
- 复查证据：目标 Node 63/63、`scripts/check.py`、Python compile、task validate、Qiaomu trigger/IR export、secret scan、docs-sync、`just ci` 与 `git diff --check` 均通过；Qiaomu validate/release 仍只保留已声明的 README/manifest/包内 trigger schema 差异。

> 回滚点：Phase 1-4 任一 focused gate 失败时，只回退本任务白名单内目标包/生成 docs 改动；不得用 reset/checkout 覆盖范围外 dirty 文件。Qiaomu 外部包 gate 与仓库规范的已知冲突保留为 `missing evidence`，不删除既有包工件，也不新增冲突文件。

## Phase 6 · Stop before unauthorized closeout

- [x] 用户已于 2026-08-30 明确批准在隔离 worktree 中实施；任务已 `in_progress`，未重复请求规划审阅。
- [ ] 实施与检查完成后先报告真实 diff 与验证；提交当前任务相关 product + planning artifacts 仍需另行授权，禁止 push/amend。
- [ ] 只有验证与提交门通过后才运行具体 `task.py archive .trellis/tasks/08-29-goal-meta-single-pass-repair`；归档授权仍与实施/提交分离。

## Validation commands

```powershell
node --test skills/developer-tools-integrations/goal-meta-skill/tests/*.test.mjs
python -X utf8 scripts/check.py skills/developer-tools-integrations/goal-meta-skill
python -X utf8 -m py_compile skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py skills/developer-tools-integrations/goal-meta-skill/scripts/persist_goal_contract.py
python -X utf8 C:/Users/lyh/.agents/skills/qiaomu-meta/scripts/validate_skill.py skills/developer-tools-integrations/goal-meta-skill
$goalMetaTriggerCases = (Resolve-Path .trellis/tasks/08-29-goal-meta-single-pass-repair/research/trigger-cases.json).Path
$goalMetaTriggerReport = Join-Path (Split-Path $goalMetaTriggerCases) 'trigger-eval.json'
python -X utf8 C:/Users/lyh/.agents/skills/qiaomu-meta/scripts/trigger_eval.py skills/developer-tools-integrations/goal-meta-skill --cases $goalMetaTriggerCases --output $goalMetaTriggerReport
# Diagnostic only: raw stdout is an incomplete skeleton under this repo's no-manifest policy.
python -X utf8 C:/Users/lyh/.agents/skills/qiaomu-meta/scripts/export_skill_ir.py skills/developer-tools-integrations/goal-meta-skill
# Final IR gate: run only after deterministic repo-native enrichment of the canonical artifact.
python -X utf8 .trellis/tasks/08-29-goal-meta-single-pass-repair/research/assert_skill_ir.py
python -X utf8 C:/Users/lyh/.agents/skills/qiaomu-meta/scripts/release_check.py skills/developer-tools-integrations/goal-meta-skill --phase local --run-tests
just docs-sync
just ci
git diff --check
```

实施时遵循 `RTK.md`，外部命令加 `rtk`；PowerShell cmdlet 直接运行。若 Qiaomu helper 的实际 `--help` 与上述参数不同，以当前 helper 为准并把差异记录进验证证据，不能静默跳过。`validate_skill.py` / `release_check.py` 的非零退出不是通过；只在输出严格局限于 scoped `AGENTS.md` 已声明的 README/manifest/trigger schema 差异时归类为预期 `missing evidence`。
