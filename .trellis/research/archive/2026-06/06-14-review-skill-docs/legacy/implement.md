# Implementation Plan

1. Inspect current source
   - Verify current skill files and old references with `rg`.
   - Confirm generated docs behavior from `docs/scripts/sync_docs_catalog.py`.

2. Rename package and metadata
   - Move `skills/developer-tools-integrations/guizang-review-skill/` to `skills/developer-tools-integrations/agent-skill-review/`.
   - Update `SKILL.md` frontmatter, title, description, report format, and neutral wording.
   - Update `agents/openai.yaml` display name and default prompt.

3. Update README
   - Rewrite README around `agent-skill-review`.
   - Add an `Origin and attribution` section with the upstream skill URL and original post.
   - Keep install/use examples consistent with the repo's docs generator and new invocation.

4. Complete generated docs
   - Run `just docs-sync`.
   - Review generated docs paths for the new skill and stale old pages.

5. Validate
   - Run `python scripts/check.py skills/developer-tools-integrations/agent-skill-review`.
   - Run `just docs-check`.
   - Run `git diff --check`.
   - If `docs-check` fails for environment/dependency reasons, report the exact blocker and still provide the narrower checks that passed.

## Rollback Points

- Before the directory move, the source path is `skills/developer-tools-integrations/guizang-review-skill/`.
- If docs generation creates unexpected broad changes, inspect `git diff --stat` and only keep generator-owned outputs required by the rename.

## Review Gate

The user's original request includes the implementation request, so after these artifacts are written the task can be started and implemented directly in Codex inline mode.
