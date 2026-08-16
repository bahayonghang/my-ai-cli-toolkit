# pubfig Integration

**pubfig** is an optional matplotlib-native plotting library on PyPI. It supplies
41 plot kinds behind one API, journal-aware export, and an agent-first JSON CLI.
When a project already uses pubfig, call the library. **Call it, never vendor it.**

Every name below is transcribed from a local clone of `Galaxy-Dawn/pubfig`
(MIT) at version **0.3.0** (`src/pubfig/_version.py`). The kind list is the
literal content of `PLOT_REGISTRY` in `src/pubfig/plot_registry.py`. Do not
invent a kind name. If a request has no kind, use path (B) below.

## Detection

Take the integration path when **either** holds:

1. The user names pubfig, or asks for `pf.<kind>` / `pubfig render`.
2. The project dependency list or the source imports include `pubfig`
   (grep for `import pubfig` or `from pubfig`).

Otherwise take the standalone path (`journal-specs.md` plus a library recipe).
pubfig is not a prerequisite of this skill.

## Two paths

**(A) Kind hit → call pubfig.** Each plot function returns a standard matplotlib
`Figure`. Export it with `save_figure`.

```python
import pubfig as pf

fig = pf.bar_scatter(data)                       # a kind from the table below
pf.save_figure(fig, "figure1.pdf", spec="nature", width="single")
```

Optional global theme switch: `pf.set_default_theme("science")`. The theme
registry holds `default`, `nature`, `science`, and `cell`
(`src/pubfig/themes/__init__.py:17-22`).

**(B) Kind miss → native matplotlib.** pubfig has no generic escape hatch beyond
the 41 kinds. Draw with native matplotlib per `chart-recipes.md`, and keep the
sizes from `journal-specs.md`.

## Plot kinds (41 total, verbatim)

| Family                 | Kinds                                                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Categorical            | `bar`, `bar_scatter`, `stacked_bar`, `paired`, `dumbbell`, `forest_plot`                                             |
| Composition and polar  | `grouped_scatter`, `donut`, `stacked_ratio_barh`, `radial_hierarchy`, `circular_stacked_bar`, `circular_grouped_bar` |
| Distribution           | `box`, `violin`, `strip`, `raincloud`, `density`, `histogram`, `ridgeline`                                           |
| Trend and relationship | `line`, `area`, `scatter`, `bubble`, `contour2d`, `hexbin`, `radar`                                                  |
| Matrix and embedding   | `heatmap`, `corr_matrix`, `clustermap`, `dimreduce`, `pca_biplot`, `parallel_coordinates`                            |
| Evaluation and flow    | `roc`, `pr_curve`, `volcano`, `sankey`                                                                               |
| Diagnostics            | `ecdf`, `qq`, `bland_altman`, `calibration`, `upset`                                                                 |

Run `pubfig list-kinds` to confirm the list against the installed version.
For the parameters of one function, call `help(pf.bar_scatter)`. Do not copy a
signature from memory.

## JSON spec contract

The CLI reads one JSON file. Keys are closed sets; an unknown key is an error
(`src/pubfig/render_spec.py:24-63`).

- `schema_version` must be `1`.
- Top-level keys: `schema_version`, `plot`, `panels`, `export`.
- `plot` keys: `kind`, `kwargs`. A `panels` element has `panel_id`, `kind`, `kwargs`.
- Data can be inline, or loaded from a file with `{"$load": "data/a.npy"}`.
  A CSV load also accepts `delimiter` and `skip_header`. An NPZ load accepts `key`.
- `export.mode` is one of `save_figure`, `batch_export`, or `export_panels`.

```json
{
  "schema_version": 1,
  "plot": {
    "kind": "line",
    "kwargs": {
      "data": [
        [0.78, 1.03],
        [0.87, 1.01]
      ],
      "x": [0.0, 0.8]
    }
  },
  "export": {
    "mode": "save_figure",
    "path": "outputs/line.pdf",
    "spec": "nature",
    "width": "single"
  }
}
```

**Validate the spec before you render it.** `validate-spec` builds the figure and
checks every key, but writes no file:

```bash
pubfig validate-spec figure.spec.json
pubfig render figure.spec.json
```

## save_figure behavior

Signature at `src/pubfig/export/io.py:380`.

| Rule                     | Detail                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| Explicit suffix required | Pass `.pdf`, `.svg`, `.png`, or `.jpg` in the path. The suffix picks the format.                |
| One call, one format     | `save_figure` writes a single file and returns a one-item list of `Path`.                       |
| Legacy format arguments  | A non-default `vector_formats` or `raster_formats` raises `ValueError`.                         |
| Multi-format export      | Use `batch_export(fig, "figure1", formats=("pdf", "svg", "png"))`.                              |
| Width                    | `"single"` (89 mm), `"double"` / `"full"` (183 mm), a number in mm, or a string like `"120mm"`. |
| Raster DPI               | Defaults to `FigureSpec.default_raster_dpi`, which is 600.                                      |
| SVG text                 | `svg_fonttype` defaults to `"none"`, so SVG text stays editable.                                |

## Journal coverage: fall back to this skill

pubfig ships three figure specs only — `nature`, `science`, and `cell`
(`src/pubfig/specs.py:85-94`). All three use the same 89 mm / 183 mm column
widths and 600 DPI default; only `font_family` differs (Arial, Helvetica, Arial).
The `cell` spec comment states that Cell Press templates vary, and that it
defaults to Nature-like sizing.

**Do not present a pubfig default as an IEEE, Elsevier, or Chinese thesis
requirement.** For those targets, read the size, font, and format values from
`journal-specs.md`, then pass them to `save_figure` as an explicit numeric
`width` and `raster_dpi`.

## Palette provenance

pubfig names four palettes `NATURE`, `SCIENCE`, `LANCET`, and `JAMA`. The README
(line 518) states that these are ggsci-derived community palettes, not
publisher-mandated color specifications. Repeat that qualifier whenever you name
one of them in a manuscript or a caption. Check the palette against the
colorblind-safe rules in `journal-specs.md` before you submit.

---

Source: `Galaxy-Dawn/pubfig` (https://github.com/Galaxy-Dawn/pubfig), MIT
License, version 0.3.0, commit `4eec116`. Reviewed 2026-08-16. This file
describes the public API; it copies no source code. See `attribution.md`.
