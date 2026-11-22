# Migrating Touying 0.6.x / 0.7.x Presentations & Themes to 0.8.0

Verified directly against `@preview/touying:0.8.0` `changelog.md` and source modules.

## 1. Compiler & Package Version

Update both package imports and `typst.toml`:

```toml
[package]
compiler = "0.15.0"
```

```typst
// Before
#import "@preview/touying:0.6.1": *

// After
#import "@preview/touying:0.8.0": *
```

Typst `0.15.0+` is required for bundle export (`.pdfpc` assets) and the reworked cover/tree engines.

## 2. Breaking Changes Checklist (`0.6.x` / `0.7.x` -> `0.8.0`)

| Area | Legacy (`0.6.x` / `0.7.x`) | Touying `0.8.0` Replacement | Notes |
| --- | --- | --- | --- |
| Typst version | `0.12.0`–`0.14.x` | `0.15.0+` | Required in `typst.toml` |
| Pause after `uncover`/`only`/`alternatives` | Snapped past reserved subslides in `0.7.0–0.7.4` | Independent of fn-wrapper reservation | Only `item-by-item` (`advances-flow: true`) advances pause flow; add `#pause`, `#jump`, or `#waypoint` if you relied on `0.7.x` snap |
| Negative indices in `#only`/`#uncover`/`#animate` | Silently rendered nothing | **Panics** at compile time | Replace `#only(-1)[..]` with `#waypoint(<end>)` + `#only(get-last(<end>))[..]` (`handout-subslides: -1`, `touying-recall`, `touying-render`, and `"-2"` strings remain valid) |
| Semi-transparent cover | `config-methods(cover: utils.semi-transparent-cover)` | `utils.alpha-changing-cover` or `utils.color-changing-cover.with(color: gray)` | Legacy cover is deprecated (removed in `0.9.0`) and fails under `--warnings promote`; `cover-with-rect` does not warn |
| Equation animations | `#touying-equation("...")` | Native math (`$ frac(a #pause + b, c) $`) | `touying-equation` is deprecated (removed in `0.9.0`); `0.8.0` animates inside `frac`, `mat`, `vec`, `cases`, `binom`, `root`, `attach`, `accent`, `cancel`, `lr` |
| Footnote bibliography | `config-common(show-bibliography-as-footnote: bibliography("ref.bib"))` + `#magic.bibliography()` | `config-common(show-bibliography-as-footnote: true)` + real `#bibliography("ref.bib")` | `magic.bibliography()` is removed; wrap with `only("h", bibliography(...))` if on a multi-subslide slide, or `hide(...)` to suppress reference list |
| Speaker-note panel renderer | `config-methods(show-only-notes: fn)` | `config-common(notes-fn: fn)` using `touying-notes(...)` | `config-common(show-only-notes: true)` flag stays unchanged; old `cutout` / `(background, foreground)` protocol removed |
| Second-screen background | `config-page(background: ..)` stretched across both halves | `background`/`foreground` confined to slide half | Move notes-half styling into `notes-fn` (`fill` / `header-fill` on `touying-notes`) |
| `touying-recall` args | `subslide:` (`none` default = all subslides, `auto` = last) | `subslides:` (`auto` default = all subslides / final state, `none` = last only) | Swap explicit `none`/`auto` values and rename parameter to plural `subslides:` |
| Handout-only block | `utils.handout-only[..]` | Top-level `#handout-only[..]` | `utils.handout-only` removed; new `#handout-only` works with slide breaks (`#presentation-only`, `#slides-only`, `#article-only`, `#article-text` also top-level) |
| `detect-overflow` default | `true` (`0.7.1`) | `auto` (active when `breakable: false`) | Also measures width as well as height in `0.8.0` |
| `cols` `lazy-layout` default | `true` (early `0.7.x`) | `false` (`0.7.4+`) | Pass `lazy-layout: true` explicitly to `cols(...)` if using `lazy-v` |
| Section slide body | `receive-body-for-new-section-slide-fn: true` | `false` (`0.7.3+`) | Pass `true` explicitly in `config-common(...)` if section slides consume following body text |
| `#speaker-note[]` placement | Could spawn an unwanted blank slide after heading/slide | Always attaches to previous slide (`0.7.3+`) | No workaround `---` hacks needed |
| `touying-reducer-bindings` | Path string arrays `("draw", "hide", arguments(..))` | Lambdas `module => module.draw.hide.with(..)` | Or use `#touying-reduce("cetz")` automatic bindings |

## 3. Concrete Before/After Recipes

### Footnote Bibliography
```typst
// Before (0.6.x / 0.7.x)
#show: simple-theme.with(
  config-common(show-bibliography-as-footnote: bibliography("ref.bib")),
)
== References
#magic.bibliography()

// After (0.8.0)
#show: simple-theme.with(
  config-common(show-bibliography-as-footnote: true),
)
== References
#only("h", bibliography("ref.bib"))
```

### Semi-Transparent Covers
```typst
// Before
config-methods(cover: utils.semi-transparent-cover)

// After (preserves hues, uses context)
config-methods(cover: utils.alpha-changing-cover.with(alpha: 25%))

// Or faster compile (flat color)
config-methods(cover: utils.color-changing-cover.with(color: gray))
```

### Native Math Instead of `touying-equation`
```typst
// Before
#touying-equation(`f(x) = pause x^2 + pause 1`)

// After (0.8.0)
$ f(x) = #pause x^2 + #pause 1 $
$ frac(a #pause + b, c) $
$ mat(a, #pause b; c, d) $
```

### Waypoint Replacement for `#only(-1)`
```typst
// Before (0.6.x/0.7.x silently skipped; 0.8.0 panics)
A #pause B #pause C
#only(-1)[Summary]

// After (0.8.0)
A #pause B #pause C #waypoint(<end>)
#only(get-last(<end>))[Summary]
```

### `touying-recall` Plural Parameter & Swapped Semantics
```typst
// Before
#touying-recall(<intro>, subslide: auto)  // meant last subslide in 0.7.4

// After (0.8.0)
#touying-recall(<intro>, subslides: none) // last subslide only
#touying-recall(<intro>, subslides: auto) // all subslides of whole slide, or final state of element
```

### Theme Author Notes (`0.6.3`–`0.8.0`)
1. Place user `config` **last** in `utils.merge-dicts(self, config-page(...), config)` so user overrides win.
2. Replace `paper: "presentation-" + aspect-ratio` with `..utils.page-args-from-aspect-ratio(aspect-ratio)`.
3. Prefer `touying-fn-wrapper-raw` over `touying-fn-wrapper` for helper components (alerts, theorem/callouts) so `#pause`/`#only` nest recursively inside positional args (do not pre-bake positional body into `.with(...)`).
4. Implement `notes(self: none, ..args)` wrapping `touying-notes(self: self, ...)` and register `config-common(notes-fn: notes)` in the theme.
5. Custom cover functions should answer `if self == utils.cover-kind-query { "hide" }` (or `"recolour"` / `"paint"`) so footnotes and captions behave accurately.
