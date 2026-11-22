#!/usr/bin/env python3
"""Unit tests for scripts/run_python_tests.py."""

from __future__ import annotations

import io
import subprocess
import sys
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

SCRIPTS_DIR = Path(__file__).resolve().parents[1]
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

import run_python_tests  # noqa: E402


def write_test_file(directory: Path, filename: str = "test_sample.py") -> None:
    directory.mkdir(parents=True, exist_ok=True)
    (directory / filename).write_text(
        "import unittest\n\nclass Sample(unittest.TestCase):\n    def test_ok(self):\n        self.assertTrue(True)\n",
        encoding="utf-8",
    )


class RunPythonTestsDiscoveryTests(unittest.TestCase):
    def test_discovers_hooks_sorted_skills_and_scripts_tests(self) -> None:
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            hooks_tests = root / "platforms" / "claude" / "hooks" / "tests"
            skill_b = root / "skills" / "cat-b" / "skill-b" / "tests"
            skill_a = root / "skills" / "cat-a" / "skill-a" / "tests"
            scripts_tests = root / "scripts" / "tests"
            for directory in (hooks_tests, skill_b, skill_a, scripts_tests):
                write_test_file(directory)

            # Should be ignored: no test_*.py, hidden dir, and SKIP_PARTS
            empty_tests = root / "skills" / "cat-a" / "empty" / "tests"
            empty_tests.mkdir(parents=True)
            (empty_tests / "helper.py").write_text("x = 1\n", encoding="utf-8")
            write_test_file(root / "skills" / ".hidden" / "demo" / "tests")
            write_test_file(root / "skills" / "cat-a" / "scaffolds" / "demo" / "tests")
            write_test_file(root / "skills" / "cat-a" / "node_modules" / "demo" / "tests")

            found = [
                path.relative_to(root).as_posix()
                for path in run_python_tests.python_test_dirs(root)
            ]

        self.assertEqual(
            found,
            [
                "platforms/claude/hooks/tests",
                "skills/cat-a/skill-a/tests",
                "skills/cat-b/skill-b/tests",
                "scripts/tests",
            ],
        )

    def test_help_and_dynamic_flag_accepted(self) -> None:
        script = SCRIPTS_DIR / "run_python_tests.py"
        completed = subprocess.run(
            [sys.executable, str(script), "--help"],
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)
        self.assertIn("--dynamic-unittest-discover", completed.stdout)

    def test_main_returns_nonzero_when_no_test_dirs_found(self) -> None:
        with TemporaryDirectory() as tmp:
            empty_root = Path(tmp)
            err = io.StringIO()
            with (
                patch.object(run_python_tests, "REPO_ROOT", empty_root),
                redirect_stdout(io.StringIO()),
                redirect_stderr(err),
            ):
                code = run_python_tests.main([])
        self.assertEqual(code, 1)
        self.assertIn("no unittest directories", err.getvalue())

    def test_main_fails_fast_on_first_nonzero_suite(self) -> None:
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            write_test_file(root / "platforms" / "claude" / "hooks" / "tests")
            write_test_file(root / "scripts" / "tests")

            err = io.StringIO()
            with (
                patch.object(run_python_tests, "REPO_ROOT", root),
                patch.object(
                    run_python_tests.subprocess,
                    "run",
                    return_value=subprocess.CompletedProcess([], 2),
                ) as mock_run,
                redirect_stdout(io.StringIO()),
                redirect_stderr(err),
            ):
                code = run_python_tests.main(["--dynamic-unittest-discover"])
        self.assertEqual(code, 2)
        self.assertEqual(mock_run.call_count, 1)
        self.assertIn("unittest discover -s platforms/claude/hooks/tests", err.getvalue())


if __name__ == "__main__":
    unittest.main()
