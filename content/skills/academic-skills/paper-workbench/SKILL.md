---
name: paper-workbench
description: >
  Unified paper intake and analysis router for academic workflows. Normalize arXiv,
  AlphaXiv, DOI, PDF, landing-page, or existing paper JSON into the shared
  `paper-record` schema, then route into json, interpret, or xray modes.
category: academic-skills
tags: [paper, research, normalization, doi, arxiv, analysis, routing]
version: "1.0.0"
argument-hint: "[paper-source] [--mode json|interpret|xray] [--save PATH] [--lang LANG] [--fulltext auto|prefer|never]"
allowed-tools: Read, Write, WebFetch, Bash(curl *), Bash(python *)
---

# Paper Workbench

Unified entrypoint for paper-like inputs.

Use this skill when the user provides any of these and wants structured paper
intake or downstream analysis:

- arXiv IDs and arXiv URLs
- AlphaXiv URLs
- DOI strings or `doi.org/...` URLs
- local academic PDFs
- remote PDF URLs
- paper landing pages that expose a PDF
- existing normalized paper JSON

This skill is a thin router. Always normalize first into `paper-record`, then
choose the requested mode.

## Routing Rule

1. Resolve source from `$ARGUMENTS`, latest user message, or pasted JSON
2. Normalize via the bundled `scripts/normalize_paper.py`
3. Route by mode:
   - `json` → return canonical JSON record
   - `interpret` → explain the paper using normalized facts
   - `xray` → deconstruct the paper using normalized facts

If mode is omitted, default to `json`.

## Normalize First

Always run:

```bash
python "$SKILL_DIR/scripts/normalize_paper.py" \
  --source "<paper-source>" \
  --lang "<lang>" \
  --fulltext auto
```

If the user wants saving, pass `--save` only when saving the JSON artifact.
Interpret and xray save behavior stays owned by their downstream skills.

## Mode Handoff

- For `json`, return the `paper-record` payload directly
- For `interpret`, treat the normalized JSON as the fact source and follow
  `references/modes/interpret.md`
- For `xray`, treat the normalized JSON as the fact source and follow
  `references/modes/xray.md`

## References

- `references/routing.md` — source classification and mode routing
- `references/schema.md` — canonical `paper-record` contract
- `references/migration.md` — legacy compatibility rules
- `references/modes/json.md` — JSON mode behavior
- `references/modes/interpret.md` — interpretation handoff
- `references/modes/xray.md` — x-ray handoff
