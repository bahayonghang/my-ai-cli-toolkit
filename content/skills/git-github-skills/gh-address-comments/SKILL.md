---
name: gh-address-comments
description: Address GitHub PR review comments using gh CLI. Use when responding to PR feedback.
metadata:
  category: devops
  tags:
    - github
    - pr-review
    - code-review
argument-hint: "[pr-number-or-url]"
allowed-tools: Read, Bash, python
---

1. Verify `gh auth status`. If unauthenticated, ask user to run `gh auth login`.
2. Run fetching script: `python "$SKILL_DIR/scripts/fetch_comments.py" --pr "$ARGUMENTS"`.
3. Provide a numbered list of review threads with a short summary of required fixes.
4. Ask user which comments to address.
5. Apply fixes for the selected comments.
6. If authentication fails mid-run, ask user to re-authenticate and retry.
