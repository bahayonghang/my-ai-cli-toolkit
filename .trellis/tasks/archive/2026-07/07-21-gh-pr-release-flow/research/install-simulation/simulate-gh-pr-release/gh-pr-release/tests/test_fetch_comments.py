#!/usr/bin/env python3
"""Unit tests for the gh-pr-release review-comment collector."""

from __future__ import annotations

import importlib.util
from types import SimpleNamespace
import unittest
from pathlib import Path
from unittest.mock import patch


SKILL_DIR = Path(__file__).parent.parent
SCRIPT = SKILL_DIR / "scripts" / "fetch_comments.py"

spec = importlib.util.spec_from_file_location("fetch_comments", SCRIPT)
assert spec is not None and spec.loader is not None
fetch_comments = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fetch_comments)


class ResolvePrRefTests(unittest.TestCase):
    def test_fork_pr_uses_base_repository_from_pr_url(self):
        payload = {
            "number": 42,
            "title": "Fix fork behavior",
            "url": "https://github.com/base-owner/base-repo/pull/42",
            "state": "OPEN",
            "headRepositoryOwner": {"login": "fork-owner"},
            "headRepository": {"name": "fork-repo"},
        }

        with patch.object(fetch_comments, "gh_pr_view_json", return_value=payload) as view:
            owner, repo, number, resolved = fetch_comments.resolve_pr_ref(
                Path("."), "42"
            )

        self.assertEqual((owner, repo, number), ("base-owner", "base-repo", 42))
        self.assertIs(resolved, payload)
        self.assertEqual(view.call_args.args[0], "number,title,url,state")

    def test_enterprise_pr_url_is_parsed_without_host_assumptions(self):
        payload = {
            "number": 7,
            "title": "Enterprise PR",
            "url": "https://github.example.com/acme/widget/pull/7",
            "state": "OPEN",
        }
        with patch.object(fetch_comments, "gh_pr_view_json", return_value=payload):
            owner, repo, number, _ = fetch_comments.resolve_pr_ref(Path("."), None)
        self.assertEqual((owner, repo, number), ("acme", "widget", 7))

    def test_invalid_pr_url_fails_closed(self):
        payload = {
            "number": 42,
            "title": "Bad URL",
            "url": "https://github.com/base-owner/base-repo/issues/42",
            "state": "OPEN",
        }
        with patch.object(fetch_comments, "gh_pr_view_json", return_value=payload):
            with self.assertRaisesRegex(RuntimeError, "Unable to resolve"):
                fetch_comments.resolve_pr_ref(Path("."), "42")


class SubprocessEncodingTests(unittest.TestCase):
    def test_gh_text_output_is_decoded_as_utf8(self):
        completed = SimpleNamespace(returncode=0, stdout="评审", stderr="")
        with patch.object(
            fetch_comments.subprocess, "run", return_value=completed
        ) as run:
            output = fetch_comments._run(["gh", "auth", "status"], Path("."))

        self.assertEqual(output, "评审")
        self.assertEqual(run.call_args.kwargs["encoding"], "utf-8")
        self.assertEqual(run.call_args.kwargs["errors"], "replace")


if __name__ == "__main__":
    unittest.main()
