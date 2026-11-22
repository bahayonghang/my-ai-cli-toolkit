#import "/globals.typ": *

= Multi-File Structure

== Shared Globals Pattern

#cols(
  columns: (1fr, 1fr),
  gutter: 1em,
  key-card([No Circular Imports], [
    Both `main.typ` and section files import `/globals.typ` cleanly.
  ]),
  key-card([Consistent Metadata], [
    Contact, logo, and `extra` fields live in `config-info(...)`.
  ]),
)

#speaker-note[Explain why `main.typ` should never be imported by section files.]

== Progressive Slide Flow

- Section files stay focused on slide content
#pause
- Theme helpers and colors remain centralized in `globals.typ`

= Takeaways

#focus-slide[
  One `globals.typ`, many clean sections.
]

#speaker-note[Transition to the appendix backup matrix if needed.]
