# Implement — gh-pr skill

前置：research/ 已有 5 份带来源调研；merge queue 字段已用本机 gh 2.96.0 + GitHub GraphQL schema 验证并补入 `05-gh-cli-commands.md`。规范内容一律从 research/ 取材，不凭记忆编造。Yao 模式为 Production，执行 `validate_skill.py`、`resource_boundary_check.py` 与技能专属 `trigger_eval.py`，不扩展 Governed 资产。

## 执行清单

1. [x] 通读 research/ 全部产出 + 套件 `AGENTS.md` + `.trellis/spec/guides/skill-authoring-conventions.md`（两套评测系统段落）+ git-commit（结构参考）+ gh-address-comments 及其 `fetch_comments.py`（近邻边界 + script 模式参考）
   - 验证：能说出四模式各自的 inspect/publish 分层与授权点
2. [x] 写 `gh-pr/SKILL.md`：description 先写（正面触发含 inline review 发布 + 七个近邻显式排除），共享前置（auth / PR 解析 / 角色状态判定 / 仓库约定探测 / 不可信输入 / 语言 / rtk / token 回退），分级授权的输出契约（低风险批量 / 高风险逐项，未推送分支与 PR 创建分别确认），模式路由，四模式主流程；引用两个 `reports/` profile
   - 验证：`just skills-check` 通过
3. [x] 触发门先行：写 `research/trigger_cases.json`（should_trigger ≥6 / should_not_trigger ≥8 / near_neighbor 覆盖 code-auditor、code-quality-review、gh-address-comments、gh-fix-ci、git-commit、gh-bootstrap、fuck-my-shit-mountain）+ 技能专属 `research/semantic_config.json`；运行 `python "$USERPROFILE/.claude/skills/yao-meta/scripts/trigger_eval.py" --cases ... --semantic-config ... --description-file skills/git-github-collaboration/gh-pr/SKILL.md`
   - 验证：正例召回与负例全部通过；近邻负例无一误触发。不过 → 改 description 重跑，不得进入步骤 4
4. [x] 写 `references/create.md` / `review.md` / `merge.md` / `respond.md`：每条规范可追溯 research/ 来源；review.md 含 summary/inline 分支、create-review REST payload、单行/多行坐标、stale-head 与无 patch 的 fail-closed 规则；merge.md 含检查分支表（无 checks / pending / 失败 / base 落后分列）与安全 flag 规则（`--match-head-commit` 必带；`--delete-branch` / `--auto` / `--admin` 仅显式授权）；create.md 含幂等前置与 `Closes`/`Refs` 条件规则
   - 验证：对照 PRD 验收标准 2 逐项勾
5. [x] 写 `scripts/pr_review.py`（prepare-review / submit-review / list-threads / reply / resolve）与 `tests/test_pr_review.py`：共享 repo/PR 解析；分页 files/patch 与 reviewThreads；LEFT/RIGHT 单行/多行 diff 坐标校验；prepared 文件 UTF-8/LF；submit 前 head SHA 再校验；REST review 原子发布；thread id → 顶层 REST comment id 映射；外部 POST 不自动重试
   - 验证：`python -m unittest discover -s skills/git-github-collaboration/gh-pr/tests -p "test_*.py"`、`just python-check` 通过；mock runner 证明 prepare 不 POST、head 漂移不 POST、有效 payload 仅 POST 一次；可对本仓库真实 PR 人工跑只读 `prepare-review` / `list-threads`，不得发布测试评论
6. [x] 写 `reports/output-risk-profile.md`、`reports/artifact-design-profile.md`、`evals/evals.json`（create / review summary / review inline / merge / respond 正例 + ≥7 路由负例，git-commit schema）与 `agents/interface.yaml`（无 icon 字段）
   - 验证：风险报告覆盖错误目标、stale head、无 patch/失效行、重复发布和授权外溢；artifact profile 约束 PR 描述、review summary、inline comment 的专用标题、短段落/列表、Conventional Comments 标签与低噪声引用；JSON 可解析；负例断言指向正确近邻；inspect/draft 夹具断言不得执行外部写操作；inline 夹具断言绑定 head 并在位置失效时停止
7. [x] 结构门：`validate_skill.py` 与 `resource_boundary_check.py` 跑 gh-pr 目录
   - 验证：通过，或超预算项附书面豁免理由（记入任务 journal/research）
8. [x] 更新套件 `AGENTS.md`（4→5 清单、allowed-tools 表、icon 政策段）
   - 验证：`git diff skills/git-github-collaboration/AGENTS.md` 仅含本任务相关行
9. [x] `just docs-sync`（先确认工作区无其他未提交 docs 手改）→ `just ci`
   - 验证：全绿
10. [ ] trellis-check 质量检查 → Phase 3 收尾（spec 更新评估：近邻枚举教训是否已被 skill-authoring-conventions.md 覆盖、无需重复；git-commit skill 提交）
    - `trellis-check` 已完成；补充了 reply 必须命中顶层 REST comment ID 的 endpoint 回归测试。
    - spec 更新评估：现有 skill-authoring / helper / 双评测规范已覆盖本次通用教训，无需重复更新。
    - 待用户确认提交方案后执行 `git-commit`，因此本项保持未完成。

## 审查门

- 步骤 3 是硬门：trigger_eval 不通过不得写 references（防止在错误边界上堆内容）。
- 步骤 5 的单元测试是硬门：不得用仅 byte-compile 代替 diff 坐标、head 固定、分页、ID 映射与外部写命令构造验证。
- 步骤 9 全绿前不得报告完成。
- 全程不修改 code-auditor / code-quality-review / 三个近邻 skill 的任何文件；若触发评测证明必须改近邻 description 才能消歧，停下来回规划层，向用户报告并申请扩大范围。

## 回滚点

- 任一步失败且不可修：删除 `skills/git-github-collaboration/gh-pr/`；`AGENTS.md` 先 `git diff` 确认只有本任务改动，再仅回退这些行；docs/ 用 `just docs-sync` 重新收敛。不做 blanket `git checkout -- docs/`。
