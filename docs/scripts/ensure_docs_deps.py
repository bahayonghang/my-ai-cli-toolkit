#!/usr/bin/env python3
"""Install docs dependencies only when the local VitePress install is absent."""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


def main() -> int:
    vitepress_bin = Path("docs/node_modules/vitepress/bin/vitepress.js")
    if vitepress_bin.exists():
        print("Docs dependencies already present; skipping dependency install.")
        print("Run `just docs-deps` to force a clean reinstall.")
        return 0

    npm = os.environ.get("NPM_CMD") or ("npm.cmd" if os.name == "nt" else "npm")
    return subprocess.run([npm, "--prefix", "docs", "install"], check=False).returncode


if __name__ == "__main__":
    raise SystemExit(main())
