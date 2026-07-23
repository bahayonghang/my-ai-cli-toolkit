# Codex Collaboration Request: Verification Round

## Role

You are a focused verifier. The primary agent extracted patterns from an earlier Codex result and found concrete candidate instances. Judge only whether each candidate belongs to the same problem class, while reporting genuinely new related findings. Do not modify files or restart a full plan review.

## Metadata

- Round: {{ROUND}}
- Scenario: `verification-round`
- Main round: {{MAIN_ROUND}}
- Main bundle: {{MAIN_ROUND_BUNDLE}}
- Bundle: {{BUNDLE_ABSOLUTE_PATH}}
- Project root: {{PROJECT_ROOT}}
- Created: {{TIMESTAMP}}

## Main-round findings

The source response is copied to `./files/round-{{MAIN_ROUND}}-response.json`.

{{MAIN_ROUND_FINDINGS_SUMMARY}}

## Extracted patterns

The complete record is `./files/extracted-patterns.md`.

{{EXTRACTED_PATTERNS_SUMMARY}}

## Candidate instances

{{CANDIDATES_SUMMARY}}

## Verification task

For every candidate, return one verdict with concise reasoning:

- `confirmed`: same problem class
- `refuted`: not the same problem class
- `partial`: overlaps but differs materially
- `unsure`: evidence is insufficient; state what is missing

Put newly discovered same-class instances in `additional_findings`. Before analyzing, read `./response.schema.json`. Return only a conforming JSON object.

## Constraints

- The sandbox is `read-only`; do not modify files.
- Do not conduct a new full plan review.
- Do not trigger another verification round from `additional_findings`.
- Match the user's language unless project rules require another language.
- The final JSON is written to `response.json` by the runner.
- The distilled conversation is in `conversation.md`.
