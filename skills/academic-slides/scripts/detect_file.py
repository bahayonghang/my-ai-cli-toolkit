#!/usr/bin/env python3
"""
Detect slide files (.typ/.tex) in the project root.

Scans for Typst and LaTeX slide files, excluding template/example directories,
and outputs JSON with file metadata sorted by modification time.
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

# Directories to exclude from scanning
EXCLUDE_DIRS = {"templates", "examples", "output", ".claude", ".git", "node_modules"}

# File extensions to engine mapping
EXTENSION_TO_ENGINE = {".typ": "typst", ".tex": "latex"}


def scan_slide_files(root_dir: Path) -> list[dict[str, Any]]:
    """
    Scan directory for slide files (.typ/.tex).

    Args:
        root_dir: Root directory to scan

    Returns:
        List of file metadata dictionaries
    """
    files = []

    # Recursively find all .typ and .tex files
    for ext in EXTENSION_TO_ENGINE.keys():
        for file_path in root_dir.rglob(f"*{ext}"):
            # Skip if file is in excluded directory
            if any(excluded in file_path.parts for excluded in EXCLUDE_DIRS):
                continue

            try:
                # Get file metadata
                stat = file_path.stat()
                mtime = datetime.fromtimestamp(stat.st_mtime)

                # Get relative path from root
                relative_path = file_path.relative_to(root_dir)

                files.append(
                    {
                        # Use forward slashes for consistency
                        "path": str(relative_path).replace("\\", "/"),
                        "mtime": mtime.isoformat(),
                        "engine": EXTENSION_TO_ENGINE[ext],
                        "name": file_path.name,
                    }
                )
            except (OSError, ValueError) as e:
                # Skip files that can't be accessed or have invalid timestamps
                print(f"Warning: Could not process {file_path}: {e}", file=sys.stderr)
                continue

    # Sort by modification time (newest first)
    files.sort(key=lambda x: x["mtime"], reverse=True)

    return files


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Detect slide files (.typ/.tex) in project root")
    parser.add_argument(
        "--root", type=Path, default=Path.cwd(), help="Root directory to scan (default: current working directory)"
    )

    args = parser.parse_args()

    # Validate root directory
    if not args.root.exists():
        print(f"Error: Root directory does not exist: {args.root}", file=sys.stderr)
        sys.exit(1)

    if not args.root.is_dir():
        print(f"Error: Root path is not a directory: {args.root}", file=sys.stderr)
        sys.exit(1)

    # Scan for files
    try:
        files = scan_slide_files(args.root)
    except Exception as e:
        print(f"Error scanning directory: {e}", file=sys.stderr)
        sys.exit(1)

    # Output JSON to stdout
    result = {"files": files}
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
