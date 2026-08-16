# Mode: advise

Choose the chart type before any plotting code exists. This mode delivers a
recommendation, not a figure, and then hands off to a producing mode.

Adapted from the advisor workflow of scipilot-figure-skill
(`Haojae/scipilot-figure-skill`, MIT, reviewed 2026-08-16). The upstream project
profiles data with a bundled pandas/scipy script; this mode profiles inline.

## Entry intent

- The user has data and no chart type: "不知道用什么图", "这份数据怎么展示",
  "what chart should I use".
- The user names a chart type that the data does not support. Step 4 catches it.

An explicit journal target still selects **journal-spec**, and a named catalog
style still selects **from-data**. Enter advise only when the chart type is open.

## 1. Profile the data

Facts first. Profile inline — this skill ships no profiling script.

```python
import pandas as pd

df = pd.read_csv("data.csv")
print(df.shape)
print(df.dtypes)
print(df.isna().mean().round(3))          # missing rate per column
print(df.describe().T)
print(df.select_dtypes("number").skew().round(2))
print(df.groupby(["group"]).size())       # per-group n drives the chart choice
```

Read five facts out of the output:

- **Column types** — a numeric ID read as ordinal is the common error.
- **Group sample size** — selects the row in `../chart-selection.md`.
- **Missing rate** — above 5%, give `n` and the missing count in the caption.
- **Skew** — above 1 favours a box plot, and can need a log axis.
- **Dimension combinations** — more than 12 means split the figure.

Without pandas, use the `csv` module. Do not install a package unless asked.

## 2. Confirm the argument goal

Ask once: "What do you want this figure to convince the reader of?" One dataset
supports several claims, and each claim needs a different chart. Without an
answer, infer a provisional claim and state the assumption before you continue.

## 3. Recommend

Work the three decision axes in `../chart-selection.md`: variable structure,
argument intent, and data scale. Deliver one recommendation, one sentence of
reasoning that cites the profile facts, and one or two alternates with the
condition that selects each one. Name any special handling the data forces: a
bimodal distribution, strong outliers, or a range across orders of magnitude.

## 4. Interception check

Match the request and the recommendation against `../viz-pitfalls.md`. When a
row matches, run the four-step protocol in that file: name the row, give the
reviewer's view, offer the replacement, and ask whether the user keeps the
original plan.

## 5. Hand off

| Condition                                       | Hand off to                          |
| ----------------------------------------------- | ------------------------------------ |
| Default, including any journal or thesis target | **journal-spec** (`journal-spec.md`) |
| The agreed chart matches a named catalog style  | **from-data** (`from-data.md`)       |

State the target mode, then follow that mode's output contract in `SKILL.md`.

## Completion criterion

The mode is complete when the profile is stated, the goal is confirmed or the
assumption declared, one chart type is recommended with alternates, every
matched pitfall is reported, and the hand-off target is named. advise itself
delivers no figure.
