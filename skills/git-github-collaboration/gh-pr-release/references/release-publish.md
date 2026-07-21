# Publish A GitHub Release

Use this mode after a release commit is selected. It may tag, create a draft GitHub Release, attach verified assets, publish, and monitor release workflows. Direct npm/cargo/pypi publication is out of scope even when a tag indirectly triggers it.

## 0. Classify The Release Topology

Inspect `.github/workflows/` plus release-please, Changesets, semantic-release, and repository release docs before any write.

| Topology | Owner | This mode may do |
| --- | --- | --- |
| A: automation owns tag and Release | bot or workflow creates both | monitor output; operate an existing draft only with authorization |
| B: tag workflow owns Release/assets | tag push triggers Release creation | push the authorized tag, monitor the exact run, then inspect its Release |
| C: manual | no automation owns tag/Release | tag, draft, upload, publish, and monitor as separately authorized actions |

Multiple creators, incomplete config, or unclear ownership is ambiguous: report it and stop rather than defaulting to C. A workflow triggered by `release: published` cannot be green before publish; use target-commit CI as the pre-publish gate and disclose the post-publish workflow in the authorization.

## 1. Pin The Target And Green Evidence

1. Prefer the fresh `mergeCommit` from the merged release PR:

   ```bash
   gh pr view PR --repo OWNER/REPO --json state,mergeCommit,baseRefName,url
   ```

   Otherwise require an explicit full SHA. Verify it belongs to the intended remote base branch using fresh refs.
2. Determine the expected CI set from repository policy, the merged PR check rollup, and applicable workflow files. Then enumerate Actions runs for the exact SHA:

   ```bash
   gh run list --repo OWNER/REPO --commit TARGET_SHA \
     --json databaseId,workflowName,headSha,status,conclusion,event,url
   ```

3. Check every expected run, not merely one successful run. Wait with `gh run watch RUN_ID --exit-status`; when fine-grained PAT authentication cannot use `run watch`, poll `gh run view RUN_ID --json status,conclusion,url`.
4. The only green result is a complete expected set whose fresh reads all have `headSha == TARGET_SHA`, `status == completed`, and `conclusion == success`. No run, a missing expected workflow, pending/skipped/neutral evidence, unreadable fields, or an external required check that cannot be pinned to the SHA is `missing evidence` and blocks tag/publish.

## 2. Resolve Tag State And Side Effects

Read the exact remote tag refs before proposing a write:

```bash
git ls-remote REMOTE "refs/tags/TAG" "refs/tags/TAG^{}"
```

- No direct ref: the name is available.
- Direct ref plus peeled `^{}` ref: compare the peeled commit OID; the direct OID is an annotated tag object.
- Direct ref only: it is a lightweight tag, so compare the direct OID.
- Same tag and same resolved commit: treat tag creation as already satisfied and continue with fresh Release inspection.
- Same tag and another commit: hard stop. Refuse delete/re-push and propose a new version.

Before authorization, enumerate every workflow matched by the tag or Release event, its environment, and its publication/deployment target. Include indirect registry, container, signing, or production deployment effects even though their direct commands are out of scope. Inspect existing Releases and immutability evidence; do not claim repository-wide immutability when only one published Release proves it.

## 3. Create The Tag

Only topology B/C may create a tag. Show tag, full SHA, message, resolved remote, and side effects, then request tag-push authorization.

```bash
git tag -a TAG -m "RELEASE MESSAGE" TARGET_SHA
git push REMOTE "refs/tags/TAG"
```

Push one ref; never use `git push --tags`. A ruleset rejection is a blocker, not permission to bypass protection. Fresh-read the remote direct/peeled refs after the push.

## 4. Create A Draft Release

Only topology C creates the Release. Show title, notes source, target tag, prerelease state, and side effects. After separate authorization:

```bash
gh release create TAG --repo OWNER/REPO --draft --verify-tag \
  --title "TITLE" --notes-file NOTES_FILE
```

Use `--generate-notes` with an optional `--notes-start-tag`, or `--notes-from-tag`, only when reviewed. `--prerelease` is separately authorized. Keep `--verify-tag`; do not let `gh release create` fabricate a tag from a moving default-branch head.

## 5. Attach Verified Assets

Prefer assets from the exact green run:

```bash
gh run download RUN_ID --repo OWNER/REPO --dir DOWNLOAD_DIR
sha256sum DOWNLOAD_DIR/ASSET...
gh release upload TAG DOWNLOAD_DIR/ASSET... --repo OWNER/REPO
```

Never select "latest" run artifacts. If local building is necessary, first approve the command, output set, worktree path, and cleanup; build in a clean detached worktree pinned to the resolved tag commit, not the user's current tree. Record checksums and map every uploaded file to its producing run or pinned build.

If an asset name already exists, stop. `--clobber` deletes the old asset before uploading the replacement and may lose both; refuse it by default and require a separate data-loss warning and authorization if the user persists.

## 6. Publish And Set Latest

Show the fresh draft state, assets/checksums, prerelease value, immutability consequences, notifications, and publish-triggered workflows. Publish is independent of tag/draft/upload authorization:

```bash
gh release edit TAG --repo OWNER/REPO --draft=false --latest=false
```

Changing Latest is another action. Only after separate authorization:

```bash
gh release edit TAG --repo OWNER/REPO --latest
```

Do not delete a published Release or retag a failed publication. If a release workflow fix needs a new commit, use a new version.

## 7. Monitor And Verify

For tag-triggered runs, locate runs by the exact tag and confirm their event/SHA before watching:

```bash
gh run list --repo OWNER/REPO --branch TAG \
  --json databaseId,workflowName,headSha,status,conclusion,event,url
gh run view RUN_ID --repo OWNER/REPO --json status,conclusion,headSha,url
```

Use [fix-ci](fix-ci.md) discipline for failures: at most 50 useful log lines, external providers separated, and local fixes require an approved plan. Never retry an uncertain tag, Release, upload, publish, or Latest write.

Verify with fresh reads:

```bash
gh release view TAG --repo OWNER/REPO \
  --json isDraft,isPrerelease,isImmutable,tagName,url,assets
gh release list --repo OWNER/REPO --limit 100 \
  --json tagName,isLatest,isImmutable,isDraft,isPrerelease
```

Report the resolved commit, topology, tag refs, Release URL/state, asset names/digests, Latest state, workflow results, each authorized write, and every `missing evidence` item.
