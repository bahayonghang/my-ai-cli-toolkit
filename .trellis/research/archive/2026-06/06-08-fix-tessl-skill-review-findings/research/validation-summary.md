# Validation Summary

## Changes

- Normalized `allowed-tools` frontmatter from YAML sequences to comma-separated strings in 11 skills that Tessl previously rejected before LLM judging.
- Moved `deep-research-pro` homepage/provenance into `metadata` and added `metadata.version`, removing the local `homepage` warning and reducing Tessl metadata warnings.
- Confirmed every `references/output-template.md` reference resolves. `geju` and `goudi` already had tracked templates from their original commits.
- Added a `skills/AGENTS.md` rule to prefer string-form `allowed-tools` for external review tool compatibility.
- Posted a non-merge explanation on PR #8: `https://github.com/bahayonghang/my-claude-code-settings/pull/8#issuecomment-4643220982`.

## Tessl Rerun

Targeted rerun covered the 11 previously blocked skills plus `deep-research-pro`, `geju`, and `goudi`.

- Blocking validation failures: 0
- Validation errors: 0
- Score range: 77-98

Lowest targeted scores after repair:

| Skill | Score |
|---|---:|
| `touying` | 77 |
| `deep-research-pro` | 84 |
| `geju` | 86 |
| `goudi` | 86 |

Raw artifacts:

- `research/tessl-rerun-summary.json`
- `research/tessl-rerun-json/*.json`
- `research/tessl-rerun-json/*.stderr.txt`

## Local Gate

Command:

```powershell
just ci
```

Result: passed.

Covered:

- `just docs-check`
- `just skills-check`
- `just python-check`
- `just node-test`
- `git diff --check`

Notes:

- VitePress/Rollup emitted third-party `#__PURE__` annotation warnings from `node_modules/@vueuse/core`; build still passed.
- Git emitted line-ending normalization warnings for touched files; `git diff --check` passed.
