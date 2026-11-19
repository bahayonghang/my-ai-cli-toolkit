# Permission Policy

Reviewed by `lyh` on 2026-07-21 as part of the approved Governed upgrade. Review expires on 2026-10-21 and must be renewed after material script or permission changes.

## Approved Capabilities

- `file_write`: `scripts/pr_review.py` may create caller-approved local preparation and state artifacts. It does not gain permission to push or perform a GitHub write.
- `subprocess`: the three Python helpers may invoke the local `gh` executable for the resolved repository and displayed action. Every external write still follows the action-specific authorization in `SKILL.md`.

## Enforcement Boundary

Claude exposes the declared `Bash` tool boundary. OpenAI, generic, and VS Code packages carry permission metadata for host enforcement; the package does not claim native enforcement on those targets. Install simulation and runtime probes verify that this limitation remains visible rather than silently dropping it.
