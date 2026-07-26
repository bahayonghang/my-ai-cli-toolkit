# Runtime Conformance Matrix

- Skill: `codex-workflow-recommender`
- Targets: `5`
- Passed: `3`
- Failed: `2`

| Target | Status | Failures | Warnings |
| --- | --- | --- | --- |
| openai | pass | None | None |
| claude | pass | None | None |
| agent-skills | fail | manifest target missing: agent-skills | agent-skills uses canonical Agent Skills metadata; provider-native execution transforms are not implemented in v0. |
| vscode | fail | manifest target missing: vscode | vscode uses canonical Agent Skills metadata; provider-native execution transforms are not implemented in v0. |
| generic | pass | None | None |

## Reviewer Notes

- Failed targets block release for that target.
- Warnings identify lossy or not-yet-compiled behavior that must remain visible.
