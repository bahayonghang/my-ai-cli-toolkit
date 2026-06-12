# Eval 5: Long Goal File Pointer

Status: review artifact only. This Codex inline session did not spawn independent with-skill/baseline agents.

Prompt:

```text
Turn this 20-section migration plan into a Codex goal, but it is obviously too long to paste inline. The details should live in .planning/migration-goal.md.
```

Expected output:

- Short executable `/goal` points to `.planning/migration-goal.md`.
- Mentions Codex's 4,000 character objective limit or explains the file-pointer pattern.
- Preserves verification, boundaries, stop conditions, and pause conditions in the file contract.

Review focus:

- The skill should not compress away safety details just to fit a long inline objective.
