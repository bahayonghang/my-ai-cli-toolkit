# 执行计划（父任务）

父任务本身只负责第 0 步和最后的整合，实质改动都在子任务里完成。

## 0. 开工前

- [x] 用户确认新名字：`design-atlas`（2026-10-28）。
- [ ] Prior-art 补证（可选，网络可用时执行）。命令里的 `<meta>` 指 `.claude/skills/qiaomu-meta-skill`：
  - `python "<meta>/scripts/research_prior_art.py" "anti ai slop ui design skill" "design system theme catalog skill" "DESIGN.md generator" --strict --summary --output .trellis/tasks/10-28-design-atlas-upgrade/research/prior-art-candidates.json`
  - 把结论（keep / adapt / reject / invent）追加到 `research/hallmark-analysis.md` §7。不可用时记 `missing evidence`。
- [ ] `git switch -c feat/design-atlas`（从 `dev` 切出）。

## 1. 子任务顺序

1. `10-28-design-atlas-rename`：start → implement → check → commit → archive。
2. `10-28-design-atlas-themes`：同上。
3. `10-28-design-atlas-routing`：同上。
4. `10-28-design-atlas-anti-slop`：同上。也可在 1 完成后与 2/3 并行，但 `SKILL.md`、`README.md`、`evals/evals.json` 的改动留到整合时统一合并。

每个子任务完成后都运行 `just ci`，保持主干随时可回滚。

## 2. 整合（父任务）

- [ ] 按 `design.md` §7 重写 `SKILL.md` 的 Compact Workflow，合并子任务 2–4 的片段；行数 ≤ 180。
- [ ] 按 `design.md` §8 重写 description，用 `python scripts/check.py skills` 验证长度和格式。
- [ ] 更新 `agents/interface.yaml` 的 `short_description` 和 `default_prompt`，覆盖自动路由与 anti-slop。
- [ ] README：条目数、四个分支示例（含中文）、hallmark 归属、原名迁移说明、`slop_check.mjs` 的 Node 要求。
- [ ] `evals/evals.json`：合并子任务新增的用例，确认至少包含 prd.md 验收项列出的 5 类，且近邻反例 ≥ 2。
- [ ] 端到端演练：在 scratchpad 中建 fixture 项目（含中文 README 与 package.json），按 SKILL.md 走一遍“自动路由 → apply → 写一个页面 → slop_check”。记录命令与输出到 `research/e2e-run.md`。
- [ ] Skill IR：`python ".claude/skills/qiaomu-meta-skill/scripts/export_skill_ir.py" skills/development-workflows/design-atlas --output skills/development-workflows/design-atlas/reports/skill-ir.json`。若 exporter 不兼容本仓库布局，记 `missing evidence` 并说明原因，不手写伪造。
- [ ] `just docs-sync`，再运行 `just ci`。
- [ ] `trellis-check`（父任务全量）。
- [ ] 更新 spec：`.trellis/spec/guides/skill-authoring-conventions.md` 中 “design-md first-party catalog entries” 一节改名，并补充 overlays/、theme 构建、slop_check 测试约定（trellis-update-spec）。

## 3. 验证命令

```bash
just skills-check
just python-test
just node-test
just docs-check
just ci
```

## 4. 回滚点

- 每个子任务一个提交（Conventional Commits，scope 为 `skills`）。
- 整合提交与子任务提交分开。整合有问题时只 revert 整合提交。
