# 设计：Node 20 跨平台 image-to-ui 验证流水线

## Architecture

```text
tests/skill-structure.test.mjs       static package contract
tests/demo-validation.test.mjs       core unit tests + opt-in browser smoke
scripts/validate_demo.mjs            server, discovery, CDP pipe, runner CLI
demo/artmuse-ios/validate.mjs        demo configuration + thin entrypoint
demo/marble-note/validate.mjs        demo configuration + thin entrypoint
.github/workflows/agentkit-desktop.yml  three-OS explicit browser opt-in
```

所有 Node 文件必须在 plain Node 20 下运行。runner 将可测试核心函数导出，同时以 `import.meta.url` 判断是否作为 CLI 启动。

## D1: CDP Transport

使用 Chromium `--remote-debugging-pipe`，不使用 WebSocket 或调试端口：

- `spawn(browser, flags, { stdio: ["ignore", "ignore", "pipe", "pipe", "pipe"] })`；fd 3 写入命令，fd 4 读取响应。
- 每条 JSON 消息以 NUL byte 结尾；reader 按 NUL 增量拆帧，保留跨 chunk 尾部。
- transport 维护递增 request id 与 pending map；响应按 id resolve/reject，event 独立分发。
- 先执行 `Target.createTarget`，再 `Target.attachToTarget({ flatten: true })`；page-domain command 携带 `sessionId`。
- browser exit、pipe close、timeout 或 CDP `error` 必须 reject 全部 pending 请求并进入基础设施失败（退出码 4）。

这一路径只依赖 Node streams，满足仓库 Node 20 与零 npm 依赖约束，也避免手写 RFC6455 WebSocket。

## D2: Browser Discovery

`findBrowser({ platform, env, exists, which })` 设计为依赖可注入的纯函数：

1. `CHROME_PATH` 已设置：仅验证该路径；无效即 `{ ok: false, code: 2 }`，不自动 fallback。
2. 未设置：按平台候选发现 Chrome、Chromium、Edge。
3. Windows 使用 ProgramFiles / ProgramFiles(x86) / LocalAppData；macOS 使用 Applications bundle；Linux 使用 PATH `which`。

测试用 fake `exists/which` 覆盖全部平台与优先级，无需依赖执行机器安装状态。

## D3: Static Server Boundary

- `server.listen(0, "127.0.0.1")` 由内核分配端口。
- 对请求 pathname 执行 `decodeURIComponent`；非法编码返回 400。
- `path.resolve(root, "." + pathname)` 后用 `path.relative(root, target)` 检查 containment；绝对逃逸、`..` 前缀与 percent-encoded traversal 返回 403。
- 目录请求映射到 `index.html`；未知文件 404。
- MIME 覆盖 html/css/js/mjs/svg/png/jpg/jpeg/gif/webp/ico/json。
- server 在 `finally` 中 await close；不创建外部 server 进程。

## D4: Demo Configuration Contract

```js
export default {
  name: "artmuse-ios",
  staticFiles: ["index.html", "styles.css", "script.js"],
  htmlMustMatch: [{ pattern: /.../, message: "..." }],
  htmlMustNotMatch: [{ pattern: /.../, message: "..." }],
  desktopViewport: { width: 1728, height: 960 },
  mobileViewport: { width: 390, height: 860 },
  readyExpression: "...",
  steps: [{ name: "initial", expression: "...", expect: "home" }],
}
```

`expect` 支持原始值相等和 `{ op, value }` 数值比较。所有步骤顺序执行，但 runner 收集完整结果；基础设施错误立即中止。

## D5: Output And Exit Contract

- stdout 最后一行固定为单行 JSON：`{ ok, name, url, screenshots, steps, brokenImages }`。
- 人类日志写 stderr，避免破坏机器读取。
- 退出码：0 assertions pass；1 behavior assertion fail；2 browser unavailable/invalid explicit path；3 Node/Chromium capability unsupported；4 server/process/CDP infrastructure failure。
- 直接 CLI 保留 2/3 以便调用方区分；测试在显式 opt-in 下把任何非 0 视为 failure。

## D6: Test Layers

默认 `just node-test`：

- 结构契约、README links、reference index、interface fields。
- browser discovery 三平台矩阵。
- static server boundary 与 MIME。
- CDP NUL framing、pending request、session routing、timeout/error。
- demo config schema 与旧断言数量映射。
- 真实浏览器 subtest 标记 skip，且不 spawn browser。

`IMAGE2_SKILL_BROWSER_TESTS=1 just node-test`：

- 两个 demo 都必须实际 spawn、完成点击路径和截图。
- 退出 2/3/4、未产出 JSON、未执行两个 demo均 fail。

GitHub 三平台 job 显式设置该环境变量，以 Node 20 验证真实行为。workflow 配置属于本 child；实际远程运行需要用户另行授权 push/PR，并由父任务集成验收。

## Parity And Deletion Gate

`parity-matrix.md` 每行包含：旧文件/行号、旧断言、旧结果、新载体、新结果、证据。先在 Windows 执行三个旧 ps1，再执行新 runner。全部一致后才删除 ps1 并更新引用。

## Compatibility And Rollback

- Node 20 是硬兼容基线；不提升仓库 runtime。
- runner 引入与 ps1 删除可在最终 one-shot commit plan 中拆为两个原子 commit，但都在完整验证后提交。
- 若后续三平台 CI 暴露 Chromium pipe 差异，父任务保持未完成并回到 validator child 修复；必要时 revert 独立的 ps1 删除 batch，不得用 skip 规避。
- revert 删除批次可恢复旧 validator；已跟踪资产不参与任何批次。
