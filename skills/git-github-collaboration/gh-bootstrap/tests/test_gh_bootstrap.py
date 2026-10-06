#!/usr/bin/env python3
"""detect and render-template on a temporary directory. Does not clone."""

from __future__ import annotations

import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "gh_bootstrap_runtime.py"
spec = importlib.util.spec_from_file_location("gh_bootstrap_runtime", SCRIPT)
if spec is None or spec.loader is None:
    raise RuntimeError(f"cannot load {SCRIPT}")
gh_bootstrap = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = gh_bootstrap
spec.loader.exec_module(gh_bootstrap)


class GhBootstrapTests(unittest.TestCase):
    def test_detect_python_project_and_github_file(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "pyproject.toml").write_text("[project]\nname = 'demo'\n", encoding="utf-8")
            workflow = root / ".github" / "workflows"
            workflow.mkdir(parents=True)
            (workflow / "ci.yml").write_text("name: ci\n", encoding="utf-8")
            report = gh_bootstrap.detect_project(root)

        self.assertIn("python", report["languages"])
        self.assertIn("pyproject.toml", report["manifests"])
        self.assertTrue(any(Path(item).name == "ci.yml" for item in report["githubFiles"]))

    def test_render_template_replaces_named_placeholders(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            template = root / "workflow.yml"
            template.write_text("name: {{ name }}\nkeep: {{ keep }}\n", encoding="utf-8")
            output = root / "out" / "workflow.yml"
            gh_bootstrap.render_template(template, output, {"name": "demo"})
            rendered = output.read_text(encoding="utf-8")

        self.assertEqual(rendered, "name: demo\nkeep: {{ keep }}\n")


if __name__ == "__main__":
    unittest.main()
