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
category: research-learning-knowledge
tags:
  [
    paper,
    research,
    normalization,
    literature-review,
    synthesis,
    doi,
    arxiv,
    analysis,
  ]
version: "1.1.0"
argument-hint: "[paper-source-or-artifact] [--mode scan|deep-read|card|synthesis|review|json|interpret|xray] [--workspace PATH] [--profile PATH] [--save PATH] [--lang LANG] [--fulltext auto|prefer|never]"
allowed-tools: Read, Write, WebFetch, Bash(curl *), Bash(python *), Bash(pytest *)
---

# Paper Workbench

Unified entrypoint for paper intake, strategic reading, multi-paper synthesis,
and review construction.

Keep `paper-record` as the normalization layer. Do not merge high-level
analysis back into the normalized record.

> In the `python` commands below, `<skill-dir>` is this skill's base directory,
> announced when the skill loads. Substitute that literal path; it is not an
> environment variable. Bundled scripts self-locate, so only the path needs to
> resolve.

## When to use

Use this skill when the job is to:

- read one paper quickly
- deeply deconstruct one paper
- compare or synthesize multiple papers
- build a review outline or gap map
- normalize paper sources into reusable machine-readable artifacts

Do not use this skill when the primary job is to implement a paper from its
methods into working code. That implementation work is out of scope for this
skill.

## Public interfaces

- `paper-record` — normalized single-paper facts
- `researcher-profile` — user research anchor
- `paper-deep-read` — single-paper strategic analysis artifact
- `literature-synthesis` — cross-paper integration artifact
- `review-outline` — literature-review planning artifact

## Accepted inputs

- arXiv IDs and arXiv URLs
- AlphaXiv URLs
- DOI strings or `doi.org/...` URLs
- local academic PDFs or text files
- remote PDF URLs
- paper landing pages that expose a PDF
- existing `paper-record` JSON
- existing `researcher-profile`, `paper-deep-read`, `literature-synthesis`, or
  `review-outline` JSON

## Routing workflow

1. Resolve the input class from `$ARGUMENTS`, the latest user message, or a
   pasted JSON artifact.
2. If the request is paper-level and not already normalized, run
   `scripts/normalize_paper.py` first.
3. Determine the mode from explicit user intent or the defaulting rules below.
4. If the chosen mode is profile-sensitive, load the supplied
   `researcher-profile` or collect only the missing fields.
5. Produce the requested mode output.
6. Persist artifacts only when the user asked to save them.

## Mode quick guide

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
- If the user provides exactly 2 papers and asks for integration, run a
  comparison-oriented `synthesis` and mark any gap mapping as provisional

## Normalize first

For any paper-like input, run:

```bash
python "<skill-dir>/scripts/normalize_paper.py" \
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

If the user clearly wants no back-and-forth, proceed with a generic
profile-light analysis and explicitly mark that personalization is limited.

If the user wants persistence, create or update the profile with:

```bash
python "<skill-dir>/scripts/workbench_io.py" init-profile \
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
python "<skill-dir>/scripts/workbench_io.py" save-artifact \
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
- If the input evidence is too thin for the requested mode, downgrade the claim
  strength instead of pretending full coverage

## Edge cases

- Mixed raw sources + existing JSON artifacts:
  - normalize raw sources first, then merge at the artifact layer
- More than one paper but user asks for `deep-read`:
  - either choose the clearly primary paper or ask which one to focus on
- DOI metadata only and no reachable full text:
  - return the strongest metadata available and mark missing full-text facts

## References

- `references/routing.md` — source classification and routing logic
- `references/schema.md` — canonical `paper-record` contract
- `references/artifacts.md` — `researcher-profile` and higher-level artifacts
- `references/migration.md` — compatibility and alias mapping
- `references/ANALYSIS_FRAMEWORK.md` — x-ray five-dimension critique framework
- `references/template-paper.org` — Org sidecar template for deep-read / interpret output
- `references/template-xray.org` — Org sidecar template for x-ray critique output
- `references/modes/json.md` — machine-readable output rules
- `references/modes/interpret.md` — lightweight explanation path
- `references/modes/xray.md` — compact critique path
- `references/modes/scan.md` — single-paper quick triage
- `references/modes/deep-read.md` — full single-paper deconstruction
- `references/modes/card.md` — literature card only
- `references/modes/synthesis.md` — cross-paper integration
- `references/modes/review.md` — literature-review planning and writing
