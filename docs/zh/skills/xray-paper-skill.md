# X-Ray Paper Skill

Deep academic paper deconstructor — goes beyond summarization to extract the underlying logic model, critical assumptions, and napkin-worthy insights from research papers.

## Overview

This skill analyzes academic papers through a five-dimension framework, producing structured reports that capture what truly matters in a paper: the core problem, key insight, delta over prior work, critical weaknesses, and a distilled "napkin formula."

## Five-Dimension Analysis

| Dimension | What It Captures |
|-----------|-----------------|
| **Problem** | The core research question and why it matters |
| **Insight** | The key idea or approach that makes this work novel |
| **Delta** | What's genuinely new compared to prior work |
| **Critique** | Critical assumptions, weaknesses, and limitations |
| **Napkin Formula** | A distilled sketch of the core contribution |

## Usage

```bash
# Analyze a local PDF
/xray-paper-skill path/to/paper.pdf

# Analyze from URL
/xray-paper-skill https://arxiv.org/abs/2301.00001
```

## Workflow

1. Read the paper content (PDF, text, or URL)
2. Apply the Denoise → Extract → Critique pipeline
3. Produce structured five-dimension analysis
4. Generate ASCII logic flow diagram
5. Write org-mode report to `~/Documents/notes/`

## Output

Reports are saved as org-mode files with timestamped filenames:

```
~/Documents/notes/20240115T143022--xray-attention-mechanism-scaling__read.org
```

Each report includes:
- Five-dimension structured analysis
- ASCII logic flow diagram
- Key formulas and notation
- Critical assessment of claims

## When to Use

- Reading a new paper and want to quickly grasp its core contribution
- Preparing a literature review and need structured notes
- Evaluating whether a paper's claims hold up under scrutiny
- Building a personal knowledge base of research insights