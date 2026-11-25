"""The public task-aware cases ship the runnable inputs named by their stable IDs."""

import json
import unittest
from pathlib import Path


SKILL = Path(__file__).resolve().parents[1]
FIXTURES = Path("tests/fixtures/task-aware")


class EvalFixtureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        manifest = json.loads((SKILL / "evals/evals.json").read_text(encoding="utf-8"))
        cls.cases = {case["id"]: case for case in manifest["evals"]}
        if len(cls.cases) != len(manifest["evals"]):
            raise ValueError("Eval IDs must be unique")

    def assert_inputs(self, case_id, directory, names):
        self.assertIn(case_id, self.cases.keys())
        files = self.cases[case_id]["files"]
        expected = [(directory / name).as_posix() for name in names]
        self.assertCountEqual(files, expected)
        for relative in files:
            self.assertTrue((SKILL / relative).is_file(), relative)

    def test_first_screen_inputs(self):
        for case_id, page in ((38, "index.html"), (39, "workshop.html"),
                              (40, "workshop.html"), (41, "index.html")):
            with self.subTest(case_id=case_id):
                self.assert_inputs(case_id, FIXTURES / "first-screen",
                                   [page, "notebook.css", "DESIGN.md"])

    def test_proof_desk_editions(self):
        for case_id, edition in ((42, "project/edition.css"), (43, "project/edition.css"),
                                 (44, "control.css"), (45, "control.css")):
            with self.subTest(case_id=case_id):
                self.assert_inputs(case_id, FIXTURES / "colour",
                                   ["project/index.html", "project/DESIGN.md", edition])

    def test_directory_layouts(self):
        for case_id, page in ((46, "cards.html"), (47, "cards.html"),
                              (48, "comparison.html"), (49, "comparison.html")):
            with self.subTest(case_id=case_id):
                self.assert_inputs(case_id, FIXTURES / "density",
                                   [page, "directory.js", "directory.css", "DESIGN.md"])

    def test_style_comparison_reuses_the_published_art(self):
        reference = Path("assets/reference/scandinavian")
        self.assert_inputs(50, reference, ["index.html", "kelp.png", "oxide.png"])
        for case_id in (51, 52):
            with self.subTest(case_id=case_id):
                self.assert_inputs(case_id, reference, ["kelp.png", "oxide.png"])

    def test_generic_and_existing_design_controls(self):
        self.assert_inputs(53, Path("."), [])
        self.assert_inputs(54, FIXTURES / "first-screen", ["index.html", "notebook.css", "DESIGN.md"])
