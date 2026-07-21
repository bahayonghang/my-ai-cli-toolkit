# Research: GitHub CLI (gh) Mechanics for the PR Lifecycle

- **Query**: exact gh commands for create/view/review/merge + replying to a review thread + resolving threads
- **Scope**: external
- **Date**: 2026-07-21
- **Sources**: cli.github.com/manual/gh_pr_create, /gh_pr_merge; docs.github.com REST pulls/comments and REST pulls/reviews (`https://docs.github.com/en/rest/pulls/reviews?apiVersion=2022-11-28#create-a-review-for-a-pull-request`); GitHub official OpenAPI (`https://github.com/github/rest-api-description`); docs.github.com GraphQL reference/pulls; cli/cli issue #12419

## 1. Create — `gh pr create`

```bash
gh pr create \
  --title "feat(auth): add OAuth login" \
  --body-file .github/pr-body.md \
  --base main \
  --reviewer monalisa,hubot --reviewer myorg/team-name \
  --assignee @me \
  --label enhancement \
  --draft
```

Key flags (cli.github.com/manual/gh_pr_create):

| Flag             | Short | Purpose                                                                   |
| ---------------- | ----- | ------------------------------------------------------------------------- |
| `--title`        | `-t`  | PR title                                                                  |
| `--body`         | `-b`  | Body inline                                                               |
| `--body-file`    | `-F`  | Read body from file (`-` = stdin) — preferred for structured descriptions |
| `--fill`         | `-f`  | Autofill title+body from commit messages                                  |
| `--fill-first`   |       | Use first commit's info for title+body                                    |
| `--fill-verbose` |       | Use commit subject+body for description                                   |
| `--draft`        | `-d`  | Open as draft                                                             |
| `--base`         | `-B`  | Target branch to merge into                                               |
| `--head`         | `-H`  | Branch containing the commits (default: current)                          |
| `--reviewer`     | `-r`  | Request reviewers (people or `org/team`); repeatable                      |
| `--assignee`     | `-a`  | Assign (`@me` to self-assign)                                             |
| `--label`        | `-l`  | Add labels                                                                |
| `--template`     | `-T`  | Start body from a template file                                           |
| `--web`          | `-w`  | Finish in browser                                                         |
| `--dry-run`      |       | Print details instead of creating (may still push)                        |

Notes:

- If `--title`/`--body` are given **with** `--fill`, the explicit values win over autofill.
- If `--base` is omitted: uses `gh-merge-base` branch config, else the repo default branch.

## 2. Inspect — view / diff / checks

```bash
gh pr view [<number>|<url>|<branch>]        # summary, description, state, reviewers
gh pr view --json title,body,reviewDecision,mergeStateStatus
gh pr view --comments                        # include the conversation
gh pr diff [<number>]                         # unified diff
gh pr diff --name-only                        # changed files only
gh pr checks [<number>]                       # CI/status check results
gh pr status                                  # PRs relevant to you
gh pr list --state open --author @me
```

## 3. Review — `gh pr review`

```bash
gh pr review <number> --approve                       # approve
gh pr review <number> --request-changes --body "..."  # block, with required body
gh pr review <number> --comment --body "..."          # comment without approval
gh pr review <number> --body-file review.md           # body from file
```

- `--approve` / `-a`, `--request-changes` / `-r`, `--comment` / `-c` are mutually exclusive review states.
- `--request-changes` and `--comment` require a body.

### Batch review with inline comments — REST create-review

Official OpenAPI operation: `POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews` (GitHub REST API version 2022-11-28).

One request can atomically carry:

- `commit_id`: the reviewed head SHA. GitHub warns that using a non-latest commit may make comments outdated after subsequent changes.
- `body`: review summary; required for `REQUEST_CHANGES` and `COMMENT`.
- `event`: `APPROVE`, `REQUEST_CHANGES`, or `COMMENT`. Omitting it creates a `PENDING` review, which this v1 does not need.
- `comments[]`: each item requires `path` and `body`, with modern coordinates `line` / `side` and optional `start_line` / `start_side` for ranges. `side` is `RIGHT` for the head side or `LEFT` for the base side. The older `position` coordinate is still present in OpenAPI but should not be used for new implementation.

Recommended command shape for nested JSON:

```bash
gh api --method POST \
  repos/{owner}/{repo}/pulls/{pull_number}/reviews \
  --input - < prepared-api-payload.json
```

Planning implications:

- Build and validate the full payload locally before any POST. Bind it to the current `headRefOid`, then re-fetch and compare immediately before submit.
- Validate comment coordinates against the paginated PR files `patch` data. If a patch is absent (binary/large/truncated) or any line/range cannot be proven commentable, fail closed instead of guessing or silently converting it to a summary comment.
- Submit summary, event, and inline comments in one create-review request. Do not create a pending GitHub review merely to preview; the local prepared file is the draft layer.
- Do not automatically retry a timed-out or otherwise uncertain POST because the API has no idempotency key and a retry can duplicate comments. Inspect the PR review state first.

## 4. Reply to a specific review thread

There is **no first-class `gh` command** for replying to or resolving a specific review thread as of gh 2.x (tracked in cli/cli issue #12419). Two options:

**Option A — REST (reply to a review comment thread):**

```bash
# comment_id = the REST id of the TOP-LEVEL review comment that started the thread
gh api \
  --method POST \
  repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies \
  -f body="Fixed in abc1234 — added a null check before user.email."
```

- Endpoint: `POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies`. `comment_id` must be a **top-level** review comment id, not a reply id (replies-to-replies are unsupported). (docs.github.com/en/rest/pulls/comments)
- List review comments to find ids: `gh api repos/{owner}/{repo}/pulls/{pull_number}/comments`.
- Alternative REST form: `gh api -X POST repos/{owner}/{repo}/pulls/{pull_number}/comments -f body="..." -F in_reply_to={comment_id}`.

**Option B — GraphQL (`addPullRequestReviewThreadReply`):**

```bash
gh api graphql -f query='
mutation {
  addPullRequestReviewThreadReply(input: {
    pullRequestReviewThreadId: "PRRT_kwDO..."
    body: "Done — see abc1234."
  }) { comment { id } }
}'
```

- Uses the **thread node id** (`PRRT_...`), obtained from the `reviewThreads` query below — not the REST comment id. (docs.github.com/en/graphql/reference/pulls)

## 5. Resolve / unresolve a review thread (GraphQL only)

Thread resolution is only exposed via GraphQL — no REST endpoint, no `gh pr` subcommand.

**Step 1 — list threads to get thread node ids and resolution status:**

```bash
gh api graphql -f query='
{
  repository(owner: "OWNER", name: "REPO") {
    pullRequest(number: PR_NUMBER) {
      reviewThreads(first: 100) {
        nodes {
          id                # PRRT_...  <- thread node id
          isResolved
          comments(first: 100) {
            nodes { databaseId body path line author { login } }
          }
        }
      }
    }
  }
}'
```

- Map a REST comment `id` to its thread: the GraphQL `comments.nodes[].databaseId` equals the REST comment `id`; find the thread node whose comments contain it.

**Step 2 — resolve (or unresolve):**

```bash
gh api graphql -f query='
mutation($threadId: ID!) {
  resolveReviewThread(input: {threadId: $threadId}) {
    thread { id isResolved }
  }
}' -f threadId="PRRT_kwDO..."
```

- `unresolveReviewThread(input: {threadId: ...})` is the inverse.
- `gh pr lock --reason resolved` locks the _entire_ conversation, not an individual thread — not a substitute. (StackOverflow 71421045)

## 6. Merge — `gh pr merge`

```bash
gh pr merge <number> --squash --delete-branch          # squash + clean up branch
gh pr merge <number> --merge --delete-branch           # merge commit
gh pr merge <number> --rebase --delete-branch          # rebase
gh pr merge <number> --squash --auto --delete-branch   # auto-merge when checks/reviews pass
gh pr merge <number> --squash --body-file msg.md       # custom squash commit message
```

Flags (cli.github.com/manual/gh_pr_merge):

| Flag                     | Short       | Purpose                                                        |
| ------------------------ | ----------- | -------------------------------------------------------------- |
| `--merge`                | `-m`        | Create a merge commit                                          |
| `--squash`               | `-s`        | Squash into one commit                                         |
| `--rebase`               | `-r`        | Rebase commits onto base                                       |
| `--auto`                 |             | Merge automatically once requirements are met                  |
| `--disable-auto`         |             | Turn off auto-merge for the PR                                 |
| `--delete-branch`        | `-d`        | Delete local + remote branch after merge                       |
| `--subject`              | `-t`        | Commit subject text                                            |
| `--body` / `--body-file` | `-b` / `-F` | Commit body (rewrite squash messages here)                     |
| `--admin`                |             | Merge bypassing unmet requirements / merge queue (needs admin) |
| `--match-head-commit`    |             | Require head to match a SHA before merging                     |

Merge-queue behavior: without an explicit strategy on a queue-required branch, if required checks haven't passed `--auto` enables auto-merge; if passed, the PR is added to the queue. `--admin` bypasses the queue.

## Auth caveat (this machine)

Per user global CLAUDE.md / memory `github-token-env-lacks-pr-permission`: if `gh pr create`/`merge`/`edit` fails with "Resource not accessible by personal access token", the env-var `GITHUB_TOKEN`/`GH_TOKEN` account lacks PR scope. Prefix the command to fall back to the keyring account:

```bash
env -u GITHUB_TOKEN -u GH_TOKEN gh pr create ...
# (or:  GITHUB_TOKEN= GH_TOKEN= gh pr create ... )
```

## Caveats / Not Found

- gh has no built-in command for per-thread reply or resolve as of Jan 2026 (cli/cli #12419 open) — GraphQL/REST via `gh api` is the supported path.
- Thread ids (`PRRT_...`) are distinct from review-comment ids; mixing them up is the most common failure when scripting replies/resolves.

## Local CLI/schema verification (2026-07-21)

- Verified with `gh 2.96.0`: `gh repo view --json` exposes `mergeCommitAllowed`, `squashMergeAllowed`, `rebaseMergeAllowed`, and `deleteBranchOnMerge`.
- `gh pr view --json` does **not** expose merge-queue fields in this version. Do not invent a CLI JSON field.
- GitHub GraphQL introspection exposes PullRequest fields `isMergeQueueEnabled`, `isInMergeQueue`, `mergeQueue`, and `mergeQueueEntry`; use `gh api graphql` for queue detection.
- Repository GraphQL introspection also exposes `mergeQueue(branch: String)`, but the PullRequest fields are the direct per-PR contract.
- Because REST replies require the top-level review comment id, the bundled script should accept a thread id, fetch/map its first comment `databaseId`, and post the reply against that id. Returning only the latest comment id is unsafe for threads that already contain replies.
