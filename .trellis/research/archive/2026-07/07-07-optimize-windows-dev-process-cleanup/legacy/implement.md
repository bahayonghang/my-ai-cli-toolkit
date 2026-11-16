# Implement — 优化 windows-dev-process-cleanup skill

执行前提：`task.py start` 之后才动手；每步的 verify 命令必须真实运行并读输出。skill 根目录以下简称 `$SKILL = skills/developer-tools-integrations/windows-dev-process-cleanup`。

## Step 1 — UWP 脚本修复（P0）

- [x] 1.1 `Stop-Pids` 调用点改 `-TargetPids`；函数加可选 `[scriptblock]$KillAction`，默认实现 = `Stop-Process -Force` + `Get-Process` 复查；输出加 `details` 逐 PID 结果，聚合 `result` 按 design 1.1 规则。
- [x] 1.2 cleanup 结果加 `registry_changed` 字段（phone-link + `-DisablePhoneLinkBackground` 且非 WhatIf 时 true）。
- [x] 1.3 `Mode=cleanup` 且 `Profile=none` → throw；首行加 `#requires -Version 7.0`。
- verify:
  ```bash
  pwsh -NoLogo -File "$SKILL/scripts/audit-uwp-backgroundtasks.ps1" -Mode audit -AsJson   # JSON 合法
  pwsh -NoLogo -File "$SKILL/scripts/audit-uwp-backgroundtasks.ps1" -Mode cleanup -Profile dolby-backgroundtask -WhatIf -AsJson   # cleanup.result == preview, registry_changed == false
  pwsh -NoLogo -File "$SKILL/scripts/audit-uwp-backgroundtasks.ps1" -Mode cleanup 2>&1    # 报错含 Profile is required，非零退出
  ```
- 回滚点：独立 commit `fix(skills): repair windows-dev-process-cleanup uwp cleanup binding`。

## Step 2 — dev 脚本修复（P0 + P2）

- [x] 2.1 成员级分类：树对象加 `member_categories` / `mixed_tree`；mixed 树强制 manual-review 且所有 profile 筛选加 `-not $_.mixed_tree`。
- [x] 2.2 `Get-Recommendation` 用上 `$CodexParent`/`$Age`（新增 `$StaleMinutes` 传参）：codex+stale 的 playwright 树标 `stale-codex-playwright`（safe_to_kill 仍 false）。
- [x] 2.3 `-AsJson` 的 `exit 0` 移到 `-Export*` 处理之后；首行加 `#requires -Version 7.0`；`Get-ChainRootPid` 加防循环访问集；`workspace_match` 改 `IndexOf(..., OrdinalIgnoreCase)`。
- verify:
  ```bash
  pwsh -NoLogo -File "$SKILL/scripts/audit-dev-processes.ps1" -Mode audit -AsJson         # JSON 合法，trees 元素含 mixed_tree 字段
  pwsh -NoLogo -File "$SKILL/scripts/audit-dev-processes.ps1" -Mode audit -AsJson -ExportJson "$TEMP/dpa.json" && test -s "$TEMP/dpa.json"   # AsJson 与导出共存
  pwsh -NoLogo -File "$SKILL/scripts/audit-dev-processes.ps1" -Mode cleanup -Profile safe -WhatIf   # 正常输出，无异常
  ```
- 回滚点：独立 commit `fix(skills): guard mixed trees and align audit labels in dev process cleanup`。

## Step 3 — 测试落地（R10）

- [x] 3.1 新建 `$SKILL/tests/audit-scripts.test.mjs`：环境门（非 win32 / 无 pwsh → skip）、双脚本解析门、`Stop-Pids` shim 单测（含存活→failed→partial 路径）、`Get-CategoryFromLines` fixtures、混合树排除断言、三条端到端冒烟（audit×2 + dolby WhatIf）、缺 profile 报错断言、SKILL.md 文档 lint（无裸 `scripts/` 调用、frontmatter 含 category/tags/version）。
  - 注意：文档 lint 在 Step 4 之前会失败——本步先写测试并允许该断言 red，Step 4 转 green（顺序即 TDD 检查点）；或本步内先只提交脚本类断言、文档断言随 Step 4 提交。二选一，实施时择简。
- [x] 3.2 若 dot-source 抽函数不稳，按 design §4 允许把脚本调整为"函数区 + 底部主流程"结构（行为不变）。
- verify:
  ```bash
  just node-test        # 自动发现新测试并通过（或仅文档断言按上写明的顺序例外）
  ```
- 回滚点：独立 commit `test(skills): add regression tests for windows-dev-process-cleanup`。

## Step 4 — 元数据 / 文档 / 接口（R4–R8）

- [x] 4.1 SKILL.md frontmatter：加 `category` / `tags` / `version: 1.1.0`；重写 `description`（中英触发词、覆盖 dev+UWP 两半、平台中立、含 pwsh.exe 与 backgroundTaskHost/Phone Link/Dolby/任务管理器/进程堆积关键词、无尖括号、≤1024 字符）。
- [x] 4.2 SKILL.md 正文：全部命令改 `"<skill-dir>/scripts/..."`；分类按脚本拆两节并补 `mixed_tree`/`stale-codex-playwright`/`details`/`registry_changed` 解读；正文统一英文；补 cleanup 显式 profile、`-AsJson`+`-Export*` 组合、PS7 要求。
- [x] 4.3 `git mv $SKILL/agents/openai.yaml $SKILL/agents/interface.yaml` 并更新文案覆盖 UWP。
- [x] 4.4 两份 README 修 drift：Store/ToDo 表述限定、PS7 必需、测试说明、示例注明在 skill 目录内执行。
- verify:
  ```bash
  PYTHONUTF8=1 python scripts/check.py "$SKILL"    # OK 且零 warning
  just node-test                                    # 文档 lint 断言转 green
  ls "$SKILL/agents/"                               # 仅 interface.yaml
  ```
- 回滚点：独立 commit `docs(skills): align windows-dev-process-cleanup metadata, docs, and agent interface`。

## Step 5 — 终检（review gate）

- [x] 5.1 `just ci` 全绿（skills-check / python-check / node-test / git diff --check）。
- [x] 5.2 对照 prd.md Acceptance Criteria 逐条勾验，任何一条不满足回到对应 Step。
- [x] 5.3 真机人工冒烟一遍 SKILL.md 里的 audit 与 `-WhatIf` 命令（复制粘贴替换 `<skill-dir>` 后应原样可跑）。
- [ ] 5.4 Trellis Phase 3：质量核验 → spec 更新（若沉淀出可复用约定，如 "<skill-dir> 路径约定/ps1 测试模式"）→ 按上述四个提交点提交 → finish。

## 风险与缓解

- **真机进程环境不可控**（测试机可能没有 playwright/dolby 进程）：端到端断言只锚定结构与退出码，不锚定计数；行为断言全部走 shim/fixture 单测。
- **dot-source 顶层副作用**：dev 脚本顶层立即枚举 CIM——单测只注入/抽取纯函数；必要时按 3.2 做结构微调，行为回归靠冒烟命令兜底。
- **文档 lint 与文档改动的顺序耦合**：已在 3.1 显式写明两种处理顺序，避免中途 red 被误判为回归。
