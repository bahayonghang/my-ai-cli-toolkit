# Windows Command Contracts

Last verified: 2026-07-22

## `taskkill /T /F`

Microsoft documents `/t` as terminating the specified process and child processes it started; `/f` forces termination. The dev script therefore audits the full descendant closure, revalidates it immediately before execution, and verifies every planned member afterward.

Source: https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/taskkill

Local contract:

- `taskkill` is invoked only after an unblocked plan passes preconditions.
- A zero exit code does not imply the process tree is gone.
- A new, changed, protected, unknown, or identity-missing descendant blocks execution.

## `tasklist /apps /fo csv /nh`

Microsoft documents `/apps` as displaying Microsoft Store apps and their associated processes, `/fo` as selecting the output format, and `/nh` as omitting the header for table or CSV output.

Source: https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/tasklist

Local contract:

- Run exactly `tasklist /apps /fo csv /nh` and capture command status.
- Parse each row as strict four-field CSV; do not parse localized table spacing.
- Require a positive PID and non-empty full package identity.
- Any command or schema failure yields `audit_status: failed` and zero cleanup targets.

## Process Identity

`Win32_Process` supplies PID, parent PID, executable name, command line, and creation date. PID alone is not stable. The dev plan fingerprints PID, name, creation timestamp, and command line. The UWP plan rechecks process name and start time when available. Missing identity evidence fails closed for automatic cleanup.

Source: https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-process

## Phone Link Background Activity

Microsoft's current supported user path is Windows Settings: `System > Power & battery > Battery usage > Manage background activity`, then choose `Never` where the app exposes that control.

Source: https://support.microsoft.com/en-US/Windows/Experience/Performance-Optimization/manage-background-activity-for-apps-in-windows

No current Microsoft source was found that defines the former `HKCU:\Software\Microsoft\Windows\CurrentVersion\BackgroundAccessApplications\Microsoft.YourPhone_8wekyb3d8bbwe` `Disabled` and `DisabledByUser` values as a supported, stable Phone Link control with a verified rollback contract. Version 2.0 therefore deprecates `-DisablePhoneLinkBackground`, fails closed, and performs no registry mutation.

## Evidence Limits

- Microsoft pages were reachable on 2026-07-22.
- Windows editions and app packaging can change; reverify quarterly.
- No production telemetry or Microsoft guarantee for undocumented registry values is available: `missing evidence`.
