"""Visual QA for a matplotlib figure: render a preview and audit the layout.

This script is the machine layer of the visual review loop in
``references/visual-review.md``. It finds deterministic defects: missing
glyphs, clipped text, and overlapping tick labels. The agent reads the
rendered PNG for perceptual defects: a legend over the data, panel-label
alignment, and grayscale separation. Both layers must pass.

Ported from ``scripts/visual_qa.py`` of scipilot-figure-skill
(https://github.com/Haojae/scipilot-figure-skill), reviewed 2026-08-16.
Changes in this port: all messages are English and ASCII; the PDF preview
branch and its optional PyMuPDF dependency are removed (render the Figure
object before export instead); the demo no longer needs numpy; the fix hints
point to this skill's own references. matplotlib is the only dependency.

MIT License. Copyright (c) 2026 Haojae

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Usage
-----
    from visual_qa import render_preview, audit_layout, print_report

    preview = render_preview(fig, "figs/_preview.png", dpi=150)
    print_report(audit_layout(fig))

CLI
---
    python "<skill-dir>/scripts/visual_qa.py" demo
    python "<skill-dir>/scripts/visual_qa.py" figs/fig1.png --preview out.png
"""

from __future__ import annotations

import argparse
import io
import logging
import os
import sys
import warnings

import matplotlib.pyplot as plt
import matplotlib.text as mtext

# Clipped text samples can contain CJK characters. A GBK console then raises
# UnicodeEncodeError on print. reconfigure is idempotent and keeps the stream.
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

SEVERITY = {"INFO": 0, "WARN": 1, "FAIL": 2}
_GLYPH_MARKERS = ("missing from", "Glyph", "findfont")


def _ensure_parent(path: str) -> None:
    parent = os.path.dirname(os.path.abspath(path))
    if parent and not os.path.exists(parent):
        os.makedirs(parent, exist_ok=True)


class _GlyphLogHandler(logging.Handler):
    """Collect matplotlib log records about a missing glyph or font."""

    def __init__(self):
        super().__init__()
        self.messages: list[str] = []

    def emit(self, record):
        msg = record.getMessage()
        if any(m in msg for m in _GLYPH_MARKERS):
            self.messages.append(msg)


def _draw_and_collect_glyph_warnings(fig) -> list[str]:
    """Render the figure once and collect missing-glyph reports.

    matplotlib reports a missing glyph through ``warnings`` in older versions
    and through ``logging`` in newer ones. Listen on both channels. The render
    also prepares the renderer for the window-extent measurements below.
    """
    handler = _GlyphLogHandler()
    mpl_logger = logging.getLogger("matplotlib")
    prev_level = mpl_logger.level
    mpl_logger.setLevel(logging.WARNING)
    mpl_logger.addHandler(handler)

    collected: list[str] = []
    try:
        with warnings.catch_warnings(record=True) as wlist:
            warnings.simplefilter("always")
            buf = io.BytesIO()
            fig.savefig(buf, format="png", dpi=100)
            buf.close()
        for w in wlist:
            s = str(w.message)
            if any(m in s for m in _GLYPH_MARKERS):
                collected.append(s)
    finally:
        mpl_logger.removeHandler(handler)
        mpl_logger.setLevel(prev_level)

    collected.extend(handler.messages)
    seen, uniq = set(), []
    for m in collected:
        if m not in seen:
            seen.add(m)
            uniq.append(m)
    return uniq


def _visible_texts(fig) -> list:
    out = []
    for t in fig.findobj(mtext.Text):
        try:
            if t.get_visible() and t.get_text().strip():
                out.append(t)
        except Exception:
            continue
    return out


def _ticklabels_overlap(labels, renderer, axis: str, tol: float) -> bool:
    """Report whether two adjacent tick-label boxes intersect."""
    boxes = []
    for label in labels:
        try:
            if label.get_visible() and label.get_text().strip():
                boxes.append(label.get_window_extent(renderer))
        except Exception:
            continue
    if len(boxes) < 2:
        return False
    if axis == "x":
        boxes.sort(key=lambda b: b.x0)
        return any(a.x1 - b.x0 > tol for a, b in zip(boxes, boxes[1:]))
    boxes.sort(key=lambda b: b.y0)
    return any(a.y1 - b.y0 > tol for a, b in zip(boxes, boxes[1:]))


def audit_layout(
    fig, clip_tol_px: float = 2.0, overlap_tol_px: float = 1.0
) -> list[tuple[str, str]]:
    """Audit the layout of one matplotlib Figure.

    Returns ``[(severity, message), ...]`` with severity INFO < WARN < FAIL:

    1. missing glyph (FAIL) - the font does not cover a character;
    2. clipped text (WARN) - a title, label, or annotation leaves the canvas;
    3. tick-label overlap (WARN) - two adjacent tick boxes intersect.

    The audit only measures. It does not change the figure.
    """
    issues: list[tuple[str, str]] = []

    glyph_msgs = _draw_and_collect_glyph_warnings(fig)
    if glyph_msgs:
        sample = " | ".join(glyph_msgs[:3])
        issues.append(
            (
                "FAIL",
                "Missing glyphs: the exported figure will show boxes. "
                f"{sample[:240]}. Set the CJK font chain for Chinese text and set "
                "axes.unicode_minus to False for the minus sign "
                "(see references/matplotlib-recipes.md).",
            )
        )

    try:
        renderer = fig.canvas.get_renderer()
    except Exception:
        fig.canvas.draw()
        renderer = fig.canvas.get_renderer()

    width = float(fig.bbox.width)
    height = float(fig.bbox.height)

    # Skip tick labels here: a constrained layout puts them on the edge, and
    # the overlap check below already covers them. Audit user text only.
    tick_ids = set()
    for ax in fig.axes:
        for tl in (
            *ax.get_xticklabels(),
            *ax.get_xticklabels(minor=True),
            *ax.get_yticklabels(),
            *ax.get_yticklabels(minor=True),
        ):
            tick_ids.add(id(tl))

    clipped: list[str] = []
    for t in _visible_texts(fig):
        if id(t) in tick_ids:
            continue
        try:
            bb = t.get_window_extent(renderer)
        except Exception:
            continue
        if (
            bb.x0 < -clip_tol_px
            or bb.y0 < -clip_tol_px
            or bb.x1 > width + clip_tol_px
            or bb.y1 > height + clip_tol_px
        ):
            txt = t.get_text().strip().replace("\n", " ")
            if txt:
                clipped.append(txt[:24])
    if clipped:
        uniq = list(dict.fromkeys(clipped))[:6]
        issues.append(
            (
                "WARN",
                f"These texts can be clipped by the canvas edge: {uniq}. "
                "Build the figure with layout='constrained', or shorten or wrap "
                "the text. bbox_inches='tight' also fixes it, but it changes the "
                "final physical size.",
            )
        )

    overlap_axes = 0
    for ax in fig.axes:
        if ax.get_subplotspec() is None:
            continue
        if _ticklabels_overlap(
            ax.get_xticklabels(), renderer, axis="x", tol=overlap_tol_px
        ):
            overlap_axes += 1
            continue
        if _ticklabels_overlap(
            ax.get_yticklabels(), renderer, axis="y", tol=overlap_tol_px
        ):
            overlap_axes += 1
    if overlap_axes:
        issues.append(
            (
                "WARN",
                f"{overlap_axes} axes have overlapping tick labels. "
                "Rotate the x tick labels with "
                "ax.tick_params(axis='x', rotation=30), reduce the tick count, "
                "or shorten the labels.",
            )
        )

    return issues


def render_preview(fig_or_path, out_png: str = "_preview.png", dpi: int = 150) -> str:
    """Write a PNG preview for the agent to read.

    Args:
        fig_or_path: a matplotlib Figure (the normal path: preview before
            export), or the path of a raster image already on disk.
        out_png: output PNG path.
        dpi: preview resolution. 150 shows text and overlaps at a small size.

    Returns:
        The path of a PNG that the Read tool can open.
    """
    if hasattr(fig_or_path, "savefig"):
        _ensure_parent(out_png)
        fig_or_path.savefig(out_png, dpi=dpi, bbox_inches="tight")
        return out_png

    path = str(fig_or_path)
    if not os.path.exists(path):
        raise FileNotFoundError(path)
    ext = os.path.splitext(path)[1].lower().lstrip(".")
    if ext in {"png", "tif", "tiff", "jpg", "jpeg", "bmp"}:
        return path
    raise RuntimeError(
        f"Cannot build a preview from .{ext}. Pass the Figure object before "
        "export, or pass a raster image."
    )


def print_report(issues: list[tuple[str, str]]) -> str:
    """Print the audit result. Return the verdict: PASS, INFO, WARN, or FAIL."""
    if not issues:
        print("  [PASS] No missing glyph, clipped text, or tick overlap.")
        print(
            "  >>> Now read the preview PNG and check the eight perceptual "
            "items in references/visual-review.md."
        )
        return "PASS"
    max_sev = max(SEVERITY[s] for s, _ in issues)
    verdict = {2: "FAIL", 1: "WARN", 0: "INFO"}[max_sev]
    for sev, msg in sorted(issues, key=lambda x: -SEVERITY[x[0]]):
        print(f"  [{sev}] {msg}")
    print(
        f"  >>> verdict: {verdict} (fix it, render again, then read the "
        "preview once more)"
    )
    return verdict


def _demo(out_png: str, dpi: int) -> int:
    """Audit a figure with deliberate layout defects."""
    values = [0.51, 0.28, 0.77, 0.35, 0.62, 0.19, 0.84, 0.45, 0.30, 0.68, 0.23, 0.57]
    fig, ax = plt.subplots(figsize=(3.0, 2.2))
    ax.bar(range(len(values)), values)
    ax.set_xticks(range(len(values)))
    ax.set_xticklabels([f"very_long_condition_name_{i}" for i in range(len(values))])
    ax.set_title("An intentionally overlong title that runs off the canvas edge")
    ax.set_ylabel("value")

    print("=== visual_qa demo: audit a figure with a deliberate bad layout ===")
    print_report(audit_layout(fig))
    out = render_preview(fig, out_png, dpi=dpi)
    plt.close(fig)
    print(f"preview written: {out}")
    print(
        "Note: the missing-glyph check only fails when a font lacks a "
        "character. This demo shows clipping and tick overlap."
    )
    return 0


def _cli() -> int:
    p = argparse.ArgumentParser(
        description="Visual QA for matplotlib figures: preview render and layout audit."
    )
    p.add_argument(
        "target", nargs="?", help="raster image path, or 'demo' to run the demo"
    )
    p.add_argument(
        "--preview", metavar="OUT.png", help="write the preview PNG to this path"
    )
    p.add_argument(
        "--dpi", type=int, default=150, help="preview resolution (default 150)"
    )
    args = p.parse_args()

    if args.target == "demo" or args.target is None:
        return _demo(args.preview or "./visual_qa_demo.png", args.dpi)

    if args.preview:
        out = render_preview(args.target, args.preview, dpi=args.dpi)
        print(f"[visual_qa] preview: {out}")
    else:
        print(
            "[visual_qa] A file on disk supports --preview only. Call "
            "audit_layout on the Figure object inside the plotting script."
        )
    return 0


if __name__ == "__main__":
    sys.exit(_cli())
