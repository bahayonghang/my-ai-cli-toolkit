# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "pymupdf>=1.24.0",
# ]
# ///
"""
PDF text extraction for ZoteroSynth.

Usage:
    uv run scripts/pdf_extract.py PATH [--max-pages N] [--format text|json]
"""

import json
import sys
from argparse import ArgumentParser
from pathlib import Path

import fitz  # pymupdf


def extract(pdf_path: str, max_pages: int = 0, fmt: str = "text") -> dict:
    """Extract text from PDF file."""
    p = Path(pdf_path)
    if not p.exists():
        return {"status": "error", "message": f"File not found: {pdf_path}"}

    try:
        doc = fitz.open(str(p))
    except Exception as e:
        return {"status": "error", "message": f"Cannot open PDF: {e}"}

    pages = []
    total = doc.page_count
    limit = max_pages if max_pages > 0 else total

    for i in range(min(limit, total)):
        page = doc[i]
        pages.append({"page": i + 1, "text": page.get_text("text")})
    doc.close()

    if fmt == "text":
        return {
            "status": "ok",
            "text": "\n\n".join(p["text"] for p in pages),
            "pages_extracted": len(pages),
            "pages_total": total,
        }
    return {
        "status": "ok",
        "pages": pages,
        "pages_extracted": len(pages),
        "pages_total": total,
    }


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    parser = ArgumentParser(description="Extract text from PDF")
    parser.add_argument("path", help="Path to PDF file")
    parser.add_argument("--max-pages", type=int, default=0, help="Max pages to extract (0=all)")
    parser.add_argument("--format", dest="fmt", choices=["text", "json"], default="text")
    args = parser.parse_args()

    result = extract(args.path, args.max_pages, args.fmt)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(0 if result["status"] == "ok" else 1)


if __name__ == "__main__":
    main()
