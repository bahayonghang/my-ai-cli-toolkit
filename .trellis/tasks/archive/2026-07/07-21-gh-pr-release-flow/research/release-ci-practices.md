# Research: Release CI with GitHub Actions

- **Query**: tag-push trigger vs `release: published`; least-privilege `permissions`; draft-release-first; `fetch-depth: 0`; verify tag is green; artifact attestation / SLSA (2026); monitoring a tag-triggered run with gh.
- **Scope**: external
- **Date**: 2026-07-21

## Findings

### Trigger: `on: push: tags` vs `on: release: types: [published]`

- **Tag push** — `on: push: tags: ['v*']` (or `'v*.*.*'`) fires when a matching tag is pushed. Good when the tag _is_ the release trigger and you want the workflow to build + create the GitHub Release itself. Source: <https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows> — Last verified: 2026-07-21; example: <https://github.com/softprops/action-gh-release> — Last verified: 2026-07-21
- **Release event** — `on: release: types: [published]` fires when a release is published. For this event `GITHUB_REF` is the tag ref and `github.event.release.*` fields (`tag_name`, `name`, `body`, `prerelease`, `draft`) are available. Source: <https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows> — Last verified: 2026-07-21
- **Draft nuance**: the `release` event does **not** fire for `created`/`edited`/`deleted` on _draft_ releases. Use `types: [published]` (fires when a draft is published OR a non-draft is created directly) — not `types: [created]`, which misses the draft->publish transition and can run on drafts. `prereleased` does **not** fire for pre-releases published from a draft, but `published` does. Source: <https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows> — Last verified: 2026-07-21; corroborated: <https://stackoverflow.com/questions/59319281/github-action-different-between-release-created-and-published> — Last verified: 2026-07-21
- **Chaining caveat**: a release **created by a workflow using the default `secrets.GITHUB_TOKEN` will NOT trigger another workflow** (`on: release`). To have a `release:published` workflow fire off an action-created release, use a PAT/App token for the creating step. Source: <https://github.com/softprops/action-gh-release> — Last verified: 2026-07-21

### Least-privilege `permissions`

- Creating/updating/deleting a release (draft or published) and uploading assets requires `contents: write` — **and nothing more** unless the job needs it. `read` only lets you view releases. Source: <https://www.codegenes.net/blog/what-permissions-does-github-token-require-for-releases-from-a-github-action/> — Last verified: 2026-07-21
- Drafts are treated the same as published releases permission-wise: `contents: write`. Grant it at **job** level (not workflow-wide) so only the release job holds write. Source: <https://www.codegenes.net/blog/what-permissions-does-github-token-require-for-releases-from-a-github-action/> — Last verified: 2026-07-21
- For attestation jobs add `id-token: write` + `attestations: write` (see below); keep `contents: read` on those. Source: <https://github.blog/enterprise-software/devsecops/enhance-build-security-and-reach-slsa-level-3-with-github-artifact-attestations/> — Last verified: 2026-07-21
- `softprops/action-gh-release@v3` requires `permissions: contents: write`. Source: <https://github.com/softprops/action-gh-release> — Last verified: 2026-07-21

### Draft-release-first pattern (the safe default)

- Recommended flow: **build artifacts -> attach to a draft release -> publish**. Validating permissions by creating a draft before promoting "reduces the risk of failed production releases." Source: <https://www.codegenes.net/blog/what-permissions-does-github-token-require-for-releases-from-a-github-action/> — Last verified: 2026-07-21
- Real-world two-workflow variant: Release Drafter keeps a **draft** GitHub Release updated from merged-PR titles on every merge to main; a separate tag-push workflow (`on: push: tags: 'v*.*.*'`) then flips that draft to `published` with the real tag name. Source: <https://jacobtomlinson.dev/posts/2024/creating-github-releases-automatically-on-tags/> — Last verified: 2026-07-21
- `softprops/action-gh-release` handles draft finalization: when reusing an existing draft, set `draft: true` to keep it draft, or omit `draft` to publish after uploading assets. Source: <https://github.com/softprops/action-gh-release> — Last verified: 2026-07-21
- **Immutable-releases interaction**: GitHub immutable releases lock assets after publication; upload assets to the draft _before_ publishing. For prereleases that must keep firing `release.prereleased`, use `draft: true` then publish and subscribe downstream to `release.published`. Source: <https://github.com/softprops/action-gh-release> — Last verified: 2026-07-21

### `fetch-depth: 0` for changelog/notes

- Default `actions/checkout` does a shallow clone (no tag history / limited commits). Changelog and "since last release" note generation need full history + tags, so release jobs should `uses: actions/checkout` with `fetch-depth: 0`. (Corroborated by the general changelog-generation requirement across tools in release-pr-patterns.md; softprops examples check out the tagged ref.) Source: <https://github.com/softprops/action-gh-release> — Last verified: 2026-07-21

### Verify the tag points at a green commit before releasing

- Gate the release job on CI success for that commit. Practical CLI equivalent: `gh run view <run-id> --exit-status` exits non-zero if the run failed, so a release step can be conditioned on the build/test run for the tagged SHA being green. Source: <https://cli.github.com/manual/gh_run_view> — Last verified: 2026-07-21
- Fork-safety: guard the publish job with `if: github.repository == 'OWNER/REPO'` so forks don't cut releases. Source: <https://jacobtomlinson.dev/posts/2024/creating-github-releases-automatically-on-tags/> — Last verified: 2026-07-21

### Artifact attestation / provenance / SLSA — 2026 state

- `actions/attest-build-provenance` binds a subject (artifact name + digest) to a **SLSA build provenance** predicate (in-toto format), signed via a short-lived **Sigstore** cert (public-good Sigstore for public repos; GitHub's private Sigstore for private/internal). Attestations upload to the GH attestations API. Source: <https://github.com/actions/attest-build-provenance> — Last verified: 2026-07-21
- **As of v4, `attest-build-provenance` is a thin wrapper over `actions/attest`; new implementations should use `actions/attest`.** Source: <https://github.com/actions/attest-build-provenance> — Last verified: 2026-07-21
- **SLSA levels via GitHub**: attestations alone provide **SLSA v1.0 Build Level 2** (GitHub-hosted runners); moving the signing into an **isolated reusable workflow** reaches **Build Level 3**. Generating provenance at all = Level 1. Source: <https://docs.github.com/en/actions/concepts/security/artifact-attestations> — Last verified: 2026-07-21; <https://github.blog/enterprise-software/devsecops/enhance-build-security-and-reach-slsa-level-3-with-github-artifact-attestations/> — Last verified: 2026-07-21
- Required permissions for attestation: `id-token: write`, `attestations: write`, `contents: read`. Minimal step:

```yaml
permissions:
  id-token: write
  attestations: write
  contents: read
steps:
  - uses: actions/checkout@v4
  - run: make our-app
  - uses: actions/attest-build-provenance@v1 # or actions/attest@v4 for new work
    with:
      subject-path: "${{ github.workspace }}/our-app"
```

Source: <https://github.blog/security/supply-chain-security/configure-github-artifact-attestations-for-secure-cloud-native-delivery/> — Last verified: 2026-07-21

- Availability: public repos on all current plans; private/internal need GitHub Enterprise Cloud. Attestations are **not** a guarantee an artifact is safe — they establish provenance for policy decisions. Verify with `gh attestation verify`. Source: <https://github.com/actions/attest-build-provenance> and <https://docs.github.com/en/actions/concepts/security/artifact-attestations> — Last verified: 2026-07-21

### Monitoring a tag-triggered run with gh

- Terminal debug loop: `gh run list` (find run) -> `gh run view <id> --log-failed` (read only failed steps) -> `gh run rerun <id> --failed` (retry broken jobs) -> `gh run watch <id>` (stream live, `tail -f`-like). Source: <https://mainbranch.dev/articles/debug-github-actions-terminal-gh/> — Last verified: 2026-07-21
- `gh run watch <run-id>`: watch until complete; `--compact` shows only relevant/failed steps; `--exit-status` exits non-zero if the run fails; `--interval N` refresh seconds (default 3). Note: does not support fine-grained PATs (needs `checks:read`). Source: <https://cli.github.com/manual/gh_run_watch> — Last verified: 2026-07-21
- `gh run view [<run-id>]`: `--log` (full log), `--log-failed` (failed steps only), `--job <id>`, `--exit-status`, `--json <fields>`/`--jq`. Source: <https://cli.github.com/manual/gh_run_view> — Last verified: 2026-07-21
- You cannot `gh run rerun` a run that is still in progress; the error can look like an invalid-workflow error but usually just means the run hasn't finished. Source: <https://mainbranch.dev/articles/debug-github-actions-terminal-gh/> — Last verified: 2026-07-21

### Skeleton: tag-triggered release workflow

```yaml
on:
  push:
    tags: ["v*.*.*"]
permissions:
  contents: read # workflow-level minimum
jobs:
  release:
    runs-on: ubuntu-latest
    if: github.repository == 'OWNER/REPO'
    permissions:
      contents: write # only this job can write releases
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 } # full history for notes
      - run: ./build.sh # produce artifacts
      - uses: softprops/action-gh-release@v3
        with:
          draft: true # draft-first; publish as a later gated step
          files: dist/*
```

## Correction (2026-07-21, post-review local verification — gh 2.96.0)

- The "Verify the tag points at a green commit" bullet above cites `gh run view <run-id> --exit-status`. **Local gh 2.96.0 has no `--exit-status` flag on `gh run view` at all** (verified via `gh run view --help`); only `gh run watch` carries `--exit-status` ("Exit with non-zero status if run fails"), and `gh run watch` does not support fine-grained PATs. Exit codes also cannot distinguish a pending run from a passed one. The operative green-check protocol (task design.md): locate the run with `gh run list --commit SHA --json databaseId,headSha,status,conclusion`, confirm `headSha`, wait via `gh run watch RUN_ID --exit-status` or poll `gh run view RUN_ID --json status,conclusion`, and treat only a fresh read of `status == completed && conclusion == success` as green; absent/pending/unreadable runs are missing evidence.

## External References

- Events that trigger workflows (push tags, release types, draft nuances): <https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows>
- GITHUB_TOKEN permissions for releases (contents: write, draft==published): <https://www.codegenes.net/blog/what-permissions-does-github-token-require-for-releases-from-a-github-action/>
- softprops/action-gh-release (draft finalization, immutable releases, token-chaining caveat): <https://github.com/softprops/action-gh-release>
- Draft-then-publish on tags (Release Drafter two-workflow): <https://jacobtomlinson.dev/posts/2024/creating-github-releases-automatically-on-tags/>
- created vs published behavior: <https://stackoverflow.com/questions/59319281/github-action-different-between-release-created-and-published>
- Artifact attestations concepts + SLSA levels: <https://docs.github.com/en/actions/concepts/security/artifact-attestations>
- actions/attest-build-provenance (v4 -> actions/attest): <https://github.com/actions/attest-build-provenance>
- SLSA Level 3 with attestations: <https://github.blog/enterprise-software/devsecops/enhance-build-security-and-reach-slsa-level-3-with-github-artifact-attestations/>
- Configure attestations (minimal workflow): <https://github.blog/security/supply-chain-security/configure-github-artifact-attestations-for-secure-cloud-native-delivery/>
- gh run watch: <https://cli.github.com/manual/gh_run_watch>
- gh run view: <https://cli.github.com/manual/gh_run_view>
- Terminal Actions debugging loop: <https://mainbranch.dev/articles/debug-github-actions-terminal-gh/>

## Caveats / Not Found

- The `fetch-depth: 0` requirement is well-established general knowledge and implied by the note-generation needs; I did not capture a single canonical GitHub-Docs sentence stating it this pass. Safe to state, but cite the checkout README if a primary source is wanted.
- SLSA level mechanics are summarized from GitHub's docs/blog; the SLSA spec itself (slsa.dev) was not fetched. Level definitions are GitHub's framing as of the 2024 GA posts, reconfirmed against the 2026 docs page.
