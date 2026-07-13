# 修复 image2 wrapper 正确性与 dry-run 契约

## Goal

修复 `skills/developer-tools-integrations/image-to-ui-skill/scripts/image2_asset.py` 的模板参数破坏、dry-run 误导与副作用，并为 wrapper 建立可在仓库 Node 20 / Python 环境中稳定运行的回归测试。同步修复 SKILL.md 中 wrapper 的运行时路径与 Windows 解释器 fallback 示例。

## Confirmed Facts

- 当前 `IMAGE2_COMMAND='mytool gen --prompt {prompt} --out {output}'` 会把含空格 prompt 拆成多个 argv，并吞掉注入路径中的 Windows 反斜杠。
- 当前模板识别只检查 `{prompt}`、`{output}`、`{size}`，但 values 还声明了 `{quality}` 与 `{output_format}`。
- 当前 `--dry-run` 在输出命令前执行 `args.output.parent.mkdir(...)`；已实测输出目录会被创建。
- 当前 dry-run 在 fallback 不可用时仍打印 fallback channel 与命令，不报告 CLI / credential 前置缺失。
- 当前 `_run()` 始终用 Windows `subprocess.list2cmdline()` 渲染命令，POSIX 输出不是可直接复跑的 shell 命令。
- skill 子树要求脚本示例使用 `<skill-dir>`，并保留 Windows 友好的 `python` / `py -3` fallback。

## Requirements

- R1 将 `IMAGE2_COMMAND` 定义为 POSIX shell-word 模板语法：先用 `shlex.split()` 拆模板，再逐 token 注入值；注入的 prompt、output 与其他值必须保持单个 argv，不再被二次解析。
- R2 模板检测覆盖全部已声明占位符：`{prompt}`、`{output}`、`{size}`、`{quality}`、`{output_format}`。未知占位符必须给出明确错误，不得静默传递。
- R3 dry-run 必须无文件系统副作用：不得创建输出目录、输出文件或 events 文件；仅真实执行前创建所需目录。
- R4 dry-run 走 fallback 时同时报告 CLI 与 credential 的就绪状态。缺失任一前置仍返回 0，但必须明确标注 `fallback not ready`，且不得把 channel 行写成已实际选用/成功。
- R5 dry-run 命令展示按宿主平台渲染：Windows 使用 `list2cmdline`，POSIX 使用 `shlex.join`；测试以 argv 语义为主，不依赖脆弱的整行空格匹配。
- R6 新增 `tests/image2-asset.test.mjs`，覆盖 native 默认命令、完整模板、fallback、退出码与 dry-run 无副作用。测试中的 Python 发现必须尝试 `python`，Windows 下再尝试 `py -3`。
- R7 SKILL.md 所有 wrapper 示例改用已解释的 `<skill-dir>` 绝对占位符，提供 Git Bash 可执行主形式，并给出 Windows PowerShell 的 `python` / `py -3` fallback 说明。
- R8 不修改生图通道优先级、fallback 凭据规则、模型默认值、资产文件或 demo 页面。

## Acceptance Criteria

- [x] 含空格 prompt 与 `out\\x.png` 注入模板后分别保持单一 argv，反斜杠不丢失。
- [x] 仅包含 `{quality}` 或 `{output_format}` 的模板也会正确展开；未知占位符以非零码和明确消息失败。
- [x] 带空格的已引号命令 token 能正确拆分；测试明确锁定模板语法。
- [x] fallback CLI 与两个 API key 均缺失时，dry-run 报告所有缺失前置且返回 0，不声称已成功使用 fallback。
- [x] dry-run 前后目标父目录均不存在；真实执行路径仍会按需创建目录。
- [x] `--prefer image2` 无入口返回 2；真实 fallback 前置不足返回 3。
- [x] SKILL.md 不再含裸 `python scripts\\image2_asset.py` 或 cwd-relative 等价形式，全部示例使用 `<skill-dir>`。
- [x] `just node-test`、`just python-check`、`just skills-check` 通过。

## Implementation Evidence

- `node --test skills/developer-tools-integrations/image-to-ui-skill/tests/image2-asset.test.mjs`: 8/8 passed.
- `just node-test`: 154/154 passed.
- `just python-check`: 35 Python files compiled.
- `just skills-check`: all skills passed.
- `git diff --check`: passed.
- Spec sync: `.trellis/spec/backend/skill-helper-command-contracts.md` records the reusable environment-backed argv template contract.

## Dependencies

- 本子任务不依赖其他子任务，可独立实施、验收和归档。
- 父任务最终集成时才运行 docs-sync；本子任务不直接修改生成文档。

## Out Of Scope

- 不新增 `{action}` / `{images}` 等新模板能力。
- 不新增图片生成通道或修改真实 API 调用。
- 不修改 description、interface、evals 或 demo validator。

## Open Questions

无。仓库 Node/Python 约定和既有 wrapper 行为足以确定实施契约。
