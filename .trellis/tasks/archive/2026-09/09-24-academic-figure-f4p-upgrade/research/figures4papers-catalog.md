# Research: figures4papers technique catalog and academic-figure gap analysis

- **Query**: Build an evidence-backed technique catalog of `ref/repo/figures4papers` (HEAD `3c181f8`, 2026-09-06). Verify the claims in its `design-theory.md` and `api.md`. Compare it with `skills/academic-research-tools/academic-figure`. Record the license constraint.
- **Scope**: internal (static reading of local clones; no script was run)
- **Date**: 2026-09-24
- **Clone**: `ref/repo/figures4papers/`, remote `https://github.com/ChenLiu-1996/figures4papers.git`, not shallow.

## Snapshot facts

- `git diff --stat 6790a93 3c181f8` shows two changed files only: `LICENSE` (+407 lines, new) and `README.md` (+1 −2: a badge removed, a Chinese name added). All 25 `figure_*/*.py` scripts are byte-identical to the `6790a93` snapshot that the skill cites in `references/design-theory.md:3`.
- 8 project folders, 25 `.py` files, 3404 lines. One file (`figure_ImmunoStruct/raw_data.py`) holds data only, so 24 files draw figures.
- 32 `savefig` calls produce 32 files. Every expected file exists under the `figures/` folders (list in "Output inventory").
- `assets/` holds 10 PNG files. No script writes to `assets/`. `README.md:50-51` states these figures were "made partially in Python".
- The `scientific-figure-making/` skill folder has `SKILL.md` and 5 references (`api.md`, `common-patterns.md`, `demos.md`, `design-theory.md`, `tutorials.md`). It ships no Python module.

---

## 1. Catalog

### 1.1 Shared style block

Most scripts open `__main__` with the same five rcParams lines, for example `figure_Brainteaser/plot_brute_force.py:107-111`:

```python
plt.rcParams['font.family'] = 'helvetica'
plt.rcParams['font.size'] = 24
plt.rcParams['axes.spines.right'] = False
plt.rcParams['axes.spines.top'] = False
plt.rcParams['axes.linewidth'] = 3
```

Counts over the 25 files:

| rcParam | Value | Files |
|---|---|---|
| `font.family` | `'helvetica'` | 19 |
| `font.family` | `'sans-serif'` | 2 (`figure_Dispersion/*`) |
| `font.family` | not set | 4 (`diffusion_swiss_roll.py`, `plot_hole_manifold.py`, `plot_manifold.py`, `raw_data.py`) |
| `font.size` | 24 | 14 |
| `font.size` | 15 or 16 | 4 (`RNAGenScape/plot_comparison.py:55`, `plot_sweep.py:30`, `ophthal_review/plot_composition.py:36`, `plot_trend.py:77`) |
| `font.size` | 18 | 1 (`VIGIL/plot_concept.py:231`) |
| `axes.linewidth` | 3 / 2 / 1.5 | 14 / 4 / 1 |
| `text.usetex` | `True` | 6 (`Dispersion/plot_idea.py:58`, `plot_illustration.py:386`, `RNAGenScape/plot_comparison.py:53`, `plot_sweep.py:28`, `ophthal_review/plot_composition.py:34`, `plot_trend.py:75`) |
| `svg.fonttype` | `'none'` | 1 (`ImmunoStruct/plot_bars.py:27`) |
| `pdf.fonttype`, `matplotlib.use`, `transparent=` | — | 0 |

No script sets a font fallback list. No script defines a shared style function.

### 1.2 Per-script catalog

Column key: **Fig** = figsize in inches. **Save** = format, dpi, other savefig arguments. All save paths are relative (`./figures/<name>`), so each script must run from its own folder.

#### figure_Brainteaser (5 scripts, data inline as dicts)

| Script | Chart and purpose | Fig | Layout | Save |
|---|---|---|---|---|
| `plot_brute_force.py` | 100% stacked composition bars, 4 subtypes per model, 4 prompts × 2 domains | (52, 12) :113 | `GridSpec(2, 5)` :115; legend-only cells `gs[4]` :164-178 and `gs[9]` :227-242 | png, dpi 300 :247 |
| `plot_correctness_by_category.py` | Plain bars, one panel per category, 7 models | (36, 12) :79 | `GridSpec(2, 4)` :81; legend-only `gs[3]` :98-110 | png, 300 :131 |
| `plot_correctness_by_subcategory.py` | Same as above, 8 + 13 subcategories | (96, 12) :78 | `GridSpec(2, 13)` :80; legend-only `gs[11:12]` :97-109 | png, 300 :130 |
| `plot_rewriting.py` | Side-by-side bars with hatch = condition | (24, 12) :31 | `GridSpec(2, 2)`; two legend-only cells (color = model, hatch = condition) :68-99 | png, 300 :104 |
| `plot_selfcorrection_math.py` | Plain bars per error type, ↓/↑ in titles | (36, 12) :55 | `GridSpec(2, 5)`; legend spans `gs[8:]` :91-93 | png, 300 :98 |

Palette: `['#DDF3DE', '#AADCA9', '#8BCF8B', '#F6CFCB', '#E9A6A1', '#FFF6CC', '#3775BA']` (`plot_brute_force.py:18`, repeated in the other files); `plot_rewriting.py:11` uses the subset `#8BCF8B #E9A6A1 #3775BA`; `plot_selfcorrection_math.py:14` drops `#FFF6CC`.

Techniques:

- Stacked bars through `bottom=np.cumsum(result, axis=1)[:, subtype_idx - 1]` — `plot_brute_force.py:147-157`.
- Hatch encodes the subtype: `'hatch_styles': ['/', '\\', '', 'x']` — `:24`, applied at `:125`, `:152`; upper layers use `alpha=0.8` — `:156`.
- Black bar edges, `edgecolor='black', linewidth=2` (legend proxies `linewidth=3`) — `:126-127`, `:171-172`.
- Value text with a stroke outline: gold `#FFD700`, `path_effects.Stroke(linewidth=4, foreground='black')` — `:132-143`.
- Mathtext bold in labels: `r'$\bf{Only}$ $\bf{Model}$ brute force'` — `:20-23`.
- Legend-only axis built from dummy bars: draw bars, read handles, call `b.remove()`, draw the legend, `ax.set_axis_off()` — `:165-178`. A second proxy set uses white bars with a list of hatches to make a hatch-only legend — `:229-242`, same trick in `plot_rewriting.py:84-99`.
- Offset side-by-side bars `np.arange(n) + width * idx * 1.1` — `plot_rewriting.py:39`, `:55`.
- Metric direction arrows in titles `$\downarrow$` / `$\uparrow$` — `plot_selfcorrection_math.py:15-19`.
- Hidden x ticks `ax.set_xticks([])`; fixed `ylim [0, 1]` or `[0, 1.01]` — for example `plot_brute_force.py:161-162`.

#### figure_CellSpliceNet (2 scripts, data inline)

| Script | Chart and purpose | Fig | Layout | Save |
|---|---|---|---|---|
| `plot_ablation.py` | Single-panel ablation bars with drop arrows | (13, 13) :36 | `add_subplot(1,1,1)`; legend above plot `bbox_to_anchor=(0.50, 1.08)` :80 | png, 300 :85 |
| `plot_comparison.py` | Mean ± std bars over 3 runs, 3 metrics, 2 species | (45, 12) :103, :144 | `GridSpec(1, 3)` :105; legend per panel `ncols=2, columnspacing=0.6` :135 | png, 300 :140, :181 |

Palette: ablation `['#0F4D92', '#B4E6B4', '#AFE6E6', '#FFE080', '#D3D3D3']` (`plot_ablation.py:15`); comparison `#0F4D92` plus a red ramp `#D4685F #DA7B73 #DF8E87 #E5A19B #EBB4AF #F1C7C3 #F6DAD8 #FCEEED` (`plot_comparison.py:18`; 9 colors for 8 methods).

Techniques:

- Luminance test `is_dark()` with `0.299*r + 0.587*g + 0.114*b < 128` picks white or black in-bar text — `plot_ablation.py:19-26`, `:48-50`. `plot_comparison.py:86-93` defines the same function but does not call it.
- Dashed baseline at the full-model value `ax.axhline(... linestyle='--', linewidth=4, alpha=0.7)` — `plot_ablation.py:54`.
- Red drop arrows from baseline to each ablated bar, plus `−0.xx` text — `:57-71`.
- Headroom for the legend: `ax.set_ylim([0.0, ymax + 0.5])` — `plot_ablation.py:75`, `plot_comparison.py:130`; negative floor `[-0.08, ymax + 0.5]` for negative R² — `:171`.
- Explicit y ticks `[0.0, 0.25, 0.50, 0.75, 1.0]`, `tick_params(labelsize=36, length=10, width=2)` — `plot_ablation.py:76-77`.
- Error bars from `std(axis=1)` with `error_kw={'elinewidth': 2, 'capthick': 2, 'capsize': 15}` — `plot_comparison.py:114-119`; value text above the error bar at `height + std + 0.02` — `:124-126`.
- Unused import `gridspec` in `plot_ablation.py:4`.

#### figure_Cflows (4 scripts, data inline)

| Script | Chart and purpose | Fig | Layout | Save |
|---|---|---|---|---|
| `diffusion_swiss_roll.py` | Diffusion (transition) matrix heatmap + swiss-roll point cloud with probability-weighted edges | (16, 8) :50 | `plt.subplots(1, 2)`; `subplots_adjust(left=0, right=1, top=1, bottom=0, wspace=0.02)` :94 | png, 300, `bbox_inches='tight'`, `facecolor='white'`, `pad_inches=1` :96-97 |
| `plot_comparison_Ablation.py` | Mean ± std bars, 4 metrics | (35, 7) :32 | `add_subplot(1, 5, k)`; legend-only `(1, 5, 5)` :55-57 | png + pdf, 300 :62-63 |
| `plot_comparison_GeneRegulatory.py` | Mean ± std bars, 3 graph sizes | (36, 6) :41 | `(1, 4, k)`; legend-only `(1, 4, 4)`, `ncols=2` :65-67 | png + pdf, 300 :72-73 |
| `plot_comparison_Trajectory.py` | Grouped bars: methods inside datasets | (36, 6) :38 | `(1, 4, k)`; legend-only `(1, 4, 4)` :65-67 | png + pdf, 300 :72-73 |

Palette: Ablation `#AADCA9 #8BCF8B #E9A6A1 #B8C9E5 #7097CA #3775BA` (`:8`); GeneRegulatory `#D0A3A3 #EFE7B1 #F4C2C2 #D7C4E2 #E5C09F #A8C6C2 #B7D3B0 #F5B5A0 #3775BA` (`:8`); Trajectory `#DDF3DE #AADCA9 #8BCF8B #3775BA` (`:8`); swiss roll uses `cmap='Reds'` (`:59`) and `cmap='viridis'` (`:84`).

Techniques:

- Gaussian-kernel transition matrix, sparsified at 0.01, row-normalized — `diffusion_swiss_roll.py:18-46`; displayed with `imshow(P, cmap='Reds')` and `axis('off')` — `:59-60`.
- Graph edges drawn only above a threshold, with `alpha=prob*2` — `:68-81`; nodes colored by the manifold parameter with white edges, `zorder=2` — `:84-85`.
- No random seed (`np.random.rand` at `:7`, `:12-13`) and no `os.makedirs`; the script uses `plt.savefig`, not `fig.savefig` — `:96`.
- Scientific tick notation `ax.ticklabel_format(axis='y', style='sci', scilimits=(0, 0))` — `plot_comparison_Ablation.py:53`, `GeneRegulatory.py:63`, `Trajectory.py:63`.
- Error bars `capsize=8, error_kw={'capthick': 2}` — `plot_comparison_Ablation.py:41-43`.
- Math dataset labels `r'($|\mathcal{V}|$, $|\mathcal{E}|$) = (100, 137)'` as x labels — `GeneRegulatory.py:11-13`, `:62`.
- Nested grouping with a one-bar gap `np.arange(num_methods) + dataset_idx * (num_methods + 1)`; ticks at group centers — `Trajectory.py:47-60`.
- Values stored pre-scaled (`* 1e-3`, `* 1e-2`) — `Trajectory.py:13-25`.

#### figure_Dispersion (2 scripts, synthetic geometry)

| Script | Chart and purpose | Fig | Layout | Save |
|---|---|---|---|---|
| `plot_idea.py` | Three shaded spheres with points and radial lines (concept) | (18, 6) :60 | `add_subplot(1, 3, k)` | png, 300 :76 |
| `plot_illustration.py` | Four concept panels: angular spread, decorrelation, 3D ℓ2 repel, orthogonalization | (24, 8) :388 | `add_subplot(1, 4, k)`, panel 3 `projection="3d"` :396 | png, 300 :404 |

Palette: `#cde5f8 #6a98cb` (`plot_idea.py:64`, `:68`); `#0c2458` (points), `#b64342` (dispersion arrows), `#42949e` (obtuse case), `#9a4d8e` (norm arrows) (`plot_illustration.py:188-193`, `:242`, `:304`); `cmap='gray'` and a copied `cm.Blues` with `set_bad("white")` (`:164-168`).

Techniques:

- Sphere shading by hand (Lambertian model, no `LightSource`): height `z = sqrt(1 - r²)` on a 512² grid, unit normals, `light_dir = [-0.5, 0.5, 0.8]`, `intensity = max(0, n·l)`, then `imshow(..., cmap='gray', alpha=0.3)` — `plot_idea.py:15-39`. Variants use `ambient = 0.3` and `0.3 + 0.9*I` with `alpha=0.5` — `plot_illustration.py:219-229`, `:343-353`.
- Shaded rotated ellipsoid over a sphere, `NaN` outside the mask shown as white — `plot_illustration.py:138-168`.
- Great-circle arcs through SLERP — `:50-63`; arcs shortened and capped with two `FancyArrowPatch` heads — `:65-97`.
- `Arrow3D(FancyArrowPatch)` with `do_3d_projection` for arrows in a 3D axes — `:99-108`, used at `:293-305`.
- 3D axes cleanup: `quiver` axis arrows, hidden panes, transparent axis lines, no ticks — `:21-40`; `view_init(elev=30, azim=-60)` — `:286`.
- Proxy legend entries with a mathtext marker, `Line2D([], [], marker=r'$\rightarrow$', linestyle="None")` — `:199-201`, `:254-256`, `:311-316`.
- Inline text labels on white rounded boxes `bbox=dict(facecolor="white", edgecolor="none", boxstyle="round,pad=0.2")` — `:247-252`.
- `np.random.seed(1)` — `plot_idea.py:57`.

#### figure_ImmunoStruct (2 files, data in `raw_data.py`)

| Script | Chart and purpose | Fig | Layout | Save |
|---|---|---|---|---|
| `plot_bars.py` | 4 figures: comparison bars (IEDB, Cancer) and ablation bars (horizontal for IEDB, vertical for Cancer) | (28, 6) :29, :128, :172; (24, 8) :74 | `add_subplot(1, 4, k)` with legend-only `(1, 4, 4)` :63-65; `(1, 3, k)` for barh | png, dpi **600** :70, :124, :169, :215 |
| `raw_data.py` | Data module: 4 dicts with `methods`, `colors`, `metrics`, `mean`, `std` arrays | — | — | — |

Palette: IEDB `#CFCECE #F4EEAC #FBDFE2 #D9B9D4 #DAA87C #DDF3DE #AADCA9 #8BCF8B #3775BA` (`raw_data.py:7`); Cancer adds `#92E3F9` (`:73`). Ablation uses the RGB tuple `(0.215686, 0.458824, 0.729412)`, which equals `#3775BA` (`plot_bars.py:80`).

Techniques:

- Data module separated from the plot script: `from raw_data import ...` — `plot_bars.py:4`.
- Alpha ramp for ordered ablation: `[(0.215686, 0.458824, 0.729412, alpha) for alpha in np.linspace(0.2, 1.0, 12)]` — `plot_bars.py:80`, `:96`, `:111`; a 3-level variant `[1.0, 0.7, 0.4]` — `:181`.
- Horizontal ablation bars with `xerr`, black error bars `ecolor='k'` — `:77-83`.
- Binary-code ablation labels: `'11001'` maps to `'Structure + Sequence + Transfer Learning'` — `decode_ablation()` `plot_bars.py:7-18`, codes at `raw_data.py:34-36`.
- Tight, per-panel fixed y limits, for example `ax.set_ylim([0.5, 0.9])` — `plot_bars.py:40`, `:50`, `:60`, `:139`, `:149`, `:159`, `:186`, `:196`, `:206`.
- Standard error stored as `std / np.sqrt(5)` for the third metric — `raw_data.py:21-29`.
- Legend panel uses the default framed legend (no `frameon=False`) — `plot_bars.py:64`, `:163`, `:210`.
- `svg.fonttype = 'none'` is set (`:27`), but the script writes PNG only.

#### figure_RNAGenScape (4 scripts)

| Script | Chart and purpose | Fig | Layout | Save |
|---|---|---|---|---|
| `plot_comparison.py` | (a) inference-throughput bars on a log axis; (b) two column-normalized annotated heatmaps with a summary row | (9, 5) :60; (20, 9) :115 | `add_subplot(1, 2, k)`; `tight_layout(pad=1)` :109 then `pad=2` :225 | png, 300 :111, :227 |
| `plot_hole_manifold.py` | Two 3D surfaces: smooth manifold, and the same with gray "hole" patches | (14, 6) :61 | `add_subplot(1, 2, i, projection="3d")` :64 | png, 300 :82 |
| `plot_manifold.py` | One 3D energy-landscape surface | (10, 7) :27 | `projection='3d'` :28 | png, **no dpi** (default 100) :61 |
| `plot_sweep.py` | Two line panels over optimization steps | (9, 4) :39 | `add_subplot(1, 2, k)` | png, 300 :77 |

Palette: `#cdcdcd #767676 #4d4d4d #272727 #c4ece7 #ecc4c4 #ecc4e7 #ea84dd #d5e29b #bdd35c #9fbc1d #8ead03 #0f4d92` (`plot_comparison.py:16-19`); sweep `#ea84dd` and `#0f4d92` (`plot_sweep.py:58`, `:65`); custom map "softgreen" `#e9f5ec #d9f0e1 #c9e5d3 #a9cbb8 #7f9e8a #4f5c4f` (`plot_hole_manifold.py:52-54`); `cmap='coolwarm'` (`plot_manifold.py:33`).

Techniques:

- Feature flag `PLOT_DE_NOVO_SPEED = False` selects one of two bar variants — `plot_comparison.py:51`, `:63-107`.
- Group brackets under bars with LaTeX `\underbrace{\rule{5cm}{0pt}}_{...}` — `:79-84` (inside the disabled branch); bottom spine moved to data 0 — `:85-88`.
- Log y axis, headroom `ax.set_ylim(ymin, ymax * 20)`, value text at `val * 1.1` — `:101-107`.
- Column-wise heatmap: one `imshow` per column, each with its own `Normalize` and colormap (Reds for "+" columns, `Blues_r` for "−" columns) — `:133-140`, `:186-192`.
- Summary row "improvement over best baseline" appended as NaN in the image, shown white through `set_bad`, labeled `+x.x \%` in forestgreen or darkred — `:120-130`, `:141-145`.
- Cell text color from the cell luminance `0.299*r + 0.587*g + 0.114*b < 0.5` — `:149-151`, `:200-202`.
- Larger y-tick font for the proposed method — `:165-167`; `set_frame_on(False)`, `invert_yaxis()` — `:168-169`; `\texttt{}` tick labels — `:158-161`.
- `plot_surface(facecolors=...)` with a custom `LinearSegmentedColormap` and a gray RGBA mask `[0.7, 0.7, 0.7, 0.5]` — `plot_hole_manifold.py:52-71`.
- Rejection sampling of non-overlapping patch centers with `np.random.default_rng(42)` — `:25-46`.
- 3D cleanup: hidden panes, transparent axis lines, `set_box_aspect([1, 1, 0.5])`, `view_init(elev=20, azim=50)` — `plot_hole_manifold.py:73-78`, `plot_manifold.py:47-57`.
- `plot_hole_manifold.py` runs at module level (no `__main__` guard) — `:17-82`.
- `MaxNLocator(nbins=5)` on y — `plot_sweep.py:71`; the only tick locator in the repository.
- Numeric x `[1, 5, 10, 20, 40]` on a linear axis with `set_xticks(x_values)` — `plot_sweep.py:36`, `:68`.

#### figure_VIGIL (4 scripts, data inline)

| Script | Chart and purpose | Fig | Layout | Save |
|---|---|---|---|---|
| `plot_ablation.py` | Three hyperparameter-sweep line panels; panel 3 has a twin y axis | (27, 6) :51 | `plt.subplots(1, 3, gridspec_kw={'width_ratios': [1.1, 1, 1]})` :51; `tight_layout(pad=0.5)` + `subplots_adjust(wspace=0.3)` :133-134 | png, 300 :136 |
| `plot_comparison_radar.py` | Radar over 12 spokes (4 models × 3 benchmarks), 3 methods | (12, 10) :60 | `projection='polar'` :61 | png, 300, `bbox_inches='tight'` :161 |
| `plot_concept.py` | Concept figure: (left) three probability curves with a gap arrow; (right) two KDE "manifolds" with paths | (24, 6) :213 | `plt.subplots(1, 2)`; `subplots_adjust(wspace=0.25)` :219; manual `set_position` shift :221-222 | png, 300 :225 |
| `plot_posttraining.py` | Line chart over training steps with alpha-graded segments | (9, 8) :34 | single axes | png, 300 :70 |

Palette: `#D88F8A #8BCF8B #0F4D92` (`plot_ablation.py:13-17`, `plot_comparison_radar.py:12-16`, `plot_posttraining.py:16-20`); concept `#6F6F6F #0F4D92 #D88F8A` (`plot_concept.py:45-47`) and `#2E74B5 #1f77b4 #6F6F6F #6b7280 #D62728` (`:150-154`).

Techniques:

- Reference lines: dashed "SFT only" line `alpha=0.3, linewidth=4` — `plot_ablation.py:61`, `plot_posttraining.py:40`; dotted "ours at 25%" line — `plot_ablation.py:63`.
- Percent tick labels `f'{item:.0%}'` — `plot_ablation.py:71`; monospace y labels `fontfamily='monospace'` — `:72`.
- Twin axis: `ax2 = ax.twinx()`, right spine re-enabled, label `rotation=270`, left series at `alpha=0.4` — `:112-125`; a duplicated `ax2.plot` call — `:120-121`; per-x "Mean = …" text — `:128-131`.
- The dict key `'$\beta$'` is a non-raw string, so `\b` becomes a backspace character — `plot_ablation.py:18`, `:24`, `:80`. The key is used consistently, so the figure is not affected.
- Radar with per-benchmark radial scaling: each spoke maps its own `[r_min, r_max]` to a display range 45–90 — `plot_comparison_radar.py:49-53`, `:81-90`.
- Radar grid drawn as polygons per level, not circles; outer boundary and spokes drawn by hand; default grid off — `:98-127`.
- Per-spoke rotated tick labels, innermost level skipped — `:134-150`; spoke labels at `r_max + 8 + 10·|sin θ|` — `:152-156`; `theta_zero_location('N')`, clockwise angle order `np.linspace(2π, 0, n)` — `:71`, `:99`; fill `alpha=0.05`, vertex dots — `:94-96`.
- Concept curves: normalized Gaussians with `fill_between(..., alpha=0.12)` — `plot_concept.py:49-63`; double arrow for the gap `arrowstyle="<->"` — `:66-71`.
- Concept manifold: centerlines from `CubicSpline(..., bc_type="natural")` — `:94-105`; points sampled in a tube around each curve through tangent and normal vectors — `:13-23`; Gaussian mixture along the curve — `:26-31`; `gaussian_kde` density on a 280² grid — `:34-41`; contours at quantile levels `np.quantile(zz, np.linspace(0.72, 0.99, 10))` — `:147-160`; points at `alpha=0.10` — `:157-158`; star markers with white edge — `:161-162`; smoothstep blend `3u² − 2u³` for the "ours" path — `:125-132`; `annotate` arrows with white boxes — `:189-205`.
- `LineCollection` with alpha rising 0.3 → 0.9 per segment — `plot_posttraining.py:43-51`; custom `Line2D` legend handles — `:55-58`.

#### figure_ophthal_review (2 scripts, nested dict data)

| Script | Chart and purpose | Fig | Layout | Save |
|---|---|---|---|---|
| `plot_composition.py` | Annotated count heatmap (task × clinical stage) with totals in labels | (14, 10) :42 | single axes | png, 300 :76 |
| `plot_trend.py` | Two cumulative-area trend panels by month with model-release events | (14, 8) :84 | `add_subplot(2, 1, k)` | png, 300 :120 |

Palette: `seaborn.heatmap(..., cmap='Reds')` (`plot_composition.py:65`); trend `["#9BC8FA", "#ffa8a6", "#13457E", "#850c0a"]` (`plot_trend.py:81`).

Techniques:

- `sns.heatmap(annot=True, fmt='d', vmin=0, vmax=20, linewidths=1, linecolor='white')`, explicit colorbar ticks — `plot_composition.py:65-69`; row and column totals appended to tick labels as `($n=…$)` — `:57-63`. The script builds `category_count_arr` and `category_arr` (`:45-51`) but does not draw the category level.
- Month axis as strings from `relativedelta` (categorical x, not `matplotlib.dates`) — `plot_trend.py:44-50`, `:88`; ticks every 6 months `time_arr[2::6]` — `:97`.
- Cumulative areas `fill_between(time, 0, cumsum)` plus a boundary line — `:89-94`.
- Hatched area plus a second pass `facecolor='none', edgecolor='white', linewidth=2` to hide the hatch border — `:103-110`.
- Event annotations: arrow from the data point, text offset by `(1 + 0.8·k)·dy·(y1 − y0)`, where `k` is the count of `*` in the label — `:52-72`.
- Data defects: duplicate key `'2023-02'` (`'Bard'` is lost) — `:20-21`; key `'2023-9'` is not zero-padded, so `GPT-4v` never matches the axis — `:35`; `mark_events` reads `ax.get_ylim()` before `set_ylim` — `:95` vs `:98`, `:114` vs `:116`.

### 1.3 Output inventory

| Folder | Files under `figures/` | Pixel size (source for dpi check) |
|---|---|---|
| `figure_Brainteaser` | `brute_force.png`, `correctness_by_category.png`, `correctness_by_subcategory.png`, `rewriting.png`, `selfcorrection_math.png` | 15600×3600, 10800×3600, 28800×3600, 7200×3600, 10800×3600 |
| `figure_CellSpliceNet` | `ablation.png`, `comparison_human.png`, `comparison_worm.png` | 3900×3900, 13500×3600 ×2 |
| `figure_Cflows` | `diffusion_swiss_roll.png`, `fig2_comparison_GeneRegulatory.{png,pdf}`, `fig2_comparison_Trajectory.{png,pdf}`, `figX_comparison_Ablation.{png,pdf}` | 5313×3000 (tight bbox), 10800×1800 ×2, 10500×2100 |
| `figure_Dispersion` | `idea.png`, `illustration.png` | 5400×1800, 7200×2400 |
| `figure_ImmunoStruct` | `bars_ablation_Cancer.png`, `bars_ablation_IEDB.png`, `bars_comparison_Cancer.png`, `bars_comparison_IEDB.png` | 16800×3600, 14400×4800, 16800×3600 ×2 (600 dpi) |
| `figure_RNAGenScape` | `manifold.png`, `manifold_holes.png`, `results_comparison_optimization.png`, `results_comparison_speed.png`, `results_sweep.png` | **1000×700** (100 dpi), 4200×1800, 6000×2700, 2700×1500, 2700×1200 |
| `figure_VIGIL` | `ablation_curves.png`, `comparison_posttraining.png`, `comparison_radar.png`, `concept.png` | 8100×1800, 2700×2400, 3560×2550 (tight bbox), 7200×1800 |
| `figure_ophthal_review` | `composition_heatmap.png`, `trend_by_month.png` | 4200×3000, 4200×2400 |
| `assets/` (not script output) | `Dispersion_motivation.png`, `Dispersion_observation.png`, `Dispersion_observation_distillation.png`, `ImmunoStruct_contrastive.png`, `ImmunoStruct_results_CEDAR.png`, `ImmunoStruct_results_IEDB.png`, `ImmunoStruct_schematic.png`, `RNAGenScape_schematic.png`, `RNAGenScape_teaser.png`, `VIGIL_teaser.png` | 10 PNG, RGBA |

Export summary: 32 save calls; 28 PNG, 3 PDF (all in `figure_Cflows`), 0 SVG, 0 EPS. dpi 300 in 27 calls, dpi 600 in 4 calls, default dpi in 1 call. `bbox_inches='tight'` in 2 calls (`diffusion_swiss_roll.py:96`, `plot_comparison_radar.py:161`). The 3 PDF files use the default font type because no script sets `pdf.fonttype`.

Data source style: inline module-level dicts in 21 files; one separate data module (`ImmunoStruct/raw_data.py`); procedural synthetic data in 6 files (`diffusion_swiss_roll.py`, both Dispersion scripts, both manifold scripts, `plot_concept.py`). No script reads CSV, JSON, or NPY.

Third-party imports: `scipy` in 2 files (`diffusion_swiss_roll.py:3`, `plot_concept.py:4-5`), `seaborn` in 1 (`plot_composition.py:4`), `dateutil` in 1 (`plot_trend.py:5`).

---

## 2. Claim verification

### 2.1 `scientific-figure-making/references/design-theory.md`

| # | Claim (line) | Verdict | Evidence |
|---|---|---|---|
| 1 | `font.family = 'helvetica'` in 16 scripts (:10) | **WRONG** | 19 files set `'helvetica'` (grep, §1.1). |
| 2 | `font.family = 'sans-serif'` in 2 scripts, geometric illustrations (:11) | VERIFIED | `Dispersion/plot_idea.py:59`, `plot_illustration.py:387`. |
| 3 | Fallback stack `['Arial', 'Helvetica', 'DejaVu Sans', 'sans-serif']` (:12) | NOT OBSERVED | Recommendation only; no script sets a list. |
| 4 | 24 pt + `axes.linewidth=3` for large panels; 15–16 pt + 2 for compact (:14-15) | VERIFIED | 14 files at 24/3; 4 files at 15–16/2. Exception `plot_concept.py:231-232` (18/1.5). |
| 5 | Top and right spines off (:17-18) | VERIFIED | 19 files. The 3D and swiss-roll scripts do not set them. |
| 6 | `text.usetex = True` in 6 files (:20) | VERIFIED | 6 files (§1.1). |
| 7 | `svg.fonttype='none'` "when preserving editable text in vector exports" (:22) | PARTIAL | 1 file (`ImmunoStruct/plot_bars.py:27`), and that file writes PNG only. No script writes SVG. |
| 8 | `dpi=300` dominant, 23 save calls (:27) | **WRONG** | 27 of 32 calls use dpi 300. |
| 9 | `dpi=600` for dense ImmunoStruct bars (:28) | VERIFIED | `plot_bars.py:70`, `:124`, `:169`, `:215`. |
| 10 | `tight_layout(pad=2)` 21 occurrences (:30) | **WRONG** | 23 of 27 `tight_layout` calls use `pad=2`; 2 use `pad=1`; 2 use `pad=0.5` (`VIGIL/plot_ablation.py:133`, `plot_concept.py:218`). |
| 11 | `pad=1` for compact multi-panel plots (:31) | PARTIAL | `RNAGenScape/plot_comparison.py:109` is a single-panel figure; `plot_sweep.py:75` is 1×2. |
| 12 | Occasional `bbox_inches='tight'` with explicit `pad_inches` (:32) | PARTIAL | 2 calls use `bbox_inches='tight'`; only `diffusion_swiss_roll.py:97` sets `pad_inches=1`. |
| 13 | Palette families: blue `#0F4D92 #3775BA`, green `#DDF3DE #AADCA9 #8BCF8B`, red `#F6CFCB #E9A6A1 #B64342`, neutrals `#CFCECE #767676 #4D4D4D #272727`, accents `#FFD700 #EA84DD #42949E #9A4D8E` (:38-47) | VERIFIED (hex) / PARTIAL (roles) | All hex values occur. `#B64342`, `#42949E`, `#9A4D8E` occur only in `Dispersion/plot_illustration.py` (arrows, not bars). `#767676 #4D4D4D #272727` occur only in `RNAGenScape/plot_comparison.py:16`. |
| 14 | Blue = proposed method (:51) | PARTIAL | True in CellSpliceNet, Cflows, ImmunoStruct, RNAGenScape, VIGIL. In Brainteaser `#3775BA` marks `OpenAI o3`, an evaluated model (`plot_brute_force.py:16-18`). |
| 15 | Ultra-wide canvases `(45, 12)`, `(28, 6)` (:60) | VERIFIED | `CellSpliceNet/plot_comparison.py:103`, `ImmunoStruct/plot_bars.py:29`; widest `(96, 12)` at `plot_correctness_by_subcategory.py:78`. |
| 16 | Dedicated legend panels with `set_axis_off()` (:61) | VERIFIED | 9 files: 5 Brainteaser, 3 Cflows comparison, 1 ImmunoStruct. CellSpliceNet and VIGIL use in-axes legends. |
| 17 | Category bars hide x ticks `set_xticks([])` (:62) | VERIFIED | All bar scripts except `Cflows/plot_comparison_Trajectory.py` and `ImmunoStruct` barh panels. |
| 18 | Y limits "often derived from `data.min() - data.std()`" (:63) | **WRONG** | 0 occurrences. Observed rules: hard-coded ranges (`ImmunoStruct/plot_bars.py:40` etc.), `ymax + 0.5` headroom (`CellSpliceNet/plot_ablation.py:75`), `ymax * 20` on log (`RNAGenScape/plot_comparison.py:103`), fixed `[0, 1]`. |
| 19 | Multi-panel consistency (:64) | NOT TESTABLE | Subjective statement. |
| 20 | Values printed above bars at 36 pt (:70) | **WRONG** | Bar value text sizes: 20 (`plot_brute_force.py:139`), 32 and 24 (`CellSpliceNet/plot_ablation.py:50`, `:71`), 32 (`plot_comparison.py:126`), 16 (`RNAGenScape/plot_comparison.py:107`). 36 pt is used for titles, axis labels, y-tick labels, and legends. |
| 21 | `FixedLocator` for Y ticks (:71) | **WRONG** | 0 occurrences. Tick control uses `set_yticks([...])` lists (`CellSpliceNet/plot_ablation.py:76`, `VIGIL/plot_ablation.py:73`) and one `MaxNLocator(nbins=5)` (`RNAGenScape/plot_sweep.py:71`). |
| 22 | Black bar edges, linewidth 1.5–3 (:72) | PARTIAL | Only `plot_brute_force.py` (2 and 3) and `plot_rewriting.py` (2). The other 10 bar scripts draw bars without edges. |
| 23 | Alpha-based ablation 0.2 → 1.0 on one blue (:73) | VERIFIED | `ImmunoStruct/plot_bars.py:80` (`#3775BA`, 12 levels). |
| 24 | Hatch with slashes, backslashes, dots (:74) | PARTIAL | Hatches used: `'/'`, `'\\'`, `'x'`, `'|'`, `'-'`, `'///'`, `'\\\\\\'`. No dot hatch. 3 files use hatch. |
| 25 | 2–4 curves per axes, width 2–3, controlled alpha (:78-79) | VERIFIED | `plot_sweep.py:52-65`, `VIGIL/plot_ablation.py:64-66`, `plot_trend.py:93-94`. |
| 26 | `fill_between` for uncertainty (:80) | **WRONG** | `fill_between` appears only for density curves (`plot_concept.py:59-63`) and cumulative areas (`plot_trend.py:89-110`). No uncertainty band exists. |
| 27 | Grid minimal or absent (:81) | VERIFIED | No `grid(True)`; `grid(False)` at `plot_illustration.py:30`, `plot_comparison_radar.py:103`. |
| 28 | Radar under `figure_VIGIL` (:83) | VERIFIED | `plot_comparison_radar.py`. |
| 29 | Illustrations: low alpha, warm accent arrows, no ticks (:87-89) | VERIFIED | `plot_illustration.py:188-193`, `plot_concept.py:156-162`. |
| 30 | Preset `font.size 16`, `axes.linewidth 2.5`, `legend.frameon False`, `svg.fonttype none` (:94-102) | NOT OBSERVED | No script uses 2.5. `legend.frameon` is never set globally; `frameon=False` is passed per call, and `ImmunoStruct` legends keep the frame (`plot_bars.py:64`). |

Result: 8 WRONG, 7 PARTIAL, 3 NOT OBSERVED, 1 NOT TESTABLE, 11 VERIFIED (30 rows).

### 2.2 `scientific-figure-making/references/api.md`

| Item (line) | Verdict | Evidence |
|---|---|---|
| `PALETTE` hex values (:14-21) | VERIFIED as colors; NOT SHIPPED as code | Hex values occur in scripts; no `PALETTE =` in any `.py`. |
| `DEFAULT_COLORS` order (:28) | NOT SHIPPED | 0 occurrences; no script uses this order. |
| `FigureStyle` dataclass (:34-41) | NOT SHIPPED | 0 occurrences. Its default `font_family` starts with `"DejaVu Sans"` (:40), but `design-theory.md:95` starts with `"Arial"`. The two files disagree. |
| `apply_publication_style`, `create_subplots`, `finalize_figure`, `make_grouped_bar`, `annotate_bars`, `make_trend`, `make_heatmap`, `make_scatter`, `make_sphere_illustration` (:52-127) | NOT SHIPPED | `grep` for each `def` returns 0 matches. `tutorials.md:3` states that no tracked module defines them. `README.md:102` tells the agent to "implement or adapt" them. |
| `make_heatmap` default `cmap='magma'` (:105) | NOT OBSERVED | 0 uses of `magma`. Scripts use `Reds`, `Blues_r`, seaborn `Reds`. |
| `make_trend(show_shadow=True)` (:97) | NOT OBSERVED | No shadow or band in any trend script. |
| `make_sphere_illustration(light_dir=(-0.5, 0.5, 0.8), resolution=128)` (:121) | PARTIAL | The light direction matches `plot_idea.py:31`, `plot_illustration.py:220`, `:344`. The scripts use a 512² grid, not 128. |
| `finalize_figure` default formats pdf/svg/eps, `pad=0.05` (:68-70) | NOT OBSERVED | 28 of 32 saves are PNG; no SVG or EPS; layout pad is `tight_layout(pad=2)`. |
| Validation rules (:133-136) | NOT SHIPPED | No validation code exists. |
| `matplotlib.use("Agg")` convention (:143) | NOT OBSERVED | 0 occurrences. |

---

## 3. Gap table: figures4papers capability vs academic-figure

Skill root: `skills/academic-research-tools/academic-figure/`. The skill has 12 scripts (`academic_figure_pref.py`, `audit_pdf_text.py`, `visual_qa.py`, and 9 style scripts: `bar_memevolve.py`, `bar_spice.py`, `classwise_iou_table.py`, `line_aime.py`, `line_loss_inset.py`, `line_selfdistill.py`, `radar_dora.py`, `scatter_break.py`, `scatter_tsne.py`) and 8 style documents under `references/styles/`.

| # | figures4papers capability (evidence) | In skill? | Skill evidence | Gap |
|---|---|---|---|---|
| G1 | 100% stacked composition bars with hatch per subtype and stroke-outlined values (`Brainteaser/plot_brute_force.py:120-157`) | **no** | `chart-selection.md:40`, `:68` recommend a stacked bar; no recipe, style, or script draws one | No stacked-bar recipe. No `bottom=cumsum` pattern. No hatch-per-layer composition. |
| G2 | Hatch-only legend and color-only legend in two separate axes (`plot_brute_force.py:227-242`, `plot_rewriting.py:68-99`) | partial | Legend-only axis in `chart-recipes.md:312-314`, `panel-layout-patterns.md:25` (prose only) | No code for a legend-only axis. No dummy-bar proxy trick. No split color/hatch legend. |
| G3 | Stroke outline text `path_effects` (`plot_brute_force.py:132-143`) | **no** | 0 matches for `patheffects` in skill | Missing. `panel-layout-patterns.md:110` mentions "a thin white or black stroke" in prose only. |
| G4 | Luminance-aware text color (`CellSpliceNet/plot_ablation.py:19-26`, `RNAGenScape/plot_comparison.py:149-151`) | partial | `chart-recipes.md:327-328` (formula in prose) | No function or code snippet. |
| G5 | Ablation bars with baseline line and drop arrows (`CellSpliceNet/plot_ablation.py:52-71`) | partial | `bar_paired_delta` style + `scripts/bar_memevolve.py:56-81` draws gain arrows between paired bars | No single-baseline "drop from full model" variant. |
| G6 | Alpha-ramp ablation, barh with decoded component labels (`ImmunoStruct/plot_bars.py:7-18`, `:77-83`) | partial | `chart-recipes.md:322-323`, `design-theory.md:76` (one-liner) | No barh ablation recipe. No binary-code component label helper. |
| G7 | Mean ± std bars with value above the error cap (`CellSpliceNet/plot_comparison.py:111-126`) | partial | `chart-selection.md:37`, `:61` name "bar with error bars" | No bar-with-error recipe in `chart-recipes.md` (families 1–10 have no bar family). |
| G8 | Grouped bars inside datasets (`Cflows/plot_comparison_Trajectory.py:47-60`) | yes | `panel-layout-patterns.md:34-48` | Covered. See §4.3 for the provenance note. |
| G9 | Wide multi-metric row + legend-only last cell (`Cflows/plot_comparison_Ablation.py:35-57`) | yes | `panel-layout-patterns.md:21-32` | Covered as prose; no runnable template. |
| G10 | Scientific tick notation `ticklabel_format(style='sci')` (`Cflows/*:53/63`) | **no** | 0 matches | Missing. |
| G11 | Column-normalized heatmap with a NaN summary row and signed-percent labels (`RNAGenScape/plot_comparison.py:115-227`) | **no** | Correlation heatmap only (`chart-recipes.md:146-160`); table shading in `scripts/classwise_iou_table.py:96-112` | No per-column normalization. No summary row pattern. |
| G12 | Annotated count heatmap with totals in labels (`ophthal_review/plot_composition.py:57-69`) | partial | `chart-recipes.md:146-160` (no `annot`) | No count-annotated heatmap recipe. |
| G13 | Log-scale bars with value labels and headroom (`RNAGenScape/plot_comparison.py:94-107`) | partial | Log y only in training loss (`chart-recipes.md:182`) | No log-bar recipe. |
| G14 | LaTeX `\underbrace` group brackets under bars (`RNAGenScape/plot_comparison.py:79-84`) | **no** | 0 matches | Missing. |
| G15 | Hyperparameter sweep lines, reference lines, twin y axis (`VIGIL/plot_ablation.py:51-131`) | partial | `twinx` named in `chart-recipes.md:175`; `layout-defaults.md:98`; `line_aime.py` has reference lines | No twin-axis code. No sweep-panel template with width ratios. |
| G16 | Alpha-graded line segments via `LineCollection` (`VIGIL/plot_posttraining.py:43-58`) | **no** | 0 matches | Missing. |
| G17 | Radar with per-axis ranges, polygon grid, per-spoke tick labels (`VIGIL/plot_comparison_radar.py:49-156`) | partial | `radar_dual_series.md:13` (polygon grid); `scripts/radar_dora.py:35-51` (per-axis `RANGES` normalization) | No per-spoke tick labels. No benchmark-grouped radii. No 3-series variant. |
| G18 | Concept distribution plot: overlapping Gaussians, filled, with a `<->` gap arrow (`VIGIL/plot_concept.py:44-85`) | **no** | Prototype class `schematic-led composite` in `figure-contract.md:86` has no recipe | No concept/schematic recipe. |
| G19 | KDE density manifold: spline centerline, tube sampling, quantile contours, annotated paths (`VIGIL/plot_concept.py:88-209`) | **no** | `chart-selection.md:53`, `:63` name "2D KDE" as an alternate only | No KDE-contour recipe. No `gaussian_kde` or `CubicSpline` use. |
| G20 | Hand-shaded sphere and ellipsoid illustrations, SLERP geodesics, `Arrow3D` (`Dispersion/plot_idea.py:15-48`, `plot_illustration.py:50-325`) | **no** | 0 matches for sphere, shading, geodesic; `viz-pitfalls.md:33` (P3) rejects 3D data charts | No illustration recipe. P3 targets data charts, so the boundary for concept illustrations is not stated. |
| G21 | 3D surface landscape with custom colormap and masked gray patches (`RNAGenScape/plot_hole_manifold.py:52-78`, `plot_manifold.py:31-57`) | **no** | `chart-selection.md:67` lists "3D surface" under "Do not use" for matrix data | No 3D concept-surface recipe. Same boundary question as G20. |
| G22 | Diffusion matrix + swiss-roll graph with probability-weighted edges (`Cflows/diffusion_swiss_roll.py:18-97`) | **no** | 0 matches for swiss, diffusion | Missing. |
| G23 | Month trend: cumulative areas, hatch with border erase, stacked event labels (`ophthal_review/plot_trend.py:44-117`) | partial | Hatch erase `panel-layout-patterns.md:50-58`; event labels `:60-71`; time series family `chart-recipes.md:33-50` | No month-axis generator. No cumulative-area recipe that combines the parts. |
| G24 | Separate data module per figure (`ImmunoStruct/raw_data.py`, `plot_bars.py:4`) | partial | `modes/from-data.md:34` keeps data at the top of each script | No data-module convention. |
| G25 | Display-scale rcParams block (every `__main__`, e.g. `plot_brute_force.py:107-111`) | yes | `design-theory.md:36-45` (`DISPLAY_SCALE` dict) | Covered as a dict in a Markdown file; no importable code. |
| G26 | House-style helper module (spec only: `api.md:32-127`; the repository ships none) | **no** | Export contract as prose in `design-theory.md:88-104`; `apply_journal_style()` for journal scale in `matplotlib-recipes.md:122-124` | No importable module with a display-scale apply function, a palette constant, a multi-format save function, or legend-panel and bar-label helpers. |
| G27 | Hex palette of the house style (§2.1 row 13) | partial | Roles without hex values in `design-theory.md:48-56` | Hex values are not recorded. |

Other skill facts found during the comparison:

- The skill restates three rules that trace to the unverified f4p claims: `design-theory.md:74` ("Set the tick positions explicitly instead of leaving them to the locator", from claim 21), `:75` (black edges 1.5–3; observed in 2 of 12 bar scripts, claim 22), `:84` (`fill_between` for uncertainty; not observed, claim 26).
- `design-theory.md:3-6`, `attribution.md:12`, `attribution.md:20-29`, and `panel-layout-patterns.md:10-12` say figures4papers has no LICENSE. That fact is stale since `3c181f8` (2026-09-06).
- The skill cites nature-skills at `7316aff` (`attribution.md:14`). The local clone `ref/repo/nature-skills` is at `8990143` (2026-07-07). The `THIRD_PARTY_NOTICES.md` that `attribution.md:33-35` mentions is not in the local clone. This point is not verified.

---

## 4. Licensing

### 4.1 Facts

- Headline, `ref/repo/figures4papers/LICENSE:1`: **"Attribution-NonCommercial 4.0 International"**. The operative title at `LICENSE:57`: "Creative Commons Attribution-NonCommercial 4.0 International Public License".
- Added in commit `3c181f8` "Create LICENSE", 2026-09-06 (`git log -- LICENSE`). Snapshot `6790a93` (2026-08-06), which the skill cites, had no LICENSE file.
- The LICENSE file is the plain CC text. It names no copyright holder and no year (`grep "Copyright <year>"` and `grep "Chen Liu"` return nothing in the file). `README.md` has no license section (`grep -i licen README.md` returns 0).
- The LICENSE sits at the repository root with no scope statement, so it reads as covering the scripts, the `scientific-figure-making/` text, and the images.
- Grant, Section 2(a)(1), `LICENSE:151-155`: "reproduce and Share the Licensed Material, in whole or in part, for NonCommercial purposes only; and produce, reproduce, and Share Adapted Material for NonCommercial purposes only."
- NonCommercial definition, Section 1(i), `LICENSE:116-122`: "not primarily intended for or directed towards commercial advantage or monetary compensation."
- Attribution, Section 3(a)(1), `LICENSE:229-257`: keep the creator identification, a copyright notice, a license notice, a warranty-disclaimer notice, and a URI; state modifications; state the CC BY-NC 4.0 license with its text or URI.
- Section 3(a)(4), `LICENSE:269-271`: "the Adapter's License You apply must not prevent recipients of the Adapted Material from complying with this Public License."
- This repository's root `LICENSE:1` is "MIT License". MIT grants use "without restriction", which includes commercial use.
- The figures in `figure_*/figures/` and `assets/` also appear in published papers (`README.md:15` lists Nature Machine Intelligence, ICML, NeurIPS, ECCV). Publisher rights can apply in addition to CC BY-NC.

### 4.2 Implications (constraint statement, not legal advice)

| Use under an MIT repository | Constraint |
|---|---|
| (a) Restate design facts in original words (numbers, hex values, layout rules, color roles) | A copyright license governs expression, not facts or ideas. The existing method in `attribution.md:26-28` (facts only, original wording) does not need the CC grant. Attribution stays good practice. The `attribution.md` row must change from "None" to "CC BY-NC 4.0". |
| (b) Port code (copy a script, or adapt one so that it stays substantially similar) | The result is Licensed Material or Adapted Material. It can be shared for NonCommercial purposes only, with the Section 3(a) notices. The MIT license cannot apply to that part, because MIT permits commercial use and Section 3(a)(4) forbids an Adapter's License that blocks compliance. The repository would become mixed-license. |
| (c) Copy images (`figures/*.png`, `assets/*.png`) | Same NC and attribution constraint as (b), plus possible publisher rights on published figures. |

Options for (b) and (c):

1. Do not copy. Write original implementations from the recorded facts (the present practice for `design-theory.md`).
2. Keep ported material in a separate directory with its own CC BY-NC 4.0 notice, and exclude that directory from the MIT grant. `attribution.md:33-35` records that nature-skills uses a similar exclusion for its `assets/figures4papers/` copy.
3. Ask the author for written permission under MIT or a dual license.
4. Link to the upstream files by URL and pin the commit; copy nothing.

### 4.3 Existing content with code-level resemblance

The skill says it copied no figures4papers code. The following snippets match figures4papers code structure and constants. The skill attributes them to nature-figure, and nature-figure itself copies the pattern from figures4papers.

| Skill location | figures4papers source | Intermediate source |
|---|---|---|
| `panel-layout-patterns.md:56-57` (hatched `fill_between`, then `facecolor="none", edgecolor="white", linewidth=2`) | `ophthal_review/plot_trend.py:103-110` | `ref/repo/nature-skills/skills/nature-figure/references/common-patterns.md:161` |
| `panel-layout-patterns.md:66-70` (`(1 + 0.8 * rank) * dy`, `arrowstyle="-|>"`, `shrinkA=0, shrinkB=0`) | `plot_trend.py:62-71` | `common-patterns.md:188-191` |
| `panel-layout-patterns.md:40-47` (`x0 = i * (n_methods + 1)`, center ticks) | `Cflows/plot_comparison_Trajectory.py:47-60` | `common-patterns.md:204` |

The snippets are short, and the variable names differ. Whether they count as "Adapted Material" is a legal question outside this research. The facts are recorded here so the main agent can decide.

---

## 5. Top recommendations (ranked)

1. **Correct the stale license record.** Evidence: `LICENSE:1` added in `3c181f8` (2026-09-06). Stale text at `attribution.md:12`, `attribution.md:20-29`, `design-theory.md:3-6`, `panel-layout-patterns.md:10-12`. Update the snapshot hash to `3c181f8` and the license to CC BY-NC 4.0. Scripts did not change between the two hashes, so the design facts stay valid.
2. **Decide the provenance of the three `panel-layout-patterns.md` snippets (§4.3).** Evidence: constant-level match with `plot_trend.py:62-71`, `:103-110`, and `plot_comparison_Trajectory.py:47-60`. Options: rewrite from the rule, or keep and record the CC BY-NC origin.
3. **Remove or re-scope the three inherited rules that the scripts do not support.** Evidence: `design-theory.md:84` (`fill_between` for uncertainty, claim 26 WRONG), `:75` (black edges, claim 22 PARTIAL, 2 of 12 bar scripts), `:74` (explicit tick positions, derived from the WRONG `FixedLocator` claim 21; `set_yticks` lists occur in 4 scripts: `CellSpliceNet/plot_ablation.py:76`, `plot_comparison.py:132`, `VIGIL/plot_ablation.py:73`, `plot_posttraining.py:64`). Add the observed facts instead: y-headroom rule `ymax + 0.5` for an in-axes legend, per-panel fixed ranges, dpi 300 in 27 of 32 saves.
4. **Add an original house-style helper module (G26).** Evidence: `api.md:32-127` specifies it; figures4papers ships none (`tutorials.md:3`); the skill has only prose (`design-theory.md:88-104`) and a journal preset (`matplotlib-recipes.md:122`). Scope from the observed practice: display-scale apply, palette constant with the §2.1 row 13 hex values, multi-format save with `pdf.fonttype=42` (absent in all 3 figures4papers PDFs), legend-only axis, luminance text color, stroke text. Write it from facts only (licensing option 1).
5. **Add a stacked composition bar family with hatch subtypes and a split legend (G1, G2, G3).** Evidence: the README features it (`README.md:25-26`); the skill recommends stacked bars (`chart-selection.md:40`, `:68`) but ships no recipe.
6. **Add a concept/schematic family (G18, G19, G20, G21).** Evidence: README sections "3D spheres" and "Concept plots" (`README.md:29-30`, `:44-45`); `figure-contract.md:86` defines a schematic-led prototype with no recipe. State the boundary with `viz-pitfalls.md:33` (P3) and `chart-selection.md:67`: concept illustrations carry no data values.
7. **Add a column-normalized heatmap with a summary row (G11) and a count heatmap with totals (G12).** Evidence: `RNAGenScape/plot_comparison.py:115-227`, `ophthal_review/plot_composition.py:57-69`; the skill has only a correlation heatmap (`chart-recipes.md:146-160`).
8. **Extend the radar and line families (G15, G16, G17).** Evidence: `VIGIL/plot_comparison_radar.py:134-150` (per-spoke labels), `plot_posttraining.py:43-51` (`LineCollection`), `plot_ablation.py:116-125` (twin axis). The skill has `radar_dora.py:35-51` and a `twinx` mention only (`chart-recipes.md:175`).
9. **Record the figures4papers defects so that no port repeats them.** Evidence: duplicate dict key and unpadded month (`plot_trend.py:20-21`, `:35`); default 100 dpi (`plot_manifold.py:61`); no seed (`diffusion_swiss_roll.py:7`); `svg.fonttype` with PNG-only output (`plot_bars.py:27`); backspace in `'$\beta$'` (`VIGIL/plot_ablation.py:18`); hard-coded `'helvetica'` with no fallback (19 files).

## Caveats / Not found

- No script was run. Rendering behavior (font fallback when Helvetica is absent, `usetex` availability) is not verified.
- The legend `ncols=` keyword (7 calls, e.g. `CellSpliceNet/plot_comparison.py:135`) and a hatch list passed to `ax.bar` (`plot_brute_force.py:234`) need a recent matplotlib. The minimum versions were not checked.
- No web search was done. External statements about CC license practice are not included.
- The `THIRD_PARTY_NOTICES.md` claim in `attribution.md:33-35` could not be checked in the local nature-skills clone (older commit `8990143`).
- A prior report exists at `.trellis/tasks/archive/2026-08/08-16-upgrade-academic-figure-skill/research/figures4papers.md` (snapshot `6790a93`). It counts 11 assets; the current tree has 10 tracked assets, and `git diff 6790a93 3c181f8` shows no asset change, so the count of 11 in that report is not supported by this clone.
