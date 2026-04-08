---
name: paper-workbench
description: >
  Researcher-profile-driven paper intake and literature workbench for academic
  workflows. Use this whenever the user wants to skim, deep-read, card, compare,
  synthesize, map research gaps, or build a literature review from papers,
  arXiv/AlphaXiv links, DOIs, PDFs, landing pages, or existing paper JSON /
  workbench artifacts. Normalize sources into `paper-record`, then route into
  scan, deep-read, card, synthesis, review, or compatibility modes (`json`,
  `interpret`, `xray`). Trigger even when the user only says things like
  “精读这篇”, “整合这几篇”, “找研究空白”, or “搭综述框架”.
category: academic-skills
tags: [paper, research, normalization, literature-review, synthesis, doi, arxiv, analysis]
version: "1.1.0"
argument-hint: "[paper-source-or-artifact] [--mode scan|deep-read|card|synthesis|review|json|interpret|xray] [--workspace PATH] [--profile PATH] [--save PATH] [--lang LANG] [--fulltext auto|prefer|never]"
allowed-tools: Read, Write, WebFetch, Bash(curl *), Bash(python *), Bash(pytest *)
---

# Paper Workbench

Unified entrypoint for paper intake, strategic reading, multi-paper synthesis,
and review construction.

Keep `paper-record` as the normalization layer. Do not merge high-level
analysis back into the normalized record.

## Public interfaces

- `paper-record` — normalized single-paper facts
- `researcher-profile` — user research anchor
- `paper-deep-read` — single-paper strategic analysis artifact
- `literature-synthesis` — cross-paper integration artifact
- `review-outline` — literature-review planning artifact

## Source intake

Accept all of these:

- arXiv IDs and arXiv URLs
- AlphaXiv URLs
- DOI strings or `doi.org/...` URLs
- local academic PDFs or text files
- remote PDF URLs
- paper landing pages that expose a PDF
- existing `paper-record` JSON
- existing `researcher-profile`, `paper-deep-read`, `literature-synthesis`, or
  `review-outline` JSON

## Core routing rule

1. Resolve the input class from `$ARGUMENTS`, the latest user message, or a
   pasted JSON artifact.
2. If the request is paper-level and not already normalized, run
   `scripts/normalize_paper.py` first.
3. If the request is profile-sensitive and no `researcher-profile` is available,
   ask only for the missing profile fields.
4. Route into the requested mode.
5. If the user wants persistence, use `scripts/workbench_io.py` to save the
   profile or analysis artifact.

## Mode selection

### Single-paper modes

- `scan`
  - Use for “先快速扫一下”, “预判”, or fast worth-reading decisions
- `deep-read`
  - Use for “精读这篇”, “深度阅读”, “解构这篇”
- `card`
  - Use for “只做卡片”
- `interpret`
  - Compatibility path for a lightweight explanation
- `xray`
  - Compatibility path for compact critique
- `json`
  - Return the normalized `paper-record`

### Cross-paper modes

- `synthesis`
  - Use for “整合这几篇”, “对比分析”, “找研究空白”
- `review`
  - Use for “搭综述框架”, “写这一段”

## Defaulting rules

- If the user explicitly asks for a machine-readable or saved schema artifact,
  default to `json`
- If the user provides a single paper and asks to read or analyze it without a
  more specific mode, default to `scan`
- If the user provides 3 or more papers and asks for integration, default to
  `synthesis`

## Normalize first

For any paper-like input, run:

```bash
python "$SKILL_DIR/scripts/normalize_paper.py" \
  --source "<paper-source>" \
  --lang "<lang>" \
  --fulltext "<auto|prefer|never>"
```

Use `--save` only when the user asked to persist the normalized JSON.

## Profile workflow

Before `deep-read`, `card`, `synthesis`, or `review`, prefer a
`researcher-profile`.

If missing, collect only these fields:

- `research_field`
- `core_question`
- `thesis` (optional)
- `target_tier`
- `stage`

If the user wants persistence, create or update the profile with:

```bash
python "$SKILL_DIR/scripts/workbench_io.py" init-profile \
  --path "<profile-path>" \
  --research-field "<field>" \
  --core-question "<question>" \
  --thesis "<optional-thesis>" \
  --target-tier "<target-tier>" \
  --stage "<stage>"
```

## Artifact persistence

When the user asks to save a deep read, synthesis, or review plan, write a JSON
artifact plus an optional Markdown or Org sidecar:

```bash
python "$SKILL_DIR/scripts/workbench_io.py" save-artifact \
  --workspace "<workspace-dir>" \
  --artifact-type "<paper-deep-read|literature-synthesis|review-outline>" \
  --title "<artifact-title>" \
  --payload-file "<json-payload-file>" \
  --profile-path "<optional-profile-path>" \
  --source-record "<path-to-paper-record>" \
  --sidecar-file "<optional-md-or-org>"
```

## Output rules

- Separate `作者观点` from `系统分析`
- Never invent page numbers, quotations, or empirical details
- If a requested quote or page anchor is missing, use `[信息待核实]`
- `synthesis` and `review` must integrate arguments across papers rather than
  serially summarizing each paper
- `review` paragraphs must use PEEL as a micro-argument structure, not a
  citation list

## References

- `references/routing.md` — source classification and routing logic
- `references/schema.md` — canonical `paper-record` contract
- `references/artifacts.md` — `researcher-profile` and higher-level artifacts
- `references/migration.md` — compatibility and alias mapping
- `references/modes/json.md` — machine-readable output rules
- `references/modes/interpret.md` — lightweight explanation path
- `references/modes/xray.md` — compact critique path
- `references/modes/scan.md` — single-paper quick triage
- `references/modes/deep-read.md` — full single-paper deconstruction
- `references/modes/card.md` — literature card only
- `references/modes/synthesis.md` — cross-paper integration
- `references/modes/review.md` — literature-review planning and writing
