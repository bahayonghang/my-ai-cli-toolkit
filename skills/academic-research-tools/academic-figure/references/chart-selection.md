# Chart Selection

Decide **which** chart before you decide **how** to draw it. This file holds the
decision framework. `chart-recipes.md` holds the drawing code, and
`figure-contract.md` locks the claim that the chart must support.

Adapted from the chart-selection framework of scipilot-figure-skill
(`Haojae/scipilot-figure-skill`, MIT, reviewed 2026-08-16). The thresholds below
are practice defaults. They are not journal rules — the resolved card in
`journal-specs.md` stays authoritative for size, font, and format.

## Three decision axes

Answer all three axes before you name a chart type.

### Axis 1 — variable count and type

| Data structure                       | Question the figure answers |
| ------------------------------------ | --------------------------- |
| 1 continuous                         | What is the distribution?   |
| 1 categorical                        | What is the composition?    |
| 1 categorical + 1 continuous         | How do the groups compare?  |
| 2 continuous                         | What is the relation?       |
| 1 time + 1 continuous                | What is the trend?          |
| 3 or more continuous                 | What correlates with what?  |
| Two-dimensional numeric matrix       | What is the pattern?        |
| Nested groups (A holds B, B holds C) | What is the hierarchy?      |

### Axis 2 — argument intent

This axis is the one that users skip. One dataset supports several claims, and
each claim needs a different chart.

| Intent       | Default chart                           |
| ------------ | --------------------------------------- |
| Distribution | Histogram or KDE, box plot as alternate |
| Comparison   | Box plot or violin, bar with error bars |
| Relation     | Scatter plot with a fit line            |
| Trend        | Line plot with an uncertainty band      |
| Composition  | Stacked bar (never a pie chart)         |
| Correlation  | Correlation heat map or pair grid       |
| Difference   | Box plot with significance annotation   |
| Uncertainty  | Error bars or a confidence band         |

### Axis 3 — data scale

| Sample size per group | Guidance                                                                 |
| --------------------- | ------------------------------------------------------------------------ |
| n < 3                 | Plot every point. A box plot or violin has no statistical meaning here   |
| 3 ≤ n < 10            | Strip plot, beeswarm, or dot plot. A box plot gives unreliable quartiles |
| 10 ≤ n < 30           | Box plot or violin, and overlay a strip plot of the raw points           |
| n ≥ 30                | Box plot, violin, or bar with error bars are all acceptable              |
| Total points > 10⁴    | Set scatter alpha to 0.1–0.3, or change to hexbin or a 2D KDE            |

## Data shape to chart type

| Data shape                           | First choice                 | Alternate                 | Do not use                     |
| ------------------------------------ | ---------------------------- | ------------------------- | ------------------------------ |
| 1 continuous, distribution           | KDE or histogram             | Box plot or violin        | Pie chart, line plot           |
| 1 categorical, composition           | Horizontal bar, value-sorted | Single stacked bar        | Pie chart (angle judgement)    |
| 1 categorical + 1 continuous, n ≥ 10 | Box plot + strip plot        | Violin, bar with error    | Mean-only bar                  |
| 1 categorical + 1 continuous, n < 10 | Strip plot or beeswarm       | Dot plot                  | Box plot, mean-only bar        |
| 2 continuous                         | Scatter + fit line           | 2D KDE, hexbin            | Line plot, unless x is ordered |
| Time + continuous                    | Line + uncertainty band      | Step plot, scatter        | Bar chart                      |
| 3–20 continuous variables            | Correlation heat map         | Pair grid                 | Parallel coordinates (static)  |
| More than 20 continuous variables    | Clustered heat map           | PCA or UMAP scatter       | Pair grid                      |
| Matrix data                          | Heat map, uniform colormap   | Table                     | 3D surface                     |
| Composition of a total               | Stacked bar, treemap         | 100% stacked bar          | Pie chart, 3D pie chart        |
| Binary classifier performance        | ROC or PR curve              | Confusion-matrix heat map | Accuracy-only bar              |

## One dataset, several claims

Example: 30 subjects × 2 drugs × 5 time points = 300 measurements.

| Claim                                | Chart                                                 |
| ------------------------------------ | ----------------------------------------------------- |
| Drug A is faster than drug B overall | Box plot, x = drug, all time points pooled            |
| A and B diverge most at t = 3        | Line plot, x = time, hue = drug, with an error band   |
| Between-subject variability is large | Spaghetti plot, one thin line per subject, thick mean |
| A and B differ at t = 3              | Paired box plot at t = 3 with a significance bracket  |

Confirm the claim before styling. See `modes/advise.md` step 2.

## When to split the figure

Split when **any** of these is true:

1. The dimension combinations exceed 12.
2. The x-axis labels collide and need more than a 45° rotation.
3. The legend holds more than 6 entries.
4. The y-axis spans several orders of magnitude and a log axis is not valid.
5. The figure states two claims.

Split by group (one figure per level), by panel, by claim, or move the
supporting evidence to supplementary material.

## Dimension to visual channel

| Channel                | Priority | Capacity        |
| ---------------------- | -------- | --------------- |
| x axis                 | 1        | 5–10 categories |
| Color                  | 2        | 3–5 categories  |
| Marker or line style   | 3        | 2–3 categories  |
| Facet (small multiple) | 4        | 2–8 panels      |

The y axis carries the response variable. Do not map a grouping dimension to
it. If the dimension count exceeds the product of the channel capacities, split
the figure.

## Chart semantic boundaries

| Pair                  | Take the first when                                 | Take the second when                          | Failure mode of the wrong pick                        |
| --------------------- | --------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------- |
| Line vs scatter       | x is time, dose, or another ordered continuous axis | The points have no continuous relation        | A line implies a trend that the data does not support |
| Bar with error vs box | n ≥ 30 and the distribution is single-peaked        | n ≥ 10 or the distribution shape is unknown   | A mean bar hides a bimodal or skewed distribution     |
| Heat map vs pair grid | More than 8 variables, one statistic per cell       | 2–8 variables and the bivariate shape matters | A pair grid with many variables becomes unreadable    |

When n is small or the distribution shape is unknown, prefer the box plot over
the bar chart, and overlay the raw points in both cases.
