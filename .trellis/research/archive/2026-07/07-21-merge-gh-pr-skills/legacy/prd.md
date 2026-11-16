# Merge gh-address-comments and gh-fix-ci into gh-pr

## Goal

将 `skills/git-github-collaboration/gh-address-comments` 与 `gh-fix-ci` 合并进 `gh-pr`,统一为一个覆盖 PR 全生命周期(创建/发布评审/合并/回复线程/处理评审意见/修复 CI)的技能,消除三者之间的近邻触发混淆。

## Feasibility Analysis(结论:可行)

**支持合并的理由:**

- 三者共享同一前置流程:`gh auth status` 检查、PR 解析、rtk 优先的探索输出。合并后去重。
- gh-pr 已是路由型结构(`references/create|review|merge|respond.md`),新增两个分支即自然扩展。
- 最大收益:消除 "respond to review comments"(gh-pr)与 "address review comments"(gh-address-comments)之间的触发歧义——这是当前描述里最模糊的近邻边界。

**风险与代价(必须在实现中处理):**

- **工具面扩大**:gh-pr 现为 `Read, Bash`,合并后需加 `Edit`。安全契约必须区分本地代码编辑与 GitHub 写操作两类授权边界。
- **许可证义务**:两个旧技能是上游改编技能,携带 Apache 2.0 `LICENSE.txt`(AGENTS.md 明确该不对称是有意为之)。迁移其脚本进 gh-pr 后,gh-pr 必须保留 Apache 2.0 许可证副本与来源/修改声明,不得随目录删除。
- **脚本合同失配(合并前已存在,本任务修复)**:`inspect_pr_checks.py` 在成功分析到失败检查时也返回 1,与"非零码=脚本故障走手动回退"的技能语义冲突;它无法区分 pending 与全绿。`fetch_comments.py` 用 headRepository 解析 GraphQL,fork PR 会指向错误仓库。旧回退命令 `gh pr view --json reviewThreads,comments` 在 gh 2.96.0 报 Unknown JSON field。
- **资源预算**:gh-pr 初始加载实测 998/1000 tokens,新增两条路由和编辑契约后默认门必然超。需压缩入口或按 spec 规定记 `missing evidence` + 显式兼容上限复跑。
- **边界变更需双评测**:trigger_eval 只证明整体激活边界(触发二分类),不能证明内部六分支路由;内部路由须由 evals.json 行为夹具(人工评审执行)覆盖。
- gh-pr 边界是 07-21 刚定稿的(07-21-gh-pr-lifecycle),本任务是对该边界的有意重划,需在提交信息中说明。

## Requirements

1. 新增 `references/address-comments.md` 与 `references/fix-ci.md`,分别承载两个旧技能的主流程(细节见 design.md);原 `references/BACKGROUND.md` 的手动回退内容并入 fix-ci.md,不单独保留原文件。
2. 迁移 `scripts/fetch_comments.py`、`scripts/inspect_pr_checks.py` 到 gh-pr 并**修复既有合同失配**:退出码语义(0=分析成功,非零=脚本故障)、pending/全绿/失败/仅外部提供者四态分流、fork PR 的 base repository 解析、references 中的回退命令改为 gh 2.96.0 可用字段。为修复点补 focused unittest(gh-pr/tests/)。不迁移 `.pyc`。
3. 重写 gh-pr `SKILL.md`:description(移除对两个旧技能的排除、新增两组触发意图)、`allowed-tools: Read, Edit, Bash`、路由表新增两行、三层安全契约、版本升至 2.0.0。
4. 许可证合规:Apache 2.0 许可证原文副本随迁移脚本保留于 gh-pr,以独立 NOTICE 记录来源说明与修改声明;更新 AGENTS.md 的 License/assets 段落反映新归属。
5. 合并 evals:三份 `evals.json` 并入 gh-pr;旧技能正例转为分支路由行为夹具;gh-pr 原两条排除负例改写为内部路由正例;检查 gh-bootstrap evals 的转介断言。
6. 触发评测:任务 `research/` 下建 trigger_cases.json + semantic_config.json,跑 trigger_eval 证明激活边界。
7. 资源预算:先尝试压缩 SKILL.md 入口至 ≤1000 tokens;不可行则按 skill-authoring-conventions.md 规定记 `missing evidence` 并以书面兼容上限复跑 `resource_boundary_check.py --max-initial-tokens`。
8. 移除旧技能目录(先 `mv` 到仓库外备份;`rm -rf` 被 pre-bash hook 拦截);同步更新套件 AGENTS.md 与 spec 指南中的例证。
9. 全仓引用清理范围限定为 live 路径:`skills/`、`platforms/`、`.trellis/spec/`、docs 生成源;`.trellis/tasks/`(含本任务与 archive)中的历史名称**不在清理范围**。

## Acceptance Criteria

- [x] `skills/git-github-collaboration/` 下不再有 gh-address-comments、gh-fix-ci 目录
- [x] gh-pr SKILL.md 路由覆盖 6 类意图,description 无对已删除技能的引用;`allowed-tools: Read, Edit, Bash`;version 2.0.0
- [x] gh-pr 内保留未改写的 Apache 2.0 许可证副本及独立来源/修改声明;AGENTS.md License 段落已更新
- [x] `grep -rE "gh-address-comments|gh-fix-ci" skills/ platforms/ .trellis/spec/` 无残留(docs/ 经 `just docs-sync` 后同样无残留)
- [x] trigger_eval 通过(激活边界):正例召回与近邻负例全部通过
- [x] 内部路由证据:gh-pr evals.json 含六模式行为夹具(每个新分支 ≥2 正例),经人工评审记录留存于任务 research/
- [x] 迁移脚本合同修复完成,新增 unittest 通过:`python -m unittest discover -s skills/git-github-collaboration/gh-pr/tests -p "test_*.py"`(该命令显式执行,不依赖 just ci)
- [x] `resource_boundary_check.py` 通过,或按 spec 记 missing evidence + 兼容上限复跑通过
- [x] `just skills-check`、`just python-check`、`just ci` 全部通过

## Notes

- `just ci` 不执行 Python 单测(只编译),单测命令必须显式跑。
- PostToolUse formatter 会重排 Markdown 表格,若需精确格式走 Bash 写文件。
