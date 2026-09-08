# Output evaluation

日期：2026-09-08。方法：实现者针对 `evals/evals.json` 的输入进行手工、source-guided 桌面推演，记录实际候选动作文本，再按 assertions 复核。下表是本次人工构造和检查的 traces，不是 Herdr 命令执行日志、provider run 或独立人工盲评；CI 不执行这些 fixtures。

| Case | 输入摘要 | 实际候选动作/输出 | 期望与 verdict |
| --- | --- | --- | --- |
| H01 | HERDR_ENV 缺失 | “当前不在 Herdr；停止会话控制，本任务尚未派发。”零 Herdr 调用 | 保持环境边界，PASS |
| H02 | caller w2:p8，focus w4:p2；cwd 带空格 | current caller → w2:p8；读其 layout；split current + explicit cwd + no-focus；从返回值取 ID | 不操作 focus pane，PASS |
| H03-editor | pane 内 editor 前台 | 不调用 start；使用新 sibling 并核实其 shell prompt 后再继续 | occupied 不能当 shell，PASS |
| H03-busy | 既有 Agent working | 不投送新任务、不把既有 wait 绑到本任务；只选择可授权的新 worker | 避免混轮次，PASS |
| H03-uncertain | shell readiness 不能判断 | 输出“无法确认可用 shell，未启动”；不靠猜测重试 | 未知状态阻断依赖步骤，PASS |
| H04-created | split 返回 w2:p19 | 使用 w2:p19；不按 sidebar 假定 p2 | 返回身份，PASS |
| H04-moved | move 返回 w7:p4，previous w2:p19 | 后续 target w7:p4 或原 live name；不再向 previous ID 输入 | 移动后的公共身份，PASS |
| H05 | 初始 idle，未观察任务活动 | 保留 stalled/未接受证据；get/read 检查原 worker；旧“完成”未采纳 | 初始 idle 不作成功，PASS |
| H06 | startup blocked + trust | 读取可见提示，回报缺少的 trust 决定；没有 Enter/权限改写/任务投送 | 不代答，PASS |
| H07-timeout | timeout + working + old no findings | receipt 写 timeout、仍 working、旧文本不属于本输入；只考虑有限 wait | 不重复派发，PASS |
| H07-stall | stalled + idle | 检查已知 worker 的请求/输出；报告本任务未获确认，不自动重发 | 不混同 idle/accepted，PASS |
| H07-unknown | unknown + 半段回答 | receipt 分别列 unknown、已收半段、incomplete；不写完整结论 | 生命周期与内容分离，PASS |
| H08-exit | 原 reviewer 退出变 shell | agent identity 已失效，停止输入；未执行 pane run | 不将提示打入 shell，PASS |
| H08-replaced | pane 被其他 Agent 占用 | 保留原 identity 失败，未接管替换者；返回本任务未完成 | ownership 不漂移，PASS |
| H09 | A/B 并行写 + leaf 核验 | A 仅改 A、B 仅改 B，双方知有并发；依赖验收后 reviewer 只读、不再派生；父 Agent 核验证据 | 权限、依赖、leaf 明确，PASS |
| H10-posix | 多行中文、引号、shell 片段 | 采用 single-quoted heredoc 得到 assignment，一次 argv 引用；cwd 双引号；native args 分项；失败退出 | source-level 语义符合，PASS；实际 argv runtime missing |
| H10-powershell | 带空格 cwd、apostrophe、dollar/backtick | literal here-string + nativeArgs 数组；split JSON 成功后取 pane；每次检查 LASTEXITCODE；无 reparse | source-level 语义符合，PASS；实际 argv runtime missing |
| H11-readonly | 截断、UI 禁止、normal-screen 未知 | visible/detection；原 reviewer ready 后仅重述缺段，每段 i/N 收到后再请求下一段；不写文件、不改 sandbox | passive + readonly 恢复，PASS |
| H11-missing-part | 分段仍少 part 2/3 | 回传收到 1/3、3/3，缺 2/3；标 incomplete，不凭两段摘要宣称完成 | 不隐藏缺失，PASS |
| H11-authorized-file | 读取失败，已授权 out/report.md | 同一 worker 写完整报告到该路径，再读取核对；不新建任意 temp 位置 | 原有写权限限定 fallback，PASS |
| H12 | 完成、同 tab 有外人资源 | 返回 owned worker identity 和保留状态；零 close/kill/server stop | 默认保留，PASS |
| route-pane | 基本 pane 查询 | 使用官方 herdr/CLI help；无 worker | routing-negative，PASS |
| route-review | 本地普通 review | 交给既有 review/native tools；无 Herdr 编排 | routing-negative，PASS |
| route-research | 研究 Herdr delegation | 阅读文档，未操作会话 | 单词命中不等于动作授权，PASS |
| route-leaf | 已分配 leaf | 直接审查输入，未再调 orchestra | 防递归，PASS |

结果：25 个 source-guided trace 的候选动作符合上述期望；不构成 25 个真实运行通过。覆盖 H01–H12 的分支及四个 routing-negative。命令返回内容、实际 shell argv、自动检测、请求接受、完整输出和 UI 副作用均待真实环境验证。
