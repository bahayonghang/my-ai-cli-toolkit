# Current Evidence

- Date: 2026-06-06
- Scope: `skills/development-workflows/geju`

## Files Present

The skill package currently contains:

- `skills/development-workflows/geju/SKILL.md`
- `skills/development-workflows/geju/references/output-template.md`
- `skills/development-workflows/geju/agents/openai.yaml`

## Language Findings

Command:

```powershell
rg -n "[^\x00-\x7F]" .\skills\development-workflows\geju
```

Findings:

- `SKILL.md` line 3 contains non-English trigger text.
- `SKILL.md` line 10 contains mixed-language prose.
- `SKILL.md` line 14 contains a non-English core principle.
- `SKILL.md` line 154 contains mixed-language thesis wording.
- `references/output-template.md` line 6 contains a non-English title.
- `references/output-template.md` line 20 contains mixed-language heading text.

## Cross-Skill Reference Findings

Command:

```powershell
rg -n "clean-code-reviewer|hai-architecture|hai-prd|code-auditor|code-quality-review|spark|cold-shower|\$[a-z0-9-]+" .\skills\development-workflows\geju
```

Findings:

- `SKILL.md` line 201 references a nonexistent implementation-quality review skill.
- `SKILL.md` line 202 references a nonexistent architecture review skill.
- `SKILL.md` line 203 references a nonexistent PRD writing skill.
- `agents/openai.yaml` line 4 references `$geju`, which is this skill's own explicit invocation and can remain.

## Metadata Findings

Command:

```powershell
python .\scripts\check.py .\skills\development-workflows\geju
```

Result:

- The skill passes hard validation.
- The validator reports: top-level category is missing.

## Docs Findings

Command:

```powershell
python .\docs\scripts\sync_docs_catalog.py --check
```

Result:

- Generated docs are out of date.
- Missing generated pages:
  - `docs/skills/development-workflows/geju.md`
  - `docs/en/skills/development-workflows/geju.md`
- Outdated generated files:
  - `docs/.vitepress/generated/catalog.mjs`
  - `docs/skills.md`
  - `docs/en/skills.md`

## Repository Guidance

`skills/AGENTS.md` requires:

- skill directories use `skills/<category>/<skill-name>/SKILL.md`
- frontmatter fields use top-level `name`, `description`, `category`, `tags`, and `version` as applicable
- `category` matches the parent category directory
- public skill metadata changes are followed by `just docs-sync` or `just docs-check`

## Planning Implication

The optimization should be a bounded content and metadata task. It needs no new scripts, no new dependencies, and no cross-skill coupling.
