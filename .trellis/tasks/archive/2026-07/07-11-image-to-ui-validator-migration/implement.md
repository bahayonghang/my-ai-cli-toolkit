# 执行计划：Node 20 跨平台 validator 迁移

## Preconditions

- 先完成 `07-11-image-to-ui-routing-contract`，使最终 references 索引稳定。
- 本子任务开始前加载 `trellis-before-dev` 与相关 skill/spec 指南。
- 确认 assets 与已跟踪 demo screenshots 在 baseline diff 中为空。

## Ordered Checklist

1. [x] 编写 `tests/skill-structure.test.mjs`，移植 root ps1 的有效静态断言；初期允许 demo validator 为 ps1 或 mjs，删除门禁后收紧为 mjs-only。
2. [x] 在 `scripts/validate_demo.mjs` 实现并单测 browser discovery、static server、NUL frame decoder、CDP pending/session transport。
3. [x] 实现 runner orchestration、退出码、stderr/stdout JSON 契约与可靠 cleanup。
4. [x] 新增两个 demo 薄入口，逐条移植旧静态断言、ready expression、点击步骤和数量断言。
5. [x] 新增 `tests/demo-validation.test.mjs`：默认核心测试全跑、browser smoke skip；opt-in 时 browser smoke fail-closed。
6. [x] 在旧 ps1 仍存在时，Windows 上运行 root 与两个 demo 旧验证器，记录 baseline。
7. [x] 运行两个新 demo validator 与 opt-in node-test，填写 `parity-matrix.md` 的实际结果和证据。
8. [x] parity 全绿后删除三个 ps1，更新两个 demo README、image2-asset-plan 与所有引用；结构测试收紧为 mjs-only。
9. [x] 更新 `.github/workflows/agentkit-desktop.yml`，在三平台 Node 20 job 显式设置 `IMAGE2_SKILL_BROWSER_TESTS=1`。
10. [x] 运行全部本地门禁并检查资产 diff；由父任务统一执行 docs-sync 与最终 just ci。

## Validation Commands

PowerShell：

```powershell
just node-test
$env:IMAGE2_SKILL_BROWSER_TESTS = "1"
just node-test
Remove-Item Env:IMAGE2_SKILL_BROWSER_TESTS
node skills/developer-tools-integrations/image-to-ui-skill/demo/artmuse-ios/validate.mjs
node skills/developer-tools-integrations/image-to-ui-skill/demo/marble-note/validate.mjs
git grep -l "validate.ps1" -- skills/developer-tools-integrations/image-to-ui-skill
git diff --exit-code -- skills/developer-tools-integrations/image-to-ui-skill/assets skills/developer-tools-integrations/image-to-ui-skill/demo/artmuse-ios/screenshots skills/developer-tools-integrations/image-to-ui-skill/demo/marble-note/screenshots
just python-check
just skills-check
git diff --check
```

`git grep` 的预期结果是退出码 1且无输出，表示零命中。

## Risk And Rollback Points

- CDP pipe framing 是最高风险点；先以 unit tests 锁定 chunk boundary、NUL framing、timeout 和 browser exit。
- 真实浏览器 parity 未全绿时禁止执行第 8 步删除。
- GitHub workflow 必须显式 opt-in；实际远程结果在父任务取得 push/PR 授权后核对，未运行时记录为 `missing evidence`，不能把跨平台实测声明标绿。
- 最终提交遵循 Trellis Phase 3.4：完成全部验证后一次展示 commit plan；可将 runner 引入与旧 validator 删除分成两个原子批次，但不在实施中提前提交。

## Final Review Gate

- parity-matrix 每一旧断言都有新载体与实际证据。
- default 与 opt-in 测试语义分别证明“不启动浏览器”和“两个 demo 真实执行”。
- workflow 三平台 Node 20 job 均配置为显式 browser opt-in；实际执行记录转交父任务作为远程集成门禁。
- 资产与 tracked screenshots 零 diff。
- 用户评审并批准本 planning 后才可 `task.py start`。
