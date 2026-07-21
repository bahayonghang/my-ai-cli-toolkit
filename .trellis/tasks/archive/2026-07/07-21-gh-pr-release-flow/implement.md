# Implement — gh-pr → gh-pr-release：release 链路扩展 + 改名

前置：prd.md / design.md 定稿（含 Codex 审阅修订：Governed 定级、发布拓扑判定、绿检协议、peeled tag 比较、产物证据链、Latest 分离授权、对抗夹具）；research/ 五主题调研 + 综述 `recommended-flow.md` 落盘且每条外部结论有 URL 与 Last verified；Yao 模式 **Governed**。全程不动 code-auditor / code-quality-review / git-commit 等非波及技能；不新增 scripts。

## 执行清单

1. [ ] 通读技能全部现有文件 + 套件 `AGENTS.md` + spec 指南；在任何修改前把 v2.0.0 的 resource/governance/registry/package 基线 JSON 写入任务 `research/`（upgrade_check 的 previous-package 输入，不把生成物塞进旧技能目录）；确认 research/ 落盘完整（含两份更正注记）。**本机 gh 实测**验证 references 将引用的每个命令与 flag：`gh release create --help`（--draft/--verify-tag/--generate-notes/--notes-start-tag/--notes-from-tag/--notes-file/--prerelease/--latest/--target/--fail-on-no-commits）、`gh release edit`（--draft=false 与 --latest=false 的 API 实际行为，对临时私有仓库 draft 实测或如实标 missing evidence）、`gh release upload --help`（--clobber）、`gh release download --help`、`gh release view/list --json` 字段（isImmutable / isLatest 归属已初测，复核记录）、`gh run list --commit SHA --json databaseId,workflowName,headSha,status,conclusion,event`、`gh run watch --exit-status`（含 fine-grained PAT 限制）、`gh run view --json status,conclusion` 轮询回退、`gh run download RUN_ID`（可在公开仓库只读验证）；同时验证 `git ls-remote REMOTE "refs/tags/T" "refs/tags/T^{}"` 对 annotated 与 lightweight tag 的输出形态
   - 验证：实测结果记入 `research/gh-release-cli.md`（补"本机 gh 2.96 实测"段）；出现与 research 结论冲突的 flag 以本机实测为准并标注
2. [ ] 触发门先行：在现路径重写 SKILL.md description（新增 release 正面触发中英词组、新增 registry/workflow-YAML 排除、保留五近邻；`python -c "len(...)"` 实测 ≤1024）；写 `research/trigger_cases.json`（以 07-21-merge-gh-pr-skills 归档用例为基：release 正例 ≥6 / should_not_trigger 新增 ≥3 / near_neighbor 全覆盖）+ `research/semantic_config.json`；跑 `python "$USERPROFILE/.claude/skills/yao-meta/scripts/trigger_eval.py" --cases … --semantic-config … --description-file skills/git-github-collaboration/gh-pr/SKILL.md`
   - 验证：正例召回与近邻/排除负例全部通过。不过 → 只改 description 重跑，不得进入步骤 3。此门只证明激活边界，内部路由证据在步骤 6
3. [ ] 改名落地：`git mv skills/git-github-collaboration/gh-pr skills/git-github-collaboration/gh-pr-release`（最终名以 review gate 确认为准）；按 design 波及表清扫提名：SKILL.md frontmatter `name`、evals `skill_name` 与 #13/#16/#17 文内提名、reports 两份标题、NOTICE-upstream.md、interface.yaml（display_name / short_description / default_prompt 内 `$gh-pr`）、tests 文档串（实测确认）、套件 AGENTS.md、gh-bootstrap evals 转介断言、spec 指南例证名
   - 验证：`rg -n -P "gh-pr(?!-release)" skills platforms .trellis/spec` 无残留；`just skills-check` 通过
4. [ ] 重写 SKILL.md 正文：路由表 +2（prepare release PR -> release-pr；tag/publish/monitor release -> release-publish）；安全契约第 3 层追加 tag 推送 / release 创建 / 发布 / 产物上传 / latest-prerelease 逐项授权与 re-tag 拒绝面；同步压缩既有措辞冲 ≤1000 tokens；version 暂不动
   - 验证：`just skills-check` 通过
5. [ ] 写 `references/release-pr.md`（tag pattern 识别→锚点定位→变更收集→semver 提案→自动化探测与遵从→本地 bump/changelog 编辑→转介 create.md 发布）与 `references/release-publish.md`（**拓扑判定分流 A/B/C**→确定预期 CI run 集合并要求全部适用 run 的 status/conclusion fresh-read 成功→missing evidence + PAT 轮询回退→annotated peeled / lightweight direct OID tag 校验与 resolved remote→annotated tag 单 ref 推送→draft-first Release→产物证据链（精确 RUN_ID 下载 / pinned 干净 worktree 本地构建 / clobber 默认拒绝）→publish `--draft=false --latest=false` + Latest 单列授权→副作用枚举进授权展示→run 监控与 fix-ci 纪律诊断→verify fresh read）；merge.md Verify 段加一行链式转介
   - 验证：逐条命令与 flag 均能在步骤 1 实测清单或 research 文件中找到依据；对 create/fix-ci 无细节复制（仅转介）；design.md 的拓扑/绿检/证据链条目逐条可在文中定位
6. [ ] evals + 治理产物：evals.json 增 release-pr ≥2 / release-publish ≥2 / 链式 ≥1 / 拒绝面 ≥1 / 新负例 ≥2 / **对抗夹具 ≥9**（design.md 清单：tag 同/异 SHA、自动化已建 release、无 run/pending、多 workflow 歧义、间接 registry 触发、immutability、clobber、脏树/非 pinned checkout、Latest 自动判定）；新增 output eval ≥5 例，覆盖 `file-backed fixture`、near-neighbor、boundary，并准备 baseline/with-skill 输出与可判定 assertions；更新 interface.yaml；reports 两份增补 + `reports/output_quality_scorecard.md`；新增 `manifest.json`（core governance 字段、context_budget_tier、factory_components、target_platforms），并在 manifest/报告中保留 `input_files`、`output contract`、`rollback boundary`、`trust report` 契约；人工评审行为夹具并留痕 `research/evals-review.md`
   - 验证：所有 JSON 可解析（`python -m json.tool`）；无夹具以旧名指称本技能；manifest 值合法且包边界字段可定位；output eval case ≥5 且三类覆盖齐全
7. [ ] 分层执行 Governed 门（各 CLI 先以 `--help` 复核并显式指定输出路径）：① `validate_skill.py`、默认 `resource_boundary_check.py`（失败则记录 `missing evidence`，以 Governed 1300 上限复跑；1300 仍超则停下重设计）、`trigger_eval.py`、`governance_check.py --require-manifest`（score ≥90）；② `export_skill_ir.py` → `compile_skill.py` → `run_conformance_suite.py`；③ `run_output_eval.py` 生成 scorecard、blind pack 与独立 answer key，并把无 provider/reviewer 的部分保持为 `missing evidence`/pending；④ `build_skill_atlas.py`；⑤ `trust_check.py`、generic `cross_packager.py`、`verify_package.py`、`simulate_install.py`、`probe_runtime_permissions.py`；⑥ `registry_audit.py` + `upgrade_check.py` 对比步骤 1 的 v2.0.0 基线；⑦ `render_adoption_drift_report.py`（无真实 telemetry 则明确 missing evidence）、`render_review_waivers.py`、`render_review_studio.py`。无外部分发目标只将目标专属 packaging 记 n/a，不跳过 generic 本地包/安装验证。所有 blocker 必须修复；warning 未修复时必须取得具名、带理由/scope/expiry 的 waiver，不能由代理自行接受。门收敛后才把 version 落为 3.0.0
   - 验证：默认预算门通过，或如实保留默认失败且 1300 上限通过；with-skill output eval 不劣于 baseline；Governed 报告链可追溯，Review Studio blocker=0，warning=0 或均有有效 waiver；任何 recorded fixture 不得标成 model-executed evidence
8. [ ] `git status --porcelain -uall` 区分任务既有未跟踪产物与意外 docs 手改 → `just docs-sync` → `just ci`；docs 下旧名页面消失、新名页面含两条 release 路由；对 docs 再跑 `rg -n -P "gh-pr(?!-release)" docs` 词边界残留检查
   - 验证：全绿 + 残留为零
9. [ ] trellis-check 质量检查 → Phase 3（spec 更新评估：技能改名清扫清单是否值得沉淀进 skill-authoring-conventions.md；git-commit 提交，提交信息说明对 07-21 v2.0.0 边界的有意重划与改名动机）

## 审查门

- 步骤 2 是硬门：trigger_eval 不过不得改名、不得写 references。
- 步骤 3 完成前不得动正文与 references（避免 eval 反复期的返工波及）。
- 步骤 5 的命令依据是硬要求：references 中任何 gh flag 没有实测/research 依据即视为未完成。
- 步骤 7 的治理门是硬门：blocker 未清零不得用记录或 waiver 代替通过；warning 仅可由合规 waiver 接受。门未收敛前 version 不落 3.0.0、不得进入步骤 8。
- 步骤 8 全绿前不得报告完成。

## 回滚点（精确清单，禁止宽范围 checkout）

本任务 git 触碰清单：`skills/git-github-collaboration/gh-pr/`（git mv 后为新名目录）、`skills/git-github-collaboration/AGENTS.md`、`skills/git-github-collaboration/gh-bootstrap/evals/evals.json`、`.trellis/spec/guides/skill-authoring-conventions.md`。

- 步骤 2 失败：仅 description 改动，反向补丁恢复即无损。
- 步骤 3–7 失败：`git mv` 回原名 + 按实施前保存的逐文件基线补丁反向恢复；每次回滚前 `git status --porcelain -uall` 识别并绕开非本任务改动。
- docs/ 一律 `just docs-sync` 收敛，不 checkout。
