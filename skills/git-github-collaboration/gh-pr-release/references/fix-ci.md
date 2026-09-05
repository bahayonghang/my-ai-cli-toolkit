# Diagnose And Fix PR Checks

Use this mode for failing or pending PR checks. Keep machine-readable commands on raw `gh`; use `rtk gh` only for exploratory summaries.

## Inspect

```bash
python "<skill-dir>/scripts/inspect_pr_checks.py" --repo "." [--pr PR] --max-lines 50 --json
```

The script returns nonzero only for tool, authentication, resolution, or parsing failures. Branch on its top-level `status`:

- `all_green`: if `summary.total` is zero, report no checks; otherwise report all checks green.
- `pending`: report the running checks and any external failures already listed; wait or inspect completed failures.
- `external_only`: report provider names and URLs; stop unless that provider is explicitly in scope.
- `failures`: continue with GitHub Actions failures and retain any external failures as separate evidence.

If the script fails, use the gh 2.96.0 fields verified for this workflow:

```bash
gh pr checks PR --repo OWNER/REPO --json name,state,bucket,link,workflow
gh run view RUN_ID --repo OWNER/REPO --json name,conclusion,status,url
gh run view RUN_ID --repo OWNER/REPO --log
gh api "/repos/OWNER/REPO/actions/jobs/JOB_ID/logs"
```

Extract `RUN_ID` and `JOB_ID` from the check `link`. A link without a GitHub Actions run id is an external provider.

## Plan, Fix, Verify

1. Summarize each failure with its check name, smallest useful error block (maximum 50 lines), URL, and suggested local reproduction command.
2. Show a concise edit and validation plan. Diagnosis-only requests stop here. An explicit fix request authorizes its minimal local implementation; ask only for uncovered dependencies, targets, irreversible effects, or material scope changes.
3. Apply the approved fix and run the smallest reproduction command. Diagnose and retry at most twice if it still fails.
4. After local success, rerun `gh pr checks` and report the fresh state.

Local fix approval alone never authorizes push, merge, auto-merge, or admin bypass. If the same request explicitly includes a follow-up action, continue through the relevant route without another mechanical confirmation; fresh-read and validate its exact head before writing. Ask only for uncovered actions or material changes.
