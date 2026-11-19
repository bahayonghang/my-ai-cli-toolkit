# Implement — 精简 skill 套件并增强 skill-session-review

> 本版处理最新合并审阅的 TPR-01～05。Q1 保持专用 JSON + 窄化报告子树契约，canonical basename flag 采用 spec 的 `--name`；Q2 保持完整 CI、工作提交与 task archive 成功后核验并删除精确备份目录；Q3 采用一次具名报告包确认，任何 replace 与 `.gitignore` 仍分别确认；Q4 的 active 9 条保护已作为历史证据完成，外部任务归档后改以 clean archive identity 与当前 protected workflow dirty row 隔离。全部 root task AC 在 archive 前完成，archive 后的备份删除与并发隔离分别由 PC1/PC2 判定。用户已明确批准实施；最终发布审计又发现显式 `--skill-path` 的同名异实例误归属与 proof-gated remove 的并发替换 TOCTOU，须完成 R2.14/AC46 与 R6.3/AC30 修复并重新取得无阻断结论后才能提交。

Windows / PowerShell 为文件复制、移动与递归删除的唯一 shell；不得把一个 shell 枚举出的路径交给另一个 shell 操作。解释器用 `python`，必要时 `py -3`。`pre-bash` 钩子拒绝 `rm -rf`。

## 阶段 0 · 前置检查与备份

### 0.0 规划启动硬门

- [x] Q1 已由用户选择；PRD R5/R6、design §5/§6、阶段 3a/3b、manifests 与 `.trellis/spec/backend/governed-report-subtree-writing.md` 已同步。专用 JSON 由输入管理器从 raw stdin 校验后落盘，报告写入器不接收 stdin，`.gitignore` 独立受通用契约约束。
- [x] Q2 已由用户选择：备份保留到 `just ci`、全部工作提交与 task archive 成功；随后在精确路径、非 reparse 与 canonical final inventory 复核后删除。archive 会先把任务标为 completed，因此删除是 post-closeout cleanup，不是 root task AC；notes/journal 只写占位路径、计数、hash 与有界成功/失败状态。
- [x] Q3 已由用户选择：每次报告运行先展示已确认 repo root、canonical name、三条精确路径与 create/remove/open 效果，对该具名报告包一次确认；root/name/path/effect 漂移即失效。任何 replace 展示当前 SHA-256 并单独确认；`.gitignore` 按通用契约独立确认。
- [x] 用户已在最终规划摘要后明确批准实施，并以 Q4 选择调整规划；并发任务的 active 9 条在其归档前始终被保护且未被本任务写入/stage/commit。外部任务现已独立归档，历史证据保留，未来隔离按 0.1 的 current-state guard 执行。
- [x] 2026-08-30 15:39 正式复审只剩 unresolved archive root 的 ReparsePoint 检查顺序阻断。Route A 已在任何 `Resolve-Path`/递归枚举前检查精确 root，并新增 task-scoped junction fixture；实测为 4 项 true，含 `junction_rejected_before_enumeration=true`。2026-08-30 15:56 的 fresh Pass 0–7 正式复审结论为 `可执行 — 0/0/0`，完整 CI 为 410 total / 407 pass / 3 skip / 0 fail，报告 SHA-256 为 `8cfd6af46dc103e7a31bc2e4aa2b24dbd2a65f3843fa8699e860a3082259dbd0`。

任一项未满足：保持 `planning`，不得运行 `task.py start`。

### 0.1 工作区允许清单（TPR-06）

阶段 0 的 owned 22 + protected 9 = 31 条是历史启动快照；不得在当前已实施工作树上重放，也不得恢复已经归档的 active 外部任务。当前 HEAD `f6d21107` 的 future-command guard 只保护以下外部状态，并在阶段 6 重新捕获本任务实际 dirty ownership：

- [x] 旧 active root `.trellis/tasks/08-29-goal-meta-single-pass-repair/` absent；外部任务已由 `35648631` archive、`f6d21107` journal 收口。
- [x] 外部 archive `.trellis/tasks/archive/2026-08/08-29-goal-meta-single-pass-repair/` 为 12 个 tracked regular files，worktree/index clean；有序 manifest SHA-256 为 `9b28cd1f908f1403b8194d406051fb3695abd7585e6a3176bcd532e8a5fe0059`。
- [x] 当前另有 protected external dirty row ` M .github/workflows/agentkit-desktop.yml`，SHA-256 为 `115d803439c8e7aa551445d352b45b83c55d6dbaba417e37629c23410a1e72bf`；它不属于本任务。
- [x] fresh 正式复审已把完整 `just ci` 作为受保护的 broad command 执行：root-aware 前后 snapshot 相等；active root absent、archive clean/无 reparse且 12-file manifest不变、workflow status/hash不变，index 仍为空。后续 stage/commit/archive/journal 各自仍须重新执行同一门。

```powershell
function Resolve-ReviewArchiveRoot {
  param([Parameter(Mandatory)][string]$RepoRoot, [Parameter(Mandatory)][string]$ArchiveRelativePath)
  $expectedRoot = [IO.Path]::GetFullPath((Join-Path $RepoRoot $ArchiveRelativePath))
  $unresolvedRootItem = Get-Item -LiteralPath $expectedRoot -Force -ErrorAction Stop
  if (($unresolvedRootItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'external archive root is a reparse point' }
  $resolvedRoot = (Resolve-Path -LiteralPath $expectedRoot -ErrorAction Stop).Path
  if (-not [String]::Equals($resolvedRoot, $expectedRoot, [StringComparison]::OrdinalIgnoreCase)) { throw 'external archive canonical root drift' }
  return $resolvedRoot
}

function Get-ReviewExternalSnapshot {
  $repo = (Resolve-Path -LiteralPath '.' -ErrorAction Stop).Path
  $activeRel = '.trellis/tasks/08-29-goal-meta-single-pass-repair'
  $archiveRel = '.trellis/tasks/archive/2026-08/08-29-goal-meta-single-pass-repair'
  $workflowRel = '.github/workflows/agentkit-desktop.yml'
  if (Test-Path -LiteralPath (Join-Path $repo $activeRel)) { throw 'external active task unexpectedly exists' }
  $archiveRoot = Resolve-ReviewArchiveRoot -RepoRoot $repo -ArchiveRelativePath $archiveRel
  $archiveItems = @(Get-ChildItem -LiteralPath $archiveRoot -Recurse -Force -ErrorAction Stop)
  if (@($archiveItems | Where-Object { ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 }).Count -ne 0) { throw 'external archive contains reparse point' }
  $archiveFiles = @($archiveItems | Where-Object { -not $_.PSIsContainer })
  if ($archiveFiles.Count -ne 12) { throw 'external archive file count drift' }
  [string[]]$archivePaths = @($archiveFiles | ForEach-Object { [IO.Path]::GetRelativePath($archiveRoot, $_.FullName).Replace('\', '/') })
  [Array]::Sort($archivePaths, [StringComparer]::Ordinal)
  $manifestText = ($archivePaths | ForEach-Object { "{0}  {1}`n" -f (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $archiveRoot $_)).Hash.ToLowerInvariant(), $_ }) -join ''
  $manifestHash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($manifestText))).ToLowerInvariant()
  if ($manifestHash -ne '9b28cd1f908f1403b8194d406051fb3695abd7585e6a3176bcd532e8a5fe0059') { throw 'external archive identity drift' }
  if (@(git status --porcelain=v1 --untracked-files=all -- $archiveRel).Count -ne 0 -or @(git diff --cached --name-only -- $archiveRel).Count -ne 0) { throw 'external archive is dirty or staged' }
  [string[]]$workflowStatus = @(git status --porcelain=v1 --untracked-files=all -- $workflowRel)
  if ($workflowStatus.Count -ne 1 -or $workflowStatus[0] -ne ' M .github/workflows/agentkit-desktop.yml') { throw 'protected workflow status drift' }
  if ((Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $repo $workflowRel)).Hash.ToLowerInvariant() -ne '115d803439c8e7aa551445d352b45b83c55d6dbaba417e37629c23410a1e72bf') { throw 'protected workflow hash drift' }
  if (@(git diff --cached --name-only -- $workflowRel).Count -ne 0) { throw 'protected workflow is staged' }
  [pscustomobject]@{ ActiveAbsent = $true; ArchiveCount = 12; ArchiveManifest = $manifestHash; WorkflowStatus = $workflowStatus[0]; WorkflowSha256 = '115d803439c8e7aa551445d352b45b83c55d6dbaba417e37629c23410a1e72bf' }
}
```

先运行唯一 task-scoped `.trellis/tasks/08-29-consolidate-skill-review/scripts/test-external-root-guard.ps1`，用临时真实目录 + root junction 调用 `Resolve-ReviewArchiveRoot`，断言普通 root 返回精确 canonical path，而 junction root 在任何递归枚举前抛出 `external archive root is a reparse point`；fixture 用 GUID 临时父目录并在 `finally` 中只按叶到根顺序删除其精确空目录，不递归删除。`just docs-sync`、`just ci`、阶段 6 stage/commit、`task.py archive --no-commit` 与 `add_session.py --no-commit` 都使用通过该 fixture 的 root-aware 前后快照门。它不把 archived task 或 workflow 变成本任务权限；若外部状态漂移，停止并重新分诊。

- [x] 0.1a task 已在 Q4 历史保护下进入 `in_progress`；不得重跑 `task.py start`。

### 0.2 记录基线

- [ ] `python scripts/check.py skills/developer-tools-integrations/skill-session-review` 通过
- [ ] `just node-test` 通过（当前 `write-session-review.test.mjs` 6/6）

### 0.3 复制到仓库外备份并建立 canonical inventory fixture

只在 PowerShell 中解析、复制与枚举；不得把一个 shell 枚举出的路径交给另一个 shell 移动或删除。实施时先创建 task-scoped `.trellis/tasks/08-29-consolidate-skill-review/scripts/invoke-source-removal.ps1`，支持 `-Mode Library|SelfTest|Prepare|Execute` 与 self-test scope `Backup|Removal|All`。helper 同时提供 `Initialize-ReviewBackup` 和 `Invoke-ReviewSourceRemoval`，共享下面两个只定义一次的 canonical inventory 函数；所有默认关键 action 都显式 `-ErrorAction Stop`。阶段 0 先运行无生产副作用的 Backup self-test，再调用 Prepare；阶段 5 运行 Removal self-test 后调用 Execute；阶段 7 只用 Library，确保 source、virtual-final、actual-final、archive 前复核与 post-closeout 复核不复制算法实现：

```powershell
# 下列定义写入 task-scoped helper；当前 shell 用 `. $reviewRemovalHelper -Mode Library` 加载。
function Get-CanonicalReviewInventory {
  param([Parameter(Mandatory)][object[]]$Entries)

  $hashByPath = [Collections.Generic.Dictionary[string,string]]::new([StringComparer]::Ordinal)
  foreach ($entry in $Entries) {
    if (-not $hashByPath.TryAdd([string]$entry.Path, [string]$entry.Hash)) {
      throw "duplicate inventory path"
    }
  }
  [string[]]$reviewPaths = @($hashByPath.Keys)
  [Array]::Sort($reviewPaths, [StringComparer]::Ordinal)
  [string[]]$reviewLines = @($reviewPaths | ForEach-Object { "$($hashByPath[$_])  $_" })
  $reviewBytes = [Text.UTF8Encoding]::new($false).GetBytes(($reviewLines -join "`n") + "`n")
  $reviewHash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($reviewBytes)).ToLowerInvariant()
  [pscustomobject]@{
    Count = $reviewPaths.Count
    Sha256 = $reviewHash
    Entries = @($reviewPaths | ForEach-Object { [pscustomobject]@{ Path = $_; Hash = $hashByPath[$_] } })
  }
}

function Get-ReviewInventorySet {
  param([Parameter(Mandatory)][string]$Root)

  $reviewRoot = (Resolve-Path -LiteralPath $Root -ErrorAction Stop).Path
  $reviewPhysicalEntries = @(Get-ChildItem -LiteralPath $reviewRoot -Recurse -File -Force -ErrorAction Stop | ForEach-Object {
    $reviewRelativePath = [IO.Path]::GetRelativePath($reviewRoot, $_.FullName).Replace('\', '/')
    [pscustomobject]@{
      Path = $reviewRelativePath
      Hash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256 -ErrorAction Stop).Hash.ToLowerInvariant()
    }
  })
  $reviewGovernedEntries = @($reviewPhysicalEntries | Where-Object { ($_.Path -split '/') -notcontains '__pycache__' })
  $reviewExcludedEntries = @($reviewPhysicalEntries | Where-Object { ($_.Path -split '/') -contains '__pycache__' })
  [pscustomobject]@{
    Physical = Get-CanonicalReviewInventory -Entries $reviewPhysicalEntries
    Governed = Get-CanonicalReviewInventory -Entries $reviewGovernedEntries
    ExcludedPaths = @($reviewExcludedEntries.Path)
  }
}

function Get-ReviewInventory {
  param([Parameter(Mandatory)][string]$Root)
  (Get-ReviewInventorySet -Root $Root).Governed
}

$reviewRepoExpected = (Resolve-Path -LiteralPath '.' -ErrorAction Stop).Path
$reviewRemovalHelper = (Resolve-Path -LiteralPath '.trellis/tasks/08-29-consolidate-skill-review/scripts/invoke-source-removal.ps1' -ErrorAction Stop).Path

$reviewBackupSelfTest = & $reviewRemovalHelper -Mode SelfTest -SelfTestScope Backup
if ($LASTEXITCODE -ne 0) { throw 'backup preparation self-test failed' }
$reviewBackupSelfTestState = $reviewBackupSelfTest | ConvertFrom-Json -ErrorAction Stop
if (-not $reviewBackupSelfTestState.first_copy_failure_clean -or
    -not $reviewBackupSelfTestState.second_copy_failure_clean -or
    -not $reviewBackupSelfTestState.success_prepared -or
    -not $reviewBackupSelfTestState.verified_reused -or
    -not $reviewBackupSelfTestState.lock_contention_rejected) {
  throw 'backup preparation self-test did not prove all states'
}

$reviewBackupResult = & $reviewRemovalHelper -Mode Prepare -RepoRoot $reviewRepoExpected
if ($LASTEXITCODE -ne 0) { throw 'backup preparation failed; inspect bounded state and stop' }
$reviewBackupState = $reviewBackupResult | ConvertFrom-Json -ErrorAction Stop
if ($reviewBackupState.state -notin @('backup-prepared', 'backup-verified-reused')) {
  throw 'backup preparation did not reach a proved state'
}

. $reviewRemovalHelper -Mode Library
$reviewBackupParent = [IO.Path]::GetFullPath((Join-Path $env:USERPROFILE '.claude-skill-backup'))
$reviewBackupPath = [IO.Path]::GetFullPath((Join-Path $reviewBackupParent '08-29-consolidate-skill-review'))
if (-not (Test-ReviewOrdinalEqual -Left ([IO.Path]::GetDirectoryName($reviewBackupPath)) -Right $reviewBackupParent)) { throw 'backup escaped approved parent' }
$reviewBackupPath = (Resolve-Path -LiteralPath $reviewBackupPath -ErrorAction Stop).Path

$reviewSourceSet = Get-ReviewInventorySet -Root $reviewBackupPath
$reviewSourceInventory = $reviewSourceSet.Governed
$reviewSourcePhysicalInventory = $reviewSourceSet.Physical
if ($reviewSourceInventory.Count -ne 14) { throw 'source backup file count mismatch' }
if ($reviewSourcePhysicalInventory.Count -ne 17) { throw 'physical source file count mismatch' }
$reviewVirtualEntries = @($reviewSourceInventory.Entries | ForEach-Object {
  $_
  [pscustomobject]@{ Path = ".removed/$($_.Path)"; Hash = $_.Hash }
})
$reviewVirtualFinalInventory = Get-CanonicalReviewInventory -Entries $reviewVirtualEntries
if ($reviewVirtualFinalInventory.Count -ne 28) { throw 'virtual final row count mismatch' }
$reviewPhysicalVirtualEntries = @($reviewSourcePhysicalInventory.Entries | ForEach-Object {
  $_
  [pscustomobject]@{ Path = ".removed/$($_.Path)"; Hash = $_.Hash }
})
$reviewPhysicalVirtualFinalInventory = Get-CanonicalReviewInventory -Entries $reviewPhysicalVirtualEntries
if ($reviewPhysicalVirtualFinalInventory.Count -ne 34) { throw 'physical virtual final row count mismatch' }
```

- [ ] source backup 同时为 governed `14/<sha256>` 与不排除任何普通文件的 physical `17/<sha256>`；记录两套有序相对路径，不记录绝对路径。任一 `__pycache__` 新增/缺失/改名/字节变化都会改变 physical identity 并停止
- [ ] 由同一批真实 hash 构造 governed virtual-final `28/<sha256>` 与 physical virtual-final `34/<sha256>`；记录两套 digest，排序键都为 normalized relative POSIX path 的 ordinal 顺序
- [ ] Backup self-test 已注入第一/第二次复制失败，均证明 final 不出现、仅本次 owned staging 被清理；随后无故障 Prepare 成功，合法 final 只有同时匹配 governed 14/hash 与 physical 17/hash 时再调用返回 `backup-verified-reused`。另在 final 的 `__pycache__` 注入 `unexpected.bin`，证明 governed identity 不变、physical identity 改变且 reuse 返回 `backup-preparation-recovery-required`。真实 Prepare 的关键创建/读取/递归复制/hash/终局化全部终止式；任一 identity 不匹配时保留既有 final/source 并停止（AC41）
- [ ] 仓库内两个目录仍在原位（取材从仓库内原件进行，R1.4 由此成立）

> 回退点 A：阶段 5 之前仓库内原件未动，无需回退操作。

## 阶段 1 · 移植判断依据（只写 references）

- [ ] 1.1 新建 `references/review-scorecard.md`：两个维度各自封闭且唯一的 label/score 映射；`execution_efficiency` 只有四个效率档位，`instruction_fit` 才允许 `fit / misfit / insufficient_evidence`。原始聚合只排除 `instruction_fit=insufficient_evidence`，全部 `instruction_fit` 为该档时仅该维度可为 `null`；`execution_efficiency=insufficient_evidence` 非法。另写 `failed_sessions` 定义（任一可计分原始分 < 0.5）及 design §3.5 的结构化 `reason.sentences` + `reason.locator`。源：`skill-doctor/scorers/efficiency.md`、`scorers/code-quality.md`。
- [ ] 1.2 在同一文件写入加权与等级（design §3.4）：`curve(s) = 0.5 + 0.5*s`；`overall = (0.5*curve(eff) + 0.35*curve(fit)) / 0.85`；**不设第三项**；`instruction_fit` 为 `null` 时按原始 0.5 代入；十一档字母等级（`0.97 A+ / 0.93 A / 0.90 A- / 0.87 B+ / 0.83 B / 0.80 B- / 0.77 C+ / 0.73 C / 0.70 C- / 0.60 D / 0.0 F`）。写明量程性质：`overall` 实际范围 `[0.6, 1.0]`，等级区间 `D` 到 `A+`，`F` 不可达，`D` 不等于接近满分。
- [ ] 1.3 在同一文件写明：调用计数与比率只展示不计分（R2.12），并注明 `available` 口径含 Codex 全量会话（EX-9），不可横向比较。
- [ ] 1.3a 在同一文件写明 R2.13 评分前置：至少一个 invoked 才定义均值/overall/grade/ratio；零 invoked 不使用 null/sentinel 伪装评级，而在评分/写入前分别以 `no-session-stores` 或 `no-invoked-sessions` 有界停止。shared validator 防御拒绝零 invoked、`scored_sessions == 0` 与 ratio 分母为 0 的 payload（AC44）。
- [ ] 1.4 写明：写入器接收已验证 `--name`，先校验 `review.skill_name == expected_name`、零样本门和各维度 label/score 完全匹配，再用 Decimal 真源重算 `aggregate`（含 `overall`、`grade`）；JSON 浮点用 `parse_float=Decimal`，均值 → curve → overall 逐阶段以 `ROUND_HALF_UP` 量化 6 位，grade 对量化后的 overall 判定，报告固定显示 6 位。Agent 填写的数值仅为声明，按同一量化规则比较，不能改变身份或规范分值。
- [ ] 1.5 改 `references/finding-contract.md`：替换为 design §4 的三条合并判据；追加 File / Don't-file；规定 suggestions/not_filed 对全部 finding id 构成无遗漏、无重复精确分区；标注哪些由写入器强制、哪些由人工验收覆盖。另把 R2.10 的逐评分理由语义清单（locator 行为一致、非 label/score 复述、因果机制、可修复杠杆）列为与 file/don't-file 分开的人工证据。现有 verdict 表与摘录约束保留不动。
- [ ] 1.6 改 `references/report-template.md`：改为「review JSON schema + 两种渲染产物版式」，schema 照抄 design §5.6。保留 `Keep field names stable`；把 `Use English headings when the user request is English` 改写为「标题语言由 `language` 字段决定，字段名不随语言变化」。补上输入文件位置与生命周期（design §5.2、§5.3）。
- [ ] 1.7 复核：references 中不含 `$SKILL_ROOT`、不含裸 `python3`、不含 Warp 字样。

```bash
rg -n "SKILL_ROOT|python3 |warp|Warp|factories" skills/developer-tools-integrations/skill-session-review/references/
```

**审查闸 1**：确认量表、加权公式、等级分档、schema 与输入契约符合预期，再动脚本。

## 阶段 2 · 共享字典、渲染器与打开 helper

- [ ] 2.1 新建 `scripts/report_headings.py`：`HEADINGS = {"zh": {...}, "en": {...}}`，键为 `scorecard` / `coverage` / `invocations` / `findings` / `suggestions` / `not_filed` / `unverified` / `reliable`。唯一定义处（AC35）。
- [ ] 2.2 新建 `scripts/render_review_html.py`：`esc(v)` 统一转义；`render_page(review) -> str` 按 design §8.2 的九个区块；scorecard 区块显示 `overall`、字母等级、两维 curve 值与原始均值、计分会话数，以及只展示不计分的 `invoked`/`loaded`/`available` 计数与比率（带 `available` 口径注记）；维度为 `null` 时显示「证据不足」；内联 `<style>`；零 JS、零外部资源；标题取自 `report_headings`。
- [ ] 2.3 `render_review_html.py` 的 `main(argv)` 只接受 `--review-json <path>`，把 HTML 打到 **stdout**；不提供 `--out` 或任何目标路径参数（AC27）。
- [ ] 2.4 新建 `scripts/open_report.py`（design §9）：只接受 `--repo-root` + canonical `--name`，路径自行派生；旧 `--skill-name` 退出 2；校验存在、普通文件、非 symlink/reparse；调 `webbrowser.open(uri, new=2)`；失败退出 0 并输出 `{"path":"","opened":false,"reason":""}`；不读内容、不联网、不写文件。
- [ ] 2.5 全部新脚本文件 IO 显式 `encoding="utf-8"`；写入显式 `newline="\n"`。
- [ ] 2.6 新建 `tests/render-review-html.test.mjs`：九区块标题存在；scorecard 含 `overall` 与等级；`instruction_fit: null` → 显示「证据不足」且不出现 `0.0`；含 `<script>alert(1)</script>` 的字段被转义；中文 + emoji 往返一致；断言 `--help` 无 `--out` 选项。
- [ ] 2.7 新建 `tests/html-no-external-resources.test.mjs`：拒绝所有资源承载属性与任意 CSS `url()`/`@import`；失败 fixture 覆盖网络 URL、相对路径、本地绝对路径与 `file:`；正文 `evidence` 含 `https://example.test/session-log` 时仍通过；`warp` 字样作独立断言。
- [ ] 2.8 新建 `tests/report-language.test.mjs`（TPR-03）：同一 JSON 以 `zh` / `en` 渲染，断言标题切换、字段名不变、其余内容一致（AC36）。
- [ ] 2.9 新建 `tests/open-report.test.mjs`（AC29、AC34）：canonical `--name` 正向通过，旧 `--skill-name` 退出 2；路径在 `reports/skill-session-review/` 之外时拒绝；目标不存在时拒绝；`webbrowser.open` 抛异常或返回 `False` 时退出 0 且 `"opened": false`。用注入的假 `webbrowser` 或环境变量桩，不真的拉起浏览器。
- [ ] 2.10 新建 `tests/skill-workflow-contract.test.mjs`，并输出以下逐项 case-name 清单：`authorization-preview-before-helper`（未确认只展示 root/name/三路径/effects，零 helper 调用）、`authorization-confirmed-exact-snapshot`（确认且 snapshot 未漂移时依序 create input/Markdown/HTML、proof remove、open）、`authorization-root-drift-rejected`、`authorization-name-drift-rejected`、`authorization-path-drift-rejected`、`authorization-effect-drift-rejected`、`authorization-existing-target-needs-replace-confirmation`（展示当前 SHA-256）、`authorization-gitignore-separate`。同一测试再用同时含 Claude/Grok/Codex/Oh My Pi coverage/session 且至少一个 invoked 的 fixture 运行两种渲染/写入路径；解析 `agents/interface.yaml`，遍历 `openai`/`claude`/`generic` adapter targets，断言共享入口、双产物与打开 helper 契约均可达。另覆盖两条零样本工作流：四 store 全 missing → `no-session-stores`；store 可用但零 invoked（含 loaded/available）→ `no-invoked-sessions`；两者都断言不读取切片、不调用输入/报告/open helper。扫描器 tests 继续正向使用独立 `--skill-name`，平台识别仍由 `scan-invocations.test.mjs` 覆盖（AC44、AC45）。
- [ ] 2.10a 修改 `references/invocation-signals.md`、`scripts/scan_invocations.py` 与 `tests/scan-invocations.test.mjs`：显式 `--skill-path` 时，Claude/Grok/Codex/Oh My Pi 都必须先有归一化后精确相等的目标实例路径证据；禁用 name-only 与宽泛 `skills/<name>/SKILL.md` fallback，同名异路径 hit 不进入目标 sessions，也不得被事后标成请求路径。实现共享“规范 assistant 正文”提取谓词：Codex 映射 `response_item` 下的 assistant message，Oh My Pi 映射顶层/nested assistant message；两者只提取 `type` 逐字符等于精确小写 `text` / `output_text` 的显式 block，拒绝 raw string/list-string 与 `TEXT` / `OUTPUT_TEXT` 等非规范大小写，并从完整事件根递归拒绝任一非空 `tool*` / `function_call*` key 或任一 `type` 含 `tool` / 以 `function_call` 开头的 block，正文+工具 mixed-event 也整体排除。Codex/Oh My Pi 必须按 JSONL 事件顺序推进 `loaded → invoked`：读取前 marker 不缓存，marker-before-read 最终保持 `loaded`，read-before-marker 才晋级；`Step 1` / `步骤 1` 等通用步骤词不能独立晋级。Codex 的全局 store 在 `scope=cwd` 下对 `session_meta.payload.cwd` fail closed，metadata 缺失、非法/相对、无法规范化或与 repo root 不同均排除，同时证明 `scope=global` 不应用该过滤。新增四平台“显式目标路径 + 同名异实例”端到端负例、Codex/Oh My Pi 各自纯正文正例，以及 raw string/list-string、`TEXT` / `OUTPUT_TEXT` 非规范大小写、外层/嵌套 tool 元数据、`tool_output`/未来 `*tool*` 类型、正文+工具 mixed-event 负例；再覆盖两平台 marker-before-read/read-before-marker 顺序对与“目标已 loaded，后续 assistant 仅出现无关 `Step 1` / `步骤 1` 时仍为 `loaded`”，以及 Codex cwd matching/missing/invalid/mismatch + global 行为矩阵。scanner 的 session/skill 路径统一用 `normpath` 与宿主 `normcase` 比较：Windows 维持大小写不敏感，POSIX 保留大小写差异；新增 POSIX 大小写不同路径不相等的回归，并在 Windows 按设计 skip。Codex `sessions[].id` 固定为唯一 rollout filename stem，并用两个共享 payload/root id 的 fork rollout 证明不会碰撞。新增 `tests/valid-review.json` 作为 `write-session-review.test.mjs` 与 workflow 路径实际消费的完整有效 review fixture；它不替代 scanner 平台 fixture（AC46）。
  其中 Codex 的宽泛递归 tool-carrier 检查只能作为 assistant 正文的负向排除谓词；正向读取谓词必须独立实现，只允许外层 `response_item` 下四类真实 `payload.type`，并仅检查 `custom_tool_call.cmd/command/input`、`custom_tool_call_output.output`、`function_call.arguments`、`function_call_output.output`。允许字段必须同时包含受支持的读取动作与精确目标路径；path identity 与动作遮蔽共用有序、非重叠 span extractor，quoted path 内不再提取 bare suffix，JSON command container 只抽取并遮蔽内部实际 path，raw 以及任意正层数 JSON-escaped quote wrapper 都完整识别含空格的 Windows/POSIX path，随后仅在路径外文本识别动作。普通 assistant prose、`world_state`、`toolbox_note`、任意 tool-like 元数据、非白名单 envelope/字段，以及动作词只存在于目标路径目录名的 path-only 载荷，都不得建立 `loaded`。测试必须逐一覆盖四类真实载体正例、四类 JSON command 无内层 path 引号正例、四类 JSON-escaped double-quoted 含空格 path 正例、Windows/POSIX 直接 span fixture、一层 escaped other-instance/suffix-collision 负例、二次编码 target/other 对、`toolbox_note + assistant 读取命令文本 + 后续 marker` 负例，以及 `get-content`/`read_file`/`read_text`/`cat`/`rg` 五类动作词仅位于 path span 的负例，同时保留顺序/cwd 矩阵。
- [ ] 2.11 新建 `tests/gbk-no-utf8-env.test.mjs`：实际枚举最终 `scripts/*.py`，集合必须精确等于 6 个 CLI（`scan_invocations.py`、`ensure_report_ignore.py`、`manage_review_input.py`、`write_session_review.py`、`render_review_html.py`、`open_report.py`）和 2 个模块（`report_headings.py`、`review_contract.py`）。每例移除 `PYTHONUTF8` / `PYTHONIOENCODING`；CLI 分别运行中文+emoji fixture，模块导入并调用文本入口；Node 以 bytes 捕获 stdout/stderr 并按 UTF-8 严格解码。`open_report.py` 注入 stub，所有 case-name 与实际脚本集合逐字符对应（AC5）。

```bash
cd skills/developer-tools-integrations/skill-session-review/tests
for t in render-review-html html-no-external-resources report-language open-report skill-workflow-contract gbk-no-utf8-env; do node "$t.test.mjs"; done
```

> 源码扫描测试受 `.trellis/spec/guides/skill-authoring-conventions.md`「Marker scanners must exclude their own documentation」约束：只白名单扫 `scripts/*.py`，不 rglob 整个技能目录；匹配前剥除 Python 注释与字符串字面量，否则脚本中讨论该模式的注释会自命中。
>
> 编码与换行依据同一份 spec 的「Script output files: pin encoding and newline」：`write_text` 必须同时给 `encoding="utf-8"` 与 `newline="\n"`。

## 阶段 3a · 受控输入、报告写入与独立 ignore helper

- [ ] 3a.1 新建 `scripts/review_contract.py`，集中实现 `decode_review_json`、`validate_schema(review, expected_name)`、`recompute_aggregate`、`validate_suggestions`、`validate_reason`、`validate_finding_partition`、`scan_secrets`；输入管理器和报告写入器必须把已验证 `--name` 传为 expected name，只导入同一实现，不复制。
- [ ] 3a.2 `decode_review_json` 用 `parse_float=Decimal`；`validate_schema` 先逐字符校验 `review.skill_name == expected_name`，再拒绝零 invoked、`scored_sessions == 0`、调用计数分母为 0 与 `execution_efficiency=insufficient_evidence`；`recompute_aggregate` 覆盖两维均值 → `curve` → `overall`（`/0.85`）→ `grade`，每个数值阶段均以 `ROUND_HALF_UP` 量化 6 位，grade 对量化后的 overall 判定并固定显示 6 位。只排除 `instruction_fit=insufficient_evidence`，全部该档时 `instruction_fit == null` 并按 Decimal `0.5` 代入；第三项、任一维度 label/score 错配或按相同量化规则仍不一致的声明 aggregate 均退出 6。
- [ ] 3a.3 `scan_secrets` 命中 `sk-` / `ghp_` / `Bearer ` 即退出 7；错误只报类别，不回显内容。strict UTF-8、可选 BOM 与 LF 规范化由 `decode_review_json` 唯一定义。
- [ ] 3a.4 新建 `scripts/ensure_report_ignore.py`：目标只可为 repo-root 直接子项 `.gitignore`；root/目标拒绝 symlink/reparse；raw stdin strict UTF-8 解码（允许 BOM）并规范化 LF；create 的完整 artifact 只能是 `reports/skill-session-review/\n`，replace 只能在当前规范化内容上新增一次该精确行，不得删除、重排或修改其他行；完整候选在任何文件系统变更前执行 schema 与 `scan_secrets`；create 默认 no-clobber，replace 要求现文件 hash 并在 finalization 前复核；已生效则只读返回 `unchanged`。
- [ ] 3a.5 新建 `scripts/manage_review_input.py`：子命令 `create|replace|remove`，作为报告 basename 消费方只接受 canonical `--name`，其旧 `--skill-name` 退出 2；`create`/`replace` 从 raw stdin 读取完整 JSON，并在任何目录/temp 变更前把 `--name` 传给 shared validator；唯一目标为 `.input/<name>.json`；Git repo 中 ignore 未生效退出 8，非 Git 返回 `non-repo`。
- [ ] 3a.6 输入 create/replace 在任何目录或 temp 创建前执行完整共享校验；创建 no-clobber，替换要求 `--expected-sha256` 并终局化前紧邻复核。
- [ ] 3a.7 输入 `remove` 按固定 `input → Markdown → HTML` 顺序取得与 writer 共用的 destination lease，在全部 lease 内重读当前 input hash 与 `markdown=<sha256>`、`html=<sha256>` 两份 proof；最终 input 读取绑定 no-follow descriptor identity，删除前紧邻确认路径仍指向该 identity。proof 不完整/不匹配、lease contention、proof 后 input/artifact replace 或 inode swap 均 fail closed 并保留未经证明的新对象；成功只删除已证明的输入 JSON。
- [ ] 3a.8 改造 `write_session_review.py` 参数：作为报告 basename 消费方只接受 canonical `--name`；必填 `--format markdown|html` 与 `--review-json <path>`，支持报告 `--replace --expected-sha256`；其旧 `--skill-name`、报告 stdin 与旧 `--input` 均退出 2。扫描器的 `--skill-name` 不变。
- [ ] 3a.9 输入路径必须与由安全 `--name` 唯一派生的 `.input/<name>.json` 完全相等；三个 helper 都拒绝目录外、错误 basename/大小写/扩展名、嵌套路径、traversal、symlink 与 reparse。
- [ ] 3a.10 报告写入器每次读取专用 JSON 后，把当前 `--name` 传给 shared validator，重新执行 payload name 绑定、零样本门、完整共享校验与 secret 扫描，之后才允许创建目录、temp 或目标；准备后篡改或 `skill_name` 漂移不能绕过检查。
- [ ] 3a.11 新增 `render_markdown(review) -> str`，标题取自 `report_headings`；区块、表头、字段名与现版式一致；scorecard 含 `overall` 与等级。
- [ ] 3a.12 `resolve_destination` 按 `--format` 唯一派生 `.md` 或 `.html`；单次只写一个报告 payload。
- [ ] 3a.13 `.gitignore`、输入与报告均默认 no-clobber，替换须显式 hash。安全 finalization 保持单一实现：owned temp 以 `O_CREAT|O_EXCL` 创建、不跟随链接；目标或 temp 为 symlink/reparse、temp 为外来普通文件时拒绝，失败只删本次 owned temp。
- [ ] 3a.14 三类 writer 都在 finalization 前立即复核旧 hash，完成后回读并校验规范化字节与 SHA-256；注入 finalization 失败时保全旧目标（AC24）。
- [ ] 3a.15 三类 writer 的 Git ignore/可见性只读探测都用 `encoding="utf-8", errors="replace"`；输出 `ignored|tracked|untracked|non-repo`，不 stage。
- [ ] 3a.16 三类 writer 的 stdout 与退出码按 design §6.5/§6.6；不回显 `.gitignore`、JSON、报告正文或疑似 secret。
- [ ] 3a.17 输入管理器与报告写入器绝不修改 `.gitignore`；`ensure_report_ignore.py` 绝不修改根 `.gitignore` 之外的路径；三类 writer 均不 stage、commit、打开浏览器或联网（AC28）。

**审查闸 2**：确认三类命令的单次副作用边界、共享校验与退出码完整，再写矩阵测试。

## 阶段 3b · `.gitignore` 通用 writer 与输入生命周期独立矩阵

新建 `tests/ensure-report-ignore.test.mjs` 与 `tests/manage-review-input.test.mjs`。两者是两套独立证据，不得用 JSON 用例代证 `.gitignore` artifact：

- [ ] 3b.1 两个 helper 对缺失/非法/reparse repo root 均在读取目标或创建父目录前退出 2。
- [ ] 3b.2 `.gitignore` raw stdin 非法 UTF-8、NUL、非 exact-line create artifact、replace 删除/重排/改变其他行、疑似 secret 均在任何文件系统变更前拒绝；BOM + CRLF 规范化为 LF 后成功。
- [ ] 3b.3 `.gitignore` 缺失时只允许 exact-line create；已有 exact line 返回 `unchanged` 且不读取/写入 payload；目标已存在时无 replace 拒绝，replace + 正确/过期 hash 分别成功/拒绝，旧字节保全。
- [ ] 3b.4 `.gitignore` 目标固定为 root 直接子项；目标 symlink/reparse、普通/链接 hostile temp 均拒绝且不跟随；注入 finalization 失败保全旧字节并只清 owned temp；成功时 read-back hash 与 stdout 一致。
- [ ] 3b.5 `.gitignore` helper 覆盖 `ignored|tracked|untracked|non-repo`；stdout 不含候选正文或 secret；除只读 Git probe 外不改 index、不执行外部程序、不联网，也不改变 `.gitignore` 之外的文件。
- [ ] 3b.6 输入 create 成功：规范化 JSON 落在精确 `.input/<name>.json`，stdout hash 与磁盘一致；输入父目录只在校验后出现。
- [ ] 3b.7 输入已存在时 create 拒绝；replace + 正确/过期 hash 分别成功/拒绝，旧字节保全。
- [ ] 3b.8 schema 非法、payload `skill_name != --name`、零 invoked/零 scored_sessions/零 ratio 分母、其他跨字段不一致、secret、非法 UTF-8 均在任何目录/目标/temp 变更前退出；BOM + CRLF 规范化后成功（AC29、AC44）。
- [ ] 3b.9 Git repo 中 ignore 未生效退出 8 且不修改 `.gitignore`；非 Git 目录成功并报告 `non-repo`。
- [ ] 3b.10 报告输入管理器的 canonical `--name` 正向通过；该消费方的旧 `--skill-name`、错误 basename/大小写/扩展名、嵌套路径、traversal、symlink/reparse 输入目标全部拒绝且不跟随。扫描器 `--skill-name` 的既有正向测试继续通过（AC29、AC42）。
- [ ] 3b.11 输入的普通/链接 hostile temp 与注入 finalization 失败：旧目标不变，只清 owned temp，不删除外来残留。
- [ ] 3b.12 remove 缺 format、重复 format、输入 hash 过期、任一 artifact 缺失或 hash 过期均退出 8，输入与报告全部保留；任一 input/Markdown/HTML lease 正被 writer 持有时 fail closed，且释放已取得 lease。
- [ ] 3b.13 input/md/html proof 完整且三个 lease 内 identity 未漂移时只删除输入，报告字节不变；第二次 remove 拒绝，不扩大删除范围。另用确定性 hook 覆盖最终 proof 后的 input replace、artifact replace，并分别以字节/hash 完全相同但 file identity 不同的 input/artifact inode swap 证明新对象保留且 remove 不报告成功。
- [ ] 3b.14 模拟 Markdown 成功、HTML 失败：输入与 Markdown 保留；HTML 重试成功后完整 proof 可收敛删除输入。
- [ ] 3b.15 输入 helper stdout 只含有界元数据；不改 Git index、不启动非 Git 子进程、不联网。
- [ ] 3b.16 `ensure-report-ignore.test.mjs` 单独断言通用规范 `.trellis/spec/backend/governed-file-writing.md:24-30,34-46,58-63` 的每个适用条款均有上述命名 fixture；输出一份 case-name 清单，防止只用笼统“完整矩阵”打勾。
- [ ] 3b.17 `manage-review-input.test.mjs` 单独输出输入 create/replace/remove 的 case-name 清单，并与窄化契约矩阵逐项对照。

```bash
node skills/developer-tools-integrations/skill-session-review/tests/ensure-report-ignore.test.mjs
node skills/developer-tools-integrations/skill-session-review/tests/manage-review-input.test.mjs
```

## 阶段 3c · Markdown / HTML 报告写入矩阵

重写 `tests/write-session-review.test.mjs`。下列场景对 `--format markdown` 与 `--format html` **各覆盖一次**（AC26）；公共平台/adapter 由 2.10 覆盖。

- [ ] 3c.0 缺失/不存在 repo root：在读取输入或写目标前拒绝；缺少 `--repo-root` 时 argparse 失败
- [ ] 3c.1 创建成功：产物存在，stdout hash 与磁盘回读一致，`mode == "create"`
- [ ] 3c.2 目标已存在且无 `--replace`：退出 3，原文件字节不变
- [ ] 3c.3 `--replace` + 正确/过期 hash：分别替换成功/退出 4，失败时旧字节不变
- [ ] 3c.4 准备后的 JSON 被改为 schema 非法、`skill_name != --name`、零样本/零分母、secret-like 或其他跨字段不一致：报告写入器重新拒绝，且无目标、父目录或 temp 新增（AC22、AC29、AC44）
- [ ] 3c.5 各维度 label/score 错配、`execution_efficiency=insufficient_evidence` 或按 Decimal/6 位规则仍不一致的 aggregate：退出 6；另覆盖 `0.8 + 0.4`、循环小数均值和等价 JSON 小数写法（AC11、AC12）
- [ ] 3c.6 加权正向 fixture：两个 curve / overall / grade 与按分阶段 6 位 `ROUND_HALF_UP` 手算一致；覆盖三档及阈值上下各 `0.000001`；满分为 `1.000000/A+`（AC17）
- [ ] 3c.7 全部 `instruction_fit == insufficient_evidence`：维度 null、加权按 0.5，「未能核实」有说明（AC18）
- [ ] 3c.8 只改 coverage 调用计数不会改变 overall/grade，但展示改变（AC39）
- [ ] 3c.9 suggestion 不满足失败会话或两会话支撑时退出 6（AC13）
- [ ] 3c.10 `reason.sentences`/locator 非法或 excerpt 含 secret 时退出 6/7（AC14）
- [ ] 3c.11 suggestions/not_filed 未形成 finding 精确分区时退出 6；合法输入通过（AC15）
- [ ] 3c.12 缺失/非法 `language` 退出 6（AC35）
- [ ] 3c.13 `--review-json` 仅精确 `.input/<name>.json` 成功；目录外、错误 basename/扩展名/大小写、嵌套、traversal、symlink/reparse 均退出 2（AC29）
- [ ] 3c.14 报告写入器收到 stdin 数据或旧 `--input` 时退出 2；输入管理器 raw stdin 路径已由 3b 覆盖（AC29）
- [ ] 3c.15 非法 UTF-8 输入拒绝；BOM + CRLF 可解析且渲染确定性
- [ ] 3c.16 报告写入器的不安全 `--name`、该消费方旧 `--skill-name`、目标 symlink/reparse 全部拒绝且不跟随；扫描器 `--skill-name` 不在此负向范围（AC29、AC42）
- [ ] 3c.17 hostile temp（普通/链接）与外来残留保全；注入 finalization 失败时旧目标不变且只清 owned temp（AC23）
- [ ] 3c.18 ignored/tracked/untracked/non-repo 四态正确；`.gitignore` 与 Git index 始终不变（AC28）
- [ ] 3c.19 stdout 不含正文、JSON 或疑似 secret（AC25）
- [ ] 3c.20 Markdown/HTML 中文 + emoji 往返一致；全 8 脚本 GBK/no-env 边界由 2.11 独立矩阵证明（AC5）
- [ ] 3c.21 同源与幂等：同一 JSON 的 md/html 含同一 finding 与得分；相同输入重跑 hash 相同（AC9）
- [ ] 3c.22 源码扫描：`scripts/*.py` 无未显式 pin encoding 的文本 IO；扫描排除注释与字符串字面量
- [ ] 3c.23 缺 `--format` 或值非法退出 2（AC20）
- [ ] 3c.24 零样本防御 fixture：四平台全 missing-store、store 可用但零 invoked、四类计数全零三种 payload 均退出 6，不产生目标/父目录/temp；任何 renderer 均未被调用（AC44）

```bash
node skills/developer-tools-integrations/skill-session-review/tests/write-session-review.test.mjs
just node-test
```

> 阶段 3b/3c 体量较大。若覆盖成本超出预期，停下重新定范围并记录，不得删减已获批契约矩阵来收口。

**审查闸 3**：三类 helper 的矩阵全绿后再改公共契约。

## 阶段 4 · 公共契约同步（TPR-02 Route 其一）

- [ ] 4.0 以 `.trellis/spec/backend/governed-report-subtree-writing.md:24-36` 为报告子树命令签名真源：输入管理器、报告写入器与 `open_report.py` 三类报告 basename 消费方全部使用 canonical `--name`，不保留它们的 `--skill-name` 别名；这些消费方的正向文档/evals/tests 不得调用旧报告 flag。扫描器继续正向使用独立的 `scan_invocations.py --skill-name`；其 CLI flag 不迁移，`invoked` 真实性、严格事件顺序、Codex 正向读取载体与 assistant 负向排除谓词分离、cwd fail-closed scope、宿主平台路径 identity 与唯一 session id 语义则按 2.10a/R2.14 收紧，并由 scanner test 独立证明；scanner 路径语义不与报告 basename 的 R6 契约混用（AC29、AC42、AC46）
- [ ] 4.1 `SKILL.md` 硬门第 4 条改为四项授权项：两份报告产物；由独立 helper 受控维护的 repo-root `.gitignore` 精确行；由输入管理器维护的 `.input/<name>.json`；`open_report.py` 打开已生成的 HTML。明确报告子树 helper 绝不修改 `.gitignore`（AC31）
- [ ] 4.1a 紧接硬门明确：四类允许项不是本次授权。工作流必须先展示已确认 repo root、canonical name、精确 input/Markdown/HTML 路径及 create/remove/open 效果，并以 AskUserQuestion/等价显式交互取得一次具名报告包确认；root/name/path/effect 漂移即失效。任何 replace 先展示目标当前 SHA-256 并单独确认；`.gitignore` 使用独立通用写入确认（AC45）
- [ ] 4.2 `SKILL.md` 硬门新增：报告 HTML 不得包含外部资源引用或厂商推广
- [ ] 4.3 `SKILL.md` 扫描步骤保留扫描器 `--skill-name`；其后先加 R2.13 零样本门：四 store 全 missing 或零 invoked 时分别输出 `no-session-stores` / `no-invoked-sessions` 并停止，禁止读取切片、构造 JSON、写文件或打开浏览器。只有 invoked ≥ 1 才进入评分，指向 `references/review-scorecard.md`，要求填 `language`、与报告 `--name` 相同的 `skill_name`、`scores`、`aggregate`（含 `overall`/`grade` 声明值）（AC44）
- [ ] 4.4 `SKILL.md` 第 5 步改为：必要时独立预览/授权并确保 ignore → 展示报告包精确快照并取得一次确认 → `manage_review_input.py create --name` → `write_session_review.py --name --format markdown` → `--format html` → `manage_review_input.py remove --name`（三份 hash proof）→ `open_report.py --name`；replace 走单独确认；保留 `<skill-dir>` 字面替换与 `py -3` 注记
- [ ] 4.5 `SKILL.md` 写明输入由 helper 在校验后 no-clobber 创建、两次调用共用、失败时保留，以及仅在 input/md/html hash proof 完整时由 helper 删除（AC30）
- [ ] 4.6 `SKILL.md` 写明部分失败的检测与定向重跑收敛；输入/报告替换均用 `--replace --expected-sha256`，不得直接覆盖（AC33）
- [ ] 4.7 `SKILL.md` 第 6 步：输出 HTML 的 `file://` 路径；`open_report.py` 返回 `"opened": false` 时明确提示需手动打开
- [ ] 4.8 `SKILL.md` frontmatter `version: 0.1.0` → `0.2.0`；`description` 不变；`allowed-tools` 删除不再需要的 `Write`，保留三类 helper 所需的 `Bash(python *)` / `Bash(py *)` 与只读 Git probes
- [ ] 4.9 `agents/interface.yaml` 的 `default_prompt` 与 `side_effect_policy` 按 design §5.7 表格同步，显式包含精确预览、具名报告包一次确认、snapshot 漂移失效和 replace/`.gitignore` 分别确认（AC32、AC45）
- [ ] 4.10 `evals/evals.json`：保留 `assertions` 键；新增 HTML 报告、量表与等级、仅 `instruction_fit=insufficient_evidence` 不拉低均值、零样本 unrated 停止、未确认零 helper、具名报告包一次确认、snapshot 漂移失效、replace 单独确认、canonical `--name` 新入口（受控专用 JSON → 两份产物 → proof cleanup → 打开）用例；扫描步骤仍展示扫描器 `--skill-name`；保留至少两条 routing-negative 用例。`skills/developer-tools-integrations/AGENTS.md:78-83` 已说明 CI 不执行 evals，本步只把它们作为 review/future-tooling 资产，不声称行为已由 CI 运行
- [ ] 4.11 更新 `skills/developer-tools-integrations/AGENTS.md:58`：`skill-session-review` 删除 `Write`，allowed-tools 与 `SKILL.md` 的 Python/只读 Git grants 一致；副作用说明明确独立 `.gitignore` helper、固定报告子树单 payload 写入、专用 JSON proof cleanup 与两份产物成功后的浏览器打开。修正该行 Markdown，使每个 grant 都处于同一 allowed-tools 单元格（AC42）
- [ ] 4.12 校验：

```bash
python scripts/check.py skills/developer-tools-integrations/skill-session-review
python -c "import json;d=json.load(open('skills/developer-tools-integrations/skill-session-review/evals/evals.json',encoding='utf-8'));print(len(d['evals']));[e['assertions'] for e in d['evals']]"
node skills/developer-tools-integrations/skill-session-review/tests/skill-workflow-contract.test.mjs
```

人工对照 spec、`SKILL.md`、interface、目录 `AGENTS.md`、evals 与 tests：三类报告 basename 消费方的正向签名只有 `--name`，它们的 `--skill-name` 只存在于退出 2 的负向 fixture；扫描器正向 `--skill-name` 仍存在于扫描步骤/文档/tests。evals 结构检查结果与 `node-test` 的真实执行证据分开记录（AC42）。

## 阶段 5 · 端到端验证、移除原件与清理

- [ ] 5.0 分别为两个 smoke 展示并确认具名报告包：A 为 canonical `goal-meta-skill`；B 为 canonical `skill-session-review-browser-fixture`。每个都展示已确认 repo root、精确 input/Markdown/HTML 路径及 create/remove/open 效果，并用 AskUserQuestion/等价显式交互取得自己的确认；未确认时断言零 helper 调用。任一目标存在则展示当前 SHA-256 并另取 replace 确认，不得把规划批准、任务实施批准或 A 的确认当作 B 的授权（AC45）
- [ ] 5.1 真实跑一遍：对 `goal-meta-skill` 显式传入仓库内当前真源 `--skill-path`、已确认 `--repo-root` 与 `scope=global`，先执行 R2.13 门。若 `invoked >= 1`，使用 5.0 已确认且未漂移的 A snapshot 执行完整真实复盘工作流——必要时独立确认 ignore → 受控创建输入 → 两次报告写入 → 提交 input/md/html hash proof 删除输入 → 打开报告；记录每次 stdout hash。若 `invoked == 0`，记录 `unrated: no-invoked-sessions` 与四平台 counts，并证明零私密切片读取、零 JSON/writer/open 调用、A 三目标均不存在；不得用历史计数、fixture 或自动发现的其他 skill 实例进入报告分支。真实 findings 可为空，不把 hostile/details 判据绑定到私密样本
- [ ] 5.1a 构造确定性 browser fixture：固定 `evidence` 含 `<script>alert(1)</script>`，且 `findings` 至少含一条可展开项；使用 5.0 已确认且未漂移的 B snapshot，走同一受控输入、两次报告、proof cleanup 与 open 流程，记录 stdout hash
- [ ] 5.2 条件端到端验收（AC6）：A 若 `invoked >= 1`，用系统实际默认浏览器打开 5.1 的 `file://` 报告，在任务 notes 记录浏览器名称/版本、`100%` 缩放和 `1440×900` viewport，并逐项记录 `opened: true`、scorecard 与全部注册区块可见、`scrollWidth <= clientWidth`；A 若 `invoked == 0`，复核 5.1 的安全停止、零副作用与三目标不存在证据，不调用浏览器。B 始终用系统实际默认浏览器打开 5.1a 的 `file://` 报告，并在任务 notes 记录浏览器名称/版本、`100%` 缩放和 `1440×900` viewport；逐项记录 `opened: true`、hostile `<script>` 只显示为文本且不执行、`scrollWidth <= clientWidth`、固定 finding 的 `details` 可展开并再次折叠。任一适用项失败则 AC6 失败；浏览器分支的 `opened: false` 只能证明 AC34 的非致命回退，不能把 AC6 打勾
- [ ] 5.3 静态校验：

```powershell
node skills/developer-tools-integrations/skill-session-review/tests/html-no-external-resources.test.mjs
$reports = @('reports/skill-session-review/skill-session-review-browser-fixture.html')
if (Test-Path -LiteralPath 'reports/skill-session-review/goal-meta-skill.html') {
    $reports += 'reports/skill-session-review/goal-meta-skill.html'
}
rg -ni 'warp|factories|request access' -- $reports    # 期望：无命中
```

- [ ] 5.4 六区块 + 得分 + 等级齐全（AC8）：B 始终对照 `references/report-template.md` 逐项确认；A 仅在 5.1 进入报告分支时同样确认
- [ ] 5.5 确认两个已执行报告包的专用输入均已删除：`goal-meta-skill` 零 invoked 分支证明其输入从未创建；其他分支分别复核固定 `.input/<name>.json` 不存在，不要求报告子树内与本任务无关的输入目录全空
- [ ] 5.6 人工验收 R2.4/R2.5（AC16）：A 若进入报告分支，在任务 `notes.md` 分开写两张语义表——逐 finding 核对 file / don't-file；逐个 invoked 会话的两个评分理由核对 locator 与行为一致、没有只复述 label/score、指出至少一个因果机制、指出至少一个可修复的技能指令/流程/工具或校验杠杆。每行记录 session/finding id、四项 pass/fail 与有界理由；任一 fail 阻断审查闸，不得用 AC14 的结构 fixture 代证语义。A 若为零 invoked，则 notes 将两张真实样本语义表标为不适用，并引用 5.1 的零样本证据；结构与边界仍由现有 fixtures 覆盖，不伪造人工样本
- [ ] 5.7a **复用阶段 0 的单一 task helper**：确认 `.trellis/tasks/08-29-consolidate-skill-review/scripts/invoke-source-removal.ps1` 仍是 design §12.3 定义的版本，使用 `[CmdletBinding()]`；`Initialize-ReviewBackup` 与 `Invoke-ReviewSourceRemoval` 共用唯一 path/reparse/inventory-set 实现，后者显式接收 repo root、backup root、两个固定 source name、expected governed source/final、expected physical source/final、`[scriptblock]$CopyTree` 与 `[scriptblock]$RemoveTree`，默认递归 action 均带 `-ErrorAction Stop`。阶段 5 不复制第二份实现（AC41）
- [ ] 5.7b **实现 `.removed` 状态机**：所有 repo/source/backup 边界、逐字符路径、root/子树 reparse、governed source `14/<sha256>` 与 physical source `17/<sha256>` 双预检先于 mutation。`.removed` 不存在时进入 `prepare` 并复制验证 governed actual-final `28/<sha256>` 与 physical actual-final `34/<sha256>`；已存在时只有“两源与 backup/removed 的对应双 identity 均匹配”才进入 `verified-reused` 并跳过复制。其他既有状态返回 `source_removal_recovery_required`，不得清理、覆盖或继续
- [ ] 5.7c **先跑无生产副作用的 self-test**：helper 的 `-Mode SelfTest -SelfTestScope Removal` 在唯一临时 fixture 下，通过 shim `$RemoveTree` 分别令第一个、第二个 source 抛出终止异常；两例都断言双源恢复、governed 14/hash、physical 17/hash、`source_removal_failed_recovered`、停止且 `.removed` 保留。随后对恢复 fixture 注入无故障 action，断言先进入双 identity `verified-reused` 再成功删除两源。另在 `__pycache__` 注入 `unexpected.bin`，断言 governed identity 不变但 physical identity 改变，backup reuse、removed reuse、恢复验收与 cleanup proof 均拒绝；以独立 Removal fixture 预先持有 task mutation lease，断言第二个 Execute fail-closed，且 source、final 与 owned staging identity 全部不变。finally 只在 resolved temp parent 内清理自己创建的 fixture。self-test 不接触真实 repo/backup，不用随机权限故障代替注入
- [ ] 5.7d **真实调用**：只有 self-test 全绿后，才以真实 root 与阶段 0 记录的 governed/physical source/final 四个 hash 调用同一 helper。stdout 必须是有界 JSON，含 `state`、`removed_copy_mode: prepared|verified-reused`、两套 source/final count/hash 与失败 source index（若有），不得含主机绝对路径

```powershell
$reviewRemovalHelper = Join-Path $reviewRepoExpected '.trellis/tasks/08-29-consolidate-skill-review/scripts/invoke-source-removal.ps1'

$reviewSelfTest = & $reviewRemovalHelper -Mode SelfTest -SelfTestScope Removal
if ($LASTEXITCODE -ne 0) { throw 'source removal helper self-test failed' }
$reviewSelfTestState = $reviewSelfTest | ConvertFrom-Json -ErrorAction Stop
if (-not $reviewSelfTestState.first_failure_recovered -or
    -not $reviewSelfTestState.second_failure_recovered -or
    -not $reviewSelfTestState.verified_reused_retry -or
    -not $reviewSelfTestState.unexpected_pycache_physical_drift_rejected -or
    -not $reviewSelfTestState.removal_lock_contention_rejected -or
    -not $reviewSelfTestState.removal_lock_contention_source_identity_unchanged -or
    -not $reviewSelfTestState.removal_lock_contention_final_identity_unchanged -or
    -not $reviewSelfTestState.removal_lock_contention_staging_unchanged -or
    -not $reviewSelfTestState.removal_lock_cleanup_verified) {
  throw 'source removal helper self-test matrix incomplete'
}

$reviewRemovalArgs = @{
  Mode = 'Execute'
  RepoRoot = $reviewRepoExpected
  BackupRoot = $reviewBackupPath
  ExpectedSourceSha256 = '<source-sha256-from-phase-0>'
  ExpectedPhysicalSourceSha256 = '<physical-source-sha256-from-phase-0>'
  ExpectedFinalSha256 = '<virtual-final-sha256-from-phase-0>'
  ExpectedPhysicalFinalSha256 = '<physical-virtual-final-sha256-from-phase-0>'
}
$reviewRemovalResult = & $reviewRemovalHelper @reviewRemovalArgs
if ($LASTEXITCODE -ne 0) { throw 'source removal helper failed; inspect bounded state and stop' }
$reviewRemovalState = $reviewRemovalResult | ConvertFrom-Json -ErrorAction Stop
if ($reviewRemovalState.state -ne 'removed') { throw 'source removal did not reach removed state' }
```

- [ ] 5.7e **状态处理**：`source_removal_failed_recovered` 记录失败 source index、恢复后的 governed `14/<sha256>`、physical `17/<sha256>` 与 `.removed` 双 identity 证明后停止；后续重跑同一 helper 必须走 `verified-reused`。任何 `source_removal_recovery_required` 只记录两个相对 source 的 present/missing、当前两套 inventory 与有界错误类别，保持 backup 不动，不得继续 5.8、CI、提交或 archive。只有 `state=removed`、两个 source 均不存在且 backup actual-final 仍同时为 governed 28/hash 与 physical 34/hash 时进入 5.8

- [ ] 5.8 写移除记录到 `.trellis/tasks/08-29-consolidate-skill-review/notes.md`（AC3、AC38、AC41）：governed source `14/<sha256>`、governed virtual/actual final `28/<sha256>`、physical source `17/<sha256>`、physical virtual/actual final `34/<sha256>` 的全部有序相对路径、计数、执行时间、占位路径 `%USERPROFILE%/.claude-skill-backup/08-29-consolidate-skill-review` 与算法标识。记录 helper self-test 的复制失败、删除失败、verified reuse、`unexpected.bin` physical-drift rejection 状态与真实 `removed_copy_mode: prepared|verified-reused`；注明移除晚于阶段 1 取材，两套 virtual-final 与 actual-final digest 各自一致，不写主机绝对路径
- [ ] 5.9 悬挂引用检查（AC2）：

```bash
rg -n "skill-doctor|update-skill" skills platforms docs scripts .trellis/spec
# 期望：无命中（ref/ 不在检索范围）
```

- [ ] 5.10 `git status -uall skills/developer-tools-integrations/` 不再列出两个已删目录下的任何路径（AC1）
- [ ] 5.11 文档同步（会重写全部 docs 页；执行前以 design §1 的穷举计划变更清单重新分类 live dirty path，其中 task-evidence allowlist 精确包含 `scripts/invoke-source-removal.ps1`、`scripts/test-external-root-guard.ps1`、`notes.md` 与 `research/source-migration-evidence.md`；外部 archived task与 protected workflow 均不纳入输出边界；任何其他计划外/未识别项都停止）。`just docs-sync` 与随后 `just ci` 必须分别作为 0.1 定义的单个受保护命令运行，各自前后已通过 root-reparse fixture 的 root-aware external snapshot 完全一致：

```bash
just docs-sync
just ci
```

- [ ] 5.12 `just ci` 全绿后再次确认备份仍存在、governed actual-final 为 `28/<sha256>`、physical actual-final 为 `34/<sha256>`，且两套有序路径与 notes 相同；在阶段 6 工作提交和阶段 7 archive 前硬门完成前继续保留，不 rename、不删除。

> 回退点 B：5.11 未过则停在此处，保留备份供恢复且不执行 Q2 的最终处置。5.7 之前可随时放弃且仓库无损。

## 阶段 6 · 提交

未跟踪目录移走后 `git diff` 为空，**不存在可提交的删除变更**。提交计划相应不含「移除」提交（TPR-07）。

- [x] 6.1 **Phase 3.4 dirty-state 快照**：提交前重新运行 `git status --porcelain=v1 --untracked-files=all` 与 `git diff --name-status`，学习 `git log --oneline -5` 的实际提交风格；逐项分类为「本轮 Agent 已编辑」「未识别」或「protected external」。阶段 0 历史 allowlist 不能代替当前归属判断。执行 0.1 root-aware external snapshot：unresolved/canonical archive root identity、后代、clean/manifest 均不变，protected workflow 保持固定 ` M` status/SHA且未 staged（AC43）
- [x] 6.2 **按真实 diff 拟定文件清单**：下列消息仅是候选；为每条候选列出实际逐文件清单，普通未识别 dirty path 单列 `Unrecognized dirty files`，`.github/workflows/agentkit-desktop.yml` 单列 `Protected external dirty files (NOT in any commit)`，外部 archived task 单列为 clean identity guard；全部默认不纳入。任何本任务文件不得重复或遗漏；两类外部 path 绝不进入 pathspec。design §1 已登记的 task evidence（`scripts/invoke-source-removal.ps1`、`scripts/test-external-root-guard.ps1`、`notes.md`、`research/source-migration-evidence.md`）连同其余 `.trellis/tasks/08-29-consolidate-skill-review/` 工件统一留给阶段 7 的 `task.py archive --no-commit` 与精确 archived-task 手工提交，不得混入工作提交
  1. `docs(spec): 新增受控报告子树写入契约`
  2. `feat(skills): skill-session-review 引入评分量表、加权等级与 HTML 报告`
  3. `fix(skills): skill-session-review 拆分受控输入、报告写入与 ignore helper`
  4. `docs: 同步 skills catalog`
- [x] 6.3 **一次性确认门**：向用户只展示一次完整的 `Proposed commits (in order)`，每项含实际文件；底部分别单列 `Unrecognized dirty files (NOT in any commit)` 与 `Protected external dirty files (NOT in any commit)`。等待用户回复 `ok` / `行` 或给出修订；确认前不得运行 `git add` / `git commit`（AC43）
- [x] 6.4 用户确认后重新核对 status 与获批文件集合未漂移；若漂移，原确认失效并回到 6.1。未漂移才依序以逐项精确 pathspec 执行获批工作提交；不得 amend、不得 push。普通未识别文件只有在用户明确纳入某批后才可提交；external archived task 与 protected workflow 不适用该例外，本任务无权纳入
- [x] 6.5 提交前 `just ci` 必须按 0.1 的单命令前后快照门运行并全绿；工作提交后确认除 active current-task 工件和 protected workflow 外无本任务 dirty path，外部 archived task clean，且 index 不含两类外部 path。最终生命周期顺序保持：work commits → archive commit → journal commit
- [x] 6.6 不建 PR，除非另行要求

## 阶段 7 · archive 前完成 AC，随后执行 post-closeout cleanup

- [x] 7.1 **archive 前 AC40/AC41/AC43 硬门**：记录阶段 6 工作 commit hashes；确认 `just ci` 仍为 green且 index 为空；重新加载阶段 0.3 的 inventory-set 函数，并在同一个 PowerShell 进程中完成精确路径、边界、root/子树 reparse、governed `28/<actual-final-sha256>` 与 physical `34/<physical-actual-final-sha256>` 双复核。同时执行 0.1 root-aware external snapshot，确认旧 active external root absent、外部 archive unresolved/canonical root与后代均无 reparse且 clean/identity不变、protected workflow status/hash不变且两类外部 path均未进入 index，并准备给 7.2 PC2 使用的 archive 前快照。任何失败都保留备份、保持 task 未归档并停止；通过时 root task 的全部 AC 已完成。archive 后的隔离证明属于 PC2，不反向充当本硬门。

```powershell
$reviewRemovalHelper = (Resolve-Path -LiteralPath '.trellis/tasks/08-29-consolidate-skill-review/scripts/invoke-source-removal.ps1' -ErrorAction Stop).Path
$reviewRemovalHelperItem = Get-Item -LiteralPath $reviewRemovalHelper -Force -ErrorAction Stop
if (($reviewRemovalHelperItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'removal helper is a reparse point' }
. $reviewRemovalHelper -Mode Library

$reviewBackupResolved = Get-ReviewFixedBackupRoot
$reviewBackupPaths = Get-ReviewValidatedBackupPaths -BackupRoot $reviewBackupResolved
$reviewMutationLease = Enter-ReviewMutationLock -BackupParent $reviewBackupPaths.Parent
try {
  $reviewPreArchiveIdentity = Assert-ReviewFixedBackupFinalIdentity `
    -ExpectedFinalSha256 '<governed-actual-final-sha256-from-notes>' `
    -ExpectedPhysicalFinalSha256 '<physical-actual-final-sha256-from-notes>' `
    -MutationLock $reviewMutationLease
}
finally {
  $reviewMutationLease.Dispose()
}
```

- [ ] 7.2 只有 7.1 全部通过且 `git diff --cached --name-only` 为空，才把 `python ./.trellis/scripts/task.py archive 08-29-consolidate-skill-review --no-commit` 作为 0.1 定义的单个受保护命令运行。命令后确认 root-aware external snapshot 未漂移，任务被标为 `completed`、移动到 `.trellis/tasks/archive/<year-month>/`，并记录命令实际输出的精确 archived current-task 路径；不得依赖 Trellis auto-commit。若 archive 前 `git ls-files -- .trellis/tasks/08-29-consolidate-skill-review` 为空，只 `git add -- <exact-archived-current-task-dir>`；若非空，再以 `git add -A -- .trellis/tasks/08-29-consolidate-skill-review` 精确 stage source 删除。stage 后 `git diff --cached --name-only` 必须逐项位于这两个精确 pathspec且不含外部 archived-task path或 protected workflow，才手工 `git commit -m "chore(task): archive 08-29-consolidate-skill-review"`。archive 已移动/完成但任一后置检查或提交失败时不得重跑 archive、不得执行 PC1；保留备份并只修复/提交同一精确 archive diff。
- [ ] 7.3 **非 task AC 的 post-closeout cleanup（PC1）**：archive 成功后，Q2 已授权删除。必须在一个 PowerShell 进程中从 7.2 记录的 archived task 精确路径加载阶段 0.3 的同一函数，并重新执行 7.1 的全部路径/reparse/governed+physical 双 identity 检查后删除；不得依赖 archive 前快照，不得先在 Bash 枚举再把字符串传给另一 shell。所有关键读取、递归枚举、hash、删除和删除后检查都使用 `-ErrorAction Stop`；有界 catch 保留原始 exception type 与失败阶段，并独立探测残余：

```powershell
$reviewCleanupPhase = 'validation'
$reviewCleanup = [ordered]@{
  deleted = $false
  residual = $null
  failure_phase = $null
  failure_category = $null
  residual_probe_category = $null
  retry_proof = 'not-applicable'
  retry_proof_category = $null
  retryable = $false
  requires_new_task = $false
}
$reviewBackupExpected = $null
$reviewMutationLease = $null

try {
  $reviewArchivedTaskDir = (Resolve-Path -LiteralPath '<exact-archived-task-dir-from-7.2>' -ErrorAction Stop).Path
  $reviewRemovalHelper = (Resolve-Path -LiteralPath (Join-Path $reviewArchivedTaskDir 'scripts/invoke-source-removal.ps1') -ErrorAction Stop).Path
  $reviewRemovalHelperItem = Get-Item -LiteralPath $reviewRemovalHelper -Force -ErrorAction Stop
  if (($reviewRemovalHelperItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'removal helper is a reparse point' }
  . $reviewRemovalHelper -Mode Library

  $reviewBackupResolved = Get-ReviewFixedBackupRoot
  $reviewBackupExpected = $reviewBackupResolved
  $reviewBackupPaths = Get-ReviewValidatedBackupPaths -BackupRoot $reviewBackupResolved
  $reviewMutationLease = Enter-ReviewMutationLock -BackupParent $reviewBackupPaths.Parent
  $reviewPostCloseoutIdentity = Assert-ReviewFixedBackupFinalIdentity `
    -ExpectedFinalSha256 '<governed-actual-final-sha256-from-notes>' `
    -ExpectedPhysicalFinalSha256 '<physical-actual-final-sha256-from-notes>' `
    -MutationLock $reviewMutationLease

  $reviewCleanupPhase = 'delete'
  Remove-Item -LiteralPath $reviewBackupResolved -Recurse -Force -ErrorAction Stop
  $reviewCleanupPhase = 'post-delete-check'
  if (Test-ReviewPathPresent -Path $reviewBackupResolved) { throw 'backup deletion did not complete' }
  $reviewCleanup.deleted = $true
  $reviewCleanup.residual = $false
}
catch {
  $reviewOriginalException = $_.Exception
  $reviewCleanup.failure_phase = $reviewCleanupPhase
  $reviewCleanup.failure_category = $reviewOriginalException.GetType().FullName
  try {
    if ($null -eq $reviewBackupExpected) { throw 'fixed backup path was not established' }
    $reviewCleanup.residual = Test-ReviewPathPresent -Path $reviewBackupExpected
  }
  catch {
    $reviewCleanup.residual = 'unknown'
    $reviewCleanup.residual_probe_category = $_.Exception.GetType().FullName
  }
  $reviewEligibleDeleteFailure = $reviewCleanupPhase -eq 'delete' -and (
    $reviewOriginalException -is [UnauthorizedAccessException] -or
    $reviewOriginalException -is [IO.IOException]
  )
  if ($reviewEligibleDeleteFailure -and $reviewCleanup.residual -eq $true) {
    try {
      $reviewRetryIdentity = Assert-ReviewFixedBackupFinalIdentity `
        -ExpectedFinalSha256 '<governed-actual-final-sha256-from-notes>' `
        -ExpectedPhysicalFinalSha256 '<physical-actual-final-sha256-from-notes>' `
        -MutationLock $reviewMutationLease
      $reviewCleanup.retry_proof = 'full-governed-and-physical-final-inventory'
      $reviewCleanup.retryable = $true
    }
    catch {
      $reviewCleanup.retry_proof = 'failed'
      $reviewCleanup.retry_proof_category = $_.Exception.GetType().FullName
      $reviewCleanup.requires_new_task = $true
    }
  }
  else {
    if ($reviewCleanupPhase -eq 'delete') {
      $reviewCleanup.retry_proof = 'not-eligible-or-no-complete-residual'
    }
    $reviewCleanup.requires_new_task = $true
  }
}
finally {
  if ($null -ne $reviewMutationLease) { $reviewMutationLease.Dispose() }
}

$reviewCleanup | ConvertTo-Json -Compress
```

- [ ] 7.4 无论 7.3 成功还是失败，都先确认 index 为空，再把 `add_session.py ... --no-commit` 作为 0.1 定义的单个受保护命令运行，禁止其 auto-commit。summary 只写占位路径、governed/physical 两套 actual-final hash、`deleted`、`residual`、原始 `failure_phase` / `failure_category`、独立残余探测失败时的 `residual_probe_category`、`retry_proof` / `retry_proof_category`、`retryable`、`requires_new_task` 与阶段 6 工作 commit hashes，不得包含主机绝对路径或异常 message。命令后确认 root-aware external snapshot 不变；将前后 dirty snapshot 做差，只允许本次 current developer 的实际 `journal-*.md` 与 `index.md` 进入 journal allowlist。以这些精确文件逐项 `git add --`，cached name set 必须与 allowlist 逐字符相等且不含外部 archived-task path、protected workflow或 `.trellis/tasks/`，才手工 `git commit -m "chore: record journal"`。`validation` / `post-delete-check` 失败、非权限/占用/杀毒类的 `delete` 失败，以及任何部分/未知/任一 identity 不匹配残余均记为 `requires_new_task: true`；只有 `delete` 阶段类别符合边界且重新通过精确路径、无 reparse、governed `28/<sha256>` 与 physical `34/<sha256>` 全量证明才记为 `retryable: true`，可在既有 Q2 授权下重跑同一 PC1。
- [ ] 7.5 最终核对 commit 顺序：工作提交 → 手工 archive commit → 手工 journal commit；`git status --short` 不含本任务 dirty path，external archived task仍 clean，protected workflow仍保持原 status/hash且未被提交。若 7.3 失败，可称 root task 已完成并归档，但必须明确 `post-closeout cleanup: pending`，不得把后置清理报为完成。

## 验收对照

| AC | requirement | 验证位置 |
| --- | --- | --- |
| AC1 | R1.1, R1.2 | 5.10 |
| AC2 | R1.3 | 5.9 |
| AC3 | R1.5, R1.7 | 0.3、5.8 |
| AC4 | R4.1, R4.3 | 4.8、4.12 |
| AC5 | R4.2 | design §10、2.11、3c.20 |
| AC6 | R2.13, R3.1, R3.7 | design §8.4、5.1～5.2 |
| AC7 | R3.2, R3.4 | 2.7、5.3 |
| AC8 | R3.3 | 5.4 |
| AC9 | R3.5 | 3c.21 |
| AC10 | R2.1, R2.2 | 1.1 |
| AC11 | R2.1, R2.2, R2.6 | 3c.5 正反 fixture |
| AC12 | R2.2, R2.6 | 3c.5 |
| AC13 | R2.3, R2.7 | 3c.9 |
| AC14 | R2.5, R2.8 | 3c.10（仅结构/定位器） |
| AC15 | R2.4, R2.9 | 3c.11 |
| AC16 | R2.4, R2.5, R2.10 | 1.5、5.6（逐评分理由语义人工验收） |
| AC17 | R2.11 | 1.2、3c.6 |
| AC18 | R2.11 | 3c.7 |
| AC39 | R2.12 | 1.3、2.2、3c.8 |
| AC19 | R4.4, R6.6 | 4.10、4.12 |
| AC20 | R5.1 | 3a.4、3a.5、3a.8、3b.3、3b.6、3b.13、3c.23 |
| AC21 | R5.2 | 3b.3、3b.7、3c.2、3c.3 |
| AC22 | R5.3 | 3b.2、3b.8、3c.4 |
| AC23 | R5.4 | 3b.4、3b.11、3c.17 |
| AC24 | R5.5 | 3b.4、3b.6、3b.11、3c.1、3c.17 |
| AC25 | R5.6 | 3b.5、3b.15、3c.19 |
| AC26 | R5.7 | 2.10、3b.1～3b.17、3c.0～3c.24 × 2 format |
| AC27 | R5.8 | 2.3、2.6 |
| AC28 | R5.9 | 3a.17、3b.5、3b.15、3c.18 |
| AC29 | R6.1, R6.2, R6.8 | 1.4、2.4、2.9、3a.5、3a.8～3a.10、3b.8、3b.10、3c.4、3c.13～3c.16、4.0、4.3 |
| AC30 | R6.3 | 3b.12～3b.14、4.5 |
| AC31 | R6.4 | 4.1 |
| AC32 | R6.5 | 4.9 |
| AC33 | R6.7 | 4.6 |
| AC34 | R3.6 | 2.4、2.9 |
| AC35 | R7.1, R7.2 | 2.1、3c.12 |
| AC36 | R7.3 | 2.8 |
| AC37 | R4.5 | 5.11 |
| AC38 | R1.4 | 0.3、5.7、5.8 |
| AC40 | R1.6 | 5.12、6.5、7.1 |
| AC41 | R1.7, R1.9, R1.10 | 0.3、design §12.3、5.7、5.8、7.1 |
| AC42 | R4.1, R4.6, R6.2, R6.5, R6.6 | 2.4、2.9、3b.10、3c.16、4.0、4.8～4.12 |
| AC43 | R8.1, R8.2 | 0.1、design §14.1、6.1～6.5、7.1～7.2 |
| AC44 | R2.13, R3.1 | 1.3a、2.10、3a.2、3b.8、3c.4、3c.24、4.3 |
| AC45 | R5.10, R6.4, R6.7 | design §5.3～§6.3、2.10、4.1a、4.4、4.9～4.10、5.0～5.1 |
| AC46 | R2.14 | design §3.3a、2.10a、4.0 |

PC1（R1.8）与 PC2（R8.2）都是 archive 后的 post-closeout 判据，不列入本 task AC 对照：PC1 的备份删除与失败归属位于 7.3～7.5，PC2 的 archive/journal `--no-commit`、protected 前后快照与精确手工提交位于 7.2、7.4～7.5。
