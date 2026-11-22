# Touying 0.8.0 Themes, Custom Design, Speaker Notes & Export

Verified directly against `@preview/touying:0.8.0` (`themes/*.typ`, `src/configs.typ`, `src/core/slides.typ`, `src/core/blocks.typ`, `src/components.typ`, `src/pdfpc.typ`, `src/bundle.typ`, `src/magic.typ`, `src/utils.typ`, `changelog.md`). Requires **Typst `>= 0.15.0`**.

## 1. Built-In Themes (`themes.*`)

Import a bundled theme alongside Touying core (`#import "@preview/touying:0.8.0": *` then `#import themes.<name>: *`). All six full slide themes (`simple`, `metropolis`, `dewdrop`, `university`, `aqua`, `stargazer`) ship theme-styled `notes` functions bound to `config-common(notes-fn: notes)`.

| Theme | Theme Entry & Key Parameters | Provided Slide Helpers | Key Defaults & 0.8.0 Caveats |
| --- | --- | --- | --- |
| `default` | `default-theme(aspect-ratio: "16-9")` | `slide` | Bare `20pt` unstyled baseline; uses fallback `touying-notes` (no custom `notes-fn`). |
| `simple` | `simple-theme(aspect-ratio: "16-9", header, header-right, footer, footer-right, primary, subslide-preamble)` | `slide`, `centered-slide`, `title-slide`, `new-section-slide`, `focus-slide(background, foreground)`, `notes` | Minimalist layout with `zero-margin-header: false, zero-margin-footer: false`; `focus-slide` defaults `background: auto` (`primary`), `foreground: white`. |
| `metropolis` | `metropolis-theme(aspect-ratio: "16-9", align: horizon, header, header-right, footer, footer-right, footer-progress: true)` | `slide(title, align)`, `title-slide(extra)`, `outline-slide(level, title, spacing)`, `new-section-slide(level, numbered)`, `focus-slide(align)`, `notes` | Dark slate header (`secondary: #23373b`) + amber progress accent (`#eb811b`). `outline-slide` emits a hidden heading so header and notes see its title. |
| `dewdrop` | `dewdrop-theme(aspect-ratio: "16-9", navigation: "sidebar", sidebar, mini-slides, footer, footer-right, primary, alpha: 60%, subslide-preamble)` | `slide`, `title-slide(extra)`, `outline-slide(title)`, `new-section-slide(title)`, `focus-slide`, `notes` | `navigation` supports `"sidebar"`, `"mini-slides"`, or `none`. **`outline-title` does NOT exist** on `dewdrop-theme` — pass `title:` directly on `#outline-slide(title: ...)` / `#new-section-slide(title: ...)`. |
| `university` | `university-theme(aspect-ratio: "16-9", align: top, progress-bar: true, header, header-right, footer-columns, footer-a, footer-b, footer-c)` | `slide(align)`, `title-slide(extra)`, `new-section-slide(level, numbered)`, `focus-slide(background-color, background-img)`, `matrix-slide(columns, rows)`, `notes` | 3-column academic footer (`(25%, 1fr, 25%)`); `title-slide` auto-chunks `author`/`authors` across 3-column rows; `matrix-slide` uses `components.checkerboard`. |
| `aqua` | `aqua-theme(aspect-ratio: "16-9", header, footer)` | `slide`, `title-slide(extra)`, `outline-slide(leading: 50pt)`, `new-section-slide(level)`, `focus-slide`, `notes` | Geometric water-drop/wave background (`self.store.background`); sets `heading(numbering: "1.1")` and level-1 `"01"`. |
| `stargazer` | `stargazer-theme(aspect-ratio: "16-9", align: horizon, alpha: 20%, title, header-right, progress-bar: true, footer-columns, footer-a, footer-b, footer-c, footer-d)` | `tblock(title, it)`, `slide(title, header, footer, align)`, `title-slide(extra)`, `outline-slide(title, numbered, level)`, `new-section-slide`, `focus-slide`, `ending-slide(title)`, `notes` | Top `simple-navigation` + gradient header + 4-cell footer. **`footer` and `footer-right` do NOT exist** as parameters on `stargazer-theme(...)` — configure `footer-a`..`footer-d` and `footer-columns`. `tblock` uses `touying-fn-wrapper-raw` in `0.8.0` so animations nest inside it; `ending-slide` emits a hidden heading. |
| `themes.article` | `article-theme(title, subtitle, author, date, date-format, institution, logo, text-size: 12pt, font, numbering, paper: "a4", margin, justify: true, title-block-fn)` | Standalone prose theme (no slide helpers) | Default `article-theme: auto` target for `export-mode: "article"` (also runs standalone for A4 papers/reports without importing `touying-slides`). |

## 2. Metadata (`config-info`), Counters, Appendix & Overflow

### `config-info` Fields (`contact` and `extra`)

Alongside `title`, `short-title`, `subtitle`, `short-subtitle`, `author`, `date`, `institution`, and `logo`, `config-info` supports:
- `contact`: rendered directly by `metropolis`, `dewdrop`, `university`, and `stargazer` title slides (`email`, URL, or handle).
- `extra`: dictionary (`(:)` default) for custom theme/title metadata read via `self.info.extra.<key>`.

### `appendix` vs `freeze-slide-counter` vs `<touying:hidden>`

| Mechanism | Effect on `utils.slide-counter` (Numerator) | Effect on `utils.last-slide-number` (Denominator) | Effect on Heading / Slide Visibility |
| --- | --- | --- | --- |
| `#show: appendix` | Keeps advancing (`4`, `5`, ...) | **Frozen** at last non-appendix slide (`5 / 3`) | Normal slides render after the main deck; place at top level after main content. |
| `config-common(freeze-slide-counter: true)` | **Frozen** (does not increment on current/subsequent slides) | Also skips stepping while frozen | Used on `title-slide`, `focus-slide`, or inside `appendix` if numerator should stay fixed too. |
| `<touying:hidden>` on heading | **Advances normally** | **Advances normally** | Hides heading from numbering, `outline()`, and PDF bookmarks, and skips `new-section-slide-fn`; does **not** hide the slide. (Use `<touying:never>` to drop a slide completely.) |

### Overflow Detection (`detect-overflow: auto`)

Set `config-common(breakable: false, detect-overflow: auto)` to enforce a strict 1:1 source-slide-to-page mapping via `components.page-container`:
- In `0.8.0`, `detect-overflow: auto` activates automatically whenever `breakable: false`, checking **both height and width** and emitting a `uniwarn` warning on overflow (compilation succeeds unless `--warnings promote` promotes warnings to errors).
- Keep `clip: false` while authoring so overflow stays visible during review; avoid setting `detect-overflow: true` when `breakable: true` (triggers a warning because overflow cannot be checked across breakable pages).

## 3. Layout Components (`src/components.typ`)

- **`cols` / `side-by-side`**: `components.cols(columns: auto, gutter: 1em, lazy-layout: false, ..bodies)` is the default multi-body slide composer. Since `0.7.4`, `lazy-layout` defaults to `false` — pass `lazy-layout: true` explicitly (or `#slide(composer: cols.with(lazy-layout: true))`) when equalizing sibling heights.
- **`lazy-layout`, `lazy-v`, `lazy-h`**:
  - `lazy-layout(direction: ttb, grid-size: 50pt, body)` with `#lazy-v(1fr)` equalizes block **heights** across columns without expanding to the full page height.
  - `lazy-layout(direction: ltr, grid-size: 50pt, body)` with `#lazy-h(1fr)` equalizes block **widths** across rows.
  - `grid-size` (`50pt` default) quantizes coordinates to tolerate sub-pixel jitter; if multiple `lazy-v`/`lazy-h` markers appear in one column/row, only the **last** marker activates.
- **`components.left-mid-right(l, m, r)`**: 3-column `(1fr, auto, 1fr)` grid placing left, centered, and right-aligned content (`align(right, r)`), ideal for custom headers/footers.
- **`components.full-width-block(..args, body)`**: reads `page.width` and `page.margin` in `context` and applies negative horizontal `pad` so banners, bars, or full-bleed bands span edge-to-edge regardless of slide margins.
- **Other built-in components**: `components.adaptive-columns`, `components.progress-bar`, `components.progressive-outline`, `components.custom-progressive-outline`, `components.mini-slides`, `components.simple-navigation`, `components.checkerboard`, and `lr-navigation`.

## 4. Custom Theme Rules (`0.8.0`)

Follow these rules when writing custom themes or modifying bundled theme files:

1. **Style via `touying-slide(setting: ..)`, never pre-wrap `body`**:
   Wrapping `body` in `align(...)` or `block(...)` before passing it to `touying-slide` hides marks from the parser, breaking subslide counting and article-mode linearization.
   ```typst
   #let slide(config: (:), repeat: auto, setting: body => body, composer: auto, ..bodies) = touying-slide-wrapper(self => {
     self = utils.merge-dicts(
       self,
       config-page(header: my-header, footer: my-footer),
       config, // ALWAYS last so caller/per-slide config wins
     )
     touying-slide(
       self: self,
       config: (:),
       repeat: repeat,
       setting: it => align(horizon, setting(it)),
       composer: composer,
       ..bodies,
     )
   })
   ```
2. **Wrap helpers needing `self` with `touying-fn-wrapper-raw`**:
   Keep the content argument positional and unbaked (never pre-bake `body` into `.with(body)`). Positional arguments pass through the slide parser so `#pause`, `#only`, and nested raw wrappers (`#uncover("2-")[#callout[.. #pause ..]]`) work recursively:
   ```typst
   #let _callout(self: none, title: none, body) = block(
     fill: self.colors.primary.lighten(90%),
     inset: 0.8em,
     [*#title* \ #body],
   )
   #let callout(title: none, body) = touying-fn-wrapper-raw(_callout.with(title: title), body)
   ```
3. **Announce special-slide titles via hidden headings**:
   Give `outline-slide`, `ending-slide`, or custom special slides a zero-flow hidden heading at `level: self.slide-level` so `utils.display-current-heading` and `notes-fn` discover the title without shifting layout (`place`) or confusing `custom-progressive-outline`:
   ```typst
   place(hide(heading(
     level: self.slide-level,
     title,
     bookmarked: false,
     outlined: false,
     numbering: none,
   )))
   ```
4. **Support arbitrary aspect ratios**: pass `config-page(..utils.page-args-from-aspect-ratio(aspect-ratio))` instead of `"presentation-" + aspect-ratio`.
5. **Custom `merge-dicts` precedence**: place user `config` **last** in `utils.merge-dicts(self, config-page(...), config)` so deck and slide overrides take precedence over theme defaults.
6. **Custom `cover` protocol**: answer `if self == utils.cover-kind-query { "hide" }` (or `"recolour"` / `"paint"`) so footnotes and captions behave correctly even after `.with(...)`.

## 5. Speaker Notes, Dual-Screen & `.pdfpc` Export

### Authoring Speaker Notes

- `#speaker-note(mode: "typ", setting: it => it, subslide: auto, note)` **always attaches to the previous slide** (whether created by heading, `#slide`, or section slide), preventing ghost-slide artifacts. Multiple calls on one slide accumulate.
- `config-common(receive-body-for-new-section-slide-fn: false)` is the default (`0.7.3+`), ensuring content or notes after `= Section` are not absorbed into the section slide unless explicitly opted in.
- Pass `subslide: none` (all subslides) or an explicit spec (`"2-"`, `2`) to control per-subslide notes; `mode: "md"` emits Markdown to `.pdfpc`. Styled trees inside notes are preserved by `utils.markup-text` in `0.8.0`.

### Second-Screen & Presenter Panel (`notes-fn` + `touying-notes`)

- `config-common(show-notes-on-second-screen: right)` supports all **4 directions**: `top`, `bottom`, `left`, `right` (plus `none`). Touying doubles the page along that axis and confines `page(background: ..)` and `page(foreground: ..)` to the slide half only — never paint the notes half via `config-page(background: ..)`.
- `config-common(show-only-notes: true)` renders full-screen presenter notes with a reassembled `slide-preview` passed to `notes-fn` (useful for dual-PDF tools).
- Customize the panel via `config-common(notes-fn: ...)` wrapping `touying-notes(...)` (**never** use the removed `config-methods(show-only-notes: ..)` renderer):
  ```typst
  #let my-notes(self: none, ..args) = touying-notes(
    self: self,
    header: self => pad(x: 32pt, y: 16pt, text(
      fill: self.colors.neutral-lightest,
      utils.display-current-heading(depth: self.slide-level),
    )),
    header-fill: self.colors.primary,
    fill: self.colors.neutral-lightest,
    note-setting: note => pad(x: 48pt, note),
    preview-setting: preview => place(
      bottom + right,
      box(stroke: 1pt + gray, scale(x: 28%, y: 28%, reflow: true, preview)),
    ),
    ..args,
  )
  ```
  *(When `slide-preview == none`, the panel is rendering in second-screen mode rather than `show-only-notes` mode.)*

### Exporting `.pdfpc` & Viewing Presentations

- **Preferred Typst 0.15 bundle workflow**: place `#pdfpc.bundle-assets()` at the **top level outside every `#document(...)`** (inert in plain PDF builds) and compile with:
  ```sh
  typst compile --features bundle --format bundle --root . ./main.typ ./out
  ```
  Supports **multi-`#document`** decks in one source file (`#document("deck-a.pdf", [...])`, `#document("deck-b.pdf", [...])`): Touying scopes headings (`utils.current-heading`) and rebases logical slide numbers per document, writing `out/deck-a.pdfpc` and `out/deck-b.pdfpc` automatically.
- **Single-PDF CLI fallback**:
  ```sh
  typst eval --in ./main.typ 'query(<pdfpc-file>).first().value' > ./main.pdfpc
  ```
- **pdfpc controls**: `#pdfpc.config(duration-minutes: 25, last-minutes: 5, note-font-size: 14)`, `#pdfpc.end-slide`, `#pdfpc.save-slide`, `#pdfpc.hidden-slide`.
- **Viewers & IDE preview**:
  - **pympress**: dual-screen PDF presenter reading second-screen layouts (`show-notes-on-second-screen`) or `.pdfpc` metadata.
  - **pdfpc**: dual-monitor presenter console consuming `main.pdf` + `main.pdfpc`.
  - **Tinymist LSP**: use `Typst Preview: Preview current file in slide mode` (or browser slide mode) in VS Code — replaces the discontinued standalone Typst Preview extension.

## 6. Footnote Bibliography (`0.8.0`)

Touying `0.8.0` replaces the removed `magic.bibliography()` state mechanism with real Typst bibliographies:

```typst
#show: simple-theme.with(
  config-common(
    show-bibliography-as-footnote: true,
    footnote-style: it => text(fill: rgb("#1f4e79"), size: 0.9em, it),
  ),
)

// Emit a real #bibliography(...) on a plain slide, or wrap in only("h", ...) if the slide has #pause:
== References
#bibliography("ref.bib")
// Multi-subslide slide:
// #only("h", bibliography("ref.bib"))
// Or suppress the reference list completely while keeping footnote citations:
// #hide(bibliography("ref.bib"))
```

- **Never** call removed `magic.bibliography()` or pass `bibliography(...)` as the value of `show-bibliography-as-footnote:`.
- Use `#only("h", bibliography("ref.bib"))` if the bibliography sits on a multi-subslide slide so citation numbering does not restart across subslides.
- Pass `auto` or a callback function (`it => ...`) to `config-common(footnote-style: ...)` when restyling citation/footnote markers (`show footnote: footnote-style`) so real footnotes and Touying's covered placeholder boxes match widths; **never** pass a dictionary (that fails with `expected content or function, found dictionary`).
- **CSL note style caution**: if your citation style already produces footnote citations (such as `"chicago-notes"`), leave `show-bibliography-as-footnote: false` (`0.8.0` keeps covered note-style citations suppressed cleanly until their reveal subslide).
