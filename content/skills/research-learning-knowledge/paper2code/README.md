# paper2code

> Multi-source paper input in, citation-anchored implementation out.

`paper2code` is the repo-native, first-party version of the paper-to-code
workflow. It keeps the original paper2code discipline of ambiguity-first,
citation-anchored implementation, but removes the old arXiv-only entrypoint.

## Supported sources

Use one of these as the paper source:

- arXiv ID
- arXiv URL
- local `.pdf`
- OpenReview forum / paper page URL
- OpenReview direct PDF URL

Not supported in v1:

- DOI-only input
- generic landing pages outside OpenReview
- pasted raw paper text as the primary source

If you already downloaded the paper, give the local PDF path. That is the
preferred path over DOI lookup.

## Public interface

```text
/paper2code <paper-source> [--mode minimal|full|educational] [--framework pytorch|jax|numpy]
```

Examples:

```text
/paper2code 1706.03762
/paper2code https://arxiv.org/abs/1706.03762 --framework jax
/paper2code ./papers/flashattention.pdf --mode educational
/paper2code https://openreview.net/forum?id=H4DqfPSibmx
/paper2code https://openreview.net/pdf?id=H4DqfPSibmx --mode full
```

## What this skill does

The workflow is intentionally strict:

1. acquire and parse the paper into structured artifacts
2. identify the single core contribution
3. audit every implementation-relevant ambiguity
4. generate a minimal project with citation comments and explicit unspecified
   choices
5. generate a walkthrough notebook that ties paper passages to code

The output still looks like:

```text
{paper_slug}/
├── README.md
├── REPRODUCTION_NOTES.md
├── requirements.txt
├── src/
│   ├── model.py
│   ├── loss.py
│   ├── data.py
│   ├── train.py
│   ├── evaluate.py
│   └── utils.py
├── configs/
│   └── base.yaml
└── notebooks/
    └── walkthrough.ipynb
```

## What makes it different

- every non-trivial line of code is anchored to paper sections or equations
- unspecified choices are flagged instead of being silently invented
- official code links are treated as a reference, not as unquestioned truth
- appendices, footnotes, and algorithm boxes are treated as first-class
  implementation sources

## What it will not do

- it will not pretend a DOI is enough when the PDF is unavailable
- it will not crawl arbitrary paper landing pages outside OpenReview
- it will not invent missing hyperparameters without marking them
- it will not implement baselines, deployment infrastructure, or unrelated
  engineering layers unless they are the core contribution

## When to use `paper-workbench` instead

Use `paper-workbench` when the job is reading, comparing, synthesizing, or
review-planning from paper sources. Use `paper2code` when the job is to turn one
paper into an implementation scaffold.

## Included assets

- `pipeline/` — the five-stage reasoning flow
- `guardrails/` — anti-hallucination and scope controls
- `knowledge/` — ML implementation references
- `scaffolds/` — project output templates
- `scripts/fetch_paper.py` — multi-source paper acquisition
- `scripts/extract_structure.py` — section / equation / table extraction
- `tests/` — source handling and acquisition coverage
- `evals/evals.json` — realistic trigger prompts
