# Goal activation boundary defect evidence

## User-provided evidence

Source: user-attached Cursor screenshot on 2026-08-26.

- Input begins with `/goal-meta-skill` and asks the generated goal to implement a named Trellis task tree until complete.
- The executor reports that the contract passed lint, then says it is attaching a Cursor Goal and starting the first child task.
- The UI shows `Goal active` with a `/goal` objective.

This proves one observed run crossed directly from prompt generation to Goal activation. It does not provide a provider transcript, model/version metadata, or post-fix comparison.

## Repository evidence

- `skills/developer-tools-integrations/goal-meta-skill/SKILL.md:60-61` joins draft/revise to deliver/persist without a separate activation authority.
- `skills/developer-tools-integrations/goal-meta-skill/SKILL.md:85` specifies final copyable output but no terminal stop after delivery.
- `skills/developer-tools-integrations/goal-meta-skill/agents/interface.yaml:4` requests a launcher but does not forbid invoking the host Goal facility.
- `skills/developer-tools-integrations/goal-meta-skill/SKILL.md:17` omits Goal/Codex execution tools, but host-native Goal actions are not represented in that allow-list.

## Generalized failure mechanism

An imperative embedded in a prompt-generation request can be misclassified as meta-level execution authority when generation, approval, and activation are not separate states. This is a permission invariant, not a Trellis-specific content rule.

## Evidence boundary

- Screenshot occurrence: user-provided visual evidence.
- Post-change static contracts and fixtures: locally verifiable.
- Post-change Cursor/model compliance, cross-platform rate, human blind review, telemetry: `missing evidence`.
