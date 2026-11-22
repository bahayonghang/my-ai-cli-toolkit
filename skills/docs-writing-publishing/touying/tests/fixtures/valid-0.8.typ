#import "@preview/touying:0.8.0": *
#import themes.simple: *

#show: simple-theme.with(
  aspect-ratio: "16-9",
  config-methods(cover: utils.alpha-changing-cover.with(alpha: 25%)),
)

== Agenda

- Introduce `@preview/touying:0.8.0` structure
- Show mixed visual layout topologies

#speaker-note[Keep opening pacing crisp.]

== Architecture Comparison

#grid(
  columns: (1fr, 1fr),
  gutter: 1em,
  [
    *Left Panel*
    - Declarative `config-page`
  ],
  [
    #table(
      columns: 2,
      table.header([Mode], [Target]),
      [Slides], [PDF],
      [Bundle], [`.pdf` + `.pdfpc`],
    )
  ],
)

== Math & Code Sample

$ frac(a #pause + b, c) $

```typ
#show: simple-theme.with(aspect-ratio: "16-9")
```
