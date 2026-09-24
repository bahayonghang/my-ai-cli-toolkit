"""House-style helpers for academic-figure: palettes, presets, export, checks.

This module turns the style, export, and palette rules of this skill into
code. Recipes and the display-tier branch import it. Catalog reproduction
scripts do not import it; they stay self-contained.

The module is original code of this repository (MIT). The display and
compact tiers and ``F4P_PALETTE`` record design facts measured in the
figures4papers scripts (CC BY-NC 4.0, snapshot ``3c181f8``). No
figures4papers code is copied here.

Dependencies: matplotlib and numpy only. The module does not import
``matplotlib.pyplot``, so the caller keeps control of the backend.

Usage
-----
    import sys
    sys.path.insert(0, "<skill-dir>/scripts")
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from figstyle import OKABE_ITO, apply_style, save_figure

    with apply_style("journal", journal={"width_in": 3.5, "font_pt": 8,
                                         "font_family": "Arial"}):
        fig, ax = plt.subplots(layout="constrained")
        ax.plot([0, 1, 2], [0, 1, 4], color=OKABE_ITO[0])
        paths = save_figure(fig, "figs/fig1", formats=("pdf", "png"))

CLI
---
    python "<skill-dir>/scripts/figstyle.py" check-palette "#D55E00" "#009E73"
    python "<skill-dir>/scripts/figstyle.py" check-palette "#D62728" "#2CA02C" --output out.json
"""

from __future__ import annotations

import argparse
import itertools
import json
import sys
from pathlib import Path

import matplotlib as mpl
import numpy as np
from matplotlib import colors as mcolors
from matplotlib import patches as mpatches
from matplotlib import patheffects

__all__ = [
    "OKABE_ITO",
    "NEUTRAL_GRAY",
    "F4P_PALETTE",
    "FONT_FALLBACK",
    "TIERS",
    "SAVE_FORMATS",
    "MIN_DELTA_E",
    "MIN_DELTA_L",
    "StyleContext",
    "apply_style",
    "save_figure",
    "legend_panel",
    "split_legends",
    "label_bars",
    "text_color_for",
    "sci_ticks",
    "simulate_cvd",
    "check_palette",
    "main",
]

# ---------------------------------------------------------------------------
# Palette constants
# ---------------------------------------------------------------------------

# Okabe-Ito categorical set (Wong 2011). The 8th color is black. This list
# must stay equal to the palette section of references/matplotlib-recipes.md.
OKABE_ITO = [
    "#E69F00",  # orange
    "#56B4E9",  # sky blue
    "#009E73",  # bluish green
    "#F0E442",  # yellow
    "#0072B2",  # blue
    "#D55E00",  # vermillion
    "#CC79A7",  # reddish purple
    "#000000",  # black
]

# Neutral color for a ground-truth or reference series. It is not part of the
# categorical set.
NEUTRAL_GRAY = "#999999"

# Semantic roles of the figures4papers palette. Each hex value occurs in at
# least one figures4papers ``figure_*/*.py`` script at snapshot 3c181f8.
F4P_PALETTE = {
    # Proposed or key method (dark blue first).
    "proposed": ["#0F4D92", "#3775BA"],
    # Related positive results or incremental gains (light to dark green).
    "improvement": ["#DDF3DE", "#AADCA9", "#8BCF8B"],
    # Alternatives and comparators (light to dark red).
    "baseline": ["#F6CFCB", "#E9A6A1", "#B64342"],
    # Background categories and supporting series (light to dark gray).
    "neutral": ["#CFCECE", "#767676", "#4D4D4D", "#272727"],
    # Sparse accents: gold, magenta, teal, violet.
    "highlight": ["#FFD700", "#EA84DD", "#42949E", "#9A4D8E"],
}

# ---------------------------------------------------------------------------
# Style presets
# ---------------------------------------------------------------------------

FONT_FALLBACK = ["Helvetica", "Arial", "DejaVu Sans"]

# rcParams that every tier sets.
_COMMON_RC = {
    "font.family": "sans-serif",
    "font.sans-serif": FONT_FALLBACK,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "legend.frameon": False,
    # Embed TrueType fonts so the text stays editable in PDF and PS.
    "pdf.fonttype": 42,
    "ps.fonttype": 42,
    # Keep SVG text as text, not as paths.
    "svg.fonttype": "none",
}

# Tier-specific rcParams. The display values match the large figures4papers
# panels (24 pt, axis line width 3); the compact values match its compact
# panels (15-16 pt, width 2).
TIERS = {
    "display": {"font.size": 24, "axes.linewidth": 3},
    "compact": {"font.size": 16, "axes.linewidth": 2},
}

_JOURNAL_KEYS = ("width_in", "font_pt", "font_family")


class StyleContext:
    """Apply rcParams now and restore the saved rcParams on exit.

    The preset takes effect in ``__init__``, so a caller can use the object
    with or without a ``with`` statement. Call ``restore()`` to undo the
    preset without a ``with`` statement.
    """

    def __init__(self, rc: dict):
        saved = dict(mpl.rcParams.copy())
        # Do not revert the backend. The same rule applies in rc_context.
        saved.pop("backend", None)
        self._saved = saved
        self.rc = dict(rc)
        mpl.rcParams.update(self.rc)

    def restore(self) -> None:
        update_raw = getattr(mpl.rcParams, "_update_raw", None)
        if update_raw is not None:
            update_raw(self._saved)
        else:
            dict.update(mpl.rcParams, self._saved)

    def __enter__(self) -> "StyleContext":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.restore()


def _journal_rc(journal: dict | None) -> dict:
    if not isinstance(journal, dict):
        raise ValueError(
            "tier 'journal' needs journal={'width_in': ..., 'font_pt': ..., "
            "'font_family': ...} with values from the journal card"
        )
    missing = [k for k in _JOURNAL_KEYS if k not in journal]
    if missing:
        raise ValueError(f"journal is missing keys: {', '.join(missing)}")
    width = float(journal["width_in"])
    # The default canvas ratio is 16:9 (references/layout-defaults.md).
    height = float(journal.get("height_in", width * 9 / 16))
    family = journal["font_family"]
    families = [family] if isinstance(family, str) else list(family)
    return {
        "figure.figsize": (width, height),
        "font.size": float(journal["font_pt"]),
        # The named card fonts come first. The generic family resolves to
        # FONT_FALLBACK when a card font is not installed.
        "font.family": [*families, "sans-serif"],
    }


def apply_style(tier: str, *, journal: dict | None = None) -> StyleContext:
    """Apply a style tier and return a context that restores rcParams.

    ``tier`` is ``"display"`` (posters, slides, README), ``"compact"``
    (compact display panels), or ``"journal"``. The journal tier needs a
    ``journal`` dict with the keys ``width_in``, ``font_pt``, and
    ``font_family`` (a name or a list of names). The optional key
    ``height_in`` sets the canvas height. Take the values from the card in
    ``references/journal-specs.md``; this module does not parse that file.
    """
    rc = dict(_COMMON_RC)
    if tier in TIERS:
        if journal is not None:
            raise ValueError(f"tier {tier!r} does not accept a journal card")
        rc.update(TIERS[tier])
    elif tier == "journal":
        rc.update(_journal_rc(journal))
    else:
        known = ", ".join([*TIERS, "journal"])
        raise ValueError(f"unknown tier {tier!r}; use one of: {known}")
    return StyleContext(rc)


# ---------------------------------------------------------------------------
# Export contract
# ---------------------------------------------------------------------------

SAVE_FORMATS = ("pdf", "svg", "eps", "png", "jpg", "jpeg", "tif", "tiff")


def save_figure(
    fig,
    base_path,
    formats=("pdf", "png"),
    dpi: int = 300,
    *,
    match_width: bool = True,
) -> list[Path]:
    """Write ``fig`` once per format and return the written paths.

    ``base_path`` is the output path without an extension. A trailing
    extension from the whitelist is removed first. The function creates the
    parent directory. It checks every format before it writes a file; a
    format outside ``SAVE_FORMATS`` raises ``ValueError``.

    ``match_width=True`` (journal figures) saves the full canvas, so the
    exported width equals the ``figsize`` width. Use ``layout="constrained"``
    to keep the labels inside the canvas. ``match_width=False`` (display
    figures) crops to the drawn content with ``bbox_inches="tight"``.
    """
    if isinstance(formats, str):
        formats = (formats,)
    fmts = [str(f).lower().lstrip(".") for f in formats]
    if not fmts:
        raise ValueError("formats must name at least one format")
    bad = [f for f in fmts if f not in SAVE_FORMATS]
    if bad:
        raise ValueError(
            f"unsupported format(s): {', '.join(bad)}; "
            f"allowed: {', '.join(SAVE_FORMATS)}"
        )

    base = Path(base_path)
    if base.suffix.lower().lstrip(".") in SAVE_FORMATS:
        base = base.with_suffix("")
    base.parent.mkdir(parents=True, exist_ok=True)

    written: list[Path] = []
    for fmt in dict.fromkeys(fmts):
        out = base.parent / f"{base.name}.{fmt}"
        if match_width:
            # A preset can set savefig.bbox to "tight". Override it so the
            # canvas is not cropped.
            with mpl.rc_context({"savefig.bbox": "standard"}):
                fig.savefig(out, format=fmt, dpi=dpi)
        else:
            fig.savefig(out, format=fmt, dpi=dpi, bbox_inches="tight", pad_inches=0.02)
        written.append(out)
    return written


# ---------------------------------------------------------------------------
# Layout and annotation helpers
# ---------------------------------------------------------------------------

STROKE_LINEWIDTH = 3.0


def legend_panel(ax, handles, labels, **kw):
    """Turn ``ax`` into a legend-only panel and return the legend."""
    ax.set_axis_off()
    kw.setdefault("loc", "center")
    kw.setdefault("frameon", False)
    return ax.legend(handles, labels, **kw)


def split_legends(
    ax_color,
    ax_hatch,
    colors,
    color_labels,
    hatches,
    hatch_labels,
    *,
    edgecolor="black",
    **kw,
):
    """Draw a color legend and a hatch legend from proxy bars.

    The color legend uses filled proxy bars with no hatch. The hatch legend
    uses white proxy bars with one hatch each. Extra keywords go to both
    legends. Return ``(color_legend, hatch_legend)``.
    """
    color_handles = [mpatches.Patch(facecolor=c, edgecolor=edgecolor) for c in colors]
    hatch_handles = [
        mpatches.Patch(facecolor="white", edgecolor=edgecolor, hatch=h) for h in hatches
    ]
    color_legend = legend_panel(ax_color, color_handles, list(color_labels), **kw)
    if ax_hatch is ax_color:
        # A second legend call replaces the first one on the same axes.
        ax_color.add_artist(color_legend)
    hatch_legend = legend_panel(ax_hatch, hatch_handles, list(hatch_labels), **kw)
    return color_legend, hatch_legend


def label_bars(
    ax,
    bars,
    fmt="{:.2f}",
    *,
    stroke: bool = True,
    stroke_color=None,
    stroke_width: float = STROKE_LINEWIDTH,
    **kw,
):
    """Write the value of each bar next to the bar and return the texts.

    ``fmt`` is a format string or a callable, as in ``Axes.bar_label``.
    ``stroke=True`` draws an outline around each label. The outline color
    defaults to the contrast color of the text color (see
    ``text_color_for``). Extra keywords go to ``Axes.bar_label``.
    """
    texts = ax.bar_label(bars, fmt=fmt, **kw)
    if stroke:
        for text in texts:
            outline = stroke_color or text_color_for(text.get_color())
            text.set_path_effects(
                [
                    patheffects.Stroke(linewidth=stroke_width, foreground=outline),
                    patheffects.Normal(),
                ]
            )
    return texts


def _relative_luminance(color) -> float:
    lin = _srgb_to_linear(np.array(mcolors.to_rgb(color)))
    return float(lin @ np.array([0.2126, 0.7152, 0.0722]))


def text_color_for(bg) -> str:
    """Return ``"black"`` or ``"white"``, whichever contrasts more with ``bg``.

    ``bg`` is any matplotlib color, for example ``"#0F4D92"``. The test uses
    the WCAG relative luminance and contrast ratio.
    """
    lum = _relative_luminance(bg)
    contrast_black = (lum + 0.05) / 0.05
    contrast_white = 1.05 / (lum + 0.05)
    return "black" if contrast_black >= contrast_white else "white"


def sci_ticks(ax, axis: str = "y", *, limits=(0, 0)):
    """Show the tick labels of ``axis`` in scientific notation."""
    ax.ticklabel_format(axis=axis, style="sci", scilimits=limits, useMathText=True)


# ---------------------------------------------------------------------------
# Palette check
# ---------------------------------------------------------------------------

# Warning thresholds. These are empirical defaults of this module, not
# journal rules. A pair below MIN_DELTA_E (CIELAB delta E 1976) is hard to
# tell apart. A pair below MIN_DELTA_L (CIELAB L*) merges in grayscale.
MIN_DELTA_E = 10.0
MIN_DELTA_L = 15.0

# Machado, Oliveira, and Fernandes (2009), severity 1.0. The matrices act on
# linear RGB.
_CVD_MATRICES = {
    "protanopia": np.array(
        [
            [0.152286, 1.052583, -0.204868],
            [0.114503, 0.786281, 0.099216],
            [-0.003882, -0.048116, 1.051998],
        ]
    ),
    "deuteranopia": np.array(
        [
            [0.367322, 0.860646, -0.227968],
            [0.280085, 0.672501, 0.047413],
            [-0.011820, 0.042940, 0.968881],
        ]
    ),
    "tritanopia": np.array(
        [
            [1.255528, -0.076749, -0.178779],
            [-0.078411, 0.930809, 0.147602],
            [0.004733, 0.691367, 0.303900],
        ]
    ),
}

# Linear sRGB to CIE XYZ, D65 white point.
_RGB_TO_XYZ = np.array(
    [
        [0.4124564, 0.3575761, 0.1804375],
        [0.2126729, 0.7151522, 0.0721750],
        [0.0193339, 0.1191920, 0.9503041],
    ]
)
_D65_WHITE = np.array([0.95047, 1.0, 1.08883])


def _srgb_to_linear(c: np.ndarray) -> np.ndarray:
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def _linear_to_srgb(c: np.ndarray) -> np.ndarray:
    c = np.clip(c, 0.0, 1.0)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)


def _linear_to_lab(lin: np.ndarray) -> np.ndarray:
    t = (_RGB_TO_XYZ @ lin) / _D65_WHITE
    eps = (6 / 29) ** 3
    f = np.where(t > eps, np.cbrt(t), t / (3 * (6 / 29) ** 2) + 4 / 29)
    return np.array([116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])])


def simulate_cvd(rgb, kind: str) -> np.ndarray:
    """Return the sRGB color (0-1) that a dichromat of ``kind`` sees.

    ``rgb`` is any matplotlib color or an sRGB triple in 0-1. ``kind`` is
    ``"deuteranopia"``, ``"protanopia"``, or ``"tritanopia"``.
    """
    if kind not in _CVD_MATRICES:
        raise ValueError(
            f"unknown kind {kind!r}; use one of: {', '.join(_CVD_MATRICES)}"
        )
    lin = _srgb_to_linear(np.array(mcolors.to_rgb(rgb), dtype=float))
    return _linear_to_srgb(_CVD_MATRICES[kind] @ lin)


def _min_pair(values: list, labels: list[str], dist) -> tuple[float, list[str]]:
    best = None
    pair: list[str] = []
    for (i, a), (j, b) in itertools.combinations(enumerate(values), 2):
        d = float(dist(a, b))
        if best is None or d < best:
            best, pair = d, [labels[i], labels[j]]
    return round(best, 2), pair


def check_palette(
    colors,
    *,
    min_delta_e: float = MIN_DELTA_E,
    min_delta_l: float = MIN_DELTA_L,
) -> dict:
    """Report the smallest pairwise color difference per vision condition.

    For normal vision and for simulated deuteranopia, protanopia, and
    tritanopia, the function reports the smallest CIELAB delta E over all
    color pairs and the pair that gives it. A condition below
    ``min_delta_e`` gets ``WARN``. ``verdict`` is ``WARN`` when one or more
    of these four conditions warns.

    The grayscale check reports the smallest L* gap. It has its own
    ``grayscale_verdict``, because a figure can also separate series in
    grayscale by marker, line style, or hatch. When ``grayscale_verdict`` is
    ``WARN``, add one of those encodings.
    """
    labels = [mcolors.to_hex(c).upper() for c in colors]
    if len(labels) < 2:
        raise ValueError("check_palette needs two or more colors")
    lin = [_srgb_to_linear(np.array(mcolors.to_rgb(c), dtype=float)) for c in colors]

    def delta_e(a, b):
        return np.linalg.norm(a - b)

    conditions = {}
    labs = [_linear_to_lab(x) for x in lin]
    variants = {"normal": labs}
    for kind, matrix in _CVD_MATRICES.items():
        variants[kind] = [_linear_to_lab(np.clip(matrix @ x, 0.0, 1.0)) for x in lin]
    for name, values in variants.items():
        value, pair = _min_pair(values, labels, delta_e)
        conditions[name] = {
            "min_delta_e": value,
            "pair": pair,
            "verdict": "PASS" if value >= min_delta_e else "WARN",
        }

    lightness = [lab[0] for lab in labs]
    gray_value, gray_pair = _min_pair(lightness, labels, lambda a, b: abs(a - b))
    grayscale = {
        "min_delta_l": gray_value,
        "pair": gray_pair,
        "verdict": "PASS" if gray_value >= min_delta_l else "WARN",
    }

    verdict = "PASS"
    if any(c["verdict"] == "WARN" for c in conditions.values()):
        verdict = "WARN"
    return {
        "colors": labels,
        "thresholds": {"min_delta_e": min_delta_e, "min_delta_l": min_delta_l},
        "conditions": conditions,
        "grayscale": grayscale,
        "verdict": verdict,
        "grayscale_verdict": grayscale["verdict"],
    }


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def _color_arg(value: str) -> str:
    if not mcolors.is_color_like(value):
        raise argparse.ArgumentTypeError(f"not a color: {value!r}")
    return value


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        prog="figstyle.py",
        description="academic-figure house-style helpers.",
    )
    sub = parser.add_subparsers(dest="command", metavar="command")
    p_check = sub.add_parser(
        "check-palette",
        help="report color differences under normal vision, simulated "
        "color-vision deficiency, and grayscale as JSON",
    )
    p_check.add_argument(
        "colors",
        nargs="+",
        type=_color_arg,
        help="two or more colors, for example '#D55E00'",
    )
    p_check.add_argument(
        "--min-delta-e",
        type=float,
        default=MIN_DELTA_E,
        help=f"delta E warning threshold (default {MIN_DELTA_E})",
    )
    p_check.add_argument(
        "--min-delta-l",
        type=float,
        default=MIN_DELTA_L,
        help=f"grayscale L* warning threshold (default {MIN_DELTA_L})",
    )
    p_check.add_argument(
        "--output",
        metavar="OUT.json",
        help="also write the JSON report to this file (UTF-8, LF)",
    )
    args = parser.parse_args(argv)

    if args.command != "check-palette":
        parser.print_help()
        return 2
    if len(args.colors) < 2:
        p_check.error("check-palette needs two or more colors")

    report = check_palette(
        args.colors, min_delta_e=args.min_delta_e, min_delta_l=args.min_delta_l
    )
    text = json.dumps(report, indent=2) + "\n"
    if args.output:
        out = Path(args.output)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding="utf-8", newline="\n")
    sys.stdout.write(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
