#!/usr/bin/env python3
"""Inject analysis JSON into the HTML template."""

from __future__ import annotations

import argparse
import json
import sys
import tempfile
from pathlib import Path

from paths import html_safe_dumps, rejected_green_trash, require_absolute, validate_analysis

HERE = Path(__file__).resolve().parent
TEMPLATE = HERE.parent / "assets" / "report_template.html"


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build a static storage report")
    parser.add_argument("analysis", help="Absolute path to analysis JSON")
    parser.add_argument("--output", help="Absolute HTML output path")
    return parser.parse_args(argv)


def load_analysis(path: Path) -> dict:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except OSError as exc:
        raise ValueError(f"cannot read analysis: {exc}") from exc
    except json.JSONDecodeError as exc:
        raise ValueError(f"analysis is not JSON: {exc}") from exc
    if not isinstance(payload, dict):
        raise ValueError("analysis must be a JSON object")
    return payload


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        src = require_absolute(args.analysis, "analysis")
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2
    try:
        data = load_analysis(src)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2
    errors = validate_analysis(data)
    rejected = rejected_green_trash(data)
    if errors or rejected:
        for item in errors:
            print(item, file=sys.stderr)
        for path in rejected:
            print(f"green trash_paths rejected: {path}", file=sys.stderr)
        return 2
    if args.output:
        try:
            out = require_absolute(args.output, "--output")
        except ValueError as exc:
            print(str(exc), file=sys.stderr)
            return 2
    else:
        out = Path(tempfile.gettempdir()) / "storage-report.html"
    try:
        tpl = TEMPLATE.read_text(encoding="utf-8")
    except OSError as exc:
        print(f"cannot read template: {exc}", file=sys.stderr)
        return 1
    html = tpl.replace("__REPORT_DATA__", html_safe_dumps(data)).replace("__DELETE_CONFIG__", "null")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8", newline="\n")
    print(str(out))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SystemExit:
        raise
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        raise SystemExit(1)
