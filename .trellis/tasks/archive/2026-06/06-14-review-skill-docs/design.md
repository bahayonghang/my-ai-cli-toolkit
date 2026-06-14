# Design: Agent Skill Review Rename And Docs

## Boundary

The change is limited to one skill package and generated docs:

- Source package: `skills/developer-tools-integrations/guizang-review-skill/`
- Target package: `skills/developer-tools-integrations/agent-skill-review/`
- Generated docs: `docs/skills/**`, `docs/en/skills/**`, and `docs/.vitepress/generated/catalog.mjs`

Existing unrelated edits under `skills/git-github-collaboration/git-commit/` stay untouched.

## Naming

Use `agent-skill-review` as the new skill name and directory slug.

Rationale:

- It describes the capability directly: reviewing agent skill packages.
- It avoids personal or philosophy-specific branding in the public trigger surface.
- It does not collide with the existing `code-quality-review` skill, which reviews code rather than skills.

## Content Changes

- Replace public Guizang-branded headings, descriptions, report section names, and default prompts with neutral skill-review wording.
- Preserve origin only in README attribution:
  - Original upstream skill URL: `https://github.com/sugarforever/guizang-review-skill`
  - Original post: `https://x.com/op7418/status/2065232309310427565`
- Keep the existing rubric structure because it is the skill's main capability.
- Rename `**Guizang Alignment**` to a neutral alignment section that still checks whether the reviewed skill behaves like a reusable ability product.

## Docs Generation

`docs/scripts/sync_docs_catalog.py` reads `SKILL.md` frontmatter and source directories, then writes generated detail pages and sidebar data. Therefore docs must be completed by running `just docs-sync` or `python docs/scripts/sync_docs_catalog.py`; generated pages must not be hand-edited.

## Compatibility

This rename changes the invocation from `$guizang-skill-review` to `$agent-skill-review`. That is intentional because the user requested removal of Guizang branding. No compatibility alias is planned unless the user asks for one.

## Validation

- Search for stale Guizang references and old invocation names.
- Run `python scripts/check.py skills/developer-tools-integrations/agent-skill-review`.
- Run `just docs-sync`, then `just docs-check` if dependencies are available.
- Run `git diff --check` for whitespace.
