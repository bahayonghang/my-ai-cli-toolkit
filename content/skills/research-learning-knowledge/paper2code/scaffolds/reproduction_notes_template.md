# Reproduction Notes: {{PAPER_TITLE}}

> This document records every implementation choice, whether it was specified by
> the paper, and what alternatives exist. Read this before trusting the code as
> a faithful reproduction.

## Paper

- **Title:** {{PAPER_TITLE}}
- **Authors:** {{AUTHORS}}
- **Year:** {{YEAR}}
- **Source reference:** {{PAPER_REFERENCE}}
- **Official code:** {{OFFICIAL_CODE_URL or "None found"}}

## What this implements

{{ONE_PARAGRAPH_CONTRIBUTION_STATEMENT}}

## Verified against

- [ ] Paper equations
- [ ] Paper algorithm boxes
- [ ] Official code (if available)
- [ ] Other well-known reimplementations
- [ ] Paper text only

## Unspecified choices

| Component | Our Choice | Alternatives | Paper Quote (if partial) | Section |
|-----------|-----------|--------------|--------------------------|---------|
| {{component}} | {{what we used}} | {{other options}} | {{quote or "—"}} | {{§X.Y or "—"}} |

## Known deviations

| Deviation | Paper says | We do | Reason |
|-----------|-----------|-------|--------|
| {{what}} | {{paper specification}} | {{our implementation}} | {{why we deviate}} |

## Expected results

| Metric | Paper's number | Dataset | Conditions |
|--------|---------------|---------|------------|
| {{metric}} | {{value}} | {{dataset}} | {{e.g. Table 1 best config}} |

## Debugging tips

1. **{{Failure mode 1}}**: {{description and how to diagnose}}
2. **{{Failure mode 2}}**: {{description and how to diagnose}}
3. **{{Failure mode 3}}**: {{description and how to diagnose}}

## Scope decisions

### Implemented

- {{Component}} — {{reason}}

### Intentionally excluded

- {{Component}} — {{reason}}

### Needed for full reproduction (not included)

- {{Component}} — {{where to get it}}

## References

- {{Citation}} — {{what was taken from this reference}}
