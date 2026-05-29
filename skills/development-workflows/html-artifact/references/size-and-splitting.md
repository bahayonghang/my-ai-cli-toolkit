# Size and splitting

Use this reference before writing large HTML artifacts. The goal is to keep the default single-file workflow while avoiding oversized pages that are hard to review, slow to open, or above the validator warning threshold.

## Size plan

Create a short working plan with:

- `content_inventory`: sections, tables and row counts, charts/SVGs, diff/log/code excerpts, interaction features, evidence/appendix volume.
- `estimated_total_bytes`: a rough byte estimate before markup is written.
- `decision`: `single-page`, `single-page-compressed`, or `split-bundle`.
- `split_plan`: page names and content boundaries when splitting.

Example:

```text
Size plan: estimated_total_bytes=1.34 MB.
Inventory: 9 sections, 4 tables (~180 rows), 3 SVG diagrams, 40 short evidence excerpts, search/filter JS.
Decision: split-bundle.
Split plan: index.html, part-01-summary.html, part-02-evidence.html, part-03-roadmap.html.
```

## Estimation method

Use conservative round numbers. Precision matters less than making the split decision before build.

| Content type | Estimate |
| --- | ---: |
| Starter template CSS and layout shell | 80-160 KB |
| Medium report section | 20-60 KB |
| Dense table row | 0.8-2 KB per row |
| Code/diff/log excerpt | source bytes × 1.5 after escaping and markup |
| Inline SVG diagram | 15-120 KB |
| Chart with data table equivalent | 20-90 KB |
| Small vanilla interaction | 5-40 KB |
| Evidence appendix item | 1-5 KB each |

Formula:

```text
estimated_total_bytes =
  shell_bytes
  + section_bytes
  + table_rows * row_bytes
  + escaped_excerpt_bytes
  + svg_chart_bytes
  + interaction_bytes
  + appendix_bytes
```

Add 20-30% headroom when the artifact includes many code snippets, generated SVG paths, or repeated cards.

## Thresholds

- `<900 KB`: single page by default.
- `900 KB-1.2 MB`: single page is allowed, but compress content first.
- `1.2 MB-1.5 MB`: prefer a split bundle unless the reading flow is tightly coupled.
- `>1.5 MB`: split bundle is required unless the user explicitly asks for one file.

The validator warns above 1,500,000 bytes. Treat that warning as a late safety net, not the primary planning mechanism.

## Split bundle pattern

Use `docs/artifacts/<slug>/`:

```text
docs/artifacts/<slug>/
  index.html
  part-01-executive-summary.html
  part-02-evidence.html
  part-03-roadmap.html
```

Each HTML file must be independently offline and self-contained:

- inline CSS in every page;
- only small inline vanilla JS in pages that need it;
- no shared CSS, JS, JSON, images, fonts, or fetched data;
- no CDN or automatic network request;
- every page passes `check_html_artifact.py` on its own.

The index page should contain:

- the main conclusion;
- the content map and page links;
- a compact size/split note;
- enough context that it remains useful when opened alone.

Each part page should contain:

- a clear `<h1>` naming the part;
- a local table of contents when dense;
- links for `Previous`, `Next`, and `Back to index`;
- a short summary of the bundle context so the page is understandable by itself.

## Naming rules

- Use lowercase kebab-case file names.
- Prefix part pages with two-digit order: `part-01-*`, `part-02-*`.
- Name by user-visible topic, not implementation detail.
- Keep links relative, for example `href="part-02-evidence.html"`.

## Compression strategies

Before splitting, reduce waste:

- Replace huge raw diffs/logs with short excerpts plus file/line references.
- Summarize repeated evidence rows and keep only representative examples.
- Use tables for dense facts instead of repeated cards.
- Use `<details>` for optional appendices, but do not hide core conclusions.
- Keep SVG labels short; move long identifiers to adjacent HTML tables or lists.
- Remove duplicated CSS and unused JS before validation.

Do not compress by removing accessibility, text equivalents, validation evidence, or the user's required content.
