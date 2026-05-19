# Template and Export Contract

Copy and customize the template at `assets/template.html`. Customization points:

1. Update the `<title>` and header `<h1>` text + subtitle
2. Modify SVG `viewBox` dimensions if needed (default: `1000 x 680`)
3. Add/remove/reposition component boxes using the `.c-<type>` classes
4. Draw connection arrows using `.a-<variant>` classes
5. Update the three summary cards
6. Update footer metadata

Do NOT remove the `.toolbar` element, the `<script>` blocks, or the `:root` / `[data-theme="..."]` CSS. Those are what give every generated diagram the theme toggle and export buttons.

## Output

Produce a single self-contained `.html` file with:

- Embedded CSS (no external stylesheets except Google Fonts)
- Inline SVG (no external images)
- Small amount of embedded JS (theme toggle + export) — keep as-is from template

The file should render correctly when opened directly in any modern browser. The **Export** menu should cleanly copy PNG to the clipboard, download PNG / JPEG / WebP (all at 4× source resolution, rendered natively by the browser — no bitmap upsampling), and download a **dual-theme self-contained SVG** whose colors follow the embedding host's `prefers-color-scheme` (dark by default; swaps to light under a light host; `svg[data-theme="..."]` still works as a manual override).
