#!/usr/bin/env python3
"""Deterministic reachability of the GPUI implementation reference; not a model or visual evaluation."""

from __future__ import annotations

import importlib.util
import re
import tempfile
import unittest
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]
REFERENCES = SKILL_ROOT / "references"
GPUI_SPEC = REFERENCES / "implementation-gpui.md"

_spec = importlib.util.spec_from_file_location(
    "design_catalog_gpui_contract", SKILL_ROOT / "scripts" / "design_catalog.py"
)
dc = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(dc)

GPUI_MANIFEST = '[package]\nname = "desk"\n\n[dependencies]\ngpui = "0.2"\n'
TAURI_MANIFEST = '[package]\nname = "desk"\n\n[dependencies]\ntauri = "2"\n'

SECTIONS = (
    "Scope and project root",
    "Probe capabilities",
    "Token layer",
    "Material translation",
    "Component states and motion",
    "Fonts and icons",
    "Layout",
    "Window material",
    "Verify",
    "gpui-kit",
    "Platform status and sources",
)
PROBED = (
    "backdrop_blur",
    "radial_gradient",
    "inset",
    "add_fonts",
    "with_animation",
    "reduce_motion",
    "Opaque",
    "Transparent",
    "Blurred",
    "MicaBackdrop",
    "MicaAltBackdrop",
)
LINK_DEFINITION = re.compile(r"^\[([^\]]+)\]:\s*(\S+)\s*$", re.MULTILINE)


def inline_targets(text: str) -> list[str]:
    return re.findall(r"\]\(([^)#]+)(?:#[^)]*)?\)", text)


def spec_text() -> str:
    return GPUI_SPEC.read_text(encoding="utf-8")


def signals(manifest: str) -> dict:
    with tempfile.TemporaryDirectory() as tmp:
        (Path(tmp) / "Cargo.toml").write_text(manifest, encoding="utf-8")
        return dc.collect_signals(Path(tmp))


class GpuiReferenceTests(unittest.TestCase):
    def test_spec_is_reachable_from_skill_and_implementation(self) -> None:
        for relative in ("SKILL.md", "references/implementation.md", "references/review-prompt.md"):
            with self.subTest(relative=relative):
                path = SKILL_ROOT / relative
                text = path.read_text(encoding="utf-8")
                targets = inline_targets(text)
                targets += re.findall(r"`(references/implementation-gpui\.md)`", text)
                resolved = {(path.parent / target).resolve() for target in targets}
                self.assertIn(GPUI_SPEC.resolve(), resolved)

    def test_spec_local_links_resolve_inside_the_skill(self) -> None:
        local_targets = [target for target in inline_targets(spec_text()) if "://" not in target]
        self.assertTrue(local_targets, "the GPUI reference must link the files it replaces")
        for target in local_targets:
            with self.subTest(target=target):
                resolved = (GPUI_SPEC.parent / target).resolve()
                self.assertTrue(resolved.is_relative_to(SKILL_ROOT.resolve()))
                self.assertTrue(resolved.is_file(), target)

    def test_every_reference_style_link_is_defined_and_used(self) -> None:
        text = spec_text()
        defined = dict(LINK_DEFINITION.findall(text))
        used = set(re.findall(r"\]\[([^\]]+)\]", text))
        self.assertTrue(used)
        self.assertEqual(used, set(defined))
        for label, url in defined.items():
            with self.subTest(label=label):
                self.assertTrue(url.startswith("https://"), url)

    def test_external_facts_carry_a_dated_source(self) -> None:
        text = spec_text()
        defined = dict(LINK_DEFINITION.findall(text))
        stamps = re.findall(r"Last verified: (\d{4}-\d{2}-\d{2}) against \[[^\]]+\]\[([^\]]+)\]", text)
        self.assertTrue(stamps, "at least one `Last verified: <date> against <URL>` line")
        self.assertEqual(len(stamps), text.count("Last verified: 2"), "every stamp has a date and a source")
        for _date, label in stamps:
            self.assertIn(label, defined)

    def test_spec_has_the_eleven_sections_in_order(self) -> None:
        headings = re.findall(r"^## (\d+)\. (.+)$", spec_text(), re.MULTILINE)
        self.assertEqual([title for _number, title in headings], list(SECTIONS))
        self.assertEqual([int(number) for number, _title in headings], list(range(1, 12)))

    def test_probe_table_names_the_required_symbols(self) -> None:
        probe = spec_text().split("## 2. Probe capabilities", 1)[1].split("## 3. ", 1)[0]
        for symbol in PROBED:
            with self.subTest(symbol=symbol):
                self.assertIn(symbol, probe)

    def test_every_material_row_cites_the_spike_or_is_marked_unverified(self) -> None:
        section = spec_text().split("## 4. Material translation", 1)[1].split("## 5. ", 1)[0]
        table = section.split("Last verified:", 1)[0]
        rows = [
            [cell.strip() for cell in line.strip().strip("|").split("|")]
            for line in table.splitlines()
            if line.startswith("| ") and not line.startswith("| ---") and not line.startswith("| Item")
        ]
        self.assertGreaterEqual(len(rows), 10)
        for row in rows:
            with self.subTest(item=row[0]):
                self.assertEqual(len(row), 4, row)
                cites_spike = re.match(r"[A-F]\b", row[2]) is not None
                self.assertTrue(cites_spike or "未验证" in row[3], row)

    def test_signals_note_names_an_existing_file(self) -> None:
        notes = signals(GPUI_MANIFEST)["notes"]
        hints = [note for note in notes if dc.GPUI_SPEC in note]
        self.assertEqual(len(hints), 1, notes)
        self.assertEqual((SKILL_ROOT / dc.GPUI_SPEC).resolve(), GPUI_SPEC.resolve())
        self.assertTrue((SKILL_ROOT / dc.GPUI_SPEC).is_file())

    def test_a_project_without_gpui_gets_no_gpui_note(self) -> None:
        data = signals(TAURI_MANIFEST)
        self.assertEqual(data["frameworks"], [])
        self.assertFalse([note for note in data["notes"] if "implementation-gpui" in note], data["notes"])


if __name__ == "__main__":
    unittest.main()
