#!/usr/bin/env python3
"""Compatibility entrypoint for the legacy Python TUI command.

The Textual TUI has been replaced by the Rust MCS TUI. Keep this file so
existing user commands continue to work during migration.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def main() -> int:
    launch_script = Path(__file__).with_name("launch_mcs.py")
    print(
        "install_tui.py has migrated to Rust MCS. Forwarding to launch_mcs.py ...",
        flush=True,
    )
    cmd = [sys.executable, str(launch_script), *sys.argv[1:]]
    try:
        return subprocess.call(cmd)
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
