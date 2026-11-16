# Package Verification

- OK: `False`
- Package directory: `D:\Documents\Code\Agents\my-claude-code-settings\.trellis\tasks\07-23-optimize-codex-workflow-recommender\research\yao\package`
- Targets: `3 / 3` adapters present
- Archive present: `True`
- Archive SHA256: `871044e0ddf6604601ec8423e2dea4f7a82e5f7bcce009b76a66e5195917261d`
- Nested SKILL.md entries: `0`
- Failures: `1`
- Warnings: `0`

## Checks

| Check | Status | Detail |
| --- | --- | --- |
| `package-manifest` | `pass` | Package manifest exists: D:\Documents\Code\Agents\my-claude-code-settings\.trellis\tasks\07-23-optimize-codex-workflow-recommender\research\yao\package\manifest.json |
| `claude-adapter` | `pass` | Adapter exists for target: claude |
| `generic-adapter` | `pass` | Adapter exists for target: generic |
| `openai-adapter` | `pass` | Adapter exists for target: openai |
| `archive-safe-paths` | `pass` | Archive has no absolute or parent-traversal entries |
| `archive-entry-codex-workflow-recommender/SKILL.md` | `pass` | Archive contains codex-workflow-recommender/SKILL.md |
| `archive-entry-codex-workflow-recommender/manifest.json` | `pass` | Archive contains codex-workflow-recommender/manifest.json |
| `archive-entry-codex-workflow-recommender/agents/interface.yaml` | `pass` | Archive contains codex-workflow-recommender/agents/interface.yaml |
| `archive-single-skill-entrypoint` | `pass` | Archive exposes only the root SKILL.md entrypoint |
| `archive-excludes-generated` | `pass` | Archive excludes generated dist/, .previews/, and tests/tmp* contents |
| `registry-ok` | `fail` | Registry audit is OK |
| `registry-name-match` | `pass` | Registry package name matches package manifest |
| `registry-version-match` | `pass` | Registry package version matches package manifest |
| `registry-compat-claude` | `pass` | Registry compatibility is reviewable for target: claude |
| `registry-compat-generic` | `pass` | Registry compatibility is reviewable for target: generic |
| `registry-compat-openai` | `pass` | Registry compatibility is reviewable for target: openai |

## Failures

- Registry audit is OK

## Warnings

- None
