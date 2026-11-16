# Prior art and evidence (2026-11-09)

## Internal prior art studied

- `theme:console`, `theme:broadside`, `theme:darkroom`, `theme:arcade` (hallmark themes in this catalog): each exposes one "colourway" dial stated in DESIGN.md (`console: graphite`), with preset colourways whose role meaning is invariant ("amber means a person, cool means an instrument").
  - Keep: named presets, role meaning fixed across colourways, the choice recorded in DESIGN.md.
  - Adapt: hallmark presets are prose only; airy-glass adds machine-readable data plus measured contrast per preset.
  - Invent: hue-based derivation for projects whose brand hue is far from every preset; selection from project signals.
- `design_catalog.py signals`: already extracts paper band, `accent_var`, `accent_hue` from CSS token blocks. Missing: accent chroma (needed to reject gray accents).
- `slop_check.mjs` gate 2a: bans purple-to-blue / purple-to-pink gradients counting only stops with OKLCH C > 0.04; waives a gradient whose stops all appear in DESIGN.md colors. Derived field stops must stay at C <= 0.03 and be written into frontmatter.

## Verified contrast method

sRGB per-channel alpha blend with 8-bit rounding (white at 0.78 over the field color), then WCAG 2.x relative luminance. Reproduces every ratio in the current airy-glass table exactly: 13.47, 13.16, 5.37, 4.79, 5.31, 5.08, 5.79, 1.11. Note: muted on white 0.78 over lavender end is 5.29 (worse than the mint end); the gate must use the worse field end.

## External prior art

Not searched. This is an entry-level change inside an existing skill, not a new skill or a substantial redesign. External catalog evidence: missing evidence.
