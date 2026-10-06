#!/usr/bin/env python3
"""parse_page_count and a missing command. Does not call pdfinfo."""

from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "verify_pdf.py"
spec = importlib.util.spec_from_file_location("verify_pdf", SCRIPT)
if spec is None or spec.loader is None:
    raise RuntimeError(f"cannot load {SCRIPT}")
verify_pdf = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = verify_pdf
spec.loader.exec_module(verify_pdf)


class VerifyPdfTests(unittest.TestCase):
    def test_parse_page_count(self) -> None:
        self.assertEqual(verify_pdf.parse_page_count("Title: demo\nPages: 2\n"), 2)
        with self.assertRaises(verify_pdf.VerificationError):
            verify_pdf.parse_page_count("Title: demo\nPages: none\n")

    def test_missing_command_raises_verification_error(self) -> None:
        with self.assertRaises(verify_pdf.VerificationError) as caught:
            verify_pdf.run_tool(["pdfinfo-not-on-path-for-test"])
        message = str(caught.exception)
        self.assertIn("pdfinfo-not-on-path-for-test", message)
        self.assertIn("not found", message)


if __name__ == "__main__":
    unittest.main()
