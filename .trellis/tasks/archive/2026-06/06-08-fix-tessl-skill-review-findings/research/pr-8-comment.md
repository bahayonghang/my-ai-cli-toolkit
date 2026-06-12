Thanks for the contribution and for running Tessl review on these skills.

I am not going to merge this PR as-is because the repository architecture has changed since the scan this PR was based on:

- This PR modifies the old `content/skills/...` tree.
- The current first-party skill catalog now lives under `skills/<category>/<skill-name>/SKILL.md`.
- `content/` no longer exists on `main`, so the PR is now stale and conflicting.

I reran `tessl skill review` against the current `skills/` catalog instead. The fresh scan found different current issues, mainly deterministic Tessl validation failures caused by some `allowed-tools` frontmatter values using YAML list/object syntax instead of a string. I am handling those current-architecture fixes separately rather than applying this old diff.

I am also keeping this repository's top-level `category`, `tags`, and `version` fields even though Tessl warns about them, because they are part of this repo's current local skill metadata contract.

Thanks again for the useful signal. The right follow-up is a fresh current-layout fix, not merging this stale PR.
