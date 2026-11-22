#import "@preview/touying:0.8.0": *
#import themes.simple: *

#show: simple-theme.with(
  aspect-ratio: "16-9",
  config-methods(
    cover: utils.semi-transparent-cover,
    show-only-notes: (self: none, ..args) => none,
  ),
)

== Deprecated APIs <intro>

#touying-equation(`f(x) = pause x^2`)

#utils.handout-only[Legacy handout helper]

#touying-recall(<intro>, subslide: 1)

#magic.bibliography()

#speaker-note[Fixture testing all six deprecated/removed 0.8.0 rules.]
