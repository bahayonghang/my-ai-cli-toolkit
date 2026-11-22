# Touying 0.8.0 Animations, Waypoints, `#animate`, Native Math & Covers

Verified against `@preview/touying:0.8.0` (`src/core/animation.typ`, `src/core/waypoints.typ`, `src/core/subslides.typ`, `src/core/parser.typ`, `src/core/tree.typ`, `src/core/blocks.typ`, `src/core/slides.typ`, `src/utils.typ`, `src/exports.typ`).

## 1. Sequential Flow (`#pause`, `#meanwhile`, `#jump`, `#item-by-item`)

| Primitive | Signature / Defaults | Behaviour |
| --- | --- | --- |
| `#pause` | `jump(1, relative: true)` | Reveals following content 1 subslide later. |
| `#meanwhile` | `jump(1)` (`relative: false`) | Reveals hidden content so far and resets subslide counter to `1`. |
| `#jump` | `jump(n, relative: false)` | `relative: true`: shifts counter by non-zero int `n` (`n < 0` moves backward; `0` panics). `relative: false`: flushes hidden parts and jumps to absolute `n >= 1`. |
| `#item-by-item` | `item-by-item(start: auto, cont)` | Reveals list/enum/terms items 1 per subslide (`advances-flow: true`). `start` accepts `auto`, int `>= 1`, single-number string (`"3"`), `<label>`, or single-position waypoint marker (`get-first`, `get-last`, `prev-wp`, `next-wp`; `from-wp`/`until-wp` panic). |
| `#item-by-item-fn` | `item-by-item-fn(start: auto, fn, cont)` | Calls `fn(time, item)` where `time = start + item_idx - self.subslide` (`< 0` past, `0` current, `> 0` future). Presets (`str` or `item-by-item-functions.<name>`): `"current-bold"`, `"current-highlight"`, `"past-faded"`, `"past-progressive-faded"`. |

### `0.8.0` Flow Rule: `#pause` After `#uncover` / `#only` / `#alternatives`

- **Separating reservation from flow**: `#uncover`, `#only`, `#effect`, `#alternatives`, `#animate`, and `#touying-render` leave `advances-flow: false`. They extend the slide total (`last-subslide`) for their own body without moving the pause cursor (`repetitions`).
- A `#pause` after `#uncover("2")[...]` no longer snaps past subslide `2` (unlike `0.7.0–0.7.4`); it steps `+1` from the current pause cursor. Add explicit `#pause`, `#jump`, or `#waypoint` if later content should wait.
- Only `#item-by-item` / `#item-by-item-fn` (and custom `touying-fn-wrapper(..., advances-flow: true)` components) advance the pause cursor past their final subslide:

```typst
#let reveal-steps(body) = touying-fn-wrapper(
  (self: none, body) => body,
  last-subslide: repetitions => (repetitions + 2, (:)),
  advances-flow: true,
  body,
)
```

```typst
#item-by-item-fn(
  (item-by-item-functions.past-faded).with(alpha: 30%),
)[
  - First point
  - Second point
  - Third point
]
#pause
Follows on subslide 4 because item-by-item sets advances-flow: true.
```

## 2. Visibility Wrappers & Subslide Specs

- `#uncover(visible-subslides, uncover-cont, cover-fn: auto)` — reserves layout space via the theme `cover` method (or custom `cover-fn`) when hidden.
- `#only(visible-subslides, only-cont)` — omits content completely (reserves no space) when hidden.
- `#effect(fn, visible-subslides, cont, is-method: false)` — applies `fn(cont)` when visible.
- `#alternatives(start: auto, repeat-last: true, position: bottom + left, stretch: false, at: none, ..args)` — steps through positional bodies sequentially, or maps them to waypoint ranges via `at: (<wp1>, <wp2>)`. `alternatives-match` and `alternatives-cases` accept numeric specs only (not waypoints). `alternatives-fn(start: 1, end: none, count: none, .., fn)` maps subslide integers over `range(start, end)`.

### Spec Formats & `0.8.0` Rules

- **Allowed formats**: single `int` (`3`), `array` (`(1, 2, 4)`), range `str` (`"-2, 4, 6-8, 10-"`), `auto` (resolves to current `repetitions` without advancing on `uncover`/`only`/`effect`), `<label>`, or waypoint marker.
- **Negative `int` panic vs `"-2"` open range**: Passing a bare negative integer (`#only(-1)[..]`, `#uncover((-1,))[..]`, `#animate(..., subslides: -1)`, `#item-by-item(start: -1)`) **panics at compile time** on flow-parsed animation functions because trailing `#pause` markers can still grow the total. Use `#waypoint(<end>)` + `get-last(<end>)` instead. By contrast, `"-2"` inside a string spec is an **open range** ("subslides 1 to 2"), not a negative index. (Post-parse selectors `handout-subslides`, `#touying-recall`, `#touying-render`, and `#measure` still accept negative integers.)
- **Negation `"!2-3"`**: `"!"` prefix masks out subslides (`"!2-3"` shows on every existing subslide except `2` and `3`). Negated specs cannot create new subslides.
- **Here marker `"h"`**: On `#uncover`, `#only`, `#effect`, and `#animate`, `"h"` (including `"h-"` or `"!h"`) resolves to the placement-time `repetitions` counter. Useful for single-instance elements on multi-subslide slides (e.g. `#only("h", bibliography("ref.bib"))`).

## 3. Waypoints (`#waypoint` & Range Markers)

Declare named, slide-unique subslide checkpoints without counting pauses manually (`src/core/waypoints.typ`).

- `#waypoint(lbl, advance: true, start: auto)`:
  - `advance: true` (default) inserts a `#pause`-like step before marking (`repetitions + 1`).
  - `advance: false` marks the current subslide without advancing.
  - `start: int | label | auto`: overrides the starting position (`int >= 1`, or `<other-wp>` to align with another waypoint; circular dependencies panic, negative `start` panics).
  - A waypoint spans from its declaration until the next waypoint is declared (or the slide ends).
- **Implicit waypoints**: Passing a bare `<wp>` label directly to `#uncover(<wp>)`, `#only(<wp>)`, `#effect(fn, <wp>)`, `#animate(..., subslides: <wp>)`, or `#item-by-item(start: <wp>)` registers an implicit advancing waypoint if `<wp>` is not already defined.
- **Hierarchical labels `<part:intro>`**: Separate levels with `:`. Referencing `<part>` combines all `part:*` waypoints from earliest `first` to latest `last`. `next-wp(<part>)` anchors to the last child (steps past the group); `prev-wp(<part>)` anchors to the first child (steps before the group).

| Marker | Resolves To | Creates Waypoint? | Notes |
| --- | --- | --- | --- |
| `<wp>` | Full `[first, last]` span | Implicitly if unknown | Matches `wp` and `wp:*` children |
| `get-first(<wp>)` | First subslide (`int`) | No | Safe inside `item-by-item(start: ...)` |
| `get-last(<wp>)` | Last subslide (`int`) | No | Safe replacement for `#only(-1)` |
| `from-wp(wp)` | `(beginning: first)` | No | Open-ended from `wp` to slide end |
| `until-wp(wp)` | `(until: first - 1)` | No | Exclusive before `wp` starts |
| `(from-wp(<a>), until-wp(<b>))` | Bounded `[a.first, b.first - 1]` | No | Combine range markers in an array |
| `prev-wp(wp, amount: 1)` / `next-wp(wp, amount: 1)` | Adjacent waypoint in subslide order | No | Pushes inward when wrapping `from-wp` / `until-wp` |
| `not-wp(wp)` | All existing subslides except `wp` | No | Like `"!"`, never adds subslides |

### Globally Linkable `<slide.waypoint>` Anchors

When a slide carries a label `<intro>` (on its heading or `#slide[...]<intro>`) and defines `#waypoint(<part:intro>)`, Touying emits an anchor `<intro.part:intro>` at the end of that waypoint's content run (on `range.last` in presentation mode, or the best-matched rendered page in handout/article mode), allowing `#link(<intro.part:intro>)[jump]` across slides.

```typst
== Derivation <deriv>

Setup #waypoint(<part:intro>)
#uncover(<part:intro>)[Step 1] #pause
Step 2
#waypoint(<part:end>)
#only(get-last(<part:end>))[Final note]
#only((from-wp(<part:intro>), until-wp(<part:end>)))[During intro only]
#only(not-wp(<part:intro>))[Outside intro]
```

## 4. Layered Effects with `#animate`

Combine placements and composable styling functions on one target (`src/core/animation.typ`, `src/utils.typ`):

- `#animate(body, effects: (), alignment: top + left)`
- `#animate-hidden(body, effects: (), ..args)` — prepends `(effect: "cover", subslides: "1-", priority: 0)` so effects declare when `body` *appears*.
- `#animate-removed(body, effects: (), ..args)` — prepends `(effect: "remove", subslides: "1-", priority: 0)` (reserves no space while absent).
- Each entry in `effects` (single dictionary or array of dictionaries) accepts:
  - `effect`: placement (`"show"`, `"cover"`, `"remove"`, or `swap(swap-body, alignment: top + left, stretch: false)`) OR styling function `(body, self: none) -> content` (also accepts `utils.alpha-changing-cover` / `utils.color-changing-cover`).
  - `subslides`: defaults to `"1-"`; supports `int`, range `str` (including `"h"`, `"!2-3"`), `<label>`, or waypoint marker (does **not** accept `auto` — use `"h"`).
  - `priority`: `int`, defaults to `1` (implicit base `"show"` is `0`).
- **Resolution rules**:
  - *Placements* pick one winner per subslide: highest `priority` wins; ties pick the **last** effect written.
  - *Styles* nest around the winning placement: lowest `priority` is innermost; within equal priority, the **last** written style is innermost (so last written wins conflicting properties).
- **Layout & `stretch`**: `"cover"` preserves `body`'s space, `"remove"` reserves none, and `swap(..., stretch: false)` reflows. Setting `stretch: true` on any `swap` measures every distinct active `(placement, styles)` combination inside a `context` block and wraps the block in max `width`/`height` (do not use `stretch: true` on bare `context` content without a fixed-size `box`).

```typst
#animate(
  [Base formula],
  effects: (
    (effect: "cover", subslides: "-2"),
    (effect: swap([Substituted form], stretch: true), subslides: 3),
    (effect: (body, ..) => text(fill: red, body), subslides: "4-", priority: 2),
  ),
)
```

## 5. `#touying-render`, `#touying-recall`, and `#measure`

| API | Primary Use & Parameters | Key `0.8.0` Rules |
| --- | --- | --- |
| `#touying-render` | `(body, subslides: auto, base: auto, start: auto, repeat-last: true, use-outer-waypoints: false)` | Renders a content variable directly at chosen stage(s). `subslides:` takes `auto`, `int` (negatives allowed), `str` (`"2-4"`, `"!2-3"`, `"h"`, `"!h"`), `<wp>`, or marker. With `start:` (`int`/`<wp>`), stays absent until outer `start` then steps 1 stage/subslide and holds (`repeat-last: true`) or disappears (`false`). `use-outer-waypoints: true` (with `base: auto`) aims `subslides` at the enclosing slide's waypoints. |
| `#touying-recall` | `(lbl, subslides: auto, base: auto)` | Whole-slide (`= Heading <lbl>` / `#slide[..]<lbl>`) OR any labelled element (`figure`, `table`, `touying-reducer`). Plural `subslides:` defaults to `auto` (all subslides of whole slide; final state of labelled element); `none` recalls last subslide only. Whole-slide also accepts `"waypoints"` (last subslide per waypoint). Fallback recalls work inside `#uncover`/`#only`/`#alternatives`/`#alert`. |
| `#measure` | `(body, subslide: auto, base: auto, ..args)` | Shadows `std.measure` inside `context` for animated content (avoids `0pt` metadata). `subslide: auto` measures final stage; `none` maximizes `width` and `height` independently across all subslides; also accepts `int` (negatives ok) or `<wp>`/marker. |

## 6. Native Math, `#touying-raw`, and Cover Engines

### Native Math Animations (`0.8.0`)

Write `#pause`, `#uncover`, `#only`, and `#alternatives` directly inside standard Typst math (`$ ... $`). `core/tree.typ` and `core/parser.typ` traverse named fields on math elements including `frac`, `mat`, `vec`, `cases`, `binom`, `root`, `attach`, `accent`, `cancel`, `lr`, and brace annotations (`underbrace`, `overbrace`, etc.):

```typst
$ frac(a #pause + b, #uncover("3-")[c]) $
$ mat(a, #pause b; c, d) + vec(x, #pause y) $
$ cases(x & "if" x > 0, #pause -x & "otherwise") $
$ attach(x, b: i, t: #pause k) + accent(a #pause, hat) $
```

*(Limitation: for `accent`, only `base` is traversable content; `accent` itself is a single codepoint symbol, so wrap the whole accented expression in `#alternatives` if you need the accent symbol to change.)*

### Animated Code Blocks (`#touying-raw`)

`#touying-raw(block: true, lang: none, fill-empty-lines: true, simple: false, body)`:
- **Line mode (`simple: false`, default)**: a line is a marker when its only meaningful characters (`[a-zA-Z0-9\u{4E00}-\u{9FFF}]`) spell `"pause"` or `"meanwhile"` (e.g. `// pause`, `# pause`, `#pause`; `pause = 1` is preserved as code).
- **Simple mode (`simple: true`)**: splits directly on inline `#pause;` and `#meanwhile;`.
- `fill-empty-lines: true` (default) replaces hidden lines with blank lines to keep code block height stable.

### Cover Methods (`src/utils.typ`)

- `utils.alpha-changing-cover.with(alpha: 25%, fallback-hide: auto, fallback-hide-args: (:))`: lowers color/gradient alpha while keeping original hues (uses `context`; delegates images/tilings to `fallback-hide`).
- `utils.color-changing-cover.with(color: gray, fallback-for-filled: true, fallback-hide: auto, fallback-hide-args: (:))`: forces a flat color with no `context` calls on text/strokes (faster compile; `fallback-for-filled: true` keeps filled boxes/rects readable via `fallback-hide`).
- `utils.cover-kind-query`: custom cover functions `(self: none, it) => ...` should return `"hide"`, `"recolour"`, or `"paint"` when `self == utils.cover-kind-query` so footnotes and figure captions behave accurately.

## 7. Removed / Deprecated -> Use Instead

| Legacy / Deprecated API | Status in `0.8.0` | Use Instead |
| --- | --- | --- |
| `touying-equation(...)` | Deprecated (removed in `0.9.0`) | Native Typst math (`$ frac(a #pause + b, c) $`) directly. |
| `utils.semi-transparent-cover` | Deprecated (removed in `0.9.0`) | `utils.alpha-changing-cover` or `utils.color-changing-cover`. |
| `utils.handout-only[..]` | Removed | Top-level `#handout-only[..]` marker. |
| `touying-recall(<lbl>, subslide: ...)` | Removed singular key (`auto`/`none` swapped) | Plural `touying-recall(<lbl>, subslides: ...)` (`auto` = all/final, `none` = last). |
