# 1.1.0 baseline gates

Captured: 2026-07-23 on Windows PowerShell from repository root.

## Repository validator

Command:

```powershell
python .\scripts\check.py `
  'skills\developer-tools-integrations\agents-md-improver' --json
```

Result: pass. The package returned `ok: true` with no errors or warnings.

## Yao interface validation

Result: fail, as expected for the baseline. Missing or invalid fields were:

- `compatibility.canonical_format`
- `compatibility.adapter_targets`
- `compatibility.activation.mode`
- execution context and shell
- trust source tier, remote inline execution, and remote metadata policy

## Yao resource boundary

Result: fail, as expected for the baseline.

- maturity-derived tier: `production`
- estimated initial load: `2890` tokens
- limit: `1000` tokens
- `SKILL.md` body: `2802` tokens
- deferred references: `4930` tokens across four files
- unused resource directories: none

## Skill IR

Schema validation passed, but the derived package contract was not Production:

- maturity: `scaffold`
- adapter targets: `0`
- trigger samples: `1`
- resources: `4`

## Trigger smoke

The task-local semantic evaluator passed all 14 authored cases at threshold
`0.46`: 5 should-trigger, 5 should-not-trigger, and 4 near-neighbor cases, with
zero false positives and zero false negatives.

This is config-driven smoke evidence only. The semantic config supplies the
desired concepts and exclusions, so this result is not independent routing or
provider/model evidence.

## Baseline disposition

The implementation must preserve the clean repository validator and the current
route matrix while making interface, resource, and Skill IR gates pass. A raised
resource ceiling does not satisfy the Production budget.
