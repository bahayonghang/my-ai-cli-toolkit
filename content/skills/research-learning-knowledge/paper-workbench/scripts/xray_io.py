#!/usr/bin/env python3
"""Utilities for local paper extraction and save path resolution."""

from __future__ import annotations

import argparse
import pathlib
import re
import sys
from datetime import datetime
from typing import Any


TEXT_SUFFIXES = {".txt", ".md", ".org"}


def slugify_title(title: str) -> str:
    words = re.findall(r"[a-z0-9]+", title.lower())
    if not words:
        return "paper"
    return "-".join(words[:5])


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def make_chunk(
    *,
    anchor: str,
    text: str,
    page_number: int,
) -> dict[str, Any]:
    clean_text = text.strip()
    excerpt = normalize_text(clean_text)[:280]
    return {
        "anchor": anchor,
        "page_start": page_number,
        "page_end": page_number,
        "label": anchor,
        "excerpt": excerpt or None,
        "text": clean_text,
    }


def extract_pages(source: str) -> list[dict[str, Any]]:
    path = pathlib.Path(source).expanduser()
    if not path.exists():
        raise FileNotFoundError(f"Local source does not exist: {path}")

    suffix = path.suffix.lower()
    if suffix in TEXT_SUFFIXES:
        text = path.read_text(encoding="utf-8").strip()
        if not text:
            raise RuntimeError(f"No extractable text found in text file: {path}")
        return [make_chunk(anchor="p1", text=text, page_number=1)]
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
        pages = []
        for page_number, page in enumerate(doc, start=1):
            page_text = page.get_text("text").strip()
            if page_text:
                pages.append(make_chunk(anchor=f"p{page_number}", text=page_text, page_number=page_number))
    finally:
        doc.close()

    if not pages:
        raise RuntimeError(f"No extractable text found in PDF: {path}")
    return pages


def extract_text(source: str) -> str:
    pages = extract_pages(source)
    text = "\n\n".join(page["text"] for page in pages if page.get("text"))
    if not text.strip():
        raise RuntimeError(f"No extractable text found in file: {source}")
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
