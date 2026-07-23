# Process Safety Scenarios

Classification: file-backed fixture

## Protected descendant

An audited Playwright MCP root has a descendant running `npm run dev`. Because `taskkill /T` would terminate both, the tree must be blocked and produce zero cleanup targets.

## Identity drift

PID 100 has the expected name and command line but a different creation timestamp at precondition time. The kill shim must receive zero calls and the aggregate result must be `precondition-failed`.

## False command success

The taskkill shim returns exit code 0 while every planned process remains present with the original fingerprint. Each member outcome and the aggregate result must be `failed`.

## Workspace sibling

Target `C:\work\app` must match `C:\work\app\node_modules\.bin\vite` but not `C:\work\app-copy\node_modules\.bin\vite`.

## UWP parse failure

A `tasklist /apps /fo csv /nh` row with the wrong column count or invalid PID, or a nonzero command exit status, must yield no cleanup targets.

## Phone Link persistence

The legacy registry flag is unsupported. The skill must fail closed, perform no registry mutation, and direct the user to supported Windows Settings guidance.
