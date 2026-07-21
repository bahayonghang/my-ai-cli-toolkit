# Research: gh CLI release commands

- **Query**: `gh release create` flags that matter; `gh release upload/edit/view/list/download/delete`; which are destructive; `.github/release.yml`; behavior when the tag doesn't exist yet. Verified against current gh CLI docs (2026).
- **Scope**: external
- **Date**: 2026-07-21

## Findings

### `gh release create <tag> [files...]` — key flags

Verified against the official manual (<https://cli.github.com/manual/gh_release_create>) and 2026 man pages (Ubuntu noble, Debian unstable, openSUSE) — Last verified: 2026-07-21.

| Flag                           | Meaning                                                                                                                       |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `-d, --draft`                  | Save as draft instead of publishing (safe default for an agent).                                                              |
| `-p, --prerelease`             | Mark as prerelease.                                                                                                           |
| `--latest` / `--latest=false`  | Force / prevent marking this release "Latest" (default: automatic by date+version).                                           |
| `--verify-tag`                 | **Abort if the git tag does not already exist on the remote** — prevents gh from silently creating a tag.                     |
| `--target <branch\|SHA>`       | Commit/branch to create the tag from when it doesn't exist yet (default: main branch head). Pin a SHA to avoid a moving head. |
| `--generate-notes`             | Auto-generate title + notes via GitHub Release Notes API (honors `.github/release.yml`).                                      |
| `--notes-start-tag <tag>`      | Starting point for generated notes (overrides "previous tag" auto-detection).                                                 |
| `--notes-from-tag`             | Use the annotated tag's message (or the commit message if lightweight) as the notes.                                          |
| `-n, --notes <text>`           | Explicit notes; can be _prepended_ to `--generate-notes` output.                                                              |
| `-F, --notes-file <file>`      | Read notes from a file (`-` = stdin).                                                                                         |
| `-t, --title <text>`           | Release title (auto-generated with `--generate-notes` if omitted).                                                            |
| `--fail-on-no-commits`         | Fail if there are no commits since the last release (no effect on the first release).                                         |
| `--discussion-category <name>` | Open a discussion in that category on publish.                                                                                |

Examples: `gh release create v1.2.3 --generate-notes`; `gh release create v1.2.3 --notes-from-tag`; `gh release create v1.2.3 --latest=false`. Source: <https://manpages.ubuntu.com/manpages/noble/man1/gh-release-create.1.html> — Last verified: 2026-07-21

### Behavior when the tag does not exist yet (important)

- "If a matching git tag does not yet exist, **one will automatically get created from the latest state of the default branch**. Use `--target` to point to a different branch or commit ... Use `--verify-tag` to abort the release if the tag doesn't already exist." Source: <https://cli.github.com/manual/gh_release_create> — Last verified: 2026-07-21
- To release **from an annotated tag**: create it locally, push it, then run `gh release create`; add `--notes-from-tag` to reuse its message. To fetch the auto-created tag back locally: `git fetch --tags origin`. Source: <https://cli.github.com/manual/gh_release_create> — Last verified: 2026-07-21
- **Agent implication**: an agent that means to release an _already-tagged, already-green_ commit should pass `--verify-tag` so a typo can't cause gh to fabricate a brand-new tag off the default branch head.

### `gh release upload <tag> <files...>` — attach artifacts

- Uploads assets to an existing release; supports `--clobber` to overwrite existing assets of the same name. Pairs with draft-first: create the draft, `upload` artifacts, then publish. (Command family confirmed via the release manual index and managing-releases docs.) Source: <https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository?tool=cli> — Last verified: 2026-07-21

### `gh release edit <tag>` — mutate an existing release (incl. publish a draft)

- Flags: `--draft` / `--draft=false` (the latter **publishes a draft**), `--prerelease`, `--latest`, `--tag <new>`, `--target <branch|SHA>`, `-t/--title`, `-n/--notes`, `-F/--notes-file`, `--verify-tag`, `--discussion-category`. Source: <https://cli.github.com/manual/gh_help_reference> — Last verified: 2026-07-21
- Canonical publish-a-draft command: `gh release edit v1.0 --draft=false`. Update notes from a file: `gh release edit v1.0 --notes-file /path/to/notes.md`. Source: <https://man.archlinux.org/man/gh-release-edit.1.en.raw> (Jul 2026) — Last verified: 2026-07-21

### Read-only / non-destructive

- `gh release view [<tag>]` — show a release (add `--web`, or `--json` for fields). Non-destructive.
- `gh release list` — list releases (`--limit`, `--json`). Non-destructive.
- `gh release download [<tag>]` — download assets (`--pattern`, `--dir`, `--archive`). Non-destructive (writes only local files).
  Source: <https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository?tool=cli> and manual index <https://cli.github.com/manual/gh_help_reference> — Last verified: 2026-07-21

### Destructive commands (require explicit per-action authorization)

- `gh release delete <tag> [--cleanup-tag] [-y/--yes]` — deletes the release; `--cleanup-tag` **also deletes the git tag**; `-y` skips the confirmation prompt. Source: <https://cli.github.com/manual/gh_release_delete> — Last verified: 2026-07-21
- `gh release delete-asset <tag> <asset-name> [-y/--yes]` — deletes a single asset. Source: <https://cli.github.com/manual/gh_release_delete-asset> — Last verified: 2026-07-21
- `gh release edit --draft=false` (publishing) and `--latest` are **effectively irreversible outward actions** — publishing notifies watchers and can move the "Latest" pointer (see release-safety-risks.md).
- Exit codes (gh, Jun/Jul 2026 man pages): `0` success, `1` error, `2` command canceled, `4` authentication required. An agent should treat `2` as "user/prompt declined," not retry. Source: <https://man.archlinux.org/man/gh-release-delete.1.en.txt> — Last verified: 2026-07-21

### Destructiveness ranking (for authorization gating)

| Command                                              | Destructive? | Blast radius                                     |
| ---------------------------------------------------- | ------------ | ------------------------------------------------ |
| `gh release view/list/download`                      | No           | local only                                       |
| `gh release create --draft`                          | Low          | private draft; no notifications                  |
| `gh release upload` (to draft)                       | Low          | mutates draft assets                             |
| `gh release create` (publish) / `edit --draft=false` | **High**     | notifies watchers, may set "Latest"              |
| `gh release edit --latest`                           | High         | moves the "Latest" pointer consumers read        |
| `gh release delete-asset`                            | High         | breaks download URLs for that asset              |
| `gh release delete [--cleanup-tag]`                  | **Highest**  | removes release (+ tag); breaks consumers/caches |

### `.github/release.yml` — auto-generated notes config

Controls what `--generate-notes` (and the UI "Generate release notes") produces. Source: <https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes> — Last verified: 2026-07-21

| Parameter                                 | Description                                                             |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| `changelog.exclude.labels`                | Labels that exclude a PR from the notes entirely.                       |
| `changelog.exclude.authors`               | User/bot logins whose PRs are excluded.                                 |
| `changelog.categories[*].title`           | **Required.** Section title.                                            |
| `changelog.categories[*].labels`          | **Required.** Labels that place a PR in this category; `*` = catch-all. |
| `changelog.categories[*].exclude.labels`  | Labels excluding a PR from this category.                               |
| `changelog.categories[*].exclude.authors` | Logins excluded from this category.                                     |

Example:

```yaml
# .github/release.yml
changelog:
  exclude:
    labels: [ignore-for-release]
    authors: [octocat]
  categories:
    - title: Breaking Changes 🛠
      labels: [Semver-Major, breaking-change]
    - title: Exciting New Features 🎉
      labels: [Semver-Minor, enhancement]
    - title: Other Changes
      labels: ["*"]
```

Source: <https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes> — Last verified: 2026-07-21

## External References

- gh release create (manual): <https://cli.github.com/manual/gh_release_create>
- gh full reference (create/edit/delete flag lists): <https://cli.github.com/manual/gh_help_reference>
- gh release create man page (examples): <https://manpages.ubuntu.com/manpages/noble/man1/gh-release-create.1.html>
- gh release edit man page (Jul 2026, `--draft=false`): <https://man.archlinux.org/man/gh-release-edit.1.en.raw>
- gh release delete (`--cleanup-tag`, `-y`): <https://cli.github.com/manual/gh_release_delete>
- gh release delete-asset: <https://cli.github.com/manual/gh_release_delete-asset>
- Managing releases with the CLI (create/edit/delete/upload/download): <https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository?tool=cli>
- Auto-generated release notes config: <https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes>

## Caveats / Not Found

- `gh release upload --clobber` and `gh release download` flag details are stated from the docs index/general knowledge; the dedicated `gh_release_upload` / `gh_release_download` manual pages were not fetched verbatim this pass. Confirm exact flag spellings against `cli.github.com/manual/gh_release_upload` before hard-coding.
- gh CLI version: flags above are stable across the 2026 man pages (Jun/Jul 2026 dates). The task's "gh ~2.9x" framing is consistent with these; pin the exact local version with `gh --version` at skill runtime rather than assuming.
- `--notes-from-tag` wording differs slightly between mirrors ("fetch notes from the tag annotation or message of commit associated with tag" vs "automatically generate notes from annotated tag"); the official manual's phrasing is authoritative.

## Local verification: gh 2.96.0 on Windows

Last verified: 2026-07-21.

- `gh release create --help` locally exposes `--draft`, `--verify-tag`, `--generate-notes`, `--notes-start-tag`, `--notes-from-tag`, `--notes-file`, `--prerelease`, `--latest`, `--target`, and `--fail-on-no-commits`. The help explicitly documents `--latest=false`.
- `gh release edit --help` locally exposes `--draft`, `--latest`, `--prerelease`, `--target`, and `--verify-tag`, and gives `gh release edit v1.0 --draft=false` as the publish example. `--latest=false` parses as a boolean-form flag, but its API effect was not exercised because this task has no authorized mutable test release: **missing evidence** for live mutation behavior.
- `gh release upload --help` states that `--clobber` deletes existing assets before uploading replacements. This supports the separate destructive authorization gate.
- `gh release download --help` confirms `--archive`, `--dir`, `--pattern`, and `--skip-existing`. The inspected repository run `29802619011` had zero artifacts, so an actual `gh run download RUN_ID` transfer remains **missing evidence**; only its CLI contract was verified.
- A read-only query of `cli/cli` release `v2.96.0` returned `isDraft=false`, `isPrerelease=false`, `isImmutable=true`, `tagName`, `url`, and `assets` from `gh release view`. `gh release list --json` returned `isLatest=true` alongside `isImmutable`, confirming that `isLatest` belongs to the list field set used by the design.
- `gh run list --commit` supports `--branch`, `--commit`, `--workflow`, and JSON output. A real read of run `29802619011` returned `workflowName=CI`, the pinned `headSha`, `status=completed`, `conclusion=success`, and `event=pull_request`.
- `gh run watch --exit-status` exists, but its help explicitly says the command cannot authenticate with fine-grained PATs because `checks:read` cannot currently be granted. `gh run view` exposes `--json` and `--log-failed`; it has no `--exit-status` flag.
- Read-only `git ls-remote --tags` checks confirmed both tag shapes. `git/git` tag `refs/tags/v2.23.4` returned tag-object OID `79e24491...` plus peeled `refs/tags/v2.23.4^{}` commit OID `d60b6a96...`; `cli/cli` lightweight tag `refs/tags/v0.11.0` returned only direct commit OID `1f97a9a4...`. The implementation must therefore use peeled OID when present and direct OID otherwise.
