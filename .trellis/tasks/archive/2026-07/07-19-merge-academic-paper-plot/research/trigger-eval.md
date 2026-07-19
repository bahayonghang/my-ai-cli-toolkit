# Trigger evaluation planning baseline

Date: 2026-07-19

## Candidate

The exact candidate description is recorded in `design.md` §6. It covers
create/review, the three canonical modes, explicit-journal precedence, and
positive routing guidance for paper-reading neighbors.

## Command shape

The planning run passed the candidate through PowerShell as `--description`.
Implementation must extract the folded YAML value with PyYAML before invoking
the same evaluator; `trigger_eval.py --description-file SKILL.md` does not
reliably expand a folded `description: >` scalar.

```powershell
$env:PYTHONUTF8 = '1'
$candidate = '<exact description from design.md section 6>'
python "$env:USERPROFILE\.skillsmanage\skills\yao-meta\scripts\trigger_eval.py" `
  --description "$candidate" `
  --cases '.trellis\tasks\07-19-merge-academic-paper-plot\research\trigger-cases.json' `
  --semantic-config '.trellis\tasks\07-19-merge-academic-paper-plot\research\semantic_config.json'
```

## Result

- Exit code: 0
- Threshold: 0.20
- Precision: 1.0
- Recall: 1.0
- False positives: 0
- False negatives: 0
- `should_trigger`: 8/8 passed
- `should_not_trigger`: 4/4 passed
- `near_neighbor`: 3/3 passed

This is a deterministic planning baseline, not model-backed routing evidence.
The gate must run again against the implemented frontmatter description.

## Implementation rerun

The implemented folded YAML description was extracted with PyYAML and passed
to the same evaluator on 2026-07-19.

- Description length: 571 characters
- Exit code: 0
- Threshold: 0.20
- Precision: 1.0
- Recall: 1.0
- False positives: 0
- False negatives: 0
- `should_trigger`: 8/8 passed
- `should_not_trigger`: 4/4 passed
- `near_neighbor`: 3/3 passed

This rerun validates the actual `SKILL.md` frontmatter value. It remains a
deterministic semantic-fixture gate, not provider-backed routing evidence.
