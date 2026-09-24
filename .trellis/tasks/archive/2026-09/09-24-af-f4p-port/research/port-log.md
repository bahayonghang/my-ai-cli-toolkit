# Port log: figures4papers -> academic-figure (PART 1)

Source: `ref/repo/figures4papers` @ `3c181f8`. Destination:
`skills/academic-research-tools/academic-figure/scripts/figures4papers/<project>/`.

## Generic changes (all 24 plot scripts)

Applied by a one-off transform (not shipped), then reviewed per file:

- Line 1 comment: upstream path, `3c181f8`, `CC BY-NC 4.0`, pointer to `references/attribution.md`.
- `import matplotlib; matplotlib.use('Agg')` before the first `pyplot` import.
- `OUT_DIR = sys.argv[1]` (default `.`); `DPI` from `ACADEMIC_FIGURE_DPI` (default = upstream value).
- `SANS_SERIF = ['Helvetica', 'Arial', 'DejaVu Sans']`; `font.family = 'helvetica'` -> `'sans-serif'` plus `font.sans-serif = SANS_SERIF`.
- `./figures/<name>` -> `os.path.join(OUT_DIR, '<name>')`; `os.makedirs(OUT_DIR, exist_ok=True)`.
- After each `savefig`: `print('saved:', os.path.abspath(<path>))`.
- `raw_data.py`: only the line-1 comment.

## Per project

### figure_Brainteaser (5 scripts)

- Scripts: `plot_brute_force.py`, `plot_correctness_by_category.py`, `plot_correctness_by_subcategory.py`, `plot_rewriting.py`, `plot_selfcorrection_math.py`.
- Fixes: generic only.
- Run (default DPI 300, and DPI 40): exit 0 for all 5; outputs `brute_force.png`, `correctness_by_category.png`, `correctness_by_subcategory.png`, `rewriting.png`, `selfcorrection_math.png`; no warnings on stderr.

Note: the PostToolUse formatter hook reformats a `.py` file on every Edit/Write
call. All port edits are made through Bash-run Python so the files keep the
upstream layout and the diff against upstream stays small.

### figure_CellSpliceNet (2 scripts)

- Scripts: `plot_ablation.py`, `plot_comparison.py`.
- Fixes: generic only.
- Run: exit 0; outputs `ablation.png`, `comparison_worm.png`, `comparison_human.png`.

### figure_Cflows (4 scripts)

- Scripts: `diffusion_swiss_roll.py`, `plot_comparison_Ablation.py`, `plot_comparison_GeneRegulatory.py`, `plot_comparison_Trajectory.py`.
- R4 fix: `diffusion_swiss_roll.py` sets `np.random.seed(0)` at the start of `__main__` (upstream has no seed). Also added `os.makedirs(OUT_DIR)` (upstream has none) and the saved-path print after the multi-line `plt.savefig`. No font change (upstream sets no font); `SANS_SERIF` not defined there.
- Run: the three bar scripts exit 0 and write `figX_comparison_Ablation.{png,pdf}`, `fig2_comparison_GeneRegulatory.{png,pdf}`, `fig2_comparison_Trajectory.{png,pdf}`.
- `diffusion_swiss_roll.py` needs scipy (not installed). Verified only with a local numpy shim for `scipy.spatial.distance.pdist/squareform` on `PYTHONPATH` (shim not shipped): exit 0, `diffusion_swiss_roll.png` written. The test skips it when scipy is missing.

### figure_ImmunoStruct (2 files)

- Files: `plot_bars.py`, `raw_data.py` (data module, line-1 comment only).
- DPI default 600 (upstream value).
- R4 fix: kept `svg.fonttype = 'none'` and PNG output; added `pdf.fonttype = 42`.
- Run: exit 0; outputs `bars_comparison_IEDB.png`, `bars_ablation_IEDB.png`, `bars_comparison_Cancer.png`, `bars_ablation_Cancer.png`.

### figure_Dispersion (2 scripts, usetex)

- Scripts: `plot_idea.py`, `plot_illustration.py`.
- R3: `USE_TEX` block (checks `latex` on PATH and `ACADEMIC_FIGURE_NO_TEX`); `text.usetex = USE_TEX`; fallback sets `mathtext.fontset = 'cm'`. All labels in these two files are mathtext-compatible (`$\rightarrow$`, `$\leftarrow\rightarrow$`, `${\ell_2}$`), so no string swap is needed.
- `save_path` now joins `OUT_DIR`; `dpi=DPI`; saved-path print.
- Run: exit 0 with TeX and with `ACADEMIC_FIGURE_NO_TEX=1`; outputs `idea.png`, `illustration.png`; no warnings.

### figure_RNAGenScape (4 scripts)

- Scripts: `plot_comparison.py` (usetex), `plot_sweep.py` (usetex), `plot_manifold.py`, `plot_hole_manifold.py`.
- R3 `plot_comparison.py`: `USE_TEX` block plus `TT` (`\texttt` or `\mathtt`) and `PCT` (`\%` or `%`). Fallback strings: `summary_label` -> `$\mathit{Improvement}$`; ours label -> `$\mathtt{RNAGenScape}$ $\mathbf{(ours)}$`; tick match now tests `'RNAGenScape' in text` (works in both modes). Disabled branch `PLOT_DE_NOVO_SPEED`: `\underbrace{\rule...}` kept for TeX; fallback draws the group names without a brace (mathtext has no `\underbrace`/`\rule`). TeX strings are unchanged when `USE_TEX` is true.
- R3 `plot_sweep.py`: `USE_TEX` block only (labels use `$\uparrow$`, valid mathtext).
- R4 fix `plot_manifold.py`: upstream `savefig` had no dpi (100); port saves at `DPI` (default 300). Output now 3000x2100 px.
- `plot_manifold.py` and `plot_hole_manifold.py` set no font upstream; no font change, `SANS_SERIF` not defined. `plot_hole_manifold.py` keeps its module-level code (no `__main__` guard, as upstream).
- Run: exit 0 for all 4 with TeX; `plot_comparison.py` and `plot_sweep.py` also exit 0 with `ACADEMIC_FIGURE_NO_TEX=1`. Outputs `results_comparison_speed.png`, `results_comparison_optimization.png`, `results_sweep.png`, `manifold.png`, `manifold_holes.png`.
- Spot check 1 (viewed): no-TeX `results_comparison_optimization.png` shows `RNAGenScape (ours)` in mono + bold, italic `Improvement`, `+35.0 %` labels, and `OpenVaccine (+)` ticks. No raw TeX command is visible.

### figure_VIGIL (4 scripts)

- Scripts: `plot_ablation.py`, `plot_comparison_radar.py`, `plot_concept.py`, `plot_posttraining.py`.
- R4 fix `plot_ablation.py`: the dict keys `'$\beta$'` and `'$\lambda$'` (and the two `*_key` lookups) are raw strings now. Upstream `'$\beta$'` held a backspace; `'$\lambda$'` was an invalid escape (SyntaxWarning on Python 3.12+). `python -W error` compile is clean.
- Extra font fix: `fontfamily='helvetica'` arguments (`plot_concept.py:81`, `plot_posttraining.py:68`, `:71`) -> `fontfamily='sans-serif'` (resolves through the `font.sans-serif` fallback list). Passing the list directly logged `findfont: Helvetica not found`.
- Run: `plot_ablation.py`, `plot_comparison_radar.py`, `plot_posttraining.py` exit 0; outputs `ablation_curves.png`, `comparison_radar.png`, `comparison_posttraining.png`; no findfont warnings.
- `plot_concept.py` needs scipy (`gaussian_kde`, `CubicSpline`). Verified only with a local numpy shim (KDE with Scott bandwidth; linear interpolation in place of the spline; not shipped): exit 0, `concept.png` written. The test skips it when scipy is missing.

### figure_ophthal_review (2 scripts, usetex)

- Scripts: `plot_composition.py` (seaborn), `plot_trend.py` (dateutil).
- R3: `USE_TEX` block in both. All labels are valid mathtext (`($n=23$)` and plain text), so no string swap.
- `fig_name` joins `OUT_DIR`; `os.makedirs(OUT_DIR)`; `dpi=DPI`; saved-path print.
- R4 fixes `plot_trend.py`:
  1. Duplicate key `'2023-02'` (`'Bard'` was lost) -> one key `'Bard\nLlaMA 1'`.
  2. `'2023-9'` -> `'2023-09'`, so the GPT-4v event matches the `%Y-%m` axis.
  - Follow-up layout change: `'GPT-4*'` -> `'GPT-4**'` so its label clears the two-line 2023-02 label. A text-bbox overlap check (arrows excluded) reports no overlapping labels in either panel after the change. The `get_ylim()`-before-`set_ylim()` order (catalog note) is not in the R4 list and is left as upstream.
- Run `plot_trend.py`: exit 0 with TeX and with `ACADEMIC_FIGURE_NO_TEX=1`; output `trend_by_month.png` (4200x2400 at default DPI).
- AC3 spot check (viewed, default DPI 300, TeX on): the bottom panel shows the `GPT-4v` label with its arrow at 2023-09. A second crop view showed the merged `Bard` / `LlaMA 1` label touching `GPT-4`; the `GPT-4**` change above resolves it (checked by bbox test, not viewed again).
- `plot_composition.py` needs seaborn (not installed). Verified only with a local `seaborn.heatmap` shim (pcolormesh + colorbar + annotations; not shipped): exit 0 with TeX and with `ACADEMIC_FIGURE_NO_TEX=1`, `composition_heatmap.png` written. The test skips it when seaborn is missing.

### Cleanup during the port

- An early run of the untransformed `plot_trend.py` wrote `scripts/figures4papers/figures/trend_by_month.png`, and a run created `figure_ImmunoStruct/__pycache__/`. Both were moved out of the skill tree to the temp dir.

## Original images (R5, AC4)

- 29 PNG files from `figure_*/figures/` copied to `assets/originals/figures4papers/<project>/` with the upstream names. PDF copies not ported.
- Method (one-off, not shipped): Pillow 12.3.0 `Image.thumbnail((N, N), Image.LANCZOS)`, `save(optimize=True)`.
- First pass at N = 2400: total 8,942,085 bytes (8.53 MiB), above the 8 MB limit. Per design section 4, redone at N = 1800.
- Final: 29 files, total 6,144,896 bytes (5.86 MiB), longest edge 1800 px. `manifold.png` stays 1000x700 (source is smaller).
- Legibility cost: very wide sources shrink hard at 1800 px, for example `correctness_by_subcategory.png` 28800x3600 -> 1800x225 and `brute_force.png` 15600x3600 -> 1800x415.

## Tests (R10) and checks

- New `tests/f4p-scripts.test.mjs`: 1 inventory test (24 scripts + `raw_data.py` exist) and 24 per-script tests. Env: `ACADEMIC_FIGURE_NO_TEX=1`, `ACADEMIC_FIGURE_DPI=40`, `PYTHONDONTWRITEBYTECODE=1`. Whole-file skip without python/matplotlib/numpy; per-script skip names the missing module.
- Local result: 22 pass, 3 skipped (`diffusion_swiss_roll.py`, `plot_concept.py`: scipy; `plot_composition.py`: seaborn), 0 fail. dateutil is installed, so `plot_trend.py` runs.
- With the local scipy/seaborn shims on `PYTHONPATH` (not shipped): 25 pass, 0 skipped.
- `tests/reference-paths.test.mjs`: scan scope now includes `references/styles/f4p_*.md`. With no such file yet, the filter adds no file and the test passes (PART 2 adds the docs).
- `node --test skills/academic-research-tools/academic-figure/tests/*.mjs`: 62 tests, 59 pass, 3 skipped, 0 fail. (Node 26 rejects the directory form `tests/` with "Cannot find module"; the glob form is equivalent.)
- `just python-check`: 84 Python files compiled.
- AC1 check: 25/25 files have line 1 with upstream path, `3c181f8`, `CC BY-NC 4.0`.

## Left for PART 2

Steps 5 and 6: 14 `references/styles/f4p_*.md`, `modes/from-data.md` / `modes/from-image.md` tables and display branch, `viz-pitfalls.md` P3, `attribution.md` port table (R6-R9). The fixes listed above are the input for the attribution table.
