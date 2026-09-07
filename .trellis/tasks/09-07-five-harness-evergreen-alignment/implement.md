# Execution and approval plan

## Current turn: planning only

1. 读取结构/关键文件/适用规则，记录 HEAD 与完整工作树基线（已完成）。
2. 两条独立强模型审查：规则能力；测试/历史失败。主会话补充安全协议复现（已完成）。
3. 写 research/audit-report、test-baseline、harness-capabilities 和四项 PRD/design/implement。
4. 为父子项 implement/check JSONL 配置真实 spec/research，运行 task validate 与 aggregate precheck。
5. 强模型独立审查整个父子闭包，修正仅规划层的问题；保留一个合并审查报告。
6. 向用户给出结论、优先级、文件、检查、分工、未验证项和任务链接。等用户批准，不 start。

## After explicit approval

1. 重新核 HEAD/dirty 与目标文件；若源已变化影响根因或验收，先更新对应计划。
2. 仅 start 获批子项；C1 hook → C3门接入 → C2最终说明/生成 → C4知识回写。C2只读资料草稿可并行。前项定向检查通过即可交接但仍保持 in_progress，不以 completed/archive 作为下游启动条件。
3. 每个子项按独占文件调度 implement/check；主会话保持授权、依赖和证据判断。强模型做规划/审查，较便宜模型只执行冻结且可测试的修改。
4. 按子项跑定向检查；最终 docs-sync 后 just ci，记录 raw output/exit/skip。授权未覆盖远程运行时不发布或触发workflow。
5. 更新唯一验收 ledger，逐个映射批准项、文件、结果和知识落点。真实五客户端或新实现SHA hosted未跑时明确UNVERIFIED。
6. 集成 CI 通过后把结果回填所有子项最终检查。完整交付与知识回写后再按用户授权进入提交/归档；之前不提前标 completed。

## Mandatory planning commands

- 对父项及四子项各运行 `python .trellis/scripts/task.py validate <task-dir>`。
- `python skills/development-workflows/trellis-plan-review/scripts/plan_precheck.py .trellis/tasks/09-07-five-harness-evergreen-alignment --include-descendants`。
- `git diff --check`、`git status --porcelain=v1 --untracked-files=all`，确认只有本轮规划工件与审查报告。
