# Verification-Round Template Notes

Use this internal scenario only after pattern extraction and lateral search produce concrete candidates. Natural-language requests for general verification normally belong to plan review or ordinary code review.

## Required manifest values

```json
{
  "scenario": "verification-round",
  "purpose": "verify round-1 extrapolations",
  "previous_rounds": ["<absolute path to round-1>"]
}
```

The previous round must exist, must not be another verification round, and must match the round number in `purpose`. Copy its `response.json` to `files/round-N-response.json` and its pattern record to `files/extracted-patterns.md`.

## Variables

| Variable | Source |
| --- | --- |
| `{{ROUND}}` | Verification bundle round |
| `{{MAIN_ROUND}}` | Verified business round |
| `{{MAIN_ROUND_BUNDLE}}` | Absolute source bundle path |
| `{{BUNDLE_ABSOLUTE_PATH}}` | Current bundle path |
| `{{PROJECT_ROOT}}` | Absolute project path |
| `{{TIMESTAMP}}` | ISO-8601 time |
| `{{MAIN_ROUND_FINDINGS_SUMMARY}}` | Accepted source findings |
| `{{EXTRACTED_PATTERNS_SUMMARY}}` | Generalized patterns and search rules |
| `{{CANDIDATES_SUMMARY}}` | Candidate IDs, locations, and evidence |

## Execution and completion

Run preflight validation, `run_bundle.py`, and post-response validation using `SKILL.md`. The sandbox is fixed to `read-only`. Do not construct a shell command or run jq.

Synthesize confirmed, refuted, partial, and unsure results with the main findings. A failed verification round does not erase valid main-round evidence, but it must be reported as incomplete. Never recursively verify `additional_findings`.
