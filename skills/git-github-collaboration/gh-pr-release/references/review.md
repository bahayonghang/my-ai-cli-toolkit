# Publish An Existing Review

This mode publishes conclusions that already exist and have been confirmed by the user. If the request is to inspect code and discover findings, route to `code-auditor` or `code-quality-review` first.

## Choose The Review Event

- `APPROVE`: the change clearly improves code health and no blocking issue remains. Minor nits may remain. GitHub does not allow authors to approve their own PR.
- `REQUEST_CHANGES`: at least one blocking issue must be fixed before merge.
- `COMMENT`: feedback is non-blocking, partial, informational, or question-only.

Use Conventional Comments labels to make intent visible: `praise`, `nitpick`, `suggestion`, `issue`, and `question`. Add `(blocking)` or `(non-blocking)` when the label alone is ambiguous. Prefix optional polish with `Nit:` or `nitpick:`.

## Summary-Only Review

Show the event and complete body. After the matching authorization:

```bash
gh pr review PR --repo OWNER/REPO --comment --body-file REVIEW_BODY_FILE
gh pr review PR --repo OWNER/REPO --approve --body-file REVIEW_BODY_FILE
gh pr review PR --repo OWNER/REPO --request-changes --body-file REVIEW_BODY_FILE
```

A comment-only review may use one low-risk batch authorization. Approve and request-changes each require high-risk per-action authorization.

## Inline Review Draft

Create a UTF-8 JSON draft. `event` is required. `body` is the review summary. Each inline item uses the modern line coordinates, never `position`:

```json
{
  "event": "REQUEST_CHANGES",
  "body": "Two blocking correctness issues remain.",
  "comments": [
    {
      "path": "src/session.ts",
      "line": 84,
      "side": "RIGHT",
      "body": "issue (blocking): This can reuse an expired token."
    },
    {
      "path": "src/cache.ts",
      "start_line": 41,
      "start_side": "RIGHT",
      "line": 45,
      "side": "RIGHT",
      "body": "suggestion: Extract this repeated eviction branch."
    }
  ]
}
```

- `RIGHT` addresses added or context lines in the head version; `LEFT` addresses deleted or context lines in the base version.
- A range must stay on one side and every line must be present in a displayed diff hunk.
- Missing patches, binary/large-file patches, invalid paths, and stale lines fail closed. Do not move a comment to a nearby line or silently turn it into summary text.

Prepare without publishing:

```bash
bash "<skill-dir>/scripts/pr_review" prepare-review \
  --repo . --pr PR --input DRAFT_JSON --output PREPARED_JSON
```

The helper pins `commit_id` to the current `headRefOid`, validates every inline location against paginated PR file patches, and writes UTF-8 with LF. Do not create a pending GitHub review merely for preview.

Show the prepared target repository/PR, head SHA, event, summary, and every path/line/body. Reuse existing explicit authorization for this review. If the prepared file or head changes, inspect the change and regenerate/revalidate affected content against the exact head; obtain authorization again only for an uncovered material change to target, findings, event, or scope. The helper's stale-head rejection still blocks submission until this preparation is complete.

## Inline Review Publish

After low-risk batch authorization for `COMMENT`, or high-risk per-action authorization for `APPROVE` / `REQUEST_CHANGES`:

```bash
bash "<skill-dir>/scripts/pr_review" submit-review \
  --repo . --prepared PREPARED_JSON
```

The helper re-reads the head SHA and submits summary, event, and inline comments in one create-review request. It does not automatically retry an uncertain POST; inspect the PR first to avoid duplicate reviews.

## Verify

Read the latest review state and review comments from GitHub. Confirm the returned review id/state, head commit, comment count, paths, and lines. Report any missing evidence instead of claiming publication succeeded.
