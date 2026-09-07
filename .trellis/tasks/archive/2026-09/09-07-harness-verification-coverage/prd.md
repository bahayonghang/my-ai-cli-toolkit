# 建立测试覆盖与失败复盘验收闭环

## Goal

把已发现的协议缺口与已有标准库单测接入常规门，使本地/hosted 测试能发现真实行为回归，并如实区分可选测试和客户端证据。

## Confirmed facts

- `justfile:73` 的 python-check 仅 byte compile；`justfile:77` 起 node-test 只发现 .mjs，未包含 skill 的 Python unittest。
- 已有 gh-pr-release 三个 Python unittest 文件合计 22 项，手动运行通过，未在现有 just ci 直接执行。
- 当前 `just ci` 全通过，hook 协议失败仍可独立复现。当前 HEAD 的三 OS hosted run 33956940164 也通过。
- humanizer-paper Python 测试明确 optional local-only；本机缺 pytest，相关可选 runner exit 1 属依赖缺口，非断言失败。

## Requirements

- R1：常规总门运行已存在的 gh-pr-release 标准库单测和 hook 子项新增协议回归。
- R2：安装器以真实临时项目验证五套目标的选择、落点与文件链接行为，不能声称客户端加载已验证。
- R3：本地与 hosted 采用同一总门；历史失败按当前是否仍存在分类。
- R4：可选 pytest/browser/provider 结果保留明确状态，不安装新依赖或把缺证据改成通过。

## Acceptance Criteria

- [x] AC1（R1）：新增 `just python-test` 执行 gh-pr-release 与 hooks 两组 unittest；任一失败使总门非零，报告两个套件的实际计数。定向：gh-pr-release 22、hooks 16，recipe exit 0。
- [x] AC2（R2）：`just install-projects-test` 覆盖 Claude Code、Codex、Grok、Kimi Code、OMP 的实际目标布局与共享 .agents/skills；临时项目之外无写入；旧 29 项保持通过。定向：35 tests OK（29+6）。
- [ ] AC3（R3）：`just ci` 已接入 python-test（7 步）；hosted YAML 仍 `run: just ci`。父项在 C2 docs-sync 后跑全库 `just ci`。新 SHA hosted UNVERIFIED。
- [x] AC4（R4）：可选 pytest MISSING DEPENDENCY；浏览器/五客户端握手 UNVERIFIED；新 SHA hosted UNVERIFIED。未新增 pytest/浏览器依赖。

## Dependencies and scope

依赖 hook 子任务新增 tests 后接入总门；安装器测试可独立编写。公开 CI 清单由说明子任务在本项完成后同步。

不为当前已通过的历史 CRLF 修复再次改源码；不新增 pytest/浏览器/provider依赖；不修改 hosted 触发策略或远程执行；不改 installer 核心行为（本轮尚无相关失败证据）。
