## Verdict

NEEDS SCOPE

You asked for a code quality review but explicitly did not attach a patch or file path, and the only uncommitted changes I can see are edits to this review skill's own scaffolding — not product code you authored — so I need you to point me at a real target before I can review anything meaningfully.

## Findings

No findings yet. I have not reviewed any code, because there is no clear, reviewable target.

Here is what I inspected to reach that conclusion, and why I am declining to guess:

- **Current branch:** `main` (this is also the repository's main/default branch, so there is no `main...HEAD` feature delta to fall back to — `HEAD` _is_ `main`).
- **Working tree (uncommitted) changes:** only two files are modified, both belonging to the review tooling itself:
  - `skills/development-workflows/code-quality-review/SKILL.md`
  - `skills/development-workflows/code-quality-review/evals/evals.json`
- **Staged changes:** none.

Per the skill's scope-inference rules, when no explicit target is given the order is: uncommitted changes → `main...HEAD` → `master...HEAD` → ask. There technically _is_ an uncommitted diff, but I am deliberately not treating it as the review target, for two reasons:

1. **It is the review harness, not your code.** The only changed files are this very skill's definition (`SKILL.md`) and its evaluation config (`evals.json`). Reviewing the code-quality-review skill _by running the code-quality-review skill on its own evaluation edits_ is almost certainly not what "review the code quality here" means. Presenting that as "your review" would be misleading.
2. **You explicitly said you attached nothing.** That signals you have a specific target in mind that simply has not reached me — not that you want me to review whatever incidental edits happen to be sitting in the working tree. The skill is clear that I should ask rather than guess when no reasonable target can be inferred.

## To get a real review, point me at one of these

Please give me any one of the following and I will run the full quality review immediately:

- **A path or subsystem** — e.g. `skills/development-workflows/spark/` or a specific source file/directory you want judged.
- **A diff or patch** — paste it, or name a commit range / base ref (e.g. `git diff <base>...<head>`, or a specific commit hash range).
- **A PR** — give me the PR number or URL (or the branch it lives on) and I will review that branch against its base.
- **A branch or commit range** — name the feature branch and the base it should be compared against.

If you actually _did_ intend the working-tree edits to the review skill itself to be reviewed, just confirm that explicitly and I will review `SKILL.md` and `evals.json` as the target.

## Checked but not flagged

- **Git working-tree state** — inspected; the only diff is review-skill scaffolding (`SKILL.md`, `evals.json`), intentionally excluded as a target rather than flagged.
- **Branch / base topology** — confirmed `HEAD` is on `main`, so there is no separate feature branch delta (`main...HEAD`) to review.
- **Staging area** — confirmed empty; nothing staged that would constitute a separate review target.

I did not analyze the maintainability, structure, abstractions, or boundaries of any code, because doing so on an unintended target would produce a review you did not ask for.

## Scope limitations

- **No review target supplied.** No path, diff, patch, PR, branch, or commit range was provided, and the request explicitly noted that nothing was attached.
- **No inferable feature delta.** The working tree is on `main` with only review-harness edits, so the normal fallbacks (uncommitted feature work, `main...HEAD`, `master...HEAD`) do not yield a meaningful product-code target.
- **Confidence is intentionally withheld**, not low. Once you name a target I can read the changed code, its owning modules, callers, tests, and the project's canonical conventions, and then deliver findings with proper severity and confidence ratings.
