# Touying 0.8.0 Troubleshooting & Diagnostics

## 1. Compile, Layout & `--warnings promote` Diagnostics

| Symptom / Error | Cause | Fix |
| --- | --- | --- |
| `#set page(...)` ignored or overwritten | `touying-slide` calls `set page(..self.page)` per subslide | Move margin, fill, paper, header, footer into `config-page(...)` or per-slide `config: config-page(...)` |
| Slide breaks at wrong heading level | Default `slide-level: 2` splits on `=` and `==` | Adjust via `config-common(slide-level: n)` or disable `---` splitting with `horizontal-line-to-pagebreak: false` |
| `Unsupported mark ...` panic (`#pause` / `#only` / `#slides-only`) | Animation/mode mark placed inside `context`, `measure`, `layout`, or `.with(...)`-baked wrapper | Move marks out to slide flow, use `utils.methods(self)` with explicit `repeat: N`, or wrap theme helpers in `touying-fn-wrapper-raw` |
| `--warnings promote` fails on `semi-transparent-cover` | Deprecated in `0.8.0` (removed in `0.9.0`) | Switch to `utils.alpha-changing-cover` or `utils.color-changing-cover` |
| `--warnings promote` fails on `touying-equation` | Deprecated in `0.8.0` (removed in `0.9.0`) | Write native Typst math animations directly (`$ frac(a #pause + b, c) $`) |
| `--warnings promote` fails with `detecting slide content overflow` | Slide content height or width exceeds available page area when `breakable: false` | Split dense bullets across slides, tighten layout, or use `clip: true` / `breakable: true` intentionally |
| Warning: `detect-overflow: true` cannot take effect while `breakable` is `true` | `breakable: true` creates new pages instead of fixed slide boxes | Set `config-common(breakable: false)` (and leave `detect-overflow: auto`) for strict 1:1 slide-to-page enforcement |
| Panic on negative subslide (`-1`) in `#only` / `#uncover` / `#animate` | `0.8.0` forbids negative indices on flow-parsed animation functions | Place `#waypoint(<end>)` at target stage and pass `get-last(<end>)` |
| Citation numbering restarts or footnote bib disappears | Bibliography sits on a multi-subslide slide or `magic.bibliography()` was called | Set `config-common(show-bibliography-as-footnote: true)` and emit `#only("h", bibliography("ref.bib"))` |
| Duplicate label error (`label ... occurs multiple times`) | Labelled element repeated across `#pause` subslides | Ensure element func is listed in `config-common(label-only-on-last-subslide: ...)` or wrap inside `#figure` |
| Unexpected blank or wrong page in `#appendix` | `#show: appendix` placed mid-slide or `freeze-slide-counter` expected | Place `#show: appendix` at top level after main deck; add `config-common(freeze-slide-counter: true)` to also freeze numerator |
| `touying-get-config` fails in `if` / arithmetic | `touying-get-config` returns deferred `context` content, not raw values | Use `touying-fn-wrapper-raw((self: none) => ...)` to compute from `self` |
| Custom slide function breaks theme or headers | Missing `touying-slide-wrapper` | Return `touying-slide-wrapper(self => { ... })` |
| Missing CJK or icon fonts on compile | Local fonts not discovered on CLI path | Compile with `typst compile --font-path <fonts-dir> --warnings promote main.typ` |
| `.pdfpc` export via bundle fails or missing notes | `#pdfpc.bundle-assets()` called inside `#document(...)` | Call `#pdfpc.bundle-assets()` at top level outside every `#document(...)` and pass `--features bundle --format bundle` |
| `Circular waypoint dependency detected` or `Unknown waypoint label` | Cyclic `waypoint(start: <label>)` dependency or range marker referencing undeclared label | Break `start:` cycles and declare `<label>` via `#waypoint(<label>)` or implicit `<label>`; see [Animations & Waypoints](animations-waypoints.md) |
| `item-by-item: start must resolve to a single subslide position` | Range marker (`from-wp`, `until-wp`) or range string passed to `start:` | Pass `<wp>`, `get-first(<wp>)`, `get-last(<wp>)`, `prev-wp`, `next-wp`, or a single int/number string |
| `#animate` rejects `subslides: auto` or stretched `swap` measures `0pt` | `#animate` requires `"h"` instead of `auto`, and `stretch: true` cannot measure bare `context` content | Write `"h"` for placement-time subslide and wrap `context` content in a fixed `box(...)` (or keep `stretch: false`); see [Animations & Waypoints](animations-waypoints.md) |
| `std.measure` returns `0pt` on `#uncover`/`#only` body | Typst `std.measure` sees unresolved metadata marks | Call Touying's `#measure(body, subslide: ...)` inside `context` |
| `#touying-render` warns `start:/repeat-last: have no effect` or `touying-recall` warns on whole-slide target in article mode | Article mode renders once with no subslide timeline or slide replay | Wrap slide-gated `#touying-render(start: ...)` or whole-slide recalls in `#slides-only[...]`; see [Output Modes & Article Mode](output-modes-article.md) |
| `#article-linearize` / `#article-keep-layout` panics inside `#article-text` / `#article-only` | Those wrappers only ever reach article mode directly | Write the desired article layout directly inside `#article-text` or `#article-only` |
| `config-article(wrap:)` error or `table`/`grid` flattens unexpectedly in article mode | Invalid keys (`wrap` uses `width`, `align`, element keys, `overrides` with `target:`) or table lacks `table.header`/`grid.header` | Use `config-article(wrap: (...), linearize: ...)` and declare `table.header(...)` or wrap with `#article-keep-layout[...]`; see [Output Modes & Article Mode](output-modes-article.md) |

## 2. Explicit Path Input Errors

When `$ARGUMENTS` names a target `.typ` file and validation fails, return exact diagnostics before attempting edits:
- `"Error: Provide a valid .typ file path."` — when an explicit path argument is empty or omits a file when required
- `"Error: File not found."` — when the requested `.typ` file does not exist
- `"Error: Not a .typ file."` — when the path extension is not `.typ`
