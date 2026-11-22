#import "/globals.typ": *

#show: metropolis-theme.with(
  aspect-ratio: "16-9",
  footer: self => self.info.extra.track,
  config-info(
    title: [Modular Touying 0.8.0 Architecture],
    subtitle: [Multi-file Deck with Globals & Appendix],
    author: [Deck Maintainer],
    date: datetime.today(),
    institution: [Typst Slide Lab],
    contact: "slides@example.org",
    logo: square(size: 0.9em, fill: rgb("#eb811b")),
    extra: (track: [Core Architecture Track]),
  ),
)

#title-slide(extra: [Typst 0.15.0+])

#outline-slide(indent: (1em,), depth: 1, title: [Agenda])

#include "content.typ"

#show: appendix

= Appendix

== Configuration Matrix

#table(
  columns: 3,
  table.header([File], [Role], [Imports]),
  [`globals.typ`], [Shared theme & helpers], [`@preview/touying:0.8.0`],
  [`main.typ`], [Theme config & `#include`], [`/globals.typ`],
  [`content.typ`], [Section & slide bodies], [`/globals.typ`],
)

#speaker-note[Appendix freezes `utils.last-slide-number` automatically.]
