#!/usr/bin/env python3
"""Install docs dependencies only when the local VitePress install is absent."""
from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOCS_DIR = ROOT / "docs"


def npm_command() -> str:
    configured = os.environ.get("NPM_CMD")
    candidates = [configured] if configured else []
    candidates.extend(["npm.cmd", "npm"] if os.name == "nt" else ["npm"])
    for candidate in candidates:
        resolved = shutil.which(candidate) if candidate else None
        if resolved:
            return resolved
    return configured or ("npm.cmd" if os.name == "nt" else "npm")


def main() -> int:
    vitepress_bin = DOCS_DIR / "node_modules" / "vitepress" / "bin" / "vitepress.js"
    if vitepress_bin.exists():
        print("Docs dependencies already present; skipping dependency install.")
        print("Run `just docs-deps` to force a clean reinstall.")
        return 0

    return subprocess.run([npm_command(), "ci"], cwd=DOCS_DIR, check=False).returncode


if __name__ == "__main__":
    raise SystemExit(main())
