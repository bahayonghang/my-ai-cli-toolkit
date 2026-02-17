from __future__ import annotations

import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def run_cmd(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        cmd,
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        timeout=300,
        check=False,
    )


def test_launch_mcs_version_smoke() -> None:
    result = run_cmd(["uv", "run", "python", "src/launch_mcs.py", "--version"])
    output = (result.stdout or "") + (result.stderr or "")
    assert result.returncode == 0, output
    assert "mcs " in output


def test_install_tui_compat_shell_smoke() -> None:
    result = run_cmd(["uv", "run", "python", "src/install_tui.py", "--version"])
    output = (result.stdout or "") + (result.stderr or "")
    assert result.returncode == 0, output
    assert "migrated to Rust MCS" in output
