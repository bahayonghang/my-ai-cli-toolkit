#!/usr/bin/env python3
"""Utilities for local paper extraction and save path resolution."""

from __future__ import annotations

import argparse
import pathlib
import re
import sys
from datetime import datetime


TEXT_SUFFIXES = {".txt", ".md", ".org"}


def slugify_title(title: str) -> str:
    words = re.findall(r"[a-z0-9]+", title.lower())
    if not words:
        return "paper"
    return "-".join(words[:5])


def extract_text(source: str) -> str:
    path = pathlib.Path(source).expanduser()
    if not path.exists():
        raise FileNotFoundError(f"Local source does not exist: {path}")

    suffix = path.suffix.lower()
    if suffix in TEXT_SUFFIXES:
        return path.read_text(encoding="utf-8")
    if suffix != ".pdf":
        raise ValueError(
            f"Unsupported local file type: {suffix or '<no suffix>'}. "
            "Supported: .pdf, .txt, .md, .org"
        )

    try:
        import pymupdf  # type: ignore
    except ImportError:
        try:
            import fitz as pymupdf  # type: ignore
        except ImportError as err:
            raise RuntimeError(
                "PyMuPDF is required for local PDF extraction. "
                "Install `pymupdf` or provide pasted text / a local text file."
            ) from err

    doc = pymupdf.open(path)
    try:
        pages = [page.get_text("text").strip() for page in doc]
    finally:
        doc.close()

    text = "\n\n".join(page for page in pages if page)
    if not text.strip():
        raise RuntimeError(f"No extractable text found in PDF: {path}")
    return text


def resolve_save_path(save_path: str, title: str) -> pathlib.Path:
    target = pathlib.Path(save_path).expanduser()
    timestamp = datetime.now().strftime("%Y%m%dT%H%M%S")
    default_name = f"{timestamp}--xray-{slugify_title(title)}__read.org"

    if target.exists() and target.is_dir():
        return target / default_name

    if target.suffix:
        return target

    return target / default_name


def main() -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)

    extract_parser = subparsers.add_parser("extract")
    extract_parser.add_argument("--source", required=True)

    save_parser = subparsers.add_parser("resolve-save")
    save_parser.add_argument("--save-path", required=True)
    save_parser.add_argument("--title", required=True)

    args = parser.parse_args()

    try:
        if args.command == "extract":
            sys.stdout.write(extract_text(args.source))
            return 0

        if args.command == "resolve-save":
            resolved = resolve_save_path(args.save_path, args.title)
            resolved.parent.mkdir(parents=True, exist_ok=True)
            sys.stdout.write(str(resolved))
            return 0
    except Exception as exc:  # pragma: no cover - CLI error path
        print(str(exc), file=sys.stderr)
        return 1

    print(f"Unknown command: {args.command}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
