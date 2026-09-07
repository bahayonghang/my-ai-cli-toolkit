# 测试基线与协议复现

观察日期：2026-09-07。仓库 HEAD：`3c45297777a94f085f0564fc752ffaf03e4d0516`，分支 `dev`。开始时 Git 工作树干净。现有旧 session-fallback 指向已不存在的旧任务，本轮用 `--no-start` 创建新规划树，不修改旧 runtime。

## 现有总门

由独立 `quality_release_auditor` 在 Windows 执行一次 `rtk proxy just ci`，退出码 0，耗时 64.756 秒。VitePress 依赖已存在，未安装依赖。

| 门 | 结果 |
| --- | --- |
| docs-check | catalog 41 skills / 89 generated files，docs unit 4 项通过，VitePress build 通过 |
| skills-check | 41 skills 通过 |
| python-check | 65 Python 文件编译通过 |
| install-projects-test | 29 项通过 |
| node-test | 423 tests，419 pass，0 fail，4 skip |
| git diff --check | 通过 |

原始日志：`C:\Users\lyh\AppData\Local\Temp\my-claude-code-settings-audit-20260907-185514\just-ci.raw.log`。
SHA256：`1067B5E16A76840B95BFD194F71C0AFD6168C8FFEAC3DF570EE0986BC97BCC9B`。
临时原始日志不是长期交付依赖，本文件记录可复核结论。4 个本地跳过项：两项真实浏览器 smoke、Windows 大小写路径语义、linux-only JSON。

## 额外现有测试与 hosted 核查

- `python -m unittest discover -s skills/git-github-collaboration/gh-pr-release/tests -p "test_*.py" -v`：22/22 PASS。这三个标准库测试文件没有进入当前 just ci。
- Goal 五平台 focused test：64/64 PASS（包含在已运行的 Node 总门，专门复核不是新增独立用例数量）。
- skill-session-review focused test：25 PASS / 1 Windows 语义 SKIP；其契约仅支持 Claude/Grok/Codex/OMP，没有 Kimi（这是声明的能力范围，不是断言失败）。
- 尝试用 pytest 运行现有五个 Python 测试文件：runner 在收集前 exit 1，`No module named pytest`。gh-pr-release 已改用标准库完成；剩余 paper-workbench 10 个函数、humanizer-paper 6 个函数未运行。后者明确 optional/local-only。不安装依赖，不推定这些断言失败。
- 当前实际 origin：`https://github.com/bahayonghang/my-ai-cli-toolkit.git`。本地目录和既有品牌仍名 my-claude-code-settings，本轮不重命名仓库。
- [hosted run 33956940164](https://github.com/bahayonghang/my-ai-cli-toolkit/actions/runs/33956940164)：headSha 与本轮 HEAD 完全相同，Windows、macOS、Ubuntu 三 job success；两项真实 browser smoke 三 OS 均执行通过。平台条件 skip 分别 Windows 8、macOS 30、Ubuntu 29。该工作流没有启动任何五方 provider。

工具版本由测试线观察：本地 Python 3.14；hosted 固定 Python 3.12、Node 20。runner 差异与缺 pytest 属环境证据。原始其他日志位于同一个临时证据目录。

## 额外协议复现：危险命令 hook

这不是现有测试断言失败，而是审查新增的安全协议探针。用 Python subprocess 仅启动 `platforms/claude/hooks/pre-bash.py`，命令字符串始终作为数据；没有执行该字符串，没有启动 Claude。

| 输入 | 实际结果 | 按官方 PreToolUse 协议应有结果 |
| --- | --- | --- |
| stdin JSON，`tool_input.command` 命中已有首条规则 | exit 0，stderr 空 | exit 2 阻断 |
| 同一命中字符串作为旧 argv | exit 1，stderr 输出 BLOCKED | exit 2 阻断 |
| stdin JSON，安全命令文本 `pwd` | exit 0 | exit 0 |

根因证据：`platforms/claude/hooks/pre-bash.py:19` 只读 argv；`platforms/claude/hooks/pre-bash.py:24` 用 exit 1；`platforms/claude/hooks/hooks.json:10` 依赖旧输入环境变量。官方协议：[Hooks reference](https://code.claude.com/docs/en/hooks#exit-code-2)，2026-09-07 已读取；PreToolUse 通过 stdin JSON 传入命令，exit 2 可阻断，单独 exit 1 不阻断。

## 额外协议复现：会话日志

在新临时目录，移除子进程环境中的 `CLAUDE_CODE_SSE_PORT`，依次向 logger stdin 发送两个不同 `session_id`（audit-session-a / audit-session-b）和合成 prompt。两个进程均 exit 0，结果只有一个 `session-default.log`，含两行。测试完成后清理自建临时目录，无真实 prompt 被读取或保存。

根因：`platforms/claude/hooks/log-prompt.py:15` 至第 24 行用 SSE port/default 定义日志名；main 只提取 prompt，未使用事件 session_id，与文件声明的会话隔离不符。这验证了日志混合，未声称发生数据丢失。

## 证据边界

Python 编译通过不验证 hook stdin、返回码、加载路径或会话隔离。上述探针验证脚本契约；当前 HEAD 三 OS hosted 另已核实通过，实际 Claude hook 接线/新会话与五套客户端发现执行仍为 UNVERIFIED。

工作树核查须用 `git status --porcelain=v1 --untracked-files=all`；本机 `status.showUntrackedFiles=no` 会隐藏新规划文件。本轮不改变该配置。
