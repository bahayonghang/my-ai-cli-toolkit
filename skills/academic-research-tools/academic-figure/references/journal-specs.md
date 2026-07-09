# Journal Spec Cards

Per-journal figure specifications for the **journal-style axis** (SKILL.md step 2).
Read only the card for the resolved style, then hand its numbers to the matched
library recipe (`matplotlib-recipes.md` / `plotly-recipes.md`).

Every value below is transcribed from this task's research report
`research/journal-specs-and-tooling.md`; each spec table carries a **Source**
column and each card ends with a **Sources** list resolving those names to URLs.
Values the research could not confirm against an official page are kept as
`[missing evidence]` — do not invent a number to fill them. Where the research
found version drift (IEEE font size, Nature column widths), both readings are
listed side by side.

> **Disclaimer (applies to every card).** Journal rules change and vary by
> title. Treat these as safe defaults and confirm against the target journal's
> current _Guide for Authors / artwork_ page before final submission. This is
> most important for **Elsevier**, whose sizing is journal-specific.

---

## IEEE (Transactions / Journals / Magazines / Conferences)

IEEE requirements are near-identical across its journals, conferences, and
magazines (one Author Center source).

| Dimension                    | Spec                                                                                                                                     | Source                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Single-column width          | 3.5 in / 88.9 mm / 21 picas                                                                                                              | Resolution and Size                                 |
| Double-column width          | 7.16 in / 182 mm / 43 picas                                                                                                              | Resolution and Size                                 |
| Max figure height            | 9⅔ in / 58 picas (leave room for the caption)                                                                                            | SPS Electronic Graphics                             |
| Color / grayscale DPI        | > 300 dpi                                                                                                                                | Resolution and Size                                 |
| Black-and-white line-art DPI | > 600 dpi                                                                                                                                | Resolution and Size                                 |
| Color TIFF recommended DPI   | 400 dpi for RGB color TIFF                                                                                                               | Author-Supplied Graphics FAQ                        |
| Low-res fallback pixel width | single ≥ 1050 px, full page ≥ 2150 px                                                                                                    | Magazines                                           |
| Vector formats (preferred)   | PS, EPS, PDF                                                                                                                             | Resolution and Size                                 |
| Raster formats (accepted)    | PNG, TIFF                                                                                                                                | File Formatting                                     |
| JPEG                         | author photos only — **not** for body figures                                                                                            | File Formatting                                     |
| Not accepted                 | VSD, GIF, BMP                                                                                                                            | File Formatting                                     |
| Color mode                   | submit RGB (final is converted to RGB color EPS); submit pure B/W separately                                                             | Author-Supplied Graphics FAQ                        |
| Fonts                        | Times New Roman, Helvetica, Arial, Cambria, Symbol, Courier (from list)                                                                  | Proceedings of the IEEE                             |
| Font size                    | ~**9–10 pt** at full size (current Author Center); older FAQ allows down to **8 pt**                                                     | Improve Your Graphics; Author-Supplied Graphics FAQ |
| Font embedding               | EPS/PS/PDF must embed fonts or convert text to outlines                                                                                  | File Formatting                                     |
| Colorblind accessibility     | avoid red–green; dual-encode with color + shape, thick lines + unique markers, contrast in both hue and lightness, readable in grayscale | Create Graphics (CVD)                               |

**Do not** send users to the IEEE Graphics Analyzer (`graphicsqc.ieee.org`): it
was decommissioned around 2020 and IEEE now checks figures automatically at
submission. Guide users to "self-check against this card + rely on the submission
system's automatic check" instead.

**Sources**

- Resolution and Size: https://journals.ieeeauthorcenter.ieee.org/create-your-ieee-journal-article/create-graphics-for-your-article/resolution-and-size/
- File Formatting: https://journals.ieeeauthorcenter.ieee.org/create-your-ieee-journal-article/create-graphics-for-your-article/file-formatting/
- Create Graphics (CVD accessibility): https://journals.ieeeauthorcenter.ieee.org/create-your-ieee-journal-article/create-graphics-for-your-article/
- Improve Your Graphics (Conferences): https://conferences.ieeeauthorcenter.ieee.org/write-your-paper/improve-your-graphics/
- Magazines – Article Submission Requirements: https://magazines.ieeeauthorcenter.ieee.org/create-your-ieee-magazine-article/article-submission-requirements/
- Proceedings of the IEEE – Figures and Tables: https://proceedingsoftheieee.ieee.org/resources/guidelines-for-figures-and-tables/
- SPS Electronic Graphics: https://signalprocessingsociety.org/publications-resources/guidelines-preparing-electronic-graphics
- Author-Supplied Graphics FAQ (PDF): https://www.telecom.uff.br/pet/petws/downloads/modelos/IEEE_Author_Digital_Toolbox/graphicsfaq.pdf
- Graphics Analyzer decommission notice: https://ieeeshutpages.s3-us-west-2.amazonaws.com/GraphicsAnalyzer/GAshutpage.html

---

## Elsevier

Elsevier splits into a generic artwork spec plus per-journal _Guide for Authors_
overrides; **sizing varies by title — confirm against the target journal.** The
official artwork PDF directly confirms only the font size, resolution, font, and
color-mode rows; the width rows come from secondary sources (cross-checked
Enago / ScholarViz / davila7) and are marked accordingly.

| Dimension                         | Spec                                                                                                   | Source                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| Single-column width               | ~90 mm (≈3.54 in)                                                                                      | Enago / ScholarViz (secondary)              |
| 1.5-column width                  | ~140 mm — commonly cited but **[missing evidence]** on an official page; confirm on the journal's page | (see note)                                  |
| Double-column width               | ~190 mm (≈7.48 in; some secondary sources say 185–190 mm)                                              | Enago / ScholarViz (secondary)              |
| Minimum size                      | often cited as 30 mm **[missing evidence]**                                                            | —                                           |
| Max height                        | ~220–250 mm (varies by journal, verify)                                                                | ScholarViz (secondary)                      |
| Line-art DPI                      | minimum **1000 dpi**                                                                                   | Elsevier Science Author Artwork (official)  |
| Halftone (photo) DPI              | minimum **300 dpi**                                                                                    | Elsevier Science Author Artwork             |
| Combination (line + halftone) DPI | minimum **500 dpi**                                                                                    | Elsevier Science Author Artwork             |
| Preferred raster format           | TIFF (bitmap / grayscale / color)                                                                      | Elsevier Science Author Artwork             |
| Vector formats                    | EPS; PDF also accepted now                                                                             | Elsevier Science Author Artwork; ScholarViz |
| PNG                               | **not accepted** — use TIFF instead                                                                    | ScholarViz (secondary)                      |
| Fonts (allowed, only these)       | Arial, Courier, Helvetica, Symbol, Times                                                               | Elsevier Science Author Artwork             |
| Font size                         | body text **7 pt** at final size; sub/superscripts not below **6 pt** (rule of thumb)                  | Elsevier Science Author Artwork             |
| Color mode                        | default RGB; some Elsevier Health Science titles prefer CMYK                                           | Elsevier Science Author Artwork             |
| EPS preview / embedding           | EPS should carry a 72-dpi 8-bit preview/header; embed fonts                                            | Elsevier Science Author Artwork             |
| Quality check                     | post-submission Artwork Quality Check (AQC) flags non-embedded fonts                                   | ScholarViz (secondary)                      |

> On the width system: 90 mm (single) / 190 mm (double) are secondary-source
> defaults, safe to use as a starting point. **1.5-column = 140 mm** and
> **minimum 30 mm** are common citations but were not confirmed on an official
> page in this research — prompt the user to confirm on the journal's artwork
> page rather than hard-coding them.

**Sources**

- Elsevier Science Author Artwork (official PDF): https://physics.mff.cuni.cz/kfpp/conference/instr/artwork_instructions.pdf
- Elsevier artwork & media instructions (current entry page): https://www.elsevier.com/researcher/author/policies-and-guidelines/artwork-and-media-instructions
- ScholarViz – Elsevier Figure Requirements (secondary): https://scholarviz.com/blog/elsevier-figure-requirements-submission-guide
- Enago – Journal-Specific Artwork Requirements (secondary): https://www.enago.com/articles/journal-artwork-requirements-resolution-pixel-size/
- davila7 journal_requirements.md (secondary): https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/skills/scientific/scientific-visualization/references/journal_requirements.md
- "1.5 / 2-column" concept (Stack Exchange): https://writing.stackexchange.com/questions/21658/

---

## Nature (and sister journals)

Nature emphasizes **editable, layered vector** artwork and has the strictest
accessibility rules (the Wong / Okabe-Ito palette originates from Nature
Methods).

| Dimension                  | Spec                                                                                               | Source                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Single-column width        | **89 mm** (some older guides use an 88/180 mm system)                                              | Final submission; Final Artwork (PDF)         |
| Double-column width        | **183 mm**                                                                                         | Final submission; Final Artwork (PDF)         |
| 1.5-column width           | 120 mm or 136 mm                                                                                   | Final Artwork (PDF)                           |
| Max page depth             | 247 mm (table/page limit ≈ 18 cm × 24 cm)                                                          | Final submission                              |
| Fonts                      | sans-serif, prefer **Helvetica or Arial**, consistent throughout; Courier for amino-acid sequences | Final submission                              |
| Max font size              | 7 pt (body text)                                                                                   | Final Artwork (PDF); Nature Protocols         |
| Min font size              | 5 pt                                                                                               | Final Artwork (PDF); Nature Protocols         |
| Panel labels               | 8 pt bold (a, b, c …)                                                                              | Final Artwork (PDF)                           |
| Optimal print font size    | ~7 pt at full size                                                                                 | Initial/revised submission (PDF)              |
| Vector formats (preferred) | AI, EPS, PDF, PS, SVG — keep editable & layered, do **not** outline text or rasterize              | Final submission; Final Artwork (PDF)         |
| Raster / photo formats     | layered PSD or TIFF; bitmaps also accept PNG/JPG (JPG at max quality)                              | Final submission; Initial submission (PDF)    |
| Photo DPI                  | minimum **300 dpi** (at max used size); online proof output max 450 dpi                            | Final submission; Final guide (PDF)           |
| Color mode                 | **RGB**, 300 dpi or above                                                                          | Initial/revised submission (PDF)              |
| Color accessibility        | avoid red–green and other CVD-unfriendly combinations; Nature Methods recommends Wong/Okabe-Ito    | Research figure guide; Wong 2011 (nmeth.1618) |

> The format rows look contradictory but are not: for **vector line art** Nature
> does **not** accept JPEG/TIFF/PNG (must be AI/EPS/PDF); for **photos/bitmaps**
> it wants PSD/TIFF (300–600 dpi). The deciding question is "is this figure
> vector or bitmap?"

**Sources**

- Final submission (main entry): https://www.nature.com/nature/for-authors/final-submission
- Guide to Preparing Final Artwork (PDF): https://www.nature.com/documents/nature-final-artwork.pdf
- Final guide to authors (PDF): https://www.nature.com/documents/Final_guide_to_authors.pdf
- Initial / revised submissions (PDF): http://www.nature.com/documents/nature_3a_initial_revised_submissions.pdf
- Nature Protocols – Preparing Final Artwork (PDF): https://www.nature.com/documents/nprot-guide-to-preparing-final-artwork.pdf
- Nature research figure guide: https://research-figure-guide.nature.com/
- Wong, "Points of View: Color blindness", Nature Methods (Okabe-Ito): https://www.nature.com/articles/nmeth.1618

---

## Extensions (short)

These two presets are supported but were **not** covered by this task's journal
research (`research/journal-specs-and-tooling.md` documents only IEEE / Elsevier
/ Nature). Numeric specs below are therefore marked `[missing evidence]` against
that corpus; do not fabricate them. When the project uses **industrytslib**, its
built-in `springer` and `chinese_thesis` styles ship concrete values — drive
those through `references/industrytslib-integration.md` rather than copying
numbers here.

### Springer

- Column widths, height, DPI, allowed fonts: **[missing evidence — not in this
  research corpus]**. Confirm against the target Springer journal's _Instructions
  for Authors → figures/artwork_ page.
- If on industrytslib, a `springer` style preset exists (see
  `industrytslib-integration.md`); otherwise fall back to the standalone recipe
  and confirm every number on the journal page before submission.

### chinese-thesis (中文学位论文)

Focus here is **CJK font handling**, which the research _does_ cover (report §5).
The GB / university thesis figure conventions (physical size, 字号/字体 rules)
are institution-specific and **[missing evidence — not in this research
corpus]**; defer to the user's university 学位论文格式规范.

- **CJK font chain (matplotlib):** set `font.sans-serif` to an installed CJK
  family — `SimHei` / `Microsoft YaHei` / `Noto Sans CJK SC` — and set
  `axes.unicode_minus = False` so the Unicode minus (U+2212) does not render as a
  tofu box. Details and the full recipe live in `matplotlib-recipes.md` (CJK
  section). Source: matplotlib Chinese-text guides (see that file).
- The font must be installed and cover the glyphs used (Windows: `C:\Windows\Fonts\`).
- If on industrytslib, a `chinese_thesis` style preset exists (based on a
  university 2024 thesis spec); it uses SimSun and injects a CJK fallback chain —
  see `industrytslib-integration.md`.
