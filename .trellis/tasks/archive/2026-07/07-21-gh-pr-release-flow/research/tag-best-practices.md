# Research: Git tag best practices for releases

- **Query**: Annotated vs lightweight tags, semver `v` prefix, signed tags, protected tags/rulesets, dangers of deleting/re-pushing, tagging merge commit vs branch head, `git tag -a ... && git push origin <tag>` vs `--tags`.
- **Scope**: external
- **Date**: 2026-07-21

## Findings

### Annotated vs lightweight — use annotated for releases

- **Annotated** tags (`-a`, `-s`, or `-u`) are full Git objects storing tagger name/email, date, a message, and an optional signature. **Lightweight** tags are just a name pointing at a commit — no metadata. Source: <https://git-scm.com/docs/git-tag> — Last verified: 2026-07-21
- Git's own docs: "Annotated tags are meant for release while lightweight tags are meant for private or temporary object labels." Commands like `git describe` **ignore lightweight tags by default**. Source: <https://git-scm.com/docs/git-tag> — Last verified: 2026-07-21
- "It's generally recommended that you create annotated tags so you can have all this information." Source: <https://git-scm.com/book/en/v2/Git-Basics-Tagging> — Last verified: 2026-07-21
- Practical release rule + a validation snippet to reject lightweight tags: `TAG_TYPE=$(git cat-file -t "$TAG_NAME")` must equal `tag` (a lightweight tag returns `commit`). Source: <https://how2.sh/posts/how-to-git-version-control-release-tags-semver/> — Last verified: 2026-07-21
- Create: `git tag -a v1.3.0 -m "Release v1.3.0: ..."`. Source: <https://how2.sh/posts/how-to-git-version-control-release-tags-semver/> — Last verified: 2026-07-21

### Semver + `v` prefix convention

- Format `MAJOR.MINOR.PATCH` with optional pre-release suffix `-alpha.1` / `-beta.1` / `-rc.1`; full semver is `MAJOR.MINOR.PATCH{-PRERELEASE}{+BUILDMETADATA}`. Pre-releases have lower precedence than the associated normal version. Source: <https://semver.org> via <https://how2.sh/posts/how-to-git-version-control-release-tags-semver/> — Last verified: 2026-07-21
- **`v` prefix**: convention varies. Go modules **require** it (`v1.2.3`); npm `package.json` versions do not use it, though many repos still tag with `v`. Pick one and enforce it via regex. Source: <https://how2.sh/posts/how-to-git-version-control-release-tags-semver/> — Last verified: 2026-07-21
- DevOps rule of thumb: always prefix with `v` so version tags are visually distinct from branches/build numbers in logs, CI, and registries. Source: <https://www.ezdevops.cloud/gitlessons/git-tags.html> — Last verified: 2026-07-21
- Correct semver sort (needed because `v1.0.0-beta.10` naively sorts before `v1.0.0-beta.2`): `git tag --sort=-v:refname` (Git 2.12+). Source: <https://how2.sh/posts/how-to-git-version-control-release-tags-semver/> — Last verified: 2026-07-21

### Signed tags (supply-chain authenticity)

- `-s` (or `-u <key>`) creates a cryptographically signed tag object; signing backend (GPG/X.509/SSH) is set by `gpg.format` (default OpenPGP). Source: <https://git-scm.com/docs/git-tag> — Last verified: 2026-07-21
- Verify with `git tag -v v1.2.3` ("Good signature from ..."); GitHub/GitLab show a "Verified" badge. Setup: `git config --global user.signingkey <KEY>` then `git config --global tag.gpgSign true` so `git tag -a` auto-signs. For CI: only deploy tags with valid signatures from authorized keys — this blocks an attacker who can push from forging a release. Source: <https://www.ezdevops.cloud/gitlessons/git-tags.html> — Last verified: 2026-07-21
- Signatures do not survive `git filter-branch`, so a signed-release policy lets you detect a rewritten/bogus release tag. Source: <https://stackoverflow.com/questions/4971746/why-should-i-care-about-lightweight-vs-annotated-tags> — Last verified: 2026-07-21

### Protected tags / rulesets (server-side enforcement)

- GitHub supports **tag protection** so only authorized actors can create/update/delete tags matching a pattern (e.g. `v*`); rulesets can require signatures and restrict who may push tags. (See safety notes: attackers may enable tag protection _after the fact_ to fake trustworthiness — protection is necessary but not sufficient.) Source: <https://boostsecurity.io/blog/dont-go-with-the-flaw> — Last verified: 2026-07-21

### Dangers of deleting / re-pushing / moving tags

- Git deliberately will not move a tag behind users' backs: "if somebody already got the old tag, doing a `git pull` shouldn't just make them overwrite the old one." Retagging something others already fetched is a "big security issue ... people MUST be able to trust their tag-names," requiring a public announcement if ever done. Source: <https://git-scm.com/docs/git-tag> — Last verified: 2026-07-21
- **Never delete and recreate a tag pointing at a different commit** — consumers may have cached the old tag. Bump to a new version instead. Source: <https://how2.sh/posts/how-to-git-version-control-release-tags-semver/> — Last verified: 2026-07-21
- A production tag "must never be moved or deleted" — registries, changelogs, Docker images, and audit trails reference it; fix mistakes with a new patch tag. Source: <https://www.ezdevops.cloud/gitlessons/git-tags.html> — Last verified: 2026-07-21
- Deleting a remote tag leaves stale local copies on other machines until they run `git fetch --prune --prune-tags`; the remote-delete form is `git push origin :refs/tags/v1.0.0`. Source: <https://how2.sh/posts/how-to-git-version-control-release-tags-semver/> — Last verified: 2026-07-21
- (Ecosystem amplifier, detailed in release-safety-risks.md) Go's module proxy caches tagged versions **immutably**; deleting/moving a tag does nothing to the cached bits. Source: <https://go.dev/ref/mod> — Last verified: 2026-07-21

### Tag the merge commit vs branch head

- release-please tags **the merge-commit SHA of the release PR** (`Create a new GitHub release that tags the SHA of the pull request's merge commit`). Tagging the exact merged commit — rather than whatever the branch head happens to be at tag time — avoids a race where the branch advanced after merge. Source: <https://github.com/googleapis/release-please/blob/main/docs/design.md> — Last verified: 2026-07-21
- `gh release create` defaults the auto-created tag to "the latest state of the default branch"; use `--target <SHA>` to pin the exact commit instead of the moving branch head. Source: <https://cli.github.com/manual/gh_release_create> — Last verified: 2026-07-21

### Pushing tags: one tag, not `--tags`

- `git push` does **not** transfer tags by default; you must push explicitly, e.g. `git push origin v1.3.0`. Source: <https://git-scm.com/book/en/v2/Git-Basics-Tagging> — Last verified: 2026-07-21
- `git push --tags` pushes **both** lightweight and annotated tags (all of them) — this is why "`--tags` considered harmful": it can leak local/experimental lightweight tags to the remote. `git push --follow-tags` pushes only annotated tags reachable from the pushed commits — a safer bulk option, but pushing the single named tag is the most surgical. Source: <https://git-scm.com/book/en/v2/Git-Basics-Tagging> — Last verified: 2026-07-21

### Recommended tag recipe for the skill

```bash
git tag -a v1.3.0 <merge-commit-sha> -m "Release v1.3.0"   # annotated, pinned to merged commit
git tag -v v1.3.0                                          # (if signing) verify
git push origin v1.3.0                                     # push the single tag, never --tags
```

## External References

- git-tag docs (annotated/lightweight/signed, no-move policy): <https://git-scm.com/docs/git-tag>
- Pro Git — Tagging (push behavior, `--tags`/`--follow-tags`, delete): <https://git-scm.com/book/en/v2/Git-Basics-Tagging>
- Semver release tags how-to (v-prefix, sort, validation, retag danger): <https://how2.sh/posts/how-to-git-version-control-release-tags-semver/>
- Git Tags Guide 2026 (annotated recommended, never delete prod, signing setup): <https://www.ezdevops.cloud/gitlessons/git-tags.html>
- Lightweight vs annotated rationale: <https://stackoverflow.com/questions/4971746/why-should-i-care-about-lightweight-vs-annotated-tags>
- release-please tagging the merge-commit SHA: <https://github.com/googleapis/release-please/blob/main/docs/design.md>

## Caveats / Not Found

- Exact GitHub **ruleset** UI/field names for tag protection were not fetched from GitHub Docs directly this pass (referenced via the boostsecurity article). Verify field names against GitHub Docs "Managing rulesets" before writing skill instructions that name specific UI toggles.
- Whether to sign tags is repo-policy-dependent; the skill should treat signing as optional/config-gated, not mandatory.
