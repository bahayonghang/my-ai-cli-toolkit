---
name: alphaxiv-paper-lookup
description: >
  Look up, summarize, or explain any arXiv paper using alphaxiv.org's AI-generated
  overviews. Use this skill whenever the user shares an arXiv or alphaxiv URL, pastes
  a paper ID (e.g. 2401.12345), or asks to summarize, explain, read, or understand a
  research paper. Trigger even when the user only mentions a paper title or says
  "what does this paper say", "explain this paper", "give me the key ideas", or
  "what are the results". Prefer this over reading raw PDFs — it is faster and
  structured for LLM consumption.
metadata:
  category: academic-research
  tags: [arxiv, paper-lookup, summarize, research, alphaxiv, overview, multi-language]
  version: "1.1"
  last_updated: "2026-03-12"
argument-hint: "[arxiv-url|paper-id] [--lang LANG]"
allowed-tools: Bash(curl *), WebFetch
---

# AlphaXiv Paper Lookup

Fetch structured AI overviews for arXiv papers. No auth required.

## Workflow

### Step 1: Extract the paper ID

Parse the paper ID from whatever the user provides:

| Input                                      | Paper ID       |
| ------------------------------------------ | -------------- |
| `https://arxiv.org/abs/2401.12345`         | `2401.12345`   |
| `https://arxiv.org/pdf/2401.12345`         | `2401.12345`   |
| `https://alphaxiv.org/overview/2401.12345` | `2401.12345`   |
| `2401.12345v2`                             | `2401.12345v2` |
| `2401.12345`                               | `2401.12345`   |

### Step 2: Resolve the paper

```bash
curl -s "https://api.alphaxiv.org/papers/v3/{PAPER_ID}"
```

> On platforms without `curl`, use `WebFetch` with the same URL.

Extract `versionId` from the JSON response. This is the UUID needed for the next call.

If this returns 404, the paper hasn't been indexed on alphaxiv yet.

### Step 3: Fetch the AI overview

```bash
curl -s "https://api.alphaxiv.org/papers/v3/{VERSION_ID}/overview/{LANG}"
```

> On platforms without `curl`, use `WebFetch` with the same URL.

The response contains:

- **`intermediateReport`** — the machine-readable report (structured text, best for LLM consumption)
- **`overview`** — the full markdown blog post (human-readable)
- **`summary`** — structured summary with fields: `summary`, `originalProblem`, `solution`, `keyInsights`, `results`
- **`citations`** — list of cited papers with titles and justifications

**Prefer `intermediateReport`** when available — it's specifically formatted for machine consumption. Fall back to `summary` fields if `intermediateReport` is null.

### Step 4: If you need more detail, fetch the full text

If the `intermediateReport`, `summary`, and `overview` fields don't contain the specific information the user is asking about (e.g. a particular equation, table, or section), fetch the full paper text:

```bash
curl -s "https://alphaxiv.org/abs/{PAPER_ID}.md"
```

> On platforms without `curl`, use `WebFetch` with the same URL.

This returns the full extracted text of the paper as markdown. Only use this as a fallback — the overview and intermediate report are usually sufficient.

If this returns 404, the full text hasn't been processed yet. As a last resort, direct the user to the PDF at `https://arxiv.org/pdf/{PAPER_ID}`.

## Output Format

Adapt presentation to user intent:

| User intent | Format |
|---|---|
| "summarize" / "overview" | 3-5 bullet key contributions, then 1-paragraph summary |
| "explain" / "what does it do" | Plain-language explanation, avoid jargon |
| "what are the results" | Lead with metrics from `results` field, then context |
| "key ideas" / "main points" | Numbered list of 3-5 insights from `keyInsights` |
| "read this paper" | Full breakdown: problem → method → results → limitations |

Always include paper title and year. Never reproduce the `overview` blob verbatim — synthesize from `intermediateReport` or `summary` fields.

## Error Handling

- **404 on Step 2**: Paper not indexed. Tell the user it's not available on alphaxiv yet.
- **404 on Step 3**: Overview not generated for this paper.
- **`intermediateReport` is null**: Use `summary` and `overview` fields instead.

## Language

Default: `en`. Auto-detect the user's language and use the matching code:

| Language | Code |
|---|---|
| English | `en` |
| French | `fr` |
| German | `de` |
| Spanish | `es` |
| Chinese | `zh` |
| Japanese | `ja` |
| Arabic | `ar` |
| Hindi | `hi` |
| Portuguese | `pt` |

Substitute in Step 3: `.../overview/{LANG}`. If the user writes in Chinese, use `zh` automatically — do not ask.
