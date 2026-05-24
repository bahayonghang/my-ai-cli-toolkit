#!/usr/bin/env python3
"""Validate single-file offline HTML artifacts."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

MAX_WARN_BYTES = 1_500_000

XMLNS_ATTR = re.compile(
    r"""\bxmlns(?::[\w-]+)?\s*=\s*(['"])[^'"]*\1""",
    re.IGNORECASE,
)

STRUCTURE_CHECKS: tuple[tuple[re.Pattern[str], str], ...] = (
    (re.compile(r"<!doctype\s+html|<html\b", re.IGNORECASE), "missing <!doctype html> or <html>"),
    (re.compile(r"<head\b", re.IGNORECASE), "missing <head>"),
    (re.compile(r"<body\b", re.IGNORECASE), "missing <body>"),
    (re.compile(r"</html\s*>", re.IGNORECASE), "missing closing </html>"),
    (re.compile(r"<meta\s+[^>]*charset\s*=", re.IGNORECASE), "missing <meta charset=...>"),
    (re.compile(r"""<meta\s+[^>]*\bname\s*=\s*["']?viewport""", re.IGNORECASE), "missing viewport meta"),
    (re.compile(r"<title\b[^>]*>.*?</title\s*>", re.IGNORECASE | re.DOTALL), "missing <title>"),
    (re.compile(r"<main\b", re.IGNORECASE), "missing <main>"),
    (re.compile(r"""<main\b[^>]*\bid\s*=\s*["']?main\b""", re.IGNORECASE), 'missing id="main" on <main>'),
    (re.compile(r"<h1\b", re.IGNORECASE), "missing <h1>"),
)

OFFLINE_CHECKS: tuple[tuple[re.Pattern[str], str], ...] = (
    (re.compile(r"https?://", re.IGNORECASE), "contains http:// or https:// URL"),
    (re.compile(r"//\s*cdn|//cdn", re.IGNORECASE), "contains protocol-relative CDN URL"),
    (re.compile(r"<script\b[^>]*\bsrc\s*=", re.IGNORECASE), "contains <script src=...>"),
    (re.compile(r"<link\b[^>]*\brel\s*=\s*['\"]?(stylesheet|preload|prefetch|dns-prefetch|preconnect|modulepreload)\b", re.IGNORECASE), "contains remote <link rel='...'>"),
    (re.compile(r"@import\b", re.IGNORECASE), "contains CSS @import"),
    (re.compile(r"\bfetch\s*\(", re.IGNORECASE), "contains fetch(...)"),
    (re.compile(r"\bXMLHttpRequest\b", re.IGNORECASE), "contains XMLHttpRequest"),
    (re.compile(r"\bsendBeacon\s*\(|\bnavigator\.sendBeacon\b", re.IGNORECASE), "contains sendBeacon"),
    (re.compile(r"\bnew\s+WebSocket\b", re.IGNORECASE), "contains WebSocket"),
)

WARNING_CHECKS: tuple[tuple[re.Pattern[str], str], ...] = (
    (re.compile(r"skip-link|skip\s+to\s+main", re.IGNORECASE), "no skip link found"),
    (re.compile(r"prefers-reduced-motion", re.IGNORECASE), "no prefers-reduced-motion rule found"),
    (re.compile(r"aria-|<caption\b", re.IGNORECASE), "no aria-* attribute or table caption found"),
)


def read_html(path: Path) -> tuple[str | None, str | None]:
    try:
        return path.read_text(encoding="utf-8"), None
    except UnicodeDecodeError as exc:
        return None, f"file is not valid UTF-8: {exc}"
    except OSError as exc:
        return None, f"cannot read file: {exc}"


def validate(path: Path, allow_external: bool = False) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []

    if path.suffix.lower() not in {".html", ".htm"}:
        errors.append("file extension must be .html or .htm")

    html, read_error = read_html(path)
    if read_error:
        errors.append(read_error)
        return {"ok": False, "errors": errors, "warnings": warnings}
    assert html is not None

    for pattern, message in STRUCTURE_CHECKS:
        if not pattern.search(html):
            errors.append(message)

    if not allow_external:
        scrubbed = XMLNS_ATTR.sub("", html)
        for pattern, message in OFFLINE_CHECKS:
            if pattern.search(scrubbed):
                errors.append(message)

    for pattern, message in WARNING_CHECKS:
        if not pattern.search(html):
            warnings.append(message)

    try:
        size = path.stat().st_size
    except OSError:
        size = len(html.encode("utf-8", errors="replace"))
    if size > MAX_WARN_BYTES:
        warnings.append(f"file is large ({size} bytes > {MAX_WARN_BYTES} bytes)")

    return {"ok": not errors, "errors": errors, "warnings": warnings}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Validate a self-contained HTML artifact.")
    parser.add_argument("path", type=Path, help="HTML artifact path")
    parser.add_argument("--json", action="store_true", help="emit JSON result")
    parser.add_argument("--allow-external", action="store_true", help="allow external URLs/network APIs while keeping structure checks")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    result = validate(args.path, allow_external=args.allow_external)

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        status = "ok" if result["ok"] else "failed"
        print(f"HTML artifact validation: {status}")
        errors = result["errors"]
        warnings = result["warnings"]
        if errors:
            print("\nErrors:")
            for error in errors:
                print(f"- {error}")
        if warnings:
            print("\nWarnings:")
            for warning in warnings:
                print(f"- {warning}")
        if not errors and not warnings:
            print("No errors or warnings.")

    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
