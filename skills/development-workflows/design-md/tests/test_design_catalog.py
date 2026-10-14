#!/usr/bin/env python3
"""Tests for the committed catalog assets and the design_catalog.py CLI."""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]
CATALOG = SKILL_ROOT / "assets" / "catalog"
CLI = SKILL_ROOT / "scripts" / "design_catalog.py"


def run(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(CLI), *args],
        capture_output=True,
        text=True,
        encoding="utf-8",
    )


class CatalogAssetTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.index = json.loads((CATALOG / "index.json").read_text(encoding="utf-8"))

    def test_counts(self) -> None:
        entries = self.index["entries"]
        self.assertEqual(len(entries), 151)
        self.assertEqual(sum(e["kind"] == "brand" for e in entries), 84)
        self.assertEqual(sum(e["kind"] == "style" for e in entries), 67)
        self.assertEqual(len(self.index["categories"]), 18)

    def test_every_entry_has_file_and_known_category(self) -> None:
        categories = {c["id"] for c in self.index["categories"]}
        ids = set()
        for entry in self.index["entries"]:
            self.assertNotIn(entry["id"], ids)
            ids.add(entry["id"])
            self.assertIn(entry["category"], categories, entry["id"])
            self.assertTrue((CATALOG / entry["path"]).is_file(), entry["id"])
            self.assertTrue(entry["description"], entry["id"])
        used = {e["category"] for e in self.index["entries"]}
        self.assertEqual(used, categories)

    def test_style_entries_carry_style_sections_only(self) -> None:
        for path in sorted((CATALOG / "styles").glob("*.md")):
            text = path.read_text(encoding="utf-8")
            self.assertIn("## Accessibility", text, path.name)
            self.assertIn("### Do", text, path.name)
            self.assertNotIn("Guideline Authoring Workflow", text, path.name)
            self.assertNotIn("TYPEUI_SH_MANAGED", text, path.name)

    def test_assets_are_normalized(self) -> None:
        for path in CATALOG.rglob("*"):
            if not path.is_file():
                continue
            data = path.read_bytes()
            self.assertNotIn(b"\r", data, path.name)
            for line in data.decode("utf-8").split("\n"):
                self.assertEqual(line, line.rstrip(), path.name)

    def test_no_asset_is_named_skill_md(self) -> None:
        self.assertEqual(list(CATALOG.rglob("SKILL.md")), [])

    def test_licenses_present(self) -> None:
        for source in self.index["sources"].values():
            self.assertEqual(source["license"], "MIT")
            self.assertTrue((CATALOG / source["license_file"]).is_file())
            self.assertTrue(source["commit"])


class CliTests(unittest.TestCase):
    def test_list_text_groups_by_category(self) -> None:
        result = run("list")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(sum(line.startswith("## ") for line in result.stdout.splitlines()), 18)
        self.assertIn("AI 与大模型平台", result.stdout)
        self.assertIn("brand:linear.app", result.stdout)
        self.assertIn("151", result.stdout)

    def test_list_json_filters(self) -> None:
        result = run("list", "--kind", "brand", "--format", "json")
        self.assertEqual(result.returncode, 0, result.stderr)
        items = json.loads(result.stdout)
        self.assertEqual(len(items), 84)
        for key in (
            "id",
            "kind",
            "slug",
            "name",
            "category",
            "category_zh",
            "description",
            "source",
        ):
            self.assertIn(key, items[0])
        result = run("list", "--category", "style-tech-dark", "--format", "json")
        self.assertEqual(len(json.loads(result.stdout)), 8)

    def test_list_unknown_category(self) -> None:
        self.assertEqual(run("list", "--category", "nope").returncode, 2)

    def test_search(self) -> None:
        result = run("search", "linear")
        self.assertEqual(result.returncode, 0)
        self.assertIn("brand:linear.app", result.stdout)
        self.assertIn("style:minimal", run("search", "minimal").stdout)
        self.assertIn("style:minimal", run("search", "极简").stdout)
        self.assertEqual(run("search", "zzzz-no-match").returncode, 1)

    def test_show_and_ambiguity(self) -> None:
        brand = run("show", "brand:claude")
        style = run("show", "style:claude")
        self.assertEqual(brand.returncode, 0)
        self.assertNotEqual(brand.stdout, style.stdout)
        ambiguous = run("show", "claude")
        self.assertEqual(ambiguous.returncode, 2)
        self.assertIn("brand:claude", ambiguous.stderr)
        self.assertIn("style:claude", ambiguous.stderr)
        self.assertEqual(run("show", "linear.app").returncode, 0)
        self.assertEqual(run("show", "brand:nope").returncode, 2)


class ApplyTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def test_apply_writes_design_md_with_provenance(self) -> None:
        result = run("apply", "brand:vercel", "--root", str(self.root))
        self.assertEqual(result.returncode, 0, result.stderr)
        data = (self.root / "DESIGN.md").read_bytes()
        self.assertNotIn(b"\r", data)
        text = data.decode("utf-8")
        self.assertTrue(text.startswith("---\n"))
        closing = text.index("\n---\n", 4) + len("\n---\n")
        self.assertTrue(
            text[closing:].startswith("<!-- design-md: entry=brand:vercel;")
        )
        self.assertIn("license=MIT", text[closing : closing + 300])

    def test_apply_legacy_entry_puts_comment_first(self) -> None:
        self.assertEqual(
            run("apply", "brand:kraken", "--root", str(self.root)).returncode, 0
        )
        text = (self.root / "DESIGN.md").read_text(encoding="utf-8")
        self.assertTrue(text.startswith("<!-- design-md: entry=brand:kraken;"))

    def test_apply_refuses_existing_file_without_force(self) -> None:
        existing = self.root / "design.md"
        existing.write_bytes(b"mine\n")
        result = run("apply", "style:minimal", "--root", str(self.root))
        self.assertEqual(result.returncode, 3)
        self.assertIn("--force", result.stderr)
        self.assertEqual([p.name for p in self.root.iterdir()], ["design.md"])
        self.assertEqual(existing.read_bytes(), b"mine\n")

    def test_apply_force_backs_up(self) -> None:
        (self.root / "design.md").write_bytes(b"mine\n")
        result = run("apply", "style:minimal", "--root", str(self.root), "--force")
        self.assertEqual(result.returncode, 0, result.stderr)
        backups = [p for p in self.root.iterdir() if ".bak-" in p.name]
        self.assertEqual(len(backups), 1)
        self.assertEqual(backups[0].read_bytes(), b"mine\n")
        self.assertIn(
            "entry=style:minimal", (self.root / "DESIGN.md").read_text(encoding="utf-8")
        )

    def test_apply_bad_root(self) -> None:
        self.assertEqual(
            run(
                "apply", "style:minimal", "--root", str(self.root / "missing")
            ).returncode,
            2,
        )


if __name__ == "__main__":
    unittest.main()
