# Output Risk Profile

Last reviewed: 2026-07-22

## Output Families

- read-only dev process audit and cleanup plan
- read-only UWP app association audit and cleanup plan
- JSON and Markdown report exports
- user-authorized process termination results
- migration guidance for persistent Phone Link background control

## Primary Risks

| Risk | Failure signal | Required control | Remaining risk |
| --- | --- | --- | --- |
| Incomplete side-effect scope | `taskkill /T` can reach a PID absent from `members` | Build closure from the full process census and compare it again before execution | A Windows race can occur after the last precondition read |
| Protected or unknown process loss | A target tree contains a dev server, IDE service, unknown executable, or missing identity | Block the entire tree and emit member-specific reasons | Classification rules can lag a newly introduced tool |
| PID reuse | PID matches but start time, command line, or name differs | Fingerprint identity and fail with `identity-changed` | Some UWP identity fields can be unreadable and therefore block cleanup |
| Workspace overmatch | `C:\work\app` selects `C:\work\app-copy` | Normalize Windows paths and match directory-segment boundaries | Command-line quoting can still be unusual and fail closed |
| Invalid stale threshold | Zero or negative values select nearly everything | Enforce a bounded positive integer and reuse one predicate | A positive threshold can still be too low if the user chooses it |
| Dishonest kill result | Native command exits 0 while a member remains | Requery every planned identity and derive aggregate status from verified outcomes | A process can restart later under a new PID |
| Localized UWP parsing | Display columns shift or app text is truncated | Require four-field CSV, positive PID, full package identity, and zero command status | Future Windows output schema changes will block cleanup until reviewed |
| Unsupported registry persistence | Old HKCU flags are written without a supported contract or recovery proof | Version 2.0 hard-fails the deprecated flag and performs no registry mutation | Windows Settings availability varies by app and edition |
| Authorization crossover | Audit or WhatIf is treated as permission to terminate | Require explicit cleanup intent after displaying an unchanged plan | A user can still explicitly approve the wrong displayed plan |

## Self-Repair Pass

Before reporting or executing cleanup:

1. Confirm the request belongs to dev-process or UWP app cleanup rather than a near neighbor.
2. Confirm the snapshot is complete enough to classify every affected member.
3. Remove every blocked tree from the executable target set.
4. Preview and display the plan identifier, counts, identities, and blocked reasons.
5. Revalidate immediately before the side effect.
6. Verify every planned identity afterward and mark unavailable evidence as `missing evidence`.
