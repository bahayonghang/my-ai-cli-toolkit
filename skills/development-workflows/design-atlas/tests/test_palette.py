#!/usr/bin/env python3
"""Tests for scripts/palette.py and the palette data in overlays/palettes.json."""

from __future__ import annotations

import contextlib
import copy
import io
import json
import re
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
MINT = {
    "field-start": "#E7F6F1",
    "field-end": "#EDE7F8",
    "input": "#187A56",
    "input-wash": "#E7F7F0",
    "output": "#6D4BD6",
    "output-wash": "#F3EEFC",
}
# The table that shipped with the entry before the colourway dial.
MINT_TABLE = {
    "ink-white": 13.47,
    "ink-sheet-start": 13.16,
    "muted-sheet-start": 5.37,
    "input-wash": 4.79,
    "input-white": 5.31,
    "output-wash": 5.08,
    "output-white": 5.79,
    "edge-field": 1.11,
}
GATED = (
    "ink-white", "ink-sheet-start", "ink-sheet-end", "muted-sheet-start",
    "muted-sheet-end", "input-wash", "input-white", "output-wash", "output-white",
)
HEX = re.compile(r"#[0-9A-F]{6}")


def ratios(colors: dict) -> dict[str, dict]:
    return {row["id"]: row for row in palette.gates(colors, SPEC["fixed"])}


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
        for gate_id, expected in MINT_TABLE.items():
            self.assertAlmostEqual(rows[gate_id]["ratio"], expected, delta=0.01, msg=gate_id)
        # The lavender end is the worse sheet for muted text; it is gated too.
        self.assertAlmostEqual(rows["muted-sheet-end"]["ratio"], 5.29, delta=0.01)
        self.assertAlmostEqual(rows["ink-sheet-end"]["ratio"], 12.95, delta=0.01)

    def test_sheet_is_an_8_bit_srgb_mix(self) -> None:
        self.assertEqual(palette.over("#FFFFFF", "#E7F6F1", 0.78), "#FAFDFC")
        self.assertEqual(palette.over("#FFFFFF", "#EDE7F8", 0.78), "#FBFAFD")
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
        self.assertEqual([row["id"] for row in rows], [*GATED, "edge-field"])
        for row in rows:
            if row["id"] == "edge-field":
                self.assertIsNone(row["min"])
                self.assertIsNone(row["pass"])
            else:
                self.assertEqual(row["min"], 4.5)
                self.assertIs(row["pass"], True)
        self.assertEqual(palette.failures(rows), [])
        weak = {**MINT, "input": "#1F8A62"}
        self.assertEqual(
            palette.failures(palette.gates(weak, SPEC["fixed"])), ["input-wash", "input-white"]
        )
        low = {**MINT, "field-end": "#8A8FA0"}
        self.assertIn("muted-sheet-end", palette.failures(palette.gates(low, SPEC["fixed"])))


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
        self.assertEqual(
            SPEC["fixed"], {"ink": "#24303A", "muted": "#5C6B76", "sheet-alpha": 0.78}
        )
        for name, preset in SPEC["presets"].items():
            self.assertRegex(name, r"^[a-z]+$")
            self.assertEqual(
                set(preset),
                {"anchor", "label", *palette.ROLES, "keywords_en", "keywords_zh"},
                name,
            )
            self.assertTrue(0 <= preset["anchor"] <= 359, name)
            self.assertTrue(preset["label"]["zh"] and preset["label"]["en"], name)
            for role in palette.ROLES:
                self.assertRegex(preset[role], HEX, f"{name}.{role}")

    def test_mint_is_the_shipped_palette(self) -> None:
        self.assertEqual({role: SPEC["presets"]["mint"][role] for role in palette.ROLES}, MINT)

    def test_every_preset_passes_the_gates(self) -> None:
        for name, preset in SPEC["presets"].items():
            colors = {role: preset[role] for role in palette.ROLES}
            rows = ratios(colors)
            for gate_id in GATED:
                self.assertGreaterEqual(rows[gate_id]["ratio"], 4.5, f"{name} {gate_id}")
            self.assertEqual(palette.failures(list(rows.values())), [], name)
            self.assertLess(rows["edge-field"]["ratio"], 3.0, name)

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
        # render() swaps the default hex values one for one.
        self.assertEqual(len(set(MINT.values())), len(MINT))
        self.assertNotIn(SPEC["fixed"]["ink"], MINT.values())
        self.assertNotIn(SPEC["fixed"]["muted"], MINT.values())
        self.assertNotIn("#FFFFFF", MINT.values())

    def test_template_tokens_match_the_fixed_values(self) -> None:
        head = template()[: template().index("\n---\n", 4)]
        alpha = SPEC["fixed"]["sheet-alpha"]
        self.assertIn(f'  sheet: "rgba(255,255,255,{alpha:.2f})"', head)
        self.assertIn(f'  ink: "{SPEC["fixed"]["ink"]}"', head)
        self.assertIn(f'  muted: "{SPEC["fixed"]["muted"]}"', head)

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
                self.assertGreaterEqual(rows[gate_id]["ratio"], 4.5, f"hue {hue} {gate_id}")
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

    def test_derive_is_deterministic_and_wraps(self) -> None:
        self.assertEqual(palette.derive(18, SPEC), palette.derive(18, SPEC))
        self.assertEqual(
            palette.derive(378, SPEC)["colors"], palette.derive(18, SPEC)["colors"]
        )


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

    def test_dark_project_gets_a_note_and_still_a_light_palette(self) -> None:
        choice = palette.choose(SPEC, signal=self.signal(band="dark"))
        self.assertEqual(choice["palette"], "sky")
        self.assertTrue(any("dark" in note for note in choice["notes"]))

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


class RenderTests(unittest.TestCase):
    def check_document(self, text: str, colors: dict) -> None:
        allowed = {*colors.values(), SPEC["fixed"]["ink"], SPEC["fixed"]["muted"], "#FFFFFF"}
        self.assertEqual(set(re.findall(r"#[0-9A-Fa-f]{6}\b", text)) - allowed, set())
        head = text[: text.index("\n---\n", 4)]
        for role in palette.ROLES:
            self.assertIn(f'  {role}: "{colors[role]}"', head)
        self.assertNotIn("canvas-mint", text)
        self.assertNotIn("canvas-lavender", text)
        self.assertIn(
            f"linear-gradient(160deg, {colors['field-start']}, {colors['field-end']})", text
        )
        # Every gate row is in the Accessibility table with the measured ratio.
        table = text[text.index("<!-- palette:begin contrast -->") :]
        table = table[: table.index("<!-- palette:end contrast -->")]
        rows = palette.gates(colors, SPEC["fixed"])
        self.assertEqual(table.count("\n| `#"), len(rows))
        for row in rows:
            self.assertIn(f"| `{row['fg']}` |", table)
            self.assertIn(f"| {row['ratio']:.2f} |", table)
        self.assertNotIn("\u2014", text)
        for line in text.split("\n"):
            self.assertEqual(line, line.rstrip())

    def test_template_is_the_default_colourway(self) -> None:
        text = template()
        mint = palette.choose(SPEC, override="mint")
        self.assertEqual(palette.render(text, mint, SPEC), text)
        self.check_document(text, MINT)
        for name in ("colourway", "contrast"):
            self.assertEqual(text.count(f"<!-- palette:begin {name} -->"), 1)
            self.assertEqual(text.count(f"<!-- palette:end {name} -->"), 1)

    def test_template_names_colours_only_inside_the_colourway_block(self) -> None:
        text = template()
        start = text.index("<!-- palette:begin colourway -->")
        end = text.index("<!-- palette:end colourway -->")
        outside = (text[:start] + text[end:]).lower()
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
        for choice in choices:
            out = palette.render(text, choice, SPEC)
            self.check_document(out, choice["colors"])
            self.assertIn(f"Colourway: `{choice['palette']}`", out)
            if choice["colors"] != MINT:
                for value in MINT.values():
                    if value not in choice["colors"].values():
                        self.assertNotIn(value, out, choice["palette"])
            # Rendering a rendered file again with the same choice changes nothing:
            # no default hex is left to swap, and the blocks come out the same.
            self.assertEqual(palette.render(out, choice, SPEC), out, choice["palette"])

    def test_render_needs_both_blocks(self) -> None:
        broken = template().replace("<!-- palette:begin contrast -->", "<!-- gone -->")
        with self.assertRaises(ValueError):
            palette.render(broken, palette.choose(SPEC, override="sky"), SPEC)

    def test_comment_cannot_close_itself(self) -> None:
        choice = {**palette.choose(SPEC), "reason": "keywords a --> b"}
        self.assertEqual(palette.comment(choice).count("-->"), 1)


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
        self.assertIn("sky fails contrast gates input-wash, input-white", err.getvalue())
        # --force was given, and the old file was still neither renamed nor replaced.
        self.assertEqual(self.names(), ["design.md"])
        self.assertEqual(existing.read_bytes(), b"mine\n")
        # The same data with a passing preset still writes.
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            code = dc.apply(index, entry, self.root, True, spec=weak, override="mint")
        self.assertEqual(code, 0)

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
        self.assertEqual(sum(" pass" in line for line in lines), 9)
        self.assertEqual(sum(line.endswith("report") for line in lines), 1)
        self.assertNotIn("FAIL", text.stdout)
        as_json = run("palette", "style:airy-glass", "--root", str(self.root), "--format", "json")
        self.assertEqual(as_json.returncode, 0, as_json.stderr)
        self.assertEqual(self.names(), before)
        data = json.loads(as_json.stdout)
        self.assertEqual(
            set(data), {"entry", "palette", "reason", "notes", "colors", "contrast"}
        )
        self.assertEqual(data["entry"], "style:airy-glass")
        self.assertEqual(data["palette"], "sky")
        self.assertEqual(data["colors"], preset_colors("sky"))
        self.assertEqual(len(data["contrast"]), 10)
        for row in data["contrast"]:
            self.assertEqual(set(row), {"id", "fg", "bg", "ratio", "min", "pass"})
            if row["id"] == "edge-field":
                self.assertIsNone(row["pass"])
            else:
                self.assertTrue(row["pass"])
                self.assertGreaterEqual(row["ratio"], 4.5)

    def test_palette_command_matches_apply(self) -> None:
        make_project(self.root, css=":root { --brand: #E11D48; --bg: #fff }\n")
        shown = run("palette", "style:airy-glass", "--root", str(self.root), "--format", "json")
        data = json.loads(shown.stdout)
        applied = run("apply", "style:airy-glass", "--root", str(self.root))
        self.assertIn(f"palette: {data['palette']} ({data['reason']})", applied.stdout)
        text = self.design()
        for value in data["colors"].values():
            self.assertIn(value, text)

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
