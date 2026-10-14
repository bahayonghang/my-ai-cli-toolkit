#!/usr/bin/env python3
"""Tests for build_catalog.py. Fixtures are generated in a temp directory.

Do not commit fixture files named SKILL.md: the docs catalog sync and
scripts/check.py collect every SKILL.md under skills/.
"""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]
BUILD = SKILL_ROOT / "scripts" / "build_catalog.py"

CATEGORIES = {
    "categories": [
        {"id": "brand-ai", "kind": "brand", "en": "AI", "zh": "AI", "order": 1},
        {
            "id": "brand-retro",
            "kind": "brand",
            "en": "Retro Web",
            "zh": "复古网页",
            "order": 2,
        },
        {"id": "style-min", "kind": "style", "en": "Minimal", "zh": "极简", "order": 3},
    ],
    "brand": {
        "readme_heading_prefixes": [
            ["AI Platforms", "brand-ai"],
            ["Retro Web", "brand-retro"],
        ],
        "overrides": {"extra": "brand-ai"},
    },
    "style": {"style-min": ["calm", "plain"]},
}

README = """# Awesome

## Collection

### AI Platforms

- [**Acme AI**](https://getdesign.md/acme/design-md) - Acme model host. Calm blue

### Retro Web · Nostalgia

- [**Old Site**](https://getdesign.md/old/design-md) - Old portal. Beveled chrome
"""

BRAND_STITCH = """---
version: alpha
name: Acme
description: Acme blue system.
colors:
  primary: "#0000ff"
---

## Overview

Acme overview.
"""

BRAND_LEGACY = (
    "# Design System Inspired by Old\r\n\r\n## 1. Visual Theme\r\n\r\nOld text.   \r\n"
)

BRAND_EXTRA = """---
version: alpha
name: Extra-design-analysis
description: An extra brand. Second sentence.
---

## Overview

Extra.
"""


def style_skill(slug: str, brand: str) -> str:
    return f"""---
name: {slug}
description: "{slug.title()} style description."
license: MIT
metadata:
  author: typeui.sh
---

<!-- TYPEUI_SH_MANAGED_START -->
# {slug} Design System Skill (Universal)

## Mission
You are an expert.

## Brand
{brand}

## Style Foundations
- Visual style: {slug}

## Accessibility
WCAG 2.2 AA

## Writing Tone
concise

## Rules: Do
- prefer semantic tokens

## Rules: Don't
- avoid low contrast text

## Expected Behavior
- Follow the foundations first.

## Guideline Authoring Workflow
1. Restate the design intent.

<!-- TYPEUI_SH_MANAGED_END -->
"""


def style_design(slug: str) -> str:
    return f"""---
name: {slug.title()}
colors:
  primary: "#111111"
---

## Overview

{slug.title()} style description.

## Style Foundations

- **Visual style:** {slug}

## Colors

- **Primary (#111111):** Token.
"""


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode("utf-8"))


def make_upstreams(
    root: Path, *, uncategorized: bool = False
) -> tuple[Path, Path, Path]:
    design_md = root / "awesome-design-md"
    write(design_md / "README.md", README)
    write(design_md / "LICENSE", "MIT License\n\nCopyright (c) VoltAgent  \n")
    write(design_md / "design-md" / "acme" / "DESIGN.md", BRAND_STITCH)
    write(design_md / "design-md" / "old" / "DESIGN.md", BRAND_LEGACY)
    write(design_md / "design-md" / "extra" / "DESIGN.md", BRAND_EXTRA)
    if uncategorized:
        write(design_md / "design-md" / "lost" / "DESIGN.md", BRAND_EXTRA)

    skills = root / "awesome-design-skills"
    write(skills / "LICENSE", "MIT License\n\nCopyright (c) Bergside\n")
    index = {}
    for slug, brand in (("calm", "Calm brand character text."), ("plain", "")):
        write(skills / "skills" / slug / "SKILL.md", style_skill(slug, brand))
        write(skills / "skills" / slug / "DESIGN.md", style_design(slug))
        index[slug] = {"slug": slug, "name": slug.title()}
    write(skills / "skills" / "index.json", json.dumps(index))

    out = root / "out"
    write(out / "categories.json", json.dumps(CATEGORIES, ensure_ascii=False))
    return design_md, skills, out


def run_build(design_md: Path, skills: Path, out: Path) -> subprocess.CompletedProcess:
    return subprocess.run(
        [
            sys.executable,
            str(BUILD),
            "--design-md",
            str(design_md),
            "--design-skills",
            str(skills),
            "--out",
            str(out),
            "--commit-design-md",
            "aaaaaaa",
            "--commit-design-skills",
            "bbbbbbb",
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
    )


class BuildCatalogTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def test_builds_index_and_entries(self) -> None:
        design_md, skills, out = make_upstreams(self.root)
        result = run_build(design_md, skills, out)
        self.assertEqual(result.returncode, 0, result.stderr)

        index = json.loads((out / "index.json").read_text(encoding="utf-8"))
        ids = [entry["id"] for entry in index["entries"]]
        self.assertEqual(
            ids, ["brand:acme", "brand:extra", "brand:old", "style:calm", "style:plain"]
        )
        by_id = {entry["id"]: entry for entry in index["entries"]}
        self.assertEqual(by_id["brand:acme"]["category"], "brand-ai")
        self.assertEqual(by_id["brand:acme"]["name"], "Acme AI")
        self.assertEqual(by_id["brand:acme"]["format"], "stitch")
        self.assertEqual(by_id["brand:old"]["category"], "brand-retro")
        self.assertEqual(by_id["brand:old"]["format"], "legacy")
        self.assertEqual(by_id["brand:extra"]["category"], "brand-ai")
        self.assertEqual(by_id["brand:extra"]["description"], "An extra brand.")
        self.assertEqual(by_id["style:calm"]["description"], "Calm style description.")
        self.assertEqual(index["sources"]["awesome-design-md"]["commit"], "aaaaaaa")
        self.assertTrue((out / "LICENSES" / "awesome-design-skills.LICENSE").is_file())

    def test_style_entry_keeps_style_sections_only(self) -> None:
        design_md, skills, out = make_upstreams(self.root)
        self.assertEqual(run_build(design_md, skills, out).returncode, 0)
        calm = (out / "styles" / "calm.md").read_text(encoding="utf-8")
        for heading in (
            "## Brand Character",
            "## Accessibility",
            "## Writing Tone",
            "## Do's and Don'ts",
            "### Do",
            "### Don't",
        ):
            self.assertIn(heading, calm)
        self.assertEqual(calm.count("## Style Foundations"), 1)
        for removed in (
            "Guideline Authoring Workflow",
            "Expected Behavior",
            "TYPEUI_SH_MANAGED",
            "## Mission",
        ):
            self.assertNotIn(removed, calm)
        plain = (out / "styles" / "plain.md").read_text(encoding="utf-8")
        self.assertNotIn("## Brand Character", plain)

    def test_output_is_normalized(self) -> None:
        design_md, skills, out = make_upstreams(self.root)
        self.assertEqual(run_build(design_md, skills, out).returncode, 0)
        for path in out.rglob("*"):
            if path.is_file() and path.name != "categories.json" and path.suffix in {".md", ".json", ".LICENSE"}:
                data = path.read_bytes()
                self.assertNotIn(b"\r", data, path)
                self.assertTrue(
                    data.endswith(b"\n") and not data.endswith(b"\n\n"), path
                )
                for line in data.decode("utf-8").split("\n"):
                    self.assertEqual(line, line.rstrip(), path)

    def test_rebuild_is_byte_identical(self) -> None:
        design_md, skills, out = make_upstreams(self.root)
        self.assertEqual(run_build(design_md, skills, out).returncode, 0)
        first = {p: p.read_bytes() for p in out.rglob("*") if p.is_file()}
        self.assertEqual(run_build(design_md, skills, out).returncode, 0)
        second = {p: p.read_bytes() for p in out.rglob("*") if p.is_file()}
        self.assertEqual(first, second)

    def test_removes_stale_entries(self) -> None:
        design_md, skills, out = make_upstreams(self.root)
        write(out / "brands" / "gone.md", "stale\n")
        self.assertEqual(run_build(design_md, skills, out).returncode, 0)
        self.assertFalse((out / "brands" / "gone.md").exists())

    def test_uncategorized_entry_fails(self) -> None:
        design_md, skills, out = make_upstreams(self.root, uncategorized=True)
        result = run_build(design_md, skills, out)
        self.assertEqual(result.returncode, 1)
        self.assertIn("lost", result.stderr)
        self.assertFalse((out / "index.json").exists())


if __name__ == "__main__":
    unittest.main()
