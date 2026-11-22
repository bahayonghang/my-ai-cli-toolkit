# Touying 0.8.0 Visual Craft & Layout Diversity Guide

High-craft decks avoid cookie-cutter card grids and skin-only color swaps. Apply structural variation, explicit visual metaphors, parameterized aesthetics, and restrained prototyping before scaling a deck across dozens of slides.

## 1. Per-Slide Visual Metaphor (Structure Before Layout)

Before writing Typst markup for a slide, write **one concrete sentence** defining its **视觉隐喻 (visual metaphor)**: the physical, spatial, or analytical object that carries the argument.

- **Valid visual metaphors**: a before/after latency waterfall, a state-machine transition graph, a split-screen equation dissection, a 3-stage pipeline funnel, a trade-off quadrant, an annotated code trace, or a single empirical curve with a callout threshold.
- **Not visual metaphors**: generic rounded cards, bordered boxes, 3-column icon-plus-bullet grids, or plain bullet lists. Containers frame content; they do not explain structure.

## 2. Layout Topology Diversity & Quantitative Caps

Alternate deliberately across distinct Typst/Touying topologies (`cols`, `grid`, `table`, `touying-reduce`, `pinit`, `#focus-slide`) instead of repeating one slide template:

1. **Assertion + Evidence Split** (`cols` e.g. `(1.2fr, 1fr)`): concise thesis/derivation paired with a diagram, plot, or figure.
2. **Contrast / Trade-off Table** (`table` / 2-column A-vs-B): crisp attribute comparison with aligned baselines.
3. **Architecture / Flow Diagram** (CeTZ, Fletcher, Alchemist via `touying-reduce`): progressive reveal of nodes/edges.
4. **Data / Metric Anchor** (Lilaq chart or single hero KPI + 1-line interpretation).
5. **Annotated Specimen Spotlight** (`touying-raw` / `Codly` code block or math derivation with `Pinit` callouts).
6. **Focus / Pivot Slide** (`#focus-slide` or `#new-section-slide`): single statement marking a narrative turn.
7. **Compact Bullet Synthesis**: short scannable list (reserved for summaries or agendas).

Enforce both quantitative diversity caps across content slides:
- **纯列表页占比上限 (Bullet-only slide cap)**: `<= 25%` of content slides (never exceed one-quarter of the deck as plain bullet lists).
- **连续同拓扑上限 (Consecutive same-topology cap)**: `<= 2` consecutive slides sharing the same layout topology (break any 2-slide run with a diagram, comparison table, focus pivot, or inverted split).

## 3. 叙事语法轴 / Narrative Grammar Axes (Variation by Structure, Not Skin)

When proposing distinct design directions, vary across a **majority (>= 4 of 6) of structural 叙事语法 (narrative grammar) axes** rather than swapping hex colors and fonts on an identical card layout:

| Axis | Option A (Editorial / Paper) | Option B (Technical Blueprint) | Option C (Keynote Anchor) |
| --- | --- | --- | --- |
| 1. 网格与拓扑节奏 (Grid Rhythm) | Wide asymmetric split with generous margin notes | Modular `1fr` engineering grid + hairline rules | Full-bleed focal element + minimal caption strip |
| 2. 页眉页脚密度 (Chrome & Anchoring) | Whisper-quiet section slug + slide number only | Persistent top breadcrumb/mini-slides + thin progress bar | Zero-chrome content slides; section breaks carry structure |
| 3. 字阶与排版语态 (Typographic Hierarchy) | High scale contrast (`2.4x` display title vs crisp body) | Compact technical scale + tabular numbers / mono accents | Oversized thesis statement (`2.8x`) + sparse micro-labels |
| 4. 色彩角色与留白 (Surface & Contrast) | Warm/neutral light paper (`>= 35%` whitespace), 1 ink + 1 accent | Crisp high-contrast grid lines + muted surface zones | High-contrast dark/light alternating pivot beats |
| 5. 揭示节奏 (Reveal Pacing) | Static comparison first, targeted `#only` annotation beat | Stepwise diagram edge/plot accumulation (`#pause`) | Instant whole-frame thesis, minimal animation interruptions |
| 6. 图示与标注形式 (Callout Form) | Inline leader annotations (`Pinit`) without heavy card borders | Structured bordered tables / aligned spec blocks | Large-scale vector visual centered on horizon |

## 4. 参数化配色与字体 / Parameterized Palettes & Typography

Treat colors, fonts, and spacing as **configurable parameters (参数化)** in `globals.typ` (`Palette` -> `config-colors(...)`, `Typography` -> font families/base size/tracking, `Layout` -> margins/gutters), chosen from the topic, projection environment (bright seminar room vs dark auditorium), and brand context.

```typst
// Parameterize aesthetic tokens in globals.typ — never hardcode one palette globally
#let palette = (
  bg: rgb("#fafaf8"),
  ink: rgb("#1c1f24"),
  muted: rgb("#5c6470"),
  primary: rgb("#1f4e79"),   // Driven by deck context, overridable per direction
  accent: rgb("#b85424"),
)
```

**Do not** hardcode one fixed color scheme (for example, always deep navy or always dark mode) or one fixed font pairing as a universal Touying rule. Also inspect the active theme's existing chrome first (`metropolis` header bar, `university` 3-cell footer, `stargazer` top navigation): never stack a second competing progress bar or heavy outer frame over decoration the theme already renders.

## 5. Three Restrained Direction Prototypes (`Full Tier`)

For brand-new or high-craft custom decks:
1. Build **3 restrained visual direction prototypes** that differ across a majority of the 6 narrative grammar axes above (varying layout structure, chrome density, and typographic voice alongside `Palette`).
2. Render each prototype on **1–2 real representative slides** from the user's actual deck (e.g., title/pivot slide + dense technical/diagram slide) — never dummy placeholder text.
3. Compare the rendered PNGs side-by-side at **same native scale (`1x` whole-slide hierarchy and whitespace + `4x` baseline alignment, spacing >= `16–24pt` clearance, and label legibility)**, then confirm one direction before authoring the remaining slides.

## 6. 不要做 / Do Not (Anti-Slop Checklist)

| 不要做 (Anti-Pattern) | 原因 (Why It Fails) | 替代做法 (Do Instead) |
| --- | --- | --- |
| Every slide rendered as 2–4 rounded shaded boxes/cards | Visual fatigue ("AI template slop"); hides real relationships | Name a concrete visual metaphor per slide and pick matching topology |
| Stacking `> 2` consecutive bullet-list slides or `> 25%` bullet-only pages | Turns slides into readable prose handouts; loses audience focus | Alternate splits, tables, diagrams, code/math spotlights, and focus pivots |
| Calling a color/font swap a "new visual style" | Layout, rhythm, and pacing remain identical across options | Vary >= 4 of the 6 narrative grammar axes between proposed directions |
| Hardcoding a single palette/font across all decks | Clashes with venue lighting, domain tone, and brand guidelines | Expose `Palette` + `Typography` parameters in `globals.typ` |
| Layering extra progress bars, borders, or translucent overlays on full themes | Double-chrome clashes visually and wastes precious slide height | Inspect built-in theme chrome first; strip or replace rather than stack |
| Overusing centered symmetry, >2 accent hues, or cramped spacing | Looks cluttered at `1x` and misaligned at `4x` zoom | Stick to 1 primary + at most 1 semantic accent, consistent grid, >=30% breathing room |
| Putting `#pause` on every single bullet by default | Slows delivery and causes constant presenter clicking | Reserve `#pause`/`#only` for genuine causal steps, reveals, or diagram builds |
