#import "@preview/touying:0.8.0": *
#import themes.simple: *

// Must sit at top level outside every `#document(...)` call.
#pdfpc.bundle-assets()

#document("deck.pdf", [
  #show: simple-theme.with(
    aspect-ratio: "16-9",
    config-info(
      title: [Bundle Export & `.pdfpc` Notes],
      author: [Presenter],
      date: datetime.today(),
    ),
  )

  #pdfpc.config(
    duration-minutes: 20,
    last-minutes: 3,
    note-font-size: 14,
    disable-markdown: false,
    default-transition: (
      type: "push",
      duration-seconds: 1,
      angle: ltr,
      alignment: "vertical",
      direction: "inward",
    ),
  )

  #title-slide[
    = Bundle Export & `.pdfpc` Notes
    Single-pass `.pdf` + `.pdfpc` emission in Typst 0.15.0+
  ]

  #speaker-note[Open the deck in pdfpc using the bundled `deck.pdf` and `deck.pdfpc`.]

  == Presenter Timing & Transitions

  #grid(
    columns: (1fr, 1fr),
    gutter: 1em,
    [
      *Configured Metadata*
      - Duration: 20 min (`last-minutes: 3`)
      - Default transition: `push`
    ],
    [
      #table(
        columns: 2,
        table.header([Artifact], [Emitted By]),
        [`deck.pdf`], [`#document("deck.pdf", ...)`],
        [`deck.pdfpc`], [`#pdfpc.bundle-assets()`],
      )
    ],
  )

  #speaker-note[Point out how `bundle-assets()` skips non-PDF targets automatically.]

  == Progressive Subslides in `.pdfpc`

  First point
  #pause
  Second point

  #speaker-note[Each overlay records its own `Idx`, `Overlay`, and `LogicalSlide`.]
])
