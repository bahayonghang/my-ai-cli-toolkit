# Typst Touying Syntax Reference

## Setup

```typst
#import "@preview/touying:0.6.1": *
#import themes.university: *

#show: university-theme.with(
  aspect-ratio: "16-9",
  config-info(
    title: [Title],
    subtitle: [Subtitle],
    author: [Author],
    date: [Date],
    institution: [Institution],
    logo: none,
  ),
)

#set text(font: ("Linux Libertine", "Source Han Serif SC"), size: 20pt)
#set par(justify: true)
```

## Structure

```typst
#title-slide()                          // Title page

== Outline <touying:hidden>             // Hidden outline slide
#components.adaptive-columns(outline(indent: 1em))

= Section Title                         // Section (level 1)
== Slide Title                          // Slide (level 2)
=== Sub-heading                         // Within-slide heading
```

## Animation

```typst
#pause                                  // Progressive reveal
#uncover("2-")[Content]                 // Show from step 2
#only("1")[Content]                     // Show only on step 1
```

## Layout

```typst
// Two-column slide
#slide(composer: (1fr, 1fr))[
  Left column content
][
  Right column content
]

// Centered content
#align(center + horizon)[Content]
```

## Math

```typst
$ y = sigma(bold(w)^T bold(x) + b) $   // Inline/display math
$bold(x)$                               // Inline math
```

## Tables

```typst
#table(
  columns: 3,
  align: center,
  table.header([*Header 1*], [*Header 2*], [*Header 3*]),
  [Cell 1], [Cell 2], [Cell 3],
)
```

## Text Formatting

```typst
*bold text*                             // Bold
_italic text_                           // Italic
#text(size: 36pt, weight: "bold")[Big]  // Custom size
#v(1em)                                 // Vertical space
- Bullet point                          // Unordered list
+ Numbered item                         // Ordered list
```

## Chinese Font Config

```typst
// Serif (university, simple, dewdrop)
#set text(font: ("Linux Libertine", "Source Han Serif SC"), size: 20pt)
// Sans (metropolis)
#set text(font: ("Fira Sans", "Source Han Sans SC"), size: 20pt)
```
