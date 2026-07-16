# Production Gate Results

Date: 2026-07-17

## `validate_skill.py`

Command:

```powershell
$env:PYTHONUTF8=1
python "$env:USERPROFILE\.claude\skills\yao-meta\scripts\validate_skill.py" `
  skills\development-workflows\code-auditor
```

Initial result: failed because the pre-existing package had no `agents/interface.yaml`. After adding a neutral interface with the validator's compatibility and trust fields, the rerun passed:

- Exit code: 0
- `ok`: true
- Failures: none
- Warnings: none

## `resource_boundary_check.py`

Default Production command:

```powershell
$env:PYTHONUTF8=1
python "$env:USERPROFILE\.claude\skills\yao-meta\scripts\resource_boundary_check.py" `
  skills\development-workflows\code-auditor
```

Default result: **not passed**.

- Exit code: 1
- Estimated initial load: 2264 tokens
- Default Production budget: 1000 tokens
- `SKILL.md` body: 2015 tokens
- Unused resource directories: none
- Residual warning: `SKILL.md is getting heavy`

Triage: the 0.2.0 baseline `SKILL.md` was already 1533 estimated tokens, above the same 1000-token default. This change adds the approved routing skeleton while keeping the existing PR/directory workflow and language/severity contracts in place. Reducing the package below 1000 would require a broader entrypoint refactor outside this task's compatibility and rollback boundary. The default failure is therefore preserved as missing gate evidence, not reported as a pass.

Compatibility-budget command:

```powershell
$env:PYTHONUTF8=1
python "$env:USERPROFILE\.claude\skills\yao-meta\scripts\resource_boundary_check.py" `
  --max-initial-tokens 2300 `
  skills\development-workflows\code-auditor
```

Compatibility-budget result:

- Exit code: 0
- `ok`: true
- Failures: none
- Warnings: none
- Estimated initial load: 2264 / 2300 tokens
- Unused resource directories: none

This override demonstrates that the new references, assets, evals, scripts, and interface are all connected and remain below the explicitly recorded compatibility ceiling. It does not replace or conceal the failed default Production budget.

## Repository Validation

`just ci` passed after all runtime-contract and generated-doc changes:

- docs catalog check and VitePress build: passed;
- skill metadata: 38 skills passed;
- Python byte compilation: 35 files passed;
- Node skill tests: 116 total, 114 passed, 2 skipped, 0 failed;
- `git diff --check`: passed.

## Post-CI Python Cache Check

Checked after `just ci`, because `just python-check` regenerates local bytecode caches:

- Git-tracked `*.pyc` / `__pycache__` under code-auditor: 0;
- pyc entries in `git status --porcelain -uall`: 0;
- optional local cache cleanup: not needed for acceptance and not performed.
