# Skills Subtree Guidelines

This `AGENTS.md` governs `skills/**` and narrows the root guidance for first-party skill packages. Root `AGENTS.md` still applies. Before broad search in this subtree, read `./code_map.md`.

## Subtree Purpose
`skills/<category>/<skill-name>/` contains installable skills with their instructions, bundled scripts, tests, references, assets, and eval fixtures.

## Local Rules
- Use kebab-case for category and skill directory names. Keep each skill rooted at `skills/<category>/<skill-name>/SKILL.md`.
- `SKILL.md` frontmatter must use top-level `name`, `description`, `category`, `tags`, and `version` fields as applicable; `category` must match the parent category directory.
- Keep runnable helpers inside the owning skill, usually under `scripts/`, and tests under `tests/`.
- Prefer updating existing references/assets/templates over introducing new dependencies or cross-skill coupling.
- When public skill metadata changes, refresh/check generated docs with `just docs-sync` or `just docs-check`.

## Verification
- For any skill metadata or `SKILL.md` change, run `just skills-check`.
- For Python helpers under `skills/**/scripts/` or Python tests, run `just python-check`.
- For Node skill tests under `skills/**/tests/*.mjs`, run `just node-test`.
- For public catalog-impacting skill changes, run `just docs-check`; use `just ci` as the final finish-line gate when feasible.
