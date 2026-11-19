# Migration From gh-pr 2.0.0

`gh-pr-release` 3.0.0 is the major-version successor to `gh-pr` 2.0.0. It keeps
the six PR routes and adds release PR preparation plus tag, GitHub Release,
asset, and release-CI handling.

## Breaking Changes

- The skill and package name changes from `gh-pr` to `gh-pr-release`.
- Explicit invocations must use `$gh-pr-release`.
- Local install paths and catalog references must use `gh-pr-release`.
- The verified target set is `claude`, `openai`, and `generic`. The v2 registry
  baseline listed `vscode` as missing compatibility; v3 does not claim that
  unverified target.
- Release writes introduce independent authorization gates. PR merge approval
  does not authorize tag push, Release creation, asset upload, publish,
  prerelease, or Latest changes.

## New Routes

| Request | Route |
| --- | --- |
| Prepare a version/changelog PR | `references/release-pr.md` |
| Tag, draft/publish, upload assets, or monitor release CI | `references/release-publish.md` |

The original create, review, merge, respond, address-comments, and fix-ci routes
remain available under the new package name.

## Migration Steps

1. Remove or disable the local `gh-pr` 2.0.0 installation.
2. Install `gh-pr-release` 3.0.0 and verify the generic adapter permission
   contract for `file_write` and `subprocess`.
3. Update explicit skill references from `$gh-pr` to `$gh-pr-release`.
4. Re-evaluate repository release topology before the first release operation.
   Automation-owned, tag-workflow-owned, and manual release paths are mutually
   exclusive; ambiguity stops execution.
5. Re-authorize every remote write at the new boundary. Prior approvals do not
   carry across drift or across PR, tag, draft, upload, publish, prerelease, and
   Latest actions.

## Known Limitations

- Output comparisons use recorded fixtures. Human adjudication and
  provider-backed execution are `missing evidence`.
- Adoption telemetry is `no-data`; no real-client adoption claim is made.
- The generic target exposes permission metadata and installer enforcement, but
  no client-native enforcement evidence is available.
- Portfolio-wide owner, staleness, and route-collision findings in Skill Atlas
  are outside this package migration.
- Public world-class readiness is not claimed.

## Rollback

Before remote writes, reinstall `gh-pr` 2.0.0 to restore the PR-only package.
Published tags and Releases are outside rollback: never delete, move, or re-push
a published tag or delete a published Release. Publish a new version instead.
