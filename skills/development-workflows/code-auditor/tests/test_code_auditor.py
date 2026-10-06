#!/usr/bin/env python3
"""Behavior tests for the three code-auditor scripts. Does not audit this repo."""

from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path


SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"


def load_script(filename: str, module_name: str):
    path = SCRIPTS / filename
    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module


issue_aggregator = load_script("issue-aggregator.py", "issue_aggregator")
pr_analyzer = load_script("pr-analyzer.py", "pr_analyzer")
rule_tester = load_script("rule-tester.py", "rule_tester")


class CodeAuditorScriptTests(unittest.TestCase):
    def test_issue_aggregator_classifies_and_dedups(self) -> None:
        text = "This error in src/app.py:12 should be fixed because of a null crash bug in the parser"
        aggregator = issue_aggregator.IssueAggregator()
        aggregator.parse_from_text(text)
        aggregator.parse_from_text(text)
        summary = aggregator.get_summary()
        self.assertEqual(summary["total_issues"], 1)
        self.assertEqual(summary["severity_distribution"].get("critical"), 1)
        self.assertEqual(summary["category_distribution"].get("correctness"), 1)
        self.assertEqual(summary["top_issues"][0]["file_path"], "src/app.py")

    def test_pr_analyzer_counts_a_small_diff(self) -> None:
        info = pr_analyzer.analyze_file_path("src/auth/server.py")
        self.assertEqual(info["type"], "python")
        self.assertEqual(info["category"], "source")
        self.assertEqual(info["risk_level"], "high")

        diff = "\n".join(
            [
                "diff --git a/src/auth/server.py b/src/auth/server.py",
                "--- a/src/auth/server.py",
                "+++ b/src/auth/server.py",
                "@@ -1 +1,2 @@",
                "-old",
                "+new",
                "+newer",
            ]
        )
        stats = pr_analyzer.analyze_diff(diff)
        self.assertEqual(stats["files_changed"], 1)
        self.assertEqual(stats["additions"], 2)
        self.assertEqual(stats["deletions"], 1)
        self.assertEqual(stats["files"][0]["path"], "src/auth/server.py")

    def test_rule_tester_matches_bare_except_only(self) -> None:
        tester = rule_tester.RuleTester()
        tester.load_builtin_rules()
        hit = tester.test_rule_on_code("PY001", "try:\n    pass\nexcept:\n    pass\n")
        miss = tester.test_rule_on_code("PY001", "try:\n    pass\nexcept ValueError:\n    pass\n")
        self.assertTrue(hit["matched"])
        self.assertEqual(hit["rule_id"], "PY001")
        self.assertEqual(hit["match_details"], "except:")
        self.assertFalse(miss["matched"])
        self.assertIsNone(miss["match_details"])


if __name__ == "__main__":
    unittest.main()
