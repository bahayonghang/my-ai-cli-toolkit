#import "@preview/touying:0.8.0": *

#let custom-notes(self: none, ..args) = touying-notes(
  self: self,
  header: self => pad(
    x: 24pt,
    y: 12pt,
    text(fill: self.colors.neutral-lightest, weight: "bold")[Presenter Notes],
  ),
  header-fill: self.colors.primary,
  fill: rgb("#f4f6f9"),
  note-setting: note => pad(x: 24pt, y: 16pt, note),
  ..args,
)

#let custom-slide(
  config: (:),
  repeat: auto,
  setting: body => body,
  composer: auto,
  ..bodies,
) = touying-slide-wrapper(self => {
  touying-slide(
    self: self,
    config: config,
    repeat: repeat,
    setting: setting,
    composer: composer,
    ..bodies,
  )
})

#let highlight-slide(config: (:), body) = touying-slide-wrapper(self => {
  touying-slide(
    self: self,
    config: utils.merge-dicts(
      config-common(freeze-slide-counter: true),
      config-page(fill: self.colors.primary-lightest),
      config,
    ),
    setting: it => align(center + horizon, text(size: 1.25em, fill: self.colors.primary-dark, it)),
    body,
  )
})

#let callout-pill(body) = touying-fn-wrapper-raw(
  (self: none, inner) => box(
    inset: (x: 0.7em, y: 0.4em),
    radius: 4pt,
    fill: self.colors.primary-lightest,
    stroke: 0.5pt + self.colors.primary,
    inner,
  ),
  body,
)

#let custom-theme(
  aspect-ratio: "16-10",
  ..args,
  body,
) = {
  let notes-pos = utils.get-input(key: "notes-pos")
  set text(size: 20pt)
  show: touying-slides.with(
    config-page(..utils.page-args-from-aspect-ratio(aspect-ratio)),
    config-common(
      slide-fn: custom-slide,
      notes-fn: custom-notes,
      show-notes-on-second-screen: if notes-pos != none { notes-pos } else { right },
    ),
    config-colors(
      primary: rgb("#1f4e79"),
      primary-lightest: rgb("#e9f1f8"),
      primary-dark: rgb("#12304a"),
      neutral-lightest: rgb("#ffffff"),
      neutral-darkest: rgb("#1c1c1c"),
    ),
    ..args,
  )
  body
}

#show: custom-theme.with(aspect-ratio: "16-10")

= Hidden Cover <touying:hidden>

#highlight-slide[
  *Custom Theme & Second-Screen Notes* \
  Built with `utils.page-args-from-aspect-ratio("16-10")`
]

#speaker-note[Cover slide uses `<touying:hidden>` so it stays out of section outlines.]

== Wrapper & Setting Rules

#speaker-note[Introduce `touying-fn-wrapper-raw` before stepping through `#pause`.]

#callout-pill[
  Nested animations work inside `touying-fn-wrapper-raw` #pause cleanly!
]

#speaker-note[Explain why `setting:` replaces wrapping `body` in `touying-slide`.]

== Notes Configuration Summary

#table(
  columns: 2,
  table.header([Option], [Value]),
  [`notes-fn`], [`custom-notes` built on `touying-notes`],
  [`show-notes-on-second-screen`], [`utils.get-input(key: "notes-pos")` (default `right`)],
)

#speaker-note[Pass `--input notes-pos=bottom` to override second-screen placement.]
