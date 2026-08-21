# Prompt mapping: independent git-diff review

Source prompt (user, 2026-08-21):

> 请以独立代码审查者的身份检查当前 Git diff。不要根据原开发思路替改动辩护，重点寻找功能回归、遗漏场景、错误假设、并发问题和测试盲区。暂时不要修改代码，先按严重程度列出问题，并提供对应文件和证据。

This file records where each clause belongs. It is the source for `prd.md` and `design.md`.

## Clause table

| Clause | Job | Home | Why |
| --- | --- | --- | --- |
| 独立代码审查者 | Stance: reviewer is not the author and not an advocate | `code-auditor` `pr`/`dir` | Merge review evaluates the change against observable risk. `code-quality-review` judges structure and future edit cost. |
| 检查当前 Git diff | Target: current uncommitted / PR diff | `code-auditor` `pr` default | Auditor already defaults empty args to `git diff` + staged. CQR also infers git state, but its lens is maintainability. |
| 不要根据原开发思路替改动辩护 | Anti-advocacy. Do not reconstruct the author's plan to excuse missing handling | `code-auditor` Review Tone / new stance section | Current `communication-guide.md` asks the reviewer to seek consensus with the author. That collides with this clause. |
| 功能回归 | Behavioral break vs previous / intended contract | `code-auditor` Correctness | Not a maintainability finding. |
| 遗漏场景 | Missing branches, empty/null, authz, error paths | `code-auditor` Correctness + Testing | CQR may mention a missing abstraction; it does not own scenario coverage. |
| 错误假设 | Diff relies on an invariant the code does not enforce | `code-auditor` Correctness | Distinct from "this abstraction is thin". |
| 并发问题 | Races, half-applied updates, lost wakeup, dirty reads | `code-auditor` Correctness (and Performance when it is load-related) | CQR checklist currently lists orchestration/atomicity. That row leaks this clause into the wrong skill. |
| 测试盲区 | Changed behavior without a test that would fail | `code-auditor` Testing | CQR may note an untestable seam; missing regression tests belong here. |
| 暂时不要修改代码 | Product code is read-only | Both, already in CQR; missing as a hard gate in auditor | Auditor `allowed-tools` includes `Write` for opt-in reports. Stance must forbid editing product code. |
| 按严重程度列出问题 | Findings first, sorted by severity | `code-auditor` existing output contract | CQR uses `Verdict` + `CQ-ID` + `Confidence`. Do not unify. |
| 提供对应文件和证据 | `file:line` or concrete diff evidence | `code-auditor` existing contract; project route already requires `file:line` for critical/high | CQR already has Location/Evidence. Keep both. |

## Routing decision

The prompt is an independent pre-merge review of a git diff. It belongs in `code-auditor` as the **default `pr`/`dir` posture**, not as a third skill and not as a CQR mode.

`code-auditor` `project` route stays a full-spectrum six-dimension audit. That route was added in task `07-17-code-auditor-audit-upgrade`. This prompt does not change that route.

`code-quality-review` stays the maintainability/structure lens. It must stop claiming generic PR review, `架构质量审查`, and correctness-shaped atomicity.

## What the current packages already do

Auditor `SKILL.md` Output Contract already says the primary review focuses on bugs, regressions, risks, missing tests, and design problems. The user's prompt names that job more sharply and adds anti-advocacy plus concurrency.

Auditor description already claims "review a PR" and "inspect git changes before merge". It does not name independent reviewer, regression, missed scenarios, wrong assumptions, concurrency, or test gaps. Those phrases currently have no dedicated trigger surface.

CQR description claims `PR code quality feedback` and `架构质量审查`. Those phrases steal generic PR review and architecture-shaped requests.

CQR eval #3 requires catching the non-atomic `charge` then `orders.update` in `evals/files/order_service.ts`. That is a correctness / concurrency defect. The user's prompt assigns it to auditor.

## Prior tasks to preserve

- `07-17-code-auditor-audit-upgrade`: project route, two exclusion clauses (maintainability-only; non-code health reports), "full-spectrum / 全维度" wording, never bare "架构和质量".
- `07-22-clarify-code-review-skill-boundary`: do not merge the two skills; keep severity vocabularies separate; CQR body no longer lists bare `code review`; CQR evals #7/#8 are routing-negatives.

This task extends those decisions. It does not reopen the merge question.
