# Design: independent diff review stance and trigger split

## Boundaries

```
user prompt
    │
    ├─ independent git-diff / PR / 功能回归 / 并发 / 测试盲区
    │     → code-auditor  pr | dir     (this task: default stance)
    ├─ 全维度 / full-spectrum / 六维一起
    │     → code-auditor  project      (unchanged from 07-17)
    ├─ 可维护性 / 结构 / 抽象 / 改动的分层与归属
    │     → code-quality-review
    ├─ 直接重构、拆函数、去重复（要改代码）
    │     → code-refactor
    └─ 合规 / 隐私 / 成本 / 无障碍 仓库健康
          → repository-health workflow (fuck-my-shit-mountain; not in catalog)
```

No new skill. No new route name. Stance is a `pr`/`dir` overlay on the existing 4-phase workflow.

## code-auditor `pr`/`dir` stance

Add a section **Independent Reviewer Stance** immediately after Review Tone. It applies only to `pr` and `dir`.

Rules:

1. Treat the diff as untrusted work. Do not rebuild the author's plan in order to excuse missing handling.
2. Hunt first: functional regression, missed scenarios, wrong assumptions, concurrency, test gaps.
3. Report security and performance when the diff introduces them.
4. Report readability, structure, or architecture in `pr`/`dir` only when they create a merge risk (wrong layer that causes a bug, untestable public seam, public API with no regression test).
5. Do not edit product code. `Write` is only for an explicit opt-in report path already defined for `project` (`docs/audits/...`). `pr`/`dir` stay in-chat unless the user asks to save.
6. Findings first, sorted by severity, each with file and evidence. Empty `LGTM` is still forbidden.

Do not change dimension JSON weights in `references/workflow-guide.md` in this task. SKILL.md stance overrides hunt order for `pr`/`dir`. Regex rules stay hints.

`communication-guide.md`: add a short subsection under 审查者心态, not a rewrite.

- Allowed: suggestion-style Chinese; questions when intent is unclear.
- Forbidden: inventing a justification that makes a missing scenario acceptable; dropping a blocker to reach consensus.

## Proposed descriptions

Character counts on 2026-08-21: auditor 745, CQR 675. Both under 1024. No angle brackets.

### code-auditor

Independent pre-merge review of a git diff, PR, or named files. Use when the user asks to review a PR, inspect current git changes, or hunt functional regressions, missed scenarios, wrong assumptions, concurrency bugs, and test gaps as an independent reviewer who does not defend the author's approach / 独立审查、功能回归、遗漏场景、错误假设、并发、测试盲区. Also use for a full-spectrum multi-dimension project audit across correctness, security, performance, readability, testing, and architecture / 全维度代码审计 / 全维度的代码审计. Not for maintainability-only or structure/refactoring reviews; not for applying code changes; not for repository health reports spanning compliance, privacy, cost, or accessibility. Do not modify product code. Output follows the discussion language.

### code-quality-review

Run a maintainability and structure review focused on abstraction quality, branching complexity, file growth, canonical ownership, duplication, and refactoring opportunities. Use when the user asks for code quality review, maintainability review, 代码质量审查, 可维护性审查, or comments about whether the change stays easy to understand, modify, test, and extend, including layering and ownership of the change / 改动的分层与归属. Not for generic PR review or independent diff review hunting regressions, concurrency, or test gaps; not for full-spectrum or 全维度代码审计; not for system architecture audits; not for applying refactors; not for pure security, formatting-only, or performance profiling.

CQR body "When to Use" must match: drop `PR code quality feedback` and `架构质量审查`. Keep 本次改动的分层、归属、抽象 in the body, not as a system-architecture trigger.

## CQR atomicity split

Current row:

> Orchestration and atomicity — Independent work is serialized needlessly, or related updates can leave half-applied state.

Replace with two outcomes:

- Stay in CQR: independent work serialized needlessly (structure / complexity).
- Leave CQR: related updates can leave half-applied state. That is a correctness finding for auditor.

Eval #3 currently requires the non-atomic charge. Remove that assertion. Keep `any` / silent fallback and at least one structural issue.

Add auditor eval using the same fixture or an equivalent prompt: non-atomic charge is a `[必须修复]` / Must Fix finding with file evidence.

## Output contracts (unchanged vocabularies)

| | auditor `pr`/`dir` | CQR |
| --- | --- | --- |
| Order | findings, then summary | Verdict, then CQ findings |
| IDs | CORR/SEC/PERF/READ/TEST/ARCH | CQ-001… |
| Severity | critical…info → 必须修复 / 建议修改 / 仅供参考 | Blocker/High/Medium/Low |
| Confidence field | not required | required |

Do not unify.

## Trigger eval (task-local)

Two files:

- `research/code-auditor-trigger-cases.json`
- `research/code-quality-review-trigger-cases.json`

Use qiaomu-meta schema (`positive_concepts`, `description_required_concepts`, `negative_patterns`, three buckets). Do not use yao-meta `semantic_config.json`.

Auditor concept families (draft, tune during implement so the user's prompt scores ≥ threshold and CQR maintainability prompts do not):

- `pr_diff`: review a PR, git diff, git changes, 当前 Git diff, 审查 PR
- `independent`: independent reviewer, 独立审查, does not defend, 替改动辩护
- `behavioral`: regression, missed scenario, wrong assumption, concurrency, test gap, 功能回归, 遗漏场景, 错误假设, 并发, 测试盲区
- `project_audit`: full-spectrum, 全维度代码审计
- `read_only`: do not modify, 不要修改代码

CQR concept families:

- `maintainability`: maintainability, 可维护性, easy to understand, modify, test, extend
- `structure`: structure, abstraction, duplication, 分层与归属, 重构机会
- `quality_review`: code quality review, 代码质量审查

CQR `negative_patterns` (veto only strong auditor-only phrases): `全维度代码审计`, `independent reviewer`, `功能回归`, `测试盲区`, `替改动辩护`.

Do not put those phrases into CQR `positive_concepts`.

Runner (when present):

```text
python C:\Users\lyh\.grok\skills\qiaomu-meta\scripts\trigger_eval.py <skill-dir> --cases <task>/research/<skill>-trigger-cases.json --output <task>/research/<skill>-trigger-eval.json
```

If the script is absent, write `research/trigger-eval.md` with `missing evidence`. Do not add README.md or manifest.json to satisfy qiaomu `validate_skill.py`.

## Neighbor one-liners

`code-refactor` Review-only bullet: independent diff review → `code-auditor`; maintainability review → `code-quality-review`.

`trellis-plan-review` Routing: pure code diff → `code-auditor` (independent / full-spectrum) or `code-quality-review` (maintainability).

## Compatibility and rollback

- `project` workflow files stay.
- Existing auditor evals #1–#4 (bilingual PR review) stay valid.
- Existing CQR evals #1, #2, #4, #5, #6, #7, #8 stay valid except #3 assertion change.
- Rollback: revert the two SKILL.md files, two evals.json, AGENTS.md, interface.yaml, neighbor one-liners, version numbers.

## Trade-offs

- Stance overlay instead of a new `adversarial` route: fewer moving parts; `pr`/`dir` already mean git-diff review.
- Not rewriting regex rule files: 07-17 already treats them as sweep hints; this task is routing and posture.
- Not deleting architecture from auditor description: `project` still names the six dimensions. Bare 架构质量审查 is removed from CQR and is not added as an auditor-only trigger.
