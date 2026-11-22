#import "@preview/touying:0.8.0": *
#import themes.metropolis: *

#let key-card(title, body) = block(
  width: 100%,
  inset: 0.8em,
  radius: 4pt,
  fill: rgb("#f2f4f7"),
  stroke: 0.5pt + rgb("#d0d7de"),
  [
    *#title*
    #v(0.3em)
    #body
  ],
)
