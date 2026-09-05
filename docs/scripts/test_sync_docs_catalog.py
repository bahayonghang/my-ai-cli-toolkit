#!/usr/bin/env python3
"""Unit checks for catalog write skipping (LF vs CRLF)."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

from sync_docs_catalog import normalize_content, should_rewrite


class ShouldRewriteTests(unittest.TestCase):
    def test_missing_file_needs_write(self) -> None:
        with TemporaryDirectory() as raw:
            missing = Path(raw) / "missing.md"
            self.assertTrue(should_rewrite(missing, "hello\n"))

    def test_identical_lf_bytes_skip_write(self) -> None:
        with TemporaryDirectory() as raw:
            path = Path(raw) / "page.md"
            path.write_bytes(normalize_content("hello").encode("utf-8"))
            self.assertFalse(should_rewrite(path, "hello\n"))

    def test_crlf_equivalent_text_needs_write(self) -> None:
        with TemporaryDirectory() as raw:
            path = Path(raw) / "page.md"
            path.write_bytes(b"hello\r\n")
            self.assertTrue(should_rewrite(path, "hello\n"))

    def test_different_content_needs_write(self) -> None:
        with TemporaryDirectory() as raw:
            path = Path(raw) / "page.md"
            path.write_bytes(b"old\n")
            self.assertTrue(should_rewrite(path, "new\n"))


if __name__ == "__main__":
    unittest.main(verbosity=1)
