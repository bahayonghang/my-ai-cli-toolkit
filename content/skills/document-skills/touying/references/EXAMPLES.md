# Touying Examples

## Basic slide deck

```typst
#import "@preview/touying:0.5.0": *
#import themes.simple: *

#show: simple-theme.with(aspect-ratio: "16-9")

= Title Slide

== First Content Slide

- Bullet point 1
- Bullet point 2

== Second Slide

#pause

First part appears

#pause

Second part appears
```

## Multi-file structure

```
project/
├── globals.typ    // Shared config
├── main.typ       // Entry point with #show
└── content.typ    // Slide content
```

## Main.typ template

```typst
#import "@preview/touying:0.5.0": *
#import themes.simple: *
#import "globals.typ": *

#show: simple-theme.with(
  config-info(
    title: [Presentation Title],
    author: [Your Name],
  ),
)

#include "content.typ"
```
