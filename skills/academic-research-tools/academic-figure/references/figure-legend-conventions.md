# Figure Legend Conventions

Use this file when you write or audit the legend text of a figure or table.
`panel-layout-patterns.md` covers the layout; this file covers the words.

Adapted from nature-figure's `figure-legend-conventions.md`
(`Yuan1z0825/nature-skills`, skill `nature-figure`, Apache-2.0, reviewed
2026-08-16), rewritten, with the word-count gate cross-checked against the same
skill's `nature-article-requirements.md`. The upstream evidence base is a 2025
set of 20 open-access _Nature Communications_ computer-science / AI papers, so
treat these conventions as corpus evidence for that portfolio, not as a
universal rule. Do not copy wording from a published legend.

## Skeleton

1. `Fig. N | ` plus a bold noun-phrase title for the whole figure. Common
   openers are "Overview of ...", "Comparison of ...", "Performance of ...", or
   a short finding phrase. The title needs no full stop, and results or numbers
   stay out of it.
2. Panel entries `a`, `b`, `c` ... in present tense and telegraphic style, often
   without a subject.
3. Statistics inside the legend: exact `n`, the definition of one replicate,
   center and spread, error type, test, correction, and P-value display.
4. The journal's data-availability sentence at the end, for example "Source data
   are provided as a Source Data file."

## Tense

- Visual facts take the present tense: "are shown as cyan sticks", "depicts".
- Methods take the past tense: "was performed", "was adapted from".

## Self-containment

A legend must read away from the body text. Put the color and shape mappings,
the sample size, and the key numeric anchors (identifiers, units, resolution,
scale) into the legend itself.

## Display-label capitalization

- Treat in-figure legend entries as display labels. Start an ordinary
  descriptive label with a capital: `Tuned XGBoost`, `+ Semantic guidance`.
- Keep canonical product and model spelling exactly, with its internal capitals,
  hyphens, and periods: `XGBoost`, `DeepSeek`, `RF`.
- Use normal sentence grammar in the prose sentences of the legend.
- Do not apply `.title()` or another automatic title-case pass. It corrupts
  canonical names.

## Claim-closing sentence

The last sentence of a legend may advance an argument instead of describing the
panels. Use it only when the panel supports that inference.

## Adapted or third-party panels

A review or perspective figure that aggregates published systems gives each
sub-panel a one-line characterization, usually in past tense. The legend then
carries an attribution line such as "adapted with permission from refs. 16,17
... by Springer Nature". Include the permission string for every adapted panel.

## Table captions

Same shape: `Table N | ` plus a noun phrase, with the detailed specifications
pointed to the Methods section. Footnotes carry the explanatory detail.

## Length gate

- **Flagship Nature**: keep the complete legend below 250 words. Count the title
  plus all panels. Do not narrate results and do not duplicate the Methods.
- **Nature Machine Intelligence**: the live pages give no standalone per-legend
  number; the 2018 brief guide said below 300 English words. Aim for 150–250
  words and treat 300 as a historical ceiling.
- **Nature Communications or another subjournal**: confirm the current journal
  and article-type instructions before you enforce a numeric cap. The corpus
  above sets no portfolio-wide limit.

## 中文图注要点

- 结构：`图 N | 加粗名词短语总题` → `a/b/c` 现在时电报式分面 → 统计（n、重复单位、
  中心与离散、误差类型、检验、校正、P 值显示）写进图注 → 数据可得性套语。
- 时态：视觉事实用现在时，制作方法用过去时。
- 自足：颜色与形状映射、样本量、关键数值（标识符、单位、量程）都写进图注，
  使图注脱离正文可读。
- 图内图例按展示标签处理，普通描述首字母大写，同时保留 `XGBoost`、`DeepSeek`、
  `RF` 等规范拼写；不要对标签做自动 title case。
- 末句可给一句推断结论，须确有面板支撑；引用他人已发表面板须标注授权来源。
