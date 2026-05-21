# JSON mode

Use JSON mode when the user wants a structured record, reusable
machine-readable facts, a saved artifact, or an input for another skill.

## Behavior

1. Normalize first
2. Return the exact `paper-record` payload
3. Prefer a short status line plus one fenced `json` block

## Save behavior

If the user asks to save the normalized JSON, pass `--save PATH` to
`normalize_paper.py` and then return the same payload unless they explicitly
asked for silent save only.
