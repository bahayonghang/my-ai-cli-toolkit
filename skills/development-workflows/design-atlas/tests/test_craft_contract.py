#!/usr/bin/env python3
"""Deterministic craft-resource connectivity; not model or visual evaluation."""

from __future__ import annotations

import re
import unittest
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]
REFERENCES = SKILL_ROOT / "references"


class CraftResourceTests(unittest.TestCase):
    def test_craft_is_reachable_from_build_restyle_and_core(self) -> None:
        for relative in (
            "SKILL.md",
            "references/implementation.md",
            "references/restyle.md",
            "references/design-system-core.md",
        ):
            with self.subTest(relative=relative):
                path = SKILL_ROOT / relative
                text = path.read_text(encoding="utf-8")
                targets = re.findall(r"\]\(([^)#]+)(?:#[^)]*)?\)", text)
                targets += re.findall(r"`(references/craft-polish\.md)`", text)
                resolved = {(path.parent / target).resolve() for target in targets}
                self.assertIn((REFERENCES / "craft-polish.md").resolve(), resolved)

    def test_craft_local_links_resolve_inside_the_skill(self) -> None:
        path = REFERENCES / "craft-polish.md"
        targets = re.findall(r"\]\(([^)#]+)(?:#[^)]*)?\)", path.read_text(encoding="utf-8"))
        local_targets = [target for target in targets if "://" not in target]
        self.assertTrue(local_targets, "craft guidance must link its existing owners")
        for target in local_targets:
            with self.subTest(target=target):
                resolved = (path.parent / target).resolve()
                self.assertTrue(resolved.is_relative_to(SKILL_ROOT.resolve()))
                self.assertTrue(resolved.is_file(), target)

    def test_craft_gate_citations_have_existing_owners(self) -> None:
        registry = (REFERENCES / "anti-slop.md").read_text(encoding="utf-8")
        registered = set(re.findall(r"^\|\s*(DA\d+|\d+[a-z]?)\s*\|", registry, re.MULTILINE))
        craft = (REFERENCES / "craft-polish.md").read_text(encoding="utf-8")
        cited = set(re.findall(r"\bDA\d+\b", craft))
        for group in re.findall(r"\bgates?\s+((?:\d+[a-z]?(?:, | and )?)+)", craft):
            cited.update(re.findall(r"\d+[a-z]?", group))
        self.assertTrue(cited)
        self.assertLessEqual(cited, registered, "a recipe cannot invent a gate id")


if __name__ == "__main__":
    unittest.main()
