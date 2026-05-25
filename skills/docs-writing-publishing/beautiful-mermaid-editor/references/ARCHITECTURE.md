# Beautiful Mermaid editor architecture

Use this reference after you have located the current repo and confirmed the classic Beautiful Mermaid editor layout still exists.

## Key files

| File | Role |
| --- | --- |
| `editor.ts` | Source of truth. Builds the inline browser bundle and writes `editor.html`. |
| `editor.html` | Generated artifact. Usually rebuilt from `editor.ts`; do not hand-edit unless the repo explicitly expects generated output in git. |
| `dev.ts` | Dev server / rebuild loop in the classic repo layout. |
| `src/browser.ts` | Browser-side Mermaid renderer bundle exposed to the generated page. |
| `src/types.ts` | `RenderOptions` and related renderer-facing types. |
| `src/theme.ts` | Theme registry, CSS variable derivation, and SVG style helpers. |
| `src/styles.ts` | Shared size/stroke constants in the classic layout. |
| `samples-data.ts` | Showcase sample data; the editor may also keep its own inline sample list. |

## Build cycle

Classic layout:

```text
editor.ts
  -> Bun.build() bundles src/browser.ts
  -> editor.ts injects HTML/CSS/JS template
  -> writes editor.html
```

Common commands in the classic repo:

```bash
bun run editor
bun run dev
```

Always re-check the current repo scripts before assuming these exact command names.

## State model

Typical browser-side state:

```js
state = {
  theme: '',
  zoom: 1,
  config: {},
}
```

Common adjacent editor variables:

```js
cfgColors = { bg, fg, accent, line, muted, surface }
cfgFont = ''
cfgPadding = 24
cfgEdgeStroke = 1
cfgNodeStroke = 1
```

The important invariant is not the exact variable names; it is that UI controls feed local editor state, local state feeds `buildOptions()`, and render-time overrides happen after SVG insertion.

## Render pipeline

Typical flow:

```text
editor input
  -> scheduleRender(...)
  -> doRender()
  -> buildOptions()
  -> renderMermaid(..., opts)
  -> previewInner.innerHTML = svg
  -> post-process SVG
  -> applyZoom(state.zoom)
```

Important behaviors:

- `buildOptions()` usually layers theme defaults first and user config overrides last.
- Post-render SVG overrides must rerun after every render because the SVG node gets replaced.
- Zoom should be reapplied after each render.

## Theme and dark-mode behavior

Typical pattern:

```text
applyColorMode(dark)
  -> toggle UI mode classes
  -> if diagram theme is auto, adjust the diagram theme
  -> refresh color controls
  -> re-render
```

Preserve the distinction between:

- **auto theme**: follows light/dark mode
- **manual theme**: stops auto-switching once the user explicitly picks a theme

## CSS-variable system

In the classic repo, the renderer injects a `<style>` block per SVG and uses CSS variables such as:

```text
--bg, --fg, --line, --accent, --muted, --surface
```

Common layering rule:

- theme values provide the base
- config overrides replace only the fields the user set
- derived internal variables are computed from those base values

If a new option cannot be expressed by existing CSS variables or SVG post-processing, it may need renderer support.

## URL sharing

Typical hash-sharing behavior stores at least source and theme in the URL. If you change sharing behavior:

- keep backward compatibility in mind
- verify encode/decode still handles Unicode safely
- check whether new config fields should or should not enter the share payload

## Export and clipboard paths

Common actions:

| Action | Typical implementation |
| --- | --- |
| Save PNG | SVG -> image -> canvas -> blob/download |
| Save SVG | serialize current SVG -> blob/download |
| Copy image | PNG pipeline -> clipboard item |
| Copy URL | update hash -> copy `location.href` |

When editing export or clipboard behavior, inspect:

- scale handling
- background fill behavior
- async clipboard permissions/fallbacks
- whether SVG post-processing is reflected in exports

## Zoom behavior

Preferred approach:

- read the SVG's natural size from `viewBox`
- set explicit `width` / `height` based on zoom
- let the scroll container grow naturally

Avoid CSS `transform: scale(...)` for the main zoom path because it usually breaks scrolling and hit-testing expectations.
