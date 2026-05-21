# Gh Pr Checks Plan Fix - Background & Manual Workflow

## Overview
Use `gh` to locate failing PR checks, fetch GitHub Actions logs for actionable failures, summarize failure snippets, and map each failing check to the smallest useful local reproduction command.

## Scope Rules
- Treat checks with GitHub Actions run URLs as first-class targets.
- Treat checks without GitHub Actions run IDs as external providers. Report the URL and stop unless the user explicitly asks for that provider.
- If RTK is available, use it only for model-facing exploration such as `rtk gh pr checks`, `rtk read`, or `rtk grep`. Keep raw `gh` output for JSON parsing and log retrieval.

## Manual Fallback Workflow
If the automated script fails:
1. `gh pr checks <pr> --json name,state,bucket,link,workflow`
2. For each failure, get run ID from `detailsUrl`:
   - `gh run view <run_id> --json name,conclusion,status,url`
   - `gh run view <run_id> --log`
3. Fetch job logs directly if needed:
   - `gh api "/repos/<owner>/<repo>/actions/jobs/<job_id>/logs"`

## Local Reproduction Mapping
- Rust checks: prefer `just rust-test`, `just rust-check-all`, `cargo test --workspace`, `cargo clippy --workspace --all-targets --all-features -- -D warnings`, or `cargo fmt --all -- --check`
- TypeScript checks: prefer `just ts-check`, package-manager scripts containing `type`, `tsc`, or `check`, then fall back to `npx tsc --noEmit`
- Vitest and unit tests: prefer project test scripts, then `cargo test --workspace` for Rust repos
- Playwright and e2e: prefer package-manager scripts containing `e2e` or `playwright`
- Generic build failures: prefer package-manager build scripts or `cargo build --workspace`

## Usage Examples
- `python "$SKILL_DIR/scripts/inspect_pr_checks.py" --repo "." --pr "123"`
- `python "$SKILL_DIR/scripts/inspect_pr_checks.py" --repo "." --max-lines 200 --context 40`
