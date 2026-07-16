# Trigger Evaluation

Date: 2026-07-17

## Command

Confirmed the CLI flags first with:

```powershell
$env:PYTHONUTF8=1
python "$env:USERPROFILE\.claude\skills\yao-meta\scripts\trigger_eval.py" --help
```

Then ran:

```powershell
$env:PYTHONUTF8=1
python "$env:USERPROFILE\.claude\skills\yao-meta\scripts\trigger_eval.py" `
  --cases .trellis\tasks\07-17-code-auditor-audit-upgrade\research\trigger-cases.json `
  --semantic-config .trellis\tasks\07-17-code-auditor-audit-upgrade\research\semantic_config.json `
  --description-file skills\development-workflows\code-auditor\SKILL.md
```

## Result

- Exit code: 0
- Threshold: 0.48
- Precision: 1.0
- Recall: 1.0
- False positives: 0
- False negatives: 0
- `should_trigger`: 4/4 passed
- `should_not_trigger`: 2/2 passed
- `near_neighbor`: 2/2 passed
- Misfires: none

Covered project audits in Chinese and English, PR review in Chinese and English, implementation/explanation negatives, the maintainability-only `code-quality-review` neighbor, and the non-code repository-health neighbor.
