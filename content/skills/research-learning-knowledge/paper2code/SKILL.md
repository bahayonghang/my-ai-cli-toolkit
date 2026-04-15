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
allowed-tools: Read, Write, WebFetch, Bash(python *), Bash(pytest *)
---

# paper2code

Repo-native successor to the arXiv-only reference workflow. Keep the original
paper2code discipline:

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

If the user already has a paper PDF locally, prefer the local PDF path over
network retrieval.

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

If the source is unsupported, fail fast with a clear reason. Do not silently
fall back to unrelated fetch logic.

## Dependency gate

This workflow depends on the bundled Python scripts and their parser packages.
Before running the pipeline:

1. verify the relevant files under `scripts/`, `pipeline/`, `guardrails/`,
   `knowledge/`, and `scaffolds/` exist
2. verify Python dependencies are available

If dependencies are missing, report the missing packages and the install command
needed. Do not silently install new dependencies unless the user explicitly
asked for environment setup.

Suggested command when setup is approved:

```bash
python -m pip install pymupdf4llm pdfplumber pymupdf requests pyyaml
```

## Set up working directory

Run the acquisition script first so it can determine the `PAPER_KEY`. Use a
temporary directory of the form:

`.paper2code_work/{PAPER_KEY}/`

All intermediate artifacts live there. The final generated project goes in the
current directory under `{paper_slug}/`.

## Execute pipeline

### Stage 1 — Paper acquisition and parsing

Read and follow: `pipeline/01_paper_acquisition.md`

Run:

```bash
python "$SKILL_DIR/scripts/fetch_paper.py" "$PAPER_SOURCE" ".paper2code_work"
```

The script should:

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

Stop here if acquisition artifacts are missing. Do not continue into codegen
with partial paper text unless the pipeline document explicitly allows it.

### Stage 2 — Contribution identification

Read and follow: `pipeline/02_contribution_identification.md`

Write:

`.paper2code_work/{PAPER_KEY}/contribution.md`

The output must isolate the single core contribution that will define scope.

### Stage 3 — Ambiguity audit

Read and follow: `pipeline/03_ambiguity_audit.md`

Before that stage, also read:

- `guardrails/hallucination_prevention.md`

Write:

`.paper2code_work/{PAPER_KEY}/ambiguity_audit.md`

If the ambiguity audit says a detail is unspecified, preserve that uncertainty.
Do not "fill the gap" with a confident guess.

### Stage 4 — Code generation

Read and follow: `pipeline/04_code_generation.md`

Before writing code, also read:

- `guardrails/scope_enforcement.md`
- `guardrails/badly_written_papers.md`
- the relevant files in `knowledge/`
- the scaffold templates in `scaffolds/`

Generate the project under `{paper_slug}/` in the current working directory.

### Stage 5 — Walkthrough notebook

Read and follow: `pipeline/05_walkthrough_notebook.md`

Generate:

`{paper_slug}/notebooks/walkthrough.ipynb`

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

## Honesty rules

- never claim parity with the original paper unless it was actually reproduced
- never invent missing hyperparameters without marking them
- never let unrelated engineering polish expand the scope
- if official code exists, treat it as a reference, not unquestioned ground
  truth

## Cleanup

Remove `.paper2code_work/` only after successful completion. If the workflow
fails midstream, keep the work directory so the user can inspect artifacts.

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

If the run stopped early, replace the success marker with a failure summary that
names the exact failing stage and the artifact or dependency that blocked it.

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
