# Design — gh-pr → gh-pr-release：8 模式路由 + release 交付链

## 扩展形态

gh-pr 从 6 模式扩展为 8 模式：create / review / merge / respond / address-comments / fix-ci / **release-pr** / **release-publish**，并整体改名（推荐 `gh-pr-release`，最终名 review gate 确认）。不改变既有架构（SKILL.md 路由 + references 细节 + scripts 确定性逻辑 + 双评测），新增分支复用共享前置与三层安全契约。**不新增 scripts**：release 链由 gh 原生命令覆盖（`gh release create/upload/edit/view`、`gh run list/view/watch`）；监控若被证明必须脚本化，另立任务。

新路由为 2 条而非 3-4 条的理由：tag 创建、Release 发布、发布 CI 监控共享同一 inspect 前置（目标 commit 验证 + tag 存在性检查），是一条 merge 后链路，拆开会强迫用户在一次发布里跨三个分支；release PR 准备则是 merge 前的独立意图。"帮我发一个版本"复合意图 = release-pr → merge（既有）→ release-publish 链式路由（同 eval #15 的 fix-ci→merge 链模式）。

## 目标目录结构（增量）

```
skills/git-github-collaboration/gh-pr-release/     # git mv 自 gh-pr/
├── SKILL.md                    # 改名 + 8 模式路由 + release 安全条款 + 3.0.0
├── references/
│   ├── create|review|merge|respond|address-comments|fix-ci.md   # merge.md Verify 加一行链式转介
│   ├── release-pr.md           # 新增：release PR 准备
│   └── release-publish.md      # 新增：tag + Release + 发布 CI
├── reports/                    # 两份 profile 增补 + output/governance/trust/runtime/review 证据
├── manifest.json               # Governed 元数据、组件/目标声明及包边界契约
├── evals/evals.json            # skill_name 改名 + 8 模式夹具 + 对抗夹具
├── agents/interface.yaml       # display_name / short_description / default_prompt
└── NOTICE-upstream.md          # "integrate with gh-pr" 提名更新
```

## release-pr.md 流程设计

**Inspect（免授权）：**

1. 共享前置（auth、仓库解析）后，**先识别仓库的 release tag pattern**：从既有 tags/releases 归纳（`git tag --list --sort=-v:refname` + `gh release list`），显式处理 `v` 前缀有无（约定因仓库而异，不得假设固定 `v`）、monorepo 组件前缀（如 `pkg-vX.Y.Z`）、prerelease/draft 条目；`git describe --tags` 会命中最近的任意 tag（含非 release tag），仅作参考，锚点必须按识别出的 pattern 过滤。tag 与 release 锚点不一致（有 tag 无 release、反之）时报告并让用户选锚点。首次发布（无匹配 tag）显式走"初始版本"分支。
2. 收集自锚点以来的变更：`git log --oneline LAST_TAG..BASE`（或 compare API）；若仓库用 Conventional Commits，按 feat/fix/BREAKING 分类推导 semver 建议（0.x 阶段 breaking→minor 的惯例单独说明），否则列变更让用户定版本；新版本号格式沿用识别出的 tag pattern。
3. 探测版本承载文件（package.json / Cargo.toml / pyproject.toml / VERSION 等）与 changelog 惯例（keep-a-changelog / 自动生成）；多处版本文件全部列出，歧义时问。
4. **探测既有发布自动化**：存在 release-please / changesets / semantic-release 配置或 release workflow 时，报告并遵从——bot 拥有版本 PR 时本技能只操作 bot 的 PR（review/merge 既有路由），不手工另造竞争 PR。此判定依据 research/release-pr-patterns.md。

**Propose → Edit（本地编辑批量授权层）：** 展示版本号方案、逐文件 bump 计划、changelog 草稿（内容源自 commits/PR 文本 = 不可信输入，照 untrusted 纪律呈现）；批准后编辑，>3 文件先确认（既有规则）。不推送。

**Publish：** 分支命名按仓库惯例（如 `release/vX.Y.Z`），push + PR 创建**转介 create.md**（不复制细节）；release PR 的 body 附变更摘要与版本依据。

## release-publish.md 流程设计

**第 0 步——发布拓扑判定（先于一切 tag/release 写，结果进授权展示）：** 读取 `.github/workflows/*` 与 release-please/changesets/semantic-release 配置，判定三种互斥拓扑并分流：

- **A 自动化全权**（bot/Action 拥有 tag + Release 创建）：本技能**不建 tag、不建 release**，只操作 bot 的 PR（既有路由）与监控 bot 产出，至多对 bot 留下的 draft 执行经授权的 publish。
- **B tag-workflow 管理**（`on: push: tags` workflow 负责建 Release/附产物，如 softprops/action-gh-release）：本技能只做经授权的 tag 推送；Release 由 workflow 创建，技能监控该 run，对 workflow 产出的 release 仅做经授权的编辑/publish，**不并行 `gh release create`**。
- **C 手工管理**（无上述自动化）：本技能执行完整链（tag → draft → 产物 → publish）。

判定歧义（多个 workflow 都建 release、配置残缺）= 报告并让用户裁决，不得默认 C。`on: release: [published]` 拓扑的特别规则：release-run 在 publish 之后才存在，无法在 publish 前证明其绿——"绿"要求前移到目标 commit 的 CI run，且 publish 授权展示必须写明"发布后将触发 X workflow"。

**Inspect（免授权）：**

1. 解析目标 commit：默认取已合并 release PR 的 `mergeCommit`（fresh read `gh pr view --json state,mergeCommit`），或用户指定 SHA；验证该 commit 在目标分支上。
2. **绿检协议**（本机 gh 2.96.0 实测：`gh run view` 无 `--exit-status`；`gh run watch --exit-status` 存在但不支持 fine-grained PAT）：先从目标分支规则、合并 PR 的 check rollup 与 workflow 配置确定预期 run 集合，再用 `gh run list --commit SHA [--workflow W] --json databaseId,workflowName,headSha,status,conclusion,event` 枚举全部适用 run 并核对 `headSha == SHA`；未完成的 run 用 `gh run watch RUN_ID --exit-status` 等待，fine-grained PAT 场景改轮询 `gh run view RUN_ID --json status,conclusion`。**只有预期集合完整且其中每个 run 的 fresh read 都满足 `status == completed && conclusion == success` 才判绿，退出码不作绿证**。无 run、预期 run 缺失、pending、字段不可读 = `missing evidence`，不得进入 tag/publish。
3. tag 存在性与指向：`git ls-remote REMOTE "refs/tags/vX.Y.Z" "refs/tags/vX.Y.Z^{}"`，REMOTE 用已解析的 base 仓库 remote（不硬编码 origin）；annotated tag 的 ref OID 是 tag object，commit 比对取 peeled `^{}` OID；lightweight tag 没有 peeled 行，改取 direct ref OID。同名 tag 已存在且解析后的 commit ≠ 目标 SHA = 硬停：不提供 delete/re-push tag，出路是新版本号；此拒绝规则写进安全契约。
4. **副作用枚举（授权前置条件）**：列出将被 tag 推送与 release publish 触发的全部 workflows（tag pattern 匹配的 `on: push: tags`、各型 `on: release`）及其环境与发布目标（registry、镜像、部署）。"registry 发布不属本技能"只约束直接命令；间接触发必须逐个列名进授权展示，否则用户授权的是"打 tag"，实际发生的可能是生产发布。
5. 读取 tag 保护规则与 release immutability 状态（`gh release view/list --json isImmutable`；仓库级可选功能，publish 后才生效）。

**Tag（逐项授权，仅拓扑 B/C）：** `git tag -a vX.Y.Z -m MSG SHA` + 单 ref 推送 `git push REMOTE refs/tags/vX.Y.Z`；annotated 为默认（可追溯 tagger/日期/GPG），**禁止 `git push --tags`**。推送被 ruleset 拒绝时报告，不绕过。

**Release 草稿（逐项授权，仅拓扑 C，draft-first 默认）：** `gh release create vX.Y.Z --draft --verify-tag --title ...`，notes 用 `--generate-notes`（可配 `--notes-start-tag`）或经确认的 `--notes-file`；`--verify-tag` 防止 gh 静默从默认分支头造 tag。`--prerelease` 仅按明示要求。flag 集以 research/gh-release-cli.md + 本机 gh 实测为准。

**产物（release 打包，证据链硬要求）：** 优先 CI 构建：用绿检定位到的**精确 RUN_ID** 执行 `gh run download RUN_ID`（run 产物可被删除/覆盖，禁止"取最新"），校验和随产物记录；本地构建为回退：在**固定到 peeled tag SHA 的干净 checkout/worktree**中执行批准的构建计划（禁用当前工作树，脏树直接拒绝），生成 sha256 后 `gh release upload vX.Y.Z FILES`。`upload --clobber` 属破坏性（gh 帮助原文：先删旧资产，上传失败则原件丢失）——默认拒绝，坚持则单独授权。

**Publish（独立逐项授权）：** 默认 `gh release edit vX.Y.Z --draft=false --latest=false`——gh 默认按日期+版本**自动判定 Latest**，Latest 指针变更单列授权（`--latest=false` 本机解析通过，API 行为在实施步骤 1 复核）；Latest 获授权后另行 `gh release edit vX.Y.Z --latest`。发布通知 watchers，属不可逆动作；immutability 开启的仓库 publish 后 tag 与资产同时锁定。Verify：`gh release view vX.Y.Z --json isDraft,isPrerelease,isImmutable,tagName,url,assets` + `gh release list --json tagName,isLatest`（isLatest 仅在 list JSON，本机实测）fresh read。

**发布 CI 监控/诊断：** tag 触发的 run 用 `gh run list --branch vX.Y.Z`（tag 触发 run 的 head_branch 即 tag 名；本机实测确认）/ `gh run watch` / `gh run view --log-failed`；失败诊断复用 fix-ci 纪律（50 行日志上限、外部提供者分流、本地修复需批准计划）。**关键差异**：release workflow 失败的修复落在新 commit 上 → 走新版本号重新发布，绝不 re-tag。

**research 校正（Codex 审阅后经本机 gh 2.96.0 复核）：** ① 原 `gh run view --exit-status` 绿检不成立（本机无此 flag；退出码也不区分 pending），改为上文绿检协议，research/release-ci-practices.md 已加更正注记；② immutability 是仓库可选功能且仅 publish 后生效、draft 阶段可改可删（gh 帮助原文），"资产发布后锁定"的绝对表述在 research/release-safety-risks.md 已加更正注记——先传后发顺序在 immutability 仓库是硬约束，其余仓库仍是安全默认；③ `gh release delete --cleanup-tag` 连 tag 一并删除，与 delete release / delete-asset、默认 `--clobber` 同入拒绝/单独授权面；④ gh 退出码 2 = 用户取消，按既有"Never retry uncertain writes"规则不重试；⑤ notes 另有 `--notes-from-tag` 可选；⑥ 监控时点由拓扑判定给出（`on: push: tags` 自 tag 推送起、`on: release: [published]` 在 publish 后）。

## 安全契约增量（SKILL.md）

第 3 层"逐项授权"清单追加：tag 推送、release 创建（草稿）、release 编辑/发布（draft→published）、产物上传、Latest 指针变更、`--prerelease` 标记、`upload --clobber`。授权展示必须包含拓扑判定结果与副作用枚举（将被触发的 workflows、环境、发布目标）。新增拒绝面：delete/re-push tag、删除已发布 release、`delete --cleanup-tag`、默认的 `--clobber`——解释下游影响后拒绝执行，替代路径为新版本号；draft release 删除属低风险，仍需授权。既有规则自动覆盖新路由：release notes/changelog 内容来自 commits/PR 文本 = 不可信输入；merge 授权不隐含 tag 授权，tag 授权不隐含 publish 授权，publish 授权不隐含 Latest 授权。

## description 设计

正面触发追加（中英）：prepare release PRs with version bump and changelog、tag merged commits、publish GitHub Releases with assets、diagnose release workflow failures / 准备 release PR、打 tag、发布 GitHub Release 与产物、诊断 release CI。排除追加：registry publishing（npm/cargo/pypi）不属本技能；authoring release workflow YAML from scratch → gh-bootstrap；发布就绪度审计已有 fuck-my-shit-mountain 条目覆盖。保留既有五近邻。现 description 约 640 字符，预估 +250 后 ≈890 ≤1024；实现时以 `len()` 实测为硬门。

## 资源预算

当前 `resource_boundary_check.py` 实测 initial load 995/1000（body 754 tokens）。预估净增 60-90 tokens 后默认门很可能超限。两步定策：① 重写时同步压缩既有措辞冲 ≤1000；② 不达则 `missing evidence` 记入 `research/resource-budget.md`，以 Governed 档 **1300 tokens** 复跑 `resource_boundary_check.py --max-initial-tokens 1300`；若连 1300 都超，停下重新设计入口而非抬上限。

## 改名波及面（grep -rn "gh-pr" 实测，live 路径）

| 文件 | 处理 |
|---|---|
| `skills/git-github-collaboration/gh-pr/` 目录 | `git mv` 为新名 |
| SKILL.md | frontmatter `name`、description、正文提名 |
| evals/evals.json | `skill_name` + 夹具 #13/#16/#17 文内提名 + 新负例改写 |
| reports/*.md 两份 | 标题 "gh-pr …" 改名 + release 增补 |
| NOTICE-upstream.md | "integrate with gh-pr" 提名 |
| agents/interface.yaml | display_name（GitHub PRs & Releases 方向）、short_description、default_prompt 内 `$gh-pr` |
| tests/*.py 文档串 | 文件内如有技能名提名则同步（实测确认） |
| `skills/git-github-collaboration/AGENTS.md` | 三技能清单、allowed-tools 表行、License 段 |
| gh-bootstrap/evals/evals.json | 转介断言中的 gh-pr |
| `.trellis/spec/guides/skill-authoring-conventions.md` | 例证名（"Reference implementations: gh-pr, …"） |
| docs/ | 生成物，`just docs-sync` 收敛（旧页面消失、新页面生成） |
| `.trellis/tasks/**`、workspace journal | 历史记录，不改，不计入残留检查 |

残留检查词边界：新名含旧名前缀，用 `rg -n -P "gh-pr(?!-release)" skills platforms .trellis/spec`（docs 在 docs-sync 后单独跑同一检查）。

## 双评测证据

- **激活边界（trigger_eval）**：`research/trigger_cases.json` 以合并任务归档用例为基（`.trellis/tasks/archive/2026-07/07-21-merge-gh-pr-skills/research/`），新增 release 正例 ≥6（创建 release PR / bump version PR / merge 后打 tag / 发布带产物的 Release / release CI 失败 / cut a release 复合意图，中英混合）、should_not_trigger 新增 ≥3（npm publish 到 registry、cargo publish、从零写 release workflow YAML）、near_neighbor 覆盖既有五近邻 + gh-bootstrap 的 workflow 搭建向。`research/semantic_config.json` 相应扩展 release 语义组。跑法沿用 spec 指南命令。
- **内部路由（evals.json，人工评审）**：release-pr ≥2 正例（含 bot 自动化在场时遵从 bot 的夹具）、release-publish ≥2 正例（tag+draft+publish 全链；产物上传与校验和）、链式 ≥1（"merge 后打 v1.2.3 并发布 release"断言 merge→release-publish 顺序与独立授权）、拒绝面 ≥1（"删掉 v1.2.0 重打"断言拒绝 + 新版本号出路）、新负例 ≥2（release.yml 搭建→gh-bootstrap；npm registry 发布→不触发）。**对抗夹具 ≥9（Codex 审阅采纳，逐个断言授权/拒绝/missing-evidence 行为）**：同名 tag 同 SHA（幂等继续）与异 SHA（硬停）；自动化已建 release（拓扑 A/B 不并行 `gh release create`）；目标 commit 无 run 或 run pending（missing evidence，不发布）；多 workflow 同时匹配（歧义上报，不默认拓扑 C）；tag 推送将间接触发 registry/deploy workflow（副作用枚举进授权展示）；immutability 开启仓库的 publish 前提示；`--clobber` 请求（默认拒绝，单独授权）；本地构建落在脏工作树/非 pinned checkout（强制干净 worktree）；publish 后 Latest 自动判定（默认 `--latest=false` + Latest 单列授权）。评审记录留痕 `research/evals-review.md`。

## Yao 模式（修订：Governed，Codex 审阅采纳）

原 Production 定级错误：yao-meta operating-modes.md「Governed — Use when: the skill affects incident, **release**, compliance, security…；high-permission scripts…」两条判据均命中——本技能实际执行 tag 推送、Release 发布与产物上传。修订为 Governed（所引脚本均已确认存在于 yao-meta/scripts/）：

- **治理元数据**：新增 `manifest.json`，按 governance.md 字段集：name / version / owner=lyh / updated_at / review_cadence=quarterly / status=active / maturity_tier=governed / lifecycle_stage=governed。
- **Library 层门**：resource_boundary_check.py（含 1300 上限定策）、validate_skill.py、trigger_eval.py、governance_check.py（governed 建议分 ≥90；不足则如实记录差距项，不虚报）。cross_packager.py 仅对明确分发目标运行——当前无分发目标，记 n/a。
- **Governed 层门**：trust_check.py（脚本/依赖/权限/秘密面）、probe_runtime_permissions.py、export_skill_ir.py + run_conformance_suite.py（Codex 基线实测因缺 Skill IR 失败，实施中先补 IR 再复跑）、review waiver ledger（接受的 warning 级风险逐条留痕）、Review Studio（render_review_studio.py）release 前留痕。
- **Skill OS 2.0 完整门**：在上述门之外运行 compiler、output eval、Skill Atlas、registry/package/install、upgrade 与 adoption drift。output eval 至少 5 个 case，覆盖 `file-backed fixture`、near-neighbor 与 boundary，生成 baseline/with-skill scorecard、盲评包和独立 answer key；recorded fixture 不得冒充 model-executed evidence。改名前保存 v2.0.0 registry/package JSON，供改名后的 upgrade_check 使用；无外部分发目标仅免除目标专属 cross-packaging，仍以 generic 本地包完成 verify + simulated install。
- **包边界与输出质量**：manifest 或相邻报告必须保留字面字段/标题 `input_files`、`output contract`、`rollback boundary`、`trust report`；reports/ 两份 profile 更新 + 新增 `reports/output_quality_scorecard.md`。盲评、遥测、provider-backed run 等当前不可得的证据一律如实标 `missing evidence`，不虚构。
- **门状态语义**：Governed blocker 必须修复，不能靠记录差距或 waiver 放行；warning 可继续评审，但只有具名 reviewer、理由、scope、expiry 和证据齐全的 waiver 才算接受。Review Studio 最终必须 blocker=0，warning 要么修复、要么有有效 waiver。
- 各脚本确切 CLI 参数在实施时以 `--help` 实测为准，不预写想象的参数。
- **Context Discipline**（operating-modes.md）：模式升级不允许撑大 SKILL.md 初始加载——治理增量全部落在 manifest / reports / references，token 预算策略不变。

被否决的替代方案（Codex 提出，记录备查）：维持 Production 并把 release 写操作收缩为 inspect/draft/发布计划-only。否决理由：与用户"加入 release 流程（tag/CI/打包）"的原始意图不符。若 review gate 用户改选此方案：删除 release-publish 的执行段（保留拓扑判定与计划输出），治理门降回 Production 集。

## 任务拆分判断

单一任务，不建父子：改名只有在 release 能力落地后才语义成立——先改名后加能力 = 名字承诺未兑现（触发漂移）；先加能力后改名 = 与用户要求的"名称体现两半"不一致，且两次波及面清扫重复劳动。description、路由、references、evals、改名清扫共享同一可发布边界。

## 回滚边界（精确清单，禁止宽范围 checkout）

本任务 git 触碰清单：`skills/git-github-collaboration/gh-pr/`（整目录 git mv + 内部修改）、`skills/git-github-collaboration/AGENTS.md`、`skills/git-github-collaboration/gh-bootstrap/evals/evals.json`、`.trellis/spec/guides/skill-authoring-conventions.md`。

- 实施前保存逐文件基线补丁；目录回滚 = `git mv` 回原名 + 反向补丁恢复内部修改；每次回滚前 `git status --porcelain -uall` 识别并绕开非本任务改动。
- docs/ 一律 `just docs-sync` 重新收敛，不 checkout。
- version 3.0.0 与最终定名只在全部验收通过后落；trigger_eval 未过前不得写 references。
