# Touying 0.8.0 Ecosystem Integrations & Companion Tools

Verified directly against `@preview/touying:0.8.0` (`src/extern.typ`, `src/core/blocks.typ`, `src/core/parser.typ`, `src/utils.typ`, `README.md`, `changelog.md`).

## 1. Diagram Reducers (`touying-reduce`, `touying-reducer`, `touying-diagram`)

External drawing packages emit package-specific element values (arrays of draw commands, variadic `..plots` dictionaries, or Typst content trees). Touying animates them via `touying-reducer` / `touying-reduce` (aliased as `touying-diagram`).

In `0.8.0`:
- `touying-reducer` walks arguments as a tree and rebuilds each container with its original shape (`array` body stays one array; spread positional elements stay spread), so variadic functions like `lq.diagram(..plots)` require no adapter.
- **`touying-reducer-bindings` MUST use lambdas taking the package module (`module => ...`)**:
  ```typst
  // Valid 0.8.0 binding shape (both in external packages and `bindings:` overrides)
  #let touying-reducer-bindings = (
    reduce: module => module.canvas,
    cover: module => module.draw.hide.with(bounds: true),
  )
  ```
- **Banned legacy syntax**:
  - **NEVER** use `0.7.x` string-array paths such as `("canvas",)` or `("draw", "hide", arguments(bounds: true))` in `touying-reducer-bindings`.
  - **NEVER** use the stale `(uncover(..),)` array-wrapper workaround inside callback-style CeTZ/Fletcher blocks.

## 2. Vector Diagrams, Charts & Chemistry (`CeTZ`, `Fletcher`, `Lilaq`, `Alchemist`)

`src/extern.typ` registers native `auto-reducer-bindings` for **CeTZ**, **Fletcher**, and **Alchemist**:

| Package | Recommended Wrapper / Call | Binding Mechanism (`0.8.0`) | Animation Syntax Inside Body |
| --- | --- | --- | --- |
| **CeTZ** | `#let cetz-canvas = touying-reduce.with(cetz)` | Built-in auto-binding: `reduce: module => module.canvas`, `cover: module => module.draw.hide.with(bounds: true)` | `(pause,)`, `(meanwhile,)` inside `{ import cetz.draw: *; ... }` |
| **Fletcher** | `#let fletcher-diagram = touying-reduce.with(fletcher)` or `#touying-diagram(fletcher, ...)` | Built-in auto-binding: `reduce: module => module.diagram`, `cover: module => module.hide` | Bare `pause`, `meanwhile` among `node(...)` and `edge(...)` arguments |
| **Alchemist** | `#let alchemist-skeletize = touying-reduce.with(alchemist)` | Built-in auto-binding: `reduce: module => module.skeletize`, `cover: module => module.hide` | `(pause,)` inside `#alchemist-skeletize({ ... })` |
| **Lilaq** | `#let lq-diagram = touying-reducer.with(reduce: lq.diagram, cover: plot => plot + (x: (), y: (), label: none))` | Explicit lambda or direct `touying-reducer.with(...)` (plots are dicts, `lq.diagram` takes `..plots`) | `pause` between `lq.plot(...)` positional arguments |

### Examples (`0.8.0`)

**CeTZ & Fletcher (`touying-reduce`)**:
```typst
#import "@preview/touying:0.8.0": *
#import "@preview/cetz:0.5.2"
#import "@preview/fletcher:0.5.8" as fletcher: node, edge

#let cetz-canvas = touying-reduce.with(cetz)
#let fletcher-diagram = touying-reduce.with(fletcher)

== Progressive Architecture Diagram
#cetz-canvas({
  import cetz.draw: *
  rect((0, 0), (4, 2), name: "api")
  (pause,)
  line((4, 1), (6, 1), mark: (end: ">"))
  rect((6, 0), (10, 2), name: "db")
})
```

**Callback-style `uncover` / `only` inside CeTZ (without legacy `(uncover(..),)` array wrapping)**:
```typst
#slide(repeat: 3, self => [
  #cetz.canvas({
    import cetz.draw: *
    let s = (self.methods.update-cover)(self: self, hide.with(bounds: true))
    let (uncover, only) = utils.methods(s)

    rect((0, 0), (4, 2))
    uncover("2-3", {
      rect((0, 0), (2, 1), fill: blue.lighten(80%))
    })
    only(3, line((0, 0), (4, 2)))
  })
])
```

**Lilaq (`lq.diagram` with dictionary plots)**:
```typst
#import "@preview/lilaq:0.6.0" as lq

#let lq-diagram = touying-reducer.with(
  reduce: lq.diagram,
  cover: plot => plot + (x: (), y: (), label: none),
)
// Or via `touying-reduce` lambda bindings:
// #let lq-diagram = touying-reduce.with(lq, bindings: (
//   reduce: module => module.diagram,
//   cover: module => plot => plot + (x: (), y: (), label: none),
// ))

== Empirical Curve Comparison
#lq-diagram(
  xlabel: $t$,
  ylabel: $y(t)$,
  lq.plot((0, 1, 2, 3), (1.0, 2.1, 3.8, 5.2), label: [Baseline]),
  pause,
  lq.plot((0, 1, 2, 3), (1.0, 2.8, 6.4, 9.5), label: [Ours]),
)
```

**Alchemist (chemical structures)**:
```typst
#import "@preview/alchemist:0.2.0": *
#let alchemist-skeletize = touying-reduce.with(alchemist)
```

## 3. Code, Theorems, Pinning & LaTeX Math

### Codly vs Built-In `touying-raw`

- **Codly** (styled code frames, line numbers, language badges): apply `#show: codly-init.with()` at top level and call `codly(...)` inside `config-common(preamble: { codly(...) })` so slide wrapping preserves Codly configuration:
  ```typst
  #import "@preview/codly:1.3.0": *
  #show: codly-init.with()
  #show: simple-theme.with(
    config-common(preamble: {
      codly(languages: (rust: (name: "Rust", color: rgb("#CE412B"))))
    }),
  )
  ```
- **`touying-raw`** (built-in line-by-line code reveal): place `// pause` or `# pause` on its own line (or pass `simple: true` for inline `#pause;` markers); `fill-empty-lines: true` (default) preserves vertical code height while lines remain hidden.

### Theorion (`frozen-counters`)

Theorion tracks numbering via `theorem-counter` (unlike `ctheorems`, which is already in `_default-frozen-states`). Freeze `theorem-counter` explicitly so `#pause` subslides do not increment theorem numbers:

```typst
#import "@preview/theorion:0.6.0": *
#import cosmos.clouds: *
#show: show-theorion

#show: university-theme.with(
  config-common(frozen-counters: (theorem-counter,)),
)
```

### Pinit (`#pin` + `#only`)

Use `@preview/pinit` (`#pin(id)`, `#pinit-highlight`, `#pinit-rect`, `#pinit-line`, `#pinit-place`, `#pinit-point-from`, `#pinit-point-to`) inside `#slide[...]` to attach callouts to exact text or math fragments without shifting layout. Wrap progressive callouts in `#only("2-", pinit-...)` (or place after `#pause`) so markers are never painted ahead of their reveal beat:

```typst
$ cal(L)(theta) = #pin(1)sum_(i=1)^N ell(y_i, f_theta(x_i))#pin(2) + #pin(3)lambda norm(theta)_2^2#pin(4) $

#only("2-", {
  pinit-highlight(1, 2)
  pinit-point-from(2)[Empirical loss]
})
#only("3-", {
  pinit-rect(3, 4)
  pinit-point-from(4)[L2 regularizer]
})
```

### MiTeX (`#touying-mitex`)

When pasting existing LaTeX equations verbatim, wrap `@preview/mitex` with `#touying-mitex(mitex, \`...\`)` and use `\pause` / `\meanwhile` inside the LaTeX string (`block`, `numbering`, `supplement` optional). For newly authored Typst math, prefer native Typst equations (`$ frac(a #pause + b, c) $`, `$ mat(a, #pause b; c, d) $`) directly.

## 4. Companion Export & Authoring Ecosystem

- **`touying-exporter`**: companion CLI (`touying-typ/touying-exporter`) converting Touying decks into interactive HTML (SVG slides + `impress.js` + GIF/notes), PPTX (PNG slides + speaker notes), PDF, and `.pdfpc`.
  - Integrates via `utils.get-input(key: ...)` and `--input` / `--sys-inputs` (for example `export-mode=handout` or custom build flags). `utils.get-input` evaluates known Typst expressions (`red`, `3`, `2em`, `true`) as typed values while keeping unknown bare words (`handout`, `html`) as strings with no shell quoting needed.
- **`tylina`**: WYSIWYG Typst editor and presenter (web and desktop) operating directly on the canonical `.typ` workspace (Source Lens / Split editing, slide reordering, speaker notes). Exports `.pptx` in two modes — **Editable (experimental)** (native PowerPoint objects + ordered vector fallback layers) and **Visual fidelity** (rendered slide images) — both preserving speaker notes.
- **`gistd`**: Myriad-Dreamin's instant GitHub-hosted Typst viewer (`?g-mode=slide`) for sharing and presenting `.typ` slide decks straight from GitHub repositories or gists without pre-building static PDFs.
