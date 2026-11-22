#import "@preview/touying:0.8.0": *
#import themes.simple: *

#show: simple-theme.with(
  aspect-ratio: "16-9",
  config-methods(cover: utils.alpha-changing-cover.with(alpha: 25%)),
)

#let preview-seq = [Stage 1 #pause Stage 2 #pause Stage 3]

== Relative & Absolute Jumps

#grid(
  columns: (1fr, 1fr),
  gutter: 1em,
  [
    *Relative Jump Flow* \
    Step 1
    #jump(1, relative: true)
    Step 2
    #jump(-1, relative: true)
    Also Step 2
  ],
  [
    *Absolute Jump Flow* \
    #box(inset: 0.6em, stroke: 0.5pt + gray)[
      Always on 1 via `#jump(1)`
      #jump(1)
      Always visible here too.
    ]
  ],
)

#speaker-note[Demonstrate `#jump(n, relative: true)` and absolute `#jump(n)`.]

== Highlighted List & Animated Code

#grid(
  columns: (1fr, 1.2fr),
  gutter: 1em,
  [
    #item-by-item-fn("current-highlight")[
      - Parse marks
      - Resolve waypoints
      - Render subslides
    ]
  ],
  [
    #touying-raw(
      lang: "python",
      ```python
      def build_slide(step):
          # pause
          return f"subslide-{step}"
      ```,
    )
  ],
)

== Waypoints, Swap & Animate <wp-slide>

Intro state
#waypoint(<phase:a>)
Phase A active
#waypoint(<phase:b>)
Phase B active

#grid(
  columns: (1fr, 1fr),
  gutter: 1em,
  [
    #uncover(<phase>)[- Visible across `<phase:a>` and `<phase:b>`]
    #only(get-first(<phase:a>))[- Only on first subslide of `<phase:a>`]
    #only((from-wp(<phase:a>), until-wp(<phase:b>)))[- From `phase:a` until `phase:b`]
    #only(get-last(<phase:b>))[- Only on last subslide of `<phase:b>`]
  ],
  [
    #animate(
      [Original Card],
      effects: (
        (effect: swap([Swapped Card], stretch: true), subslides: <phase:a>),
        (effect: (body, ..) => text(fill: blue, weight: "bold", body), subslides: get-last(<phase:b>)),
      ),
    )
    #v(0.5em)
    #animate-hidden(
      [Revealed via `animate-hidden`],
      effects: (effect: "show", subslides: from-wp(<phase:b>)),
    )
  ],
)

== Math, Render & Color Cover

#slide(
  config: config-methods(cover: utils.color-changing-cover.with(color: luma(180))),
)[
  Native equation animations inside `frac` and `mat`:

  $ frac(a #pause + b, c) = #pause mat(1, #pause 0; 0, 1) $

  #meanwhile
  Rendered stage 2 snapshot:

  #box(inset: 0.5em, stroke: 0.5pt + gray)[#touying-render(preview-seq, subslides: 2, base: 1)]
]

// Whole-slide recall replays the final subslide of <wp-slide> directly at slide level.
#touying-recall(<wp-slide>, subslides: none)
