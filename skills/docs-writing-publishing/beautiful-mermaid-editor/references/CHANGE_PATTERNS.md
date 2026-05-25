# Beautiful Mermaid change patterns

Use these recipes only after reading the current target source. Match the repo's existing naming and helper layout instead of copying snippets blindly.

## Config options and controls

When adding a new control in the editor panel:

1. Add the UI control in the relevant `editor.ts` section.
2. Add or extend local editor state for the value.
3. Update `readConfig()` or the equivalent config collector.
4. Wire the input/change events.
5. Make sure the new value reaches either:
   - `state.config` / renderer options, or
   - a post-render SVG override path.
6. Rebuild and verify the control survives rerenders.

Use the smallest existing control pattern that already matches the new value type.

## Add a new color field

Typical steps:

1. Extend the local color state object, often something like `cfgColors`.
2. Add a matching control in the Colors section.
3. Ensure the UI refresh helper covers the new field.
4. Pass the color into `readConfig()` or theme-override plumbing.
5. Verify:
   - empty value falls back correctly
   - theme switching still works
   - export reflects the new color

If the renderer already supports the color slot, reuse it. If not, you may need renderer support or SVG post-processing.

## Add a slider / numeric control

Typical steps:

1. Add both number/range inputs if the editor already uses paired controls.
2. Create a single setter that:
   - parses and clamps the value
   - updates local state
   - syncs both inputs
   - triggers the smallest necessary visual update
3. Decide whether the control needs:
   - full rerender, or
   - immediate SVG post-processing only

Prefer one normalization helper over duplicated inline parsing in multiple listeners.

## Add or change sample presets

Typical steps:

1. Edit the editor's actual sample source, often an inline `SAMPLES` array in `editor.ts`.
2. Add or update category labels only if the editor uses category grouping.
3. Verify the sample:
   - renders successfully
   - appears in the correct category
   - keeps existing category navigation stable

Do not assume `samples-data.ts` alone drives the editor page; confirm whether it is only for showcase/demo pages.

## SVG post-processing overrides

Use this path for presentation tweaks that do not need renderer changes:

- stroke width overrides
- opacity tweaks
- selector-based SVG styling
- light DOM cleanup after render

Typical pattern:

1. Render SVG.
2. Grab the current `svgEl`.
3. Inject or refresh a `<style>` element inside the SVG.
4. Re-run the override after every rerender.
5. If the control is interactive, optionally update the existing SVG immediately without forcing a full rerender.

This path works well when CSS can override the renderer's default presentation attributes.

## Renderer support / new RenderOptions

Use this path when the new behavior cannot be expressed through current config fields or SVG post-processing.

Typical steps:

1. Add the field to `RenderOptions` in `src/types.ts`.
2. Thread the new field through the option-building path in `editor.ts`.
3. Update theme/renderer helpers such as `src/theme.ts`.
4. If needed, extend SVG opening-tag style or generated style blocks.
5. Verify old callers still work when the field is absent.

Prefer optional fields or clearly defaulted behavior over breaking required options unless the repo already expects a coordinated migration.

## Theme and dark-mode changes

When editing theme behavior:

1. Confirm how the editor distinguishes auto theme from explicit manual theme selection.
2. Preserve the existing invariant for dark/light toggles.
3. Check both UI chrome and diagram SVG output.
4. Verify that user-entered config colors still override the selected theme where intended.

Be careful not to accidentally make dark-mode toggles overwrite an explicitly chosen diagram theme.

## Zoom changes

When editing zoom:

1. Find the current `applyZoom(...)` or equivalent helper.
2. Keep zoom state separate from render state so rerenders preserve the current zoom.
3. Base size calculations on `viewBox` or the current natural SVG size.
4. Verify scroll behavior, fit behavior, and rerender persistence.

Avoid introducing CSS scale transforms as the primary zoom mechanism.

## Export / clipboard changes

When editing export flows:

1. Inspect the current SVG serialization path.
2. Inspect the PNG path separately from the SVG path.
3. Verify clipboard support and browser fallbacks.
4. Confirm the exported output includes the same theme/config/post-processing changes visible in preview.
5. Re-test with zoomed diagrams if export depends on current DOM dimensions.

If the task is only to change the preview, confirm whether export should mirror that behavior or remain normalized.
