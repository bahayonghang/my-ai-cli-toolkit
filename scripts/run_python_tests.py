#!/usr/bin/env python3
"""Discover and run stdlib unittest suites. Fail on the first non-zero discover."""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

# Keep this skip set aligned with inventory_tests.dynamic_python_test_dirs.
SKIP_PARTS = {
    ".git",
    "node_modules",
    "__pycache__",
    "ref",
    ".agents",
    ".claude",
    ".trellis",
    "scaffolds",
}


def configure_stdio() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", newline="\n")


def skip_dir(path: Path) -> bool:
    name = path.name
    if name.startswith(".") or name in SKIP_PARTS:
        return True
    if path.is_symlink() or os.path.isjunction(path):
        return True
    return False


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
        help="Marker for repo-test-audit recipe parsing. Does not change discovery.",
    )
    parser.parse_args(sys.argv[1:] if argv is None else argv)
    root = Path(__file__).resolve().parents[1]
    directories = python_test_dirs(root)
    if not directories:
        print("no unittest directories", file=sys.stderr)
        return 1
    for directory in directories:
        relative = directory.relative_to(root).as_posix()
        print(f"unittest discover -s {relative}", flush=True)
        completed = subprocess.run(
            [sys.executable, "-m", "unittest", "discover", "-s", relative, "-p", "test_*.py"],
            cwd=root,
        )
        if completed.returncode != 0:
            return completed.returncode if completed.returncode is not None else 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
