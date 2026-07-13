# 执行计划：image-to-ui 审计修复父任务

## Phase Order

1. [x] 用户审阅并批准本父任务与三个 child 的 planning artifacts。
2. [x] 单独启动并完成 `07-11-image2-wrapper-correctness`。
3. [x] 单独启动并完成 `07-11-image-to-ui-routing-contract`。
4. [x] routing child 完成后，单独启动并完成 `07-11-image-to-ui-validator-migration`。
5. [x] 三个 child 全部满足验收后，再启动父任务进行最终集成；不要提前启动父任务。
6. [x] 确认工作区仅包含本任务树的已识别变更，记录任何无关 dirty file。
7. [x] 运行一次 `just docs-sync`，审查生成 diff 仅涉及 image-to-ui skill catalog/detail 页面。
8. [x] 执行完整本地门禁、显式 browser opt-in、资产零 diff 与 `.ps1` 零命中检查。
9. [ ] 按 Trellis Phase 3.4 一次展示原子 commit plan；用户确认后提交，不 push。
10. [ ] 单独请求 push/PR 外部操作授权；获权后执行远程流程并核对 GitHub 三平台 Node 20 browser opt-in 结果。
11. [ ] 更新 gate report：三平台成功记 evidence；未获权/未运行记 `missing evidence` 并保持父任务未完成。
12. [ ] 远程门禁全绿后加载 `trellis-finish-work` 完成归档和 journal 流程。

## Parent Validation Commands

PowerShell：

```powershell
python ./.trellis/scripts/task.py validate 07-11-image2-wrapper-correctness
python ./.trellis/scripts/task.py validate 07-11-image-to-ui-routing-contract
python ./.trellis/scripts/task.py validate 07-11-image-to-ui-validator-migration
python ./.trellis/scripts/task.py validate 07-11-image-to-ui-skill-audit-fixes
just docs-sync
just docs-check
just skills-check
just python-check
just node-test
$env:IMAGE2_SKILL_BROWSER_TESTS = "1"
just node-test
Remove-Item Env:IMAGE2_SKILL_BROWSER_TESTS
just ci
git grep -l "validate.ps1" -- skills/developer-tools-integrations/image-to-ui-skill
git diff --exit-code -- skills/developer-tools-integrations/image-to-ui-skill/assets skills/developer-tools-integrations/image-to-ui-skill/demo/artmuse-ios/screenshots skills/developer-tools-integrations/image-to-ui-skill/demo/marble-note/screenshots
git diff --check
git status --short
```

`git grep` 预期退出码 1且无输出。所有其他命令预期退出码 0。

## Review Gates Before Starting Any Task

- 当前仍处于 planning；本轮只修复 artifacts，没有执行 `task.py start`。
- 先由用户审阅任务树、Node 20 CDP pipe 方案、三平台显式 browser CI 和 Production gate 范围。
- child 开始时使用 `trellis-before-dev`；完成代码后使用 `trellis-check`，不调度 implement/check sub-agent（inline mode）。
- 实施中若需要 npm 依赖、提升 Node baseline、修改 demo 页面或放宽 browser fail-closed，必须回到 planning 并重新取得用户批准。

## Commit And Rollback

- 不再采用“每个编号步骤一个 commit”。
- 完成全部实现与验证后，按实际 diff 划分少量原子 batch，并一次性向用户展示文件集合与消息。
- 旧 validator 删除必须与 runner 引入分开 batch，方便独立 revert；generated docs 可独立 batch。
- assets、tracked screenshots 与任何无关 dirty file不得进入提交计划。
