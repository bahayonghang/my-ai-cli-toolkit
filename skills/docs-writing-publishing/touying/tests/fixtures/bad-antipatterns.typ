#import "@preview/touying:0.8.0": *
#import themes.simple: *

#set page(paper: "presentation-16-9")

#let bad-centered-slide(body) = touying-slide-wrapper(self => {
  touying-slide(self: self, align(center, body))
})

#show: simple-theme.with(aspect-ratio: "16-9")

== Antipatterns Slide

#context {
  text[#pause Hidden inside context]
}

#speaker-note[Fixture testing all three antipattern rules.]
