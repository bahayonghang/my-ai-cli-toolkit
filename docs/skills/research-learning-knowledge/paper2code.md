# paper2code

Repo-native paper-to-code skill for turning one research paper into a
citation-anchored implementation scaffold.

## When to use it

- you want to implement a paper rather than merely read or summarize it
- the source is an arXiv paper, local PDF, or OpenReview paper
- you want ambiguity handling, reproduction notes, and code that points back to
  the paper

## When not to use it

- use `paper-workbench` when the job is reading, synthesizing, or planning a
  literature review
- do not use this for DOI-only intake
- do not use this for arbitrary paper landing pages outside OpenReview

## Supported inputs

- arXiv ID
- arXiv URL
- local PDF path
- OpenReview forum / paper page URL
- OpenReview direct PDF URL

## Public interface

```text
/paper2code <paper-source> [--mode minimal|full|educational] [--framework pytorch|jax|numpy]
```

Examples:

```text
/paper2code 1706.03762
/paper2code https://arxiv.org/abs/1706.03762
/paper2code ./papers/flashattention.pdf --mode educational
/paper2code https://openreview.net/forum?id=H4DqfPSibmx
/paper2code https://openreview.net/pdf?id=H4DqfPSibmx --mode full
```

## What it produces

```text
{paper_slug}/
├── README.md
├── REPRODUCTION_NOTES.md
├── requirements.txt
├── src/
├── configs/
└── notebooks/
```

Key guarantees:

- every non-trivial implementation decision is citation-anchored
- unspecified paper details are flagged explicitly
- ambiguity is audited before code generation
- official code is treated as a reference, not silent truth

## Non-goals

- DOI fetch as a primary input path
- arbitrary non-OpenReview landing page scraping
- silent default-filling when the paper is vague

## Relationship to `paper-workbench`

Use `paper-workbench` to read and analyze papers. Use `paper2code` when the
deliverable is runnable code plus reproduction notes.
