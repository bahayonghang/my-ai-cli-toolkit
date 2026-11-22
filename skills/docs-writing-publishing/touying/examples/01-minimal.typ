#import "@preview/touying:0.8.0": *
#import themes.simple: *

#show: simple-theme.with(
  aspect-ratio: "16-9",
  config-info(
    title: [Touying 0.8.0 Minimal Deck],
    author: [Presentation Author],
    date: datetime.today(),
  ),
)

#title-slide[
  = Touying 0.8.0 Minimal Deck
  Clean baseline targeting Typst 0.15.0+
]

== Core Workflow

- Import `@preview/touying:0.8.0` and a theme module
#pause
- Split slides with headings and verify with `touying_check.py`

#speaker-note[Keep the opening slide under 60 seconds.]

== Layout & Math Snapshot

#grid(
  columns: (1fr, 1fr),
  gutter: 1em,
  [
    *Two-Column Grid*
    #rect(inset: 0.8em, stroke: 1pt + gray)[
      Declarative configuration via `config-page(...)` and `config-common(...)`.
    ]
  ],
  [
    *Native Math*
    $ E = m c^2 $
  ],
)

#focus-slide[
  Simple, clean, warning-free.
]
