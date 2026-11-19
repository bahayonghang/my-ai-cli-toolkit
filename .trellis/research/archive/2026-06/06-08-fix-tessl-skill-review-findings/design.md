# Design

## Scope

This task repairs deterministic validation and concrete broken-reference issues produced by the Tessl rescan. It intentionally avoids importing PR #8 because that PR edits the removed `content/skills/...` tree.

## Changes

1. `allowed-tools` normalization
   - Convert YAML list values to comma-separated strings in the 11 Tessl-blocked skills.
   - Preserve the exact tool tokens and order.
   - Do not change skills that already use an accepted string form.

2. Missing output templates
   - Verify `references/output-template.md` for `geju`.
   - Verify `references/output-template.md` for `goudi`.
   - Do not rewrite existing templates unless validation shows a concrete broken reference remains.

3. `deep-research-pro` frontmatter
   - Remove or relocate `homepage` so `scripts/check.py` no longer reports it as an unexpected top-level key.
   - Keep useful provenance under `metadata` only if it remains compatible with the local validator and does not create new Tessl deterministic errors.

4. PR response
   - Add a GitHub PR comment to PR #8.
   - State that it is not being merged because it targets removed paths and is based on the old architecture.
   - Mention that the current `skills/` catalog was rescanned separately and fixes are being handled in a fresh task.

## Compatibility

- Local repository validation is authoritative for merge readiness.
- Tessl scores are useful review signals, but Tessl warnings about `category`, `tags`, and `version` are intentionally not treated as errors because local guidance requires those fields.
- The `allowed-tools` string form is already used in other skills in this repository, so converting list forms to strings is expected to remain compatible.
