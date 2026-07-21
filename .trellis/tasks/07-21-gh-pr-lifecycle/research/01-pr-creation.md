# Research: PR Creation Conventions (title, description, size, drafts, linking, templates)

- **Query**: PR title/description structure, size guidelines, draft PRs, linking issues, PR templates
- **Scope**: external
- **Date**: 2026-07-21

## Findings

### PR Title Conventions

- The title is the first thing a reviewer sees and sets context for the whole review; it should answer "what does this PR do?" in one line. (codefrog.app/quality-engineering/code-review/pull-request-standards)
- **Tie the title to Conventional Commits.** The PR title is often used as the squash-merge commit message, so titles should follow the same `type(scope): summary` convention as commits (e.g. `feat(auth): add OAuth login`). Mirroring the commit `Type` checklist in the PR template reinforces both practices. (tenthirtyam.org — "How to Write an Effective GitHub Pull Request Template", 2026-04-04)
- Because squash merge uses the PR title as the commit subject, a good title is load-bearing for a clean linear history.

### PR Description Structure

GitHub's own guidance: in the PR body include the **purpose**, an **overview of what changed**, and **links to context** (tracking issues, prior discussions). Build and test your own PR before requesting review. (docs.github.com/.../helping-others-review-your-changes)

Recommended 4-part structure — a good focused-PR description can be under 150 words; the point is structure, not volume (dev.to/jfgg — "How to write a good pull request description", 2026-06-18):

1. **What** — plain explanation of the problem this solves and what it does to solve it. Not a list of files, not a commit log.
2. **Why this approach** (optional) — alternatives considered and why rejected.
3. **How to test** — specific steps: which tests, where, under what conditions. Not "run the tests".
4. **Out of scope** — what this PR explicitly does not cover.
   - Optional: **Security notes** — relevant security surface and how handled, or "no security impact — [reason]".

Copilot/GitHub-recommended template sections: **What changed**, **Why** (business + technical reasoning), **Testing** (checklist), **Breaking Changes** (with migration instructions). (github.com/github/docs pull-request-assistant.md)

Anti-patterns to avoid: a description that just restates the title; a description that is a copy-pasted list of every changed file (describes _what_ changed, not _why_).

### PR Size Guidelines (small PRs)

Google eng-practices "Small CLs" (google.github.io/eng-practices/review/developer/small-cls.html):

- Small CLs are reviewed more quickly, get more thorough review, are less likely to introduce bugs, are easier to merge, easier to design well, and block less on review.
- **Right size = one self-contained change** that addresses just one thing (usually one part of a feature, not a whole feature).
- No hard rule, but rough thresholds: **~100 lines is a reasonable CL size; ~1000 lines is usually too large.** Number of files matters too — 200 lines in 1 file may be fine; 200 lines across 50 files is usually too large.
- "When in doubt, write CLs smaller than you think you need. Reviewers rarely complain about CLs that are too small."
- Chromium guidance: **keep changes under 500 LoC including tests**, but with balance — 200 LoC production + 600 LoC regular-pattern tests can be fine; 400 LoC production + 200 LoC tests may be under-tested. Split larger changes into reviewable units tagged with the same tracking bug. (chromium docs/cl_tips.md)
- Data point: at Google, >35% of changes modify a single file, ~90% modify fewer than 10 files, median change is 24 lines. (Sadowski et al., "Modern Code Review", 2018)

### Draft PRs

- Mark work-in-progress PRs as draft so reviewers know it is not ready for final review (`--draft` flag / "Create draft pull request"). Draft PRs cannot be merged until marked ready for review. (docs.github.com creating-a-pull-request)

### Linking Issues (closing keywords)

(docs.github.com/.../linking-a-pull-request-to-an-issue)

- Use a closing keyword + issue number in the **PR description** to auto-close the issue when the PR merges: `Closes #123`, `Fixes #123`, `Resolves #123`.
- Supported keywords: `close`, `closes`, `closed`, `fix`, `fixes`, `fixed`, `resolve`, `resolves`, `resolved`.
- **Critical constraint:** keywords are interpreted **only when the PR targets the repository's default branch.** If the PR targets any other branch, the keywords are ignored and no link/auto-close happens.
- Cross-repo syntax: `Closes owner/repo#123`. You can link up to 10 issues per PR.
- Auto-close can be disabled repo-wide in Settings > General > Issues.

### PR Templates

(docs.github.com/.../creating-a-pull-request-template-for-your-repository; codefrog.app)

- Place a template at `.github/pull_request_template.md` (or `PULL_REQUEST_TEMPLATE.md`, or in a hidden `.github/` dir); GitHub auto-populates the PR body from it.
- Multiple templates: put files in a `PULL_REQUEST_TEMPLATE/` subdirectory and select via the `template` query parameter.
- Templates become available to collaborators only once merged into the default branch.
- Good template design: ask for only the info reviewers need; each section gets a clear heading and a short HTML comment (`<!-- ... -->`, invisible when rendered) explaining what belongs there. The template is a guide, not a burden — authors should **delete** inapplicable sections rather than fill them with "N/A".
- Typical sections: Summary, Related issues (`Closes #N`), Changes (bullets), How to test, Screenshots (before/after for UI), Checklist (tests pass, docs updated, accessibility).

## Caveats / Not Found

- Line-count thresholds are guidance, not hard rules — reviewer discretion governs. The commonly cited "200-400 line" range aligns with Google's ~100 (ideal) to <500 (Chromium ceiling) band rather than a single authoritative number.
