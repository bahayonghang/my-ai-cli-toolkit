#!/usr/bin/env python3
"""Shared constants and helpers for repository scripts under scripts/."""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]

CANONICAL_CATEGORY_SLUGS = frozenset(
    {
        "academic-research-tools",
        "development-workflows",
        "developer-tools-integrations",
        "git-github-collaboration",
        "docs-writing-publishing",
        "research-learning-knowledge",
    }
)

SKIP_PARTS = frozenset(
    {
        ".git",
        "node_modules",
        "__pycache__",
        "ref",
        ".agents",
        ".claude",
        ".trellis",
        "scaffolds",
    }
)

FRONTMATTER_RE = re.compile(r"^---[ \t]*\n(.*?)\n---[ \t]*(?:\n|$)", re.DOTALL)


def configure_stdio() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", newline="\n")


def is_junction(path: Path) -> bool:
    os_isjunction = getattr(os.path, "isjunction", None)
    if callable(os_isjunction):
        return bool(os_isjunction(path))
    path_is_junction = getattr(path, "is_junction", None)
    return bool(callable(path_is_junction) and path_is_junction())


def skip_dir(path: Path) -> bool:
    name = path.name
    if name.startswith(".") or name in SKIP_PARTS:
        return True
    if path.is_symlink() or is_junction(path):
        return True
    return False


def display_path(path: Path, base: Path | None = None) -> str:
    anchor = (REPO_ROOT if base is None else base).resolve()
    try:
        return path.resolve().relative_to(anchor).as_posix()
    except ValueError:
        return path.as_posix()


def extract_frontmatter_raw(content: str) -> tuple[str | None, str | None]:
    normalized = content.replace("\r\n", "\n").replace("\r", "\n")
    if not normalized.startswith("---"):
        return None, "Missing YAML frontmatter"
    match = FRONTMATTER_RE.match(normalized)
    if not match:
        return None, "Invalid frontmatter delimiters"
    return match.group(1), None


def parse_frontmatter(path: Path) -> dict[str, Any]:
    import yaml

    text = path.read_text(encoding="utf-8-sig")
    raw, error = extract_frontmatter_raw(text)
    if error is not None or raw is None:
        return {}
    data = yaml.safe_load(raw)
    return data if isinstance(data, dict) else {}
