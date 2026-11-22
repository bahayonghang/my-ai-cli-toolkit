# Touying 0.8.0 Output Modes & Article Mode

Verified against `@preview/touying:0.8.0` (`src/entrypoint.typ`, `src/configs.typ`, `src/core/article.typ`, `src/core/parser.typ`, `src/core/slides.typ`, `src/core/animation.typ`, `src/utils.typ`, `themes/article.typ`).

## 1. The Four `export-mode` Values & CLI Override

Configure output mode via `config-common(export-mode: ...)` or override at compile time via `--input export-mode=...`:

| `export-mode` | Resulting State | Behavior |
| --- | --- | --- |
| `"slides"` (default) | Uses `config-common(handout: bool)` | `handout: false` -> presentation; `handout: true` -> handout. |
| `"presentation"` | Forces `handout: false` | Renders every subslide of every slide. |
| `"handout"` | Forces `handout: true` | Renders final subslide per slide (or `handout-subslides`). |
| `"article"` | Sets `article-mode: true`, `handout: true` | Continuous flowing prose via `article-theme`; strips headers/footers, disables pdfpc, freezes slide counter, neutralizes slide theme `methods.init`. |

### CLI Compilation & `utils.get-input`

```sh
typst compile main.typ main-presentation.pdf --input export-mode=presentation --warnings promote
typst compile main.typ main-handout.pdf      --input export-mode=handout --warnings promote
typst compile main.typ main-article.pdf      --input export-mode=article --warnings promote
```

- `entrypoint.typ` reads `utils.get-input(key: "export-mode")`, overriding both source `export-mode` and the low-level `article-mode` flag.
- `utils.get-input(key: none)` parses Typst expressions (`red`, `3`, `2em`, `true`, dicts) and leaves unknown bare single words (`handout`, `article`, `presentation`) as strings, so `--input export-mode=article` works without shell quotes. Calling `utils.get-input()` with no key returns the full parsed `sys.inputs` dictionary (excluding `x-preview`).

## 2. `handout-subslides` Selection

When `handout` is active, `config-common(handout-subslides: ...)` (default `none`) controls which subslides render per slide (`src/core/slides.typ`):

- `none` (default): renders only the final subslide (`repeat`).
- `int` (including negative indices like `-1` via `resolve-negative-subslides`): renders that subslide.
- `str` spec (e.g. `"1, 3-"`, `"!2"`): renders matching subslides (note: `"-2"` means `1..2`; negative integers inside strings are not supported).
- `array` of `int`, `str`, waypoint `<label>`, or waypoint marker (resolved to first subslide via `_resolve-waypoint-to-int`).
- On multi-page handout slides, non-first pages set `_handout-secondary: true` so the slide counter steps once and preambles do not repeat while `#handout-only` stays visible.

## 3. Inline Mode Markers (`#...-only` & `#article-text`)

| Marker | Visible In | Behavior & Constraints |
| --- | --- | --- |
| `#presentation-only[..]` | `"presentation"` (`not article and not handout`) | Reserves no space when hidden; body may contain headings, `#pagebreak()`, or `---`, or wrap `#slide[..]`. |
| `#handout-only[..]` | `"handout"` (`not article and handout`) | Same direct embedding; replaces removed `utils.handout-only`. |
| `#slides-only[..]` | `"presentation"` and `"handout"` (`not article`) | Stripped completely in `"article"` mode; safe wrapper around slide-only `#touying-render(start: ...)` or whole-slide `#touying-recall`. |
| `#article-only[..]` | `"article"` only | Emits standalone sections, remarks, or appendices in article output without replacing preceding slides (`---` renders literally; `pagebreak()` works). |
| `#article-text[..]` | `"article"` only | Replaces the entire enclosing slide/region (up to the next heading `<= slide-level` or `#pagebreak()`) with prose, wherever inside the slide it is written. Max 1 per slide (later ones warn and are ignored). `#touying-recall` inside it can still target breadcrumbs from the replaced slide content. |

> [!NOTE]
> `#article-linearize` and `#article-keep-layout` panic if placed inside `#article-only` or `#article-text`, because those bodies only ever render in article mode—write the target layout there directly.

## 4. Heading & Slide Mode Labels (`<touying:...>`)

Attach mode labels directly to headings (`== Demo <touying:slides>`) or explicit slides (`#slide[..]<touying:article>`):

- `<touying:presentation>` — presentation mode only.
- `<touying:handout>` — handout mode only.
- `<touying:slides>` — presentation or handout (not article).
- `<touying:article>` — article mode only.
- **Hyphen combinations (OR semantics)**: e.g. `<touying:handout-article>` or `<touying:presentation-article>`.
- `<touying:never>` — excludes the heading section or slide from **every** output mode (Typst equivalent of `\iffalse`; does not compose with hyphens).
- Skipping a labelled heading excludes its entire section up to the next heading of equal or shallower depth.

## 5. `config-article(...)` & `themes.article`

In `"article"` mode, Touying applies `config-common(article-theme: auto)` (which defaults to `themes.article.article-theme`) and reads layout rules from `config-article(...)`:

### `config-article` Verified Signature (`src/configs.typ`)

| Parameter | Default (`default-config`) | Exact Semantics |
| --- | --- | --- |
| `available-fields` | `(:)` | Dict mapping `article-theme` param names to config paths, e.g. `(title: "info.title", subtitle: "common.export-mode")`. Prefix `"common."` reads top-level `self.<key>`. Missing paths assert. |
| `title-block-fn` | `none` | `none` (theme or `#article-only` handles title), `auto` (renders built-in block from `document.title/author/date/description/keywords`), or function `self => content`. |
| `wrap` | `(width: 50%, align: right, image: true)` | Controls side-floating via `@preview/meander`. `false` disables all floats; `true` floats all candidates. Dict supports `width`, `align`, element-name keys (`image: true`, `table: (align: left, width: 35%)`, `figure: false`), and `overrides`. |
| `linearize` | `auto` | Flattens layout containers into prose. `auto` flattens `columns(...)` (stripping `colbreak`) and headerless/footerless `table`/`grid` (such as `components.cols` / `side-by-side`), while keeping `table`/`grid` that declare `table.header`/`table.footer`/`grid.header`/`grid.footer` as structured blocks. `figure` bodies are never flattened. Accepts `bool` or `(table: .., grid: .., columns: ..)`. |

### `wrap.overrides`, `#article-linearize`, `#article-keep-layout` & Graphic Markers

- **`overrides` order**: Evaluated *before* element-name keys so a predicate can match `figure` containing an `image` or a marked diagram.
- **`#graphic-marker(fn, body)` & `graphic-marker-of(fn)`**: `touying-reducer` / `touying-reduce` automatically tags animated diagrams in article mode (unfloated by default). Tag static diagrams with `#graphic-marker(cetz.canvas, cetz.canvas(..))` to target them via `graphic-marker-of(cetz.canvas)`.
- **`#article-linearize[..]` / `#article-keep-layout[..]`**: Override `linearize` for one container. Attach user labels to the inner element rather than the wrapper call (`#article-keep-layout[#table(..) <tab:x>]`).
- **Standalone `themes.article`**: `themes.article.article-theme` takes `title`, `subtitle`, `author`, `date`, `date-format`, `institution`, `logo`, `text-size: 12pt`, `font: auto`, `numbering: none`, `paper: "a4"`, `margin: (x: 2.5cm, y: 2.5cm)`, `justify: true`, `title-block-fn`.

```typst
#import "@preview/touying:0.8.0": *
#import themes.simple: *
#import "@preview/cetz:0.4.2"

#show: simple-theme.with(
  config-info(title: [Dual-Mode Deck], author: [Author]),
  config-common(
    export-mode: "slides",
    handout-subslides: "1, -1",
    article-theme: themes.article.article-theme.with(numbering: "1.1"),
  ),
  config-article(
    available-fields: (title: "info.title", author: "info.author"),
    linearize: (table: auto, grid: auto, columns: true),
    wrap: (
      width: 40%,
      align: right,
      image: true,
      overrides: (
        (target: el => el.func() == figure and el.body.func() == image, align: left),
        (target: graphic-marker-of(cetz.canvas), width: 45%, align: right),
      ),
    ),
  ),
)

= Overview

== Architecture <touying:slides>

#slide(composer: (1fr, 1fr))[
  - Slide bullet A
  - Slide bullet B
][
  #graphic-marker(cetz.canvas, cetz.canvas({ /* ... */ }))
]
#article-text[
  Flowing prose summary replacing slide bullets in article output.
]

#article-only[
  == Extended Appendix
  Detailed proof included only in the continuous article build.
]
```

## 6. Removed / Deprecated -> Use Instead

| Legacy / Nonexistent API | Status in `0.8.0` | Use Instead |
| --- | --- | --- |
| `utils.handout-only[..]` | Removed | Top-level `#handout-only[..]` marker. |
| `touying-equation(...)` | Deprecated (removed in `0.9.0`) | Native Typst math (`$ ... $`) directly. |
| `utils.semi-transparent-cover` | Deprecated (removed in `0.9.0`) | `utils.alpha-changing-cover` or `utils.color-changing-cover`. |
| `touying-recall(<lbl>, subslide: ...)` | Removed singular key | Plural `touying-recall(<lbl>, subslides: ...)`. |
