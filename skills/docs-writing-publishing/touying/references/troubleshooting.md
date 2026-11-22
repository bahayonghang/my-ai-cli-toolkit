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
| Missing CJK or icon fonts on compile | Local fonts not discovered on CLI path | Compile with `typst compile --font-path <fonts-dir> main.typ` (add `--warnings promote` when supported, or verify via `touying_check.py compile`) |
| `.pdfpc` export via bundle fails or missing notes | `#pdfpc.bundle-assets()` called inside `#document(...)` | Call `#pdfpc.bundle-assets()` at top level outside every `#document(...)` and pass `--features bundle --format bundle` |
| `Circular waypoint dependency detected` or `Unknown waypoint label` | Cyclic `waypoint(start: <label>)` dependency or range marker referencing undeclared label | Break `start:` cycles and declare `<label>` via `#waypoint(<label>)` or implicit `<label>`; see [Animations & Waypoints](animations-waypoints.md) |
| `item-by-item: start must resolve to a single subslide position` | Range marker (`from-wp`, `until-wp`) or range string passed to `start:` | Pass `<wp>`, `get-first(<wp>)`, `get-last(<wp>)`, `prev-wp`, `next-wp`, or a single int/number string |
| `#animate` rejects `subslides: auto` or stretched `swap` measures `0pt` | `#animate` requires `"h"` instead of `auto`, and `stretch: true` cannot measure bare `context` content | Write `"h"` for placement-time subslide and wrap `context` content in a fixed `box(...)` (or keep `stretch: false`); see [Animations & Waypoints](animations-waypoints.md) |
| `std.measure` returns `0pt` on `#uncover`/`#only` body | Typst `std.measure` sees unresolved metadata marks | Call Touying's `#measure(body, subslide: ...)` inside `context` |
| `#touying-render` warns `start:/repeat-last: have no effect` or `touying-recall` warns on whole-slide target in article mode | Article mode renders once with no subslide timeline or slide replay | Wrap slide-gated `#touying-render(start: ...)` or whole-slide recalls in `#slides-only[...]`; see [Output Modes & Article Mode](output-modes-article.md) |
| `#article-linearize` / `#article-keep-layout` panics inside `#article-text` / `#article-only` | Those wrappers only ever reach article mode directly | Write the desired article layout directly inside `#article-text` or `#article-only` |
| `config-article(wrap:)` error or `table`/`grid` flattens unexpectedly in article mode | Invalid keys (`wrap` uses `width`, `align`, element keys, `overrides` with `target:`) or table lacks `table.header`/`grid.header` | Use `config-article(wrap: (...), linearize: ...)` and declare `table.header(...)` or wrap with `#article-keep-layout[...]`; see [Output Modes & Article Mode](output-modes-article.md) |
| `dewdrop-theme` rejects `outline-title` or `stargazer-theme` rejects `footer` / `footer-right` | Neither parameter exists on those themes in `0.8.0` | Pass `title:` to `dewdrop`'s `#outline-slide(title: ...)` and configure `stargazer-theme` via `footer-a`..`footer-d` / `footer-columns` |
| `config-methods(show-only-notes: fn)` fails or notes panel background ignored | Legacy `show-only-notes` renderer removed; `config-page(background: ..)` is confined to slide half | Implement `config-common(notes-fn: ...)` wrapping `touying-notes` with `fill` / `header-fill` |
| `lazy-v` / `lazy-h` has no effect inside `cols` | `cols` defaults `lazy-layout: false` since `0.7.4` | Pass `lazy-layout: true` to `cols(...)` or wrap explicitly in `lazy-layout(direction: ttb/ltr, ...)` |
| `touying-reduce` / CeTZ / Fletcher fails on string-array bindings or `(uncover(..),)` | `0.8.0` requires lambda `module => ...` bindings and dropped array callback syntax | Define `touying-reducer-bindings` using `module => ...` lambdas and call `utils.methods(s)` without `(uncover(..),)` |
| Theorion theorem counter increments across `#pause` subslides | `theorem-counter` is not in `_default-frozen-states` | Add `config-common(frozen-counters: (theorem-counter,))` |
| CSL note citations (`chicago-notes`) produce double footnotes or leak before reveal | `show-bibliography-as-footnote: true` wraps citations a second time | Leave `show-bibliography-as-footnote: false` when using note-style CSL; use `config-common(footnote-style: ...)` for marker styling |

See also deeper references for [Animations & Waypoints](animations-waypoints.md), [Output Modes & Article Mode](output-modes-article.md), [Themes, Notes & Export](themes-notes-export.md), [Integrations & Ecosystem](integrations.md), and [Visual Craft & Layout Diversity](visual-craft.md).

## 2. Explicit Path Input Errors

When `$ARGUMENTS` names a target `.typ` file and validation fails, return exact diagnostics before attempting edits:
- `"Error: Provide a valid .typ file path."` — when an explicit path argument is empty or omits a file when required
- `"Error: File not found."` — when the requested `.typ` file does not exist
- `"Error: Not a .typ file."` — when the path extension is not `.typ`

## 3. Deterministic Check Script (`scripts/touying_check.py`)

Cross-platform Python 3.12+ stdlib script (`--json` supported on all subcommands):

### Subcommands
- `doctor [--typst-bin typst] [--json]`: probes `typst --version` (`>= 0.15.0`), checks the OS package cache for `@preview/touying:0.8.0`, and prints idempotent remediation commands if missing or outdated.
- `audit <paths...> [--strict-warnings] [--max-consecutive-bullets 2] [--json]`: recursively scans `.typ` files (stripping comments before matching) for deprecated/removed APIs, antipatterns, and layout monotony.
- `compile <target.typ> [--typst-bin typst] [--root DIR] [--modes presentation,handout,article] [--bundle] [--require-typst] [--json]`: compiles into a temporary directory without polluting the workspace. Uses `--warnings promote` when supported by the `typst` CLI, and promotes `warning:` stderr diagnostics directly on Typst 0.15.1 (ignoring only the built-in experimental bundle banner under `--bundle`). When Typst `>= 0.15.0` is unavailable, emits `status: "skipped"` and `missing_evidence: true` (never `"pass"`). Under `--bundle`, runs `--features bundle --format bundle` and verifies both `.pdf` and valid JSON `.pdfpc` outputs.

### Exit Codes
- `0`: check passed, or `compile` skipped due to missing Typst without `--require-typst`
- `1`: `doctor` missing/outdated Typst; `audit` blocking error, `ZERO_FILES_SCANNED`, or advisory warning under `--strict-warnings`; or `compile` failure
- `2`: invalid/missing `.typ` target path, or `compile --require-typst` when Typst `>= 0.15.0` is unavailable

### Audit Rule Codes
| Rule Code | Severity | Meaning & Fix |
| --- | --- | --- |
| `ZERO_FILES_SCANNED` | Error | No `.typ` files found in target path(s) |
| `PATH_NOT_FOUND` | Error | Provided target path does not exist |
| `OUTDATED_TOUYING_IMPORT` | Error | `@preview/touying:<0.8.0>` detected; upgrade import to `0.8.0` |
| `DEPRECATED_SEMI_TRANSPARENT_COVER` | Error | Use `utils.alpha-changing-cover` or `utils.color-changing-cover` (only `fallback-hide:` allows legacy cover) |
| `DEPRECATED_TOUYING_EQUATION` | Error | Replace with native Typst math animations (`$ frac(a #pause + b, c) $`) |
| `REMOVED_MAGIC_BIBLIOGRAPHY` | Error | Use `config-common(show-bibliography-as-footnote: true)` + `#bibliography(...)` |
| `REMOVED_UTILS_HANDOUT_ONLY` | Error | Use top-level `#handout-only[...]` |
| `REMOVED_SHOW_ONLY_NOTES_RENDERER` | Error | Replace `config-methods(show-only-notes: ...)` with `config-common(notes-fn: ...)` |
| `OLD_TOUYING_RECALL_SUBSLIDE_ARG` | Error | Rename singular `subslide:` to plural `subslides:` in `touying-recall` |
| `RAW_SET_PAGE` | Error | Replace `#set page(...)` with `config-page(...)` |
| `PAUSE_INSIDE_CONTEXT` | Error | Move `#pause` out of `context { ... }` / `context [ ... ]` into slide flow |
| `SLIDE_WRAPPED_BODY_ANTIPATTERN` | Error | Use `setting: body => ...` inside `touying-slide(...)` instead of wrapping `body` in `align`/`block`/`box` |
| `CONSECUTIVE_BULLET_SLIDES` | Advisory | Exceeds `--max-consecutive-bullets` consecutive bullet-only slides without visual/layout diversity (fails under `--strict-warnings`) |
| `MISSING_SPEAKER_NOTES` | Advisory | Presentation with `> 2` slides contains zero `#speaker-note` annotations (fails under `--strict-warnings`) |
