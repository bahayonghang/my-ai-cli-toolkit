#import "@preview/touying:0.8.0": *
#import themes.simple: *

#show: simple-theme.with(
  aspect-ratio: "16-9",
  config-info(
    title: "Single-Source Multi-Mode Deck",
    author: "Touying Author",
    date: datetime.today(),
  ),
  config-common(
    handout-subslides: -1,
    article-theme: themes.article.article-theme.with(numbering: "1.1"),
  ),
  config-article(
    linearize: auto,
    available-fields: (
      title: "info.title",
      author: "info.author",
    ),
  ),
)

#article-only[
  = Reading Guide
  This introductory section appears only in `article` mode (`--input export-mode=article`).
]

== Shared Content & Mode Wrappers

#presentation-only[
  Live demo step one #pause and step two (hidden in handout mode).
]

#handout-only[
  Handout note: `handout-subslides: -1` captures the final animation state.
]

#slides-only[
  #rect(inset: 0.6em, stroke: 0.5pt + gray)[Visual callout shown only in presentation/handout slides.]
]

#grid(
  columns: (1fr, 1fr),
  gutter: 1em,
  [Layout Column A (linearized in article mode)],
  [Layout Column B (linearized in article mode)],
)

#article-text[
  In `article` mode, `#article-text` replaces the terse slide layout above with continuous prose, while the `table.header` matrix below stays intact as a structured table.
]

#speaker-note[Compile with `--modes presentation,handout,article`.]

== Structured Table Preservation

#table(
  columns: 2,
  table.header([Export Mode], [Output Target]),
  [presentation], [Full subslide animations],
  [handout], [Compact final subslides],
  [article], [Continuous A4 prose],
)

== Live Presentation Slide <touying:presentation>

#rect(inset: 0.8em)[Visible only when `export-mode` is `presentation`.]

== Handout Summary Slide <touying:handout>

#rect(inset: 0.8em)[Visible only when `export-mode` is `handout`.]

== Extended Article Appendix <touying:article>

This section renders only when compiled in `article` mode.

== Excluded Scratch Slide <touying:never>

This section is omitted from every export mode.
