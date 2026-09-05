# git-commit 无暂存准备与 hook 诊断

## 目标与事实
承接父任务 R1—R3。当前源码仍在无 staged 时直接停止，在 hook 非零时直接停止；交接主协调器的 §7 已存在，本任务保持其效果。详见父任务 research/current-evidence.md。

## 需求与验收
- G1 / R1：staged-only 且空 index、有工作区改动时，输出候选文件及 staged/unstaged/untracked 状态、可确定分组、消息草稿和准确阻点；index、产品文件和历史不变。分组不明确时只给可支持的部分及待决策项，不编造最终提交范围。完全干净时明确无可提交内容。
- G2 / R2：hook 非零保留原输出、诊断原因、给出精确修复；不绕过 hook。纯消息格式修复仅在现行规则及已有明确修复授权允许时执行；普通“提交”不自动取得修复消息权限。
- G3 / R2：需产品编辑时仅原请求已授权该修复才继续；否则展示具体修复和一次所需决策。formatter 已改文件须重新检查文件集合及授权，不能吸入无关文件。
- G4 / R3：明确 commit 授权无安全阻点时不重复询问；保留 staged-only/all-changes、秘密/异常大文件/二进制审查、模糊分组停在计划、本地 git 和禁止隐式 amend/rebase/tag/push/PR。
- G5 / R3：混合 commit→push→PR 请求仍按 §7 交接；commit 失败时停止依赖它的后续动作并报告已完成部分，不谎称整体完成。
- G6：每项正向与反向场景均有可复核行为期望；现有消息 composer 测试通过，必要文档/eval/interface 同步。

## 不在范围
新增暂存模式、自动 stage 点名文件、扩大 all-changes、仅凭 commit 授权自动改消息重试、修改 hook 或绕过检查、自动修产品、Trellis hook/流程变更。源码以外的全局安装写入另行授权。
