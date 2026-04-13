# Paper Workbench

Primary literature-workbench entrypoint for the current academic skill catalog.

`paper-workbench` is no longer just a paper normalizer plus two readout modes. It now covers the full paper workflow surface: normalize a source into `paper-record`, anchor analysis with a `researcher-profile`, produce reusable single-paper artifacts, integrate multiple papers, and plan literature-review writing.

## When to use it

- the user gives you a paper-like source and wants more than raw parsing
- the task is to skim, deep-read, card, compare, synthesize, map gaps, or build a review from papers
- you want one canonical paper artifact before doing repeated downstream analysis
- you want multi-paper output to stay grounded in normalized facts instead of re-reading each source ad hoc

## When not to use it

- use `bib-search-citation` when the main job is searching or filtering a `.bib` library
- use an implementation-focused workflow when the main job is turning a model paper into runnable code
- use `academic-slides` after paper analysis is already done and the next job is presentation output

## Public interfaces

| Interface | Purpose |
|-----------|---------|
| `paper-record` | Canonical normalized single-paper facts |
| `researcher-profile` | User research anchor for relevance, positioning, and review planning |
| `paper-deep-read` | Reusable single-paper strategic analysis artifact |
| `literature-synthesis` | Cross-paper integration artifact |
| `review-outline` | Review-planning artifact for structure and paragraph drafting |

## Supported inputs

| Input | Intake path | Notes |
|------|-------------|-------|
| arXiv ID / arXiv URL / AlphaXiv URL | Prefer AlphaXiv metadata and overview, then fall back to arXiv PDF parsing | Best path for preprints when AlphaXiv has coverage |
| DOI string or `doi.org/...` URL | Crossref metadata lookup | Often metadata-rich but text-poor |
| local PDF | Local text extraction | Requires PyMuPDF-compatible local PDF extraction |
| local `.txt`, `.md`, `.org` | Direct local text parsing | Good for theses, drafts, and cleaned exports |
| remote PDF URL | Download then parse | Useful when a direct PDF URL is already known |
| landing page URL with an exposed PDF | Resolve PDF from page metadata or links, then parse | Returns `unresolved` if the page does not expose a PDF |
| existing `paper-record` JSON | Reuse directly | Fastest path when normalization already happened earlier |
| existing workbench artifact JSON | Reuse profile, deep-read, synthesis, or review state | Best for iterative literature work |

## Modes

| Mode | Output | Best for |
|------|--------|----------|
| `scan` | Quick triage with article type, intent, core claim, relevance, and reading advice | “Is this worth reading closely?” |
| `deep-read` | Full paper deconstruction plus strategic relevance | Single-paper analysis tied to the user’s own research |
| `card` | Literature card plus short critical summary | Reusable notes for later review writing |
| `synthesis` | Concept map, debate spectrum, method matrix, gap map, and relation network | Integrating 3 or more papers |
| `review` | Narrative strategy, structured outline, and PEEL-style paragraph support | Literature review planning and drafting |
| `json` | Exact normalized `paper-record` payload | Reuse, inspection, chaining into later steps |
| `interpret` | Grounded explanation using normalized facts | Lightweight understanding and walkthroughs |
| `xray` | Compact logic-model critique using normalized facts | Reviewer-style assumptions, delta, and boundary analysis |

## Default behavior

- single paper, human reading request, no explicit mode: default to `scan`
- machine-readable, save-oriented, or schema-oriented request: default to `json`
- 3 or more papers asking for comparison or integration: default to `synthesis`

## Key arguments

| Argument | Meaning |
|----------|---------|
| `--mode scan|deep-read|card|synthesis|review|json|interpret|xray` | Select the output surface |
| `--profile PATH` | Reuse a saved `researcher-profile` JSON file |
| `--workspace PATH` | Save reusable workbench artifacts into a workspace |
| `--save PATH` | Save the normalized `paper-record` JSON artifact |
| `--lang LANG` | Language used when fetching AlphaXiv overview content; default is `en` |
| `--fulltext auto|prefer|never` | Control whether extracted full text is embedded into the normalized record |

### `--fulltext` behavior

- `auto`: include full text when the extracted source is short enough or when the record lacks a usable summary
- `prefer`: try harder to include full text when a source path exists
- `never`: keep the record metadata-and-summary oriented

`prefer` is still not a guarantee. DOI intake can remain metadata-only when no full-text source is available.

## What stays in `paper-record`

`paper-record` remains the normalization layer. Its main sections are:

- `source`: what the user supplied and what canonical or resolved URL was found
- `document`: high-level type signals such as `preprint`, `conference-paper`, `journal-article`, or `thesis`
- `bibliography`: title, authors, year, venue, DOI, abstract, and keywords
- `content`: summary, problem, method, results, sections, page-level anchors, and optional extracted full text
- `arxiv_enhancement`: AlphaXiv-derived arXiv metadata, key insights, and citations when available
- `provenance`: metadata sources, content sources, warnings, and confidence

### `content.page_chunks`

`page_chunks` adds page-level anchors for downstream grounding. It is useful for pointing to the right page region, but it is not paragraph-precise citation support. If a requested page or quote cannot be grounded in the available anchors, downstream modes should surface `[信息待核实]` instead of inventing evidence.

## Persistence workflow

Use `researcher-profile` plus workspace artifacts when the user wants continuity across papers or sessions.

Recommended layout:

```text
workspace/
├── researcher_profile.json
├── paper_deep_read/
├── literature_synthesis/
└── review_outline/
```

`paper-workbench` uses `scripts/workbench_io.py` for profile initialization and artifact saving.

## Status and fidelity

| Status | Meaning |
|--------|---------|
| `resolved` | Enough structured facts exist for downstream analysis |
| `partial` | Some useful metadata exists, but important content fields are still missing |
| `unresolved` | The source could not be converted into a usable normalized record |

Check `status`, `provenance.confidence`, `provenance.warnings`, and `errors` before trusting deep-read, synthesis, or review output.

## Current limitations

- DOI intake still depends on Crossref metadata and may not include full text
- generic landing pages must expose a PDF link or PDF meta tag to become parseable
- local PDF extraction needs `pymupdf` or `fitz`
- page anchors are page-level, not paragraph-level
- freeform pasted paper text is not a current `normalize_paper.py` input path; use a local text file or a normalized record instead

## What is currently covered by tests

The bundled tests currently cover:

- local PDF normalization
- local master-thesis and doctoral-thesis text fixtures
- normalized JSON passthrough
- DOI intake through mocked Crossref metadata
- arXiv intake through mocked AlphaXiv metadata
- landing-page failure when no PDF is exposed
- `researcher-profile` creation
- artifact save flow for `paper-deep-read`

## Main support assets

- `scripts/normalize_paper.py` - normalization entrypoint for source detection and `paper-record` generation
- `scripts/xray_io.py` - local extraction helpers for PDFs and text files
- `scripts/workbench_io.py` - profile and artifact persistence helpers
- `references/schema.md` - canonical normalized schema
- `references/artifacts.md` - higher-level workbench artifact contracts
- `references/routing.md` - source classification and mode routing
- `references/modes/*.md` - downstream mode-specific handoff rules

## Related docs

- [Paper Workflows](/guide/paper-workflows)
- [Academic Skills Overview](/skills/)
