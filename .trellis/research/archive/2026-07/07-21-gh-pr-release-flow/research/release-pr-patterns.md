# Research: Release PR patterns (release-please / changesets / semantic-release / git-flow)

- **Query**: How do release-please, changesets, and semantic-release structure the release flow? Which "Release PR" pattern fits a manually-operated gh-CLI skill best (no bot infrastructure)?
- **Scope**: external
- **Date**: 2026-07-21

## Findings

### The "Release PR" pattern in one sentence

A long-lived pull request accumulates the version bump + changelog for the _next_ release; the release itself (tag + GitHub Release) is **only cut when a human merges that PR**. This decouples "deciding what the next version is" (continuous, automated) from "publishing it" (a deliberate, gated human action).

### release-please (googleapis) — manifest/config + persistent Release PR

- Parses git history for [Conventional Commits](https://www.conventionalcommits.org/), then **maintains** a single open Release PR ("chore: release x.y.z") that proposes the version bump and appends notes to `CHANGELOG.md`. The PR is kept up to date as more commits land; releases are not created until it is merged. Source: <https://github.com/googleapis/release-please/blob/main/docs/design.md> — Last verified: 2026-07-21
- On merge, release-please: (1) updates the changelog/language files, (2) **tags the merge-commit SHA** with the version, (3) creates a GitHub Release from that tag using the parsed PR-body notes. Source: <https://github.com/googleapis/release-please> — Last verified: 2026-07-21
- State is tracked with labels: `autorelease: pending` (PR open, pre-merge) -> `autorelease: tagged` (merged + tagged) -> `autorelease: published` (recommended convention, _not_ auto-added by release-please — left for downstream publish tooling). Source: <https://github.com/googleapis/release-please> — Last verified: 2026-07-21
- Config lives in `release-please-config.json` + `.release-please-manifest.json`; the Action is `google-github-actions/release-please-action@v4` and typically runs `on: push: branches: [main]`. Source: <https://bohobot.com/posts/tech-logs/part-3-automating-releases-release-please/> — Last verified: 2026-07-21
- Manual override: a commit body containing `Release-As: x.x.x` forces a Release PR for that version. Source: <https://github.com/googleapis/release-please> — Last verified: 2026-07-21

### changesets — intent files + two-phase "Version Packages" PR

- Developers **declare intent** during normal work: `npx changeset` writes a `.changeset/<slug>.md` describing the change + bump level (major/minor/patch). Intent is explicit, not inferred from commits. Source: <https://xnok.github.io/infra-bootstrap-tools/blog/intentional-releases-changesets/> — Last verified: 2026-07-21
- The `changesets/action@v1` GitHub Action, when it sees unconsumed `.changeset` files on `main`, opens/updates a **"Version Packages" PR** that bumps versions, rewrites each `CHANGELOG.md`, and consumes (deletes) the changeset files. Merging that PR triggers publish (or, for non-npm, pushes tags that downstream workflows listen for). Source: <https://xnok.github.io/infra-bootstrap-tools/blog/intentional-releases-changesets/> — Last verified: 2026-07-21
- **Security advantage of the two-phase split**: the Version PR needs only push access; publish requires a human to merge that PR. A malicious dependency executing during version-PR creation cannot publish on its own. Uses `GITHUB_TOKEN` for the Version PR and a separate `NPM_TOKEN` only at publish. Source: <https://www.pkgpulse.com/guides/semantic-release-vs-changesets-vs-release-it-release-2026> — Last verified: 2026-07-21
- changesets "goes no further" than versions + `CHANGELOG.md` + git tags; pushing the tags is what triggers dedicated downstream publish workflows (Docker/PyPI/Ansible Galaxy, etc.). Source: <https://xnok.github.io/infra-bootstrap-tools/blog/intentional-releases-changesets/> — Last verified: 2026-07-21

### semantic-release — NO Release PR (direct publish on push)

- On every push to a release branch (`main`, `next`, `beta`, ...), CI runs `semantic-release`, which analyzes commits, computes the next semver, generates notes, **creates the git tag, and publishes directly** — no intervening PR, no human gate. Steps: Verify Conditions -> Get last release -> Analyze commits -> Verify release -> Generate notes -> Create Git tag -> Prepare -> Publish -> Notify. Source: <https://github.com/semantic-release/semantic-release/> — Last verified: 2026-07-21
- Positioning in 2026: semantic-release = fully hands-off CI/CD; changesets = team/OSS PR-based; release-it = flexible manual CLI. Source: <https://www.pkgpulse.com/guides/semantic-release-vs-changesets-vs-release-it-release-2026> — Last verified: 2026-07-21

### Plain git-flow release branches (no tool)

- Cut `release/x.y.z` from the mainline, stabilize, bump version + finalize changelog on that branch, then merge to `main` and **tag the merge commit**, and back-merge to `develop`/`main`. The "Release PR" is simply the `release/x.y.z -> main` PR; tagging and GitHub Release creation are manual (`git tag -a` + `gh release create`). This is the pattern a manual gh-CLI skill most naturally emulates — no bot, no config files, the PR _is_ the gate.

### Comparison for a manually-operated gh-CLI skill (no bot infra)

| Aspect                    | release-please         | changesets                  | semantic-release       | plain git-flow / manual gh                 |
| ------------------------- | ---------------------- | --------------------------- | ---------------------- | ------------------------------------------ |
| Human gate before publish | Yes (merge Release PR) | Yes (merge Version PR)      | **No** (auto on push)  | Yes (merge release PR)                     |
| Requires a bot/Action     | Yes                    | Yes                         | Yes                    | **No**                                     |
| Version source            | Conventional Commits   | explicit `.changeset` files | Conventional Commits   | human decision                             |
| Tags                      | merge-commit SHA       | pushed by action            | created by tool        | `git tag -a` by operator                   |
| Notes source              | parsed PR body         | `CHANGELOG.md`              | generated              | `--generate-notes` / `.github/release.yml` |
| Fit for a gh-CLI skill    | pattern to mimic       | pattern to mimic            | anti-pattern (no gate) | **best fit**                               |

### Recommendation for the skill

Mimic the **Release PR pattern without the bot**: (1) skill opens a "release PR" that bumps the version file(s) and updates `CHANGELOG.md`, (2) a human reviews/merges it, (3) post-merge the skill creates an **annotated tag on the merge commit** and a **draft** GitHub Release (notes via `--generate-notes` / `.github/release.yml`), (4) a human/authorized step publishes. This reproduces the human gate and the two-phase split that make changesets/release-please safe, while assuming no bot infrastructure. semantic-release's no-PR direct-publish model is explicitly the wrong fit — it removes the human gate an agent-operated skill most needs.

## External References

- release-please design: <https://github.com/googleapis/release-please/blob/main/docs/design.md>
- release-please README (labels, Release-As): <https://github.com/googleapis/release-please>
- changesets intent workflow: <https://xnok.github.io/infra-bootstrap-tools/blog/intentional-releases-changesets/>
- Tool comparison 2026 (security of two-phase split): <https://www.pkgpulse.com/guides/semantic-release-vs-changesets-vs-release-it-release-2026>
- semantic-release release steps: <https://github.com/semantic-release/semantic-release/>
- release-please Action wiring example: <https://bohobot.com/posts/tech-logs/part-3-automating-releases-release-please/>

## Caveats / Not Found

- All four tools are **npm/Node-centric by default** (release-please and changesets support other ecosystems via config/plugins; semantic-release via plugins). A gh-CLI skill for a mixed repo should not adopt their language-specific version-file writers wholesale.
- The "merge triggers tag" step in release-please/changesets is executed **by their GitHub Action**, not by the merge itself. A bot-free skill must perform the post-merge tag/release step explicitly (an operator action), which is the core adaptation.
