# Paper Workbench

Primary entrypoint for unified paper lookup, normalization, interpretation, and x-ray-style paper analysis.

## Overview

`paper-workbench` is now the main skill for paper-facing workflows in this catalog.
It consolidates the older split between lookup, normalization, plain-language interpretation, and deeper paper deconstruction.

## Primary modes

| Mode | Purpose |
|------|---------|
| default arXiv-compatible entry | arXiv / AlphaXiv-aware paper lookup and ingestion |
| `--mode interpret` | explain a paper for understanding and reuse |
| `--mode xray` | deconstruct a paper into logic model, delta, and critique |

## When to use it

- user shares an arXiv URL, AlphaXiv URL, paper page, PDF, or paper ID
- user wants a normalized machine-readable paper record
- user wants a plain-language explanation of a paper
- user wants a deeper reviewer-style or logic-model breakdown
- you are building a new paper-analysis workflow and want the canonical entrypoint

## Core workflow

1. resolve the paper source
2. normalize it through the shared paper ingestion path
3. choose the requested analysis mode
4. return either structured paper data or a mode-specific interpretation

## Input types

`paper-workbench` is designed to accept:

- arXiv IDs
- arXiv URLs
- AlphaXiv URLs
- local PDFs
- local text files
- paper landing-page URLs
- normalized `paper-record` JSON records
- pasted paper text when the chosen mode supports direct analysis

## Notes

- `paper-workbench` now owns its bundled normalization, interpretation, and x-ray assets directly.
- Prefer `paper-workbench` when documenting or teaching the current paper workflow surface.
