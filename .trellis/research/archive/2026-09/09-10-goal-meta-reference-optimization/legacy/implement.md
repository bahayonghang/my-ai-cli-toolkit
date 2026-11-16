# Implementation plan

## Entry gate
- [x] 用户批准本轮 planning 结论；已复核 git diff/status 与 task 状态，并激活父任务及 lint 子任务。保留用户对 .trellis/.gitignore 和旧 reviews 的修改。
- [x] 已读取父级研究与两个子任务的 PRD/design/implement，递归预检通过；旧 session-fallback 不是实施授权。

## Sequence and owners
- [x] trellis-implement 完成 lint child；trellis-check 独立检查并修复正文空白计长遗漏，73/73 目标测试通过，四项 AC 已验收。
- [x] lint child 通过后再派发 contract child，避免共享文件并发写入；检查者核对保留契约与示例。
- [x] 父级已合并结果并确认每个 R/AC 的证据齐全；本轮未执行提交归档，后续仅在获准范围内收尾。

## Validation
- [x] 首先运行每个子任务列出的聚焦回归，失败只修本任务范围。
- [x] 公共内容改变时运行 just docs-sync；完整最终树运行 just ci 一次。
- [x] python -X utf8 .trellis/scripts/task.py validate <具体任务目录>，覆盖父与两个子任务。
- [x] python -X utf8 C:/Users/lyh/.agents/skills/trellis-plan-review/scripts/plan_precheck.py .trellis/tasks/09-10-goal-meta-reference-optimization --include-descendants
- [x] 检查 rtk git diff --check 与 rtk git status --porcelain -uall，明确全部变更路径。
- [x] 报告 passed/failed/skipped/missing evidence；不得把静态审阅、fixture 或 CI 当 provider 执行证据。

## Rollback and finish
只回退本任务所拥有的修改；两个子任务之间为可独立验收与回退点。父任务以子任务 AC、集成 CI 和证据边界同时成立为完成标准。仅在取得对应实施/检查证据后勾选步骤；提交归档另按授权处理。
