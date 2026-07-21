# Implement — merge gh-address-comments + gh-fix-ci into gh-pr

前置:design.md 定稿(含 Codex 审阅修订:许可证保留、脚本合同修复、双评测证据拆分、预算上限策略、精确回滚清单);Yao 模式 Production。全程不动 code-auditor / code-quality-review / git-commit 等非波及技能。

## 执行清单

1. [x] 通读三个技能全部现有文件 + 套件 `AGENTS.md` + `.trellis/spec/guides/skill-authoring-conventions.md`(双评测与预算段落);确认两个待迁脚本的 `<skill-dir>` 自定位方式;用本机 gh 2.96.0 实测验证 fix-ci 手动回退命令的可用字段(`reviewThreads` 已知无效,找替代)
   - 验证:能列出旧技能每条规则的保留/删除/改写去向 + 已验证的回退命令清单
2. [x] 触发门先行:重写 gh-pr description(新增两组正面触发、删除两条排除);写 `research/trigger_cases.json`(should_trigger ≥10 合并三技能正例 / should_not_trigger ≥8 / near_neighbor 覆盖 code-auditor、code-quality-review、git-commit、gh-bootstrap、fuck-my-shit-mountain)+ `research/semantic_config.json`;跑 `python "$USERPROFILE/.claude/skills/yao-meta/scripts/trigger_eval.py" --cases ... --semantic-config ... --description-file skills/git-github-collaboration/gh-pr/SKILL.md`
   - 验证:正例召回与近邻负例全部通过。不过 → 只改 description 重跑,不得进入步骤 3。此门只证明激活边界,不证明内部路由(内部路由证据在步骤 6)
3. [x] 重写 gh-pr `SKILL.md` 正文:路由表加 address-comments / fix-ci;三层安全契约(inspect / 本地编辑批量授权 / GitHub 写逐项授权,含"修后 resolve/push 不隐式执行"边界);`allowed-tools: Read, Edit, Bash`;同步压缩既有措辞,目标初始加载 ≤1000 tokens;version 暂不动
   - 验证:`just skills-check` 通过
4. [x] 写 `references/address-comments.md`(fetch_comments 摘要 → 不可信上下文 → 编号分组呈现 → 选择性修复 → >3 文件确认 → 结果报告)与 `references/fix-ci.md`(inspect_pr_checks → `status` 字段四分支分流 → 50 行日志上限 → 修复-本地复跑 max 2 retries → gh pr checks 复核;并入原 BACKGROUND.md 手动回退,回退命令用步骤 1 实测结果);修订 respond.md / merge.md 中对旧技能的转介为内部路由
   - 验证:逐条对照旧 SKILL.md 步骤 4–8 无语义丢失;回退命令均经本机实测
5. [x] 迁移并修复脚本:`git mv` 两个 .py 到 `gh-pr/scripts/`(不带 .pyc);修复 inspect_pr_checks.py 退出码语义(0=分析成功)与 `status: all_green|pending|failures|external_only` 四态输出;修复 fetch_comments.py 改用 base repository 解析;两文件头加 Apache 2.0 来源+修改声明;`git mv` 一份 LICENSE.txt 为 `gh-pr/LICENSE-upstream.txt` 并保持正文原样,新增 `NOTICE-upstream.md` 记录来源与修改;写 `tests/test_fetch_comments.py`、`tests/test_inspect_pr_checks.py`(mock gh,覆盖退出码、四态分流、fork base 解析)
   - 验证:`python -m unittest discover -s skills/git-github-collaboration/gh-pr/tests -p "test_*.py"` 与 `just python-check` 通过(注意 just ci 不跑单测,此命令必须显式执行)
6. [x] 合并 evals + 内部路由证据:三份 evals.json 并入 gh-pr(每个新分支 ≥2 正例断言路由与授权层;复合流程 ≥1 例;gh-pr 原两条排除负例改写为内部路由正例);更新 gh-bootstrap/evals/evals.json 转介断言;人工评审逐条核对夹具并把评审记录写入 `research/evals-review.md`;更新 `agents/interface.yaml` 与 reports/ 两份 profile(覆盖本地编辑风险)
   - 验证:所有 JSON 可解析;无夹具指向已删除技能;research/evals-review.md 留痕
7. [x] 删除旧目录:`mv` gh-address-comments、gh-fix-ci 到仓库外备份;更新套件 `AGENTS.md`(5→3 清单、allowed-tools 表、License/assets 与 icon 政策段落改写为 gh-pr 混合归属);更新 skill-authoring-conventions.md 中指向旧技能的例证
   - 验证:`grep -rE "gh-address-comments|gh-fix-ci" skills/ platforms/ .trellis/spec/` 无残留(.trellis/tasks/ 不在检查范围)
8. [x] 结构门:`validate_skill.py` 跑 gh-pr;`resource_boundary_check.py` 先跑默认门——若失败,如实记 `missing evidence` 于 `research/resource-budget.md`,再以 `--max-initial-tokens 1300` 复跑证明资源连通;version 落 2.0.0
   - 验证:默认门通过,或 missing evidence 记录 + 1300 上限复跑通过;豁免不得表述为"通过默认门"
9. [x] `git status -uall` 确认无未提交 docs 手改 → `just docs-sync` → `just ci`
   - 验证:全绿;docs 下旧技能页面消失、gh-pr 页面含新分支;docs 内无旧技能名残留
10. [x] trellis-check 质量检查 → Phase 3(spec 更新评估:上游许可证随脚本迁移的规则、trigger_eval 不证内部路由的教训是否值得进 spec;git-commit 提交,提交信息说明这是对 07-21 边界的有意重划)

## 审查门

- 步骤 2 是硬门:trigger_eval 不过不得写 references。
- 步骤 5 的单测是硬门:退出码语义、四态分流、fork base 解析必须有 unittest 证据,不得以 `--help` 可运行或 byte-compile 代替。
- 步骤 7 前必须完成步骤 4–6:任何中间状态不得出现"排除已删但旧技能仍在"(双触发)或"脚本已迁但许可证未随"(合规缺口)。
- 步骤 9 全绿前不得报告完成。

## 回滚点(精确清单,禁止宽范围 checkout)

本任务 git 触碰清单:`skills/git-github-collaboration/gh-pr/`、`skills/git-github-collaboration/AGENTS.md`、`skills/git-github-collaboration/gh-bootstrap/evals/evals.json`、`.trellis/spec/guides/skill-authoring-conventions.md`。

- 步骤 2–6 失败:根据实施前保存的逐文件基线补丁,用反向补丁或 `apply_patch` 仅恢复本任务改动;旧技能未动,无损。
- 步骤 7 后失败:备份目录 `mv` 回原位 + 按清单用反向补丁或 `apply_patch` 逐文件恢复;每次回滚前 `git status -uall` 识别并绕开非本任务改动。
- docs/ 一律 `just docs-sync` 收敛,不 checkout。
