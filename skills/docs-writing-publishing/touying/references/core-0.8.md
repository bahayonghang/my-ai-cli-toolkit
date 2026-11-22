# Touying 0.8.0 Core Contract & Multi-File Architecture

Verified against `@preview/touying:0.8.0` (`typst.toml`, `src/exports.typ`, `src/configs.typ`, `src/entrypoint.typ`, `src/core/slides.typ`, `src/utils.typ`, `src/extern.typ`). Requires **Typst `>= 0.15.0`**.

## 1. Package Import & Built-In Themes

```typst
#import "@preview/touying:0.8.0": *
#import themes.simple: *
```

Bundled themes exported under `themes`:
- Slide themes: `default`, `simple`, `metropolis`, `dewdrop`, `university`, `aqua`, `stargazer`
- Standalone article theme: `themes.article` (default target of `config-common(article-theme: auto)`)

All six full slide themes (`simple`, `metropolis`, `dewdrop`, `university`, `aqua`, `stargazer`) ship theme-styled `notes` panels built on `touying-notes` in `0.8.0`.

## 2. Multi-File Architecture

Split medium/large presentations into three layers so both `main.typ` and section files can import `globals.typ` without circular dependencies:

```text
project/
├── typst.toml          # Optional project manifest (compiler = "0.15.0")
├── globals.typ         # Imports @preview/touying:0.8.0, theme, shared helpers/colors
├── main.typ            # Applies #show: <theme>.with(...) and #include sections
└── sections/
    ├── 01-intro.typ    # Imports "/globals.typ": * and contains headings/slides
    └── 02-method.typ
```

**`globals.typ`**:
```typst
#import "@preview/touying:0.8.0": *
#import themes.university: *

// Shared helper components or palette constants
#let accent-box(title, body) = block(
  width: 100%,
  inset: 0.8em,
  radius: 4pt,
  fill: rgb("#f3f6fa"),
  [*#title* \ #body],
)
```

**`main.typ`**:
```typst
#import "/globals.typ": *

#show: university-theme.with(
  aspect-ratio: "16-9",
  config-info(
    title: [Presentation Title],
    short-title: [Short Title],
    subtitle: [Optional Subtitle],
    author: [Author Name],
    date: datetime.today(),
    institution: [Institution],
    contact: [contact@example.org],
    extra: (department: [CS]),
  ),
  config-common(
    slide-level: 2,
    export-mode: "slides",
  ),
)

#title-slide()
#include "sections/01-intro.typ"
#include "sections/02-method.typ"
```

**`sections/01-intro.typ`**:
```typst
#import "/globals.typ": *

= Section One

== First Slide

- Point A
- Point B
```

## 3. Configuration Families (`src/configs.typ`)

Theme functions merge configurations in order (`default-config` -> theme defaults -> user `config-*` args -> per-slide `config:`). All `config-*` helpers only accept **named** arguments (`assert(args.pos().len() == 0)`).

### `config-page(...)` — Page Layout (Never Use Raw `#set page`)

| Parameter | Default | Notes |
| --- | --- | --- |
| `paper` | `"presentation-16-9"` | Or pass `..utils.page-args-from-aspect-ratio("16-10")` for custom aspect ratios (`"16-9"`, `"16-10"`, `"4-3"`, etc.) |
| `header` | `none` | Content or `self => content` callback |
| `footer` | `none` | Content or `self => content` callback |
| `fill` | theme default (`rgb("#ffffff")` in docs) | Slide background fill |
| `margin` | `(x: 3em, y: 2.8em)` | Length or Typst margin dict (`top`, `right`, `bottom`, `left`, `inside`, `outside`, `x`, `y`, `rest`). Merging `x`/`y` clears conflicting `left`/`right` or `top`/`bottom`; `rest` replaces prior dict. |
| `numbering` | `"1"` | Page numbering format or function |

### `config-info(...)` — Metadata & `set document`

| Parameter | Default | Notes |
| --- | --- | --- |
| `title`, `short-title` | `none`, `auto` | `short-title: auto` mirrors `title` for headers/footers |
| `subtitle`, `short-subtitle` | `none`, `auto` | `short-subtitle: auto` mirrors `subtitle` |
| `author`, `date`, `institution`, `logo` | `none` | `title`, `author`, `date` populate Typst `#set document(...)` |
| `contact` | `none` | Contact field (`0.7.1+`) |
| `extra` | `(:)` | Custom dict read by themes via `self.info.extra.<key>` (`0.7.1+`) |

### `config-colors(...)` — Four-Group RGB Palette

Defines `primary`, `secondary`, `tertiary`, and `neutral`, each with 7 shades:
`<group>`, `<group>-light`, `<group>-lighter`, `<group>-lightest`, `<group>-dark`, `<group>-darker`, `<group>-darkest`. Define values in RGB format for predictable cover fading.

### `config-common(...)` — Core Behaviour Options

**Slide splitting & headings**:
- `slide-level: 2` — Heading depth threshold (`1..slide-level` trigger slide breaks; deeper headings remain inside the slide body).
- `slide-fn: slide` — Slide rendering function.
- `new-section-slide-fn: none`, `new-subsection-slide-fn: none`, `new-subsubsection-slide-fn: none`, `new-subsubsubsection-slide-fn: none`.
- `receive-body-for-new-section-slide-fn: false` (and matching subsection/etc. flags; defaulted to `false` since `0.7.3`).
- `auto-offset-for-heading: false` — Offsets in-slide headings relative to `slide-level`.
- `horizontal-line-to-pagebreak: true` — Converts Markdown `---` to slide breaks.

**Overflow & page containment (`0.7.1` / `0.8.0`)**:
- `breakable: true` — Set `false` to constrain each slide to one non-breakable `components.page-container` (strict 1:1 source slide to rendered page mapping).
- `clip: false` — Truncates visual overflow when `breakable: false`.
- `detect-overflow: auto` — In `0.8.0`, `auto` enables measurement whenever `breakable: false`, checking **both height and width** and emitting a `uniwarn` warning (compilation continues unless `--warnings promote` is used). Setting `detect-overflow: true` while `breakable: true` emits a warning because overflow cannot be measured across breakable pages.

**Export modes & handouts (`0.8.0`)**:
- `export-mode: "slides"` — Accepts `"slides"` (uses `handout` flag), `"presentation"`, `"handout"`, `"article"`. Passing `typst compile deck.typ --input export-mode=article` (read via `utils.get-input(key: "export-mode")`) overrides the source setting.
- `handout: false`, `handout-subslides: none` (`int`, `array`, `str` like `"1, 3-"`, `-1`, or waypoint label).
- `article-mode: false` (low-level switch behind `export-mode: "article"`), `article-theme: auto`.

**Counters & appendix**:
- `appendix: false` — Activated via `#show: appendix`. Freezes `utils.last-slide-number` (denominator) at the last main slide while `utils.slide-counter` keeps advancing (e.g. `5 / 3`).
- `freeze-slide-counter: false` — Freezes the slide counter itself.
- `reset-page-counter-to-slide-counter: true`.

**Speaker notes & `.pdfpc` (`0.8.0`)**:
- `show-only-notes: false` — Full-screen presenter note view with scaled `slide-preview`.
- `notes-fn: touying-notes` — Panel renderer `(self: none, note: none, slide-preview: none) -> content`.
- `show-notes-on-second-screen: none` — Accepts `none`, `bottom`, `right`, `top`, `left`. Page `background`/`foreground` remain confined to the slide half.
- `enable-pdfpc: true` — Emits `<pdfpc-file>` metadata; export either with `#pdfpc.bundle-assets()` under `--features bundle --format bundle` or via `typst eval --in ./deck.typ 'query(<pdfpc-file>).first().value' > ./deck.pdfpc`.

**Bibliography, footnotes & typography**:
- `show-bibliography-as-footnote: false` — Boolean in `0.8.0`; pair with a real `#bibliography("ref.bib")` (or `only("h", bibliography(...))` on multi-subslide slides).
- `reset-footnote-number-per-slide: true`, `footnote-style: auto` (`auto` or a `function` `it => ...` installed via `show footnote: footnote-style` and measured for Touying's covered placeholder marker; never pass a dictionary).
- `show-strong-with-alert: true`, `nontight-list-enum-and-terms: false`, `align-list-marker-with-baseline: false`, `align-enum-marker-with-baseline: false`, `scale-list-items: none`, `show-hide-set-list-marker-none: true`.
- `default-composer: auto` — Defaults to `components.cols.with(lazy-layout: false)`.

**States, labels & preambles**:
- `enable-frozen-states-and-counters: true`, `frozen-states: ()`, `frozen-counters: ()`.
- `label-only-on-last-subslide: (figure, math.equation, heading, footnote)` — Prevents ambiguous duplicate labels across `#pause` subslides.
- `enable-mark-warning: true` — Panics on unconsumed marks inside `context`/`measure`; set `false` to downgrade to warning.
- `preamble`, `slide-preamble`, `subslide-preamble`, `page-preamble` (plus `default-*` counterparts).

### `config-methods(...)` & `config-store(...)`

- `config-methods(...)`: configures `init`, `cover` (`utils.hiding-cover`, `utils.alpha-changing-cover`, `utils.color-changing-cover`, `utils.cover-with-rect`), `uncover`, `only`, `effect`, `alternatives`, `alternatives-match`, `alternatives-fn`, `alternatives-cases`, `item-by-item`, `alert`, `convert-label-to-short-heading`.
- `config-store(...)`: stores theme-private keys read via `self.store.<key>` inside theme functions.

### `touying-get-config(...)`

Reads deferred config values inside `context` for **display only** (returns deferred wrappers, cannot be used for control-flow arithmetic; use `touying-fn-wrapper-raw((self: none) => ...)` when computing on `self`). In `0.8.0`, `common` is exposed as a virtual root category:

```typst
#touying-get-config("common.handout")
#touying-get-config().common.slide-level
#touying-get-config().store.header
```
*(Querying `common.store` or other real category names under `common` panics unless a `default:` is given.)*

## 4. Headings, Explicit Slides & Special Labels

- **Heading slides** (`= Section`, `== Slide Title` with `slide-level: 2`): concise default syntax.
- **Explicit `#slide(...)`**: use when passing `config:`, `repeat:`, `setting:`, `composer:` (e.g. `#slide(composer: (1fr, 2fr))[Left][Right]`), or attaching a recall label `#slide[...]<key-slide>`.
- **`#empty-slide(...)`**: renders a standalone slide outside heading/section tracking.
- **Custom slide functions**: must return `touying-slide-wrapper(self => { ... })`.

**Heading & Slide Labels (`core/slides.typ`, `core/parser.typ`)**:

| Label | Effect |
| --- | --- |
| `<touying:hidden>` | Hides heading from numbering, outline, and bookmarks, and skips `new-section-slide-fn`. Does **not** hide the slide or freeze `slide-counter`. |
| `<touying:skip>` | Skips `new-section-slide-fn` while keeping normal numbering/outline/bookmarks. |
| `<touying:unnumbered>` | Sets `numbering: none` on the heading. |
| `<touying:unoutlined>` | Excludes heading from `outline()`. |
| `<touying:unbookmarked>` | Excludes heading from PDF bookmarks. |
| `<touying:presentation>`, `<touying:handout>`, `<touying:slides>`, `<touying:article>` | Restricts heading section or `#slide[..]` to matching output modes; combinable with hyphens (e.g. `<touying:presentation-article>`). |
| `<touying:never>` | Excludes the slide or section from every output mode (Typst equivalent of `\iffalse`). |

**`touying-recall(<lbl>, subslides: auto, base: auto)`**:
- Recalls either a whole slide (`= Title <lbl>` / `#slide[..]<lbl>`) or any labelled element (`table`, `figure`, `touying-reducer`) placed earlier in the document.
- `subslides: auto` (default) replays all subslides of a whole slide, or the final animation state of a labelled element; `subslides: none` replays only the last subslide; also accepts `int` (including `-1`), `"waypoints"`, waypoint `<wp>`, or `get-first`/`get-last`.

## 5. Warning Controls (`src/extern.typ`)

Touying `0.8.0` uses `@preview/uniwarn:0.1.1` under namespace `"touying"`. Suppress or re-enable warnings around specific blocks with:

```typst
#touying-disable-warnings
// content that intentionally emits a touying warning
#touying-enable-warnings
```
