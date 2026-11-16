# 迁移 image-to-ui 跨平台验证流水线

## Goal

把根级与两个 demo 的 PowerShell-only validator 迁移为 Node 20 可运行、零 npm 依赖、可在 Windows/macOS/Linux 验证的流水线。保留旧断言的行为等价性，显式 opt-in 时禁止 skip/假绿，parity 证据完整后删除全部 `.ps1`。

## Confirmed Facts

- 仓库 Node skill 基线是 plain Node ≥20；GitHub Actions 在 ubuntu/windows/macos 上固定 Node 20。
- 原设计依赖 Node ≥22 全局 `WebSocket`，并把退出码 2/3 转为 skip，会在正式 Node 20 CI 中绕过核心验证。
- Chromium/Edge 支持 `--remote-debugging-pipe`，可通过子进程额外 stdio 管道传输 NUL 分隔 CDP JSON，避免 WebSocket 与调试端口依赖。
- 当前两个 demo validator 共用 server、Chrome 启动、截图、CDP 与清理基础设施，差异主要是静态断言与点击步骤。
- 旧 root validator 当前通过；旧 demo validator 是删除前 parity 基线。

## Requirements

- R1 新增 `scripts/validate_demo.mjs`，只使用 Node 20 内置模块和 Chromium `--remote-debugging-pipe`；不得依赖全局 `WebSocket`、npm 包、Python server 或固定端口。
- R2 runner 通过 Node 子进程 fd 3/4 处理 NUL 分隔 CDP 请求/响应，支持 target 创建/附着、Runtime.evaluate、就绪轮询、viewport emulation 与 screenshot capture；请求超时、浏览器退出和 CDP error 必须可诊断。
- R3 浏览器发现契约确定化：设置 `CHROME_PATH` 时它是权威覆盖，路径不存在或不可执行直接返回 2，不继续自动探测；未设置时才按 Windows/macOS/Linux 候选自动发现。
- R4 静态服务器使用 `node:http` 与 `listen(0)`；通过 URL decode + `path.resolve` + containment check 阻止普通及 percent-encoded traversal；覆盖 demo 所需 MIME。
- R5 新增两个薄入口 `demo/*/validate.mjs`，配置逐条承载旧 ps1 的静态断言、ready expression、点击序列、数量断言和 viewport。
- R6 新增 `tests/skill-structure.test.mjs` 和 `tests/demo-validation.test.mjs`。demo 测试中的纯逻辑/基础设施单测默认总是执行；真实浏览器子测试仅在 `IMAGE2_SKILL_BROWSER_TESTS=1` 时执行。
- R7 显式 opt-in 后禁止 skip：找不到浏览器、Node/Chromium 能力不足、任一 demo 未执行或退出非 0，测试必须失败。只有环境变量未设置时，真实浏览器子测试可标记 skip。
- R8 GitHub 三平台 CI 显式设置 `IMAGE2_SKILL_BROWSER_TESTS=1`，让 Node 20 + Chrome/Edge 行为验证在 ubuntu/windows/macos 上真实运行。若某 runner 缺浏览器，CI 必须暴露失败，不得伪装通过。
- R9 parity 矩阵逐条覆盖两个 demo ps1 与 root ps1 的有效断言；Windows 上先跑旧版基线，再跑新版。矩阵全绿前不得删除任何 ps1。
- R10 删除 ps1 后同步 demo README、image2-asset-plan、结构测试和引用；skill 目录 `validate.ps1` 字符串零命中。
- R11 默认本地 `just ci` 不启动浏览器；显式 opt-in 命令必须真实执行两个 demo。验证生成的 `validate-*.png` 继续保持 ignored，不修改已跟踪资产/截图。

## Acceptance Criteria

- [x] runner 与测试在 Node 20 下可加载和执行，不访问全局 `WebSocket`。
- [x] 浏览器发现纯函数覆盖 Windows/macOS/Linux 候选；无效 `CHROME_PATH` 确定返回 2且不 fallback。
- [x] 静态服务器测试覆盖 200、MIME、404、`..` 与 percent-encoded traversal。
- [x] CDP pipe framing、request id、session routing、timeout 与 error 至少有确定性测试。
- [x] 默认 `just node-test` 执行结构/核心测试但不启动浏览器；真实浏览器子测试显示为 skip。
- [x] `IMAGE2_SKILL_BROWSER_TESTS=1 just node-test` 执行两个 demo；缺浏览器或任一 demo 未执行时命令非零。
- [x] 两个 demo 直接运行退出 0，stdout 最后一行为单行 JSON，桌面/移动截图均生成且尺寸阈值通过。
- [x] GitHub workflow 已在 ubuntu/windows/macos Node 20 job 显式启用真实浏览器子测试；实际远程结果由父任务在获得 push/PR 授权后验收。
- [x] `parity-matrix.md` 覆盖旧 root/demo 断言并记录旧载体结果、新载体、实际结果和证据路径。
- [x] skill 内不存在 `.ps1`，且 `git grep -l "validate.ps1" -- <skill-dir>` 零命中。
- [x] 本 child 的 `just node-test`、显式 browser opt-in、`just python-check`、`just skills-check` 和 `git diff --check` 通过；父任务的 docs/just ci 不作为本 child 的循环依赖。
- [x] 已跟踪 `assets/` 与 `demo/*/screenshots/` 不出现在 staged/unstaged diff。

## Implementation Evidence

- Legacy baseline: root structure PASS; ArtMuse PASS (home/exhibitions/detail/0); Marble PASS (cover/home/search/create/schedule/settings/folder/meeting/0/3/9/6).
- New direct validators: both exit 0 with final JSON and desktop/mobile screenshots >10KB.
- Default `just node-test`: 167 total, 165 pass, 2 explicit browser skips.
- Opt-in `just node-test`: 167/167 pass, 0 skipped.
- Invalid explicit `CHROME_PATH`: exit 2 without auto-discovery.
- `just python-check`, `just skills-check`, `git diff --check`, asset diff, and ps1-zero checks passed.
- Remote GitHub three-OS execution: `missing evidence` until push/PR authorization; workflow is configured fail-closed.

## Dependencies

- 依赖 `07-11-image-to-ui-routing-contract` 完成最终 references 索引，之后结构测试才能锁定完整集合。
- 不依赖 wrapper 子任务的实现；父任务最终集成要求两者均已完成。
- 实际 GitHub 三平台结果需要后续 push/PR 外部操作授权；本 child 只负责 workflow 配置与本地 fail-closed 证据。

## Out Of Scope

- 不改 demo HTML/CSS/JS 行为或视觉。
- 不引入 Playwright、Puppeteer、ws 或其他 npm 依赖。
- 不改变已跟踪资产、展示 GIF 或参考截图。

## Open Questions

无。Node 20、零 npm 依赖、三平台真实 CI 与显式 opt-in fail-closed 已作为修正规则确定。
