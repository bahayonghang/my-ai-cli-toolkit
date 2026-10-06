#!/usr/bin/env python3
"""Pattern-name hits on a fixed short draft."""

from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "renhua_lint.py"
spec = importlib.util.spec_from_file_location("renhua_lint", SCRIPT)
if spec is None or spec.loader is None:
    raise RuntimeError(f"cannot load {SCRIPT}")
renhua_lint = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = renhua_lint
spec.loader.exec_module(renhua_lint)


class RenhuaLintTests(unittest.TestCase):
    def test_fixed_text_hits_named_patterns(self) -> None:
        text = "这不是结论而是壳。\n我会先写完。\n"
        names = {hit["pattern"] for hit in renhua_lint.scan_text(text)}
        self.assertIn("不是...而是", names)
        self.assertIn("我会先", names)


if __name__ == "__main__":
    unittest.main()
