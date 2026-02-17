#!/usr/bin/env python3
"""Launch MCS via cargo.

This wrapper intentionally delegates build decisions to cargo so source changes
are always reflected without manual version bumps.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def _run(cmd: list[str], cwd: Path) -> int:
    try:
        return subprocess.call(cmd, cwd=str(cwd))
    except KeyboardInterrupt:
        return 130
    except FileNotFoundError:
        print("❌ Error: cargo not found. Please install Rust toolchain first.", file=sys.stderr)
        return 127


def main() -> int:
    root_dir = Path.cwd()
    mcs_dir = root_dir / "mcs"
    if not mcs_dir.is_dir():
        print(f"❌ Error: mcs directory not found at {mcs_dir}", file=sys.stderr)
        return 1

    args = sys.argv[1:]
    force_rebuild = "--rebuild" in args
    passthrough = [a for a in args if a != "--rebuild"]

    if force_rebuild:
        print("Forcing clean rebuild...", flush=True)
        clean_rc = _run(["cargo", "clean"], mcs_dir)
        if clean_rc != 0:
            return clean_rc

    cmd = ["cargo", "run", "--release", "--bin", "mcs", "--", *passthrough]
    print("Launching mcs via cargo...", flush=True)
    return _run(cmd, mcs_dir)


if __name__ == "__main__":
    raise SystemExit(main())
