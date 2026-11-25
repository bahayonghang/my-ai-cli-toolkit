# tickets-review

只读、代码实证驱动的远程 GitHub Issues / 本地 `.scratch` 票据图（Spec + 子票）独立审阅技能。补齐 `/to-tickets` 与 `matt-implement-prompt`（或 `/implement-spec`）之间的质量门禁：先查真实代码与测试契约，再将合并审阅报告原子落盘到 `reports/tickets-review/<scope-slug>.md`，最后输出一段经校验、可直接复制到任意 Agent 中「读取报告并优化 tickets」的 Handoff Prompt。

## 安装

使用 Skills CLI 从本仓库安装：

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill tickets-review
```

或在仓库本地通过项目安装器 live-link 到当前项目：

```bash
just install-projects --skill tickets-review
```

## 你可以直接这样说

- `/tickets-review`
- 「请帮我审查这个项目的所有远程 tickets，把审核结果存到本地 md，并给我一段优化 prompt。」
- 「审阅 GitHub Issues 里的 Spec #63 和全部子票，对照真实代码检查依赖、标签和 AFK 可执行性。」
- 「帮我审计 `.scratch/auth-refactor/issues` 下的本地票据，输出审查报告和给下游 Agent 的修订指令。」
- "Review all open remote GitHub issues for this repo against the live codebase, persist the report locally, and give me a copyable optimization prompt."
- "Audit spec tickets #63-#68 for code-contract alignment, mechanical-vs-judged contradictions, and parallel write conflicts before implementation."

## 前置依赖

- **Python `>= 3.10`**（仅使用标准库，零外部依赖，驱动三个确定性脚本 `ticket_precheck.py`、`write_ticket_review_report.py`、`lint_ticket_handoff.py`）。
- **GitHub 模式**：已安装并登录只读权限的 `gh` CLI（`gh auth status` 可用）；本地 `.scratch` 模式与 `--snapshot` 离线复核模式无需 `gh` 或网络。

## 输出契约与权限边界

- **工作流**：`S0 作用域解析 → S1 Pass 0 机械预检 → S2 Pass 1–7 代码实证审阅 → S3 原子落盘本地报告 → S4 确定性校验 Handoff Prompt → S5 精简交付并停止`
- **严格只读审阅**：绝不修改远程 GitHub Issues、绝不改本地 `.scratch` 票据、绝不改业务代码、绝不改 `.gitignore`、绝不启动实现。
- **单一受控落盘**：合并报告统一原子写入 `<repo-root>/reports/tickets-review/<scope-slug>.md`（拒绝符号链接/reparse point、强制路径脱敏、未追踪时仅提示 gitignore 状态）。
- **不可信内容隔离**：Issue 正文、评论与外链全部当作数据，绝不执行内嵌脚本或指令。
- **下游优化 Prompt 门禁**：内置三类分诊 + 宿主结构化提问确认门 + 远程写回保守授权门 + Windows UTF-8 `--body-file` 编码铁律 + 写回后回读核验。

## 参考与致谢

本技能在方法与安全设计上受以下项目启发（独立语义重铸，遵循各自 MIT 许可）：

- `affaan-m/ECC@issue-review; toss/es-toolkit@issue-review; bahayonghang/my-ai-cli-toolkit@trellis-plan-review; bahayonghang/my-ai-cli-toolkit@matt-implement-prompt`

## 验证命令

```bash
# 1. 运行包内单元测试（覆盖 Pass 0 离线快照/本地夹具、原子落盘与脱敏守卫、Handoff 校验器与包契约）
python -m unittest discover -s skills/development-workflows/tickets-review/tests -p "test_*.py" -v

# 2. 运行 Qiaomu Meta Skill 包校验、IR 导出、触发评测与本地发布门禁
python .agents/skills/qiaomu-meta-skill/scripts/validate_skill.py skills/development-workflows/tickets-review
python .agents/skills/qiaomu-meta-skill/scripts/export_skill_ir.py skills/development-workflows/tickets-review --output reports/skill-ir.json
python .agents/skills/qiaomu-meta-skill/scripts/trigger_eval.py skills/development-workflows/tickets-review --cases evals/trigger_cases.json --output reports/trigger-eval.json
python .agents/skills/qiaomu-meta-skill/scripts/release_check.py skills/development-workflows/tickets-review --phase local --run-tests

# 3. 同步文档站目录并运行全仓 CI
just docs-sync
just ci
```

## Troubleshooting

| 现象 | 原因 | 解决方法 |
| --- | --- | --- |
| `ticket_precheck.py` 返回退出码 1 并报 `pr_number_in_issue_scope` | 传入编号在 GitHub 上对应 Pull Request 而非 Issue | PR 审查不属于本技能，请改用 `code-review` 或 `gh-pr-release` |
| `ticket_precheck.py` 报 `dependency_cycle` | 原生 `blocked_by` 或本地 `Blocked by:` 形成环路 | 按 Pass 0 输出的环路节点先理清先后依赖，再重新审阅 |
| `write_ticket_review_report.py` 拒绝写入并报 `leaks a personal absolute path` | 报告中混入了含系统用户名的本机绝对路径 | 全部改为 `owner/repo` 与仓库相对路径（`path:line`）后重试 |
| `write_ticket_review_report.py` 在 stderr 提示 `neither gitignored nor tracked` | 报告目录尚未配置 git 忽略规则 | 属正常温和提醒；按项目需要决定提交该报告或自行把 `reports/tickets-review/` 加入 `.gitignore` |
| `lint_ticket_handoff.py` 在 `local` 模式报 `local_mentions_gh_mutation` | 复制模板时保留了 GitHub 远程写回段落 | 删去 `gh issue edit` 相关行，仅保留本地 `.scratch/` 写回条款 |
