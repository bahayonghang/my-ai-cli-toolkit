# Adaptive Sparse Memory for Long-Horizon Failure Prediction

**Authors**: Y. Chen, R. Singh  
**Venue**: Applied ML Systems 2026

## Abstract

Failure prediction models on long equipment histories tend to overfit frequent
maintenance tokens and underweight rare precursor patterns. We introduce Adaptive
Sparse Memory (ASM), which compresses long histories into memory slots and uses
an uncertainty-aware selector to choose which slots enter the prediction head.
ASM improves AUROC by 3.1 points against a recurrent baseline and reduces wall
clock latency by 29 percent on a simulated plant benchmark.

## Why prior work struggled

Earlier sequence models treated long histories uniformly, which diluted the rare
signals that mattered for early failure detection. Heuristics that truncated the
history improved speed but often removed the exact precursor events needed by
the classifier.

## Mechanism

ASM writes fixed-size summaries into a memory bank. A selector estimates which
summaries are both informative and uncertain, then forwards only that subset to
the prediction head. This is meant to preserve early warning evidence while
controlling compute.

## Limitations

The method assumes the training distribution includes precursor patterns similar
to deployment. The paper does not test label noise, cross-factory transfer, or
operators changing maintenance routines after rollout.
