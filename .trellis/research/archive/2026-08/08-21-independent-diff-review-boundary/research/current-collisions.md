# Remaining collisions after 07-22

Task `07-22-clarify-code-review-skill-boundary` fixed the bare `code review` phrase in the CQR body and added routing-negative evals. The packages still collide on the following surfaces.

## 1. Description still overlaps

| Phrase | Auditor description | CQR description | Effect |
| --- | --- | --- | --- |
| review a PR / inspect git changes | yes | `PR code quality feedback` | Generic PR review can load CQR |
| architecture / 架构 | sixth dimension in the six-dimension list | `架构质量审查` | Bare architecture review can load either |
| code quality | tags include `quality-assurance` | name + `code quality review` / `代码质量审查` | Oral "代码质量审查" is often a generic review |
| full-spectrum / 全维度 | yes, with exclusion of maintainability-only | body and eval #7 exclude it; **frontmatter does not** | Routers read description first |

## 2. Internal auditor text still reviews maintainability

`references/review-dimensions.md` labels Readability focus as Maintainability.
`references/issue-classification.md` defines Medium as "Code quality issues, maintainability concerns".
`assets/quick-checklist.md` lists duplicate code and readability as important issues.

The description says auditor is not for maintainability-only reviews. The `pr`/`dir` workflow still scores readability and architecture at 15% and 10%.

## 3. CQR owns a correctness defect

CQR Review Checklist row "Orchestration and atomicity" flags half-applied state.
Eval #3 asserts the fixture's non-atomic payment/order update.

That finding is a functional race / correctness defect. The independent-diff prompt assigns concurrency to auditor.

## 4. Stance documents pull in opposite directions

Auditor `SKILL.md` Review Tone: Chinese suggestion-style; do not hide blockers.
`references/communication-guide.md`: "目标：共同提高代码质量"; "当作者不同意时…寻求共识".

The user prompt forbids defending the change from the original development plan. Suggestion-style wording can stay. Advocacy and consensus-seeking around a blocking defect cannot stay as the `pr`/`dir` default.

## 5. Product-code write gate is uneven

CQR: product code is read-only; `Write` only for `code_review/` artifacts.
Auditor: `allowed-tools` includes `Write`; SKILL.md does not say "never edit product code".

The user prompt requires no code edits during the review.

## Neighbor map (do not expand unless a one-liner becomes false)

| Neighbor | Current handoff | Needed change |
| --- | --- | --- |
| `code-refactor` | review-only → CQR | Add auditor for independent diff review |
| `trellis-plan-review` | pure diff → auditor (full-spectrum) or CQR (maintainability) | Optionally name independent diff review |
| `gh-pr-release` | not for code-review analysis | No change |
| `fuck-my-shit-mountain` (user-global, not in catalog) | non-code health reports | Keep exclusion wording from 07-17 |
