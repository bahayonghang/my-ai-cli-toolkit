# High-Risk Operation Protection

When the interview reveals high-risk destructive operations, proactively intercept and issue a risk alert.

## Trigger Conditions

- Database deletion / permanent file destruction
- Credential reset / Git force push override
- Core dependency replacement / system environment variable modification
- Production data migration or schema breaking changes

## Alert Protocol

When a trigger is detected:

1. **Pause** the current interview phase
2. **Present** the risk alert using `AskUserQuestion` with explicit approve/reject options
3. **Only proceed** if the user selects "Confirm — I understand the risks"

## Alert Template

```
⚠️ High-Risk Operation Detected
Operation: [specific operation type]
Impact Analysis: [affected core modules, data irrecoverability scenarios]
Recommended Safeguards:
  - Rollback plan: [guidance on cold backup and snapshot-based rollback]
  - Backup strategy: [table/full-export level archival and automation setup]
  - Verification: [read-only account testing in sandbox/UAT environment]
```

## AskUserQuestion Format

```
AskUserQuestion({
  questions: [{
    question: "This change involves a high-risk operation. Proceed?",
    header: "Risk",
    options: [
      { label: "Confirm", description: "I understand the risks and have safeguards in place" },
      { label: "Add safeguards", description: "Include rollback/backup steps in the tasks artifact first" },
      { label: "Remove operation", description: "Exclude this operation from the spec entirely" }
    ],
    multiSelect: false
  }]
})
```
