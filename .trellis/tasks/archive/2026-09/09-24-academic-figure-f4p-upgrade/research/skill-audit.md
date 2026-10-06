# Research: academic-figure 1.2.0 audit (defects and missing functions)

- **Query**: Audit `skills/academic-research-tools/academic-figure` (version 1.2.0) for defects and missing functions: structure, internal consistency, script health, functional gaps, docs impact.
- **Scope**: internal (plus the local reference clone `ref/repo/figures4papers`)
- **Date**: 2026-09-24

All paths below are relative to `skills/academic-research-tools/academic-figure/` unless they start with `ref/`, `docs/`, `scripts/check.py`, `code_map.md`, or `.trellis/`.

Severity scale: **high** = the skill gives a wrong fact or a documented path gives wrong output; **medium** = two files disagree, or a documented function is missing; **low** = cosmetic, drift risk, or a small usability defect.

## Environment used for the checks

| Item                                                                                  | Value                                                                                                          |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Python                                                                                | 3.14.7                                                                                                         |
| matplotlib                                                                            | 3.11.2, default backend `tkagg`                                                                                |
| numpy                                                                                 | 2.5.3                                                                                                          |
| scipy                                                                                 | not installed                                                                                                  |
| LaTeX                                                                                 | TeX Live 2025 (`latex`, `pdflatex`, `dvipng` on PATH); `gs` not on PATH                                        |
| Fonts found by matplotlib                                                             | `Times New Roman`, `Arial`, `DejaVu Sans`, `DejaVu Serif`, `STIXGeneral`, `cmr10`, `SimHei`, `Microsoft YaHei` |
| Fonts not found                                                                       | `Computer Modern Roman`, `STIX Two Text`, `Palatino`, `Helvetica`, `Noto Sans CJK SC`                          |
| `PYTHONUTF8=1 python scripts/check.py skills/academic-research-tools/academic-figure` | `[OK]`, exit 0 (the `just skills-check` recipe is `scripts/check.py skills`, `justfile:70-71`)                 |

---

## Structure

### S1 (low) Frontmatter matches the repo rule; no defect

- Evidence: `SKILL.md:1-38`. Keys are `name`, `description`, `category`, `tags`, `version` (top-level form required by `AGENTS.md` "Coding Style"). `category: academic-research-tools` matches the directory. Description length is 858 characters (limit 1024 in `scripts/check.py:190-199`). 16 tags. `check.py` reports `[OK]` with no warnings.
- Proposed fix: none. When the version changes, keep the same five keys.

### S2 (low) `agents/interface.yaml` is aligned with SKILL.md, with two small gaps

- Evidence: `agents/interface.yaml:4` names all four modes and the journal-card audit. `agents/interface.yaml:25` states `network: "none"`, but `references/agent-figure-gallery-integration.md:39` and `:115-116` start a local HTTP server on `127.0.0.1:8765`, and plotly export needs a local Chrome (`references/plotly-recipes.md:106-111`). `agents/interface.yaml:28` (`no_latex`) repeats the fallback that A12 shows to be broken.
- Proposed fix: state `network: "loopback only (optional AgentFigureGallery UI)"` or equivalent; change the `no_latex` text after A12 is fixed.

### S3 (low) No README

- Evidence: the skill directory holds `SKILL.md`, `agents/`, `assets/`, `evals/`, `references/`, `scripts/`, `tests/` only. Other skills in the category ship a `README.md`; the repo rules in `AGENTS.md` do not require one.
- Proposed fix: optional. Add a README only if the task scope asks for public-facing docs.

### S4 (medium) `evals/evals.json` covers four modes and five route-away cases, but misses several boundaries

- Evidence: `evals/evals.json` holds 26 cases (`skill_name: academic-figure`).
  - journal-spec: ids 1-6, 16, 17, 20, 24, 25, 26.
  - from-data: ids 7, 8, 9. from-image: ids 10, 11. advise: ids 18, 19.
  - Integrations: id 21 (pubfig), id 22 (AgentFigureGallery).
  - Route away: id 12 (literature-mentor), 13 (paper-workbench), 14 (BI dashboard), 15 (image generation), 23 (exploratory plotting).
- Missing cases:
  1. SKILL.md conflict rule 2 (`SKILL.md:60-61`, exact mimicry and journal compliance both explicit, ask once). Id 17 tests rule 1 only.
  2. advise hand-off to from-data (`references/modes/advise.md:71`). Ids 18 and 19 test only the default path.
  3. Poster or slide (display tier, `references/design-theory.md:8-12`). No case.
  4. Science or Cell target (snapshot cards, `references/journal-specs.md:244-292`). No case.
  5. plotly figure through the visual review loop (see A16).
  6. A from-data request with a data shape that the catalog cannot hold (template reuse ladder "Build anew", `references/modes/from-data.md:47-52`).
- Proposed fix: add one case per missing item, with the same `prompt` / `expected_output` / `files` / `assertions` keys.

### S5 (low) No `evals/trigger_cases.json`

- Evidence: `find skills -path '*evals*' -name '*trigger*'` finds 6 files across the repo (for example `skills/developer-tools-integrations/storage-analyzer/evals/trigger_cases.json`, keys `note`, `recommended_threshold`, `description_required_concepts`, `positive_concepts`, `negative_patterns`, `should_trigger`). 33 skills have `evals.json`; the trigger file is optional in this repo.
- Proposed fix: optional. If added, draw `should_trigger` from ids 1-11, 16-22, 24-26 and `negative_patterns` from ids 12-15, 23.

### S6 (medium) The three tests cover only the three utility scripts

- Evidence:
  - `tests/pref-script.test.mjs:52-100` (5 tests): set/get round trip for both keys, get on an unset key, clear, invalid value rejected, `ACADEMIC_FIGURE_CONFIG` override for `path`.
  - `tests/audit-pdf-text.test.mjs:65-127` (7 tests): missing file, non-PDF, text above floor passes, text below floor exits 1, `--json` output, PDF with no text runs, non-positive `--min-pt` rejected.
  - `tests/visual-qa.test.mjs:71-176` (6 tests, skipped when matplotlib is missing): `--help`, `demo` writes a preview, `audit_layout` on a clean figure, y-headroom warning, plot-box crowding warning, preview of a missing file exits non-zero.
- Not covered: none of the 9 figure scripts (`bar_memevolve.py`, `bar_spice.py`, `classwise_iou_table.py`, `line_aime.py`, `line_loss_inset.py`, `line_selfdistill.py`, `radar_dora.py`, `scatter_break.py`, `scatter_tsne.py`) is run by a test; no test checks that the paths cited in `references/` exist; no test checks the style-to-script map.
- Proposed fix: add a smoke test that runs each figure script into a temp dir with `MPLBACKEND=Agg`, skips the 4 usetex scripts when `latex` is absent and `scatter_break.py` when scipy is absent, and asserts the output PNG exists. Add a path-existence test for the backtick paths in `SKILL.md` and `references/modes/*.md`.

---

## Consistency defects

### A1 (high) figures4papers license record is stale

- Evidence:
  - `references/attribution.md:12`: figures4papers row says License **None**, snapshot `6790a93`, 2026-08-06.
  - `references/attribution.md:22-29`: "carry no LICENSE file ... no redistribution right is granted".
  - `references/design-theory.md:3-6`: "HEAD `6790a93` ... ships **no LICENSE file**".
  - `references/panel-layout-patterns.md:9-11`: "HEAD `6790a93`, no LICENSE".
  - Local clone: `ref/repo/figures4papers` HEAD is `3c181f8` "Create LICENSE", 2026-09-06; `LICENSE:1` reads `Attribution-NonCommercial 4.0 International`. `git diff --stat 6790a93 HEAD` shows only `LICENSE` (+407) and `README.md` (+1/-2, a badge removal and a name suffix). No script or reference changed.
  - This repository is MIT (`LICENSE:1`).
- Proposed fix: set the row to CC BY-NC 4.0, snapshot `3c181f8`, 2026-09-06; rewrite the "Projects without a license" section so it covers only `paper-plot-skills`; add a figures4papers section that states the NonCommercial term, that only facts are kept, and that code or images must not be copied into this MIT repository. Update the same claim in `design-theory.md:3-6` and `panel-layout-patterns.md:9-11`.

### A2 (medium) Indirect figures4papers content is not attributed

- Evidence: `references/chart-recipes.md:306-307` says the cross-cutting patterns (alpha-gradient ablation, hatch, brightness-aware text, lines 309-330) come from nature-figure's `design-theory.md` and `common-patterns.md`. The upstream file `ref/repo/nature-skills/skills/nature-figure/references/design-theory.md:3` reads "Derived from scripts in the figures4papers repository". The figures4papers row in `references/attribution.md:12` lists only `design-theory.md`; it does not list `panel-layout-patterns.md` (which cites figures4papers at `:9-11`) or `chart-recipes.md:304-330`.
- Proposed fix: list all three files in the figures4papers row, and state in `chart-recipes.md:306` that the patterns trace back to figures4papers.

### A3 (medium) `attribution.md` claims content that `qa-checklist.md` does not hold

- Evidence: `references/attribution.md:16` says the K-Dense contribution includes "the WCAG and greyscale criteria, and the provenance fields in `qa-checklist.md`". A search of `references/*.md` for `WCAG`, `contrast ratio`, and provenance fields finds none in `qa-checklist.md`. Provenance appears only as row M7 in `references/viz-pitfalls.md:65`.
- Proposed fix: either add the WCAG contrast criterion and the provenance fields to `qa-checklist.md`, or correct the attribution sentence.

### A4 (medium) Stale pointers to an unshipped task research report

- Evidence: `references/journal-specs.md:7-8`, `:208-209`, `:227`; `references/matplotlib-recipes.md:9-10`, `:327`; `references/plotly-recipes.md:8`, `:182`; `references/industrytslib-integration.md:10` cite "this task's research report `research/journal-specs-and-tooling.md`" or `research/industrytslib-viz-inventory.md`. Neither file ships with the skill. The report exists only in `.trellis/tasks/archive/2026-07/07-09-academic-figure-skill/`.
- Proposed fix: replace "this task's research report" with a neutral provenance line (for example "research of 2026-07, sources listed below") and keep the source URL lists.

### A5 (low) Stale step number

- Evidence: `references/journal-specs.md:3` says "journal-style axis (SKILL.md step 2)". SKILL.md has no numbered steps now; the journal-style axis is step 3 of `references/modes/journal-spec.md:18-23`.
- Proposed fix: point to `modes/journal-spec.md` step 3.

### A6 (medium) `bbox_inches="tight"` rule contradicts the default export code

- Evidence:
  - Rule: `references/qa-checklist.md:29` (width must match the card), `:155-157` ("Do not use it when the width must match the card exactly"), `references/matplotlib-recipes.md:200-203`.
  - Code that breaks the rule by default: `references/matplotlib-recipes.md:73`, `:90`, `:107` (all three presets set `savefig.bbox: "tight"`); `references/qa-checklist.md:126-129` (every export line uses `bbox_inches="tight"`); `references/chart-recipes.md:49, 80, 107, 132, 159, 185, 212, 241, 270` (every recipe).
  - Result: an agent that copies the recipe exports a file narrower than the card and then fails the "Final size" row of the same checklist.
- Proposed fix: remove `savefig.bbox` from the presets, drop `bbox_inches="tight"` from the recipe and checklist export lines, and use `layout="constrained"` in every recipe `plt.subplots(...)` call. Keep one sentence that `tight` is allowed only when the width does not need to match.

### A7 (medium) `tight_layout` versus `constrained` layout

- Evidence: `references/matplotlib-recipes.md:197-199` ("`fig.tight_layout()` switches constrained layout off. Do not call both."), `references/layout-defaults.md:41` (uses `layout="constrained"`). `references/design-theory.md:100-101` requires "padded `tight_layout`" in the export contract. `references/chart-recipes.md:269` calls `fig.tight_layout()` and then `bbox_inches="tight"`. No recipe in `chart-recipes.md` uses `layout="constrained"`.
- Proposed fix: make `layout="constrained"` the single rule for journal figures; restrict `tight_layout` in `design-theory.md` to display-tier figures, or change it to constrained layout too.

### A8 (medium) Okabe-Ito 8th color differs between files

- Evidence: `references/matplotlib-recipes.md:65-66` and `references/plotly-recipes.md:13-14` (via `:26-27` of that file) and `:174` use `#000000` as the 8th color. `references/matplotlib-recipes.md:291-298` lists `#999999` gray as the 8th and black as "alternate". `references/chart-recipes.md:69-74`, `:207`, `:265` use `OKABE_ITO[7]` as a "neutral" ground-truth color, which is black in one list and gray in the other. The published Okabe-Ito set (Wong 2011, cited at `references/journal-specs.md:202`) includes black, not `#999999`.
- Proposed fix: define one canonical list (black included) in one place; name a separate `NEUTRAL_GRAY` constant for the ground-truth role.

### A9 (medium) "Keep categorical colors close in lightness" contradicts the grayscale rules

- Evidence: `references/matplotlib-recipes.md:310-312` says "keep categorical colors close in lightness". `references/journal-specs.md:82` (IEEE: "contrast in both hue and lightness, readable in grayscale"), `references/qa-checklist.md:36` and `:158-161` (every series separable in grayscale), and `references/design-theory.md:60-61` (vary lightness inside one hue) require lightness differences.
- Proposed fix: replace the phrase with "separate categorical colors in lightness so the grayscale copy stays separable".

### A10 (medium) GAN recipe uses a dual y axis, which pitfall P2 intercepts

- Evidence: `references/chart-recipes.md:174-175` ("GAN G/D uses a second y axis via `ax.twinx()`"). `references/viz-pitfalls.md:32` (P2 Dual y axis, "stack two panels on a shared x axis") and `references/layout-defaults.md:99` ("Still intercept P2").
- Proposed fix: change the GAN guidance to two stacked panels with `sharex=True`, or state that the P2 interception runs first.

### A11 (medium) plotly font size is in pixels, but the template treats it as points

- Evidence: `references/plotly-recipes.md:30-34` sets `size=9` / `size=7` with the comment "~9-10 pt". `references/plotly-recipes.md:66-67` sizes `width` to `round(width_mm / 25.4 * dpi)` (for example 1050 px for IEEE single column at 300 dpi) and exports with `scale=1`. plotly `font.size` is in layout pixels, so 9 px on a 1050 px canvas that maps to 3.5 in is 9/300 in, about 2.2 pt at final size, below every card floor (5-6 pt). `references/chart-recipes.md:60` and the other plotly skeletons pass `size=FONT_PT` into the same layout.
- Proposed fix: define the canvas in logical pixels at 72 px per inch (or 96, after it is confirmed) and scale with `scale = DPI / 72`, or convert `FONT_PT` to pixels with `FONT_PT * DPI / 72` when the canvas is sized at DPI. Document one rule and fix `plotly-recipes.md:15-67` and the table at `:53-59`.

### A12 (high) The documented no-LaTeX fallback prints raw TeX markup

- Evidence: `references/modes/from-data.md:78-80` and `agents/interface.yaml:28` say: if LaTeX is missing, set `text.usetex` to `False`. The four usetex scripts use TeX-only markup: `scripts/bar_spice.py:96` (`r'Accuracy (\%)'`), `scripts/line_selfdistill.py:64`, `:130` (`\textbf{SDPO}`), `:145` (`\textit{Accuracy}`), `scripts/scatter_tsne.py:72`, `:85-89` (`\textbf{...}`). Test run: a copy of `scatter_tsne.py` with `'text.usetex': False` exited 0 and wrote a PNG whose title, axis labels, and all seven annotation boxes read literally `\textbf{...}` (checked by reading the PNG). `visual_qa.audit_layout` would not flag it, because no glyph is missing.
  - The serif fallback lists in those scripts (`bar_spice.py:23`, `line_loss_inset.py:18`, `line_selfdistill.py:23`, `scatter_tsne.py:15`) start with `Computer Modern Roman` and `STIX Two Text`. Neither is a font that matplotlib found on this Windows machine, so the no-LaTeX output falls back to `DejaVu Serif`, not a Computer Modern look. matplotlib ships `cmr10` and `STIXGeneral`.
- Proposed fix: give each usetex script a `USE_TEX` switch that also swaps the label strings (for example `\textbf{X}` to `fontweight="bold"`, `\%` to `%`), and set the no-TeX fallback to `mathtext.fontset = "cm"` with `font.serif = ["cmr10", "STIXGeneral", "DejaVu Serif"]` and `axes.formatter.use_mathtext = True`. Update `from-data.md:78-80` and `interface.yaml:28`.

### A13 (low) Style document font differs from its script

- Evidence: `references/styles/bar_paired_delta.md:50-51` lists `['Palatino', 'Times New Roman', 'DejaVu Serif']`; the matching script `scripts/bar_memevolve.py:20-22` uses `['STIXGeneral', 'DejaVu Serif', 'Times New Roman']` plus `mathtext.fontset: 'stix'`. Palatino is absent on this machine.
- Proposed fix: make the style document match the script.

### A14 (low) Duplicate axis-resolution rule in two files

- Evidence: `references/figure-contract.md:46-60` and `references/modes/journal-spec.md:18-29` state the same journal-style and library resolution order in different words. A future edit to one file can leave the other stale.
- Proposed fix: keep the rule in `modes/journal-spec.md` and make `figure-contract.md` point to it.

### A15 (low) plotly `scale` guidance contradicts itself

- Evidence: `references/plotly-recipes.md:67` and `:115-119` ("export with `scale=1`"); `references/plotly-recipes.md:91` and `references/qa-checklist.md:140` use `scale=2`.
- Proposed fix: after A11 is fixed, use one `scale` rule in both files.

### A16 (medium) The visual review loop is matplotlib-only, but the journal-spec mode applies it to every library

- Evidence: `references/modes/journal-spec.md:41-45` and `references/qa-checklist.md:104-109` require `scripts/visual_qa.py` for every figure. `scripts/visual_qa.py:379-403`: `render_preview` accepts a matplotlib Figure or an existing raster path; `audit_layout` needs a matplotlib Figure. `references/figure-contract.md:60-63` forbids previewing in one library and exporting from another. A plotly figure therefore has no machine audit path.
- Proposed fix: state a plotly branch (export PNG with kaleido, pass the PNG to `render_preview`, skip `audit_layout`, and run the ten perceptual items), or add a plotly audit.

### A17 (low) `qa-checklist.md` Font row is stricter than the IEEE card

- Evidence: `references/qa-checklist.md:33` requires "Times-family serif for IEEE". `references/journal-specs.md:79` lists Times New Roman, Helvetica, Arial, Cambria, Symbol, Courier.
- Proposed fix: say "a font from the card's allowed list; Times family is the preset default for IEEE".

### A18 (low) Nature photo DPI preset versus card

- Evidence: `references/matplotlib-recipes.md:105` sets `savefig.dpi: 300`; `references/journal-specs.md:191` says the research-figure guide asks for 450 dpi or more.
- Proposed fix: add the 450 dpi note to the preset comment.

### Items checked with no defect

- Style-to-script map `references/modes/from-data.md:19-28` matches `scripts/` (8 scripts) and `references/styles/` (8 documents). Each style document names its script and original PNG (`references/styles/*.md:5-6` or the last lines), and every named file exists.
- LaTeX list in `references/modes/from-data.md:78-79` (bar_spice, line_selfdistill, line_loss_inset, scatter_tsne) matches the `'text.usetex': True` lines in those scripts. `scatter_break.py:12` imports scipy, as `from-data.md:77` says.
- Counts in `references/modes/from-image.md:74-75` and `:87-88` (10 originals, 8 style scripts plus `classwise_iou_table.py`) match the files.
- Font-size tiers: `design-theory.md:25-29`, `layout-defaults.md:76-85`, and `visual-review.md:93` agree that 24 pt / 15-16 pt apply only to posters and slides.
- `visual_qa.py` thresholds (`_HEADROOM_WARN_FRAC = 0.08`, plot box 0.68 / 0.58) match `layout-defaults.md:56` and `:73-74`.
- All other backtick paths that fail a local existence check are upstream paths (for example `agentfiguregallery/cli.py`, `src/pubfig/plot_registry.py`) and are labeled as upstream in their files.

---

## Script health

Test method: each script was run as `PYTHONUTF8=1 python <script>.py <tmpdir>/<name>.png` (and two outputs for `line_selfdistill.py`), with no `MPLBACKEND` set. Four usetex scripts were also run from a copy with `'text.usetex': False`.

| Script                    | Backend set before pyplot | Output path from argv                | LaTeX       | scipy       | Fonts (first choice)                    | Run result                                                 |
| ------------------------- | ------------------------- | ------------------------------------ | ----------- | ----------- | --------------------------------------- | ---------------------------------------------------------- |
| `bar_memevolve.py`        | no (`:8`)                 | `argv[1]` (`:107`)                   | no          | no          | STIXGeneral (`:21`)                     | exit 0, PNG written                                        |
| `bar_spice.py`            | no (`:8`)                 | `argv[1]` (`:163`)                   | yes (`:21`) | no          | Computer Modern Roman (`:23`)           | exit 0 with TeX Live                                       |
| `classwise_iou_table.py`  | no (`:9`)                 | `argv[1]` (`:212`)                   | no          | no          | Arial (`:168`), one serif text (`:207`) | exit 0                                                     |
| `line_aime.py`            | no (`:9`)                 | `argv[1]` (`:91`)                    | no (`:15`)  | no          | DejaVu Sans (`:14`)                     | exit 0                                                     |
| `line_loss_inset.py`      | no (`:10`)                | `argv[1]` (`:154`)                   | yes (`:16`) | no          | Computer Modern Roman (`:18`)           | exit 0 with TeX Live                                       |
| `line_selfdistill.py`     | no (`:9`)                 | `argv[1]`, `argv[2]` (`:96`, `:166`) | yes (`:21`) | no          | Computer Modern Roman (`:23`)           | exit 0, two PNGs                                           |
| `radar_dora.py`           | no (`:9`)                 | `argv[1]` (`:148`)                   | no (`:15`)  | no          | DejaVu Sans (`:14`)                     | exit 0                                                     |
| `scatter_break.py`        | no (`:9`)                 | `argv[1]` (`:166`)                   | no (`:17`)  | yes (`:12`) | DejaVu Sans (`:16`)                     | **exit 1**, `ModuleNotFoundError: No module named 'scipy'` |
| `scatter_tsne.py`         | no (`:9`)                 | `argv[1]` (`:130`)                   | yes (`:13`) | no          | Computer Modern Roman (`:15`)           | exit 0 with TeX Live                                       |
| `visual_qa.py`            | no (`:59`)                | CLI `--preview`                      | no          | no          | none                                    | covered by tests                                           |
| `academic_figure_pref.py` | n/a                       | n/a                                  | no          | no          | none                                    | covered by tests                                           |
| `audit_pdf_text.py`       | n/a                       | n/a                                  | no          | no          | none                                    | covered by tests                                           |

### B1 (low) No script selects a non-interactive backend

- Evidence: every figure script imports `matplotlib.pyplot` with no `matplotlib.use("Agg")` (table above). `references/design-theory.md:102-103` requires Agg before the pyplot import in batch runs. On this machine the default backend is `tkagg`, and all scripts still wrote their PNG because they call only `savefig` and `plt.close` (no `plt.show`). A host that sets `MPLBACKEND` to a GUI backend without a display can fail.
- Proposed fix: add `import matplotlib; matplotlib.use("Agg")` before the pyplot import in each script, or document `MPLBACKEND=Agg` in `from-data.md`.

### B2 (low) Success message prints the default filename, not the real output path

- Evidence: `scripts/bar_memevolve.py:110`, `bar_spice.py:166`, `line_aime.py:95`, `line_loss_inset.py:158`, `radar_dora.py:152`, `scatter_tsne.py:134`, `scatter_break.py:170`, `line_selfdistill.py:99`, `:169` print a hard-coded name such as `saved: bar_memevolve_repro.png`. The run with `argv[1]` set to a temp path printed the default name.
- Proposed fix: print the resolved output path.

### B3 (medium) Data substitution leaves hard-coded derived values

- Evidence: `scripts/bar_memevolve.py:36`, `:43` hold gain labels as literal strings (`'+7.1%'`, ...) next to the numbers they describe; `:37`, `:44` hold fixed `ylim` ranges (40-71, 40-76). A user who replaces `baseline` and `method` values keeps stale gain labels and can clip bars outside the range. `references/modes/from-data.md:34-40` does not tell the user to recompute them. The fixed truncated bar baseline also matches pitfall P4 (`references/viz-pitfalls.md:34`); from-data mode does not impose journal QA (`SKILL.md:72`), but the gain label error is a data error.
- Proposed fix: compute the gain labels and the `ylim` from the data in the script, or add both items to the substitution tips.

### B4 (low) Scripts take data only by source edit

- Evidence: `references/modes/from-data.md:12` ("copy the script and replace the data area"). Data lives in module-level literals (`scripts/bar_memevolve.py:31-47`, `scripts/radar_dora.py:18-35`) or in simulated data (`scripts/line_aime.py:18-45`, `scripts/scatter_tsne.py:19`, `scripts/line_loss_inset.py:22-24`). No script reads a CSV or JSON file, and no script exposes a function. The claim at `from-data.md:12` that each script marks its data area with a clear comment is only partly true: `radar_dora.py:18` and `bar_memevolve.py:30` mark it; `line_aime.py:20` and `line_loss_inset.py:24` label it "simulated data".
- Proposed fix: optional. Add an optional `--data file.json` argument, or move the data area into a named block with the same marker in every script.

### B5 (low) `scatter_break.py` needs scipy only for one spline

- Evidence: `scripts/scatter_break.py:12` imports `make_interp_spline` only. scipy is not installed here, and the script exits 1.
- Proposed fix: optional. Fall back to `numpy.interp` (or plain lines) when scipy is missing, and print one warning.

### B6 (low) `visual_qa.py` CLI ignores `--preview` for a raster input

- Evidence: `scripts/visual_qa.py:396-403` returns the input path unchanged for a raster; `:469-471` then prints `preview: <input path>`. The docstring at `:46` shows `visual_qa.py figs/fig1.png --preview out.png`, which suggests that `out.png` is written. It is not.
- Proposed fix: copy or re-save the raster to `out_png`, or change the docstring.

### Fonts on Windows

- `Helvetica` is absent on Windows; every list that names it also names `Arial` or `DejaVu Sans` (`references/matplotlib-recipes.md:92`, `:109`; `scripts/classwise_iou_table.py:168`), so no run failed.
- `Computer Modern Roman`, `STIX Two Text`, and `Palatino` are absent (see A12, A13). With usetex on, LaTeX supplies Computer Modern, so the usetex runs were correct.

---

## Functional gaps

### C1 (medium) No shared house-style helper module

- Evidence: the rcParams presets, palette, and export rules exist only as copy-paste code in `references/matplotlib-recipes.md:60-125`, `references/plotly-recipes.md:24-51`, and the export contract prose in `references/design-theory.md:88-107`. `scripts/` holds 9 figure scripts plus three utilities (`academic_figure_pref.py`, `visual_qa.py`, `audit_pdf_text.py`); none exports a palette, a preset, or a save helper. Each figure script defines its own colors (for example `scripts/bar_memevolve.py:25-28`). For comparison, `ref/repo/figures4papers/scientific-figure-making/references/api.md:9-76` documents `PALETTE`, `apply_publication_style`, `create_subplots`, and `finalize_figure(fig, out_path, formats=None, dpi=300, ...)`. That code is CC BY-NC 4.0 (A1), so it must not be copied; an original helper is needed.
- Proposed fix: add an original `scripts/house_style.py` with the canonical palette (A8), the three journal presets, a display-tier preset, and a `save_figure(fig, base, formats, dpi)` that follows `design-theory.md:93-104` (whitelist, parent dirs, returned paths, no `bbox_inches="tight"` for card widths). Point the recipes at it.

### C2 (medium) from-data catalog holds only the 8 paper-plot-skills styles

- Evidence: `references/modes/from-data.md:19-28` (8 rows; 4 families: bar, line, scatter, radar). No catalog style for heat map, box/violin, strip, stacked composition, or ROC/PR, which `references/chart-selection.md:57-69` recommends. `references/modes/advise.md:71` hands off to from-data only when "the agreed chart matches a named catalog style", so most advise results cannot use from-data.
- Proposed fix: add original catalog styles for the missing families, each with a style document, a script, and a row in the map. Do not copy figures4papers scripts or images (A1).

### C3 (medium) No entry for display-tier (poster, slide, README) figures

- Evidence: `SKILL.md:49-54` has four mode rows, none for a poster or slide. `references/design-theory.md:8-12` scopes itself to "poster, slide, and repository README figures", but only `SKILL.md:96` (resource list), `references/matplotlib-recipes.md:207-211`, and `references/layout-defaults.md:84-85` point to it, and those lines only say "do not apply it to a journal figure". `references/modes/journal-spec.md:35-40` (step 6) does not load it. No eval case covers it (S4).
- Proposed fix: add a routing row (for example a `display` sub-path of journal-spec, or a fifth mode) with its own output contract: display-tier rcParams, PNG plus SVG export, and the same visual review loop.

### C4 (medium) No automated color-vision or grayscale check

- Evidence: `references/matplotlib-recipes.md:312` and `references/plotly-recipes.md:177-178` tell the agent to "simulate deuteranopia/protanopia"; `references/qa-checklist.md:158-161` requires a grayscale copy; `references/visual-review.md:66-67` lists color separability as a manual item. `scripts/visual_qa.py` checks glyphs, clipping, tick overlap, headroom, and plot-box fraction only (`:1-7`, `:151-258`). No script computes a CVD simulation, a grayscale lightness gap, or a WCAG contrast ratio (see also A3).
- Proposed fix: add a palette check (for example `scripts/palette_check.py`) that converts each color to CIELAB, reports the minimum pairwise ΔE under simulated deuteranopia, protanopia, and tritanopia (Machado 2009 matrices), the minimum grayscale lightness gap, and the contrast ratio against white. Add a test and a qa-checklist row.

### C5 (medium) `chart-recipes.md` lacks families that `chart-selection.md` recommends

- Evidence: `references/chart-recipes.md` holds 10 families (`:33` time series, `:65` true vs predicted, `:92` box plot, `:119` histogram distribution, `:146` correlation heat map, `:170` training loss, `:198` interval prediction, `:226` t-SNE/UMAP, `:255` npy batch, `:283` metrics annotation). The following recommendations in `references/chart-selection.md` have no recipe:

| Recommended chart                                 | Where recommended                                | Recipe status                                               |
| ------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------- |
| Bar with error bars, grouped bar                  | `chart-selection.md:37`, `:61`, `:115`           | none; only layout notes in `panel-layout-patterns.md:34-48` |
| Stacked bar, 100% stacked bar (composition)       | `:40`, `:60`, `:68`                              | none                                                        |
| Value-sorted horizontal bar                       | `:60`; also P3 at `viz-pitfalls.md:33`           | none                                                        |
| Strip plot, beeswarm, dot plot                    | `:50`, `:62`                                     | none                                                        |
| Box plot plus overlaid strip                      | `:51`, `:61`, `:119`; P1 at `viz-pitfalls.md:31` | `chart-recipes.md:92-117` draws boxes only, no raw points   |
| Violin                                            | `:37`, `:52`                                     | none                                                        |
| KDE                                               | `:36`, `:59`                                     | none (`:119-144` is histogram only)                         |
| Scatter with fit line, 2D KDE, hexbin             | `:38`, `:53`, `:63`                              | none                                                        |
| Heat map with cell annotation, clustered heat map | `:65-67`                                         | `:146-168` has no cell text; no clustering                  |
| ROC or PR curve, confusion-matrix heat map        | `:69`                                            | none                                                        |
| Pair grid                                         | `:41`, `:65`                                     | none                                                        |
| Spaghetti plot                                    | `:79`                                            | none                                                        |
| Significance bracket                              | `:42`, `:80`; P15 at `viz-pitfalls.md:45`        | none                                                        |
| Radar                                             | from-data catalog only (`from-data.md:28`)       | no journal-spec recipe                                      |

- Proposed fix: add recipes for at least grouped bar with error bars, stacked composition bar, box plus strip, strip/beeswarm, annotated heat map, and ROC/PR. Each recipe should use `layout="constrained"`, no `bbox_inches="tight"` (A6), and the canonical palette (A8).

### C6 (low) Preference script accepts only two libraries and five styles

- Evidence: `scripts/academic_figure_pref.py:12-15` allows `library` in `matplotlib`, `plotly` and `journal_style` in `ieee`, `elsevier`, `nature`, `springer`, `chinese-thesis`. SKILL.md description (`SKILL.md:6-7`) also names seaborn, industrytslib, and pubfig; `references/journal-specs.md:246-249` documents that Science and Cell are snapshot cards, not presets. This is documented behavior.
- Proposed fix: optional. Add `science` and `cell` if the snapshot cards become presets.

---

## Docs impact

### D1 (medium) Metadata or file-count changes require `just docs-sync`

- Evidence:
  - `docs/skills/academic-research-tools/academic-figure.md` and `docs/en/skills/academic-research-tools/academic-figure.md` are generated by `docs/scripts/sync_docs_catalog.py` (header line in each page, `sync_docs_catalog.py:411`).
  - The generated page contains the description split into trigger bullets, the version (`docs/skills/.../academic-figure.md:22`, `1.2.0`), the tags, and a per-directory file count (`:33-40`: agents 1, assets 10, evals 1, references 30, scripts 12, tests 3). `count_files` (`docs/scripts/sync_docs_catalog.py:191-206`) skips `__pycache__`.
  - `docs/skills.md:25` and `docs/en/skills.md:25` list the one-line summary (first sentence of the description). `docs/.vitepress/generated/catalog.mjs:23-24`, `:206-207` hold the sidebar links.
  - `code_map.md:40-41` routes this to `just docs-sync` / `just docs-check`; `justfile:57-66` defines them, and `just ci` runs `docs-check` (`justfile:98`).
- Consequence: a version bump, a description or tag edit, or any added or removed file under `agents/`, `assets/`, `evals/`, `references/`, `scripts/`, or `tests/` changes the generated pages. `just docs-check` then fails until `just docs-sync` runs. Per the repo memory note, `just docs-sync` rewrites every generated page, so commit or stash unrelated work first.
- Proposed fix: after the implementation, run `just docs-sync` once, then `just docs-check` (part of `just ci`).

---

## Caveats / Not Found

- Legal effect of CC BY-NC 4.0 on the rewritten facts was not assessed; this report records only that the "no LICENSE" statement is now false (A1).
- `ref/repo/paper-plot-skills` is not a separate git clone (its `git log` shows the host repo), so the upstream snapshot `cde5e84` could not be re-checked. No LICENSE file was found in the local copy.
- `ref/repo/nature-skills` HEAD is `8990143` (2026-07-07), older than the `7316aff` snapshot that `references/attribution.md:14` records. The A2 evidence comes from that older clone.
- Version claims that need the web (SciencePlots v2.2.2 at `references/matplotlib-recipes.md:29`, Kaleido behavior at `references/plotly-recipes.md:96-111`, journal URLs) were not re-verified.
- The 96 px per inch plotly vector mapping is marked `[missing evidence]` in `references/plotly-recipes.md:69-73`; A11 does not depend on it, because it concerns the raster path.
- `just node-test` was not run, as instructed. The three test files were read only.
- Temporary outputs were written under `C:\Users\lyh\AppData\Local\Temp\tmp.WaRCT6SSRe` and `C:\Users\lyh\AppData\Local\Temp\tmp.XlIPbWrW2w`; nothing in the repository was changed except this file.
