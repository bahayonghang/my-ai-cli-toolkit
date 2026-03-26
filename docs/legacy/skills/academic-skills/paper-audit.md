# Paper Audit

Unified paper auditing for Chinese and English papers across `.tex`, `.typ`, and `.pdf` inputs.

## When to use it

- pre-submission paper checks
- reviewer-style paper audits
- adversarial quality inspection before polish

## Workflow

1. pass a target paper path
2. review the audit references in `references/`
3. run `scripts/audit.py`
4. present the generated markdown report and separate automated findings from judgment-based scoring

## Main assets

- `scripts/audit.py`
- `references/REVIEW_CRITERIA.md`
- `references/CHECKLIST.md`
- `references/SCHOLAR_EVAL_GUIDE.md`

## Notes

- The skill supports multiple modes such as audit, review, and polish.
- If the target path is missing, the workflow should first confirm the paper source.
