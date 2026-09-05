# git-commit 独立检查

日期：2026-09-05。角色：trellis-check。范围：G1—G6；仅修订 git-commit 源码和本报告，没有暂存、提交、安装或更改任务状态。已读取完整 hook 保存输出、check.jsonl 引用与 PRD/design/implement。

## Findings (fixed)

1. `skills/git-github-collaboration/git-commit/SKILL.md` §1.1：旧 RTK 建议会以 `rtk git status` 替换精确状态命令，丢失完整 untracked 与禁用 optional locks 的约束。改用 `rtk proxy git --no-optional-locks status --short --untracked-files=all`，文件/hunk 边界必须读取未过滤 diff。
2. 同文件 §5.1：新增只读准备分支完成草稿后可能落入后续已有提交同意步骤。现在空 index staged-only 明确跳转 §6.4/§7，全干净同样跳过执行；draft 明确不 stage、不编辑文件。§1 的候选不等于授权集合保持。
3. 同文件 §0/§5.7：压缩 commit 输出建议与保留原始 hook 输出要求冲突。统一 direct git 或 raw proxy，先保留诊断与退出码再摘要；`references/agent-workflow.md` 同步调用形式。
4. `evals/evals.json` 用例 20 的旧期望无条件重暂存 formatter 编辑，与新 G3 的部分暂存/无关路径护栏冲突。限定只恢复可安全隔离的已授权格式变动；用例 27 同步 raw proxy，新增 45（RTK + 隐藏 untracked + 已授权 commit 仍仅准备）、46（all-changes 草稿保留部分暂存）。现为 46 个唯一用例。

## Findings (not fixed)

- 没有剩余已确认源码缺陷。没有 provider/model 执行 transcript：G1 的真实候选/草稿决策、G2/G3 的授权判断、G4 的审批行为、G5 的主协调器交接仍为 `missing evidence`，不能据本报告声称模型行为全部验收通过。该证据缺口不能通过固定命令探针或静态断言补造。
- 全量 docs-sync/just ci 由主协调器统一运行，本检查没有运行它们或宣称其通过。版本已变更，需要生成文档保持一致。

## G1—G6 检查结论

| 条件 | 静态审查与已有/重跑证据 |
| --- | --- |
| G1 | 空 index 完成安全候选与草稿；clean 明确无内容；候选不获暂存权；执行入口不回落。真实 Git 探针验证隐藏 untracked 仍列出，index 原始字节、文件、HEAD 不变。 |
| G2 | 保留 hook 输出/退出码；确切诊断与修复提案；消息修复仍要求明确格式错误及用户修复授权，普通 commit 不扩权。真实 hook 拒绝与带 hook 重试通过。 |
| G3 | 产品修改交 owning workflow 且必须已有对应授权；formatter 对照 staged/unstaged，不吸入旧 hunk、新路径、语义变化；HEAD 已前进不得假装失败重试。临时 repo 的部分暂存与外部 formatter 改动保留探针通过。 |
| G4 | staged-only/all-changes 触发、风险审核、模糊拆分停计划、local git、禁止隐式 amend/rebase/tag/push/PR 保持；明确 commit 不重复同意；draft 不 stage。 |
| G5 | §7 保持原混合请求交接；失败仅阻断依赖其成功的 push/PR，不丢失剩余动作，不谎报整体完成。未执行远端集成。 |
| G6 | 46 条行为期望覆盖正反向；JSON 解析与 ID 唯一通过；composer 21/21；真实 Git 探针 4/4。interface 与 description 未改且未发现漂移，因此无新增 trigger 变更。 |

## Verification

- Lint: PASS，`rtk proxy just lint`（skills metadata + Python byte compilation，65 文件）。
- TypeCheck: N/A，仓库无独立类型检查器且本次为 Markdown/JSON；所要求 Python 编译已通过。
- Tests: PASS，修复后 `rtk proxy node --test skills/git-github-collaboration/git-commit/tests/compose-commit-message.test.mjs .trellis/tasks/09-05-git-commit-preparation-hook/research/runtime-probe.mjs`，25/25、0 skipped。
- JSON: PASS，46 用例、46 唯一 ID。
- Scoped diff whitespace: PASS，`rtk proxy git diff --check -- skills/git-github-collaboration/git-commit`。
- Live Git probe ≠ 模型行为：探针直接执行事先固定的 Git 命令，验证机制及快照不变，不验证模型根据技能自主选择命令；provider eval、人工盲审、安装后新会话均未运行。

## Spec 建议（交主协调器）

将“承诺 index 字节不变的只读 Git status 必须禁用 optional locks 并完整枚举 untracked；摘要包装器不得替换精确命令；hook 诊断保留未过滤输出”提炼到现有 skill-authoring conventions 的 verification traps。没有新增验证器或授权模式。
