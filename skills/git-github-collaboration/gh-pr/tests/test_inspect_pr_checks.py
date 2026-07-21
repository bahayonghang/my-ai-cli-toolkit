#!/usr/bin/env python3
"""Unit tests for the gh-pr check inspector."""

from __future__ import annotations

import argparse
import importlib.util
import io
import json
from types import SimpleNamespace
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch


SKILL_DIR = Path(__file__).parent.parent
SCRIPT = SKILL_DIR / "scripts" / "inspect_pr_checks.py"

spec = importlib.util.spec_from_file_location("inspect_pr_checks", SCRIPT)
assert spec is not None and spec.loader is not None
inspect_pr_checks = importlib.util.module_from_spec(spec)
spec.loader.exec_module(inspect_pr_checks)


def check(
    *,
    name: str,
    state: str,
    bucket: str,
    link: str,
    workflow: str = "",
) -> dict[str, str]:
    return {
        "name": name,
        "state": state,
        "bucket": bucket,
        "link": link,
        "workflow": workflow,
    }


class StatusClassificationTests(unittest.TestCase):
    def test_all_green(self):
        checks = [
            check(name="tests", state="SUCCESS", bucket="pass", link="https://example")
        ]
        self.assertEqual(inspect_pr_checks.classify_check_status(checks), "all_green")

    def test_pending_precedes_external_only(self):
        checks = [
            check(name="queued", state="PENDING", bucket="pending", link=""),
            check(
                name="buildkite",
                state="FAILURE",
                bucket="fail",
                link="https://buildkite.com/acme/builds/1",
            ),
        ]
        self.assertEqual(inspect_pr_checks.classify_check_status(checks), "pending")

    def test_external_only(self):
        checks = [
            check(
                name="buildkite",
                state="FAILURE",
                bucket="fail",
                link="https://buildkite.com/acme/builds/1",
            )
        ]
        self.assertEqual(
            inspect_pr_checks.classify_check_status(checks), "external_only"
        )

    def test_github_actions_failure(self):
        checks = [
            check(
                name="tests",
                state="FAILURE",
                bucket="fail",
                link="https://github.com/acme/widget/actions/runs/123/job/456",
                workflow="CI",
            )
        ]
        self.assertEqual(inspect_pr_checks.classify_check_status(checks), "failures")


class MainContractTests(unittest.TestCase):
    def test_successful_failure_analysis_returns_zero_and_explicit_status(self):
        checks = [
            check(
                name="tests",
                state="FAILURE",
                bucket="fail",
                link="https://github.com/acme/widget/actions/runs/123/job/456",
                workflow="CI",
            )
        ]
        args = argparse.Namespace(
            repo=".", pr="42", max_lines=50, context=10, json=True
        )
        analyzed = {"name": "tests", "status": "ok", "logSnippet": "failed"}

        output = io.StringIO()
        with (
            patch.object(inspect_pr_checks, "parse_args", return_value=args),
            patch.object(inspect_pr_checks, "find_git_root", return_value=Path(".")),
            patch.object(inspect_pr_checks, "ensure_gh_available", return_value=True),
            patch.object(inspect_pr_checks, "resolve_pr", return_value="42"),
            patch.object(inspect_pr_checks, "fetch_checks", return_value=checks),
            patch.object(inspect_pr_checks, "analyze_check", return_value=analyzed),
            redirect_stdout(output),
        ):
            return_code = inspect_pr_checks.main()

        payload = json.loads(output.getvalue())
        self.assertEqual(return_code, 0)
        self.assertEqual(payload["status"], "failures")
        self.assertEqual(payload["summary"]["failing"], 1)
        self.assertEqual(payload["results"], [analyzed])


class SubprocessEncodingTests(unittest.TestCase):
    def test_gh_text_output_is_decoded_as_utf8(self):
        completed = SimpleNamespace(returncode=0, stdout="失败日志", stderr="")
        with patch.object(
            inspect_pr_checks.subprocess, "run", return_value=completed
        ) as run:
            result = inspect_pr_checks.run_gh_command(["run", "view"], Path("."))

        self.assertEqual(result.stdout, "失败日志")
        self.assertEqual(run.call_args.kwargs["encoding"], "utf-8")
        self.assertEqual(run.call_args.kwargs["errors"], "replace")


if __name__ == "__main__":
    unittest.main()
