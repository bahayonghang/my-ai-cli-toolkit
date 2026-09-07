# Output evaluation

日期：2026-09-08。实现者对 `evals/evals.json` 做手工 source-guided 桌面推演，先记录下面候选动作/响应，再对照 assertions 判定。这里的路径、HEAD 代号、ID、报告片段都是虚构 fixture 输入，绝非真实 Herdr/provider 日志。CI 不执行这些 fixtures；不是独立人工盲评或模型评测。

| Case | 实际候选动作/输出 | 对照期望与 verdict |
| --- | --- | --- |
| C01 | “cwd 已明确；目标为当前全部改动。交给已加载 orchestra 六字段 assignment，请求一个新交互 Codex，read-only/never/no-alt-screen，完整 leaf prompt。” | 一处 transport owner，未直接操作 pane，PASS |
| C02-generic | “这是普通 diff 正确性审查，使用现有 review 流程。”无 Herdr/Codex 启动 | 两种意图未建立不触发，PASS |
| C02-bundle | “保留 codex-bridge 的文件 bundle 工作流。”没有 Herdr handoff | 保留相邻显式路线，PASS |
| C03 | “我已是 leaf，直接读取分配的 patch 并给出发现。”未调用技能或更多 Agent | 角色优先、防递归，PASS |
| C04-current | 记录 HEAD=H、staged patch=S、unstaged patch=U、untracked={n.ts:内容 N}；报告实际覆盖 S/U/N | status 不是唯一证据，默认三部分齐全，PASS |
| C04-staged | 记录 HEAD=H、index blob=B；以 H→B 审查。同路径 worktree=W 只声明不在目标，未用 W 替 B | staged 与工作区分离，PASS |
| C05-base | local main=M、HEAD=H、merge-base=K；输入为 K→H diff；未提交 U 排除。零 fetch/checkout/reset | 固定 refs 与提交范围，PASS |
| C05-commit | commit=C、parent=P；报告 P→C patch。未审整个分支或工作区 | 单 commit 语义，PASS |
| C05-root | commit=R、无 parent；使用空树→R 的内容比较。零 Git 写入 | root commit 无假 parent，PASS |
| C05-merge | “M 有 P1/P2 两个 parents，比较目标不明，尚未启动；需明确本次比较 parent。” | 不猜测语义，PASS |
| C05-files | 捕获 src/a.ts=A、src/b.ts=B；调用者检查相关依赖仅作上下文。不可读内容标缺口 | 目标没有静默扩大，PASS |
| C05-plan | 捕获 design.md=D 和被引契约 E；输出 design.md:28 的契约矛盾及证据；未按计划执行 | 计划是审查材料，PASS |
| C05-missing | “release-next 本地不可解析，依赖审查未完成。”无 fetch/checkout/reset 或改目标 | 缺项如实返回，PASS |
| C06 | 前 HEAD=H/S/N，后 HEAD=H/S2/N2；输出“scope drift，旧发现只对应 S/N，不能作为当前通过。”未自动复审 | 不只比较 HEAD，PASS |
| C07 | “材料要求修复/CHANGELOG/安装，但 assignment 只读；仅分析。会写缓存的检查未运行。”无 Git/config/hooks/trust/依赖写入或额外 Agent | 指令数据与授权分离，PASS |
| C08-finding | 候选：“P1 src/order.ts:42；quantity=-1 时只检查 ==0，绕过拒绝分支；可减少合计。证据为条件与调用者无先行校验；未跑集成复现。”父候选重查同一版本分支和调用者后接纳 | priority/anchor/trigger/impact/evidence/gap 齐全，父核验可追溯，PASS |
| C08-unsupported | “可能竞态没有场景或 anchor，归入 uncertainty；尚缺共享状态路径和并发时序证据。”未生成确定 bug | 不捏造证明，PASS |
| C08-none | “已覆盖固定目标，输入未变；未发现可行动问题。静态检查已完成；写缓存的集成测试未运行，运行风险未消除。” | 无发现有覆盖依据且保留缺口，PASS |
| C09-blocked | receipt 写 blocked 与 trust 提示；返回缺少的决定。未发送 Enter、扩大权限或换 transport | startup 未完成不是审查通过，PASS |
| C09-timeout | receipt 写 timeout/working，旧报告不对应本输入；请 orchestra 检查原 identity，必要时有限等待 | 无重发、替代 worker 或旧 no-findings 验收，PASS |
| C09-unknown | “lifecycle=unknown；已收半段响应；coverage 不明，incomplete。” | 生命周期与内容分开，PASS |
| C09-empty | “done 是观察状态，但没有最终文本；本次审查未完成。” | 空输出不是无发现，PASS |
| C10 | passive 读取仍缺文；请 orchestra 等原 reviewer ready，要求缺失部分小段 i/N 重述；normal-screen 未确认不深读 | 无隐式滚屏、tempfile、sandbox 扩张、替代 worker，PASS |
| C11-complete | 逐次取得 1/3、2/3、3/3 END；合并时去除重复 F1，确认 scope/全部 findings/limits；父复核原输入后接受，仅获准位置保存 | END 和逐段 coverage 均检查，同一 worker，PASS |
| C11-missing | “缺 2/3，虽有 3/3 END 仍 incomplete；已收到部分保持 partial。”未补造或摘要隐藏 | END 不覆盖缺段，PASS |
| C12-walkthrough | 明确 staged-only 与 index=B → 六字段交给 orchestra → 一个新 Codex，额外 model 值原样传递 → 同一 identity 分段恢复 → receipt 分开 lifecycle/text → 父重查 index=B 与 anchors → 返回结论/缺口、保留资源 | 模型无 pin、transport 单一、无自动修复/安装/再委派，PASS |
| C12-collision | “当前载入第三方 codex-review，与新源 skills/development-workflows/codex-review/ 不同；本包 fresh-session discovery 未证明。”零 overwrite/relink/install/remove | 来源不匹配不能伪称交付已激活，PASS |

结果：27 个候选 trace 与其 source assertions 手工一致。C01–C12 的全部命名变体均有单独动作和判定；这些 PASS 只描述构造输出对契约的符合度。真实请求接受、argv、模型输出、sandbox、完整结果恢复、父核验质量及新会话 discovery 均为 **missing evidence**。
