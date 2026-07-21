# Inspect And Merge A Pull Request

Inspect is read-only. Merge, auto-merge, branch deletion, and admin bypass are separate high-risk actions.

## Inspect

1. Capture the exact head SHA and PR state:

   ```bash
   gh pr view PR --repo OWNER/REPO \
     --json url,state,isDraft,headRefOid,baseRefName,headRefName,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup
   ```

2. Classify checks without collapsing distinct states:
   - all successful: continue;
   - no checks: report that fact; it is not a CI failure;
   - pending: wait or ask whether to use an explicitly authorized auto-merge path;
   - failed: stop and route to this skill's [fix-ci mode](fix-ci.md);
   - timed out or unavailable: report missing evidence and do not call it green.
3. Treat `CHANGES_REQUESTED` and `REVIEW_REQUIRED` as blockers. An `APPROVED` or empty decision still needs merge-state and repository-rule checks.
4. Use `bash "<skill-dir>/scripts/pr_review" list-threads --repo . --pr PR` to count unresolved conversations. Do not merge over an unresolved blocking thread.
5. Distinguish the remote PR being behind its base from a stale local base checkout. Local staleness is not a failed GitHub check.
6. Query repository merge methods:

   ```bash
   gh repo view OWNER/REPO \
     --json mergeCommitAllowed,squashMergeAllowed,rebaseMergeAllowed,deleteBranchOnMerge
   ```

7. `gh pr view --json` does not expose queue fields in gh 2.96. Use plain `gh api graphql` to read PullRequest `isMergeQueueEnabled`, `isInMergeQueue`, and `mergeQueueEntry`.

## Select A Method

- If repository policy allows only one method, use it.
- If a merge queue is required, let the queue control the method. Do not add `--admin`; it bypasses the queue.
- Otherwise default to squash for one coherent PR, using the reviewed PR title as the squash subject.
- Use merge commit when repository history intentionally preserves the branch topology.
- Use rebase only when each commit is already meaningful and the repository allows it.

Show the selected method, exact head SHA, queue behavior, commit subject/body, and any optional flags before authorization.

## Execute

For a normal squash merge:

```bash
gh pr merge PR --repo OWNER/REPO --squash --match-head-commit HEAD_SHA
```

Use `--merge` or `--rebase` only when selected above. On a required merge queue, omit an explicit strategy when GitHub controls it and still pin the head SHA.

Never add these implicitly:

- `--auto`: separately authorize enabling deferred execution;
- `--delete-branch`: separately authorize because it deletes local and remote refs and may overlap repository auto-delete settings;
- `--admin`: separately authorize only after explaining which protection or queue it bypasses.

## Verify

Read `gh pr view PR --repo OWNER/REPO --json state,mergedAt,mergedBy,mergeCommit,headRefOid,url`. Confirm `MERGED` and a merge commit OID, or confirm the queue/auto-merge state when the action intentionally deferred completion.
