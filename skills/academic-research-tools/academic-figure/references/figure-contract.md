# Figure Contract

Use this reference before writing any plotting code. The goal is to make the
figure serve the paper's scientific logic; aesthetics, templates, and layout are
subordinate to making the core conclusion clear, defensible, and reviewable.

Adapted from nature-figure's figure contract. The one structural change: the
original **backend gate (Python or R)** is replaced by a **library + journal-style
dual axis**, and that axis is _inferred_ from the request/project rather than asked
up front — ask at most once, then persist the answer.

## Privacy rule

Keep the contract user-facing, but keep the working trail private. Do not mention
private paths, source filenames, internal reference documents, template
identifiers, or where a private draft came from unless the user explicitly asks
for provenance.

## Required contract

Fill this in working notes or in the response before plotting:

```text
Core conclusion:
Figure archetype:
Target journal style:   (ieee / elsevier / nature / springer / chinese-thesis)
Library:                (matplotlib(+seaborn) / plotly)
Final size:             (single- or double-column, from the journal-specs card)
Panel map:
  a:
  b:
  c:
Evidence hierarchy:
  hero evidence:
  validation evidence:
  controls/robustness:
Statistics needed:
Source data needed:
Export contract:        (formats, DPI, color mode, font embedding)
Reviewer risk:
```

Do not start from a favorite template. Start from the conclusion, then choose the
minimum set of panels that make it clear and defensible.

## Resolving the library + journal-style axis

This replaces the old "ask Python or R first" gate. Infer both axes; only ask when
inference fails, and never more than once.

- **Journal style** — resolve in order: explicit request > submission context
  (the target journal named anywhere in the request) > saved preference
  (`academic_figure_pref.py get journal_style`) > ask once
  ("Target journal style? ieee / elsevier / nature, or springer / chinese-thesis").
  Persist the answer with the matching `set`.
- **Library** — resolve in order: explicit request > project context (libraries
  already imported; an industrytslib project uses its matplotlib/plotly backend) >
  saved preference (`academic_figure_pref.py get library`) > default matplotlib
  (recommend plotly only for interactive/web output). seaborn is not a separate
  axis; it is a matplotlib-layer API and specs still resolve down to rcParams.

Once resolved, the chosen library + style is exclusive for this figure: all
drawing, previewing, exporting, and visual QA use it. Do not render a preview in
one library and export from another. If the required library is missing, stop and
report the blocker (with the install command) rather than silently substituting
the other library.

## Core conclusion rules

- The core conclusion is one sentence with a verb: "Method X lowers error Y by
  recovering regime Z", not "Results of method X".
- Group the source tables by scientific argument, not one figure per table. One
  table may feed several panels, and several tables may feed one panel.
- Every panel answers a unique question. If hiding a panel would not weaken the
  argument, remove or merge it.
- Separate primary from supporting evidence. The primary evidence gets the hero
  panel or the clearest axis; controls and robustness panels are visually quieter.
- If the user provides data but no claim, infer a provisional claim from the data
  and confirm it before final styling.

## Archetype selection

| Archetype                          | Use when                                                               | Hero panel                                | Supporting panels                            |
| ---------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------- |
| `quantitative grid`                | The claim is mainly numerical comparison                               | Optional; often a dominant summary metric | Shared axes, aligned scales, compact legends |
| `schematic-led composite`          | A workflow, mechanism, or system design must be understood first       | Top/left schematic, 35–60% of area        | 2–4 quantitative validation panels           |
| `image plate + quant`              | Imaging, heatmaps, spatial overlays, or segmentation lead the evidence | Image/heatmap plate                       | Scale bars, overlays, crops, quantification  |
| `asymmetric mixed-modality figure` | The figure mixes schematic, raster, heatmaps, and quantitative plots   | One panel spans rows/columns              | Smaller panels ranked by evidence value      |

## Panel logic

Use this order unless the manuscript story requires another:

1. Establish the system: dataset, model, cohort, or experimental design.
2. Show the main effect or primary comparison.
3. Show mechanism, localization, or attribution.
4. Quantify the representative case or qualitative observation.
5. Add robustness, controls, ablations, or sensitivity analysis.

For a Fig. 1 / method figure, the first panel often defines the visual vocabulary
(colors, symbols, workflow direction, sample classes, scale). Reuse that
vocabulary through the whole figure and, where possible, the manuscript.

## Aesthetic integration

- Use one neutral family, one signal family, and one accent family.
- Keep the same condition/method color across all panels.
- Prefer direct labels for stable line identities, channels, and fixed regions.
- Use a shared legend area when repeated legends would waste space.
- Avoid equal-sized panels when the evidence is not equally important.
- Keep schematic colors and quantitative-plot colors related, so the figure reads
  as one integrated argument rather than a pasted collage.

## Reviewer-risk prompts

Before finalizing, ask what a skeptical reviewer would challenge:

- Is the sample size (`n`) visible in the legend or source data?
- Are error bars, intervals, and statistical tests defined?
- For paired observations, does the figure show the paired differences? Two
  overlapping marginal distributions can hide a consistent within-subject
  effect, and a reviewer will ask for the difference plot.
- Are axes comparable across panels that invite comparison?
- Are representative cases traceable to raw data/source files?
- Could the same conclusion be made from fewer panels?
- Is the figure legible in grayscale, with no red/green-only encoding?

For machine-learning / time-series model figures, also ask:

- Are the train/validation/test splits stated?
- Are the number of seeds or folds, and the variability (CI/std) reported?
- Is each baseline defined, and are metric definitions given?
