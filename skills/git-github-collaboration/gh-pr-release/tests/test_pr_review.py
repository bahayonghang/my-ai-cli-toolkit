#!/usr/bin/env python3
"""Unit tests for the gh-pr-release review helper."""

from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


SKILL_DIR = Path(__file__).parent.parent
SCRIPT = SKILL_DIR / "scripts" / "pr_review.py"

spec = importlib.util.spec_from_file_location("pr_review", SCRIPT)
assert spec is not None and spec.loader is not None
pr_review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pr_review)


PATCH = """@@ -10,3 +10,4 @@ function demo() {
 context
-old value
+new value
+extra value
 context end
@@ -30,2 +31,2 @@ function second() {
 keep
-old tail
+new tail
"""


def context(head_sha: str = "abc123") -> dict:
    return {
        "owner": "acme",
        "repo": "widget",
        "number": 42,
        "url": "https://github.com/acme/widget/pull/42",
        "title": "feat: update widget",
        "state": "OPEN",
        "head_sha": head_sha,
        "head_ref": "feature",
        "base_ref": "main",
        "is_draft": False,
    }


def pr_view(head_sha: str = "abc123") -> str:
    return json.dumps(
        {
            "number": 42,
            "url": "https://github.com/acme/widget/pull/42",
            "title": "feat: update widget",
            "state": "OPEN",
            "headRefOid": head_sha,
            "headRefName": "feature",
            "baseRefName": "main",
            "isDraft": False,
        }
    )


class RecordingRunner:
    def __init__(self, head_sha: str = "abc123", post_error: bool = False):
        self.head_sha = head_sha
        self.post_error = post_error
        self.calls: list[tuple[list[str], str | None]] = []

    def __call__(self, cmd: list[str], cwd: Path, stdin: str | None = None) -> str:
        _ = cwd
        self.calls.append((cmd, stdin))
        if cmd[:3] == ["gh", "pr", "view"]:
            return pr_view(self.head_sha)
        if "--method" in cmd and "POST" in cmd:
            if self.post_error:
                raise RuntimeError("transport failed")
            return json.dumps({"id": 99, "state": "COMMENTED"})
        raise AssertionError(f"Unexpected command: {cmd}")


class PatchValidationTests(unittest.TestCase):
    def test_parse_patch_tracks_left_and_right_coordinates_across_hunks(self):
        coordinates = pr_review.parse_patch(PATCH)
        self.assertIn(("LEFT", 11), coordinates)
        self.assertNotIn(("RIGHT", 14), coordinates)
        self.assertIn(("RIGHT", 11), coordinates)
        self.assertIn(("RIGHT", 12), coordinates)
        self.assertIn(("LEFT", 31), coordinates)
        self.assertIn(("RIGHT", 32), coordinates)

    def test_prepare_accepts_single_and_multiline_comments(self):
        draft = {
            "event": "request-changes",
            "body": "Blocking issues",
            "comments": [
                {"path": "src/app.py", "line": 11, "side": "RIGHT", "body": "issue: validate"},
                {
                    "path": "src/app.py",
                    "start_line": 11,
                    "line": 13,
                    "side": "RIGHT",
                    "body": "suggestion: simplify",
                },
            ],
        }
        prepared = pr_review.prepare_review_payload(
            draft,
            context(),
            [{"filename": "src/app.py", "patch": PATCH}],
        )
        self.assertEqual(prepared["payload"]["event"], "REQUEST_CHANGES")
        self.assertEqual(prepared["payload"]["commit_id"], "abc123")
        self.assertEqual(prepared["payload"]["comments"][1]["start_side"], "RIGHT")

    def test_prepare_fails_closed_when_patch_is_unavailable(self):
        draft = {
            "event": "COMMENT",
            "body": "Summary",
            "comments": [{"path": "large.bin", "line": 1, "side": "RIGHT", "body": "question: why?"}],
        }
        with self.assertRaisesRegex(RuntimeError, "patch data is unavailable"):
            pr_review.prepare_review_payload(draft, context(), [{"filename": "large.bin"}])

    def test_prepare_rejects_a_line_outside_the_diff(self):
        draft = {
            "event": "COMMENT",
            "body": "Summary",
            "comments": [{"path": "src/app.py", "line": 99, "side": "RIGHT", "body": "issue: wrong"}],
        }
        with self.assertRaisesRegex(RuntimeError, "not present on the RIGHT diff"):
            pr_review.prepare_review_payload(
                draft,
                context(),
                [{"filename": "src/app.py", "patch": PATCH}],
            )

    def test_prepared_file_is_utf8_with_lf_newlines(self):
        payload = {"schema_version": 1, "message": "评审\n第二行"}
        with tempfile.TemporaryDirectory() as temp_dir:
            target = Path(temp_dir) / "prepared.json"
            pr_review.write_json_file(str(target), payload)
            raw = target.read_bytes()
        self.assertIn("评审".encode("utf-8"), raw)
        self.assertNotIn(b"\r\n", raw)
        self.assertTrue(raw.endswith(b"\n"))


class SubmitTests(unittest.TestCase):
    def test_head_drift_blocks_post(self):
        runner = RecordingRunner(head_sha="new456")
        prepared = {
            "schema_version": 1,
            "target": {
                "owner": "acme",
                "repo": "widget",
                "number": 42,
                "url": "https://github.com/acme/widget/pull/42",
                "head_sha": "abc123",
            },
            "payload": {"commit_id": "abc123", "body": "Summary", "event": "COMMENT"},
        }
        with self.assertRaisesRegex(RuntimeError, "head changed"):
            pr_review.submit_prepared_review(prepared, Path("."), runner)
        self.assertFalse(any("POST" in cmd for cmd, _ in runner.calls))

    def test_valid_submit_posts_payload_once(self):
        runner = RecordingRunner()
        prepared = {
            "schema_version": 1,
            "target": {
                "owner": "acme",
                "repo": "widget",
                "number": 42,
                "url": "https://github.com/acme/widget/pull/42",
                "head_sha": "abc123",
            },
            "payload": {
                "commit_id": "abc123",
                "body": "Summary",
                "event": "COMMENT",
                "comments": [{"path": "src/app.py", "line": 11, "side": "RIGHT", "body": "nitpick: name"}],
            },
        }
        response = pr_review.submit_prepared_review(prepared, Path("."), runner)
        posts = [(cmd, stdin) for cmd, stdin in runner.calls if "POST" in cmd]
        self.assertEqual(response["id"], 99)
        self.assertEqual(len(posts), 1)
        self.assertEqual(json.loads(posts[0][1]), prepared["payload"])

    def test_uncertain_post_is_not_retried(self):
        runner = RecordingRunner(post_error=True)
        prepared = {
            "schema_version": 1,
            "target": {
                "owner": "acme",
                "repo": "widget",
                "number": 42,
                "url": "https://github.com/acme/widget/pull/42",
                "head_sha": "abc123",
            },
            "payload": {"commit_id": "abc123", "body": "Summary", "event": "COMMENT"},
        }
        with self.assertRaisesRegex(RuntimeError, "transport failed"):
            pr_review.submit_prepared_review(prepared, Path("."), runner)
        self.assertEqual(sum("POST" in cmd for cmd, _ in runner.calls), 1)

    def test_tampered_prepared_comment_is_rejected_before_post(self):
        runner = RecordingRunner()
        prepared = {
            "schema_version": 1,
            "target": {
                "owner": "acme",
                "repo": "widget",
                "number": 42,
                "url": "https://github.com/acme/widget/pull/42",
                "head_sha": "abc123",
            },
            "payload": {
                "commit_id": "abc123",
                "body": "Summary",
                "event": "COMMENT",
                "comments": [
                    {
                        "path": "src/app.py",
                        "position": 5,
                        "line": 11,
                        "side": "RIGHT",
                        "body": "issue: stale coordinate",
                    }
                ],
            },
        }
        with self.assertRaisesRegex(RuntimeError, "unsupported fields: position"):
            pr_review.submit_prepared_review(prepared, Path("."), runner)
        self.assertEqual(runner.calls, [])


class ThreadTests(unittest.TestCase):
    def test_root_and_last_comment_ids_are_distinct(self):
        thread = {
            "id": "PRRT_1",
            "comments": [
                {"databaseId": 101, "body": "root"},
                {"databaseId": 202, "body": "reply"},
            ],
        }
        self.assertEqual(pr_review.thread_comment_id(thread, last=False), 101)
        self.assertEqual(pr_review.thread_comment_id(thread, last=True), 202)

    def test_reply_posts_once_to_the_root_comment(self):
        calls: list[tuple[list[str], str | None]] = []

        def runner(cmd: list[str], cwd: Path, stdin: str | None = None) -> str:
            _ = cwd
            calls.append((cmd, stdin))
            return json.dumps({"id": 303, "body": "Fixed in abc123"})

        thread = {
            "id": "PRRT_1",
            "comments": [
                {"databaseId": 101, "body": "root"},
                {"databaseId": 202, "body": "reply"},
            ],
        }
        response = pr_review.post_thread_reply(
            context(),
            thread,
            "Fixed in abc123",
            Path("."),
            runner,
        )

        self.assertEqual(response["id"], 303)
        self.assertEqual(len(calls), 1)
        command, stdin = calls[0]
        self.assertIn("repos/acme/widget/pulls/42/comments/101/replies", command)
        self.assertNotIn("repos/acme/widget/pulls/42/comments/202/replies", command)
        self.assertEqual(json.loads(stdin), {"body": "Fixed in abc123"})

    def test_thread_and_comment_connections_paginate(self):
        calls: list[str] = []

        def runner(cmd: list[str], cwd: Path, stdin: str | None = None) -> str:
            _ = cwd
            calls.append(stdin or "")
            joined = " ".join(cmd)
            if "threadId=PRRT_1" in joined:
                return json.dumps(
                    {
                        "data": {
                            "node": {
                                "comments": {
                                    "pageInfo": {"hasNextPage": False, "endCursor": None},
                                    "nodes": [{"databaseId": 102, "body": "second"}],
                                }
                            }
                        }
                    }
                )
            if "cursor=THREAD_PAGE_2" in joined:
                return json.dumps(
                    {
                        "data": {
                            "repository": {
                                "pullRequest": {
                                    "reviewThreads": {
                                        "pageInfo": {"hasNextPage": False, "endCursor": None},
                                        "nodes": [
                                            {
                                                "id": "PRRT_2",
                                                "isResolved": False,
                                                "comments": {
                                                    "pageInfo": {"hasNextPage": False, "endCursor": None},
                                                    "nodes": [{"databaseId": 201, "body": "other"}],
                                                },
                                            }
                                        ],
                                    }
                                }
                            }
                        }
                    }
                )
            return json.dumps(
                {
                    "data": {
                        "repository": {
                            "pullRequest": {
                                "reviewThreads": {
                                    "pageInfo": {"hasNextPage": True, "endCursor": "THREAD_PAGE_2"},
                                    "nodes": [
                                        {
                                            "id": "PRRT_1",
                                            "isResolved": False,
                                            "comments": {
                                                "pageInfo": {"hasNextPage": True, "endCursor": "COMMENT_PAGE_2"},
                                                "nodes": [{"databaseId": 101, "body": "root"}],
                                            },
                                        }
                                    ],
                                }
                            }
                        }
                    }
                }
            )

        threads = pr_review.fetch_threads(context(), Path("."), runner)
        self.assertEqual([thread["id"] for thread in threads], ["PRRT_1", "PRRT_2"])
        self.assertEqual([item["databaseId"] for item in threads[0]["comments"]], [101, 102])
        self.assertEqual(len(calls), 3)


if __name__ == "__main__":
    unittest.main()
