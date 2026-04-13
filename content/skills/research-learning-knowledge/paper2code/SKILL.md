---
name: paper2code
description: >
  Citation-anchored paper-to-code workflow for turning research papers into a
  minimal, honest Python implementation. Use this whenever the user wants to
  implement a paper from an arXiv ID, arXiv URL, local PDF, OpenReview forum
  page, or OpenReview PDF URL. Trigger even when the user says things like
  “implement this paper”, “复现这篇”, or “把这篇论文写成代码” without naming
  the source type explicitly. Reject DOI-only requests and unsupported landing
  pages instead of pretending the paper can be fetched.
category: research-learning-knowledge
tags: [paper, implementation, replication, arxiv, openreview, pdf, pytorch, research]
version: "0.1.0"
argument-hint: "[paper-source] [--mode minimal|full|educational] [--framework pytorch|jax|numpy]"
allowed-tools: Read, Write, WebFetch, Bash(python *), Bash(pip install *)
---

# paper2code

Repo-native successor to the arXiv-only reference workflow. Keep the original
paper2code principles:

- cite every non-trivial implementation choice back to the paper
- audit ambiguities before writing code
- mark unspecified details honestly
- generate a runnable, minimal project rather than a vague sketch

## Supported paper sources

Accept exactly these inputs:

- arXiv ID
- arXiv URL
- local `.pdf`
- OpenReview forum / paper page URL
- OpenReview direct PDF URL

Reject these explicitly:

- DOI-only inputs
- generic landing pages outside OpenReview
- pasted raw paper text as the primary source

If the user already has a paper PDF locally, prefer the local PDF path over DOI
lookup.

## Parse arguments

Extract:

- `PAPER_SOURCE` — the paper input supplied by the user
- `MODE` — `minimal` (default), `full`, or `educational`
- `FRAMEWORK` — `pytorch` (default), `jax`, or `numpy`

Normalize the source into one of these internal source kinds:

- `arxiv_id`
- `arxiv_url`
- `local_pdf`
- `openreview_page`
- `openreview_pdf`

If the source is unsupported, fail fast with a clear message. Do not silently
fall back to unrelated fetch logic.

## Set up working directory

Run the acquisition script first so it can determine the `PAPER_KEY`. Use a
temporary directory of the form:

`.paper2code_work/{PAPER_KEY}/`

All intermediate artifacts live there. The final generated project still goes in
the current directory under `{paper_slug}/`.

## Install dependencies

Run:

```bash
pip install pymupdf4llm pdfplumber pymupdf requests pyyaml
```

## Execute pipeline

### Stage 1 — Paper Acquisition and Parsing

Read and follow: `pipeline/01_paper_acquisition.md`

Run:

```bash
python "$SKILL_DIR/scripts/fetch_paper.py" "$PAPER_SOURCE" ".paper2code_work"
```

The script will:

- classify the source kind
- create `.paper2code_work/{PAPER_KEY}/`
- fetch or read the paper
- write `paper_text.md`, `paper_metadata.json`, and `paper.pdf` when a PDF
  exists locally

Then run structure extraction:

```bash
python "$SKILL_DIR/scripts/extract_structure.py" \
  ".paper2code_work/{PAPER_KEY}/paper_text.md" \
  ".paper2code_work/{PAPER_KEY}"
```

Verify the outputs exist before moving on. If acquisition or extraction fails,
follow the fallback protocol in `pipeline/01_paper_acquisition.md`.

### Stage 2 — Contribution Identification

Read and follow: `pipeline/02_contribution_identification.md`

Write the contribution analysis to:

`.paper2code_work/{PAPER_KEY}/contribution.md`

### Stage 3 — Ambiguity Audit

Read and follow: `pipeline/03_ambiguity_audit.md`

Before that stage, also read:

- `guardrails/hallucination_prevention.md`

Write the audit to:

`.paper2code_work/{PAPER_KEY}/ambiguity_audit.md`

### Stage 4 — Code Generation

Read and follow: `pipeline/04_code_generation.md`

Before writing code, also read:

- `guardrails/scope_enforcement.md`
- `guardrails/badly_written_papers.md`
- the relevant files in `knowledge/`
- the scaffold templates in `scaffolds/`

Generate the project under `{paper_slug}/` in the current working directory.

### Stage 5 — Walkthrough Notebook

Read and follow: `pipeline/05_walkthrough_notebook.md`

Generate:

`{paper_slug}/notebooks/walkthrough.ipynb`

## Cleanup

Remove `.paper2code_work/` after successful completion.

## Final output

Print:

```text
✓ paper2code complete for: {paper_title}
  Source kind: {source_kind}
  Output directory: {paper_slug}/
  Files generated: {list of files}
  Unspecified choices: {count} (see REPRODUCTION_NOTES.md)
  Mode: {MODE} | Framework: {FRAMEWORK}
```

## Mode-specific behavior

- `minimal`
  - implement only the core contribution
  - include a training loop only when the contribution itself is a training
    method
- `full`
  - include the core contribution plus the full training/data/evaluation
    skeletons that are within scope
- `educational`
  - same scope as `minimal`, but add extra teaching comments and a richer
    walkthrough notebook

## Guardrails

Always apply:

- `guardrails/hallucination_prevention.md`
- `guardrails/scope_enforcement.md`
- `guardrails/badly_written_papers.md`

## Knowledge base

Consult the relevant knowledge files before implementing:

- Transformer layers, attention, positional encoding →
  `knowledge/transformer_components.md`
- Optimizers, LR schedules, batch size semantics →
  `knowledge/training_recipes.md`
- Cross-entropy, contrastive loss, diffusion loss, ELBO →
  `knowledge/loss_functions.md`
- Framework-specific pitfalls and notation mismatches →
  `knowledge/paper_to_code_mistakes.md`
