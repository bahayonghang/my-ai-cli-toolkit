#!/usr/bin/env python3
"""Discover and run stdlib unittest suites. Fail on the first non-zero discover."""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

_SCRIPTS_DIR = str(Path(__file__).resolve().parent)
if _SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, _SCRIPTS_DIR)

from _common import REPO_ROOT, SKIP_PARTS, configure_stdio, skip_dir  # noqa: E402


def has_test_module(directory: Path) -> bool:
    return any(path.is_file() for path in directory.glob("test_*.py"))


def python_test_dirs(root: Path) -> list[Path]:
    found: list[Path] = []

    def add(directory: Path) -> None:
        if directory in found or not directory.is_dir() or skip_dir(directory):
            return
        relative_parts = directory.relative_to(root).parts
        if any(part in SKIP_PARTS or part.startswith(".") for part in relative_parts):
            return
        if not has_test_module(directory):
            return
        found.append(directory)

    add(root / "platforms" / "claude" / "hooks" / "tests")

    skills = root / "skills"
    skill_dirs: list[Path] = []
    if skills.is_dir() and not skip_dir(skills):
        for dirpath, dirnames, filenames in os.walk(skills, followlinks=False):
            current = Path(dirpath)
            dirnames[:] = [name for name in dirnames if not skip_dir(current / name)]
            if current.name != "tests":
                continue
            if not any(name.startswith("test_") and name.endswith(".py") for name in filenames):
                continue
            relative_parts = current.relative_to(root).parts
            if any(part in SKIP_PARTS or part.startswith(".") for part in relative_parts):
                continue
            skill_dirs.append(current)
    skill_dirs.sort(key=lambda path: path.relative_to(root).as_posix())
    for directory in skill_dirs:
        if directory not in found:
            found.append(directory)

    add(root / "scripts" / "tests")
    return found


def main(argv: list[str] | None = None) -> int:
    configure_stdio()
    parser = argparse.ArgumentParser(
        description="Run unittest discover for hook tests, skill tests, and scripts/tests."
    )
    parser.add_argument(
        "--dynamic-unittest-discover",
        action="store_true",
        help="Compatibility flag kept for external recipe audits; does not alter discovery.",
    )
    parser.parse_args(sys.argv[1:] if argv is None else argv)
    root = REPO_ROOT
    directories = python_test_dirs(root)
    if not directories:
        print("no unittest directories", file=sys.stderr)
        return 1
    for directory in directories:
        relative = directory.relative_to(root).as_posix()
        print(f"unittest discover -s {relative}", file=sys.stderr, flush=True)
        completed = subprocess.run(
            [sys.executable, "-m", "unittest", "discover", "-s", relative, "-p", "test_*.py"],
            cwd=root,
        )
        if completed.returncode != 0:
            return completed.returncode if completed.returncode is not None else 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
