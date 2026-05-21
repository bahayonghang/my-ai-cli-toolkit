# Codex Skills Recommendations

Use this reference when a repeated workflow should become a Codex skill instead of a paragraph in `AGENTS.md`.

## Codex Skill Roots

Inspect the current environment before giving exact paths. Common roots include:

| Root | Use |
|---|---|
| `~/.codex/skills` | user/system Codex skills |
| `.codex/skills` | project-local Codex skills checked into or carried with a repo |
| `~/.agents/skills` | shared local install root used by some cross-platform managers |

Each skill must have a `SKILL.md` entrypoint. Optional resources live beside it:

```text
my-skill/
  SKILL.md
  references/
  scripts/
  assets/
```

## When to Recommend a Skill

| Signal | Skill candidate |
|---|---|
| repeated multi-step task | workflow skill |
| fragile command sequence | skill with script or checklist |
| project-specific conventions | guidance/reference skill |
| template-heavy output | skill with assets/templates |
| external artifact format | tool-specific skill |
| recurring review mode | review or audit skill |

Do not recommend a skill for one-off knowledge that belongs in `AGENTS.md` or ordinary docs.

## Skill Ideas by Codebase Signal

### API projects

**Skill**: `api-doc-auditor`

Use when API routes, OpenAPI files, or endpoint docs need recurring review.

Resources:

```text
.codex/skills/api-doc-auditor/
  SKILL.md
  references/openapi-style.md
  scripts/check-openapi.py
```

### Database projects

**Skill**: `migration-checker`

Use when migrations need repeated safety checks.

Resources:

```text
.codex/skills/migration-checker/
  SKILL.md
  scripts/validate-migration.sh
  references/schema-policy.md
```

### Frontend projects

**Skill**: `ui-smoke-verifier`

Use when every UI change should run a browser-backed smoke path and screenshot capture.

Resources:

```text
.codex/skills/ui-smoke-verifier/
  SKILL.md
  references/local-app-start.md
  scripts/capture-smoke.mjs
```

### Release workflows

**Skill**: `release-readiness`

Use when release notes, changelog, version sync, and verification gates repeat.

Resources:

```text
.codex/skills/release-readiness/
  SKILL.md
  references/release-checklist.md
```

### Repo onboarding

**Skill**: `setup-dev`

Use when setup has platform-specific prerequisites or bootstrap order.

Resources:

```text
.codex/skills/setup-dev/
  SKILL.md
  scripts/check-prereqs.py
  references/troubleshooting.md
```

## Frontmatter Guidance

Use concise frontmatter that helps Codex trigger the skill:

```yaml
---
name: migration-checker
description: Validate database migrations for this repository. Use when editing migrations, reviewing schema changes, or preparing a release that touches database structure.
---
```

For this repository's public skill catalog, also include top-level metadata such as `version`, `category`, and `tags` when required by the repo validator.

## Recommendation Snippet

```markdown
#### Skills
1. **migration-checker**
   - Evidence: migrations are frequent and require manual safety checks.
   - Why a skill: the workflow repeats and benefits from bundled validation scripts.
   - Suggested location: `.codex/skills/migration-checker/SKILL.md` for project-local use.
   - Verification: run the bundled script on one existing migration and document the expected output.
```

## Skill vs AGENTS.md vs Subagent

| Need | Prefer |
|---|---|
| short global rule | `AGENTS.md` |
| repeated procedure with resources | skill |
| specialized independent worker role | native subagent |
| team-distributed bundle | plugin |
| external service access | MCP server |
