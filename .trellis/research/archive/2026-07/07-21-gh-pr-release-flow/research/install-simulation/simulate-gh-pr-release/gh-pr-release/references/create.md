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

- Title: use the repository's established PR-title rule. Otherwise use a concise Conventional-Commit form such as `feat(auth): add OAuth login`; this matters when squash merge uses the PR title as the commit subject.
- Body: preserve the selected repository template. Otherwise use specific sections for What, Why, How to test, and Out of scope. Add breaking or security notes only when relevant.
- Issue links: use `Closes #N`, `Fixes #N`, or `Resolves #N` only when the PR targets the repository default branch. For other bases use `Refs #N` and explain that merge will not auto-close it.
- Draft state: recommend `--draft` for work in progress or a change too large for focused review. Treat size thresholds as guidance, not a hard gate.

Show the title, full body, base/head, reviewers/labels, and draft state before requesting authorization.

## Publish

1. When the branch is unpublished, request separate authorization for the exact push target, then run the narrow push command such as:

   ```bash
   git push --set-upstream REMOTE HEAD:BRANCH
   ```

2. Re-run the existing-PR and base/head-difference checks after the push.
3. Request separate authorization to create the PR. Write the body to a UTF-8 temporary file and use `--body-file`:

   ```bash
   gh pr create --repo OWNER/REPO --base BASE --head HEAD_OWNER:BRANCH \
     --title "TYPE(SCOPE): SUBJECT" --body-file PR_BODY_FILE [--draft]
   ```

4. Never add reviewers, assignees, labels, or draft state that were not in the reviewed plan.

## Verify

Read the created PR again with `gh pr view --json number,url,state,isDraft,title,body,baseRefName,headRefName,headRefOid`. Report the URL and any requested metadata GitHub did not apply.
