# Qwen Companion

Use this skill when the user wants a **Qwen CLI companion workflow** with explicit phases, bounded next steps, and careful continuation claims.

It is a good fit when Qwen should:

- inspect a change before execution
- define the next bounded step in a larger workflow
- continue a prior Qwen-guided task with explicit limits
- serve as a structured companion rather than an ad-hoc command runner

## Best for

- review-first Qwen workflows
- bounded execution planning
- explicit continuation of multi-step tasks
- second-pass reasoning about edge cases and failure modes

## Notes

- Keep scope tight and verifiable.
- Do not imply provider-native persistent threads unless they really exist.
- For Codex-specific runtime lifecycle operations, use `codex-companion` instead.
