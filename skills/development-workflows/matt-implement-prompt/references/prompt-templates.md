# Prompt Templates

以下模板用于指导 `S3` 编译步骤组织段落结构。**重要：所有方括号或双花括号字段在交付前必须 100% 替换为真实侦察到的值，绝不允许保留未解析占位符直接通过校验。**

## 1. 中文模板（GitHub Issues + 集成分支并行 + 远程关单）

```text
请在当前仓库（<owner>/<repo>）基于当前干净的 `<base-branch>` 分支新建一条集成分支（例如 `<integration-branch>`），按照 Matt Pocock 的 `/implement-spec` task-graph 流程端到端实施父 Spec `#<spec-num>` 及其全部子票（`<ticket-list>`），在全部验收、评审与全量 CI 通过后关闭远程 GitHub Issue `<ticket-list>` 和 `#<spec-num>`。不要在当前回复里猜测需求细节，先按下面顺序读取仓库规则、技能指引和远程 Issue 真源后再开工。

一、任务真源与依赖波前（实施前必须用 gh 实读全文）
- 仓库：<owner>/<repo>
- 基线分支：<base-branch>（所有修改只落到新建集成分支上）
- 父 Spec：#<spec-num>（<spec-title>）
- 子 Ticket 波前拓扑：
  1. 第一波（blocked_by=0，立即启动）：...
  2. 第二波（blocked_by=...，前置合入后开独立 worktree 并行实施）：...
  3. 收口波（blocked_by=...，全部合入后执行终审收口）：...

二、必读上下文（按此顺序读取）
1. 仓库规范：<repo-rule-pointers>
2. 执行与质量技能：<skill-pointers>
3. 实时读取远程 Issue 全文与依赖状态：
   - `gh issue view <spec-num> --json number,title,body,labels,comments`
   - `gh issue view <child-num> --json number,title,body,labels,comments`
   - `gh api repos/<owner>/<repo>/issues/<spec-num>/sub_issues --jq '.[] | {number,state,title}'`

三、执行与验证纪律
1. 按 `/implement-spec` 规范使用独立 worktree 与新鲜上下文实施各可并行切片，按 `/tdd` 先写测试再改实现，完成验证后合回集成分支并清理临时 worktree。
2. 禁止写入任何含本机系统用户名的绝对路径或敏感凭据。
3. <environment-quirks-or-prerequisites>
4. 运行项目验证门禁：<verification-commands>
5. 每个切片及收口变更均通过本地 `git commit -F` 提交，严禁出现 `Co-authored-by`/`Made-with`/`Committed via`。所有子票合入集成分支后，对相对 `<base-branch>` 的完整 diff 跑一次 `/code-review`，修清所有问题再复跑全量验证。

四、远程 Issue 关闭授权与操作协议
- 本指令已明确授权：在对应子票验收全部满足、变更已进入集成分支且本地验证通过后，逐一关闭远程子票；全部子票关闭且整套终审通过后关闭父 Spec `#<spec-num>`。
- 关单必须严格遵守两步协议：
  1. 先用 `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` 核实 `blocked_by == 0`；
  2. 先使用 UTF-8 临时文件执行 `gh issue comment <n> --body-file <file>`，写明验收结果、提交 SHA 与验证命令实测输出；
  3. 再执行 `gh issue close <n>`（不得省略独立评论步骤）。
- 关闭 `#<spec-num>` 前，复核 `sub_issues` 全为 `closed`，评论汇总后再关闭。

五、禁止与结束交付
- 禁止：默认不要执行 `git push`、合并回 `<base-branch>` 或自动创建远端 PR，除非我在后续对话另有明确指示。
- 完成后汇报：集成分支名、提交历史、评审与测试/CI 实测结果，以及全部 Issue 的关闭链接与状态。
```

## 2. English Template (Local `.scratch` or GitHub Issues)

For English user requests, preserve the exact same 6 sections in natural English:
1. Goal & Base/Integration Branch Anchor
2. Source-of-Truth Pointers & Frontier Wavefront (`gh issue view` / `.scratch/<feature>/issues/`)
3. Required Reading Order
4. Execution, TDD, Environment Notes, Local `git commit -F`, Verification Gates, and `/code-review`
5. Explicit Authorization & Two-Step Issue Close Protocol (or local ticket status completion for `--tracker local`)
6. Prohibitions (`Do NOT run git push`, `Do NOT merge back to base branch`, `Do NOT open a PR unless separately authorized`) and Final Reporting Contract.
