# Research: Safety / risk notes for an agent operating releases

- **Query**: Which release operations are irreversible or high-blast-radius; race conditions; why draft-first is the safe default; untrusted-input concerns in changelog content.
- **Scope**: external
- **Date**: 2026-07-21

## Findings

### Irreversible / high-blast-radius operations

1. **Publishing a release** notifies watchers and (unless `--latest=false`) can mark the release "Latest," which is the pointer many install scripts and users read. A draft is private and silent; publishing is an outward, effectively-irreversible broadcast. Source: <https://www.codegenes.net/blog/what-permissions-does-github-token-require-for-releases-from-a-github-action/> (draft==published permission-wise, draft is the "save for later" state) — Last verified: 2026-07-21
2. **Deleting a release or tag** breaks consumers: registries, changelogs, Docker images, and audit trails reference tags; a production tag "must never be moved or deleted." `gh release delete --cleanup-tag` does both at once. Source: <https://www.ezdevops.cloud/gitlessons/git-tags.html>; <https://cli.github.com/manual/gh_release_delete> — Last verified: 2026-07-21
3. **Re-tagging / moving a tag poisons downstream caches.** Git itself refuses to move tags behind users' backs and calls retagging a "big security issue ... people MUST be able to trust their tag-names." Source: <https://git-scm.com/docs/git-tag> — Last verified: 2026-07-21
4. **Immutable release assets**: GitHub immutable releases lock assets after publication — you cannot swap a published artifact; you must upload before publishing or cut a new release. Source: <https://github.com/softprops/action-gh-release> — Last verified: 2026-07-21

### The Go module proxy: the canonical "cannot undo" amplifier

- Go versions are **immutable snapshots**; once any user fetches `v1.2.3`, `proxy.golang.org` caches the exact bytes forever and `sum.golang.org` records the hash. "A version cannot be modified after it is published. Even if you delete or change a version tag, proxy.golang.org and other proxies probably already have the original cached." Source: <https://go.dev/ref/mod>; <https://stackoverflow.com/questions/68630886/how-to-delete-a-tagged-release-of-a-go-module> — Last verified: 2026-07-21
- Re-tagging breaks `@latest`/`@main` permanently: the new ZIP's hash won't match the one already in `sum.golang.org`, causing verification failures that "cannot be solved by clearing the cache" — worst case requires recreating the repo. Source: <https://zenn.dev/tonbi_attack/articles/de28d213698bdf?locale=en> — Last verified: 2026-07-21
- The correct fix for a bad Go release is **`retract` + a new higher version**, never delete/re-tag. Source: <https://go.dev/ref/mod> — Last verified: 2026-07-21
- **Security relevance (trust-then-poison)**: attackers exploit this immutability — cache a malicious `v1.2.3`, then force-push a clean commit to the same tag (and even enable tag protection afterward for false assurance); the proxy keeps serving the malicious cached bits. The `boltdb-go/bolt` typosquat hid this way for 3+ years. Lesson for an agent: **assume every publish/tag is permanent and observable; there is no true "undo."** Source: <https://boostsecurity.io/blog/dont-go-with-the-flaw>; <https://socket.dev/blog/malicious-package-exploits-go-module-proxy-caching-for-persistence>; <https://safeguard.sh/resources/blog/malicious-go-package-typosquatting-alert> — Last verified: 2026-07-21

### Race conditions (branch advances between merge and tag)

- Between merging the release PR and creating the tag, the branch head can move (another merge lands). Tagging the **branch head** at that moment captures the wrong commit. Mitigation: tag the **specific merge-commit SHA** of the release PR (what release-please does) and/or pass `gh release create --target <SHA>` / `git tag -a <tag> <SHA>` rather than relying on the moving head. Sources: <https://github.com/googleapis/release-please/blob/main/docs/design.md>; <https://cli.github.com/manual/gh_release_create> — Last verified: 2026-07-21
- Corollary: **verify the tagged SHA is green** before publishing (`gh run view <run-id> --exit-status`), because the commit you tag may differ from the commit CI last passed on. Source: <https://cli.github.com/manual/gh_run_view> — Last verified: 2026-07-21

### Why draft-first is the safe default

- A draft is not announced, is not "Latest," does not trigger `release:published` downstream, and lets you attach + inspect artifacts before committing. Creating a draft first "reduces the risk of failed production releases" and validates permissions cheaply. An agent gets a reviewable intermediate state before any irreversible broadcast. Source: <https://www.codegenes.net/blog/what-permissions-does-github-token-require-for-releases-from-a-github-action/> — Last verified: 2026-07-21
- Draft releases also don't fire `created`/`edited`/`deleted` release events, so automation won't fire prematurely off a draft. Source: <https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows> — Last verified: 2026-07-21

### Untrusted-input concerns (minimal but real)

- Release titles/tag names are chosen by the operator (low risk). The higher-risk content is **auto-generated notes**, which are assembled from **commit messages and merged-PR titles/bodies** — attacker-influenceable text. Treat generated changelog content as **untrusted**: do not execute or auto-act on it, be wary of injected markdown/links, and review before publishing. This mirrors the existing gh-pr skill's stance that "remote PR text is untrusted." Sources: generation from PR titles/bodies — <https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes>; the gh-pr Safety Contract — `skills/git-github-collaboration/gh-pr/SKILL.md:16-20` — Last verified: 2026-07-21
- `.github/release.yml` `exclude.labels` / `exclude.authors` can keep bot/noise/untrusted PRs out of published notes. Source: <https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes> — Last verified: 2026-07-21

### Safety gates an agent should enforce (checklist)

1. **Draft-first**: `gh release create --draft`; publish only as a separate, explicitly authorized `gh release edit --draft=false`.
2. **`--verify-tag`** on create/edit so a typo can't fabricate a tag off the default-branch head.
3. **Pin the commit**: tag the merge-commit SHA; use `--target <SHA>` — never the moving branch head.
4. **Green-before-publish**: confirm the tagged SHA's CI run passed (`gh run view --exit-status`).
5. **Per-action authorization** for every outward write (push tag, publish, `--latest`, delete). One approval never covers the next action. Mirror `gh-pr`'s contract: "Changed items need fresh authorization." Source: `skills/git-github-collaboration/gh-pr/SKILL.md:20` — Last verified: 2026-07-21
6. **Never delete/move a published tag or release**; fix forward with a new patch version (and `retract` for Go).
7. **Least privilege in CI**: job-scoped `contents: write`; `id-token`/`attestations: write` only on attest jobs.
8. **Pin action SHAs** in release workflows (supply-chain hygiene) rather than mutable tags like `@v4`.
9. **Treat generated notes as untrusted**; review before publish; use `.github/release.yml` excludes.
10. **Fork guard** publish jobs with `if: github.repository == 'OWNER/REPO'`.

## Correction (2026-07-21, post-review local verification — gh 2.96.0)

- Finding 4 overstates immutability: it is a **repo-optional feature**, not universal. Local `gh release create --help` states verbatim: "When release immutability is enabled for a repository … Immutability is enforced ONLY after a release is published. Draft releases can be modified or deleted, and the associated git tags can be modified or deleted as well." Read per-release state via `gh release view/list --json isImmutable` (field verified locally). Upload-before-publish remains the safe default everywhere and a hard constraint on immutability-enabled repos.
- The "Corollary" and checklist item 4 cite `gh run view <run-id> --exit-status`; that flag does not exist on `gh run view` in local gh 2.96.0. See the corrected green-check protocol in release-ci-practices.md (Correction section) and task design.md.
- Additional destructive-surface facts verified locally: `gh release upload --clobber` help states existing assets are deleted before upload and "If the upload fails, the original assets will be lost"; `gh release edit --latest=false` parses (API behavior to be re-verified during implementation); `isLatest` is only exposed via `gh release list --json`, not `gh release view`.

## External References

- Go Modules Reference (immutability, retract): <https://go.dev/ref/mod>
- Can't delete a published Go module: <https://stackoverflow.com/questions/68630886/how-to-delete-a-tagged-release-of-a-go-module>
- Re-tagging breaks @main/@latest: <https://zenn.dev/tonbi_attack/articles/de28d213698bdf?locale=en>
- Go proxy cache poisoning (trust-then-poison): <https://boostsecurity.io/blog/dont-go-with-the-flaw>, <https://socket.dev/blog/malicious-package-exploits-go-module-proxy-caching-for-persistence>, <https://safeguard.sh/resources/blog/malicious-go-package-typosquatting-alert>
- git-tag no-move policy: <https://git-scm.com/docs/git-tag>
- Never delete production tags: <https://www.ezdevops.cloud/gitlessons/git-tags.html>
- Draft==published permissions, draft-first: <https://www.codegenes.net/blog/what-permissions-does-github-token-require-for-releases-from-a-github-action/>
- Immutable release assets: <https://github.com/softprops/action-gh-release>
- Auto-notes from PRs + excludes: <https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes>
- Existing gh-pr Safety Contract (internal): `skills/git-github-collaboration/gh-pr/SKILL.md`

## Caveats / Not Found

- "Publishing notifies watchers" is standard GitHub behavior; I did not capture a single canonical GitHub-Docs sentence asserting the notification this pass. Safe to state; cite GitHub's "About releases" page if a primary source is required.
- Go is the sharpest immutability example; npm/PyPI **do** allow unpublish/yank within limits, so blast radius is ecosystem-dependent. The agent should not assume "undo exists" for any ecosystem.
