# 交付 repo-test-audit 技能包

## Goal

新增 `skills/development-workflows/repo-test-audit/`。它只读盘点一个仓库的测试位置、runner 是否收集、行为是否被断言核验。

## Background

父任务：`.trellis/tasks/10-06-repo-test-skill/prd.md` 与 `design.md`。本子任务不修改 `justfile`，不给其他 skill 补测试。

研究：父任务 `research/local-repo-test-layouts.md`、`research/prior-art-test-skills.md`。

## Requirements

1. 目录和报告契约以父任务 `design.md` 的 Skill Package 与 Report Contract 为准。
2. `scripts/inventory_tests.py` 只读，stdout 为 JSON，字段含 `location`、`collected_by`、`behavior`。
3. 测试使用夹具仓库，不把当前 34 个 skill 的名单写死。
4. Production 文件：`SKILL.md`、`README.md`、`agents/interface.yaml`、`evals/evals.json`、`evals/trigger_cases.json`、`reports/` 里的 Skill IR、先验摘要、creation handoff、触发评估。触发评估跑不通时 handoff 写 missing evidence。
5. `description` 含中英文触发词，并排除 diff 审查、可维护性审查、重构、失败栈解释。
6. 不写乔木版权，不发布。

## Acceptance Criteria

- [ ] `just skills-check` 通过。
- [ ] 夹具测试证明：测试文件存在且 `python-test` recipe 未列出该目录时，`collected_by` 为空，`behavior` 为 Missing。
- [ ] 夹具测试证明：`tests/*.test.mjs` 在含 `node-test` recipe 的 justfile 下被标为已收集。
- [ ] `just docs-check` 通过，catalog 含 `repo-test-audit`。
- [ ] `development-workflows/AGENTS.md` 的技能名单包含 `repo-test-audit`。约定句子的改写留给 backfill，避免两个子任务改同一段禁令。

## Out of Scope

- `just ci` 步骤数、`evals-check`、其他 skill 的新测试、pytest 文件改写。

## Decisions

- 本子任务先于 backfill 实施。backfill 依赖 JSON 字段名，不依赖本仓库盘点已经零 Missing。
