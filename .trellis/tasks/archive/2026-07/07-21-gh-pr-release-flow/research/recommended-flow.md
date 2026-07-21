# Recommended Release Flow for a gh-CLI Skill

> One-page synthesis of the five research topics in this folder. This file stands in for the
> originally-requested `summary.md`, which a repo hook blocks by filename (report/summary-named
> files are rejected for subagents). Content and intent are identical.

- **Scope**: external + internal (current `gh-pr-release` skill)
- **Date**: 2026-07-21
- **Last verified**: 2026-07-21

## Topic files (ground truth for every claim below)

| File                                               | Covers                                                                                                                                                      |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [release-pr-patterns.md](release-pr-patterns.md)   | release-please / changesets / semantic-release / git-flow; the Release-PR gate; which fits a manual gh skill.                                               |
| [tag-best-practices.md](tag-best-practices.md)     | Annotated vs lightweight, `v`-prefix, signing, protected tags, never-move/delete, tag the merge commit, push one tag not `--tags`.                          |
| [release-ci-practices.md](release-ci-practices.md) | Tag-push vs `release:published`; least-privilege `permissions`; draft-first; `fetch-depth: 0`; green-before-release; SLSA/attestation; `gh run watch/view`. |
| [gh-release-cli.md](gh-release-cli.md)             | `gh release create/upload/edit/view/list/download/delete` flags; destructiveness ranking; `.github/release.yml`; tag-doesn't-exist behavior.                |
| [release-safety-risks.md](release-safety-risks.md) | Irreversible ops, Go-proxy immutability, merge→tag race, why draft-first, untrusted changelog text, 10-point checklist.                                     |

## Pattern choice

Mimic the **Release-PR pattern executed manually** — a PR bumps version + changelog and _merging it_ is the human gate that authorizes the release, as in release-please and changesets (changesets also splits "version PR" from "publish"). Do **not** adopt semantic-release's no-PR auto-publish; it removes the gate an agent-operated skill most needs. Details + comparison table: [release-pr-patterns.md](release-pr-patterns.md). Sources: <https://github.com/googleapis/release-please/blob/main/docs/design.md>, <https://xnok.github.io/infra-bootstrap-tools/blog/intentional-releases-changesets/> — Last verified: 2026-07-21.

## The flow (4 stages, each with its safety gates)

### (a) Release PR — version bump + changelog

- Add the `references/release-pr.md` route beside the existing PR routes; open a PR that bumps the version file(s) + updates `CHANGELOG.md` (title `chore(release): vX.Y.Z`), reusing the skill's create path.
- **Gates**: show the version delta + changelog diff before creating; **PR creation is one authorized write**; the PR merge _is_ the human gate. See [release-pr-patterns.md](release-pr-patterns.md) and the Safety Contract in `skills/git-github-collaboration/gh-pr-release/SKILL.md`.

### (b) Post-merge tag creation

- Annotated tag pinned to the **merge-commit SHA** (not the branch head): `git tag -a vX.Y.Z <merge-sha> -m "Release vX.Y.Z"`, then `git push <resolved-base-remote> refs/tags/vX.Y.Z` — a **single tag, never `--tags`**. Sign (`-s`) if repo policy requires; verify `git tag -v`.
- **Gates**: **pin the exact merged SHA** (defeats the merge→tag race); compare an annotated tag's peeled `refs/tags/vX.Y.Z^{}` OID, or a lightweight tag's direct ref OID when no peeled row exists, with that SHA; pushing the tag is a **fresh authorized write**; never reuse/move an existing tag. See [tag-best-practices.md](tag-best-practices.md), [release-safety-risks.md](release-safety-risks.md). Sources: <https://git-scm.com/docs/git-tag>, <https://git-scm.com/book/en/v2/Git-Basics-Tagging> — Last verified: 2026-07-21.

### (c) Release publication — notes + artifacts (DRAFT FIRST)

- `gh release create vX.Y.Z --draft --verify-tag --generate-notes [--target <SHA>]` → `gh release upload vX.Y.Z <artifacts...>` → publish as a **separate authorized step** `gh release edit vX.Y.Z --draft=false --latest=false`; moving Latest and changing prerelease state each require their own explicit decision and authorization.
- **Gates**: **draft-first** (silent, not "Latest", reviewable); **`--verify-tag`** so a typo can't fabricate a tag off the default branch; **publish is a distinct authorization** (it notifies watchers + can move "Latest"); treat `--generate-notes` output as **untrusted** (built from commit/PR text) and review before publish; `.github/release.yml` `exclude.*` filters noise. See [gh-release-cli.md](gh-release-cli.md), [release-safety-risks.md](release-safety-risks.md). Sources: <https://cli.github.com/manual/gh_release_create>, <https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes> — Last verified: 2026-07-21.

### (d) Release CI monitoring / diagnosis

- Prefer a tag-triggered workflow `on: push: tags: ['v*.*.*']`, job-scoped `permissions: contents: write`, `actions/checkout` + `fetch-depth: 0`, `draft: true`, fork guard `if: github.repository == 'OWNER/REPO'`.
- Enumerate the complete expected run set with `gh run list --commit <tagged-sha> --json databaseId,workflowName,headSha,status,conclusion,event`. Use `gh run watch <RUN_ID> --exit-status` only to wait; with a fine-grained PAT, poll `gh run view <RUN_ID> --json headSha,status,conclusion` instead. After waiting, fresh-read **every** expected RUN_ID with `gh run view`, verify `headSha` still equals the tagged SHA, and require `status == completed` plus `conclusion == success`. Diagnose with `gh run view <RUN_ID> --log-failed`; retry only after separate authorization and reuse the skill's `fix-ci` route.
- **Gates**: no runs, an incomplete expected set, pending runs, an unreadable run, a SHA mismatch, or any non-success conclusion is **`missing evidence`** and blocks tag/Release publication. `gh run view` has no `--exit-status`; only `gh run watch` accepts that flag. Add `id-token`/`attestations: write` only on an attest job (`actions/attest` v4+; SLSA L2 hosted, L3 via isolated reusable workflow); **pin action SHAs**. See [release-ci-practices.md](release-ci-practices.md). Sources: <https://cli.github.com/manual/gh_run_list>, <https://cli.github.com/manual/gh_run_view>, <https://cli.github.com/manual/gh_run_watch>, <https://docs.github.com/en/actions/concepts/security/artifact-attestations> — Last verified: 2026-07-21.

## Safety gates an agent must enforce (condensed)

1. **Draft-first**; publish as a separate authorized action.
2. **`--verify-tag`** so a typo can't fabricate a tag off the default branch.
3. **Pin the merge-commit SHA**; tag it / `--target` it — never the moving head.
4. **Green-before-publish**: enumerate the complete expected run set for the pinned SHA, wait with `gh run watch <RUN_ID> --exit-status` when supported, then fresh-read every run's SHA/status/conclusion; any gap is `missing evidence`.
5. **Per-action authorization** for every outward write; changed plans need fresh authorization (mirrors the `gh-pr-release` Safety Contract).
6. **Never delete/move** a published tag or release — fix forward with a new version (Go: `retract`; the proxy caches tags immutably, so there is no real "undo"). See [release-safety-risks.md](release-safety-risks.md); <https://go.dev/ref/mod>, <https://boostsecurity.io/blog/dont-go-with-the-flaw> — Last verified: 2026-07-21.
7. **Least-privilege CI** (job-scoped `contents: write`); **pin action SHAs**.
8. **Treat generated notes as untrusted**; review before publish; use `.github/release.yml` excludes.

## Caveats

- Tools researched are npm/Node-centric by default; keep the skill ecosystem-neutral (don't hard-code their version-file writers).
- A few well-established facts (`fetch-depth: 0` requirement, "publishing notifies watchers", GitHub ruleset tag-protection field names) are sourced secondarily; the per-topic files flag these for primary-source confirmation before they become hard skill instructions.
- Pin the exact gh version at runtime (`gh --version`); flags above are stable across the Jun/Jul 2026 man pages but shouldn't be assumed.
