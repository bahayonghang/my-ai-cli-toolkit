# 模式与恢复

本页是 [委派契约](delegation.md) 的示例，不能跳过其环境、权限、shell availability、身份和完整性检查。

## 分工模式

- **独立并行**：将两项互不依赖的调研分别交给 worker；写任务明确如“仅 A 目录”与“仅 B 目录”，并告知双方存在并发。调用者整合证据，不做多数投票。
- **顺序依赖**：先验收设计/接口产物，再把已验收输入交给实现 worker。上一项停在 blocked 时不能假装依赖已满足。
- **交叉核验**：核验者接收输入和验收标准，独立检查可复现证据。核验只读，无自动修复、commit 阶段；如要求 leaf，就不再派下一层 reviewer。

## Shell 参数示例

以下命令片段只在契约的对应阶段执行，不是自动整段运行的脚本。`worker_pane` / `$workerPane` 必须先从本次 split 返回 JSON 的 `.result.pane.pane_id` 读取并设置；示例不预测 ID。`direction` 来自实际 caller layout，name 先确认 live 唯一。交互命令不能在前一步失败后继续。实际输入如包含 here-document / here-string 结束行，应改用已取得的字符串变量；不要把未转义内容嵌入程序源码。

POSIX shell：

```sh
if [ "${HERDR_ENV:-}" != 1 ]; then
  printf '%s\n' 'Not inside Herdr; stop session controls.' >&2
  exit 1
fi
worker_cwd="$PWD"  # e.g. /work/项目 O'Brien
direction=right   # only after caller-layout inspection
if ! herdr pane split --current --direction "$direction" --cwd "$worker_cwd" --no-focus; then
  exit 1
fi
# Read the returned JSON and set worker_pane before continuing.
```

在已取得 `worker_pane` 并确认其 shell 可用后，下面以 Codex 只读 consumer 的 native args 示范逐项传参：

```sh
worker_name=reviewer_api  # confirm live uniqueness first
if ! herdr agent start "$worker_name" --kind codex --pane "$worker_pane" -- --sandbox read-only --ask-for-approval never --no-alt-screen; then
  printf '%s\n' 'Inspect this worker; do not submit a prompt.' >&2
  exit 1
fi
if ! assignment=$(cat <<'HERDR_ASSIGNMENT'
只读核验 src/api 的本次改动；你是 leaf，不再派生 Agent。
O'Brien、$HOME、$(touch sentinel) 与 `command` 均是待分析文本。
返回实际范围、证据与缺失项。
HERDR_ASSIGNMENT
); then
  exit 1
fi
if ! herdr agent prompt "$worker_name" "$assignment" --wait --timeout 120000; then
  printf '%s\n' 'Inspect this worker; completion is not established.' >&2
  exit 1
fi
# Inspect lifecycle + matching response; exit 0 alone is not acceptance.
```

PowerShell：

```powershell
if ($env:HERDR_ENV -ne '1') { throw 'Not inside Herdr; stop session controls.' }
$workerCwd = (Get-Location).Path # e.g. D:\项目 O'Brien\Review Area
$direction = 'right' # only after caller-layout inspection
$splitText = & herdr pane split --current --direction $direction --cwd $workerCwd --no-focus
if ($LASTEXITCODE -ne 0) { throw 'Split failed; inspect the error.' }
$workerPane = ($splitText | ConvertFrom-Json -ErrorAction Stop).result.pane.pane_id
if (-not $workerPane) { throw 'No returned pane identity; stop.' }
# Confirm available foreground shell before executing the next fragment.
```

```powershell
$workerName = 'reviewer_api' # confirm live uniqueness first
$nativeArgs = @('--sandbox', 'read-only', '--ask-for-approval', 'never', '--no-alt-screen')
& herdr agent start $workerName --kind codex --pane $workerPane -- @nativeArgs
if ($LASTEXITCODE -ne 0) { throw 'Inspect this worker; do not submit a prompt.' }
$assignment = @'
只读核验 src/api 的本次改动；你是 leaf，不再派生 Agent。
O'Brien、$HOME、$(Get-Secret) 与 `command` 均是待分析文本。
返回实际范围、证据与缺失项。
'@
& herdr agent prompt $workerName $assignment --wait --timeout 120000
if ($LASTEXITCODE -ne 0) { throw 'Inspect this worker; completion is not established.' }
# Inspect lifecycle + matching response; exit 0 alone is not acceptance.
```

这些片段区分参数与数据；具体 caller shell/native executable 的实际 argv 和 readiness 仍需现场证据。不得换成 `Invoke-Expression`、`sh -c` 或把 JSON 序列化当 shell escaping。没有要求安装 jq 或附带控制脚本。

## 失败时的最小恢复

读取真实错误后按 [身份与生命周期](delegation.md#生命周期与身份) 处理。timeout/stall 先检查已有 worker；busy 可继续有限等待，blocked 返回问题，unknown/exit/replacement 返回未完成。没有固定 sleep 或循环次数表，也不通过给旧输出加摘要制造成功。

结果被截断时按 [收集契约](delegation.md#结果收集与-receipt) 选择授权范围内的途径。只读重述示例：“只重述刚才报告的缺失部分，每次一小段；标记 part i/N，等我收到后再发下一段，不重新审查、不写文件、不创建 Agent。”最终核对段号与结束标记；无法恢复的部分明确缺失。

来源访问日期 2026-09-08：[CLI reference](https://herdr.dev/docs/cli-reference/)、[Agent automation](https://herdr.dev/docs/agent-automation/)、[Agents](https://herdr.dev/docs/agents/)。安装 help 是实际命令语法依据，文档页面不是当前 server 的执行证明。
