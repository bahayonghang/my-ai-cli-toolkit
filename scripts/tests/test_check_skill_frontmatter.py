#!/usr/bin/env python3
"""Unit tests for scripts/check_skill_frontmatter.py."""

from __future__ import annotations

import io
import json
import sys
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from tempfile import TemporaryDirectory

SCRIPTS_DIR = Path(__file__).resolve().parents[1]
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

import check_skill_frontmatter  # noqa: E402


def write_skill_md(
    root: Path,
    category: str,
    slug: str,
    body: str,
    *,
    encoding: str = "utf-8",
) -> Path:
    skill_dir = root / "skills" / category / slug
    skill_dir.mkdir(parents=True, exist_ok=True)
    (skill_dir / "SKILL.md").write_text(body, encoding=encoding)
    return skill_dir


def run_cli(*args: str) -> tuple[int, str, str]:
    out = io.StringIO()
    err = io.StringIO()
    with redirect_stdout(out), redirect_stderr(err):
        code = check_skill_frontmatter.main(list(args))
    return code, out.getvalue(), err.getvalue()


class CheckSkillFrontmatterTests(unittest.TestCase):
    def test_valid_skill_tree_passes(self) -> None:
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            skill_dir = write_skill_md(
                root,
                "development-workflows",
                "demo-skill",
                "---\n"
                "name: demo-skill\n"
                "description: Validate demo workflow.\n"
                "category: development-workflows\n"
                "tags:\n  - workflow\n"
                "version: 0.1.0\n"
                "---\n\n# Demo\n",
            )
            code, out, err = run_cli(str(skill_dir))
        self.assertEqual(code, 0, err)
        self.assertIn("[OK]", out)

    def test_utf8_bom_skill_md_passes(self) -> None:
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            skill_dir = write_skill_md(
                root,
                "development-workflows",
                "bom-skill",
                "---\n"
                "name: bom-skill\n"
                "description: Handles UTF-8 BOM.\n"
                "category: development-workflows\n"
                "---\n",
                encoding="utf-8-sig",
            )
            code, _out, err = run_cli(str(skill_dir))
        self.assertEqual(code, 0, err)

    def test_missing_unclosed_or_invalid_yaml_fails(self) -> None:
        cases = (
            ("no-fm", "# Missing frontmatter\n"),
            ("unclosed", "---\nname: unclosed\ndescription: oops\n"),
            ("bad-yaml", "---\nname: [unterminated\n---\n"),
        )
        for slug, content in cases:
            with self.subTest(slug=slug), TemporaryDirectory() as tmp:
                root = Path(tmp)
                skill_dir = write_skill_md(root, "development-workflows", slug, content)
                code, out, _err = run_cli(str(skill_dir))
                self.assertEqual(code, 1, out)
                self.assertIn("[FAIL]", out)

    def test_invalid_name_and_description_fail(self) -> None:
        bad_names = ("UpperCase", "-leading", "trailing-", "double--hyphen", "a" * 65)
        for bad_name in bad_names:
            with self.subTest(name=bad_name), TemporaryDirectory() as tmp:
                root = Path(tmp)
                skill_dir = write_skill_md(
                    root,
                    "development-workflows",
                    "demo-skill",
                    f"---\nname: {bad_name}\ndescription: Valid desc.\n---\n",
                )
                code, out, _err = run_cli(str(skill_dir))
                self.assertEqual(code, 1, out)

        bad_descriptions = ("contains <tag>", "x" * 1025)
        for desc in bad_descriptions:
            with self.subTest(desc_len=len(desc)), TemporaryDirectory() as tmp:
                root = Path(tmp)
                skill_dir = write_skill_md(
                    root,
                    "development-workflows",
                    "demo-skill",
                    f"---\nname: demo-skill\ndescription: \"{desc}\"\n---\n",
                )
                code, out, _err = run_cli(str(skill_dir))
                self.assertEqual(code, 1, out)

    def test_non_canonical_or_mismatched_category_fails(self) -> None:
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            skill_dir = write_skill_md(
                root,
                "development-workflows",
                "demo-skill",
                "---\nname: demo-skill\ndescription: Valid.\ncategory: unknown-cat\n---\n",
            )
            code, out, _err = run_cli(str(skill_dir))
        self.assertEqual(code, 1)
        self.assertIn("category must be one of", out)

        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            skill_dir = write_skill_md(
                root,
                "development-workflows",
                "demo-skill",
                "---\nname: demo-skill\ndescription: Valid.\ncategory: docs-writing-publishing\n---\n",
            )
            code, out, _err = run_cli(str(skill_dir))
        self.assertEqual(code, 1)
        self.assertIn("does not match directory category", out)

    def test_nested_metadata_and_unknown_key_warn_without_mcs_core(self) -> None:
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            skill_dir = write_skill_md(
                root,
                "development-workflows",
                "demo-skill",
                "---\n"
                "name: demo-skill\n"
                "description: Valid.\n"
                "extra-key: value\n"
                "metadata:\n"
                "  category: development-workflows\n"
                "  tags: [demo]\n"
                "---\n",
            )
            code, out, err = run_cli("--json", str(skill_dir))
        self.assertEqual(code, 0, err)
        payload = json.loads(out)
        self.assertEqual(len(payload), 1)
        self.assertTrue(payload[0]["ok"])
        warnings = payload[0]["warnings"]
        self.assertEqual(len(warnings), 3)
        for warning in warnings:
            self.assertNotIn("mcs-core", warning)

    def test_missing_target_fails_even_with_valid_target(self) -> None:
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            skill_dir = write_skill_md(
                root,
                "development-workflows",
                "demo-skill",
                "---\nname: demo-skill\ndescription: Valid.\ncategory: development-workflows\n---\n",
            )
            missing = root / "does-not-exist"
            code, _out, err = run_cli(str(skill_dir), str(missing))
        self.assertEqual(code, 1)
        self.assertIn("Target not found", err)

    def test_skips_scaffolds_and_nested_fixture_skill_md(self) -> None:
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            skills_root = root / "skills"
            skill_dir = write_skill_md(
                root,
                "development-workflows",
                "demo-skill",
                "---\nname: demo-skill\ndescription: Valid.\ncategory: development-workflows\n---\n",
            )
            # Nested fixture inside a real skill should not be scanned as a top-level skill
            fixture_dir = skill_dir / "tests" / "fixtures" / "bad-skill"
            fixture_dir.mkdir(parents=True)
            (fixture_dir / "SKILL.md").write_text("broken without frontmatter", encoding="utf-8")

            # Scaffolds directory should be skipped completely
            scaffold_dir = skills_root / "scaffolds" / "template-skill"
            scaffold_dir.mkdir(parents=True)
            (scaffold_dir / "SKILL.md").write_text("broken scaffold", encoding="utf-8")

            code, out, err = run_cli("--json", str(skills_root))
        self.assertEqual(code, 0, err)
        payload = json.loads(out)
        self.assertEqual(len(payload), 1)
        self.assertTrue(payload[0]["path"].endswith("demo-skill"))


if __name__ == "__main__":
    unittest.main()
