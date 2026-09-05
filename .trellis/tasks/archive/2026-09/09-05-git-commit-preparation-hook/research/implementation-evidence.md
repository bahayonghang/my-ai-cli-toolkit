# git-commit 实施证据

日期：2026-09-05。实施范围：`skills/git-github-collaboration/git-commit/`；全局安装、提交、归档及任务状态由本轮实施排除或交主协调器。

## 变更

- `SKILL.md` 1.12.0 → 1.13.0：空 index 时完成安全只读候选/草稿准备；准确区分暂存权限、提交同意与未知分组；hook 失败先保留输出、诊断、准备精确修复，再按原授权继续；formatter 恢复仅限已授权内容，保护部分暂存和外部路径，检查 HEAD 是否已经前进。
- `evals/evals.json`：更新用例 5、30；新增 33—44，共 44 条。保留 1—4、6—29、31—32 的已有行为契约。
- composer、四个 reference 和 interface 无契约漂移，不改。description 未变，trigger eval 不适用；版本元数据变化须由主协调器运行 docs-sync。

## 实际运行

命令（仓库根目录）：

```powershell
rtk proxy node --test skills/git-github-collaboration/git-commit/tests/compose-commit-message.test.mjs .trellis/tasks/09-05-git-commit-preparation-hook/research/runtime-probe.mjs
rtk proxy node --test .trellis/tasks/09-05-git-commit-preparation-hook/research/runtime-probe.mjs
rtk git diff --check
```

首次合并运行：composer **21/21 PASS**；runtime probe 2/4，两个失败源于探针误把“hook 拒绝时 index 字节必须不变”当成要求。`git commit` 本身可刷新 index 元数据，即使 hook 拒绝且 HEAD 未变。修正探针为检查 stage entries 和 HEAD；只读准备仍要求 index 原始字节不变。后续独立重跑 runtime probe **4/4 PASS，0 skipped**。没有修改 composer 或技能权限规则来迁就测试。

通过的临时仓库命令探针：

1. `status.showUntrackedFiles=no` 下空 index + tracked 修改 + untracked：显式枚举两种状态，读取 diff/安全文本，index SHA-256、工作文件和 HEAD 均不变。
2. 全干净：无候选，index SHA-256 和 HEAD 不变。
3. 实际 commit-msg hook 拒绝非 docs 消息并输出诊断，exit 1；HEAD、staged entries、工作文件不变。预先授予消息修复的测试分支用原 hook 重试，hook 调用计数为 2，提交成功且内容正确。没有 `--no-verify` 或 hook 覆盖。
4. 实际 pre-commit formatter 修改部分暂存文件及外部文件并产生新文件，exit 1：状态为 `MM README.md`、两个 `??` 路径；HEAD 和 staged entries 不变，原 unstaged 实验和 formatter 文件全部保留，没有恢复性重暂存。

`runtime-probe.mjs` 保留为可重复执行的任务研究附件，仅使用临时仓库；每个测试核对临时目录的绝对父目录和专属前缀后清理。它是固定命令流程验证，**不是模型依据技能自主决策的行为运行**。

JSON 解析与唯一 ID 检查：44 条，44 个唯一 ID，PASS。`git diff --check`：PASS。

本仓库实施前后 index SHA-256 均为 `5AF37394AA9FC33307D92713F7F52BB1AAEB7948A6A70677F9B337142A1B76E8`，HEAD 均为 `b2a9d21d73d796ff91310b9d4228dd2667b44b97`。起始 status 是三个当前规划任务的 untracked 文件；本代理未 stage 或创建用户仓库提交。并行任务改动不属于本代理回滚范围。

## G1—G6 证据映射

| 条件 | 已有证据 | 缺口 |
| --- | --- | --- |
| G1 | §1/§6 准备契约；eval 5、33—35、37；runtime 1/2 验证只读命令无 index/HEAD/文件变化 | 模型输出候选分组、准确阻点和消息草稿的运行 transcript：missing evidence |
| G2 | §6 保留失败、诊断、精确修复及原消息授权条件；eval 38/39；runtime 3 验证拒绝和 hook-enabled 重试 | 模型在有/无修复授权条件下决策：missing evidence |
| G3 | §6 产品修复授权及 formatter 内容边界；eval 40—44；runtime 4 验证部分暂存与新路径可见且未被吸入 | 模型产品修复交接、范围判断和安全 formatter 恢复：missing evidence |
| G4 | §0/§2/§5 原边界保留；eval 7—9、13、22/23、27、34、36/37；composer 21 项通过 | 模型安全审批及不重复确认的行为运行：missing evidence |
| G5 | §7 原交接保持；eval 29—32，30 补诊断期望 | 模型与后续 push/PR 工作流的集成运行：missing evidence；本轮未执行远端动作 |
| G6 | 44 条可复核正反行为期望、JSON 解析、composer 21/21、runtime 4/4；interface/reference 审阅未发现漂移 | evals.json 不由 CI 自动执行；全量 docs-sync/just ci 待主协调器统一运行 |

## 独立检查后的更新

以上保留初次实施的 44 条基线。check_commit 随后修正摘要包装器可能隐藏状态/hook 输出的路径，增加 §5 空 index/全干净分流，同步 references/agent-workflow.md，修正旧 formatter eval 并补 eval 45/46。最终共 46 条。检查后 composer 21 + runtime 4 共 25/25、just lint 通过，详见 check-report.md。主线程另执行九场景隔离模型仿真，见父任务 research/behavior-smoke.md；该证据不替代真实工具行为验收。

## 方法与结论边界

按父任务研究中的 qiaomu 局部维护取舍，保留既有 git-commit 边界，调整提前终止与诊断，不增加权限规则引擎或新暂存模式。候选准备与写入授权分开是设计优势；临时仓库的只读与 hook 机制有实测支持。未运行 provider eval、人工盲审、新会话安装发现或遥测，不能声称模型行为验收全部通过或已安装生效。
