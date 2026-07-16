# Project Audit Report Template

Use this template as a structure reference for the `project` route. Localize headings and labels to the user's language. Default to presenting the completed report in chat; write it to disk only after explicit opt-in.

## 1. Executive Summary

Keep this section to 10 lines or fewer. State the audit tier, scope, strongest risks, and evidence limits. Avoid generic praise; mention strengths only when tied to concrete evidence.

## 2. Mental Model / Architecture Sketch

Summarize entrypoints, module boundaries, data/control flow, trust boundaries, and the hotspots selected during orientation.

## 3. Findings

Do not impose a minimum count or add filler findings.

| ID | Dimension | File:Line | Severity | Effort (S/M/L) | Description | Recommendation |
| -- | --------- | --------- | -------- | -------------- | ----------- | -------------- |
| `{{id}}` | `{{dimension}}` | `{{file}}:{{line}}` | `{{severity}}` | `{{effort}}` | `{{description}}` | `{{recommendation}}` |

Every `critical` or `high` row requires an exact `file:line`. In delta mode, add a Status column (`Fixed`, `Partially Fixed`, `Still Present`, or `New`) and separate prior-status updates from new findings.

## 4. Top Priorities and Quick Wins

List up to five priorities in risk-reduction order, then identify small, independently useful fixes. Do not pad either list.

## 5. Looks Bad but Is Actually Fine

Record suspicious patterns that were checked and found intentional or safe, including the evidence that cleared them. If no reliable example exists, state: "No reliable instances found in the checked scope." Localize that sentence when appropriate.

## 6. Open Questions

List intent, ownership, or architecture questions that could not be resolved from repository evidence. Do not convert these questions into findings.

## 7. What Was Checked

Record:

- in-scope and excluded paths;
- manifests, guidance, history, and architecture evidence inspected;
- commands and tools run, with outcomes;
- unavailable or skipped checks labeled `missing evidence`;
- coverage limits caused by the selected tier, tool availability, time, or access.

When saving is explicitly requested, use a collision-safe dated path under `docs/audits/` as defined in `<skill-dir>/references/audit-workflow.md`.
