#!/usr/bin/env python3
"""Schema checker failures use a temporary skill tree, not the real catalog."""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "check_skill_evals.py"


def write_skill(root: Path, name: str, evals: object | None) -> Path:
    skill = root / "skills" / "demo-cat" / name
    skill.mkdir(parents=True)
    (skill / "SKILL.md").write_text("---\nname: " + name + "\n---\n", encoding="utf-8")
    if evals is not None:
        eval_dir = skill / "evals"
        eval_dir.mkdir()
        (eval_dir / "evals.json").write_text(
            json.dumps(evals, ensure_ascii=False),
            encoding="utf-8",
        )
    return skill


class CheckSkillEvalsTests(unittest.TestCase):
    def run_checker(self, root: Path) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(SCRIPT), str(root / "skills")],
            capture_output=True,
            text=True,
            encoding="utf-8",
        )

    def test_missing_file_exits_nonzero(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            write_skill(root, "demo-skill", None)
            completed = self.run_checker(root)
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("skills/demo-cat/demo-skill/evals/evals.json", completed.stderr)
        self.assertIn("missing file", completed.stderr)

    def test_missing_field_exits_nonzero(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            write_skill(
                root,
                "demo-skill",
                {
                    "skill_name": "demo-skill",
                    "evals": [
                        {
                            "id": 1,
                            "prompt": "Do the thing.",
                            "expected_output": "A result.",
                            "files": [],
                        }
                    ],
                },
            )
            completed = self.run_checker(root)
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("skills/demo-cat/demo-skill/evals/evals.json", completed.stderr)
        self.assertIn("missing field assertions", completed.stderr)

    def test_valid_tree_exits_zero(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            write_skill(
                root,
                "demo-skill",
                {
                    "skill_name": "demo-skill",
                    "evals": [
                        {
                            "id": 1,
                            "prompt": "Do the thing.",
                            "expected_output": "A result.",
                            "files": [],
                            "assertions": ["Names the result."],
                        }
                    ],
                },
            )
            completed = self.run_checker(root)
        self.assertEqual(completed.returncode, 0, completed.stderr)

    def test_help_exits_zero(self) -> None:
        completed = subprocess.run(
            [sys.executable, str(SCRIPT), "--help"],
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)
        self.assertIn("evals", completed.stdout.lower())

    def test_invalid_json_exits_nonzero(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            skill = write_skill(root, "demo-skill", None)
            eval_dir = skill / "evals"
            eval_dir.mkdir()
            (eval_dir / "evals.json").write_text("{bad json", encoding="utf-8")
            completed = self.run_checker(root)
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("invalid JSON", completed.stderr)

    def test_mismatched_skill_name_exits_nonzero(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            write_skill(
                root,
                "demo-skill",
                {
                    "skill_name": "other-skill",
                    "evals": [
                        {
                            "id": 1,
                            "prompt": "Do the thing.",
                            "expected_output": "A result.",
                            "files": [],
                            "assertions": ["Names the result."],
                        }
                    ],
                },
            )
            completed = self.run_checker(root)
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("skill_name must equal demo-skill", completed.stderr)

    def test_empty_evals_array_exits_nonzero(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            write_skill(
                root,
                "demo-skill",
                {
                    "skill_name": "demo-skill",
                    "evals": [],
                },
            )
            completed = self.run_checker(root)
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("non-empty array", completed.stderr)

    def test_blank_assertion_exits_nonzero(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            write_skill(
                root,
                "demo-skill",
                {
                    "skill_name": "demo-skill",
                    "evals": [
                        {
                            "id": 1,
                            "prompt": "Do the thing.",
                            "expected_output": "A result.",
                            "files": [],
                            "assertions": ["   "],
                        }
                    ],
                },
            )
            completed = self.run_checker(root)
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("assertions must be a non-empty array of strings", completed.stderr)


if __name__ == "__main__":
    unittest.main()
