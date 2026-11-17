#!/usr/bin/env python3
"""Tests for scripts/palette.py and the palette data in overlays/palettes.json."""

from __future__ import annotations

import argparse
import contextlib
import copy
import io
import json
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]
CATALOG = SKILL_ROOT / "assets" / "catalog"
CLI = SKILL_ROOT / "scripts" / "design_catalog.py"
SLOP_FIXTURE = SKILL_ROOT / "tests" / "fixtures" / "slop" / "airy-glass-field"
sys.path.insert(0, str(SKILL_ROOT / "scripts"))

import design_catalog as dc  # noqa: E402
import palette  # noqa: E402

ENTRY = "style:airy-glass"
SPEC = palette.load_palettes()[ENTRY]
REFERENCE_PAGE = SKILL_ROOT / "assets" / "reference" / "airy-glass" / "index.html"
SLOP_CHECK = SKILL_ROOT / "scripts" / "slop_check.mjs"
# Dark paper is a dark colour at an alpha, not white: the dark column of the
# "起点数值" table of bahayonghang/my-ai-cli-toolkit#47.
FIXED_DARK = {
    "ink": "#E7EDF3",
    "muted": "#A3AFBD",
    "sheet": {"color": "#1C2530", "alpha": 0.6},
    "overlay": {"color": "#1E2834", "alpha": 0.84},
    "sheet-edge": {"color": "#FFFFFF", "alpha": 0.08},
    "sheet-highlight": {"color": "#FFFFFF", "alpha": 0.06},
    "overlay-highlight": {"color": "#FFFFFF", "alpha": 0.08},
    "control-edge": {"color": "#FFFFFF", "alpha": 0.36},
}
FIXED = {
    "ink": "#24303A",
    "muted": "#5C6B76",
    "sheet-alpha": 0.62,
    "overlay-alpha": 0.82,
    "blob-alpha": 0.7,
    "well-alpha": 0.04,
    "control-edge": {"color": "#24303A", "alpha": 0.54},
    "dark": FIXED_DARK,
}
MINT = {
    "field-start": "#E7F6F1",
    "field-end": "#EDE7F8",
    "blob-start": "#CDEEE2",
    "blob-end": "#DCD8F6",
    "blob-mid": "#D8EBF6",
    "input": "#187A56",
    "input-wash": "#E7F7F0",
    "output": "#6D4BD6",
    "output-wash": "#F3EEFC",
}
# Pairs that do not depend on the paper alpha: unchanged since the first table.
MINT_TABLE = {
    "ink-white": 13.47,
    "input-wash": 4.79,
    "input-white": 5.31,
    "output-wash": 5.08,
    "output-white": 5.79,
    "edge-field": 1.11,
}
# Paper at white 0.62 over each bare field end.
MINT_SHEET_ENDS = {
    "ink-sheet-start": 12.97,
    "ink-sheet-end": 12.56,
    "muted-sheet-start": 5.29,
    "muted-sheet-end": 5.13,
}
# Worst background, from the "起点数值" table of bahayonghang/my-ai-cli-toolkit#47.
# control-edge-sheet is 3.17 with this entry's ink; the table's 3.29 needs SkillPort's
# ink #1F2A37 (bahayonghang/devsweep#5).
MINT_WORST = {
    "ink-sheet-worst": 12.16,
    "muted-sheet-worst": 4.96,
    "ink-field-worst": 10.19,
    "muted-field-worst": 4.16,
    "control-edge-sheet": 3.17,
    "sheet-field": 1.07,
}
# The field and the blobs are the dark column of the same table; the two accents are
# SkillPort's dark text accents. The washes are this entry's: the lightness of SkillPort's
# 12% accent fill over the paper colour (0.33), at the hue of each accent.
MINT_DARK = {
    "field-start": "#0F1B1F",
    "field-end": "#18172B",
    "blob-start": "#12302A",
    "blob-end": "#2A2550",
    "blob-mid": "#142536",
    "input": "#5FD6A8",
    "input-wash": "#243B31",
    "output": "#B3A8FF",
    "output-wash": "#353346",
}
# Worst background, dark column of the measured table of bahayonghang/my-ai-cli-toolkit#47.
MINT_DARK_WORST = {
    "ink-sheet-worst": 13.04,
    "muted-sheet-worst": 6.90,
    "ink-field-worst": 12.86,
    "muted-field-worst": 6.81,
    "control-edge-sheet": 3.24,
    "sheet-field": 1.01,
}
GATED = (
    "ink-white", "ink-sheet-start", "ink-sheet-end", "muted-sheet-start",
    "muted-sheet-end", "ink-sheet-worst", "muted-sheet-worst", "muted-well-worst",
    "ink-field-worst", "control-edge-sheet", "input-wash", "input-sheet-worst",
    "input-white", "output-wash", "output-sheet-worst", "output-white",
)
REPORTED = ("muted-field-worst", "edge-field", "sheet-field")
GATE_ORDER = (
    "ink-white", "ink-sheet-start", "ink-sheet-end", "muted-sheet-start",
    "muted-sheet-end", "ink-sheet-worst", "muted-sheet-worst", "muted-well-worst",
    "ink-field-worst", "muted-field-worst", "control-edge-sheet", "input-wash",
    "input-sheet-worst", "input-white", "output-wash", "output-sheet-worst",
    "output-white", "edge-field", "sheet-field",
)
# The dark group: the same pairs on dark paper (its opaque fallback is the paper colour,
# not white), then the text and control-edge pairs again on overlays.
DARK_GATE_ORDER = (
    "ink-solid", "ink-sheet-start", "ink-sheet-end", "muted-sheet-start",
    "muted-sheet-end", "ink-sheet-worst", "muted-sheet-worst", "muted-well-worst",
    "ink-field-worst", "muted-field-worst", "control-edge-sheet", "input-wash",
    "input-sheet-worst", "input-solid", "output-wash", "output-sheet-worst",
    "output-solid", "edge-field", "sheet-field",
    "ink-overlay-worst", "muted-overlay-worst", "control-edge-overlay",
    "input-overlay-worst", "output-overlay-worst",
)
DARK_GATED = tuple(gate_id for gate_id in DARK_GATE_ORDER if gate_id not in REPORTED)
# Every row of the mint dark group, worked from over() and contrast() one pair at a time.
MINT_DARK_TABLE = {
    "ink-solid": 13.12,
    "ink-sheet-start": 13.85,
    "ink-sheet-end": 13.92,
    "muted-sheet-start": 7.33,
    "muted-sheet-end": 7.37,
    "ink-sheet-worst": 13.04,
    "muted-sheet-worst": 6.90,
    "muted-well-worst": 6.21,
    "ink-field-worst": 12.86,
    "muted-field-worst": 6.81,
    "control-edge-sheet": 3.24,
    "input-wash": 6.69,
    "input-sheet-worst": 8.55,
    "input-solid": 8.60,
    "output-wash": 5.81,
    "output-sheet-worst": 7.30,
    "output-solid": 7.34,
    "edge-field": 1.36,
    "sheet-field": 1.01,
    "ink-overlay-worst": 12.69,
    "muted-overlay-worst": 6.71,
    "control-edge-overlay": 3.22,
    "input-overlay-worst": 8.31,
    "output-overlay-worst": 7.10,
}
HEX = re.compile(r"#[0-9A-F]{6}")


def minimum(gate_id: str) -> float:
    return 3.0 if gate_id.startswith("control-edge") else 4.5


def ratios(colors: dict, theme: str = "light") -> dict[str, dict]:
    return {row["id"]: row for row in palette.gates(colors, SPEC["fixed"], theme)}


def run(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(CLI), *args],
        capture_output=True,
        text=True,
        encoding="utf-8",
    )


def template() -> str:
    return (CATALOG / "styles" / "airy-glass.md").read_text(encoding="utf-8")


def preset_colors(name: str) -> dict:
    return {role: SPEC["presets"][name][role] for role in palette.ROLES}


class ColourMathTests(unittest.TestCase):
    def test_mint_reproduces_the_shipped_contrast_table(self) -> None:
        rows = ratios(MINT)
        for gate_id, expected in {**MINT_TABLE, **MINT_SHEET_ENDS}.items():
            self.assertAlmostEqual(rows[gate_id]["ratio"], expected, delta=0.01, msg=gate_id)

    def test_mint_worst_background_rows_match_the_spec_table(self) -> None:
        rows = ratios(MINT)
        for gate_id, expected in MINT_WORST.items():
            self.assertEqual(rows[gate_id]["ratio"], expected, gate_id)
        # The darkest background is the end blob over the field end; paper sits on that.
        self.assertEqual(rows["ink-field-worst"]["bg"], palette.over("#DCD8F6", "#EDE7F8", 0.7))
        self.assertEqual(
            rows["ink-sheet-worst"]["bg"],
            palette.over("#FFFFFF", rows["ink-field-worst"]["bg"], 0.62),
        )
        # The spec table's 3.29 is the control edge drawn in SkillPort's ink.
        skillport = {**FIXED, "control-edge": {"color": "#1F2A37", "alpha": 0.54}}
        edge = {row["id"]: row for row in palette.gates(MINT, skillport)}["control-edge-sheet"]
        self.assertEqual(edge["ratio"], 3.29)

    def test_mint_dark_worst_background_rows_match_the_spec_table(self) -> None:
        rows = ratios(MINT_DARK, "dark")
        for gate_id, expected in MINT_DARK_WORST.items():
            self.assertEqual(rows[gate_id]["ratio"], expected, gate_id)
        # Light text is weakest on the lightest background: the start blob over the field
        # start, 0.7 * (18, 48, 42) + 0.3 * (15, 27, 31) = (17.1, 41.7, 38.7).
        self.assertEqual(rows["ink-field-worst"]["bg"], "#112A27")
        # Dark paper is #1C2530 at 0.60 over it: 0.6 * (28, 37, 48) + 0.4 * (17, 42, 39)
        # = (23.6, 39.0, 44.4). White at 0.60 there would be far lighter than this.
        self.assertEqual(rows["ink-sheet-worst"]["bg"], "#18272C")
        self.assertEqual(rows["muted-sheet-worst"]["bg"], "#18272C")

    def test_dark_gate_rows(self) -> None:
        rows = palette.gates(MINT_DARK, SPEC["fixed"], "dark")
        self.assertEqual([row["id"] for row in rows], list(DARK_GATE_ORDER))
        self.assertEqual({row["id"]: row["ratio"] for row in rows}, MINT_DARK_TABLE)
        for row in rows:
            self.assertEqual(
                set(row), {"id", "fg", "bg", "fg_label", "bg_label", "ratio", "min", "pass", "use"}
            )
            if row["id"] in REPORTED:
                self.assertIsNone(row["min"], row["id"])
                self.assertIsNone(row["pass"], row["id"])
            else:
                self.assertEqual(row["min"], minimum(row["id"]), row["id"])
                self.assertIs(row["pass"], True, row["id"])
            self.assertRegex(row["fg"], HEX, row["id"])
            self.assertRegex(row["bg"], HEX, row["id"])
        self.assertEqual(palette.failures(rows), [])
        # The light group keeps its nineteen rows: no overlay rows, white as the fallback.
        self.assertEqual(
            [row["id"] for row in palette.gates(MINT, SPEC["fixed"], "light")], list(GATE_ORDER)
        )
        self.assertEqual(palette.gates(MINT, SPEC["fixed"], "light"), palette.gates(MINT, SPEC["fixed"]))
        with self.assertRaises(ValueError):
            palette.gates(MINT, SPEC["fixed"], "sepia")

    def test_dark_rows_name_the_dark_paper_and_overlay(self) -> None:
        rows = ratios(MINT_DARK, "dark")

        def labels(gate_id: str) -> tuple[str, str]:
            return rows[gate_id]["fg_label"], rows[gate_id]["bg_label"]

        # The opaque fallback is the paper colour, and so is the label on a primary button.
        self.assertEqual(labels("ink-solid"), ("`#E7EDF3`", "`#1C2530`"))
        self.assertEqual(rows["ink-solid"]["use"], "正文,不透明回退")
        self.assertEqual(labels("input-solid"), ("`#5FD6A8`", "`#1C2530`"))
        self.assertEqual(rows["input-solid"]["use"], "主要按钮上的深色字,不透明回退上的链接")
        self.assertEqual(labels("ink-sheet-start"), ("`#E7EDF3`", "`#1C2530` 0.60 叠 `#0F1B1F`"))
        self.assertEqual(
            labels("ink-sheet-worst"),
            ("`#E7EDF3`", "`#1C2530` 0.60 叠 (`#12302A` 0.70 叠 `#0F1B1F`)"),
        )
        self.assertEqual(
            labels("muted-well-worst"),
            ("`#A3AFBD`", "`#E7EDF3` 0.04 叠 `#1C2530` 0.60 叠 (`#12302A` 0.70 叠 `#0F1B1F`)"),
        )
        # The control edge is white at 0.36. On paper it is weakest over the end blob:
        # paper 0.6 * (28, 37, 48) + 0.4 * (37, 33, 69) = (31.6, 35.4, 56.4), then the edge
        # 0.36 * 255 + 0.64 * (32, 35, 56) = (112.28, 114.2, 127.64).
        self.assertEqual(
            labels("control-edge-sheet"),
            ("白 0.36 叠纸", "`#1C2530` 0.60 叠 (`#2A2550` 0.70 叠 `#18172B`)"),
        )
        self.assertEqual(
            (rows["control-edge-sheet"]["fg"], rows["control-edge-sheet"]["bg"]),
            ("#707280", "#202338"),
        )
        self.assertEqual(
            labels("control-edge-overlay"),
            ("白 0.36 叠浮层", "`#1E2834` 0.84 叠 (`#12302A` 0.70 叠 `#0F1B1F`)"),
        )
        self.assertEqual(
            (rows["control-edge-overlay"]["fg"], rows["control-edge-overlay"]["bg"]),
            ("#6E757C", "#1C2832"),
        )
        # The paper edge is white at 0.08 over the paper, not a white line: paper on the
        # field start is (22.8, 33.0, 41.2), the edge 0.08 * 255 + 0.92 * (23, 33, 41).
        self.assertEqual(labels("edge-field"), ("白 0.08 叠纸", "`#0F1B1F`"))
        self.assertEqual(
            (rows["edge-field"]["fg"], rows["edge-field"]["bg"]), ("#2A333A", "#0F1B1F")
        )
        self.assertEqual(rows["edge-field"]["use"], "纸的描边,不能当控件边界")
        self.assertEqual(
            labels("ink-overlay-worst"),
            ("`#E7EDF3`", "`#1E2834` 0.84 叠 (`#2A2550` 0.70 叠 `#18172B`)"),
        )
        self.assertEqual(rows["ink-overlay-worst"]["use"], "正文,最差的浮层")
        self.assertIn("本色板可以", rows["muted-field-worst"]["use"])

    def test_dark_overlay_rows_catch_what_the_paper_rows_miss(self) -> None:
        # A dark overlay is lighter than dark paper, so light text is weaker on it. The
        # lightest one is over the end blob: 0.84 * (30, 40, 52) + 0.16 * (37, 33, 69)
        # = (31.12, 38.88, 54.72).
        rows = ratios(MINT_DARK, "dark")
        self.assertEqual(rows["ink-overlay-worst"]["bg"], "#1F2737")
        for name in ("ink", "muted", "input", "output"):
            self.assertLess(
                rows[f"{name}-overlay-worst"]["ratio"], rows[f"{name}-sheet-worst"]["ratio"], name
            )
        self.assertLess(
            palette.luminance(rows["ink-sheet-worst"]["bg"]),
            palette.luminance(rows["ink-overlay-worst"]["bg"]),
        )
        # A lighter overlay fails its own rows while every paper row still passes.
        lighter = copy.deepcopy(SPEC["fixed"])
        lighter["dark"]["overlay"]["color"] = "#3B4550"
        self.assertEqual(
            palette.failures(palette.gates(MINT_DARK, lighter, "dark")), ["control-edge-overlay"]
        )
        lighter["dark"]["overlay"]["color"] = "#59636E"
        self.assertEqual(
            palette.failures(palette.gates(MINT_DARK, lighter, "dark")),
            ["muted-overlay-worst", "control-edge-overlay", "input-overlay-worst",
             "output-overlay-worst"],
        )

    def test_dark_failures(self) -> None:
        weak = {**MINT_DARK, "input": "#3F8F70"}
        self.assertEqual(
            palette.failures(palette.gates(weak, SPEC["fixed"], "dark")),
            ["input-wash", "input-sheet-worst", "input-solid", "input-overlay-worst"],
        )
        # A blob much lighter than the field. Both bare ends still pass; on that blob the
        # control edge drops under 3:1 and muted text on the field is reported as unfit.
        pale = ratios({**MINT_DARK, "blob-mid": "#6A7482"}, "dark")
        self.assertEqual(palette.failures(list(pale.values())), ["control-edge-sheet"])
        self.assertEqual(pale["muted-field-worst"]["ratio"], 3.2)
        self.assertIsNone(pale["muted-field-worst"]["pass"])
        self.assertIn("本色板不可", pale["muted-field-worst"]["use"])

    def test_worst_background_includes_the_bare_field_ends(self) -> None:
        # Blobs lighter than both field ends: the bare end is then the darkest background.
        pale = {**MINT, "blob-start": "#FFFFFF", "blob-end": "#FFFFFF", "blob-mid": "#FFFFFF"}
        rows = ratios(pale)
        self.assertEqual(rows["ink-field-worst"]["bg"], "#EDE7F8")
        self.assertEqual(rows["muted-sheet-worst"]["ratio"], rows["muted-sheet-end"]["ratio"])
        # The paper-to-field ratio is the smallest one, on the lightest background.
        self.assertEqual(ratios(MINT)["sheet-field"]["bg"], "#E7F6F1")

    def test_sheet_is_an_8_bit_srgb_mix(self) -> None:
        self.assertEqual(palette.over("#FFFFFF", "#E7F6F1", 0.78), "#FAFDFC")
        self.assertEqual(palette.over("#FFFFFF", "#EDE7F8", 0.78), "#FBFAFD")
        # 0.62 * 255 + 0.38 * (231, 246, 241) = (245.88, 251.58, 249.68).
        self.assertEqual(palette.over("#FFFFFF", "#E7F6F1", 0.62), "#F6FCFA")
        self.assertEqual(palette.over("#FFFFFF", "#000000", 1.0), "#FFFFFF")
        self.assertEqual(palette.over("#FFFFFF", "#000000", 0.0), "#000000")

    def test_wcag_contrast_reference_values(self) -> None:
        self.assertAlmostEqual(palette.contrast("#000000", "#FFFFFF"), 21.0, places=6)
        self.assertAlmostEqual(palette.contrast("#FFFFFF", "#000000"), 21.0, places=6)
        self.assertAlmostEqual(palette.contrast("#777777", "#FFFFFF"), 4.48, delta=0.01)
        self.assertAlmostEqual(palette.contrast("#123456", "#123456"), 1.0, places=6)

    def test_oklch_round_trip(self) -> None:
        for value in ("#187A56", "#6D4BD6", "#2563EB", "#E7F6F1", "#000000", "#FFFFFF", "#9C5313"):
            L, C, H = palette.hex_to_oklch(value)
            self.assertEqual(palette.oklch_to_hex(L, C, H), value)
        L, C, H = palette.hex_to_oklch("#2563EB")
        self.assertAlmostEqual(L, 0.546, delta=0.002)
        self.assertAlmostEqual(C, 0.215, delta=0.002)
        self.assertAlmostEqual(H, 262.9, delta=0.2)

    def test_out_of_gamut_lowers_chroma_and_keeps_hue(self) -> None:
        value = palette.oklch_to_hex(0.52, 0.40, 163)
        self.assertRegex(value, HEX)
        L, C, H = palette.hex_to_oklch(value)
        self.assertLess(C, 0.40)
        self.assertAlmostEqual(L, 0.52, delta=0.01)
        self.assertLess(palette.hue_distance(H, 163), 2)

    def test_hex_parsing(self) -> None:
        self.assertEqual(palette.hex_to_rgb("#fff"), (255, 255, 255))
        self.assertEqual(palette.hex_to_rgb("#2563eb"), (37, 99, 235))
        with self.assertRaises(ValueError):
            palette.hex_to_rgb("blue")

    def test_gate_rows(self) -> None:
        rows = palette.gates(MINT, SPEC["fixed"])
        self.assertEqual([row["id"] for row in rows], list(GATE_ORDER))
        self.assertEqual(set(GATE_ORDER), {*GATED, *REPORTED})
        for row in rows:
            if row["id"] in REPORTED:
                self.assertIsNone(row["min"], row["id"])
                self.assertIsNone(row["pass"], row["id"])
            else:
                self.assertEqual(row["min"], minimum(row["id"]), row["id"])
                self.assertIs(row["pass"], True, row["id"])
            self.assertRegex(row["fg"], HEX, row["id"])
            self.assertRegex(row["bg"], HEX, row["id"])
        self.assertEqual(palette.failures(rows), [])
        weak = {**MINT, "input": "#1F8A62"}
        self.assertEqual(
            palette.failures(palette.gates(weak, SPEC["fixed"])),
            ["input-wash", "input-sheet-worst", "input-white"],
        )
        low = {**MINT, "field-end": "#8A8FA0"}
        self.assertIn("muted-sheet-end", palette.failures(palette.gates(low, SPEC["fixed"])))

    def test_a_dark_blob_fails_the_worst_background_rows_only(self) -> None:
        # Both bare field ends still pass; the blob over them does not.
        failed = palette.failures(palette.gates({**MINT, "blob-mid": "#8A8FA0"}, SPEC["fixed"]))
        self.assertEqual(
            failed,
            ["muted-sheet-worst", "muted-well-worst", "control-edge-sheet", "input-sheet-worst",
             "output-sheet-worst"],
        )
        self.assertFalse([gate_id for gate_id in failed if gate_id.endswith(("-start", "-end"))])

    def test_muted_on_the_field_is_reported_not_gated(self) -> None:
        row = ratios(MINT)["muted-field-worst"]
        self.assertLess(row["ratio"], 4.5)
        self.assertIsNone(row["pass"])
        self.assertIn("本色板不可", row["use"])
        # A muted dark enough for the field gets the other verdict, and still no gate.
        dark = {**FIXED, "muted": "#3A4650"}
        strong = {r["id"]: r for r in palette.gates(MINT, dark)}["muted-field-worst"]
        self.assertGreaterEqual(strong["ratio"], 4.5)
        self.assertIsNone(strong["pass"])
        self.assertIn("本色板可以", strong["use"])


class PresetDataTests(unittest.TestCase):
    def test_structure(self) -> None:
        data = json.loads((CATALOG / "overlays" / "palettes.json").read_text(encoding="utf-8"))
        self.assertEqual(list(data), [ENTRY])
        self.assertEqual(
            set(SPEC),
            {"default", "match_degrees", "min_accent_chroma", "min_accent_lightness",
             "output_offsets", "reserved_hues", "fixed", "presets"},
        )
        self.assertEqual(SPEC["min_accent_lightness"], 0.25)
        # Error red wraps through 0; warning amber does not.
        self.assertEqual(SPEC["reserved_hues"], [[340, 40], [60, 100]])
        self.assertEqual(SPEC["default"], "mint")
        self.assertIn(SPEC["default"], SPEC["presets"])
        self.assertGreaterEqual(len(SPEC["presets"]), 4)
        self.assertEqual(SPEC["fixed"], FIXED)
        self.assertEqual(
            palette.ROLES,
            ("field-start", "field-end", "blob-start", "blob-end", "blob-mid",
             "input", "input-wash", "output", "output-wash"),
        )
        for name, preset in SPEC["presets"].items():
            self.assertRegex(name, r"^[a-z]+$")
            self.assertEqual(
                set(preset),
                {"anchor", "label", *palette.ROLES, "dark", "keywords_en", "keywords_zh"},
                name,
            )
            self.assertTrue(0 <= preset["anchor"] <= 359, name)
            self.assertTrue(preset["label"]["zh"] and preset["label"]["en"], name)
            for role in palette.ROLES:
                self.assertRegex(preset[role], HEX, f"{name}.{role}")
            self.assertEqual(list(preset["dark"]), list(palette.ROLES), name)
            for role in palette.ROLES:
                self.assertRegex(preset["dark"][role], HEX, f"{name}.dark.{role}")

    def test_mint_is_the_shipped_palette(self) -> None:
        self.assertEqual({role: SPEC["presets"]["mint"][role] for role in palette.ROLES}, MINT)
        self.assertEqual(SPEC["presets"]["mint"]["dark"], MINT_DARK)

    def test_every_preset_passes_the_gates(self) -> None:
        for name, preset in SPEC["presets"].items():
            colors = {role: preset[role] for role in palette.ROLES}
            rows = ratios(colors)
            for gate_id in GATED:
                self.assertGreaterEqual(
                    rows[gate_id]["ratio"], minimum(gate_id), f"{name} {gate_id}"
                )
            self.assertEqual(palette.failures(list(rows.values())), [], name)
            self.assertLess(rows["edge-field"]["ratio"], 3.0, name)

    def test_every_preset_dark_group_passes_the_gates(self) -> None:
        for name, preset in SPEC["presets"].items():
            rows = ratios(preset["dark"], "dark")
            self.assertEqual(list(rows), list(DARK_GATE_ORDER), name)
            for gate_id in DARK_GATED:
                self.assertGreaterEqual(
                    rows[gate_id]["ratio"], minimum(gate_id), f"{name} dark {gate_id}"
                )
            self.assertEqual(palette.failures(list(rows.values())), [], name)
            self.assertLess(rows["edge-field"]["ratio"], 3.0, name)
            # Light secondary text may sit on a dark field in every preset.
            self.assertGreaterEqual(rows["muted-field-worst"]["ratio"], 4.5, name)

    def test_dark_groups_keep_the_hues_and_reverse_the_lightness(self) -> None:
        for name, preset in SPEC["presets"].items():
            dark = preset["dark"]
            hues = {}
            for role in ("input", "output"):
                L, C, H = palette.hex_to_oklch(dark[role])
                hues[role] = H
                self.assertLessEqual(
                    palette.hue_distance(H, palette.hex_to_oklch(preset[role])[2]), 5,
                    f"{name}.dark.{role}",
                )
                # An accent is text on dark paper here, so it is lighter than its light twin.
                self.assertGreaterEqual(L, 0.75, f"{name}.dark.{role}")
            self.assertLessEqual(palette.hue_distance(hues["input"], preset["anchor"]), 5, name)
            self.assertGreaterEqual(palette.hue_distance(hues["input"], hues["output"]), 90, name)
            self.assertFalse(palette.in_reserved(hues["output"], SPEC["reserved_hues"]), name)
            for role in ("field-start", "field-end"):
                L, C, H = palette.hex_to_oklch(dark[role])
                self.assertLessEqual(L, 0.23, f"{name}.dark.{role}")
                self.assertLessEqual(C, 0.045, f"{name}.dark.{role}")
            for role, hue in (("blob-start", hues["input"]), ("blob-end", hues["output"])):
                H = palette.hex_to_oklch(dark[role])[2]
                self.assertLessEqual(palette.hue_distance(H, hue), 15, f"{name}.dark.{role}")
            for role in palette.BLOBS:
                L, C, H = palette.hex_to_oklch(dark[role])
                self.assertLessEqual(C, 0.08, f"{name}.dark.{role}")
                self.assertLessEqual(L, 0.30, f"{name}.dark.{role}")
                # A dark blob is a glow: a little lighter than either field end.
                for end in ("field-start", "field-end"):
                    self.assertGreater(
                        palette.luminance(dark[role]), palette.luminance(dark[end]),
                        f"{name}.dark.{role} against {end}",
                    )
            for role in ("input-wash", "output-wash"):
                L, C, H = palette.hex_to_oklch(dark[role])
                self.assertLessEqual(C, 0.04, f"{name}.dark.{role}")
                self.assertLessEqual(L, 0.34, f"{name}.dark.{role}")
                # A wash is a tint of its own accent, not of the paper.
                accent = "input" if role == "input-wash" else "output"
                self.assertLessEqual(
                    palette.hue_distance(H, hues[accent]), 5, f"{name}.dark.{role}"
                )
                # A wash is a fill inside paper: lighter than the opaque paper colour.
                self.assertGreater(
                    palette.luminance(dark[role]),
                    palette.luminance(SPEC["fixed"]["dark"]["sheet"]["color"]),
                    f"{name}.dark.{role}",
                )

    def test_preset_blobs_follow_the_field_and_stay_low_chroma(self) -> None:
        for name, preset in SPEC["presets"].items():
            in_hue = palette.hex_to_oklch(preset["input"])[2]
            out_hue = palette.hex_to_oklch(preset["output"])[2]
            for role, hue in (("blob-start", in_hue), ("blob-end", out_hue)):
                L, C, H = palette.hex_to_oklch(preset[role])
                self.assertLessEqual(palette.hue_distance(H, hue), 12, f"{name}.{role}")
            for role in palette.BLOBS:
                L, C, H = palette.hex_to_oklch(preset[role])
                self.assertLessEqual(C, 0.045, f"{name}.{role}")
                # A blob is a tint of the field, a little deeper than either end.
                self.assertGreaterEqual(L, 0.88, f"{name}.{role}")
                for end in ("field-start", "field-end"):
                    self.assertLess(
                        palette.luminance(preset[role]), palette.luminance(preset[end]),
                        f"{name}.{role} against {end}",
                    )

    def test_preset_fields_are_low_chroma_and_outputs_avoid_reserved_hues(self) -> None:
        for name, preset in SPEC["presets"].items():
            for role in ("field-start", "field-end", "input-wash", "output-wash"):
                self.assertLessEqual(
                    palette.hex_to_oklch(preset[role])[1], 0.04, f"{name}.{role}"
                )
            # The entry file states this limit for every colourway.
            for role in ("field-start", "field-end"):
                self.assertLessEqual(
                    palette.hex_to_oklch(preset[role])[1], 0.03, f"{name}.{role}"
                )
            out_hue = palette.hex_to_oklch(preset["output"])[2]
            self.assertFalse(palette.in_reserved(out_hue, SPEC["reserved_hues"]), name)
            in_hue = palette.hex_to_oklch(preset["input"])[2]
            self.assertLessEqual(palette.hue_distance(in_hue, preset["anchor"]), 5, name)
            self.assertGreaterEqual(palette.hue_distance(in_hue, out_hue), 90, name)

    def test_keywords_are_bilingual_and_unique(self) -> None:
        seen: dict[str, str] = {}
        for name, preset in SPEC["presets"].items():
            self.assertGreaterEqual(len(preset["keywords_en"]), 4, name)
            self.assertGreaterEqual(len(preset["keywords_zh"]), 4, name)
            for word in preset["keywords_en"]:
                self.assertEqual(word, word.lower(), name)
                self.assertRegex(word, r"^[a-z0-9][a-z0-9 -]*$", name)
            for word in preset["keywords_zh"]:
                self.assertGreaterEqual(len(re.findall("[一-鿿]", word)), 2, word)
            for word in [*preset["keywords_en"], *preset["keywords_zh"]]:
                self.assertNotIn(word, seen, f"{word} is in {seen.get(word)} and {name}")
                seen[word] = name

    def test_keywords_name_a_domain_not_a_readme_heading(self) -> None:
        # Words that turn up in the README of any kind of project pick no preset.
        generic = {
            "community", "creator", "family", "security", "enterprise", "cloud",
            "analytics", "course", "recipe", "legal", "governance", "health",
            "contributing", "license", "support", "documentation",
            "社区", "创作者", "企业", "安全", "云服务", "云平台", "数据分析", "健康",
        }
        for name, preset in SPEC["presets"].items():
            listed = {*preset["keywords_en"], *preset["keywords_zh"]}
            self.assertEqual(listed & generic, set(), name)

    def test_default_hex_values_are_distinct(self) -> None:
        # render() swaps the default hex values one for one, light and dark in one pass.
        self.assertEqual(len(set(MINT.values())), len(MINT))
        self.assertNotIn(SPEC["fixed"]["ink"], MINT.values())
        self.assertNotIn(SPEC["fixed"]["muted"], MINT.values())
        self.assertNotIn("#FFFFFF", MINT.values())
        swapped = [*MINT.values(), *MINT_DARK.values()]
        self.assertEqual(len(set(swapped)), len(swapped))
        dark = SPEC["fixed"]["dark"]
        kept = {
            SPEC["fixed"]["ink"], SPEC["fixed"]["muted"], "#FFFFFF", dark["ink"], dark["muted"],
            dark["sheet"]["color"], dark["overlay"]["color"],
        }
        self.assertEqual(kept & set(swapped), set())

    def test_template_tokens_match_the_fixed_values(self) -> None:
        head = template()[: template().index("\n---\n", 4)]
        fixed = SPEC["fixed"]
        self.assertIn(f'  sheet: "rgba(255,255,255,{fixed["sheet-alpha"]:.2f})"', head)
        self.assertIn(f'  overlay: "rgba(255,255,255,{fixed["overlay-alpha"]:.2f})"', head)
        self.assertIn(f'  ink: "{fixed["ink"]}"', head)
        self.assertIn(f'  muted: "{fixed["muted"]}"', head)
        r, g, b = palette.hex_to_rgb(fixed["ink"])
        self.assertIn(f'  well: "rgba({r},{g},{b},{fixed["well-alpha"]:.2f})"', head)
        r, g, b = palette.hex_to_rgb(fixed["control-edge"]["color"])
        self.assertIn(
            f'  control-edge: "rgba({r},{g},{b},{fixed["control-edge"]["alpha"]:.2f})"', head
        )
        self.assertIn(f'  blob-opacity: {fixed["blob-alpha"]:.2f}\n', head)

    def test_template_dark_tokens_match_the_fixed_dark_values(self) -> None:
        head = template()[: template().index("\n---\n", 4)]
        fixed, dark = SPEC["fixed"], SPEC["fixed"]["dark"]

        def rgba(layer: dict) -> str:
            r, g, b = palette.hex_to_rgb(layer["color"])
            return f"rgba({r},{g},{b},{layer['alpha']:.2f})"

        self.assertIn(f'  sheet-dark: "{rgba(dark["sheet"])}"', head)
        self.assertIn('  sheet-dark: "rgba(28,37,48,0.60)"', head)
        self.assertIn(f'  overlay-dark: "{rgba(dark["overlay"])}"', head)
        self.assertIn(f'  sheet-edge-dark: "{rgba(dark["sheet-edge"])}"', head)
        self.assertIn(f'  control-edge-dark: "{rgba(dark["control-edge"])}"', head)
        self.assertIn(f'  ink-dark: "{dark["ink"]}"', head)
        self.assertIn(f'  muted-dark: "{dark["muted"]}"', head)
        self.assertIn(
            f'  well-dark: "{rgba({"color": dark["ink"], "alpha": fixed["well-alpha"]})}"', head
        )
        # The opaque fallback and the label on an input fill are the paper colour.
        self.assertIn(
            f'  sheet-solid-dark: "{rgba({"color": dark["sheet"]["color"], "alpha": 0.96})}"', head
        )
        self.assertIn(f'  on-input-dark: "{dark["sheet"]["color"]}"', head)
        self.assertIn('  on-input: "#FFFFFF"', head)
        self.assertIn(
            f'  sheet-highlight-dark: "inset 0 1px 0 {rgba(dark["sheet-highlight"])}"', head
        )
        self.assertIn(
            f'  overlay-highlight-dark: "inset 0 1px 0 {rgba(dark["overlay-highlight"])}"', head
        )
        for role in palette.ROLES:
            self.assertIn(f'  {role}-dark: "{MINT_DARK[role]}"', head)

    def test_anchors_are_further_apart_than_the_match_window(self) -> None:
        anchors = sorted(p["anchor"] for p in SPEC["presets"].values())
        for a, b in zip(anchors, anchors[1:]):
            self.assertGreater(b - a, SPEC["match_degrees"])


class DeriveTests(unittest.TestCase):
    def test_every_hue_passes_every_gate(self) -> None:
        for hue in range(360):
            derived = palette.derive(hue, SPEC)
            colors = derived["colors"]
            self.assertEqual(list(colors), list(palette.ROLES))
            rows = ratios(colors)
            for gate_id in GATED:
                self.assertGreaterEqual(
                    rows[gate_id]["ratio"], minimum(gate_id), f"hue {hue} {gate_id}"
                )
            self.assertLess(rows["edge-field"]["ratio"], 3.0, f"hue {hue}")
            for role in palette.ROLES:
                self.assertRegex(colors[role], HEX, f"hue {hue} {role}")
            # Output stays out of error red (340-40, through 0) and warning amber
            # (60-100), and at least 90 degrees from the input.
            out_hue = derived["output_hue"]
            self.assertFalse(out_hue >= 340 or out_hue <= 40, f"hue {hue} -> {out_hue}")
            self.assertFalse(60 <= out_hue <= 100, f"hue {hue} -> {out_hue}")
            self.assertFalse(palette.in_reserved(out_hue, SPEC["reserved_hues"]), hue)
            self.assertGreaterEqual(palette.hue_distance(hue, out_hue), 90, hue)
            measured = palette.hex_to_oklch(colors["output"])[2]
            self.assertFalse(measured >= 340 or measured <= 40, f"hue {hue} -> {measured}")
            self.assertFalse(60 <= measured <= 100, f"hue {hue} -> {measured}")

    def test_fifteen_degree_steps_field_chroma_and_output_hue(self) -> None:
        for hue in range(0, 360, 15):
            derived = palette.derive(hue, SPEC)
            colors = derived["colors"]
            self.assertEqual(palette.failures(palette.gates(colors, SPEC["fixed"])), [], hue)
            for role in ("field-start", "field-end"):
                chroma = palette.hex_to_oklch(colors[role])[1]
                self.assertLessEqual(chroma, 0.04, f"hue {hue} {role}")
                self.assertLessEqual(chroma, 0.03, f"hue {hue} {role}")
            self.assertFalse(
                palette.in_reserved(derived["output_hue"], SPEC["reserved_hues"]), hue
            )
            measured = palette.hex_to_oklch(colors["output"])[2]
            self.assertFalse(palette.in_reserved(measured, SPEC["reserved_hues"]), hue)

    def test_hues_follow_the_request(self) -> None:
        for hue in range(360):
            derived = palette.derive(hue, SPEC)
            colors = derived["colors"]
            in_hue = palette.hex_to_oklch(colors["input"])[2]
            out_hue = palette.hex_to_oklch(colors["output"])[2]
            self.assertLessEqual(palette.hue_distance(in_hue, hue), 3, hue)
            self.assertLessEqual(palette.hue_distance(out_hue, derived["output_hue"]), 3, hue)
            self.assertGreaterEqual(palette.hue_distance(in_hue, out_hue), 90, hue)
            self.assertFalse(palette.in_reserved(out_hue, SPEC["reserved_hues"]), hue)
            for role in ("field-start", "field-end", "input-wash", "output-wash"):
                self.assertLessEqual(
                    palette.hex_to_oklch(colors[role])[1], 0.04, f"{hue} {role}"
                )

    def test_output_hue_picks_the_first_offset_outside_the_reserved_bands(self) -> None:
        self.assertEqual(palette.output_hue(163, SPEC), 289)
        self.assertEqual(palette.output_hue(250, SPEC), 124)  # 16 is reserved red
        self.assertEqual(palette.output_hue(300, SPEC), 174)  # 66 is reserved amber
        self.assertEqual(palette.output_hue(18, SPEC), 144)
        self.assertTrue(palette.in_reserved(0, SPEC["reserved_hues"]))
        self.assertTrue(palette.in_reserved(40, SPEC["reserved_hues"]))
        self.assertFalse(palette.in_reserved(41, SPEC["reserved_hues"]))
        self.assertTrue(palette.in_reserved(80, SPEC["reserved_hues"]))

    def test_the_red_band_wraps_through_zero(self) -> None:
        reserved = SPEC["reserved_hues"]
        for hue in (340, 350, 359, 360, 0, 20, 40, 700, -10):
            self.assertTrue(palette.in_reserved(hue, reserved), hue)
        for hue in (339, 41, 59, 101, 180, 328):
            self.assertFalse(palette.in_reserved(hue, reserved), hue)
        # A band that does not wrap still reads as before.
        self.assertTrue(palette.in_reserved(60, [[60, 100]]))
        self.assertFalse(palette.in_reserved(350, [[60, 100]]))
        self.assertFalse(palette.in_reserved(350, [[0, 40]]))
        # 214 + 126 = 340 and 233 + 126 = 359 used to be taken as the output hue.
        self.assertEqual(palette.output_hue(214, SPEC), 314)
        self.assertEqual(palette.output_hue(233, SPEC), 107)
        self.assertEqual(palette.output_hue(213, SPEC), 339)
        self.assertEqual(palette.output_hue(202, SPEC), 328)
        # Without the added offset no candidate is left for 214: the data must cover every hue.
        with self.assertRaises(ValueError):
            palette.output_hue(214, {**SPEC, "output_offsets": [126, -126, 150, -150]})

    def test_every_hue_derives_a_dark_group_that_passes_every_gate(self) -> None:
        for hue in range(360):
            derived = palette.derive(hue, SPEC)
            dark = derived["dark"]
            self.assertEqual(list(dark), list(palette.ROLES))
            for role in palette.ROLES:
                self.assertRegex(dark[role], HEX, f"hue {hue} {role}")
            rows = ratios(dark, "dark")
            self.assertEqual(list(rows), list(DARK_GATE_ORDER), hue)
            for gate_id in DARK_GATED:
                self.assertGreaterEqual(
                    rows[gate_id]["ratio"], minimum(gate_id), f"hue {hue} dark {gate_id}"
                )
            self.assertEqual(palette.failures(list(rows.values())), [], hue)
            self.assertLess(rows["edge-field"]["ratio"], 3.0, f"hue {hue}")
            # Light secondary text may sit on a dark field at every hue.
            self.assertGreaterEqual(rows["muted-field-worst"]["ratio"], 4.5, f"hue {hue}")
            # render() swaps hex for hex, so no two roles of one colourway share a value.
            both = [*derived["colors"].values(), *dark.values()]
            self.assertEqual(len(set(both)), len(both), hue)

    def test_derived_dark_group_follows_the_same_two_hues(self) -> None:
        for hue in range(360):
            derived = palette.derive(hue, SPEC)
            dark, out_hue = derived["dark"], derived["output_hue"]
            wanted = {
                "input": hue, "output": out_hue, "blob-start": hue, "blob-end": out_hue,
                "blob-mid": palette.mid_hue(hue, out_hue),
            }
            for role, target in wanted.items():
                H = palette.hex_to_oklch(dark[role])[2]
                self.assertLessEqual(palette.hue_distance(H, target), 5, f"{hue} {role}")
            measured = palette.hex_to_oklch(dark["output"])[2]
            self.assertFalse(palette.in_reserved(measured, SPEC["reserved_hues"]), hue)
            for role in ("input", "output"):
                self.assertGreaterEqual(palette.hex_to_oklch(dark[role])[0], 0.75, f"{hue} {role}")
            for role in ("field-start", "field-end"):
                L, C, H = palette.hex_to_oklch(dark[role])
                self.assertLessEqual(L, 0.23, f"{hue} {role}")
                self.assertLessEqual(C, 0.045, f"{hue} {role}")
            for role in palette.BLOBS:
                L, C, H = palette.hex_to_oklch(dark[role])
                self.assertLessEqual(C, 0.08, f"{hue} {role}")
                self.assertLessEqual(L, 0.30, f"{hue} {role}")
                for end in ("field-start", "field-end"):
                    self.assertGreater(
                        palette.luminance(dark[role]), palette.luminance(dark[end]),
                        f"{hue} {role} against {end}",
                    )
            for role in ("input-wash", "output-wash"):
                self.assertGreater(
                    palette.luminance(dark[role]),
                    palette.luminance(SPEC["fixed"]["dark"]["sheet"]["color"]),
                    f"{hue} {role}",
                )
        # The mint dark group is the model for the rule: its hues give nearly its values.
        mint = palette.derive(163, SPEC)["dark"]
        for role in palette.ROLES:
            got, want = palette.hex_to_rgb(mint[role]), palette.hex_to_rgb(MINT_DARK[role])
            self.assertLessEqual(max(abs(a - b) for a, b in zip(got, want)), 10, role)

    def test_derive_refuses_a_hue_whose_dark_group_fails(self) -> None:
        # The light group of hue 18 passes; a lighter overlay fails the dark one alone.
        weak = copy.deepcopy(SPEC)
        weak["fixed"]["dark"]["overlay"]["color"] = "#59636E"
        with self.assertRaises(ValueError) as caught:
            palette.derive(18, weak)
        self.assertIn("dark muted-overlay-worst", str(caught.exception))
        self.assertNotIn("fails ink", str(caught.exception))

    def test_derive_is_deterministic_and_wraps(self) -> None:
        self.assertEqual(palette.derive(18, SPEC), palette.derive(18, SPEC))
        self.assertEqual(
            palette.derive(378, SPEC)["colors"], palette.derive(18, SPEC)["colors"]
        )
        self.assertEqual(palette.derive(378, SPEC)["dark"], palette.derive(18, SPEC)["dark"])

    def test_blobs_did_not_move_the_six_colours_derived_before(self) -> None:
        # hue:202 as written by apply at 0.6.0 (the slop fixture of that release).
        colors = palette.derive(202, SPEC)["colors"]
        before = {
            "field-start": "#E3F6F7", "field-end": "#F5E6F4", "input": "#00787F",
            "input-wash": "#E5F8F9", "output": "#8D4D8C", "output-wash": "#FBEFFA",
        }
        self.assertEqual({role: colors[role] for role in before}, before)

    def test_derived_blobs_follow_the_two_hues(self) -> None:
        self.assertEqual(palette.mid_hue(163, 289), 226)
        self.assertEqual(palette.mid_hue(350, 30), 10)
        self.assertEqual(palette.mid_hue(30, 350), 10)
        for hue in range(360):
            derived = palette.derive(hue, SPEC)
            colors = derived["colors"]
            out_hue = derived["output_hue"]
            wanted = {
                "blob-start": hue, "blob-end": out_hue,
                "blob-mid": palette.mid_hue(hue, out_hue),
            }
            for role, target in wanted.items():
                L, C, H = palette.hex_to_oklch(colors[role])
                self.assertLessEqual(palette.hue_distance(H, target), 15, f"{hue} {role}")
                self.assertLessEqual(C, 0.045, f"{hue} {role}")
                self.assertGreaterEqual(L, 0.88, f"{hue} {role}")
                for end in ("field-start", "field-end"):
                    self.assertLess(
                        palette.luminance(colors[role]), palette.luminance(colors[end]),
                        f"{hue} {role} against {end}",
                    )
        # The mint preset is the model for the rule: its hues give nearly its blobs.
        mint = palette.derive(163, SPEC)["colors"]
        for role in palette.BLOBS:
            got, want = palette.hex_to_rgb(mint[role]), palette.hex_to_rgb(MINT[role])
            self.assertLessEqual(max(abs(a - b) for a, b in zip(got, want)), 6, role)


class ChooseTests(unittest.TestCase):
    def signal(self, **over) -> dict:
        base = {"band": "light", "paper_var": "--color-bg", "L": 1.0,
                "accent_var": "--color-primary", "accent_hue": 263,
                "accent_C": 0.215, "accent_hex": "#2563EB"}
        return {**base, **over}

    def test_accent_near_a_preset_uses_the_preset(self) -> None:
        choice = palette.choose(SPEC, signal=self.signal())
        self.assertEqual((choice["palette"], choice["kind"]), ("sky", "preset"))
        self.assertIn("--color-primary", choice["reason"])
        self.assertIn("#2563EB", choice["reason"])
        self.assertEqual(choice["colors"]["input"], SPEC["presets"]["sky"]["input"])
        self.assertEqual(choice["notes"], [])

    def test_accent_far_from_every_preset_is_derived(self) -> None:
        choice = palette.choose(
            SPEC, signal=self.signal(accent_hue=18, accent_C=0.22, accent_hex="#E11D48")
        )
        self.assertEqual((choice["palette"], choice["kind"]), ("hue:18", "derived"))
        self.assertIn("--color-primary", choice["reason"])
        self.assertEqual(choice["colors"], palette.derive(18, SPEC)["colors"])
        self.assertEqual(choice["output_hue"], 144)

    def test_accent_beats_keywords(self) -> None:
        choice = palette.choose(SPEC, signal=self.signal(), prompt="餐饮会员系统")
        self.assertEqual(choice["palette"], "sky")

    def test_gray_accent_is_not_an_accent(self) -> None:
        gray = self.signal(accent_hue=264, accent_C=0.023, accent_hex="#6B7280")
        choice = palette.choose(SPEC, signal=gray)
        self.assertEqual(choice["palette"], "mint")
        self.assertTrue(choice["reason"].startswith("fallback"))
        self.assertTrue(any("near gray" in note for note in choice["notes"]))
        with_words = palette.choose(SPEC, signal=gray, prompt="a compliance console")
        self.assertEqual(with_words["palette"], "slate")

    def test_gray_accent_does_not_hide_a_chromatic_one(self) -> None:
        gray = {"var": "--accent", "hue": 248, "C": 0.007, "hex": "#F1F5F9"}
        blue = {"var": "--primary", "hue": 263, "C": 0.215, "hex": "#2563EB"}
        rose = {"var": "--zz-brand", "hue": 18, "C": 0.22, "hex": "#E11D48"}
        choice = palette.choose(SPEC, signal=self.signal(accents=[gray, blue, rose]))
        self.assertEqual(choice["palette"], "sky")
        self.assertIn("accent --primary #2563EB", choice["reason"])
        self.assertEqual(
            choice["notes"],
            ["accent --accent is near gray (chroma 0.007); not used as an accent"],
        )
        # The first chromatic candidate wins; order is the order signals gives.
        first = palette.choose(SPEC, signal=self.signal(accents=[rose, blue]))
        self.assertEqual(first["palette"], "hue:18")
        self.assertEqual(first["notes"], [])
        # The accents list is authoritative: the single accent_* fields are not read with it.
        none = palette.choose(SPEC, signal=self.signal(accents=[]))
        self.assertTrue(none["reason"].startswith("fallback"))
        # Many gray tokens: three notes, then one summary line.
        grays = [{**gray, "var": f"--primary-{n}"} for n in range(6)]
        many = palette.choose(SPEC, signal=self.signal(accents=grays))
        self.assertTrue(many["reason"].startswith("fallback"))
        self.assertEqual(len(many["notes"]), 4)
        self.assertEqual(many["notes"][-1], "3 more accent tokens are near gray; not used")
        unreadable = {"var": "--brand", "hue": 263, "C": None, "hex": None}
        note = palette.choose(SPEC, signal=self.signal(accents=[unreadable]))["notes"]
        self.assertEqual(note, ["accent --brand has no readable chroma; not used as an accent"])

    def test_near_black_accent_is_not_an_accent(self) -> None:
        # shadcn/ui default: --primary: 222.2 47.4% 11.2% is ink, not a brand colour.
        ink = self.signal(accent_var="--primary", accent_hue=266, accent_C=0.04,
                          accent_hex="#0F172A")
        choice = palette.choose(SPEC, signal=ink)
        self.assertEqual(choice["palette"], "mint")
        self.assertTrue(choice["reason"].startswith("fallback"))
        self.assertEqual(
            choice["notes"],
            ["accent --primary is near black (lightness 0.21); not used as an accent"],
        )
        self.assertEqual(palette.choose(SPEC, signal=ink, prompt="餐饮")["palette"], "apricot")
        # A dark brand colour is above the floor and still counts.
        navy = self.signal(accent_var="--primary", accent_hue=266, accent_C=0.138,
                           accent_hex="#1E3A8A")
        self.assertGreater(palette.hex_to_oklch("#1E3A8A")[0], SPEC["min_accent_lightness"])
        self.assertLess(palette.hex_to_oklch("#0F172A")[0], SPEC["min_accent_lightness"])
        dark_brand = palette.choose(SPEC, signal=navy)
        self.assertEqual(dark_brand["palette"], "sky")
        self.assertIn("accent --primary #1E3A8A", dark_brand["reason"])
        self.assertEqual(dark_brand["notes"], [])
        # The next candidate is tried after a near-black one.
        black = {"var": "--primary", "hue": 266, "C": 0.04, "hex": "#0F172A"}
        rose = {"var": "--zz-brand", "hue": 18, "C": 0.22, "hex": "#E11D48"}
        after = palette.choose(SPEC, signal=self.signal(accents=[black, rose]))
        self.assertEqual(after["palette"], "hue:18")
        self.assertEqual(len(after["notes"]), 1)
        self.assertIn("near black", after["notes"][0])
        # Chroma is checked first, so a gray token keeps the near-gray note.
        charcoal = {"var": "--accent", "hue": 264, "C": 0.01, "hex": "#111214"}
        self.assertIn("near gray", palette.choose(
            SPEC, signal=self.signal(accents=[charcoal]))["notes"][0])
        # A candidate without a hex has no lightness to test and is judged on chroma.
        no_hex = {"var": "--brand", "hue": 263, "C": 0.2, "hex": None}
        self.assertEqual(
            palette.choose(SPEC, signal=self.signal(accents=[no_hex]))["palette"], "sky"
        )
        many = palette.choose(
            SPEC, signal=self.signal(accents=[{**black, "var": f"--primary-{n}"} for n in range(5)])
        )
        self.assertEqual(len(many["notes"]), 4)
        self.assertEqual(
            many["notes"][-1], "2 more accent tokens are near gray or near black; not used"
        )

    def test_accent_hue_wraps(self) -> None:
        # 359.6 degrees rounds to 360; the reason and the palette name must agree on 0.
        choice = palette.choose(SPEC, signal=self.signal(accent_hue=360, accent_hex="#D7397C"))
        self.assertEqual(choice["palette"], "hue:0")
        self.assertIn("(hue 0)", choice["reason"])
        self.assertNotIn("360", choice["reason"])
        self.assertEqual(choice["colors"], palette.derive(0, SPEC)["colors"])
        # Distance to a preset wraps through 0: 350 and 10 are 20 apart, not 340.
        self.assertEqual(palette.hue_distance(350, 10), 20)
        self.assertEqual(palette.hue_distance(10, 350), 20)
        self.assertEqual(palette.hue_distance(0, 359), 1)
        self.assertEqual(palette.hue_distance(0, 180), 180)

    def test_keywords_from_prompt_and_project(self) -> None:
        self.assertEqual(palette.choose(SPEC, prompt="餐饮会员系统")["palette"], "apricot")
        self.assertEqual(palette.choose(SPEC, prompt="a fintech console")["palette"], "sky")
        from_project = palette.choose(
            SPEC, project="# Clinic\n\nA scheduling tool for a clinic."
        )
        self.assertEqual(from_project["palette"], "mint")
        self.assertIn("clinic (project)", from_project["reason"])
        self.assertTrue(from_project["reason"].startswith("keywords"))
        # The prompt counts double the project text.
        mixed = palette.choose(SPEC, prompt="做一个审计台", project="fintech payments")
        self.assertEqual(mixed["palette"], "sky")
        prompt_wins = palette.choose(SPEC, prompt="审计 合规", project="fintech")
        self.assertEqual(prompt_wins["palette"], "slate")
        # English keywords match whole words only.
        partial = palette.choose(SPEC, prompt="database metadata")
        self.assertTrue(partial["reason"].startswith("fallback"))

    def test_readme_boilerplate_picks_no_preset(self) -> None:
        readme = (
            "# Widget\n\nA small tool.\n\n## Community\n\nJoin the community chat.\n\n"
            "## Security\n\nSee the security policy.\n\n## Enterprise\n\nEnterprise plan "
            "and cloud hosting.\n\n## Contributing\n\nOf course, contributions are welcome. "
            "Font-family and analytics are configurable.\n\n## Legal\n\n## Governance\n\n"
            "## License\n\nMIT\n\n## 社区\n\n## 安全\n\n企业版与创作者计划。\n"
        )
        choice = palette.choose(SPEC, project=readme)
        self.assertEqual(choice["palette"], SPEC["default"])
        self.assertEqual(choice["reason"], "fallback (no palette or content signal)")
        # The same words in the prompt pick nothing either.
        self.assertTrue(
            palette.choose(SPEC, prompt="community security enterprise")["reason"]
            .startswith("fallback")
        )
        # One domain word in the project text is still enough, boilerplate or not.
        single = palette.choose(SPEC, project=readme + "\n面向连锁餐饮门店。\n")
        self.assertEqual(single["palette"], "apricot")
        self.assertEqual(single["reason"], "keywords 餐饮 (project) match apricot")
        self.assertEqual(palette.choose(SPEC, project="餐饮")["palette"], "apricot")

    def test_fallback(self) -> None:
        for signal in (None, {}, {"band": "light", "accent_var": None, "accent_hue": None}):
            choice = palette.choose(SPEC, signal=signal)
            self.assertEqual(choice["palette"], "mint")
            self.assertEqual(choice["reason"], "fallback (no palette or content signal)")
            self.assertEqual(choice["colors"], MINT)

    def test_override(self) -> None:
        preset = palette.choose(SPEC, signal=self.signal(accent_hue=18), override="apricot")
        self.assertEqual(preset["palette"], "apricot")
        self.assertEqual(preset["reason"], "explicit --palette apricot")
        hue = palette.choose(SPEC, signal=self.signal(), prompt="餐饮", override="hue:18")
        self.assertEqual((hue["palette"], hue["kind"]), ("hue:18", "derived"))
        self.assertEqual(hue["reason"], "explicit --palette hue:18")
        auto = palette.choose(SPEC, signal=self.signal(), override="auto")
        self.assertEqual(auto["palette"], "sky")
        self.assertEqual(palette.choose(SPEC, override="hue:0")["palette"], "hue:0")
        self.assertEqual(palette.choose(SPEC, override="hue:359")["palette"], "hue:359")

    def test_bad_override(self) -> None:
        for value in ("hue:360", "hue:-1", "hue:abc", "hue:", "hue:1.5", "teal", "", "Mint"):
            with self.assertRaises(ValueError, msg=value):
                palette.parse_override(value, SPEC)
            with self.assertRaises(ValueError, msg=value):
                palette.choose(SPEC, override=value)

    def test_dark_project_gets_a_note_that_points_at_the_dark_group(self) -> None:
        light = palette.choose(SPEC, signal=self.signal())
        choice = palette.choose(SPEC, signal=self.signal(band="dark"))
        self.assertEqual(choice["palette"], "sky")
        self.assertEqual(
            choice["notes"],
            ["the project paper is dark; DESIGN.md carries a light and a dark group, "
             "and this project starts from the dark one"],
        )
        # The paper band moves no colour: both groups are written either way.
        self.assertEqual(light["notes"], [])
        self.assertEqual((choice["colors"], choice["dark"]), (light["colors"], light["dark"]))

    def test_every_choice_carries_both_groups(self) -> None:
        preset = palette.choose(SPEC, signal=self.signal())
        self.assertEqual(preset["colors"], preset_colors("sky"))
        self.assertEqual(preset["dark"], SPEC["presets"]["sky"]["dark"])
        self.assertEqual(list(preset["dark"]), list(palette.ROLES))
        derived = palette.choose(SPEC, override="hue:18")
        self.assertEqual(derived["dark"], palette.derive(18, SPEC)["dark"])
        fallback = palette.choose(SPEC)
        self.assertEqual((fallback["colors"], fallback["dark"]), (MINT, MINT_DARK))
        # A choice is a copy: changing it does not change the palette data.
        fallback["dark"]["input"] = "#000000"
        self.assertEqual(palette.choose(SPEC)["dark"], MINT_DARK)
        for name in SPEC["presets"]:
            choice = palette.choose(SPEC, override=name)
            self.assertEqual(palette.failed_gates(choice["colors"], choice["dark"], SPEC["fixed"]), [])

    def test_choice_is_deterministic(self) -> None:
        cases = [
            {"signal": self.signal()},
            {"signal": self.signal(accent_hue=18)},
            {"prompt": "餐饮会员系统", "project": "fintech"},
            {},
            {"override": "hue:200"},
        ]
        for kwargs in cases:
            self.assertEqual(palette.choose(SPEC, **kwargs), palette.choose(SPEC, **kwargs))


BLOCK_NAMES = ("colourway", "colourway-dark", "contrast", "contrast-dark")


def marked(begin: str, body: str = "old", end: str | None = None) -> str:
    return f"<!-- palette:begin {begin} -->\n{body}\n<!-- palette:end {begin if end is None else end} -->"


def blocks_of(text: str) -> dict[str, str]:
    """The palette blocks of a document by name, in document order."""
    return {m.group("name"): m.group("body") for m in palette.BLOCK.finditer(text)}


# The smallest template render() accepts: one default hex of each group and the four blocks.
MINI = "light #E7F6F1, dark #0F1B1F\n" + "\n".join(marked(name) for name in BLOCK_NAMES) + "\n"


class RenderTests(unittest.TestCase):
    def test_render_fills_a_light_and_a_dark_block_of_each_kind(self) -> None:
        sky = palette.choose(SPEC, override="sky")
        out = palette.render(MINI, sky, SPEC)
        # Each default hex becomes the hex of the same role in the same group.
        self.assertEqual(out.split("\n")[0], "light #E8F3FF, dark #121A22")
        blocks = blocks_of(out)
        self.assertEqual(list(blocks), list(BLOCK_NAMES))
        self.assertNotIn("old", out)
        self.assertEqual(
            blocks["colourway"],
            "Colourway: `sky` (天蓝 → 鼠尾草绿 / sky to sage).\n"
            "\n"
            "- Field: `#E8F3FF` to `#E5F3E7`.\n"
            "- Blobs: `#D2E7FE`, `#CAE5CE`, `#D6EDEE`, each at opacity 0.70.\n"
            "- Input: `#1F6CB0` on `#EBF5FF`.\n"
            "- Output: `#317A45` on `#EBF8EC`.\n"
            "- Other colourways: `mint`, `sky`, `apricot`, `slate`, or `hue:<0-359>`.",
        )
        self.assertEqual(
            blocks["colourway-dark"],
            "Dark group of `sky`.\n"
            "\n"
            "- Field: `#121A22` to `#0B1F10`.\n"
            "- Blobs: `#1B2B3C`, `#053616`, `#06292B`, each at opacity 0.70.\n"
            "- Input: `#82C0FF` on `#233242`.\n"
            "- Output: `#7CD18F` on `#233527`.",
        )
        for name, theme, colors in (
            ("contrast", "light", sky["colors"]), ("contrast-dark", "dark", sky["dark"]),
        ):
            rows = palette.gates(colors, SPEC["fixed"], theme)
            lines = [line for line in blocks[name].split("\n") if line.startswith("| ")]
            self.assertEqual(lines[0], "| 前景 | 背景 | 比值 | 门槛 | 用途 |", name)
            self.assertEqual(len(lines) - 2, len(rows), name)
            for line, row in zip(lines[2:], rows):
                wanted = "只报告" if row["min"] is None else f"{row['min']:g}"
                self.assertEqual(
                    line,
                    f"| {row['fg_label']} | {row['bg_label']} | {row['ratio']:.2f} | {wanted} "
                    f"| {row['use']} |",
                )
        self.assertEqual(len([l for l in blocks["contrast"].split("\n") if l.startswith("| ")]), 21)
        self.assertEqual(
            len([l for l in blocks["contrast-dark"].split("\n") if l.startswith("| ")]), 26
        )
        # Rendering the result again with the same choice changes nothing.
        self.assertEqual(palette.render(out, sky, SPEC), out)
        derived = palette.render(MINI, palette.choose(SPEC, override="hue:18"), SPEC)
        self.assertTrue(blocks_of(derived)["colourway-dark"].startswith("Dark group of `hue:18`.\n"))

    def test_dark_contrast_block_leads_with_the_dark_numbers(self) -> None:
        mint = palette.choose(SPEC, override="mint")
        lead = palette.render(MINI, mint, SPEC)
        lead = blocks_of(lead)["contrast-dark"].split("\n| 前景 ")[0]
        self.assertEqual(
            lead,
            "In the dark group, inputs, checkboxes, radios, and switches draw their boundary in "
            "`{colors.control-edge-dark}`. That edge is 3.24:1 on the worst paper and 3.22:1 on "
            "the worst overlay; the non-text minimum is 3:1. The 2px focus ring is "
            "`{colors.input-dark}` (`#5FD6A8`): 8.55:1 on the worst paper and 8.31:1 on the "
            "worst overlay. The paper edge on the field start is 1.36:1, so it cannot be a "
            "control boundary.\n"
            "\n"
            "`{colors.ink-dark}` may sit directly on the field: 12.86:1 on the worst blob. "
            "`{colors.muted-dark}` on the field is 6.81:1 at worst, so 12px secondary text may "
            "sit on the field in this colourway.\n",
        )
        # A blob light enough to take muted text under 4.5:1 turns the verdict around.
        pale = {**mint, "dark": {**mint["dark"], "blob-mid": "#55606E"}}
        self.assertIn(
            "`{colors.muted-dark}` on the field is 3.98:1 at worst, below 4.5:1, so secondary "
            "text stays on paper or a well in this colourway.",
            palette.contrast_block(pale, SPEC, "dark"),
        )

    def test_block_names_are_lowercase_words_joined_by_single_hyphens(self) -> None:
        def names(text: str) -> list[str]:
            return [m.group("name") for m in palette.BLOCK.finditer(text)]

        for good in ("colourway", "colourway-dark", "contrast-dark", "a-b-c"):
            self.assertEqual(names(marked(good)), [good], good)
        for bad in ("Colourway", "colourway_dark", "colourway2", "-dark", "dark-",
                    "colourway--dark", "colourway dark", "colourway-Dark", ""):
            self.assertEqual(names(marked(bad)), [], bad)
        # The end marker must carry the whole name of the begin marker.
        self.assertEqual(names(marked("colourway", end="colourway-dark")), [])
        self.assertEqual(names(marked("colourway-dark", end="colourway")), [])
        # A block ends at its own end marker, not at the one of a longer name.
        both = marked("colourway", "one") + "\n" + marked("colourway-dark", "two")
        self.assertEqual(blocks_of(both), {"colourway": "one", "colourway-dark": "two"})
        nested = marked("colourway", marked("colourway-dark", "inner"))
        self.assertEqual(names(nested), ["colourway"])

    def test_render_needs_all_four_blocks_and_knows_no_other(self) -> None:
        sky = palette.choose(SPEC, override="sky")
        for name in BLOCK_NAMES:
            broken = MINI.replace(f"<!-- palette:begin {name} -->", "<!-- gone -->")
            with self.assertRaises(ValueError) as caught:
                palette.render(broken, sky, SPEC)
            self.assertEqual(str(caught.exception), f"template has no palette block {name}")
        with self.assertRaises(ValueError) as caught:
            palette.render(MINI + marked("colourway-darker") + "\n", sky, SPEC)
        self.assertEqual(str(caught.exception), "unknown palette block 'colourway-darker'")
        # A marker whose name is not well formed is not a block: it is left as written.
        loose = MINI + marked("Colourway_2") + "\n"
        self.assertTrue(palette.render(loose, sky, SPEC).endswith(marked("Colourway_2") + "\n"))

    def check_document(self, text: str, colors: dict, dark: dict) -> None:
        fixed = SPEC["fixed"]
        allowed = {
            *colors.values(), *dark.values(), fixed["ink"], fixed["muted"], "#FFFFFF",
            fixed["dark"]["ink"], fixed["dark"]["muted"], fixed["dark"]["sheet"]["color"],
            fixed["dark"]["overlay"]["color"],
        }
        self.assertEqual(set(re.findall(r"#[0-9A-Fa-f]{6}\b", text)) - allowed, set())
        head = text[: text.index("\n---\n", 4)]
        for role in palette.ROLES:
            self.assertIn(f'  {role}: "{colors[role]}"', head)
            self.assertIn(f'  {role}-dark: "{dark[role]}"', head)
        self.assertNotIn("canvas-mint", text)
        self.assertNotIn("canvas-lavender", text)
        for group in (colors, dark):
            self.assertIn(
                f"linear-gradient(160deg, {group['field-start']}, {group['field-end']})", text
            )
            for role in palette.BLOBS:
                self.assertIn(
                    f"color-mix(in srgb, {group[role]} 70%, transparent), transparent 70%)", text
                )
        # Every gate row of each group is in its table with the measured ratio.
        blocks = blocks_of(text)
        self.assertEqual(list(blocks), ["colourway", "colourway-dark", "contrast", "contrast-dark"])
        tables = {}
        for name, theme, group in (("contrast", "light", colors), ("contrast-dark", "dark", dark)):
            table = blocks[name]
            rows = palette.gates(group, fixed, theme)
            lines = [line for line in table.split("\n") if line.startswith("| ")]
            self.assertEqual(lines[0], "| 前景 | 背景 | 比值 | 门槛 | 用途 |")
            self.assertEqual(len(lines) - 2, len(rows))
            for line, row in zip(lines[2:], rows):
                wanted = "只报告" if row["min"] is None else f"{row['min']:g}"
                self.assertEqual(
                    line,
                    f"| {row['fg_label']} | {row['bg_label']} | {row['ratio']:.2f} | {wanted} "
                    f"| {row['use']} |",
                )
            self.assertEqual(sum("| 只报告 |" in line for line in lines), len(REPORTED))
            tables[name] = (table, {row["id"]: row for row in rows})
        # The three blob tokens, the control boundary table, and the lead numbers.
        for role in palette.BLOBS:
            self.assertIn(f"`{{colors.{role}}}` (`{colors[role]}`)", text)
        table, by_id = tables["contrast"]
        self.assertIn(f"that edge is {by_id['control-edge-sheet']['ratio']:.2f}:1", table)
        self.assertIn(f"on the field is {by_id['muted-field-worst']['ratio']:.2f}:1 at worst", table)
        table, by_id = tables["contrast-dark"]
        self.assertIn(
            f"That edge is {by_id['control-edge-sheet']['ratio']:.2f}:1 on the worst paper and "
            f"{by_id['control-edge-overlay']['ratio']:.2f}:1 on the worst overlay",
            table,
        )
        self.assertIn(f"on the field is {by_id['muted-field-worst']['ratio']:.2f}:1 at worst", table)
        # The token table in Dark Group names the dark values of this colourway.
        section = text[text.index("## Dark Group") : text.index("## Typography")]
        self.assertIn(f"| `{dark['field-start']}`, `{dark['field-end']}` |", section)
        self.assertIn("| " + ", ".join(f"`{dark[role]}`" for role in palette.BLOBS) + " |", section)
        self.assertIn(f"| `{dark['input']}`, `{dark['input-wash']}` |", section)
        self.assertIn(f"| `{dark['output']}`, `{dark['output-wash']}` |", section)
        self.assertIn("### Control boundaries", text)
        self.assertNotIn("—", text)
        for line in text.split("\n"):
            self.assertEqual(line, line.rstrip())

    def test_template_is_the_default_colourway(self) -> None:
        text = template()
        mint = palette.choose(SPEC, override="mint")
        self.assertEqual(palette.render(text, mint, SPEC), text)
        self.check_document(text, MINT, MINT_DARK)
        for name in BLOCK_NAMES:
            self.assertEqual(text.count(f"<!-- palette:begin {name} -->"), 1)
            self.assertEqual(text.count(f"<!-- palette:end {name} -->"), 1)
        # Both groups of the colourway sit in the dial section, both tables under Accessibility.
        dial = text[text.index("## Colourway") : text.index("## Colors")]
        self.assertEqual(list(blocks_of(dial)), ["colourway", "colourway-dark"])
        measured = text[text.index("## Accessibility") : text.index("## Writing Tone")]
        self.assertEqual(list(blocks_of(measured)), ["contrast", "contrast-dark"])
        self.assertLess(
            measured.index("### Dark group contrast"),
            measured.index("<!-- palette:begin contrast-dark -->"),
        )
        self.assertLess(
            measured.index("<!-- palette:end contrast-dark -->"),
            measured.index("### Control boundaries"),
        )

    def test_template_names_colours_only_inside_the_colourway_blocks(self) -> None:
        text = template()
        outside = text
        for name in ("colourway", "colourway-dark"):
            start = outside.index(f"<!-- palette:begin {name} -->")
            end = outside.index(f"<!-- palette:end {name} -->")
            outside = outside[:start] + outside[end:]
        outside = outside.lower()
        for word in ("mint", "lavender", "green", "purple", "薄荷", "薰衣草", "绿", "紫"):
            self.assertNotIn(word, outside, word)
        self.assertNotIn("#1F8A62", text)
        # slop_check gate 2a waives a declared gradient only when Overview says so.
        overview = text[text.index("## Overview") : text.index("## Colourway")]
        self.assertIn("gradient", overview)

    def test_every_preset_and_derived_hue_renders_without_stale_colours(self) -> None:
        text = template()
        choices = [palette.choose(SPEC, override=name) for name in SPEC["presets"]]
        choices += [palette.choose(SPEC, override=f"hue:{hue}") for hue in range(0, 360, 15)]
        default = {*MINT.values(), *MINT_DARK.values()}
        for choice in choices:
            out = palette.render(text, choice, SPEC)
            self.check_document(out, choice["colors"], choice["dark"])
            self.assertIn(f"Colourway: `{choice['palette']}`", out)
            self.assertIn(f"Dark group of `{choice['palette']}`.", out)
            chosen = {*choice["colors"].values(), *choice["dark"].values()}
            for value in default - chosen:
                self.assertNotIn(value, out, choice["palette"])
            # Rendering a rendered file again with the same choice changes nothing:
            # no default hex is left to swap, and the blocks come out the same.
            self.assertEqual(palette.render(out, choice, SPEC), out, choice["palette"])

    def test_no_colourway_reuses_a_default_hex_in_another_role(self) -> None:
        # render() swaps by hex. A chosen value equal to the default hex of a different
        # role would be swapped a second time when the same file is rendered again.
        default = {**MINT, **{f"{role}-dark": value for role, value in MINT_DARK.items()}}
        owner = {value: role for role, value in default.items()}
        choices = [palette.choose(SPEC, override=name) for name in SPEC["presets"]]
        choices += [palette.choose(SPEC, override=f"hue:{hue}") for hue in range(360)]
        for choice in choices:
            chosen = {
                **choice["colors"],
                **{f"{role}-dark": value for role, value in choice["dark"].items()},
            }
            for role, value in chosen.items():
                self.assertEqual(
                    owner.get(value, role), role, f"{choice['palette']} {role} {value}"
                )

    def test_muted_on_the_field_verdict_follows_the_measured_ratio(self) -> None:
        choice = palette.choose(SPEC, override="mint")
        self.assertIn("so secondary text stays on paper or a well", palette.contrast_block(choice, SPEC))
        dark = {**SPEC, "fixed": {**SPEC["fixed"], "muted": "#3A4650"}}
        self.assertIn(
            "so 12px secondary text may sit on the field", palette.contrast_block(choice, dark)
        )


def css_rules(css: str) -> list[tuple[str, str]]:
    """Flat (selector, body) pairs of a stylesheet; an at-rule prefixes its inner selectors."""
    out: list[tuple[str, str]] = []

    def walk(text: str, prefix: str) -> None:
        pos = 0
        while True:
            brace = text.find("{", pos)
            if brace == -1:
                return
            depth, end = 1, brace + 1
            while depth:
                depth += {"{": 1, "}": -1}.get(text[end], 0)
                end += 1
            selector = " ".join(text[pos:brace].split())
            body = text[brace + 1 : end - 1]
            if selector.startswith("@"):
                walk(body, f"{prefix}{selector} ")
            else:
                out.append((f"{prefix}{selector}", body))
            pos = end

    walk(re.sub(r"/\*.*?\*/", "", css, flags=re.S), "")
    return out


class MaterialModelTests(unittest.TestCase):
    """The entry states the four-layer material: nothing but an overlay may blur."""

    def setUp(self) -> None:
        self.text = template()
        self.css = "\n".join(re.findall(r"```css\n(.*?)```", self.text, flags=re.S))
        self.rules = css_rules(self.css)

    def bodies(self, selector: str) -> list[str]:
        return [body for name, body in self.rules if name == selector]

    def test_both_entry_files_are_byte_identical(self) -> None:
        self.assertEqual(
            (CATALOG / "styles" / "airy-glass.md").read_bytes(),
            (CATALOG / "first-party" / "airy-glass.md").read_bytes(),
        )

    def test_backdrop_filter_belongs_to_overlays_only(self) -> None:
        prose = re.sub(r"```css\n.*?```", "", self.text, flags=re.S)
        mentions = [line for line in prose.split("\n") if "backdrop-filter" in line]
        self.assertTrue(mentions)
        for line in mentions:
            self.assertRegex(line, r"(?i)\boverlays?\b", line)
        blurred = [name for name, body in self.rules if "backdrop-filter" in body]
        self.assertTrue(blurred)
        for name in blurred:
            self.assertIn(".overlay", name)
            self.assertNotIn(".sheet", name)
        for line in self.text.split("\n"):
            self.assertNotRegex(line, r"(?i)paper (is the only surface that )?may blur")
            self.assertNotRegex(line, r"(?i)blur only the paper")
        head = self.text[: self.text.index("\n---\n", 4)]
        for stale in ("sheet-blur", "sheet-saturate", "blob-blur", "solid-breakpoint"):
            self.assertNotIn(stale, head)

    def test_paper_recipe(self) -> None:
        (sheet,) = self.bodies(".sheet")
        self.assertIn("background: rgba(255,255,255,0.62);", sheet)
        self.assertIn("border: 1px solid rgba(255,255,255,0.70);", sheet)
        self.assertIn(
            "box-shadow: inset 0 1px 0 rgba(255,255,255,0.55), "
            "0 12px 40px -16px rgba(30,60,90,0.14);",
            sheet,
        )
        self.assertNotIn("backdrop-filter", sheet)
        head = self.text[: self.text.index("\n---\n", 4)]
        self.assertIn('  sheet-edge: "rgba(255,255,255,0.70)"', head)
        self.assertIn('  sheet-highlight: "inset 0 1px 0 rgba(255,255,255,0.55)"', head)
        self.assertIn('  sheet-shadow: "0 12px 40px -16px rgba(30,60,90,0.14)"', head)

    def test_field_blobs_are_radial_falloffs_over_the_linear_gradient(self) -> None:
        (field,) = self.bodies(".field")
        layers = [layer.strip() for layer in field.split("background:")[1].split(",\n")]
        self.assertEqual(len(layers), 4)
        for layer in layers[:3]:
            self.assertRegex(layer, r"^radial-gradient\(.*, transparent 70%\)$")
        self.assertRegex(layers[3], r"^linear-gradient\(160deg, #E7F6F1, #EDE7F8\);$")
        self.assertNotIn("filter", field)
        self.assertNotIn("Blob paints raise chroma without a separate hex", self.text)

    def test_overlay_recipe_and_fallbacks(self) -> None:
        (overlay,) = self.bodies(".overlay")
        self.assertIn("background: rgba(255,255,255,0.82);", overlay)
        self.assertIn("0 24px 64px -24px rgba(30,60,90,0.22);", overlay)
        self.assertNotIn("backdrop-filter", overlay)
        (blur,) = self.bodies(".overlay.is-scrolled-under")
        self.assertIn("backdrop-filter: blur(20px) saturate(1.15);", blur)
        (no_blur,) = self.bodies("@supports not (backdrop-filter: blur(1px)) .overlay")
        self.assertIn("rgba(255,255,255,0.96)", no_blur)
        reduced = "@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) "
        (solid,) = self.bodies(f"{reduced}.sheet, .overlay")
        self.assertIn("rgba(255,255,255,0.96)", solid)
        self.assertNotIn("max-width", self.css)
        self.assertNotIn("960px", self.text)
        self.assertIn("at most 6 overlays that use `backdrop-filter`", self.text)

    def test_layout_and_text_placement_rules(self) -> None:
        layout = self.text[self.text.index("## Layout") : self.text.index("## Elevation & Depth")]
        self.assertIn("At least two papers sit directly on the field", layout)
        self.assertIn("Do not nest paper inside paper", layout)
        self.assertIn("A page title may sit directly on the field in `{colors.ink}`", layout)
        self.assertNotIn("never on the field", self.text)
        self.assertNotIn("Don't put text on the field", self.text)

    def test_control_boundary_table(self) -> None:
        section = self.text[self.text.index("### Control boundaries") :]
        section = section[: section.index("\n## ")]
        rows = {
            cells[0]: cells[1:]
            for cells in (
                [cell.strip() for cell in line.strip("|").split("|")]
                for line in section.split("\n")
                if line.startswith("| ") and not line.startswith("| ---")
            )
        }
        for control in ("Text input, textarea, select", "Checkbox or radio, off", "Switch, off"):
            self.assertIn("`{colors.control-edge}`", rows[control][0], control)
            self.assertEqual(rows[control][1], "Required: 3:1 on paper", control)
        for control in ("Primary button", "Secondary button", "Tag", "Segmented item"):
            self.assertEqual(rows[control][1], "No outline", control)
            self.assertNotIn("control-edge", rows[control][0], control)
        self.assertIn("2px `{colors.input}`", rows["Focus ring, every control"][0])

    def test_comment_cannot_close_itself(self) -> None:
        choice = {**palette.choose(SPEC), "reason": "keywords a --> b"}
        self.assertEqual(palette.comment(choice).count("-->"), 1)


class DarkGroupTests(unittest.TestCase):
    """The entry states the dark group: its tokens, the rules that differ, and its recipe."""

    def setUp(self) -> None:
        self.text = template()
        self.head = self.text[: self.text.index("\n---\n", 4)]
        self.section = self.text[
            self.text.index("## Dark Group") : self.text.index("## Typography")
        ]
        css = "\n".join(re.findall(r"```css\n(.*?)```", self.section, flags=re.S))
        self.rules = css_rules(css)

    def body(self, selector: str) -> str:
        (found,) = [body for name, body in self.rules if name == selector]
        return found

    def test_section_follows_colors_and_overview_states_the_switch_rule(self) -> None:
        order = [self.text.index(f"\n## {name}\n") for name in ("Colors", "Dark Group", "Typography")]
        self.assertEqual(order, sorted(order))
        self.assertEqual(self.text.count("\n## Dark Group\n"), 1)
        # design-md-format.md section 4: a dark group states its switch rule in Overview.
        overview = self.text[self.text.index("## Overview") : self.text.index("## Colourway")]
        for needle in ("`-dark`", "system appearance", "explicit choice"):
            self.assertIn(needle, overview)
        for needle in ("`prefers-color-scheme: dark`", "An explicit choice by the user wins"):
            self.assertIn(needle, self.section)

    def test_every_dark_token_has_a_light_twin_and_is_named_in_the_section(self) -> None:
        groups = {
            "colors": self.head[self.head.index("\ncolors:\n") : self.head.index("\ntypography:\n")],
            "elevation": self.head[self.head.index("\nelevation:\n") : self.head.index("\nmotion:\n")],
        }
        found = {
            group: re.findall(r"^  ([a-z-]+)-dark: ", block, flags=re.M)
            for group, block in groups.items()
        }
        self.assertEqual(len(found["colors"]), 19)
        self.assertEqual(
            found["elevation"],
            ["sheet-highlight", "sheet-shadow", "overlay-highlight", "overlay-shadow"],
        )
        for group, block in groups.items():
            self.assertEqual(len(found[group]), len(set(found[group])), group)
            light = set(re.findall(r"^  ([a-z-]+): ", block, flags=re.M))
            light = {name for name in light if not name.endswith("-dark")}
            # Every token of the group has a dark twin, and no twin is an orphan.
            self.assertEqual(set(found[group]), light, group)
            for name in found[group]:
                self.assertIn(f"`{{{group}.{name}-dark}}`", self.section, name)
                self.assertIn(f"`{{{group}.{name}}}`", self.section, name)
        # Typography, radii, spacing, material and motion are shared by both groups.
        rest = self.head
        for block in groups.values():
            rest = rest.replace(block, "")
        self.assertNotIn("-dark:", rest)
        self.assertIn(
            "Typography, radii, spacing, `material`, and motion have no dark twin", self.section
        )

    def test_dark_paper_is_a_dark_colour_not_white(self) -> None:
        sheet = self.body(':root[data-theme="dark"] .sheet')
        self.assertIn("background: rgba(28,37,48,0.60);", sheet)
        self.assertIn("border-color: rgba(255,255,255,0.08);", sheet)
        self.assertIn(
            "box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), "
            "0 12px 40px -16px rgba(0,0,0,0.45);",
            sheet,
        )
        self.assertNotIn("backdrop-filter", sheet)
        self.assertNotIn("255,255,255", sheet.split("background:")[1].split(";")[0])
        self.assertIn("It is not white at a low alpha", self.section)
        self.assertIn('  sheet-shadow-dark: "0 12px 40px -16px rgba(0,0,0,0.45)"', self.head)
        self.assertIn('  overlay-shadow-dark: "0 24px 64px -24px rgba(0,0,0,0.60)"', self.head)

    def test_dark_field_well_and_overlay_recipes(self) -> None:
        field = self.body(':root[data-theme="dark"] .field')
        layers = [layer.strip() for layer in field.split("background:")[1].split(",\n")]
        self.assertEqual(len(layers), 4)
        for layer in layers[:3]:
            self.assertRegex(layer, r"^radial-gradient\(.*, transparent 70%\)$")
        self.assertRegex(layers[3], r"^linear-gradient\(160deg, #0F1B1F, #18172B\);$")
        self.assertNotIn("filter", field)
        self.assertIn(
            "background: rgba(231,237,243,0.04);", self.body(':root[data-theme="dark"] .well')
        )
        overlay = self.body(':root[data-theme="dark"] .overlay')
        self.assertIn("background: rgba(30,40,52,0.84);", overlay)
        self.assertIn("border-color: rgba(255,255,255,0.08);", overlay)
        self.assertIn(
            "box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), "
            "0 24px 64px -24px rgba(0,0,0,0.60);",
            overlay,
        )
        # Without blur, and when the user asks for less transparency, the dark fallback
        # is the paper colour at 0.96, for paper and overlays alike.
        no_blur = self.body(
            '@supports not (backdrop-filter: blur(1px)) :root[data-theme="dark"] .overlay'
        )
        self.assertIn("background: rgba(28,37,48,0.96);", no_blur)
        reduced = "@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) "
        solid = self.body(
            f'{reduced}:root[data-theme="dark"] .sheet, :root[data-theme="dark"] .overlay'
        )
        self.assertIn("background: rgba(28,37,48,0.96);", solid)
        # The dark recipe adds no blur of its own: which overlay may blur is a light rule.
        self.assertFalse([name for name, body in self.rules if "backdrop-filter" in body])
        self.assertIn(
            "Under 减少透明度 and under system high contrast, paper and overlays use "
            "`{colors.sheet-solid-dark}`",
            self.section,
        )

    def test_rules_and_known_gaps(self) -> None:
        # The limits the palette tests hold every dark group to are the ones stated here.
        self.assertIn("OKLCH L at most 0.23, C at most 0.045", self.section)
        self.assertIn("a blob stays at C 0.08 or less", self.section)
        self.assertIn("An overlay is lighter than paper", self.section)
        self.assertIn("`{colors.on-input-dark}`", self.section)
        donts = self.text[self.text.index("### Don't") : self.text.index("## Responsive Behavior")]
        self.assertIn("- Don't make dark paper from white at a low alpha", donts)
        dos = self.text[self.text.index("### Do\n") : self.text.index("### Don't")]
        self.assertIn("- Ship the light group and the dark group together.", dos)
        gaps = self.text[self.text.index("## Known Gaps") :]
        self.assertNotIn("No dark theme", self.text)
        self.assertNotIn("Every colourway is light", self.text)
        self.assertIn("- No high-contrast palette.", gaps)
        # The control table names the label token, so its dark twin applies to it.
        table = self.text[self.text.index("### Control boundaries") :]
        self.assertIn("| Primary button | Fill `{colors.input}`, label `{colors.on-input}` |", table)


class ReferencePageTests(unittest.TestCase):
    """assets/reference/airy-glass/index.html is the mint target picture for non-CSS stacks."""

    # The two places that bind the dark group: the system appearance, unless the reader
    # chose light by hand, and the reader's own choice of dark.
    FOLLOWED = '@media (prefers-color-scheme: dark) :root:not([data-theme="light"])'
    CHOSEN = ':root[data-theme="dark"]'

    @classmethod
    def setUpClass(cls) -> None:
        cls.page = REFERENCE_PAGE.read_text(encoding="utf-8")
        cls.css = "\n".join(re.findall(r"<style>(.*?)</style>", cls.page, flags=re.S))
        cls.rules = css_rules(cls.css)
        root = next(body for name, body in cls.rules if name == ":root")
        cls.tokens = dict(re.findall(r"(--[\w-]+):\s*([^;]+);", root))

    def block(self, selector: str) -> dict:
        (body,) = [body for name, body in self.rules if name == selector]
        return dict(re.findall(r"([\w-]+):\s*([^;]+);", body))

    def test_dark_tokens_are_the_mint_dark_group(self) -> None:
        followed, chosen = self.block(self.FOLLOWED), self.block(self.CHOSEN)
        # The system appearance and the explicit choice bind the same values.
        self.assertEqual(followed, chosen)
        self.assertEqual(chosen.pop("color-scheme"), "dark")
        self.assertEqual(self.block(":root")["color-scheme"], "light")
        dark, fixed = SPEC["presets"]["mint"]["dark"], SPEC["fixed"]["dark"]

        def rgba(layer: dict) -> str:
            r, g, b = palette.hex_to_rgb(layer["color"])
            return f"rgba({r},{g},{b},{layer['alpha']:.2f})"

        for role in palette.ROLES:
            self.assertEqual(chosen[f"--color-{role}"], dark[role], role)
        self.assertEqual(chosen["--color-field-start"], "#0F1B1F")
        self.assertEqual(chosen["--color-ink"], fixed["ink"])
        self.assertEqual(chosen["--color-muted"], fixed["muted"])
        self.assertEqual(chosen["--color-sheet"], rgba(fixed["sheet"]))
        self.assertEqual(chosen["--color-sheet"], "rgba(28,37,48,0.60)")
        self.assertEqual(chosen["--color-overlay"], rgba(fixed["overlay"]))
        self.assertEqual(chosen["--color-sheet-edge"], rgba(fixed["sheet-edge"]))
        self.assertEqual(chosen["--color-control-edge"], rgba(fixed["control-edge"]))
        self.assertEqual(
            chosen["--color-well"],
            rgba({"color": fixed["ink"], "alpha": SPEC["fixed"]["well-alpha"]}),
        )
        # The label on an input fill and the opaque fallback are the paper colour.
        self.assertEqual(chosen["--color-on-input"], fixed["sheet"]["color"])
        self.assertEqual(
            chosen["--color-sheet-solid"], rgba({"color": fixed["sheet"]["color"], "alpha": 0.96})
        )
        self.assertEqual(
            chosen["--highlight-sheet"], f"inset 0 1px 0 {rgba(fixed['sheet-highlight'])}"
        )
        self.assertEqual(
            chosen["--highlight-overlay"], f"inset 0 1px 0 {rgba(fixed['overlay-highlight'])}"
        )
        # The dark group rebinds every colour and elevation token of :root, and only those:
        # fonts, radii, spacing and the blob opacity are shared.
        themed = {
            name for name in self.tokens
            if name.startswith(("--color-", "--highlight-", "--shadow-"))
        }
        self.assertEqual(set(chosen), themed)
        self.assertEqual(len(themed), 23)

    def test_dark_material_matches_the_entry(self) -> None:
        head = template()[: template().index("\n---\n", 4)]
        chosen = self.block(self.CHOSEN)
        for token, key in (
            ("--color-sheet-solid", "sheet-solid-dark"), ("--color-sheet-edge", "sheet-edge-dark"),
            ("--color-control-fill", "control-fill-dark"), ("--color-well", "well-dark"),
            ("--color-on-input", "on-input-dark"),
            ("--highlight-sheet", "sheet-highlight-dark"), ("--shadow-sheet", "sheet-shadow-dark"),
            ("--highlight-overlay", "overlay-highlight-dark"),
            ("--shadow-overlay", "overlay-shadow-dark"),
        ):
            self.assertIn(f'  {key}: "{chosen[token]}"', head, token)
        self.assertEqual(
            f"{chosen['--highlight-sheet']}, {chosen['--shadow-sheet']}",
            "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 40px -16px rgba(0,0,0,0.45)",
        )
        self.assertEqual(
            f"{chosen['--highlight-overlay']}, {chosen['--shadow-overlay']}",
            "inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 64px -24px rgba(0,0,0,0.60)",
        )
        # Only the token blocks differ between the groups: no other rule names a theme.
        themed_rules = [name for name, _ in self.rules if "data-theme" in name or "color-scheme" in name]
        self.assertEqual(themed_rules, [self.FOLLOWED, self.CHOSEN])

    def test_root_values_are_the_mint_preset(self) -> None:
        mint = SPEC["presets"]["mint"]
        for role in palette.ROLES:
            self.assertEqual(self.tokens[f"--color-{role}"], mint[role], role)
        fixed = SPEC["fixed"]
        self.assertEqual(self.tokens["--color-ink"], fixed["ink"])
        self.assertEqual(self.tokens["--color-muted"], fixed["muted"])
        self.assertEqual(
            self.tokens["--color-sheet"], f"rgba(255,255,255,{fixed['sheet-alpha']:.2f})"
        )
        self.assertEqual(
            self.tokens["--color-overlay"], f"rgba(255,255,255,{fixed['overlay-alpha']:.2f})"
        )
        r, g, b = palette.hex_to_rgb(fixed["ink"])
        self.assertEqual(
            self.tokens["--color-well"], f"rgba({r},{g},{b},{fixed['well-alpha']:.2f})"
        )
        r, g, b = palette.hex_to_rgb(fixed["control-edge"]["color"])
        self.assertEqual(
            self.tokens["--color-control-edge"],
            f"rgba({r},{g},{b},{fixed['control-edge']['alpha']:.2f})",
        )
        self.assertEqual(self.tokens["--blob-opacity"], f"{fixed['blob-alpha'] * 100:.0f}%")
        # No other hex in the page: every colour comes from the preset or the fixed values
        # of one of the two groups.
        dark = fixed["dark"]
        allowed = {
            *(mint[role] for role in palette.ROLES), fixed["ink"], fixed["muted"], "#FFFFFF",
            *(mint["dark"][role] for role in palette.ROLES), dark["ink"], dark["muted"],
            dark["sheet"]["color"],
        }
        self.assertEqual(set(re.findall(r"#[0-9A-Fa-f]{6}\b", self.css)) - allowed, set())

    def test_root_material_matches_the_entry(self) -> None:
        head = template()[: template().index("\n---\n", 4)]
        for token, key in (
            ("--color-sheet-solid", "sheet-solid"), ("--color-sheet-edge", "sheet-edge"),
            ("--color-control-fill", "control-fill"),
        ):
            self.assertIn(f'  {key}: "{self.tokens[token]}"', head, token)
        sheet = f"{self.tokens['--highlight-sheet']}, {self.tokens['--shadow-sheet']}"
        self.assertEqual(
            sheet, "inset 0 1px 0 rgba(255,255,255,0.55), 0 12px 40px -16px rgba(30,60,90,0.14)"
        )
        overlay = f"{self.tokens['--highlight-overlay']}, {self.tokens['--shadow-overlay']}"
        self.assertEqual(
            overlay, "inset 0 1px 0 rgba(255,255,255,0.65), 0 24px 64px -24px rgba(30,60,90,0.22)"
        )

    def test_only_the_overlay_blurs(self) -> None:
        blurred = [name for name, body in self.rules if "backdrop-filter" in body]
        self.assertTrue(blurred)
        for name in blurred:
            self.assertIn(".overlay", name)
            self.assertNotIn(".sheet", name)
        self.assertEqual(self.css.count("blur("), 2)  # the overlay rule and its @supports test
        self.assertNotRegex(self.css, r"(?<!backdrop-)filter\s*:")
        field = next(body for name, body in self.rules if name == ".field")
        self.assertEqual(field.count("radial-gradient("), 3)
        self.assertEqual(field.count("transparent 70%)"), 3)
        self.assertIn("linear-gradient(160deg, var(--color-field-start), var(--color-field-end))", field)

    def test_page_makes_no_external_request(self) -> None:
        for needle in ("http://", "https://", "url(", "@import", "<link", "<img", "src="):
            self.assertNotIn(needle, self.page, needle)
        # One inline script, for the manual theme switch. It has no attribute, so no source.
        self.assertEqual(re.findall(r"<script\b[^>]*>", self.page), ["<script>"])
        (script,) = re.findall(r"<script>(.*?)</script>", self.page, flags=re.S)
        for needle in ("fetch", "XMLHttpRequest", "import", "WebSocket", "sendBeacon", "location"):
            self.assertNotIn(needle, script, needle)

    @unittest.skipUnless(shutil.which("node"), "node is not installed")
    def test_theme_switch_sets_and_clears_the_explicit_choice(self) -> None:
        body = self.page[self.page.index("<body") :]
        buttons = re.findall(
            r'<button class="segment" type="button" data-theme-choice="([a-z]+)" '
            r'aria-pressed="(true|false)">([^<]+)</button>',
            body,
        )
        # The page opens on the system appearance, with no explicit choice on the root.
        self.assertEqual(
            buttons, [("system", "true", "系统"), ("light", "false", "浅色"), ("dark", "false", "深色")]
        )
        self.assertNotRegex(self.page, r"<html[^>]*data-theme")
        (script,) = re.findall(r"<script>(.*?)</script>", self.page, flags=re.S)
        # Run the page script against the three buttons, starting from each root state.
        harness = r"""
const vm = require('node:vm');
const fs = require('node:fs');
const script = fs.readFileSync(process.argv[2], 'utf8');
function run(initial, clicks) {
  const attrs = new Map(initial ? [['data-theme', initial]] : []);
  const element = (own) => {
    const map = new Map(Object.entries(own));
    const listeners = [];
    return {
      getAttribute: (k) => (map.has(k) ? map.get(k) : null),
      setAttribute: (k, v) => { map.set(k, String(v)); },
      removeAttribute: (k) => { map.delete(k); },
      addEventListener: (type, fn) => { if (type === 'click') listeners.push(fn); },
      click() { listeners.forEach((fn) => fn({ currentTarget: this, target: this })); },
    };
  };
  const buttons = ['system', 'light', 'dark'].map((choice) =>
    element({ 'data-theme-choice': choice, 'aria-pressed': String(choice === 'system') }));
  const document = {
    documentElement: {
      getAttribute: (k) => (attrs.has(k) ? attrs.get(k) : null),
      setAttribute: (k, v) => { attrs.set(k, String(v)); },
      removeAttribute: (k) => { attrs.delete(k); },
      hasAttribute: (k) => attrs.has(k),
    },
    querySelectorAll: (selector) => (selector === '[data-theme-choice]' ? buttons : []),
  };
  vm.runInNewContext(script, { document });
  const state = () => ({
    theme: attrs.has('data-theme') ? attrs.get('data-theme') : null,
    pressed: buttons.filter((b) => b.getAttribute('aria-pressed') === 'true')
      .map((b) => b.getAttribute('data-theme-choice')),
  });
  const out = [state()];
  for (const choice of clicks) {
    buttons.find((b) => b.getAttribute('data-theme-choice') === choice).click();
    out.push(state());
  }
  return out;
}
console.log(JSON.stringify({
  fromSystem: run(null, ['dark', 'light', 'system', 'dark', 'dark']),
  fromDark: run('dark', ['system']),
  fromLight: run('light', []),
}));
"""
        with tempfile.TemporaryDirectory() as tmp:
            (Path(tmp) / "harness.cjs").write_text(harness, encoding="utf-8")
            (Path(tmp) / "page.js").write_text(script, encoding="utf-8")
            result = subprocess.run(
                ["node", str(Path(tmp) / "harness.cjs"), str(Path(tmp) / "page.js")],
                capture_output=True, text=True, encoding="utf-8",
            )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(
            json.loads(result.stdout),
            {
                "fromSystem": [
                    {"theme": None, "pressed": ["system"]},
                    {"theme": "dark", "pressed": ["dark"]},
                    {"theme": "light", "pressed": ["light"]},
                    # Back to the system appearance: the explicit choice is removed, not set.
                    {"theme": None, "pressed": ["system"]},
                    {"theme": "dark", "pressed": ["dark"]},
                    {"theme": "dark", "pressed": ["dark"]},
                ],
                # A root that already carries a choice opens with that segment pressed.
                "fromDark": [
                    {"theme": "dark", "pressed": ["dark"]},
                    {"theme": None, "pressed": ["system"]},
                ],
                "fromLight": [{"theme": "light", "pressed": ["light"]}],
            },
        )

    def test_page_has_the_workbench_parts(self) -> None:
        body = self.page[self.page.index("<body") :]
        self.assertGreaterEqual(len(re.findall(r'class="sheet\b', body)), 4)  # sidebar + 3 cards
        self.assertLessEqual(len(re.findall(r'class="sheet\b', body)), 5)
        for needle in (
            'class="sheet sidebar"', "<h1", 'class="well', "btn-primary", "btn-secondary",
            '<input type="text"', '<input type="checkbox"', 'class="tag', 'class="segmented"',
            'class="overlay',
        ):
            self.assertIn(needle, body, needle)
        self.assertIn("占位", body)
        # Paper is not nested: no sheet opens before the previous one closed.
        depth = 0
        for tag, cls in re.findall(r"<(/?)(?:section|aside)\b([^>]*)>", body):
            if tag:
                depth -= 1
            else:
                self.assertEqual(depth, 0, cls)
                depth += 1
        self.assertNotIn("\r", self.page)

    @unittest.skipUnless(shutil.which("node"), "node is not installed")
    def test_slop_check_passes_next_to_the_apply_output(self) -> None:
        # slop_check reads one value per token and the last declaration wins, so the page as
        # shipped is checked with the dark group. Without the dark blocks it is the light one.
        start = self.page.index("@media (prefers-color-scheme: dark) {")
        end = self.page.index("*, *::before, *::after")
        removed = self.page[start:end]
        self.assertIn(':root:not([data-theme="light"])', removed)
        self.assertIn(':root[data-theme="dark"]', removed)
        light_only = self.page[:start] + self.page[end:]
        self.assertNotIn(MINT_DARK["field-start"], light_only)
        self.assertIn(MINT["field-start"], light_only)
        for label, page in (("dark", self.page), ("light", light_only)):
            with tempfile.TemporaryDirectory() as tmp:
                applied = run("apply", "style:airy-glass", "--root", tmp, "--palette", "mint")
                self.assertEqual(applied.returncode, 0, applied.stderr)
                (Path(tmp) / "index.html").write_text(page, encoding="utf-8", newline="\n")
                result = subprocess.run(
                    ["node", str(SLOP_CHECK), tmp, "--json"],
                    capture_output=True, text=True, encoding="utf-8",
                )
                self.assertEqual(result.returncode, 0, f"{label}: {result.stdout}{result.stderr}")
                report = json.loads(result.stdout)
                self.assertEqual(report["summary"]["files"], 1, label)
                # Nothing failed, and nothing had to be waived or noted either.
                self.assertEqual(report["findings"], [], label)


def make_project(root: Path, *, css: str | None = None, readme: str | None = None) -> None:
    if css is not None:
        (root / "src").mkdir()
        (root / "src" / "tokens.css").write_text(css, encoding="utf-8")
    if readme is not None:
        (root / "README.md").write_text(readme, encoding="utf-8")


BLUE_CSS = ":root { --color-primary: #2563EB; --color-bg: #ffffff }\n"


class CliTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def design(self) -> str:
        data = (self.root / "DESIGN.md").read_bytes()
        self.assertNotIn(b"\r", data)
        return data.decode("utf-8")

    def names(self) -> list[str]:
        return sorted(p.relative_to(self.root).as_posix() for p in self.root.rglob("*"))

    def comments(self, text: str) -> list[str]:
        closing = text.index("\n---\n", 4) + len("\n---\n")
        return text[closing:].splitlines()[:2]

    def test_blue_accent_project_follows_the_accent(self) -> None:
        make_project(self.root, css=BLUE_CSS)
        result = run("apply", "style:airy-glass", "--root", str(self.root))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stderr, "")
        text = self.design()
        for value in MINT.values():
            self.assertNotIn(value, text)
        sky = preset_colors("sky")
        for value in sky.values():
            self.assertIn(value, text)
        input_hue = palette.hex_to_oklch(sky["input"])[2]
        self.assertLessEqual(palette.hue_distance(input_hue, 263), 20)
        lines = result.stdout.splitlines()
        self.assertTrue(lines[0].startswith("wrote: "))
        self.assertTrue(lines[0].endswith("(style:airy-glass)"))
        self.assertTrue(lines[1].startswith("palette: sky ("), lines[1])
        self.assertIn("--color-primary", lines[1])
        self.assertIn("#2563EB", lines[1])
        provenance, colourway = self.comments(text)
        self.assertEqual(
            provenance,
            "<!-- design-atlas: entry=style:airy-glass; source=first-party; license=MIT -->",
        )
        self.assertTrue(colourway.startswith("<!-- palette: sky; reason: accent --color-primary"))
        self.assertTrue(colourway.endswith(" -->"))

    def test_accent_far_from_presets_is_derived(self) -> None:
        make_project(self.root, css=":root { --brand: #E11D48; --bg: #fff }\n")
        result = run("apply", "style:airy-glass", "--root", str(self.root))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("palette: hue:18 (accent --brand #E11D48", result.stdout)
        text = self.design()
        derived = palette.derive(18, SPEC)["colors"]
        for value in derived.values():
            self.assertIn(value, text)
        for value in MINT.values():
            self.assertNotIn(value, text)
        self.assertIn("<!-- palette: hue:18; reason: accent --brand #E11D48", text)
        self.assertIn("Colourway: `hue:18` (derived: input hue 18, output hue 144).", text)

    def test_accent_without_a_paper_token_still_counts(self) -> None:
        make_project(self.root, css=":root { --color-primary: #2563EB }\n")
        result = run("apply", "style:airy-glass", "--root", str(self.root))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("palette: sky (accent --color-primary", result.stdout)

    def test_gray_accent_token_does_not_hide_the_primary(self) -> None:
        # The shadcn/ui layout: --accent is a near-white hover tint, --primary is the brand.
        make_project(
            self.root,
            css=":root { --background: 0 0% 100%; --primary: 221 83% 53%; "
            "--primary-foreground: 210 40% 98%; --accent: 210 40% 96.1%; "
            "--accent-foreground: 222 47% 11%; }\n",
        )
        data = dc.collect_signals(self.root)["palette"]
        self.assertEqual(data["accent_var"], "--accent")
        self.assertEqual([a["var"] for a in data["accents"]], ["--accent", "--primary"])
        for item in data["accents"]:
            self.assertEqual(set(item), {"var", "hue", "C", "hex"})
        result = run("apply", "style:airy-glass", "--root", str(self.root))
        self.assertEqual(result.returncode, 0, result.stderr)
        # hsl(221 83% 53%) is #2463EB after 8-bit rounding.
        self.assertIn("palette: sky (accent --primary #2463EB (hue 263)", result.stdout)
        self.assertIn("note: accent --accent is near gray", result.stdout)
        text = self.design()
        self.assertIn(preset_colors("sky")["input"], text)
        self.assertNotIn(MINT["input"], text)

    def test_signals_cap_the_accent_list(self) -> None:
        scale = "".join(f"--color-brand-{n}00: #2563EB; " for n in range(1, 10))
        make_project(self.root, css=f":root {{ --color-bg: #fff; {scale}--zz-primary: #E11D48; }}\n")
        data = dc.collect_signals(self.root)["palette"]
        self.assertEqual(len(data["accents"]), dc.MAX_ACCENTS)
        self.assertEqual(data["accents"][0]["var"], data["accent_var"])

    def test_apply_refuses_a_colourway_that_fails_a_gate(self) -> None:
        weak = copy.deepcopy(SPEC)
        weak["presets"]["sky"]["input"] = "#7FB2E5"
        index = dc.load_index()
        entry = next(e for e in index["entries"] if e["id"] == ENTRY)
        existing = self.root / "design.md"
        existing.write_bytes(b"mine\n")
        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            code = dc.apply(index, entry, self.root, True, spec=weak, override="sky")
        self.assertEqual(code, 1)
        self.assertEqual(out.getvalue(), "")
        self.assertIn(
            "sky fails contrast gates input-wash, input-sheet-worst, input-white",
            err.getvalue(),
        )
        # --force was given, and the old file was still neither renamed nor replaced.
        self.assertEqual(self.names(), ["design.md"])
        self.assertEqual(existing.read_bytes(), b"mine\n")
        # The same data with a passing preset still writes.
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            code = dc.apply(index, entry, self.root, True, spec=weak, override="mint")
        self.assertEqual(code, 0)

    def test_apply_refuses_a_colourway_whose_dark_group_alone_fails(self) -> None:
        # #3F8F70 on the opaque dark paper #1C2530 is 3.96:1. The light group of sky is untouched.
        weak = copy.deepcopy(SPEC)
        weak["presets"]["sky"]["dark"]["input"] = "#3F8F70"
        index = dc.load_index()
        entry = next(e for e in index["entries"] if e["id"] == ENTRY)
        existing = self.root / "design.md"
        existing.write_bytes(b"mine\n")
        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            code = dc.apply(index, entry, self.root, True, spec=weak, override="sky")
        self.assertEqual(code, 1)
        self.assertEqual(out.getvalue(), "")
        self.assertEqual(
            err.getvalue(),
            "error: style:airy-glass colourway: sky fails contrast gates dark input-wash, "
            "dark input-sheet-worst, dark input-solid, dark input-overlay-worst; nothing written\n",
        )
        # --force was given, and the old file was still neither renamed nor replaced.
        self.assertEqual(self.names(), ["design.md"])
        self.assertEqual(existing.read_bytes(), b"mine\n")

    def test_readme_keywords_pick_a_preset(self) -> None:
        make_project(self.root, readme="# 门店会员\n\n连锁餐饮的会员与外卖管理后台。\n")
        result = run("apply", "style:airy-glass", "--root", str(self.root))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("palette: apricot (keywords ", result.stdout)
        self.assertIn("餐饮 (project)", result.stdout)
        self.assertIn(preset_colors("apricot")["input"], self.design())

    def test_readme_headings_alone_fall_back_to_the_default(self) -> None:
        make_project(
            self.root,
            readme="# Widget\n\n## Community\n\n## Security\n\n## Enterprise\n\n"
            "## Contributing\n\n## License\n",
        )
        result = run("palette", "style:airy-glass", "--root", str(self.root))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("palette: mint (fallback (no palette or content signal))", result.stdout)
        (self.root / "README.md").write_text(
            "# Widget\n\n## Community\n\n餐饮\n\n## Security\n", encoding="utf-8"
        )
        result = run("palette", "style:airy-glass", "--root", str(self.root))
        self.assertIn("palette: apricot (keywords 餐饮 (project) match apricot)", result.stdout)

    def test_near_black_primary_is_not_an_accent(self) -> None:
        # The shadcn/ui default theme: every accent-named token is ink or a near-white tint.
        make_project(
            self.root,
            css=":root { --background: 0 0% 100%; --primary: 222.2 47.4% 11.2%; "
            "--primary-foreground: 210 40% 98%; }\n",
        )
        data = dc.collect_signals(self.root)["palette"]
        self.assertEqual(data["accent_var"], "--primary")
        self.assertEqual(data["accent_hex"], "#0F172A")
        for item in data["accents"]:
            self.assertEqual(set(item), {"var", "hue", "C", "hex"})
        result = run("apply", "style:airy-glass", "--root", str(self.root))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("palette: mint (fallback (no palette or content signal))", result.stdout)
        self.assertIn("note: accent --primary is near black (lightness 0.21)", result.stdout)
        self.assertIn(MINT["input"], self.design())

    def test_dark_brand_primary_still_counts(self) -> None:
        make_project(self.root, css=":root { --background: #fff; --primary: #1E3A8A; }\n")
        result = run("palette", "style:airy-glass", "--root", str(self.root))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("palette: sky (accent --primary #1E3A8A", result.stdout)
        self.assertNotIn("near black", result.stdout)

    def test_derived_output_hue_stays_out_of_red(self) -> None:
        for hue, out_hue in ((214, 314), (233, 107)):
            result = run(
                "palette", "style:airy-glass", "--root", str(self.root),
                "--palette", f"hue:{hue}", "--format", "json",
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            data = json.loads(result.stdout)
            measured = palette.hex_to_oklch(data["colors"]["output"])[2]
            self.assertLessEqual(palette.hue_distance(measured, out_hue), 3, hue)
            self.assertFalse(measured >= 340 or measured <= 40, hue)
            self.assertTrue(all(row["pass"] is not False for row in data["contrast"]), hue)

    def test_prompt_keywords_pick_a_preset(self) -> None:
        result = run(
            "apply", "style:airy-glass", "--root", str(self.root),
            "--prompt", "轻盈毛玻璃，餐饮会员系统",
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("palette: apricot (keywords 餐饮 match apricot)", result.stdout)

    def test_no_signal_falls_back_to_the_template(self) -> None:
        result = run("apply", "style:airy-glass", "--root", str(self.root))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("palette: mint (fallback (no palette or content signal))", result.stdout)
        expected = dc.with_provenance(
            template(),
            "<!-- design-atlas: entry=style:airy-glass; source=first-party; license=MIT -->\n"
            "<!-- palette: mint; reason: fallback (no palette or content signal) -->",
        )
        self.assertEqual(self.design(), expected)

    def test_gray_accent_is_ignored(self) -> None:
        make_project(self.root, css=":root { --color-primary: #6B7280; --color-bg: #fff }\n")
        result = run("apply", "style:airy-glass", "--root", str(self.root))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("palette: mint (fallback", result.stdout)
        self.assertIn("note: accent --color-primary is near gray", result.stdout)
        self.assertIn(MINT["input"], self.design())

    def test_dark_project_gets_a_note(self) -> None:
        make_project(self.root, css=":root { --color-primary: #2563EB; --color-bg: #0b0d12 }\n")
        result = run("apply", "style:airy-glass", "--root", str(self.root))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("palette: sky (", result.stdout)
        self.assertIn("note: the project paper is dark", result.stdout)

    def test_explicit_palette_overrides_the_project(self) -> None:
        make_project(self.root, css=BLUE_CSS)
        result = run("apply", "style:airy-glass", "--root", str(self.root), "--palette", "apricot")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("palette: apricot (explicit --palette apricot)", result.stdout)
        self.assertIn(preset_colors("apricot")["field-start"], self.design())
        result = run(
            "apply", "style:airy-glass", "--root", str(self.root), "--palette", "hue:18", "--force"
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("palette: hue:18 (explicit --palette hue:18)", result.stdout)
        self.assertIn("backup: ", result.stdout)
        text = self.design()
        self.assertIn(palette.derive(18, SPEC)["colors"]["input"], text)
        self.assertNotIn(preset_colors("apricot")["field-start"], text)
        self.assertEqual(len([n for n in self.names() if ".bak-" in n]), 1)
        auto = run("palette", "style:airy-glass", "--root", str(self.root), "--palette", "auto")
        self.assertIn("palette: sky (accent", auto.stdout)

    def test_bad_palette_is_exit_2_and_writes_nothing(self) -> None:
        make_project(self.root, css=BLUE_CSS)
        before = self.names()
        for value in ("teal", "hue:360", "hue:abc", "hue:-5", "Mint", ""):
            result = run("apply", "style:airy-glass", "--root", str(self.root), "--palette", value)
            self.assertEqual(result.returncode, 2, value)
            self.assertIn("--palette must be", result.stderr)
            self.assertEqual(result.stdout, "")
            self.assertEqual(self.names(), before)
            shown = run("palette", "style:airy-glass", "--root", str(self.root), "--palette", value)
            self.assertEqual(shown.returncode, 2, value)
            self.assertEqual(shown.stdout, "")

    def test_bad_palette_with_force_keeps_the_existing_file(self) -> None:
        existing = self.root / "design.md"
        existing.write_bytes(b"mine\n")
        result = run(
            "apply", "style:airy-glass", "--root", str(self.root), "--palette", "teal", "--force"
        )
        self.assertEqual(result.returncode, 2)
        self.assertEqual(self.names(), ["design.md"])
        self.assertEqual(existing.read_bytes(), b"mine\n")

    def test_existing_design_md_is_still_refused_without_force(self) -> None:
        existing = self.root / "design.md"
        existing.write_bytes(b"mine\n")
        result = run("apply", "style:airy-glass", "--root", str(self.root), "--palette", "sky")
        self.assertEqual(result.returncode, 3)
        self.assertEqual(self.names(), ["design.md"])
        self.assertEqual(existing.read_bytes(), b"mine\n")

    def test_palette_flags_on_an_entry_without_a_dial_are_exit_2(self) -> None:
        for entry in ("theme:riso", "brand:vercel", "style:glassmorphism", "scene:bi"):
            for extra in (("--palette", "sky"), ("--palette", "auto"), ("--prompt", "餐饮")):
                result = run("apply", entry, "--root", str(self.root), *extra)
                self.assertEqual(result.returncode, 2, (entry, extra))
                self.assertIn("has no colourway dial", result.stderr)
                self.assertIn("style:airy-glass", result.stderr)
                self.assertEqual(result.stdout, "")
                self.assertEqual(self.names(), [])
            shown = run("palette", entry, "--root", str(self.root))
            self.assertEqual(shown.returncode, 2, entry)
            self.assertIn("has no colourway dial", shown.stderr)
        self.assertEqual(run("palette", "brand:nope").returncode, 2)

    def test_palette_command_is_read_only(self) -> None:
        make_project(self.root, css=BLUE_CSS, readme="# Ops\n")
        before = self.names()
        text = run("palette", "style:airy-glass", "--root", str(self.root))
        self.assertEqual(text.returncode, 0, text.stderr)
        self.assertEqual(self.names(), before)
        lines = text.stdout.splitlines()
        self.assertEqual(lines[0], "entry: style:airy-glass")
        self.assertTrue(lines[1].startswith("palette: sky (accent --color-primary #2563EB"))
        self.assertIn("  input        #1F6CB0", text.stdout)
        self.assertIn("  blob-mid     #D6EDEE", text.stdout)
        self.assertEqual(
            sum(line.endswith("  pass") for line in lines), len(GATED) + len(DARK_GATED)
        )
        self.assertEqual(sum(line.endswith("  report") for line in lines), 2 * len(REPORTED))
        self.assertNotIn("FAIL", text.stdout)
        for line in lines:
            self.assertEqual(line, line.rstrip())
        as_json = run("palette", "style:airy-glass", "--root", str(self.root), "--format", "json")
        self.assertEqual(as_json.returncode, 0, as_json.stderr)
        self.assertEqual(self.names(), before)
        data = json.loads(as_json.stdout)
        self.assertEqual(
            set(data), {"entry", "palette", "reason", "notes", "colors", "contrast", "dark"}
        )
        self.assertEqual(data["entry"], "style:airy-glass")
        self.assertEqual(data["palette"], "sky")
        self.assertEqual(data["colors"], preset_colors("sky"))
        self.assertEqual([row["id"] for row in data["contrast"]], list(GATE_ORDER))
        for row in data["contrast"]:
            self.assertEqual(set(row), {"id", "fg", "bg", "ratio", "min", "pass"})
            if row["id"] in REPORTED:
                self.assertIsNone(row["min"])
                self.assertIsNone(row["pass"])
            else:
                self.assertTrue(row["pass"])
                self.assertEqual(row["min"], minimum(row["id"]))
                self.assertGreaterEqual(row["ratio"], row["min"])

    def test_palette_json_carries_the_dark_group(self) -> None:
        make_project(self.root, css=BLUE_CSS)
        shown = run("palette", "style:airy-glass", "--root", str(self.root), "--format", "json")
        self.assertEqual(shown.returncode, 0, shown.stderr)
        data = json.loads(shown.stdout)
        # The keys that were there before the dark group keep their place and their meaning.
        self.assertEqual(
            list(data), ["entry", "palette", "reason", "notes", "colors", "contrast", "dark"]
        )
        self.assertEqual(data["colors"], preset_colors("sky"))
        self.assertEqual([row["id"] for row in data["contrast"]], list(GATE_ORDER))
        dark = data["dark"]
        self.assertEqual(list(dark), ["colors", "contrast"])
        self.assertEqual(list(dark["colors"]), list(palette.ROLES))
        self.assertEqual(dark["colors"]["field-start"], "#121A22")
        self.assertEqual(dark["colors"]["input"], "#82C0FF")
        self.assertEqual([row["id"] for row in dark["contrast"]], list(DARK_GATE_ORDER))
        for row in dark["contrast"]:
            self.assertEqual(set(row), {"id", "fg", "bg", "ratio", "min", "pass"})
            if row["id"] in REPORTED:
                self.assertIsNone(row["min"])
                self.assertIsNone(row["pass"])
            else:
                self.assertTrue(row["pass"])
                self.assertEqual(row["min"], minimum(row["id"]))
                self.assertGreaterEqual(row["ratio"], row["min"])
        # The opaque fallback row is ink on the dark paper colour in every colourway.
        solid = dark["contrast"][0]
        self.assertEqual(
            {key: solid[key] for key in ("id", "fg", "bg", "ratio")},
            {"id": "ink-solid", "fg": "#E7EDF3", "bg": "#1C2530", "ratio": 13.12},
        )

    def test_palette_text_lists_the_light_group_then_the_dark_group(self) -> None:
        shown = run("palette", "style:airy-glass", "--root", str(self.root), "--palette", "mint")
        self.assertEqual(shown.returncode, 0, shown.stderr)
        lines = shown.stdout.splitlines()
        self.assertEqual(
            [line for line in lines if not line.startswith("  ")],
            [
                "entry: style:airy-glass", "palette: mint (explicit --palette mint)",
                "colors:", "contrast:", "dark colors:", "dark contrast:",
            ],
        )

        def section(name: str) -> list[str]:
            start = lines.index(name) + 1
            end = start
            while end < len(lines) and lines[end].startswith("  "):
                end += 1
            return lines[start:end]

        self.assertEqual(
            section("colors:"), [f"  {role:<12} {MINT[role]}" for role in palette.ROLES]
        )
        self.assertEqual(
            section("dark colors:"), [f"  {role:<12} {MINT_DARK[role]}" for role in palette.ROLES]
        )
        light, dark = section("contrast:"), section("dark contrast:")
        self.assertEqual([line.split()[0] for line in light], list(GATE_ORDER))
        self.assertEqual([line.split()[0] for line in dark], list(DARK_GATE_ORDER))
        # The light rows read as they did before the dark group: the id column is 18 wide.
        self.assertIn("  ink-white          #24303A on #FFFFFF  13.47  >= 4.5  pass", light)
        self.assertIn("  input-wash         #187A56 on #E7F7F0   4.79  >= 4.5  pass", light)
        self.assertIn("  edge-field         #FFFFFF on #E7F6F1   1.11          report", light)
        # The dark id column is 20 wide, the length of its longest id. The edge over the
        # worst overlay is white 0.36 over #1C2832; the paper edge is white 0.08 over #172129.
        self.assertIn("  ink-solid            #E7EDF3 on #1C2530  13.12  >= 4.5  pass", dark)
        self.assertIn("  control-edge-overlay #6E757C on #1C2832   3.22  >= 3    pass", dark)
        self.assertIn("  edge-field           #2A333A on #0F1B1F   1.36          report", dark)
        for line in lines:
            self.assertEqual(line, line.rstrip())

    def test_palette_command_fails_when_the_dark_group_alone_fails(self) -> None:
        # The same weak dark accent that apply refuses: 3.96:1 on the opaque dark paper.
        weak = copy.deepcopy(SPEC)
        weak["presets"]["sky"]["dark"]["input"] = "#3F8F70"
        entry = next(e for e in dc.load_index()["entries"] if e["id"] == ENTRY)
        failed = ("input-wash", "input-sheet-worst", "input-solid", "input-overlay-worst")
        for fmt in ("text", "json"):
            args = argparse.Namespace(root=self.root, prompt=None, palette="sky", format=fmt)
            out, err = io.StringIO(), io.StringIO()
            with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
                code = dc.show_colourway(entry, weak, args)
            self.assertEqual(code, 1, fmt)
            self.assertEqual(
                err.getvalue(),
                "error: contrast gates failed: dark input-wash, dark input-sheet-worst, "
                "dark input-solid, dark input-overlay-worst\n",
                fmt,
            )
            # The report is still printed, with the failed rows marked in the dark table only.
            if fmt == "json":
                data = json.loads(out.getvalue())
                self.assertEqual([r["id"] for r in data["contrast"] if r["pass"] is False], [])
                self.assertEqual(
                    [r["id"] for r in data["dark"]["contrast"] if r["pass"] is False], list(failed)
                )
            else:
                lines = out.getvalue().splitlines()
                marked_fail = [line.split()[0] for line in lines if line.endswith("  FAIL")]
                self.assertEqual(marked_fail, list(failed))
                self.assertGreater(
                    lines.index(next(l for l in lines if l.endswith("  FAIL"))),
                    lines.index("dark contrast:"),
                )
        self.assertEqual(self.names(), [])

    def test_every_preset_exits_0_with_the_worst_background_rows(self) -> None:
        for name in SPEC["presets"]:
            result = run(
                "palette", "style:airy-glass", "--root", str(self.root),
                "--palette", name, "--format", "json",
            )
            self.assertEqual(result.returncode, 0, f"{name}: {result.stderr}")
            data = json.loads(result.stdout)
            rows = {row["id"]: row for row in data["contrast"]}
            for gate_id in MINT_WORST:
                self.assertIn(gate_id, rows, name)
            for gate_id in GATED:
                self.assertIs(rows[gate_id]["pass"], True, f"{name} {gate_id}")
            dark = {row["id"]: row for row in data["dark"]["contrast"]}
            for gate_id in DARK_GATED:
                self.assertIs(dark[gate_id]["pass"], True, f"{name} dark {gate_id}")
        mint = run(
            "palette", "style:airy-glass", "--root", str(self.root),
            "--palette", "mint", "--format", "json",
        )
        data = json.loads(mint.stdout)
        rows = {row["id"]: row for row in data["contrast"]}
        self.assertEqual({k: rows[k]["ratio"] for k in MINT_WORST}, MINT_WORST)
        self.assertEqual(data["dark"]["colors"], MINT_DARK)
        self.assertEqual(
            {row["id"]: row["ratio"] for row in data["dark"]["contrast"]}, MINT_DARK_TABLE
        )

    def test_apply_writes_the_material_model(self) -> None:
        result = run("apply", "style:airy-glass", "--root", str(self.root), "--palette", "sky")
        self.assertEqual(result.returncode, 0, result.stderr)
        text = self.design()
        head = text[: text.index("\n---\n", 4)]
        sky = preset_colors("sky")
        for role in palette.BLOBS:
            self.assertIn(f'  {role}: "{sky[role]}"', head)
            self.assertNotIn(MINT[role], text)
        self.assertIn("  blob-opacity: 0.70\n", head)
        self.assertIn('  sheet: "rgba(255,255,255,0.62)"', head)
        self.assertIn('  sheet-highlight: "inset 0 1px 0 rgba(255,255,255,0.55)"', head)
        self.assertIn('  sheet-shadow: "0 12px 40px -16px rgba(30,60,90,0.14)"', head)
        self.assertIn('  control-edge: "rgba(36,48,58,0.54)"', head)
        self.assertIn("### Control boundaries", text)
        self.assertIn("| Text input, textarea, select | 1px `{colors.control-edge}` |", text)
        table = text[text.index("<!-- palette:begin contrast -->") :]
        table = table[: table.index("<!-- palette:end contrast -->")]
        rows = {row["id"]: row for row in palette.gates(sky, SPEC["fixed"])}
        for gate_id in ("ink-sheet-worst", "muted-sheet-worst", "ink-field-worst",
                        "muted-field-worst", "control-edge-sheet"):
            row = rows[gate_id]
            self.assertIn(f"| {row['bg_label']} | {row['ratio']:.2f} |", table, gate_id)
        self.assertIn("| `#24303A` 0.54 叠纸 |", table)
        self.assertIn(f"`{sky['blob-end']}` 0.70 叠 `{sky['field-end']}`", table)

    def test_apply_always_writes_the_light_and_the_dark_group(self) -> None:
        result = run("apply", "style:airy-glass", "--root", str(self.root))
        self.assertEqual(result.returncode, 0, result.stderr)
        text = self.design()
        blocks = blocks_of(text)
        self.assertEqual(list(blocks), list(BLOCK_NAMES))
        self.assertTrue(blocks["colourway"].startswith("Colourway: `mint` ("))
        self.assertIn("- Field: `#E7F6F1` to `#EDE7F8`.", blocks["colourway"])
        self.assertTrue(blocks["colourway-dark"].startswith("Dark group of `mint`.\n"))
        self.assertIn("- Field: `#0F1B1F` to `#18172B`.", blocks["colourway-dark"])
        # Two measured tables: 19 light rows, and 24 dark rows that end on the overlay rows.
        self.assertEqual(text.count("| 前景 | 背景 | 比值 | 门槛 | 用途 |"), 2)
        tables = {
            name: [line for line in blocks[name].split("\n") if line.startswith("| ")][2:]
            for name in ("contrast", "contrast-dark")
        }
        self.assertEqual({name: len(rows) for name, rows in tables.items()},
                         {"contrast": 19, "contrast-dark": 24})
        self.assertEqual(tables["contrast"][0], "| `#24303A` | `#FFFFFF` | 13.47 | 4.5 | 正文,不透明回退 |")
        self.assertEqual(
            tables["contrast-dark"][0], "| `#E7EDF3` | `#1C2530` | 13.12 | 4.5 | 正文,不透明回退 |"
        )
        self.assertTrue(tables["contrast-dark"][-1].endswith("| 7.10 | 4.5 | 输出色的文字,最差的浮层 |"))
        # Another colourway moves both groups, and leaves no mint value of either behind.
        result = run(
            "apply", "style:airy-glass", "--root", str(self.root), "--palette", "sky", "--force"
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        text = self.design()
        head = text[: text.index("\n---\n", 4)]
        self.assertIn('  field-start: "#E8F3FF"', head)
        self.assertIn('  field-start-dark: "#121A22"', head)
        self.assertIn('  input-dark: "#82C0FF"', head)
        self.assertTrue(blocks_of(text)["colourway-dark"].startswith("Dark group of `sky`.\n"))
        for value in (*MINT.values(), *MINT_DARK.values()):
            self.assertNotIn(value, text)
        # The fixed dark material is the same in every colourway.
        self.assertIn('  sheet-dark: "rgba(28,37,48,0.60)"', head)
        self.assertIn('  control-edge-dark: "rgba(255,255,255,0.36)"', head)

    def test_palette_command_matches_apply(self) -> None:
        make_project(self.root, css=":root { --brand: #E11D48; --bg: #fff }\n")
        shown = run("palette", "style:airy-glass", "--root", str(self.root), "--format", "json")
        data = json.loads(shown.stdout)
        applied = run("apply", "style:airy-glass", "--root", str(self.root))
        self.assertIn(f"palette: {data['palette']} ({data['reason']})", applied.stdout)
        text = self.design()
        for value in (*data["colors"].values(), *data["dark"]["colors"].values()):
            self.assertIn(value, text)
        # The dark table apply wrote carries the ratios the palette command printed.
        table = blocks_of(text)["contrast-dark"]
        for row in data["dark"]["contrast"]:
            self.assertIn(f"| {row['ratio']:.2f} |", table, row["id"])

    def test_palette_command_options(self) -> None:
        hue = run("palette", "airy-glass", "--root", str(self.root), "--palette", "hue:18")
        self.assertEqual(hue.returncode, 0, hue.stderr)
        self.assertIn("palette: hue:18 (explicit --palette hue:18)", hue.stdout)
        prompt = run("palette", "style:airy-glass", "--root", str(self.root), "--prompt", "合规审计台")
        self.assertIn("palette: slate (keywords ", prompt.stdout)
        missing = run("palette", "style:airy-glass", "--root", str(self.root / "nope"))
        self.assertEqual(missing.returncode, 2)

    def test_same_input_gives_the_same_bytes(self) -> None:
        make_project(self.root, css=":root { --brand: #E11D48; --bg: #fff }\n", readme="# 餐饮\n")
        first = run("apply", "style:airy-glass", "--root", str(self.root))
        one = (self.root / "DESIGN.md").read_bytes()
        (self.root / "DESIGN.md").unlink()
        second = run("apply", "style:airy-glass", "--root", str(self.root))
        self.assertEqual(one, (self.root / "DESIGN.md").read_bytes())
        self.assertEqual(first.stdout, second.stdout)
        a = run("palette", "style:airy-glass", "--root", str(self.root), "--format", "json")
        b = run("palette", "style:airy-glass", "--root", str(self.root), "--format", "json")
        self.assertEqual(a.stdout, b.stdout)

    def test_show_prints_the_template(self) -> None:
        shown = run("show", "style:airy-glass")
        self.assertEqual(shown.returncode, 0, shown.stderr)
        self.assertEqual(shown.stdout, template())

    def test_signals_report_accent_chroma_and_hex(self) -> None:
        make_project(self.root, css=BLUE_CSS)
        data = dc.collect_signals(self.root)["palette"]
        self.assertEqual(data["band"], "light")
        self.assertEqual(data["paper_var"], "--color-bg")
        self.assertEqual(data["accent_var"], "--color-primary")
        self.assertEqual(data["accent_hue"], 263)
        self.assertEqual(data["accent_C"], 0.215)
        self.assertEqual(data["accent_hex"], "#2563EB")
        self.assertEqual(
            data["accents"],
            [{"var": "--color-primary", "hue": 263, "C": 0.215, "hex": "#2563EB"}],
        )
        (self.root / "src" / "tokens.css").write_text(
            ":root { --color-bg: #fff; --color-primary: oklch(0.6 0.2 359.7) }", encoding="utf-8"
        )
        wrapped = dc.collect_signals(self.root)["palette"]
        self.assertEqual(wrapped["accent_hue"], 0)

    def test_token_block_reads_a_last_declaration_without_a_semicolon(self) -> None:
        props = dc.token_blocks(":root { --a: #111; --color-primary: #2563EB }")
        self.assertEqual(props, {"--a": "#111", "--color-primary": "#2563EB"})
        self.assertEqual(dc.token_blocks(":root{--a:#111;}"), {"--a": "#111"})
        make_project(self.root, css=":root { --color-primary: #2563EB }")
        data = dc.collect_signals(self.root)["palette"]
        self.assertIsNone(data["band"])
        self.assertEqual(data["accent_hex"], "#2563EB")
        # A block that ends in a semicolon reads the same with and without the change:
        # the only new match is a declaration after the last semicolon.
        cases = (
            ":root { --color-bg: #0b0d12; --color-primary: #2563EB",
            ":root{--font-sans:Inter;--bg:#fff;--brand:oklch(0.6 0.2 30)",
            "@theme {\n  --color-paper: #fafafa;\n  --color-accent: 221 83% 53%\n",
        )
        for body in cases:
            self.assertEqual(
                dc.token_blocks(body + " }"), dc.token_blocks(body + "; }"), body
            )
            self.assertTrue(dc.token_blocks(body + "; }"), body)
        self.assertEqual(dc.token_blocks(":root { }"), {})
        # A commented-out declaration at the end of a block is not read as a token.
        self.assertEqual(
            dc.token_blocks(":root { --bg: #fff; /* --font-x: Inter */ }"), {"--bg": "#fff"}
        )
        self.assertEqual(
            dc.token_blocks(":root { --bg: #fff; /* --brand: #f00 */ }"), {"--bg": "#fff"}
        )
        self.assertEqual(dc.token_blocks(":root { --a: 1; --b: 2; }"), {"--a": "1", "--b": "2"})

    def test_a_palette_without_a_paper_band_moves_no_route_score(self) -> None:
        make_project(self.root, css=":root { --color-primary: #2563EB }")
        signals = dc.collect_signals(self.root)
        self.assertEqual(
            {k: signals["palette"][k] for k in ("band", "paper_var", "L")},
            {"band": None, "paper_var": None, "L": None},
        )
        items = dc.enrich(dc.load_index())
        overlay = dc.load_overlay()
        prompt = "observability and monitoring for developers"
        with_accent = dc.route(items, overlay, prompt=prompt, signals=signals, n=200)
        without = dc.route(items, overlay, prompt=prompt, signals={**signals, "palette": None}, n=200)
        self.assertEqual(with_accent, without)
        self.assertTrue(all(p["parts"]["palette"] == 0 for p in with_accent["picks"]))
        self.assertFalse(any(s.startswith("palette:") for s in with_accent["signals_used"]))
        shown = run("route", "--prompt", prompt, "--root", str(self.root))
        self.assertEqual(shown.returncode, 0, shown.stderr)
        self.assertNotIn("palette:None", shown.stdout)

    def test_signals_accent_formats(self) -> None:
        cases = {
            "oklch(0.7 0.15 60)": (0.15, 60),
            "oklch(55% 0.2 263deg)": (0.2, 263),
            "rgb(37, 99, 235)": (0.215, 263),
            "221 83% 53%": (0.213, 263),
            "#6B7280": (0.023, 264),
        }
        for value, (chroma, hue) in cases.items():
            detail = dc.color_detail(value)
            self.assertAlmostEqual(detail["C"], chroma, delta=0.004, msg=value)
            self.assertRegex(detail["hex"], HEX, value)
            self.assertLessEqual(
                palette.hue_distance(palette.hex_to_oklch(detail["hex"])[2], hue), 2, value
            )
            self.assertEqual(round(dc.parse_color(value)[1]), hue, value)
        self.assertIsNone(dc.color_detail("var(--x)"))
        self.assertIsNone(dc.color_detail("oklch(0.7)"))

    def test_slop_fixture_is_the_current_apply_output(self) -> None:
        result = run("apply", "style:airy-glass", "--root", str(self.root), "--palette", "hue:202")
        self.assertEqual(result.returncode, 0, result.stderr)
        # read_text, not bytes: a core.autocrlf checkout may hold the fixture as CRLF.
        self.assertEqual(
            (self.root / "DESIGN.md").read_text(encoding="utf-8"),
            (SLOP_FIXTURE / "DESIGN.md").read_text(encoding="utf-8"),
        )
        colors = palette.derive(202, SPEC)["colors"]
        page = (SLOP_FIXTURE / "index.html").read_text(encoding="utf-8")
        self.assertIn(f"--color-field-start: {colors['field-start']};", page)
        self.assertIn(f"--color-field-end: {colors['field-end']};", page)
        self.assertIn(
            "linear-gradient(160deg, var(--color-field-start), var(--color-field-end))", page
        )
        # Hue 202 to hue 328 is the pair slop_check gate 2a reads as purple-to-blue.
        self.assertEqual(palette.derive(202, SPEC)["output_hue"], 328)


class OtherEntriesTests(unittest.TestCase):
    """Entries without palette data keep the output they had before the dial."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.index = dc.load_index()

    def call(self, *args: str) -> tuple[int, str, str]:
        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            code = dc.main(list(args))
        return code, out.getvalue(), err.getvalue()

    def test_only_airy_glass_has_a_dial(self) -> None:
        self.assertEqual(list(palette.load_palettes()), [ENTRY])
        self.assertIsNone(palette.spec_for("theme:riso"))
        self.assertIn(ENTRY, {entry["id"] for entry in self.index["entries"]})

    def test_apply_and_show_are_the_entry_file_plus_provenance(self) -> None:
        checked = 0
        for entry in self.index["entries"]:
            if entry["id"] == ENTRY:
                continue
            source = (CATALOG / entry["path"]).read_text(encoding="utf-8")
            expected = dc.with_provenance(source, dc.provenance(self.index, entry))
            with tempfile.TemporaryDirectory() as tmp:
                code, out, err = self.call("apply", entry["id"], "--root", tmp)
                written = (Path(tmp) / "DESIGN.md").read_bytes()
                self.assertEqual([p.name for p in Path(tmp).iterdir()], ["DESIGN.md"])
                target = Path(tmp) / "DESIGN.md"
            self.assertEqual(code, 0, entry["id"])
            self.assertEqual(written, expected.encode("utf-8"), entry["id"])
            self.assertEqual(out, f"wrote: {target} ({entry['id']})\n", entry["id"])
            self.assertNotIn("palette", out)
            self.assertNotIn("<!-- palette:", expected)
            superseded = entry.get("superseded_by")
            self.assertEqual(bool(err), bool(superseded), entry["id"])
            code, shown, _ = self.call("show", entry["id"])
            self.assertEqual((code, shown), (0, source), entry["id"])
            checked += 1
        self.assertEqual(checked, len(self.index["entries"]) - 1)

    def test_project_signals_do_not_change_other_entries(self) -> None:
        with tempfile.TemporaryDirectory() as plain, tempfile.TemporaryDirectory() as blue:
            make_project(Path(blue), css=BLUE_CSS, readme="# 餐饮 fintech\n")
            for entry_id in ("theme:riso", "brand:vercel", "brand:kraken", "scene:bi",
                             "style:glassmorphism"):
                first = run("apply", entry_id, "--root", plain)
                second = run("apply", entry_id, "--root", blue)
                self.assertEqual((first.returncode, second.returncode), (0, 0), entry_id)
                written = [Path(root) / "DESIGN.md" for root in (plain, blue)]
                self.assertEqual(written[0].read_bytes(), written[1].read_bytes(), entry_id)
                self.assertNotIn("palette:", second.stdout)
                for path in written:
                    path.unlink()


if __name__ == "__main__":
    unittest.main()
