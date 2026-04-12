# Paper Workflows

This guide explains how to use `paper-workbench` as the canonical workflow surface for academic papers in this repository.

Use it when the job starts with a paper-like source and ends in one of these outcomes:

- a reusable normalized `paper-record`
- a quick single-paper decision about whether to read further
- a full deep-read tied to the user’s own research question
- a cross-paper synthesis and gap map
- a literature-review outline or paragraph draft

## Recommended flow

1. normalize the paper source into `paper-record`
2. inspect `status`, `provenance.confidence`, `warnings`, and `errors`
3. create or load a `researcher-profile` if the task is profile-sensitive
4. choose the right single-paper or multi-paper mode
5. save reusable artifacts into a workspace when the task spans multiple papers or sessions

That flow keeps downstream analysis grounded in one fact layer while still supporting higher-level reading and review work.

## Workflow stages

| Stage | Primary mode or artifact | What it gives you |
|-------|--------------------------|-------------------|
| intake | `json` -> `paper-record` | Canonical paper facts |
| triage | `scan` | Decide whether the paper deserves close reading |
| single-paper analysis | `deep-read` or `card` | Strategic single-paper understanding |
| compatibility analysis | `interpret` or `xray` | Lightweight explanation or compact critique |
| cross-paper integration | `synthesis` | Concept map, debate spectrum, method matrix, gap map |
| review construction | `review` | Narrative strategy, outline, paragraph drafting support |

## Choosing a mode

| Goal | Recommended mode | Why |
|------|------------------|-----|
| inspect or save canonical paper facts | `json` | Best starting point and best handoff format |
| decide whether a paper is worth close reading | `scan` | Fastest grounded triage |
| analyze one paper against the user’s own research problem | `deep-read` | Full deconstruction plus strategic relevance |
| keep only reusable notes for later writing | `card` | Compact, review-ready output |
| explain a paper without the full deep-read structure | `interpret` | Lightweight human-readable output |
| challenge the logic model, assumptions, and delta | `xray` | Reviewer-style compact critique |
| integrate 3 or more papers | `synthesis` | Cross-paper comparison and gap finding |
| build a literature review or write a review paragraph | `review` | Turns synthesis into structure and prose support |

If you are unsure:

- single paper, human reading request: start with `scan`
- single paper, machine-readable or save-oriented request: start with `json`
- 3 or more papers and a comparison request: start with `synthesis`

## Researcher profile

`deep-read`, `card`, `synthesis`, and `review` are stronger when you anchor them to a `researcher-profile`.

The profile fields are:

- research field
- core research question
- thesis or tentative claim, if available
- target tier
- current stage

Use a profile when you need the system to answer questions like:

- Why does this paper matter for my topic?
- Does this finding support, challenge, or complicate my thesis?
- Which gap is the best fit for my project?
- What review structure fits my current literature set?

## Artifact reuse

Use reusable artifacts when the workflow spans multiple turns or papers.

| Artifact | Use it when |
|----------|-------------|
| `paper-record` | intake is done and you do not want to re-fetch or re-parse |
| `paper-deep-read` | one paper has already been analyzed and you want to reuse its strategic reading output |
| `literature-synthesis` | multi-paper integration is already done and you want to move into review planning |
| `review-outline` | you want to continue refining structure or paragraphs later |

Recommended workspace layout:

```text
workspace/
├── researcher_profile.json
├── paper_deep_read/
├── literature_synthesis/
└── review_outline/
```

## Typical workflows

### 1. Quick screen for a new paper

Use this when you just downloaded a paper and want to know whether it deserves close reading.

Recommended sequence:

1. normalize the source
2. run `scan`
3. if the relevance is high, continue with `deep-read`

This is the best path for triaging a large stack of newly collected papers.

### 2. Deep-read one paper against your project

Use this when a paper looks promising and you need more than a summary.

Recommended sequence:

1. load or create a `researcher-profile`
2. normalize the source if needed
3. run `deep-read`
4. save a `paper-deep-read` artifact if you expect to reuse the output

This is the mode that answers “what does this paper do, and what does it do for my project?”

### 3. Build reusable paper cards

Use this when you want notes you can plug into a later review without carrying the full report.

Recommended sequence:

1. normalize the source
2. load the profile if strategic relevance matters
3. run `card`
4. save the card output if you are building a literature bank

This is a good path when you want many lightweight but reusable paper notes.

### 4. Integrate multiple papers and map gaps

Use this when you already have 3 or more papers and need to understand the field structure.

Recommended sequence:

1. collect 3 or more `paper-record` or `paper-deep-read` inputs
2. load the `researcher-profile`
3. run `synthesis`
4. save a `literature-synthesis` artifact

If you only have 2 inputs, treat the result as comparison-first and gap-finding as provisional.

### 5. Move from synthesis to review writing

Use this when integration is done and the next job is to structure or draft the review.

Recommended sequence:

1. start from `literature-synthesis`, or from 3 or more `paper-deep-read` artifacts plus a profile
2. run `review`
3. choose the proposed narrative strategy
4. use the outline and PEEL paragraph support to draft sections

This is the handoff point from literature reading into review construction.

## Source routing and expected fidelity

| Source type | Metadata path | Full-text path | Typical outcome | Common fallback or limit |
|-------------|---------------|----------------|-----------------|--------------------------|
| arXiv ID / arXiv URL / AlphaXiv URL | AlphaXiv paper API | AlphaXiv markdown when available, otherwise arXiv PDF fallback | Often the highest-fidelity preprint path | If AlphaXiv coverage is missing, the flow falls back to PDF parsing |
| DOI / DOI URL | Crossref | Usually none | Metadata-rich but often text-poor | `--fulltext prefer` does not guarantee full text |
| local PDF | local extraction | same source | Strong when the PDF contains extractable text | Requires PyMuPDF-compatible extraction |
| local `.txt`, `.md`, `.org` | direct parsing from local file | same source | Strong for theses, drafts, and already-extracted text | Sparse text may still end up `partial` |
| remote PDF URL | downloaded PDF | same source | Good when you already have the direct PDF link | Poor PDF text quality lowers summary quality |
| paper landing page | page metadata plus resolved PDF | resolved PDF only | Works when the page exposes a PDF | No exposed PDF means `unresolved` |
| existing `paper-record` | trust the record | reuse the record | Fastest and most stable path | Only re-fetch if the record is clearly missing required facts |

## Grounding and evidence notes

- `paper-record` remains the fact layer
- `content.page_chunks` provides page-level anchors, not paragraph-level citation precision
- if a requested page or quote cannot be grounded in the available anchors, the correct fallback is `[信息待核实]`
- do not treat DOI metadata as if it were full text

## Troubleshooting

### The landing page returned `unresolved`

Likely cause: the page did not expose a PDF link or PDF meta tag.

What to do:

- use the direct PDF URL if you can find it
- use a DOI if you only need metadata
- save the PDF locally and intake it as a local file

### DOI worked, but the record still lacks full text

Likely cause: DOI intake currently uses Crossref metadata and does not unlock the paper body.

What to do:

- accept the metadata-only result for light explanation
- switch to PDF or local text intake for deeper analysis

### Local PDF extraction failed

Likely cause: local PDF extraction requires `pymupdf` or `fitz`, or the PDF has poor extractable text.

What to do:

- install a PyMuPDF-compatible extractor
- use a local text export when available
- try a cleaner PDF source

### You only have pasted freeform paper text

Current limitation: `normalize_paper.py` does not treat arbitrary pasted text as a first-class input path today.

What to do:

- save the text as `.txt`, `.md`, or `.org`
- or turn it into a normalized `paper-record` first, then reuse that artifact

## Related pages

- [Paper Workbench skill reference](/skills/research-learning-knowledge/paper-workbench)
- [Skills overview](/skills/)
