# Gh Pr Checks Plan Fix - Background & Manual Workflow

## Overview
Use `gh` to locate failing PR checks, fetch GitHub Actions logs for actionable failures, summarize failure snippets, then propose a fix plan.

## Manual Fallback Workflow
If the automated script fails:
1. `gh pr checks <pr> --json name,state,bucket,link,workflow`
2. For each failure, get run ID from `detailsUrl`:
   - `gh run view <run_id> --json name,conclusion,status,url`
   - `gh run view <run_id> --log`
3. Fetch job logs directly if needed:
   - `gh api "/repos/<owner>/<repo>/actions/jobs/<job_id>/logs"`

## Usage Examples
- `python "$SKILL_DIR/scripts/inspect_pr_checks.py" --repo "." --pr "123"`
- `python "$SKILL_DIR/scripts/inspect_pr_checks.py" --repo "." --max-lines 200 --context 40`
