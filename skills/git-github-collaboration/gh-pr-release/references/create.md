# Create A Pull Request

Use this mode to inspect, draft, and optionally create a PR. Creating the PR and pushing an unpublished head branch are separate high-risk actions.

## Inspect

1. Resolve the local root, current branch, remotes, default branch, and intended base/head repositories. For forks, display both `base_owner/base_repo:base` and `head_owner/head_repo:head`.
2. Check for an existing PR before drafting a new one:

   ```bash
   gh pr list --repo OWNER/REPO --state all --head HEAD_OWNER:BRANCH \
     --json number,url,state,isDraft,headRefName,baseRefName
   ```

   If a matching PR exists, report it and stop creating. Route to review, merge, or respond when that is the user's actual next action.
3. Inspect `git status --porcelain -uall`. Uncommitted changes are not part of the PR and should route to `git-commit` when the user wants them committed.
4. Verify the branch has commits not present in the intended base. Do not claim a remote comparison is current unless the relevant refs were fetched.
5. Detect the upstream with `git rev-parse --abbrev-ref --symbolic-full-name '@{u}'`. If it exists, inspect `git log --oneline '@{u}..HEAD'`. If it does not, show the exact proposed remote/ref instead of assuming `origin`.
6. Find PR templates in this order: `.github/`, repository root, then `docs/`. Check both `PULL_REQUEST_TEMPLATE.md` and `PULL_REQUEST_TEMPLATE/`. When multiple templates exist, ask the user which one applies.

`gh pr create --dry-run` can still push and is not an inspect command.

## Draft

Collect title evidence from the intended base:

```bash
git log --oneline BASE..HEAD
git diff --name-status BASE...HEAD
```

Read changed files only until the main purpose is clear.

- Title: write a Conventional Commit header whose subject is the functional change. Keep the repository's type, scope, language, and emoji convention. Squash merge uses this title as the commit subject. Do not copy a past title whose subject is only a branch-merge phrase.

  1. If the user supplied a complete title string, use that exact string.
  2. Drop commits whose only role is journal, task archive, or empty chore when any `feat` / `fix` / `refactor` / `perf` commit remains.
  3. If a remaining commit already states the main purpose as `type(scope): subject`, reuse that header.
  4. If several remaining commits share one purpose, write one covering Conventional Commit header in the same convention.
  5. Unless step 1 applied, the GitHub title must not contain `merge <head> into <base>`, `合并 … 到`, a combined prefix or suffix of those phrases, or a bare branch-name subject.

  Worked sample (`dev` → `main`):

  | Input commit | Role |
  | --- | --- |
  | `fix(goal-meta-skill): 完善 Trellis Prompt 派发与归档闭环` | main purpose |
  | `chore(trellis): 记录 Goal Prompt 收尾契约任务` | supporting |
  | `chore(task): 归档 08-27-goal-prompt-submit-plan-archive` | drop from title |
  | `chore: record journal` | drop from title |

  Draft title: `fix(goal-meta-skill): 完善 Trellis Prompt 派发与归档闭环`

  Forbidden titles: `feat: merge dev into main` and `feat: merge dev into main — 完善 Trellis Prompt 派发与归档闭环`.
- Body: preserve the selected repository template. Otherwise use specific sections for What, Why, How to test, and Out of scope. Add breaking or security notes only when relevant. Without a template, one body line may record topology as `Merges <head> into <base>`. Do not repeat the title. Do not list every commit.
- Do not use `gh pr create --fill`. Do not dump the commit list into the title or body.
- Issue links: use `Closes #N`, `Fixes #N`, or `Resolves #N` only when the PR targets the repository default branch. For other bases use `Refs #N` and explain that merge will not auto-close it.
- Draft state: recommend `--draft` for work in progress or a change too large for focused review. Treat size thresholds as guidance, not a hard gate.

Show the title, full body, base/head, reviewers/labels, and draft state before writing. Ask for authorization only for actions or material details not already covered by the request.

## Publish

1. When the branch is unpublished, verify explicit push authorization covers the resolved remote/ref. An existing request to push and create the PR covers both steps; ask only if push or its target is uncovered or ambiguous. Then run the narrow push command such as:

   ```bash
   git push --set-upstream REMOTE HEAD:BRANCH
   ```

2. Re-run the existing-PR and base/head-difference checks after the push.
3. Verify explicit PR-creation authorization covers the displayed plan; reuse the original request when it does. Write the body to a UTF-8 temporary file and use `--body-file`:

   ```bash
   gh pr create --repo OWNER/REPO --base BASE --head HEAD_OWNER:BRANCH \
     --title "TYPE(SCOPE): SUBJECT" --body-file PR_BODY_FILE [--draft]
   ```

   Do not pass `--fill`.

4. Never add reviewers, assignees, labels, or draft state that were not in the reviewed plan.

## Verify

Read the created PR again with `gh pr view --json number,url,state,isDraft,title,body,baseRefName,headRefName,headRefOid`. Report the URL and any requested metadata GitHub did not apply.
