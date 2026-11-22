"""Tests for scripts/touying_check.py and graded 0.8.0 examples (#59)."""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = SKILL_ROOT / "scripts" / "touying_check.py"
FIXTURES_DIR = SKILL_ROOT / "tests" / "fixtures"
EXAMPLES_DIR = SKILL_ROOT / "examples"

LEGACY_EXAMPLE_FILES = (
    "aqua-zh.typ",
    "aqua.typ",
    "default.typ",
    "dewdrop.typ",
    "example.typ",
    "metropolis.typ",
    "simple.typ",
    "stargazer.typ",
    "university.typ",
)

EXPECTED_GRADED_EXAMPLES = (
    "README.md",
    "01-minimal.typ",
    "02-multi-file/globals.typ",
    "02-multi-file/main.typ",
    "02-multi-file/content.typ",
    "03-animations-waypoints-math.typ",
    "04-multi-mode-article.typ",
    "05-theme-notes.typ",
    "06-bundle-pdfpc.typ",
)


def run_cli(*args: str, cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    env.setdefault("PYTHONUTF8", "1")
    return subprocess.run(
        [sys.executable, str(SCRIPT_PATH), *args],
        cwd=str(cwd or SKILL_ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        env=env,
        check=False,
    )


def typst_meets_min_version() -> bool:
    typst_bin = shutil.which("typst")
    if not typst_bin:
        return False
    proc = subprocess.run(
        [typst_bin, "--version"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if proc.returncode != 0:
        return False
    match = re.search(r"(\d+)\.(\d+)\.(\d+)", proc.stdout)
    if not match:
        return False
    version = tuple(int(part) for part in match.groups())
    return version >= (0, 15, 0)


class TouyingCheckScriptTests(unittest.TestCase):
    def test_audit_valid_deck(self) -> None:
        proc = run_cli("audit", str(FIXTURES_DIR / "valid-0.8.typ"), "--json")
        self.assertEqual(proc.returncode, 0, msg=proc.stderr + proc.stdout)
        payload = json.loads(proc.stdout)
        self.assertEqual(payload["errors"], 0)
        self.assertEqual(payload["warnings"], 0)
        self.assertTrue(payload["ok"])

    def test_audit_non_ascii_temp_path(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            deck_dir = Path(tmp) / "幻灯片-测试"
            deck_dir.mkdir(parents=True, exist_ok=True)
            target = deck_dir / "演示-文稿.typ"
            target.write_text(
                (FIXTURES_DIR / "valid-0.8.typ").read_text(encoding="utf-8"),
                encoding="utf-8",
            )
            proc = run_cli("audit", str(target), "--json")
            self.assertEqual(proc.returncode, 0, msg=proc.stderr + proc.stdout)
            payload = json.loads(proc.stdout)
            self.assertEqual(payload["errors"], 0)
            self.assertEqual(payload["files_scanned"], 1)

    def test_audit_bad_outdated_import(self) -> None:
        proc = run_cli("audit", str(FIXTURES_DIR / "bad-outdated-import.typ"), "--json")
        self.assertNotEqual(proc.returncode, 0)
        payload = json.loads(proc.stdout)
        rules = {item["rule"] for item in payload["findings"]}
        self.assertIn("OUTDATED_TOUYING_IMPORT", rules)

    def test_audit_bad_deprecated_apis(self) -> None:
        proc = run_cli("audit", str(FIXTURES_DIR / "bad-deprecated-apis.typ"), "--json")
        self.assertNotEqual(proc.returncode, 0)
        payload = json.loads(proc.stdout)
        rules = {item["rule"] for item in payload["findings"]}
        expected = {
            "DEPRECATED_SEMI_TRANSPARENT_COVER",
            "DEPRECATED_TOUYING_EQUATION",
            "REMOVED_MAGIC_BIBLIOGRAPHY",
            "REMOVED_UTILS_HANDOUT_ONLY",
            "REMOVED_SHOW_ONLY_NOTES_RENDERER",
            "OLD_TOUYING_RECALL_SUBSLIDE_ARG",
        }
        self.assertTrue(expected.issubset(rules), msg=f"Missing rules: {expected - rules}")

    def test_audit_bad_antipatterns(self) -> None:
        proc = run_cli("audit", str(FIXTURES_DIR / "bad-antipatterns.typ"), "--json")
        self.assertNotEqual(proc.returncode, 0)
        payload = json.loads(proc.stdout)
        rules = {item["rule"] for item in payload["findings"]}
        expected = {
            "RAW_SET_PAGE",
            "PAUSE_INSIDE_CONTEXT",
            "SLIDE_WRAPPED_BODY_ANTIPATTERN",
        }
        self.assertTrue(expected.issubset(rules), msg=f"Missing rules: {expected - rules}")

    def test_audit_bad_bullet_monotony_and_strict_warnings(self) -> None:
        advisory = run_cli("audit", str(FIXTURES_DIR / "bad-bullet-monotony.typ"), "--json")
        self.assertEqual(advisory.returncode, 0, msg=advisory.stderr + advisory.stdout)
        advisory_payload = json.loads(advisory.stdout)
        self.assertEqual(advisory_payload["errors"], 0)
        self.assertGreaterEqual(advisory_payload["warnings"], 1)
        rules = {item["rule"] for item in advisory_payload["findings"]}
        self.assertIn("CONSECUTIVE_BULLET_SLIDES", rules)

        strict = run_cli(
            "audit",
            str(FIXTURES_DIR / "bad-bullet-monotony.typ"),
            "--strict-warnings",
            "--json",
        )
        self.assertNotEqual(strict.returncode, 0)

    def test_audit_missing_speaker_notes_warning(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "no-notes.typ"
            target.write_text(
                "\n".join(
                    [
                        '#import "@preview/touying:0.8.0": *',
                        "#import themes.simple: *",
                        '#show: simple-theme.with(aspect-ratio: "16-9")',
                        "== Slide 1",
                        "#rect[One]",
                        "== Slide 2",
                        "#table(columns: 2, [A], [B])",
                        "== Slide 3",
                        "$ x^2 + y^2 = z^2 $",
                    ]
                ),
                encoding="utf-8",
            )
            proc = run_cli("audit", str(target), "--json")
            self.assertEqual(proc.returncode, 0)
            payload = json.loads(proc.stdout)
            rules = {item["rule"] for item in payload["findings"]}
            self.assertIn("MISSING_SPEAKER_NOTES", rules)

    def test_audit_ignores_comments_and_allowed_forms(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "comments-and-allowed.typ"
            target.write_text(
                "\n".join(
                    [
                        '#import "@preview/touying:0.8.0": *',
                        "#import themes.simple: *",
                        "#show: simple-theme.with(",
                        '  aspect-ratio: "16-9",',
                        "  config-common(",
                        "    show-only-notes: true,",
                        "    show-bibliography-as-footnote: true,",
                        "  ),",
                        "  config-methods(",
                        "    cover: utils.alpha-changing-cover.with(",
                        "      alpha: 25%,",
                        "      fallback-hide: utils.semi-transparent-cover,",
                        "    ),",
                        "  ),",
                        ")",
                        "// touying-equation should be ignored inside line comments",
                        "/* semi-transparent-cover and magic.bibliography() inside block comment",
                        "   /* nested block comment: #set page(paper: \"a4\") */",
                        "*/",
                        "// Note: magic.bibliography-as-footnote is internal, not magic.bibliography()",
                        "== Slide One <intro>",
                        '#grid(columns: 2, [A], ["// not a comment"])',
                        "== Slide Two",
                        "#touying-recall(<intro>, subslides: none)",
                        "== Slide Three",
                        "#box[#text[Done]]",
                        "#speaker-note[Zero false positives.]",
                    ]
                ),
                encoding="utf-8",
            )
            proc = run_cli("audit", str(target), "--json")
            self.assertEqual(proc.returncode, 0, msg=proc.stderr + proc.stdout)
            payload = json.loads(proc.stdout)
            self.assertEqual(payload["errors"], 0, msg=payload["findings"])
            self.assertEqual(payload["warnings"], 0, msg=payload["findings"])

    def test_audit_empty_directory_fails_with_zero_files_scanned(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            proc = run_cli("audit", tmp, "--json")
            self.assertNotEqual(proc.returncode, 0)
            payload = json.loads(proc.stdout)
            self.assertEqual(payload["files_scanned"], 0)
            rules = {item["rule"] for item in payload["findings"]}
            self.assertIn("ZERO_FILES_SCANNED", rules)

    def test_compile_missing_typst_skips_with_missing_evidence(self) -> None:
        proc = run_cli(
            "compile",
            str(FIXTURES_DIR / "valid-0.8.typ"),
            "--typst-bin",
            "nonexistent-typst-xyz",
            "--json",
        )
        self.assertEqual(proc.returncode, 0, msg=proc.stderr + proc.stdout)
        payload = json.loads(proc.stdout)
        self.assertEqual(payload["status"], "skipped")
        self.assertIs(payload["missing_evidence"], True)
        self.assertNotEqual(payload["status"], "pass")

        required = run_cli(
            "compile",
            str(FIXTURES_DIR / "valid-0.8.typ"),
            "--typst-bin",
            "nonexistent-typst-xyz",
            "--require-typst",
            "--json",
        )
        self.assertNotEqual(required.returncode, 0)

    def test_doctor_reports_expected_fields(self) -> None:
        proc = run_cli("doctor", "--json")
        payload = json.loads(proc.stdout)
        for key in (
            "typst_found",
            "typst_version",
            "meets_min_version",
            "package_cache",
            "remediation",
        ):
            self.assertIn(key, payload)
        self.assertIsInstance(payload["remediation"], list)
        self.assertEqual(proc.returncode, 0 if payload["meets_min_version"] else 1)

        missing = run_cli("doctor", "--typst-bin", "nonexistent-typst-xyz", "--json")
        self.assertNotEqual(missing.returncode, 0)
        missing_payload = json.loads(missing.stdout)
        self.assertFalse(missing_payload["typst_found"])
        self.assertFalse(missing_payload["meets_min_version"])
        self.assertGreater(len(missing_payload["remediation"]), 0)

    def test_graded_examples_replace_legacy_and_pass_audit(self) -> None:
        for legacy in LEGACY_EXAMPLE_FILES:
            self.assertFalse(
                (EXAMPLES_DIR / legacy).exists(),
                msg=f"Legacy example still present: {legacy}",
            )
        for expected in EXPECTED_GRADED_EXAMPLES:
            target = EXAMPLES_DIR / expected
            self.assertTrue(target.is_file(), msg=f"Missing graded example: {expected}")
            content = target.read_text(encoding="utf-8")
            for forbidden in ("0.5.0", "0.6.1", "semi-transparent-cover", "touying-equation"):
                self.assertNotIn(
                    forbidden,
                    content,
                    msg=f"Forbidden legacy token '{forbidden}' in examples/{expected}",
                )

        proc = run_cli("audit", str(EXAMPLES_DIR), "--strict-warnings", "--json")
        self.assertEqual(proc.returncode, 0, msg=proc.stderr + proc.stdout)
        payload = json.loads(proc.stdout)
        self.assertEqual(payload["errors"], 0, msg=payload["findings"])
        self.assertEqual(payload["warnings"], 0, msg=payload["findings"])

    @unittest.skipUnless(typst_meets_min_version(), "typst >= 0.15.0 not installed")
    def test_real_compile_all_graded_examples(self) -> None:
        cases = (
            ("01-minimal.typ", []),
            ("02-multi-file/main.typ", []),
            ("03-animations-waypoints-math.typ", []),
            ("04-multi-mode-article.typ", ["--modes", "presentation,handout,article"]),
            ("05-theme-notes.typ", []),
            ("06-bundle-pdfpc.typ", ["--bundle"]),
        )
        for rel_path, extra_args in cases:
            target = EXAMPLES_DIR / rel_path
            proc = run_cli("compile", str(target), *extra_args, "--require-typst", "--json")
            self.assertEqual(proc.returncode, 0, msg=f"{rel_path}: {proc.stdout}\n{proc.stderr}")
            payload = json.loads(proc.stdout)
            self.assertEqual(payload["status"], "pass", msg=f"{rel_path}: {payload}")
            self.assertIs(payload["missing_evidence"], False)

    @unittest.skipUnless(typst_meets_min_version(), "typst >= 0.15.0 not installed")
    def test_real_compile_promotes_warnings_to_failure(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            warn_deck = Path(tmp) / "warn.typ"
            warn_deck.write_text(
                "\n".join(
                    [
                        '#import "@preview/touying:0.8.0": *',
                        "#import themes.simple: *",
                        "#show: simple-theme.with(config-methods(cover: utils.semi-transparent-cover))",
                        "== Slide",
                        "A #pause B",
                    ]
                ),
                encoding="utf-8",
            )
            proc = run_cli("compile", str(warn_deck), "--require-typst", "--json")
            self.assertNotEqual(proc.returncode, 0)
            payload = json.loads(proc.stdout)
            self.assertEqual(payload["status"], "fail")
            self.assertGreater(len(payload["runs"][0]["warnings_promoted"]), 0)

    def test_speaker_note_unclosed_bracket_in_string_or_raw_does_not_swallow_slides(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            deck = Path(tmp) / "speaker-raw-bracket.typ"
            slides_text = "\n".join(
                [
                    '#import "@preview/touying:0.8.0": *',
                    "#import themes.simple: *",
                    "#show: simple-theme.with()",
                    "== Note With Brackets",
                    '- Bullet one',
                    '#speaker-note[Check "[" in string and `[raw` here.]',
                    "== Bullet Slide 2",
                    "- Only bullets",
                    "== Bullet Slide 3",
                    "- Only bullets",
                    "== Bullet Slide 4",
                    "- Only bullets",
                    "== Bullet Slide 5",
                    "- Only bullets",
                ]
            )
            deck.write_text(slides_text, encoding="utf-8")
            proc = run_cli("audit", str(deck), "--json")
            self.assertEqual(proc.returncode, 0, msg=proc.stderr + proc.stdout)
            payload = json.loads(proc.stdout)
            rules = [f["rule"] for f in payload["findings"]]
            self.assertIn("CONSECUTIVE_BULLET_SLIDES", rules)


if __name__ == "__main__":
    unittest.main()
