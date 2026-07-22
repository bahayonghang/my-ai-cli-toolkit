# Security Trust Report

- OK: `True`
- Scanned files: `11`
- Scripts: `0`
- Internal script modules: `0`
- Secret findings: `0`
- Network-capable scripts: `0`
- Network policy covered scripts: `0`
- Network policy missing scripts: `0`
- File-write scripts: `0`
- Permission approvals: `0 / 0`
- Permission approval gaps: `0`
- CLI help smoke checked: `0`
- CLI help smoke failures: `0`
- Interactive scripts: `0`
- Package hash scope: `source-contract-without-generated-reports`
- Package hash files: `11`
- Package SHA256: `906eb65e255433f86c896f8045384a04fa2cc356cc273a16bee45894db032ce3`

## Failures

- None

## Warnings

- No dependency or lock file detected

## Dependency Evidence

- Files: `none`
- Pinned entries: `0`
- Unpinned entries: `0`

## Network Policy

- Policy file: `security/network_policy.json`
- Present: `False`
- Covered scripts: `0`
- Missing scripts: `none`
- Mismatches: `0`

## Permission Governance

- Policy file: `security/permission_policy.json`
- Present: `True`
- Required capabilities: `none`
- Approved capabilities: `none`
- Missing approvals: `none`
- Invalid approvals: `none`
- Expired approvals: `none`

## CLI Help Smoke

- Enabled: `True`
- Timeout seconds: `5.0`
- Checked scripts: `0`
- Passed scripts: `0`
- Failed scripts: `none`

## Script Surface

| Script | Interface | Declared | Argparse | Main Guard | Input | Network | File Write | Subprocess | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Evidence Boundaries

- PowerShell automated trust coverage: `missing evidence`. The trust checker scans Python scripts only, so `Scripts: 0` does not cover or approve the two bundled `.ps1` files.
- Manual PowerShell evidence: both `.ps1` files were inventoried; 22 deterministic fixture-backed tests exercise their safety contracts through injected shims, and live verification is limited to audit and `-WhatIf` modes.
- Provider/model execution: `missing evidence`.
- Human blind adjudication: `missing evidence`.
- Native telemetry: `missing evidence`.
