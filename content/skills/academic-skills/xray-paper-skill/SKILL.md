---
name: xray-paper-skill
description: >
  Deconstruct academic papers into core contributions, hidden assumptions,
  critical limitations, and napkin-worthy insights. Use this skill whenever
  the user asks to read, understand, explain, critique, break down, or "x-ray"
  a research paper; shares a local paper file, paper URL, arXiv or alphaxiv
  link, or pasted paper text; or asks for contributions, novelty, method
  intuition, assumptions, limitations, or reviewer-style analysis. Trigger
  even when the user says "summarize this paper" if the real need is to expose
  the paper's logic model rather than only paraphrase the abstract.
metadata:
  category: academic-writing
  tags: [paper-analysis, deconstruction, academic, research, critique, arxiv]
  version: "2.0"
  last_updated: "2026-03-13"
user-invocable: true
argument-hint: "[paper-path|paper-url] [--save PATH] [--lang LANG]"
allowed-tools: Read, Write, WebFetch, Bash(python *)
---

# X-Ray Paper Skill

Act as a paper deconstructor. Your job is to expose the paper's logic model,
not to restate the abstract in cleaner words.

## Core Behavior

- Lead with deconstruction: problem, insight, delta, critique, napkin model.
- Keep language plain and information-dense.
- Call out at least one hidden assumption or unresolved issue whenever the
  source gives enough evidence.
- If the user explicitly asks for a summary, prepend a 1-2 sentence summary,
  then continue with the full x-ray breakdown.
- Default to replying in the conversation. Save a file only when the user
  explicitly passes `--save PATH` or clearly asks for a saved report.

## Workflow

### Step 1: Resolve the source

Use this priority order:

1. Explicit `$ARGUMENTS` source
2. A URL or substantial paper text pasted in the latest user message
3. Ask the user for a paper source

Treat the source as one of these types:

- **Local `.pdf`**: run
  `python "$SKILL_DIR/scripts/xray_io.py" extract --source "<path>"`
- **Local `.txt`, `.md`, `.org`**: read the file directly
- **Web URL / arXiv abs / alphaxiv page**: fetch the page with `WebFetch`
- **Raw remote `.pdf` URL**: do not pretend support; ask the user for a local
  PDF or pasted text instead
- **Pasted paper text**: use the pasted text directly

If PDF extraction fails because PyMuPDF is unavailable, report the missing
dependency and ask for an alternate input format instead of fabricating support.

### Step 2: Load the framework

Read both:

- `$SKILL_DIR/resources/ANALYSIS_FRAMEWORK.md`
- `$SKILL_DIR/resources/TEMPLATE.org`

Use the framework to drive the reasoning, and use the template only as the save
format when the user requested a file.

### Step 3: Extract metadata carefully

Infer, when available:

- title
- authors
- venue
- source URL or local path

If a field is not recoverable from the source, render it as `unknown`.
Never invent authors, venue, metrics, or baselines.

### Step 4: Apply the x-ray method

Follow the framework sequence:

1. Denoise
2. Extract
3. Critique

Prioritize:

- the concrete problem that mattered
- the author's key insight
- the 1-2 decisive moves that made the method work
- the true delta versus prior work
- the assumptions or edge conditions that the result depends on

### Step 5: Produce this output structure

Use this section order in the chat response:

```markdown
# Paper X-Ray
## Two-Line Summary        (only when user asked for summary)
## Problem
## Insight
## Delta
## Critique
## Logic Flow
## Napkin Formula
## Napkin Sketch
```

Section guidance:

- **Problem**: one-sentence problem definition + why prior work struggled
- **Insight**: the author's core intuition in plain language + 1-2 decisive steps
- **Delta**: what improved, what changed, and what new piece of knowledge this adds
- **Critique**: hidden assumptions, boundary conditions, unresolved questions
- **Logic Flow**: ASCII pipeline using only basic ASCII symbols
- **Napkin Formula**: a one-line compression of the paper's logic
- **Napkin Sketch**: a simple ASCII sketch of the core mechanism

Keep the response structured and compact. Prefer bullets and short paragraphs
over long narrative blocks.

### Step 6: Handle optional saving

Only save when `--save PATH` is present or the user explicitly asks for a file.

To resolve the output path, run:

`python "$SKILL_DIR/scripts/xray_io.py" resolve-save --save-path "<path>" --title "<paper-title>"`

Save the Org report to the resolved path. Do not automatically open it.

Save behavior:

- If `PATH` is a directory, write `{timestamp}--xray-{short-title}__read.org`
- If `PATH` is a file path, write exactly there

## Output Quality Bar

- **High density**: remove fluff and background filler
- **Plain language**: explain the mechanism without academic fog
- **Critical**: identify at least one real assumption or unresolved issue when possible
- **Faithful**: do not overclaim beyond the source text
- **ASCII only** for diagrams and sketches

## Failure Handling

- If the source cannot be read, say exactly which input class failed and why
- If the source is too short to support a real critique, say so explicitly
- If the paper is a webpage summary rather than full paper text, note that the
  critique is limited by source fidelity
